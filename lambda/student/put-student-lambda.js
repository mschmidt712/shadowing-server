const AWS = require('aws-sdk');
const joi = require('joi');
const fetch = require('node-fetch');
const studentSchema = require('./student-schema.js');
const validateUserAddress = require('./validateUserAddress').validateUserAddress;

exports.handler = (event, context, callback) => {
  let response;
  let student = event.student;
  const subscribeStudent = student.subscribe;

  const validatedInput = joi.validate(student, studentSchema.schema, {
    stripUnknown: true
  }).then(value => validateUserAddress(value))
    .catch(err => {
      if (err.isJoi) {
        response = {
          statusCode: 400,
          body: `${err.name}: ${err.details[0].message}`
        }
      } else {
        response = {
          statusCode: 400,
          body: err.message
        }
      }
      callback(JSON.stringify(response));
    });

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  let params;

  validatedInput.then(validatedStudent => {
    student = validatedStudent;

    params = {
      TableName: 'students',
      Key: {
        id: validatedStudent.id
      }
    }
    return dynamodb.get(params).promise();
  }).then(results => {
    if (!results || Object.keys(results).length === 0) {
      response = {
        statusCode: 400,
        body: 'User does not exist in the database'
      };
      callback(JSON.stringify(response));
    }

    student = Object.assign({}, results.Item, student);
    params = {
      TableName: 'students',
      Item: student,
      ReturnValues: 'ALL_OLD'
    };
    return dynamodb.put(params).promise();
  }).then(() => {
    if (subscribeStudent) {
      return this.subscribeStudentEmail(student.email, student.name);
    } else {
      return new Promise(resolve => resolve('No data.'));
    }
  }).then(() => {
    response = {
      statusCode: 200,
      body: JSON.stringify(student)
    };

    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500,
      body: `Internal Server Error: ${err.message}`
    };

    callback(JSON.stringify(response));
  });
};

exports.subscribeStudentEmail = function (email, name) {
  const api_key_name = 'ConvertKit_API_Key';

  return this.getSecret('ConvertKit_API_Key').then(resp => {
    const api_key = resp[api_key_name];
    const formId = '314904';
    const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe?api_key=${api_key}`;
    data = {
      api_key,
      email,
      first_name: name
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }).then(function (resp) {
    return resp.json();
  }).then(respData => {
    console.log('Subscription Data: ', respData);
  }).catch(err => {
    throw err;
  });
}

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