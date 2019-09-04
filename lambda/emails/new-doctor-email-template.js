const AWS = require('aws-sdk');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'shadowing' });
AWS.config.update({ region: 'us-east-1' });

const template = {
  TemplateName: "new-doctor-email-template",
  SubjectPart: "New Physician Pending Approval",
  HtmlPart: "<html><style>body {font-family: 'Helvetica';} a { color: black;text-decoration: none;border-radius: 20px;border: 0;margin: 0.5em;padding: 1em 2em;font-weight: bold;background-color: #3CADE7;}</style><body><h3>A New Physician Has Signed Up for FindShadowing.com!</h3><p>Their request is currently pending approval. Please visit your</p><h5><a href='https://findshadowing.com/admin/pending-doctors'>Admin Dashboard</a></h5><p>to view the physicians credentials and approve or deny this request.</p></body></html>"
}

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
  console.log(response);
}).catch(err => {
  response = {
    statusCode: 500,
    body: `Internal Server Error: ${err.message}`
  };
  console.error(response);
});