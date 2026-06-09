/**
 * Pagination utility for MongoDB queries
 * Provides standardized pagination with metadata
 */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Express request query object
 * @returns {Object} Parsed pagination parameters
 */
const parsePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Parse sort parameters from request query
 * @param {Object} query - Express request query object
 * @param {Object} allowedFields - Object mapping allowed sort fields
 * @param {string} defaultSort - Default sort field
 * @returns {Object} Mongoose sort object
 */
const parseSortParams = (query, allowedFields = {}, defaultSort = '-createdAt') => {
  const sortField = query.sort || defaultSort;
  const sortOrder = query.order === 'asc' ? 1 : -1;
  
  // If sort field is allowed, use it
  if (allowedFields[sortField.replace('-', '')]) {
    return { [sortField.replace('-', '')]: sortField.startsWith('-') ? -1 : sortOrder };
  }
  
  // Default sort by createdAt desc
  return { createdAt: -1 };
};

/**
 * Execute paginated query
 * @param {Model} model - Mongoose model
 * @param {Object} filter - Query filter object
 * @param {Object} options - Query options
 * @returns {Object} Paginated results with metadata
 */
const paginate = async (model, filter = {}, options = {}) => {
  const {
    page = 1,
    limit = DEFAULT_LIMIT,
    sort = { createdAt: -1 },
    select = null,
    populate = null,
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build query
  let query = model.find(filter);
  
  // Apply select
  if (select) {
    query = query.select(select);
  }
  
  // Apply populate
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(p => {
        query = query.populate(p);
      });
    } else {
      query = query.populate(populate);
    }
  }
  
  // Execute queries in parallel
  const [data, totalCount] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit).exec(),
    model.countDocuments(filter),
  ]);
  
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    data,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
};

/**
 * Create pagination middleware for Express routes
 * @param {Model} model - Mongoose model
 * @param {Object} options - Default options
 * @returns {Function} Express middleware
 */
const createPaginationMiddleware = (model, options = {}) => {
  return async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePaginationParams(req.query);
      const sort = parseSortParams(req.query, options.allowedSortFields, options.defaultSort);
      
      // Attach pagination info to request
      req.pagination = {
        page,
        limit,
        skip,
        sort,
      };
      
      // Attach paginate helper to response
      res.paginate = async (filter = {}) => {
        const result = await paginate(model, filter, {
          page,
          limit,
          sort,
          select: options.select,
          populate: options.populate,
        });
        
        return res.json({
          success: true,
          ...result,
        });
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Generate pagination links for API responses
 * @param {Object} pagination - Pagination metadata
 * @param {string} baseUrl - Base URL for links
 * @param {Object} queryParams - Current query parameters
 * @returns {Object} Pagination links
 */
const generatePaginationLinks = (pagination, baseUrl, queryParams = {}) => {
  const { page, limit, totalPages } = pagination;
  
  const buildUrl = (p) => {
    const params = new URLSearchParams({ ...queryParams, page: p, limit });
    return `${baseUrl}?${params.toString()}`;
  };
  
  return {
    self: buildUrl(page),
    first: buildUrl(1),
    last: buildUrl(totalPages),
    next: pagination.hasNextPage ? buildUrl(page + 1) : null,
    prev: pagination.hasPrevPage ? buildUrl(page - 1) : null,
  };
};

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePaginationParams,
  parseSortParams,
  paginate,
  createPaginationMiddleware,
  generatePaginationLinks,
};
