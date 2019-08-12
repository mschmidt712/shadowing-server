const AWS = require('aws-sdk');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'shadowing' });
AWS.config.update({ region: 'us-east-1' });

const doctorParams = require('./doctor-welcome-email-template.json');
const doctorApprovedParams = require('./doctor-approved-email-template.json');
const studentParams = require('./student-welcome-email-template.json');
const newTemplateParams = require('./new-request-email-template.json');

const SES = new AWS.SES({ region: 'us-east-1' });
SES.createTemplate(doctorApprovedParams, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else console.log(data);           // successful response
});