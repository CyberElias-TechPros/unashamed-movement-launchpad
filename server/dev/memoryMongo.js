/**
 * memoryMongo.js — a development-only, zero-dependency-hosted MongoDB stand-in.
 *
 * Implements just enough of the MongoDB wire protocol (OP_QUERY + OP_MSG) and
 * command set (hello, ping, insert, update, delete, find, aggregate, count,
 * distinct, findAndModify, createIndexes, listIndexes, listCollections, drop,
 * dropDatabase, endSessions and friends)
 * for the official mongodb driver (used by mongoose) to connect and operate
 * against a fully in-memory dataset, powered by mingo for query/update/agg
 * semantics and bson for wire encoding.
 *
 * This exists so `npm run dev` works end-to-end on machines (and sandboxes)
 * without a local mongod. Production deployments still use MONGODB_URI.
 *
 * Data can optionally be snapshotted to JSON so dev data survives restarts.
 */

'use strict';

const net = require('net');
const fs = require('fs');
const path = require('path');
const { BSON, ObjectId, Long, Binary, BSONRegExp } = require('bson');

const { Context } = require('mingo/core');
const { Query } = require('mingo/query');
const { Aggregator } = require('mingo/aggregator');
const { updateOne, updateMany } = require('mingo/updater');

const mingoContext = Context.init()
  .addQueryOps(require('mingo/operators/query'))
  .addPipelineOps(require('mingo/operators/pipeline'))
  .addProjectionOps(require('mingo/operators/projection'))
  .addAccumulatorOps(require('mingo/operators/accumulator'))
  .addExpressionOps(require('mingo/operators/expression'));

const MAX_WIRE_VERSION = 17; // MongoDB 6.0 — comfortable for driver v6.x
const MINGO_OPTS = { context: mingoContext };

/* ------------------------------------------------------------------ utils */

const isPlainObject = (v) => v !== null && typeof v === 'object' && (v.constructor === Object || v.constructor === undefined);

// Recursively convert BSON wrapper types the driver sends into friendly values.
function normalizeInbound(v) {
  if (v instanceof BSONRegExp) return new RegExp(v.pattern, v.options);
  if (Array.isArray(v)) return v.map(normalizeInbound);
  if (isPlainObject(v)) {
    for (const k of Object.keys(v)) v[k] = normalizeInbound(v[k]);
  }
  return v;
}

// Resolve dotted path with Mongo-style array unwrapping for distinct().
function pathValues(doc, dotted) {
  const parts = dotted.split('.');
  let current = [doc];
  for (const p of parts) {
    const next = [];
    for (const item of current) {
      if (Array.isArray(item)) {
        for (const el of item) next.push(el);
        // also allow index access? not needed
        if (item && typeof item === 'object' && !Array.isArray(item)) { /* noop */ }
      } else if (item && typeof item === 'object' && p in item) {
        next.push(item[p]);
      }
    }
    current = next;
    if (current.length === 0) break;
  }
  // unwrap remaining arrays at leaf
  const out = [];
  for (const item of current) {
    if (Array.isArray(item)) out.push(...item);
    else out.push(item);
  }
  return out;
}

function valueKey(v) {
  if (v instanceof ObjectId) return 'oid:' + v.toHexString();
  if (v instanceof Date) return 'date:' + v.getTime();
  if (Long.isLong(v)) return 'long:' + v.toString();
  if (v && typeof v === 'object') return 'obj:' + JSON.stringify(BSON.EJSON.serialize(v));
  return typeof v + ':' + String(v);
}

function getStore(db, coll, create = true) {
  let d = store.get(db);
  if (!d) {
    if (!create) return null;
    d = new Map();
    store.set(db, d);
  }
  let c = d.get(coll);
  if (!c) {
    if (!create) return null;
    c = { docs: [], indexes: [{ v: 2, key: { _id: 1 }, name: '_id_', unique: true }] };
    d.set(coll, c);
  }
  return c;
}

const cloneDoc = (doc) => BSON.deserialize(BSON.serialize(doc));

function buildUpsertDoc(query, update) {
  const base = {};
  for (const [k, val] of Object.entries(query || {})) {
    if (k.startsWith('$')) continue;
    if (val instanceof ObjectId || val instanceof Date || typeof val !== 'object' || val === null) {
      base[k] = val; // literal equality fields only
    }
  }
  const setOnInsert = update && update.$setOnInsert ? update.$setOnInsert : null;
  const clean = {};
  for (const [op, spec] of Object.entries(update || {})) {
    if (op === '$setOnInsert') continue;
    clean[op] = spec;
  }
  if (Object.keys(clean).length > 0) {
    updateOne([base], {}, clean, { cloneMode: 'none' }, MINGO_OPTS);
  }
  if (setOnInsert) {
    updateOne([base], {}, { $set: setOnInsert }, { cloneMode: 'none' }, MINGO_OPTS);
  }
  if (base._id === undefined) base._id = new ObjectId();
  return base;
}

function applyUpdate(target, update) {
  // update may be a replacement doc or an operators document or a pipeline array.
  if (Array.isArray(update)) {
    // pipeline-style update (rare) — apply applicable stages
    let working = target;
    for (const stage of update) {
      const [[op, spec]] = Object.entries(stage);
      if (op === '$set' || op === '$addFields') {
        updateOne([working], {}, { $set: spec }, { cloneMode: 'none' }, MINGO_OPTS);
      } else if (op === '$unset') {
        const fields = Array.isArray(spec) ? spec : Object.keys(spec);
        for (const f of fields) delete working[f];
      } else if (op === '$replaceRoot' || op === '$replaceWith') {
        working = spec && spec.newRoot ? spec.newRoot : working;
      }
    }
    return working;
  }
  const hasOps = Object.keys(update).some((k) => k.startsWith('$'));
  if (!hasOps) {
    const replacement = cloneDoc(update);
    if (target._id !== undefined && replacement._id === undefined) replacement._id = target._id;
    return replacement;
  }
  const clean = {};
  const specials = {};
  for (const [op, spec] of Object.entries(update)) {
    if (op === '$setOnInsert') continue; // only applied on upsert-insert
    if (op === '$currentDate') {
      specials.$currentDate = spec;
      continue;
    }
    clean[op] = spec;
  }
    if (specials.$currentDate) {
    const setSpec = {};
    for (const [field, val] of Object.entries(specials.$currentDate)) {
      if (val === true || (val && val.$type === 'date')) setSpec[field] = new Date();
    }
    if (Object.keys(setSpec).length) {
      updateOne([target], {}, { $set: setSpec }, { cloneMode: 'none' }, MINGO_OPTS);
    }
  }
  if (Object.keys(clean).length) {
    updateOne([target], {}, clean, { cloneMode: 'none' }, MINGO_OPTS);
  }
  return target;
}

function runFind(coll, cmd) {
  const filter = cmd.filter || {};
  const docs = coll ? coll.docs : [];
  const pipeline = [];
  pipeline.push({ $match: filter });
  if (cmd.sort && Object.keys(cmd.sort).length) pipeline.push({ $sort: cmd.sort });
  if (cmd.skip) pipeline.push({ $skip: cmd.skip });
  if (cmd.limit !== undefined && cmd.limit !== null && cmd.limit > 0) pipeline.push({ $limit: cmd.limit });
  if (cmd.projection && Object.keys(cmd.projection).length) pipeline.push({ $project: cmd.projection });
  try {
    return new Aggregator(pipeline, MINGO_OPTS).run(cloneDocs(docs));
  } catch (e) {
    // Fallback: naive matching (projection/sort may be exotic for mingo)
    const q = new Query(filter, MINGO_OPTS);
    let out = docs.map((d) => cloneDoc(d)).filter((d) => q.test(d));
    if (cmd.skip) out = out.slice(cmd.skip);
    if (cmd.limit) out = out.slice(0, cmd.limit);
    return out;
  }
}

const cloneDocs = (docs) => docs.map((d) => cloneDoc(d));

function aggregate(coll, cmd) {
  const docs = coll ? coll.docs : [];
  let pipeline = (cmd.pipeline || []).map((s) => cloneDoc(s));
  // rewrite $count into group+project which mingo supports
  const expanded = [];
  for (const stage of pipeline) {
    if (stage.$count !== undefined) {
      const field = stage.$count;
      expanded.push({ $group: { _id: null, [field]: { $sum: 1 } } });
      expanded.push({ $project: { _id: 0, [field]: 1 } });
    } else {
      expanded.push(stage);
    }
  }
  return new Aggregator(expanded, MINGO_OPTS).run(cloneDocs(docs));
}

function checkUnique(coll, candidate, excludeDoc) {
  for (const idx of coll.indexes) {
    if (!idx.unique) continue;
    const keys = Object.keys(idx.key || {});
    for (const doc of coll.docs) {
      if (excludeDoc && doc === excludeDoc) continue;
      const allEqual = keys.every((k) => valueKey(pathValues(doc, k)[0]) === valueKey(pathValues(candidate, k)[0]));
      if (allEqual) return { index: idx.name, keys };
    }
  }
  return null;
}

function dupKeyError(dbName, collName, idxName, candidate, keys) {
  const dup = keys.map((k) => `${k === '_id' ? '_id' : k}: ${JSON.stringify(pathValues(candidate, k)[0])}`).join(', ');
  return {
    index: 0,
    code: 11000,
    errmsg: `E11000 duplicate key error collection: ${dbName}.${collName} index: ${idxName} dup key: { ${dup} }`,
  };
}

/* -------------------------------------------------------------- data store */

const store = new Map(); // db -> Map<coll, {docs:[], indexes:[]}>
let persistFile = null;
let persistTimer = null;

function schedulePersist() {
  if (!persistFile || persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const plain = {};
      for (const [db, colls] of store) {
        plain[db] = {};
        for (const [name, coll] of colls) {
          plain[db][name] = { docs: coll.docs, indexes: coll.indexes };
        }
      }
      fs.writeFileSync(persistFile, BSON.EJSON.stringify(plain));
    } catch (e) {
      console.warn('[memory-mongo] persist failed:', e.message);
    }
  }, 500);
}

function loadPersist() {
  if (!persistFile || !fs.existsSync(persistFile)) return;
  try {
    const plain = BSON.EJSON.parse(fs.readFileSync(persistFile, 'utf8'));
    for (const [db, colls] of Object.entries(plain)) {
      const d = new Map();
      for (const [name, coll] of Object.entries(colls)) {
        d.set(name, { docs: coll.docs || [], indexes: coll.indexes || [{ v: 2, key: { _id: 1 }, name: '_id_', unique: true }] });
      }
      store.set(db, d);
    }
    console.log('[memory-mongo] restored dev data from', path.basename(persistFile));
  } catch (e) {
    console.warn('[memory-mongo] could not restore dev data:', e.message);
  }
}

/* ---------------------------------------------------------- wire protocol */

const OP_REPLY = 1;
const OP_QUERY = 2004;
const OP_GET_MORE = 2005;
const OP_KILL_CURSORS = 2007;
const OP_COMPRESSED = 2012;
const OP_MSG = 2013;

let nextMessageId = 1;
const PROCESS_ID = new ObjectId();

function cstring(buf, offset) {
  const end = buf.indexOf(0, offset);
  return { str: buf.toString('utf8', offset, end), offset: end + 1 };
}

function serializeMessage(opCode, requestId, responseTo, bodyParts) {
  const body = Buffer.concat(bodyParts);
  const header = Buffer.alloc(16);
  header.writeInt32LE(16 + body.length, 0);
  header.writeInt32LE(requestId, 4);
  header.writeInt32LE(responseTo, 8);
  header.writeInt32LE(opCode, 12);
  return Buffer.concat([header, body]);
}

function replyOpReply(responseTo, docs) {
  const flags = Buffer.alloc(4); // no flags
  const cursorId = Buffer.alloc(8); // zero
  const startingFrom = Buffer.alloc(4);
  const nReturned = Buffer.alloc(4);
  nReturned.writeInt32LE(docs.length, 0);
  const docBufs = docs.map((d) => BSON.serialize(d));
  return serializeMessage(OP_REPLY, nextMessageId++, responseTo, [flags, cursorId, startingFrom, nReturned, ...docBufs]);
}

function replyOpMsg(responseTo, doc) {
  const flagBits = Buffer.alloc(4);
  const kind = Buffer.from([0]);
  const body = BSON.serialize(doc);
  return serializeMessage(OP_MSG, nextMessageId++, responseTo, [flagBits, kind, body]);
}

function helloDoc(extra = {}) {
  return {
    isWritablePrimary: true,
    // NOTE: no topologyVersion advertised — that opts the driver into
    // streaming/awaitable (exhaust) hello, which this lightweight server
    // does not implement. Polling heartbeats are used instead.
    maxBsonObjectSize: 16777216,
    maxMessageSizeBytes: 48000000,
    maxWriteBatchSize: 100000,
    localTime: new Date(),
    logicalSessionTimeoutMinutes: 30,
    connectionId: Math.floor(Math.random() * 100000),
    minWireVersion: 0,
    maxWireVersion: MAX_WIRE_VERSION,
    readOnly: false,
    helloOk: true,
    ok: 1,
    ...extra,
  };
}

const ok = (extra = {}) => ({ ok: 1, ...extra });
const cmdError = (code, codeName, errmsg) => ({ ok: 0, errmsg, code, codeName });

/* -------------------------------------------------------- command dispatch */

function dispatch(dbName, cmdName, body, sequences) {
  const cmd = normalizeInbound(body);
  const collName = typeof cmd[cmdName] === 'string' ? cmd[cmdName] : null;

  switch (cmdName) {
    case 'hello':
    case 'isMaster':
    case 'ismaster':
      return helloDoc();
    case 'whatsmyuri':
      return ok({ you: '127.0.0.1:0' });
    case 'ping':
      return ok();
    case 'buildInfo':
    case 'buildinfo':
      return ok({ version: '6.0.14-dev', versionArray: [6, 0, 14, 0], maxBsonObjectSize: 16777216, storageEngines: ['memoryMongo'] });
    case 'serverStatus':
      return ok({ host: 'memory-mongo', version: '6.0.14-dev', process: 'memoryMongo', uptime: 1, localTime: new Date(), connections: { current: 1, available: 100, totalCreated: 1 } });
    case 'connectionStatus':
      return ok({ authInfo: { authenticatedUsers: [], authenticatedUserRoles: [] } });
    case 'hostInfo':
      return ok({ system: { hostname: 'memory-mongo' } });
    case 'endSessions':
    case 'startSession':
    case 'refreshSessions':
    case 'killSessions':
      return ok();
    case 'abortTransaction':
    case 'commitTransaction':
      return ok();
    case 'listDatabases': {
      const databases = [];
      for (const [name] of store) databases.push({ name, sizeOnDisk: 1, empty: false });
      return ok({ databases, totalSize: databases.length });
    }
    case 'listCollections': {
      const d = store.get(dbName);
      const names = d ? [...d.keys()] : [];
      const filter = cmd.filter || {};
      const batch = names
        .filter((n) => !filter.name || filter.name === n || (filter.name.$regex && new RegExp(filter.name.$regex).test(n)))
        .map((n) => ({ name: n, type: 'collection', options: {}, info: { readOnly: false }, idIndex: { v: 2, key: { _id: 1 }, name: '_id_' } }));
      return ok({ cursor: { id: Long.fromNumber(0), ns: `${dbName}.$cmd.listCollections`, firstBatch: batch } });
    }
    case 'listIndexes': {
      const coll = getStore(dbName, collName, false);
      const idx = coll ? coll.indexes.map(({ v, key, name }) => ({ v, key, name })) : [];
      return ok({ cursor: { id: Long.fromNumber(0), ns: `${dbName}.$cmd.listIndexes.${collName}`, firstBatch: idx } });
    }
    case 'createIndexes': {
      const coll = getStore(dbName, collName);
      const before = coll.indexes.length;
      for (const spec of cmd.indexes || []) {
        if (!coll.indexes.some((i) => i.name === spec.name)) {
          coll.indexes.push({ v: spec.v || 2, key: spec.key || {}, name: spec.name, unique: !!spec.unique, sparse: !!spec.sparse });
        }
      }
      schedulePersist();
      return ok({ numIndexesBefore: before, numIndexesAfter: coll.indexes.length, createdCollectionAutomatically: before === 1 && coll.docs.length === 0 });
    }
    case 'dropIndexes':
    case 'dropIndex': {
      const coll = getStore(dbName, collName, false);
      if (coll) {
        coll.indexes = coll.indexes.filter((i) => i.name === '_id_');
      }
      schedulePersist();
      return ok({ nIndexesWas: coll ? coll.indexes.length + 1 : 1 });
    }
    case 'create':
      getStore(dbName, collName);
      schedulePersist();
      return ok();
    case 'drop': {
      const d = store.get(dbName);
      if (d) d.delete(collName);
      schedulePersist();
      return ok({ ns: `${dbName}.${collName}` });
    }
    case 'dropDatabase': {
      store.delete(dbName);
      schedulePersist();
      return ok({ dropped: dbName });
    }
    case 'insert': {
      const coll = getStore(dbName, collName);
      let docs = [];
      if (sequences.documents) docs = sequences.documents;
      else if (Array.isArray(cmd.documents)) docs = cmd.documents;
      const writeErrors = [];
      let n = 0;
      for (let i = 0; i < docs.length; i++) {
        const doc = normalizeInbound(cloneDoc(docs[i]));
        if (doc._id === undefined) doc._id = new ObjectId();
        const dup = checkUnique(coll, doc, null);
        if (dup) {
          writeErrors.push({ ...dupKeyError(dbName, collName, dup.index, doc, dup.keys), index: i });
          continue;
        }
        coll.docs.push(doc);
        n++;
      }
      schedulePersist();
      const res = ok({ n });
      if (writeErrors.length) res.writeErrors = writeErrors;
      return res;
    }
    case 'update': {
      const coll = getStore(dbName, collName);
      let updates = [];
      if (sequences.updates) updates = sequences.updates;
      else if (Array.isArray(cmd.updates)) updates = cmd.updates;
      let n = 0;
      let nModified = 0;
      const upserted = [];
      const writeErrors = [];
      updates.forEach((u, idx) => {
        const q = u.q || {};
        const multi = !!u.multi;
        try {
          const query = new Query(q, MINGO_OPTS);
          const matched = [];
          for (let i = 0; i < coll.docs.length; i++) {
            if (query.test(coll.docs[i])) matched.push(i);
            if (matched.length && !multi) break;
          }
          if (matched.length === 0) {
            if (u.upsert) {
              const newDoc = buildUpsertDoc(q, u.u || {});
              const dup = checkUnique(coll, newDoc, null);
              if (dup) {
                writeErrors.push({ ...dupKeyError(dbName, collName, dup.index, newDoc, dup.keys), index: idx });
                return;
              }
              coll.docs.push(newDoc);
              upserted.push({ index: idx, _id: newDoc._id });
              n++;
            }
            return;
          }
          for (const i of matched) {
            const before = BSON.serialize(coll.docs[i]);
            const result = applyUpdate(coll.docs[i], u.u || {});
            const dup = checkUnique(coll, result, result === coll.docs[i] ? coll.docs[i] : null);
            if (result !== coll.docs[i]) coll.docs[i] = result;
            if (dup) {
              writeErrors.push({ ...dupKeyError(dbName, collName, dup.index, coll.docs[i], dup.keys), index: idx });
              continue;
            }
            n++;
            const after = BSON.serialize(coll.docs[i]);
            if (!before.equals(after)) nModified++;
          }
        } catch (e) {
          writeErrors.push({ index: idx, code: 9, errmsg: e.message });
        }
      });
      schedulePersist();
      const res = ok({ n, nModified });
      if (upserted.length) res.upserted = upserted;
      if (writeErrors.length) res.writeErrors = writeErrors;
      return res;
    }
    case 'delete': {
      const coll = getStore(dbName, collName);
      let deletes = [];
      if (sequences.deletes) deletes = sequences.deletes;
      else if (Array.isArray(cmd.deletes)) deletes = cmd.deletes;
      let n = 0;
      const writeErrors = [];
      deletes.forEach((d, idx) => {
        try {
          const query = new Query(d.q || {}, MINGO_OPTS);
          const justOne = d.limit === 1;
          const remaining = [];
          for (const doc of coll.docs) {
            if (query.test(doc) && (n === 0 || !justOne ? true : false) && !(justOne && n > 0)) {
              n++;
            } else {
              remaining.push(doc);
            }
          }
          coll.docs = remaining;
        } catch (e) {
          writeErrors.push({ index: idx, code: 9, errmsg: e.message });
        }
      });
      schedulePersist();
      const res = ok({ n });
      if (writeErrors.length) res.writeErrors = writeErrors;
      return res;
    }
    case 'find': {
      const coll = getStore(dbName, collName, false);
      const batch = runFind(coll, cmd);
      return ok({ cursor: { id: Long.fromNumber(0), ns: `${dbName}.${collName}`, firstBatch: batch } });
    }
    case 'getMore':
      return cmdError(43, 'CursorNotFound', 'cursor id not found (memory mongo returns full first batches)');
    case 'killCursors':
      return ok({ cursorsKilled: [], cursorsNotFound: cmd.cursors || [], cursorsAlive: [], cursorsUnknown: [] });
    case 'count': {
      const coll = getStore(dbName, collName, false);
      let docs = coll ? coll.docs : [];
      try {
        if (cmd.query && Object.keys(cmd.query).length) {
          const q = new Query(cmd.query, MINGO_OPTS);
          docs = docs.filter((d) => q.test(d));
        }
      } catch { /* count all on exotic filters */ }
      let n = docs.length;
      if (cmd.skip) n = Math.max(0, n - cmd.skip);
      if (cmd.limit) n = Math.min(n, cmd.limit);
      return ok({ n });
    }
    case 'estimatedDocumentCount':
    case '_estimatedDocumentCount': {
      const coll = getStore(dbName, collName, false);
      return ok({ n: coll ? coll.docs.length : 0 });
    }
    case 'distinct': {
      const coll = getStore(dbName, collName, false);
      let docs = coll ? coll.docs.map((d) => cloneDoc(d)) : [];
      try {
        if (cmd.query && Object.keys(cmd.query).length) {
          const q = new Query(cmd.query, MINGO_OPTS);
          docs = docs.filter((d) => q.test(d));
        }
      } catch { /* ignore filter issues */ }
      const seen = new Map();
      for (const d of docs) {
        for (const v of pathValues(d, cmd.key)) {
          if (v === undefined) continue;
          seen.set(valueKey(v), v);
        }
      }
      return ok({ values: [...seen.values()] });
    }
    case 'findAndModify':
    case 'findandmodify': {
      const coll = getStore(dbName, collName);
      const queryObj = cmd.query || {};
      const sort = cmd.sort;
      const projection = cmd.fields;
      let candidates = runFind(coll, { filter: queryObj, sort });
      candidates = candidates.slice(0, 1);
      let match = null;
      if (candidates.length) {
        const target = candidates[0];
        match = coll.docs.find((d) => valueKey(d._id) === valueKey(target._id));
      }
      const applyProjection = (doc) => {
        if (!doc) return null;
        if (projection && Object.keys(projection).length) {
          try {
            return new Aggregator([{ $project: projection }], MINGO_OPTS).run([doc])[0] || null;
          } catch { return doc; }
        }
        return doc;
      };
      const lastErrorObject = { n: 0, updatedExisting: false };
      let value = null;
      if (cmd.remove) {
        if (match) {
          coll.docs = coll.docs.filter((d) => d !== match);
          lastErrorObject.n = 1;
          value = applyProjection(cloneDoc(match));
        }
        schedulePersist();
        return ok({ lastErrorObject, value });
      }
      if (match) {
        const before = cloneDoc(match);
        const result = applyUpdate(match, cmd.update || {});
        if (result !== match) {
          const i = coll.docs.indexOf(match);
          coll.docs[i] = result;
        }
        lastErrorObject.n = 1;
        lastErrorObject.updatedExisting = true;
        const finalDoc = coll.docs.find((d) => valueKey(d._id) === valueKey(before._id));
        value = applyProjection(cloneDoc(cmd.new ? finalDoc : before));
      } else if (cmd.upsert) {
        const newDoc = buildUpsertDoc(queryObj, cmd.update || {});
        const dup = checkUnique(coll, newDoc, null);
        if (dup) return cmdError(11000, 'DuplicateKey', dupKeyError(dbName, collName, dup.index, newDoc, dup.keys).errmsg);
        coll.docs.push(newDoc);
        lastErrorObject.n = 1;
        lastErrorObject.updatedExisting = false;
        lastErrorObject.upserted = newDoc._id;
        value = cmd.new ? applyProjection(cloneDoc(newDoc)) : null;
      }
      schedulePersist();
      return ok({ lastErrorObject, value });
    }
    case 'aggregate': {
      const coll = collName ? getStore(dbName, collName, false) : null;
      try {
        const batch = aggregate(coll, cmd);
        return ok({ cursor: { id: Long.fromNumber(0), ns: `${dbName}.${collName || '$cmd.aggregate'}`, firstBatch: batch } });
      } catch (e) {
        return cmdError(9, 'FailedToParse', `aggregate failed: ${e.message}`);
      }
    }
    case 'mapReduce':
    case 'mapreduce':
      return cmdError(9, 'FailedToParse', 'mapReduce not supported by memory mongo');
    case 'validate':
      return ok({ valid: true, ns: `${dbName}.${collName}` });
    case 'dbStats':
    case 'dbstats':
      return ok({ db: dbName, collections: store.get(dbName) ? store.get(dbName).size : 0, objects: 0 });
    case 'collStats':
    case 'collstats': {
      const coll = getStore(dbName, collName, false);
      return ok({ ns: `${dbName}.${collName}`, count: coll ? coll.docs.length : 0 });
    }
    case 'profile':
      return ok({ was: 0, slowms: 100, sampleRate: 1.0 });
    case 'replSetGetStatus':
      return cmdError(76, 'NoReplicationEnabled', 'not running with --replSet');
    case 'saslStart':
      return ok({ conversationId: 1, done: true, payload: new Binary(Buffer.alloc(0)) });
    case 'saslContinue':
      return ok({ conversationId: 1, done: true, payload: new Binary(Buffer.alloc(0)) });
    case 'logout':
      return ok();
    case 'authenticate':
      return ok();
    case 'getParameter':
      return ok();
    case 'setFeatureCompatibilityVersion':
      return ok();
    case 'dataSize':
      return ok({ size: 0, numObjects: 0, millis: 0 });
    case 'currentOp':
      return ok({ inprog: [] });
    case 'fsync':
      return ok({ numFiles: 1 });
    case 'planCacheClear':
      return ok();
    case 'convertToCapped':
      return ok();
    case 'features':
      return ok({ oidMachine: 1 });
    case 'top':
      return ok({ totals: {}, records: {} });
    case 'aggregateRawResults':
      return ok();
    default:
      return cmdError(59, 'CommandNotFound', `no such command: '${cmdName}' (memory mongo)`);
  }
}

/* --------------------------------------------------------------- sockets */

function handleOpQuery(socket, message, messageLength, requestId) {
  // flags(4) fullCollectionName(cstring) numberToSkip(4) numberToReturn(4) query(bson) [fields(bson)]
  let offset = 16;
  offset += 4; // flags
  const { str: fullCollectionName, offset: o2 } = cstring(message, offset);
  offset = o2 + 8; // skip + limit
  const dbName = fullCollectionName.split('.')[0];
  const isCmd = fullCollectionName.endsWith('.$cmd');
  let doc;
  try {
    const size = message.readInt32LE(offset);
    doc = BSON.deserialize(message.subarray(offset, offset + size));
  } catch (e) {
    socket.write(replyOpReply(requestId, [cmdError(9, 'FailedToParse', e.message)]));
    return;
  }
  let response;
  if (isCmd) {
    const cmdName = Object.keys(doc)[0];
    response = dispatch(dbName === 'admin' && (cmdName === 'hello' || cmdName === 'ismaster' || cmdName === 'isMaster' || cmdName === 'whatsmyuri' || cmdName === 'buildInfo' || cmdName === 'buildinfo') ? 'admin' : dbName, cmdName, doc, {});
  } else {
    // legacy OP_QUERY on a real collection (driver v6 doesn't do this)
    const collName = fullCollectionName.slice(dbName.length + 1);
    const coll = getStore(dbName, collName, false);
    response = runFind(coll, { filter: doc });
    socket.write(replyOpReply(requestId, response));
    return;
  }
  socket.write(replyOpReply(requestId, [response]));
}

function handleOpMsg(socket, message, requestId) {
  let offset = 16;
  const flags = message.readInt32LE(offset);
  offset += 4;
  if (flags & 1) {
    // checksumPresent — strip trailing 4 bytes
    message = message.subarray(0, message.length - 4);
  }
  let body = null;
  const sequences = {};
  while (offset < message.length) {
    const kind = message.readUInt8(offset);
    offset += 1;
    if (kind === 0) {
      const size = message.readInt32LE(offset);
      body = BSON.deserialize(message.subarray(offset, offset + size));
      offset += size;
    } else if (kind === 1) {
      const size = message.readInt32LE(offset);
      const end = offset + size;
      offset += 4;
      const { str: identifier, offset: o2 } = cstring(message, offset);
      offset = o2;
      const docs = [];
      while (offset < end) {
        const dsize = message.readInt32LE(offset);
        docs.push(BSON.deserialize(message.subarray(offset, offset + dsize)));
        offset += dsize;
      }
      sequences[identifier] = docs;
    } else {
      socket.write(replyOpMsg(requestId, cmdError(9, 'FailedToParse', `unknown OP_MSG section kind ${kind}`)));
      return;
    }
  }
  if (!body) {
    socket.write(replyOpMsg(requestId, cmdError(9, 'FailedToParse', 'OP_MSG missing body')));
    return;
  }
  const cmdName = Object.keys(body).find((k) => !k.startsWith('$') && !['lsid', 'txnNumber', 'startTransaction', 'autocommit', 'stmtId', 'stmtIds', 'databaseVersion', 'shardVersion', 'tracking_info', 'clientOperationKey', 'mayBypassWriteBlocking'].includes(k)) || Object.keys(body)[0];
  const dbName = body.$db || 'test';
  let response;
  try {
    response = dispatch(dbName, cmdName.replace(/\?.*$/, ''), body, sequences);
  } catch (e) {
    response = cmdError(1, 'InternalError', e.message);
  }
  socket.write(replyOpMsg(requestId, response));
}

function handleConnection(socket) {
  socket.setNoDelay(true);
  let buffer = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    for (;;) {
      if (buffer.length < 16) return;
      const messageLength = buffer.readInt32LE(0);
      if (messageLength < 16 || messageLength > 64 * 1024 * 1024) {
        buffer = Buffer.alloc(0);
        return;
      }
      if (buffer.length < messageLength) return;
      const message = buffer.subarray(0, messageLength);
      buffer = buffer.subarray(messageLength);
      const requestId = message.readInt32LE(4);
      const opCode = message.readInt32LE(12);
      try {
        if (opCode === OP_QUERY) handleOpQuery(socket, message, messageLength, requestId);
        else if (opCode === OP_MSG) handleOpMsg(socket, message, requestId);
        else if (opCode === OP_COMPRESSED) socket.write(replyOpMsg(requestId, cmdError(9, 'FailedToParse', 'compression not negotiated')));
        else if (opCode === OP_GET_MORE) socket.write(replyOpMsg(requestId, cmdError(43, 'CursorNotFound', 'cursor id not found')));
        else if (opCode === OP_KILL_CURSORS) { /* nothing to send */ }
        else socket.write(replyOpMsg(requestId, cmdError(9, 'FailedToParse', `unsupported opcode ${opCode}`)));
      } catch (e) {
        try {
          socket.write(opCode === OP_QUERY ? replyOpReply(requestId, [cmdError(1, 'InternalError', e.message)]) : replyOpMsg(requestId, cmdError(1, 'InternalError', e.message)));
        } catch { /* socket may be closed */ }
      }
    }
  });
  socket.on('error', () => { /* client disappeared */ });
}

/* ----------------------------------------------------------------- public */

function startMemoryMongo({ port = 27017, host = '127.0.0.1', persistPath = null } = {}) {
  return new Promise((resolve, reject) => {
    persistFile = persistPath || null;
    loadPersist();
    const server = net.createServer(handleConnection);
    server.on('error', reject);
    server.listen(port, host, () => {
      const addr = server.address();
      const uri = `mongodb://${addr.address === '::' ? '127.0.0.1' : addr.address}:${addr.port}`;
      console.log(`[memory-mongo] in-memory MongoDB listening on ${uri}`);
      resolve({ server, uri, stop: () => new Promise((r) => server.close(r)), store });
    });
  });
}

module.exports = { startMemoryMongo };
