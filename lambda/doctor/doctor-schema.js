const joi = require('joi');

exports.schema = joi.object().keys({
    name: joi.string().min(3).max(30).required(),
    degree: joi.string().min(2).max(2).required(),
    specialty: joi.string().required(),
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    phoneNumber: joi.string().min(10),
    address: joi.object().keys({
        streetAddress: joi.string(),
        city: joi.string(),
        state: joi.string().uppercase().length(2)
    }),
    zipCode: joi.number().integer().required(),
    scheduling: joi.array().length(7).required(),
    shiftLength: joi.array().length(2).required(),
    maxRequests: joi.number().integer().min(1),
    comments: joi.string(),
    badgePhoto: joi.string().required(),
    approved: joi.boolean().required(),
    requests: joi.array()
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
      scheduling: [{
        dayOfWeek: 0,
        allow: false,
        startTime: 0,
        endTime: 23
      }, {
        dayOfWeek: 1,
        allow: false,
        startTime: 0,
        endTime: 23
      }, {
        dayOfWeek: 2,
        allow: true,
        startTime: 8,
        endTime: 17
      }, {
        dayOfWeek: 3,
        allow: false,
        startTime: 0,
        endTime: 23
      }, {
        dayOfWeek: 4,
        allow: false,
        startTime: 0,
        endTime: 23
      }, {
        dayOfWeek: 5,
        allow: false,
        startTime: 0,
        endTime: 23
      }, {
        dayOfWeek: 6,
        allow: false,
        startTime: 0,
        endTime: 23
      }],
      shiftLength: [2, 6],
      maxRequests: 4,
      badgePhoto: 'https://s3.amazonaws.com/physician-badge-image/foo%40md.com.png',
      approved: true
    }
  }