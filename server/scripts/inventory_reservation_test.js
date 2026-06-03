const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/ttin-test';

async function main() {
  await mongoose.connect(MONGO, { dbName: 'ttin-test' });
  console.log('Connected to mongo');

  await Product.deleteMany({ name: 'Reservation Test Product' });
  const p = await Product.create({ name: 'Reservation Test Product', description: 'Test', price: 10, category: 'merch', stock: 5 });
  console.log('Created product with stock=5', p._id.toString());

  // Attempt two concurrent reservations of 3 units each (should not both succeed)
  const reserve = async (qty) => {
    const updated = await Product.findOneAndUpdate(
      { _id: p._id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );
    return updated;
  };

  const results = await Promise.allSettled([reserve(3), reserve(3)]);
  console.log('Reservation results:');
  for (const r of results) console.log(r.status === 'fulfilled' ? (r.value ? `reserved, new stock=${r.value.stock}` : 'reservation failed (insufficient)') : `error: ${r.reason}`);

  // Cleanup: restore stock to original
  const current = await Product.findById(p._id).select('stock');
  const toRestore = 5 - (current.stock ?? 0);
  if (toRestore > 0) {
    await Product.findByIdAndUpdate(p._id, { $inc: { stock: toRestore } });
  }
  console.log('Restored stock. Final stock:', (await Product.findById(p._id)).stock);

  // Remove test product
  await Product.findByIdAndDelete(p._id);
  await mongoose.disconnect();
  console.log('Disconnected');
}

main().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
