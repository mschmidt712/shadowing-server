const AWS = require('aws-sdk');
const joi = require('joi');
const uuidv1 = require('uuid/v1');
const moment = require('moment');
const requestSchema = require('./request-schema.js');

exports.handler = (event, context, callback) => {
  let response;
  let request = event.request;
  const validatedInput = joi.validate(request, requestSchema.schema, {
    stripUnknown: true
  })
    .then(value => {
      value.createdDate = new Date().toISOString();
      value.uuid = uuidv1();
      value.ttl = moment().add(60, 'days').unix();
      value.status = 'pending';
      return value;
    })
    .catch(err => {
      response = {
        statusCode: 400,
        body: `${err.name}: ${err.details[0].message}`
      }

      callback(JSON.stringify(response));
    });

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  let params;
  let validatedRequest;
  let student, doctor;

  validatedInput.then(validatedResp => {
    validatedRequest = validatedResp;
    params = {
      TableName: 'requests',
      FilterExpression: 'student = :studentId and doctor = :doctorId',
      ExpressionAttributeValues: {
        ':studentId': validatedRequest.student,
        ':doctorId': validatedRequest.doctor
      },
    }

    return dynamodb.scan(params).promise();
  }).then(results => {
    if (results.Items.length !== 0) {
      const requestDate = moment(results.Items[0].createdDate).format('l');
      const ttl = moment(results.Items[0].createdDate).add(60, 'days').format('l');
      response = {
        statusCode: 400,
        body: `Student requested shadowing with this doctor on ${requestDate} and is not able to request shadowing again until ${ttl}`
      };

      callback(JSON.stringify(response));
    } else {
      params = {
        TableName: 'students',
        Key: {
          id: validatedRequest.student
        }
      }
      return dynamodb.get(params).promise();
    }
  }).then(results => {
    if (!results.Item) {
      response = {
        statusCode: 400,
        body: 'Student does not exist in the database'
      };
      callback(JSON.stringify(response));
    } else {
      student = results.Item;

      params = {
        TableName: 'doctors',
        Key: {
          id: validatedRequest.doctor
        }
      };
      return dynamodb.get(params).promise();
    }
  }).then(results => {
    if (!results.Item) {
      response = {
        statusCode: 400,
        body: 'Doctor does not exist in the database'
      };
      callback(JSON.stringify(response));
    } else {
      doctor = results.Item;

      params = {
        TableName: 'requests',
        Item: validatedRequest
      };
      return dynamodb.put(params).promise();
    }
  }).then(() => {
    const availability = Object.keys(request.scheduling).filter(day => {
      if (!request.scheduling[day]) {
        return false;
      }
      return true;
    }).reduce((str, day) => {
      if (str.length > 0) {
        str += ' & ';
      }
      str += `${this.capitalizeWord(day)} from ${this.formatTime(request.scheduling[day][0])} to ${this.formatTime(request.scheduling[day][1])}`
      return str;
    }, '');

    var newRequestEmailParams = {
      FunctionName: 'new-request-email-lambda',
      InvocationType: 'Event',
      Payload: JSON.stringify({
        "email": doctor.email,
        "requestData": {
          "name": doctor.name,
          "availability": availability,
          "student": student.name
        }
      })
    };
    const Lambda = new AWS.Lambda({ region: 'us-east-1' });
    return new Promise((resolve, reject) => {
      return Lambda.invoke(newRequestEmailParams, function (err, data) {
        if (err) {
          resolve(`Request created but request notification email failed: ${err}`);
        } else resolve('Request notification email sent.');
      });
    });
  }).then((newRequestEmailResp) => {
    console.log(newRequestEmailResp);

    response = {
      statusCode: 201,
      body: JSON.stringify(`Request between ${validatedRequest.student} and ${validatedRequest.doctor} successfully created.`)
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

exports.capitalizeWord = function (str) {
  const firstLetter = str.charAt(0).toUpperCase();
  return `${firstLetter}${str.slice(1)}`;
}

exports.formatTime = function (time) {
  return moment(time, 'HH:mm:ss').format('h:mm A');
}
