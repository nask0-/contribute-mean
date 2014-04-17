var mongoose = require('mongoose');
var async = require('async');
var Contribution = mongoose.model('Contribution');
var _ = require('underscore');
var Q = require('Q');

//Create a new contribution - the current user is passed in the req object
//using the passport  cookie
exports.create = function(req, res){
  var contribution = new Contribution(req.body);
  contribution.owner = req.user;
  contribution.score = calculateScore(contribution);
  contribution.save();
  res.jsonp(contribution);
}


//Invoked when contribution object is already in the req object
//and returns jsonp
exports.show = function(req, res){
  res.jsonp(req.contribution);
}

//Get a specific contribution using the static load() method 
exports.contribution = function(req, res, next,id){
  var Contribution = mongoose.model('Contribution');

  Contribution.load(id, function(err, contribution){
    if(err) return next(err);
    if(!contribution) return next(new Error('Failed to load contribution ' + id));
    req.contribution = contribution;
    next();
  })
}

//Get all contributions for this user
exports.all = function(req, res){
  var sortDesc = -1;
  if(req.query.sortDesc) {
    sortDesc = req.query.sortDesc;
  }

  var orderBy = {created_on : -1};
  if(req.query.orderBy){
    var o = req.query.orderBy;
    switch(o) {
      case "score" :
        orderBy = {score : sortDesc};
        break;
      case "date" :
        orderBy = {created_on : sortDesc};
        break;
      case "title" :
        orderBy = {title : sortDesc};
        break;
    }
  }

  Contribution.find({'owner' : req.user}).populate('owner').sort(orderBy).limit(15).exec(function(err, contributions){
    if(err){
      res.render('error', {status: 500});
    } else {
      res.jsonp(contributions);
    }
  });
}


exports.getContributionsForUser = function(req, res){
  var user;
  if(req.query.user){
    user = JSON.parse(req.query.user);
  }

  var sortDesc = -1;
  if(req.query.sortDesc) {
    sortDesc = req.query.sortDesc;
  }
  var orderBy = {created_on : sortDesc};
  if(req.query.orderBy){
    var o = req.query.orderBy;
    switch(o) {
      case "score" :
        orderBy = {score : sortDesc};
        break;
      case "date" :
        orderBy = {created_on : sortDesc};
        break;
      case "title" :
        orderBy = {title : sortDesc};
        break;
    }
  }
  Contribution.find({'owner' : user["_id"]}).populate('owner').sort(orderBy).limit(15).exec(function(err, contributions){
        var userView = {
            user: user,
            contributions: contributions
          }
        res.jsonp(userView);
  });
}
//Get newest 15 contributions of each user
exports.masterall = function(req, res){
  var User = mongoose.model('User');


  User.find().exec().then(function(users){
    getAllContributions(users).then(function(stitchedResponses){
      res.jsonp(stitchedResponses)}
    )
  })

  var getAllContributions = function(users){
    var the_promises = [];

    var orderBy = {created_on : -1};
    if(req.query.orderBy){
      var o = req.query.orderBy;
      switch(o) {
        case "score" :
          orderBy = {score : -1};
          break;
        case "date" :
          orderBy = {created_on : -1};
          break;
        case "title" :
          orderBy = {title : -1};
          break;
      }
    }
    users.forEach(function(user) {
      var deferred = Q.defer();
      Contribution.find({'owner' : user["_id"]}).populate('owner').sort(orderBy).limit(15).exec(function(err, contributions){
        var userView = {
            user: user,
            contributions: contributions
          }
        deferred.resolve(userView);
      });
      the_promises.push(deferred.promise);
    });

    return Q.all(the_promises);
  }

}

//Update a contribution
exports.update = function(req, res){
  var contribution = req.contribution;
  //_.extend extends the current object giving preference
  //to the req.body object settings.
  contribution.score = calculateScore(contribution);
  contribution = _.extend(contribution, req.body)

  contribution.save(function(err){
    res.jsonp(contribution);
  })
}


//Delete a contribution
exports.destroy = function(req, res){
  var contribution = req.contribution;
  contribution.remove(function(err){
    if(err){
      res.render('error', {status:500});
    } else {
      res.jsonp(1);
    }
  })
}

//Get user's contributions % of the whole team
//Possibly export some of this functionality to a function for reuse
exports.userContributionsPercentage = function(req, res){
  var user = req.user;
  var agg = [ {$group: { _id: "$owner", total: {$sum:1} }} ];
  Contribution.aggregate(agg, function(err, results){
    if(err) {
      res.render('error', {status:500});
    } else {
      var output = {};
      var thisUserContributions = 0;
      var allUsersContributions = 0;
      results.forEach(function(res){
        if(String(res["_id"]) === String(user["_id"])){
          thisUserContributions = res["total"];
        } 

        allUsersContributions += res["total"];
        
      })


      //Now get in the contributions distribution by score
      //Might want to do this outside the current promise as another promise
      //and use Q.all to wait out the queue before returning a response.
      //Officially in callback hell... 

      agg = [ {$group: { _id: "$owner", total: {$sum:"$score"} }} ];
      Contribution.aggregate(agg, function(e, scores){
        if(e) {
          res.render('error', {status:500});
        } else {
          var thisUserScore = 0;
          var allUsersScore = 0;
          scores.forEach(function(sc){
            if(String(sc["_id"]) === String(user["_id"])){
              thisUserScore = sc["total"];
            } 

            allUsersScore += sc["total"];
            
          })


          output = {
            "numberOfContributions" : {
              "user" : thisUserContributions,
              "total" : allUsersContributions
            },
            "scoreDistribution" : {
              "user" : thisUserScore,
              "total" : allUsersScore
            }
          }

          res.jsonp(output);
        }
      });
    }
  })
}

var calculateScore = function(contribution){
  var score = 0;

  if(!contribution.population_impact) contribution.population_impact = "1";
  switch(contribution.population_impact)
  {
    case "1":
      score += 5;
      break;

    case "2":
      score += 15;
      break; 

    case "3":
      score += 45;
      break;

    default:
      score += 10;
  }

  if(!contribution.done_before) contribution.done_before = "1";
  switch(contribution.done_before)
  {
    case "1":
      score += 2;
      break;

    case "2":
      score += 10;
      break; 

    case "3":
      score += 20;
      break;

    default:
      score += 5;
  }

  if(!contribution.completed) contribution.completed = "1";
  switch(contribution.completed)
  {
    case "1":
      score *= 0.5;
      break;

    case "2":
      score *= 1;
      break;

    default:
      score *= 0.5;
  }

  if(!contribution.duration) contribution.duration = "1";
  var duration = parseInt(contribution.duration);
  return score *= (1 + duration/10);

}