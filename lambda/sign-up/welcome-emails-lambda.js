
// exports.handler = (event, context, callback) => {

// };

const nodemailer = require('nodemailer');
const Email = require('email-templates');
const getSecret = require('../../util/getSecretsService').getSecret;

const event = {
  "version": 1.0,
  "triggerSource": "string",
  "region": "us-east-1",
  "userPoolId": "string",
  "userName": "string",
  "callerContext": {
    "awsSdkVersion": "string",
    "clientId": "string"
  },
  "request": {
    "userAttributes": {
      "custom:occupation": "student"
    }
  },
  "response": {}
};

new Promise((resolve, reject) => {
  return getSecret('email-password').then(resp => {
    return resolve(resp);
  }).catch(err => {
    return reject(err);
  });
}).then(secretObj => {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'marie.schmidt.712@gmail.com',
      pass: secretObj['email_password']
    }
  });

  const email = new Email({
    message: {
      from: 'marie.schmidt.712@gmail.com'
    },
    send: true,
    transport,
    views: { root: `${__dirname}/emails` }
  });

  if (event.request.userAttributes["custom:occupation"] === 'doctor') {
    email
      .send({
        template: 'doctor-welcome',
        message: {
          to: 'marie.schmidt.712+test@gmail.com'
        }
      })
      .then(console.log('Email Successfully Sent.'))
      .catch(console.error);
  } else {
    email
      .send({
        template: 'student-welcome',
        message: {
          to: 'marie.schmidt.712+test@gmail.com'
        }
      })
      .then(console.log('Email Successfully Sent.'))
      .catch(console.error);
  }
}).catch(err => {
  throw new Error(err);
});
