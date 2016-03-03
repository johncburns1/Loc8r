//require mongoose
var mongoose = require('mongoose'); //give controller access to mongoose database
var Loc = mongoose.model('Location'); //brings in the location model so that we can interact with the locations collection

//sendJsonResponse function
var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

//create an earth object
var theEarth = (function() {
  var earthRadius = 6371; //km, miles is 3959

  //get distnace from radians
  var getDistanceFromRads = function(rads) {
    return parseFloat(rads * earthRadius);
  };

  //get radians from distance
  var getRadsFromDistance = function(distance) {
    return parseFloat(distance / earthRadius);
  };

  return {
    getDistanceFromRads : getDistanceFromRads,
    getRadsFromDistance : getRadsFromDistance
  };
})();

//locations create
module.exports.locationsCreate = function(req, res) {
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) {
    if(err) {
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, location);
    }
  });
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

//locations update one
module.exports.locationsUpdateOne = function(req, res) {
  if (!req.params.locationid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid is required"
    });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec(
      function(err, location) {
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        location.save(function(err, location) {
          if (err) {
            sendJSONresponse(res, 404, err);
          } else {
            sendJSONresponse(res, 200, location);
          }
        });
      }
  );
};


//locations list by distance
module.exports.locationsListByDistance = function(req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  var geoOptions = {
    spherical: true,
    maxDistance: theEarth.getRadsFromDistance(20),
    num: 10
  };
  if((!lng && lng !== 0) || (!lat && lat !== 0)) {
    sendJsonResponse(res, 404, {
      "message": "lng and lat query parameters are required"
    });
    return;
  }

  //create a new array to hold the processed results data
  Loc.geoNear(point, geoOptions, function(err, results, stats) {
    var locations;
    console.log('Geo Results', results);
    console.log('Geo stats', stats);
    if(err) {
      console.log('geoNear error:', err);
      sendJsonResponse(res, 404, err);
    } else {
      locations = buildLocationList(req, res, results, stats); //loop through geoNear query results

      //send processed data back as a json response
      sendJsonResponse(res, 200, locations);
    }
  });
};

var buildLocationList = function(req, res, results, stats) {
  var locations = [];
  results.forEach(function(doc) {
    locations.push({
      distance: theEarth.getDistanceFromRads(doc.dis),
      name: doc.obj.name,
      address: doc.obj.address,
      rating: doc.obj.rating,
      facilities: doc.obj.facilities,
      _id: doc.obj._id
    });
  });
  return locations;
};

module.exports.locationsDeleteOne = function(req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid)
      .exec(
        function(err, location) {
          if (err) {
            console.log(err);
            sendJSONresponse(res, 404, err);
            return;
          }
          console.log("Location id " + locationid + " deleted");
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "No locationid"
    });
  }
};
