const joi = require('joi');

exports.schema = joi.object().keys({
  value: joi.string().required(),
  label: joi.string().required(),
  createdDate: joi.string()
});