/* eslint-disable no-useless-escape */
/* eslint-disable semi */

const devConfig = {};
devConfig.accessControl = {};
devConfig.accessControl.origins = ['http://localhost:3000', 'http://localhost:4000'];
devConfig.host = 'localhost';
devConfig.port = '5432';
devConfig.database = 'fc_main';
devConfig.username = 'postgres';
devConfig.password = '';
devConfig.passport = {};
devConfig.passport.jwt = {};
devConfig.passport.jwt.secretKey = '4423452344353'
devConfig.passport.jwt.tokenExpiryTime = 86400;
devConfig.passport.jwt.refreshTokenExpiryTime = 5184000;
devConfig.passport.jwt.algorithm = 'HS512';
devConfig.regex = {};
devConfig.regex.email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = devConfig