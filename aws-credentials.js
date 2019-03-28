const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({profile: 'shadowing'});
AWS.config.credentials = credentials;
AWS.config.update({region: 'us-east-1'});