/** Strip HTML tags from string fields in JSON bodies */
const sanitizeInput = (req, res, next) => {
  const scrub = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        scrub(obj[key]);
      }
    }
  };
  if (req.body) scrub(req.body);
  next();
};

module.exports = { sanitizeInput };
