exports.handler = (event, context, callback) => {
  const Source = 'support@findshadowing.com';
  const ToAddress = event.email;
  const Template = 'doctor-approved-email-template';

  const SES = require('aws-sdk').SES;
  new SES().sendTemplatedEmail({
    Destination: {
      ToAddresses: [ToAddress]
    },
    Source,
    Template,
    TemplateData: "{}"
  }, callback);
};
