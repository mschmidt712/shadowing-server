const joi = require('joi');

exports.schema = joi.object().keys({
  name: joi.string().min(3).max(30).required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  id: joi.string().required(),
  loginMethod: joi.string().valid('cognito', 'facebook', 'google').required(),
  phoneNumber: joi.string().min(10),
  hipaaCert: joi.boolean(),
  address: joi.object().keys({
    streetAddress: joi.string(),
    city: joi.string(),
    state: joi.string().uppercase().length(2),
    zipCode: joi.number().integer().min(00501).max(99950).required()
  }),
  school: joi.string().required(),
  schoolYear: joi.string().valid('high-school', 'freshmen', 'sophomore', 'junior', 'senior', 'masters', 'post-baccalaureate', 'graduated').required(),
  requests: joi.array(),
  cv: joi.string()
});

const student = {
  "name": "Mock Student",
  "email": "marie.schmidt.712+student@gmail.com",
  "id": "adkjdas9d183jsf9",
  "loginMethod": "cognito",
  "phoneNumber": "(925)519-6702",
  "hipaaCert": true,
  "subscribe": true,
  "school": "MIT",
  "schoolYear": "graduated",
  "address": {
    "streetAddress": "3038 Race Street",
    "city": "Denver",
    "state": "CO",
    "zipCode": 80202
  }
}