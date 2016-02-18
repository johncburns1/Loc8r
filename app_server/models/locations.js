var mongoose = require('mongoose');

//reviewSchema
var reviewSchema = new mongoose.Schema({
  author: String,
  rating: {type: Number, required: true, min: 0, max: 5},
  reviewText: String,
  createdOn: {type: Date, "default": Date.now}
});

//openingTimeSchema
var openingTimeSchema = new mongoose.Schema({
  days: {type: String, required: true},
  opening: String,
  closing: String,
  closed: {type: Boolean, required: true}
});

//locationSchema
var locationSchema = new mongoose.Schema({
  name: {type: String, required: true},
  address: String,
  rating: {type: Number, "default": 0, min: 0, max: 5},
  facilities: [String],
  //store coordinates in long/lat order
  coords: {type: [Number], index: '2dsphere'},
  //add newsted schema by referencing another schema object as an array
  openingTimes: [openingTimeSchema],
  reviews: [reviewSchema]
});

//model the schema
mongoose.model('Location', locationSchema);
