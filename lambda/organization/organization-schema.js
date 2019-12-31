const joi = require('joi');

exports.schema = joi.object().keys({
  value: joi.string().required(),
  name: joi.string().required(),
  createdDate: joi.string()
});