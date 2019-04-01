const joi = require('joi');

exports.schema = joi.object().keys({
    student: joi.string().email({ minDomainAtoms: 2 }).required(),
    doctor: joi.string().email({ minDomainAtoms: 2 }).required(),
    scheduling: joi.array().length(7).required(),
  });

exports.event = {
  request: {
    doctor: 'foo@bar.com',
    student: 'student@md.com',
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
      }]
  }
}
