//require mongoose
var mongoose = require('mongoose'); //give controller access to mongoose database
var Loc = mongoose.model('Location'); //brings in the location model so that we can interact with the locations collection

//doAddReview
var doAddReview = function(req, res, location) {
  if(!location) {
    sendJsonResponse(res, 404, {
      "message": "locationid not found"
    });

  //push new data into subdocument arrays
  } else {
    location.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });

    //before saving
    location.save(function(err, location) {

      //On successful save operation call function to update average rating
      var thisReview;
      if(err) {
        console.log(err);
        sendJsonResponse(res, 400, err);
      } else {
        updateAverageRating(location._id);

        //retrieve the last review added to the arrray and return it as jason confirmation response
        thisReview = location.reviews[location.reviews.length - 1];
        sendJsonResponse(res, 201, thisReview);
      }
    });
  }
};

//update average rating
var updateAverageRating = function(locationid) {
  console.log("Update rating average for", locationid);
  Loc
    .findById(locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        if (!err) {
          doSetAverageRating(location);
        }
      });
};

//do set average rating
var doSetAverageRating = function(location) {
  var i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    location.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

//sendJsonResponse function
var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

//create reviews
module.exports.reviewsCreate = function(req, res) {
  var locationid = req.params.locationid;
  if(locationid) {
    Loc
      .findById(locationid)
      .select('reviews')
      .exec(
        function(err, location) {
          if(err) {
            sendJsonResponse(res, 400, err);
          } else {
            doAddReview(req, res, location);
          }
        }
      );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid required"
    });
  }
};

module.exports.reviewsReadOne = function(req, res) {
  if(req.params && req.params.locationid && req.params.reviewid) {
    Loc
      .findById(req.params.locationid)
      .select('name reviews')
      .exec(
        function(err, location) {
          var response, review;
          if(!location) {
            sendJsonResponse(res, 404, {
              "message": "locationid not found"
            });
            return;
          } else if (err) {
            sendJsonResponse(res, 404, err);
            return;
          }
          if(location.reviews && location.reviews.length > 0) {
            review = location.reviews.id(req.params.reviewid);
            if(!review) {
              sendJsonResponse(res, 404, {
                "message": "reviewid not found"
              });
            } else {
              response = {
                location : {
                  name : location.name,
                  id : req.params.locationid
                },
                review : review
              };
              sendJsonResponse(res, 200, response);
            }
          } else {
            sendJsonResponse(res, 404, {
              "message": "No reviews found"
            });
          }
        }
      );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
  }
};
module.exports.reviewsUpdateOne = function(req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        var thisReview;
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          thisReview = location.reviews.id(req.params.reviewid);
          if (!thisReview) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            thisReview.author = req.body.author;
            thisReview.rating = req.body.rating;
            thisReview.reviewText = req.body.reviewText;
            location.save(function(err, location) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 200, thisReview);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to update"
          });
        }
      }
  );
};

//reviews delete one
module.exports.reviewsDeleteOne = function(req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
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
        if (location.reviews && location.reviews.length > 0) {
          if (!location.reviews.id(req.params.reviewid)) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            location.reviews.id(req.params.reviewid).remove();
            location.save(function(err) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
  );
};
