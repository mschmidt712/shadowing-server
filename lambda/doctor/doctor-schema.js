const joi = require('joi');

exports.schema = joi.object().keys({
  name: joi.string().min(3).max(30).required(),
  degree: joi.string().min(2).max(4).required(),
  specialty: joi.string().required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  id: joi.string().required(),
  phoneNumber: joi.string().min(10),
  address: joi.object().keys({
    streetAddress: joi.string(),
    city: joi.string(),
    state: joi.string().uppercase().length(2),
    zipCode: joi.string().min(5).max(5).required()
  }),
  scheduling: joi.object().required(),
  shiftLength: joi.array().length(2).required(),
  maxRequests: joi.number().integer().min(1),
  weeklyRequests: joi.number().integer(),
  additionalComments: joi.string(),
  badgePhoto: joi.string(),
  approved: joi.boolean(),
  requests: joi.array(),
  zipCode: joi.string().min(5).max(5)
});

exports.event = {
  doctor: {
    name: 'Foo Bar',
    degree: 'MD',
    specialty: 'Cardiology',
    email: 'foo@bar.com',
    phoneNumber: '(800)999-9999',
    address: {
      streetName: '100 Acre Way',
      city: 'Denver',
      state: 'CO',
      zipCode: 80205
    },
    scheduling: {
      sunday: false,
      monday: false,
      tuesday: [8, 17],
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false
    },
    shiftLength: [2, 6],
    maxRequests: 4,
    badgePhoto: 'https://s3.amazonaws.com/physician-badge-image/foo%40md.com.png',
    approved: true
  }
}