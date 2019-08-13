const AWS = require('aws-sdk');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'shadowing' });
AWS.config.update({ region: 'us-east-1' });

exports.handler = (event, context, callback) => {
  let response;

  const SES = new AWS.SES({ region: 'us-east-1' });
  return new Promise((resolve, reject) => {
    SES.listTemplates({}, function (err, data) {
      if (err) reject(err);
      else resolve(data.TemplatesMetadata);           // successful response
    });
  }).then(templates => {
    const promises = templates.map(template => {
      const params = {
        TemplateName: template.Name
      };

      return new Promise((resolve, reject) => {
        SES.getTemplate(params, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    });

    return Promise.all(promises);
  }).then(data => {
    const respData = data.map(promiseResp => {
      return promiseResp.Template;
    })

    response = {
      statusCode: 200,
      body: JSON.stringify(respData)
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