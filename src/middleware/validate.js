const mongoose = require('mongoose');
const { badRequest } = require('./errorHandler');

// Rejects the request if any listed field is missing from the JSON body.
const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
  );
  if (missing.length) return next(badRequest(`Missing required field(s): ${missing.join(', ')}`));
  next();
};

// Rejects the request if a route param is not a valid MongoDB ObjectId.
const validateObjectId = (param = 'id') => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
    return next(badRequest(`Invalid ${param}`));
  }
  next();
};

module.exports = { requireFields, validateObjectId };