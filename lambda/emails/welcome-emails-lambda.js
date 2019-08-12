exports.handler = (event, context, callback) => {
  const Source = 'support@findshadowing.com';
  const ToAddress = event.email;
  const occupation = event.occupation;

  let Template;
  if (occupation === 'student') {
    Template = 'student-welcome-email-template';
  } else if (occupation === 'doctor') {
    Template = 'doctor-welcome-email-template';
  }

  const SES = require('aws-sdk').SES;
  new SES().sendTemplatedEmail({
    Destination: {
      ToAddresses: [ToAddress]
    },
    Source,
    Template,
    TemplateData: JSON.stringify({
      "name": event.name
    })
  }, callback);
};
