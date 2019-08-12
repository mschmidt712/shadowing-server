const AWS = require('aws-sdk');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'shadowing' });
AWS.config.update({ region: 'us-east-1' });

const params = {
    "TemplateName": "doctor-approved-email-template"
}

const SES = new AWS.SES({ region: 'us-east-1' });
SES.deleteTemplate(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
});