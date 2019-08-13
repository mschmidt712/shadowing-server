const AWS = require('aws-sdk');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'shadowing' });
AWS.config.update({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {
  let response;
  const template = event.template;

  const SES = new AWS.SES({ region: 'us-east-1' });
  return new Promise((resolve, reject) => {
    const deleteParams = {
      TemplateName: template.TemplateName
    };

    return SES.deleteTemplate(deleteParams, function (err, data) {
      if (err) reject(err);
      else resolve();
    });
  }).then(() => {
    const createParams = {
      Template: template
    };

    return new Promise((resolve, reject) => {
      return SES.createTemplate(createParams, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }).then(data => {
    response = {
      statusCode: 200,
      body: JSON.stringify(template)
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