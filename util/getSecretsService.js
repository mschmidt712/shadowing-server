const AWS = require('aws-sdk');

exports.getSecret = function (secretName) {
  const region = 'us-east-1';

  const client = new AWS.SecretsManager({
    region
  });

  return new Promise((resolve, reject) => {
    return client.getSecretValue({ SecretId: secretName }, function (err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(JSON.parse(data.SecretString));
    });
  });
}