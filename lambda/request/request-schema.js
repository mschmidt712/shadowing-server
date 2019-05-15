const joi = require('joi');

exports.schema = joi.object().keys({
  student: joi.string().required(),
  doctor: joi.string().required(),
  scheduling: joi.object().required(),
  createdDate: joi.string().isoDate(),
  uuid: joi.string().uuid(),
  ttl: joi.number().integer()
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
    }
  }
}
