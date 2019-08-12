exports.handler = (event, context, callback) => {
  const Source = 'support@findshadowing.com';
  const ToAddress = event.email;
  const requestData = event.requestData;

  const SES = require('aws-sdk').SES;
  new SES().sendTemplatedEmail({
    Destination: {
      ToAddresses: [ToAddress]
    },
    Source,
    Template: 'new-request-email-template',
    TemplateData: JSON.stringify({
      "name": requestData.name,
      "availability": requestData.availability,
      "student": requestData.student,
    })
  }, callback);
};
