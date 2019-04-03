const AWS = require('aws-sdk');
const moment = require('moment');

exports.handler = (event, context, callback) => {
  let response;

  let params = {
    TableName: 'requests'
  };
  let filterExpression = [];
  let expressionAttributeValues = {};
  let queryByDate = false;

  // Query Filters
  if (event.student) {
    filterExpression = [...filterExpression, 'student = :studentEmail'];
    expressionAttributeValues[':studentEmail'] = event.student;
    params = Object.assign({}, params, {
      FilterExpression: filterExpression.join(' AND '),
      ExpressionAttributeValues: expressionAttributeValues
    });
  } 
  if (event.doctor) {
    filterExpression = [...filterExpression, 'doctor = :doctorEmail'];
    expressionAttributeValues[':doctorEmail'] = event.doctor;
    params = Object.assign({}, params, {
      FilterExpression: filterExpression.join(' AND '),
      ExpressionAttributeValues: expressionAttributeValues
    });
  }
  if (event.startDate && !event.endDate || event.endDate && !event.startDate) {
    response = {
      statusCode: 400,
      body: JSON.stringify('Both a start date and an end date must be provided to query by date range.')
    }
    callback(response);
  } else if (event.startDate && event.endDate) {
    queryByDate = true;
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  // Database Scan
  dynamodb.scan(params).promise().then(data => {
    let results = data.Items;
    if (queryByDate) {
      validateDates(event.startDate, event.endDate, callback);
      results = filterByDate(results, event.startDate, event.endDate);
    }

    if (results.length == 0) {
      response = {
        statusCode: 404,
        body: JSON.stringify('No request found that matches given query. Please try your request again.')
      };
      callback(response);
    }

    response = {
      statusCode: 200,
      body: JSON.stringify(results)
    };
    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500, 
      body: JSON.stringify(err)
    };
    callback(response);
  });
};

// Date Query Helper Functions
function validateDates(startDate, endDate, callback) {
  if (moment(startDate).isSameOrAfter(endDate)) {
    callback({
      statusCode: 400,
      body: JSON.stringify('Start date must be before the end date.')
    });
  }
}

function filterByDate(results, startDate, endDate) {
  return results.filter(result => {
    if (moment(result.createdDate).isSameOrAfter(startDate) && moment(result.createdDate).isSameOrBefore(endDate) ) {
      return true;
    } else {
      return false;
    }
  });
}