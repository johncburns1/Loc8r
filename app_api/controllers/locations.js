//require mongoose
var mongoose = require('mongoose'); //give controller access to mongoose database
var Loc = mongoose.model('Location'); //brings in the location model so that we can interact with the locations collection

//sendJsonResponse function
var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

//create a placeholder for the locations controllers
module.exports.locationsCreate = function(req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};
module.exports.locationsReadOne = function(req, res) {
  if(req.params && req.params.locationid) { //check that locationid exists in request param
    Loc
      .findById(req.params.locationid)
      .exec(function(err, location) {
        if(!location) { //if mongoose does not return a location, send 404 message and exit function scope
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) { //if mongoose returned an error, send it as 404 response and exit controller
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 200, location);
      });
  } else {  //if request param didnt include locationid send appropriate 404 response
    sendJsonResponse(res, 404, {
      "Message": "No locationid in request"
    });
  }
};
module.exports.locationsUpdateOne = function(req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};
module.exports.locationsListByDistance = function(req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};
module.exports.locationsDeleteOne = function(req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};
