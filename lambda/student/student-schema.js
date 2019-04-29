const joi = require('joi');

exports.schema = joi.object().keys({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    id: joi.string().required(),
    loginMethod: joi.string().valid('cognito', 'facebook', 'google').required(),
    phoneNumber: joi.string().min(10),
    hippaCert: joi.boolean(),
    address: joi.object().keys({
        streetAddress: joi.string(),
        city: joi.string(),
        state: joi.string().uppercase().length(2),
        zipCode: joi.number().integer().required()
    }),
    requests: joi.array()
});