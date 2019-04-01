const joi = require('joi');

exports.schema = joi.object().keys({
  id: joi.number().integer().min(1).required(),
  students: joi.number().integer().required(),
  doctors: joi.number().integer().required(),
  requests: joi.array().integer().required()
});


exports.event = {
  
};