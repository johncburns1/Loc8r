var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/Loc8r';

if (process.env.NODE_ENV === 'production') {
    dbURI = 'mongodb://johncburns1:Fr0gg13!@ds011258.mongolab.com:11258/heroku_mz82v22f';
}

mongoose.connect(dbURI);

var readLine = require("readline");
if(process.platform === "win32") {
  var rl = readLine.createInterface ({
      input : process.stdin,
      output : process.stdout
  });
  rl.on ("SIGINT", function () {
      process.emit ("SIGINT");
  });
}

mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

//for shutting down
var gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};

//For nodemon restarts
process.once('SIGUSR2', function () {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});

//for app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});

//for Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function() {
    process.exit(0);
  });
});

//require locations
require('./locations');
