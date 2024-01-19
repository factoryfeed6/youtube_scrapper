/* eslint-disable indent */
/* eslint-disable semi */
const { Pool } = require('pg');
const config = require('../common/config');
 //const errorHandler = require('../helpers/errorHandling');

/* Connection string settings */
const pool = new Pool({
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.username,
  password: config.password,
  max: 5
});

exports.executeSql = function (query, params) {
  const response = {};
  return new Promise(function (resolve, reject) {
    pool.query(query, params, function (err, result) {
      if (err) {
        console.log(query , 'query')
       console.log(err , 'err')
        response.success = false;
        response.message = err;
        response.rows = null;
        reject(response);
      } else {
        response.success = true;
        response.message = 'Success.';
        response.rows = result.rows;
        resolve(response);
      }
    });
  });
};

exports.asyncExecuteSql = async function (query, params) {
  return exports.executeSql(query, params);
};
