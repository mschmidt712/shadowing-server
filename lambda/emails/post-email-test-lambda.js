const AWS = require('aws-sdk');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'shadowing' });
AWS.config.update({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {
  let response;
  const template = event.template;

  const SES = new AWS.SES({ region: 'us-east-1' });
  const emailParams = {
    Destination: {
      ToAddresses: [event.email]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: event.template.HtmlPart
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: event.template.SubjectPart
      }
    },
    Source: 'support@findshadowing.com'
  };

  return new Promise((resolve, reject) => {
    SES.sendEmail(emailParams, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  }).then((data) => {
    response = {
      statusCode: 200,
      body: data
    };
    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500,
      body: `Internal Server Error: ${err.message}`
    };
    callback(JSON.stringify(response));
  });
}