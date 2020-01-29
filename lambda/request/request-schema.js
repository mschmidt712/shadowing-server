const joi = require('joi');

exports.schema = joi.object().keys({
  additionalInfo: joi.string().max(250),
  student: joi.string().required(),
  doctor: joi.string().required(),
  scheduling: joi.object().required(),
  organizations: joi.array().required(),
  status: joi.string().valid(['approved', 'denied', 'pending']),
  createdDate: joi.string().isoDate(),
  uuid: joi.string().uuid(),
  ttl: joi.number().integer(),
});

exports.event = {
  request: {
    doctor: 'kaskjakjfasdfkj-1231kds',
    student: 'asddeeefgc-asdfa',
    scheduling: {
      sunday: false,
      monday: false,
      tuesday: ["8:00", "17:00"],
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false
    },
    status: 'pending'
  }
}
