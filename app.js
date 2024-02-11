// Import necessary libraries
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const processor = require('./processor/youtube')



// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Disable 'X-Powered-By' header for security
app.disable('x-powered-by');

// Routes
app.get('/', (req, res) => {
  res.send('Cms  API Portal is running.');
});



// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


//response extensions
//common Error : 500
express.response.endWithUnKnownError = function () {
  this.statusCode = 500;
  this.send({
    success: false,
    message: 'went wrong'
  });
  this.end();
};

//common Error : 200
express.response.endWithSuccess = function (resObjs) {
  this.statusCode = 200;
  this.send({
    success: true,
    message: 'sucess',
    ...(resObjs && { objects: resObjs })
  });
  this.end();
};

//Common Error : 401 for unauthorized user
express.response.endWithUnauthorizedError = function (msg) {
  this.statusCode = 401;
  this.send({
    success: false,
    message: msg
  });
  this.end();
};

// Forbidden error : 403
express.response.endWithForbiddenError = function (msg) {
  this.statusCode = 403;
  this.send({
    success: false,
    message: msg
  });
  this.end();
};

//Common Error : 400
express.response.endWithValidationError = function (msg, fields) {
  this.statusCode = 400;
  this.send({
    success: false,
    message: msg,
    objects: fields
  });
  this.end();
};
express.response.endWithNotFoundError = function (msg, fields) {
  this.statusCode = 404;
  this.send({
    success: false,
    message: msg,
    objects: fields
  });
  this.end();
};

// Start the server
const server = app.listen(port, async () => {
  await  processor.youtubeScrapper([1,2,3,4,5])
  console.log(`Server started on http://localhost:${port}`);
});

// Export app for testing purposes
module.exports = app;


