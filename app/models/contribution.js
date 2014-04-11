var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];
var Schema = mongoose.Schema;

var ContributionSchema = new Schema({
  title: {type: String},
  description: {type: String},
  owner: {type: Schema.ObjectId, ref: 'User'},
  population_impact: {type: String},
  done_before: {type: String},
  complete: {type: String},
  duration: {type: String},
  created_on: {type: Date, default: Date.now},
  score: {type: Number}
});

ContributionSchema.statics = {
  load: function(id, cb){
    this.findOne({ _id : id }).populate('owner').exec(cb);
  }
};

mongoose.model('Contribution', ContributionSchema);