
var async = require('async')

module.exports = function (app, passport, auth) {

  //User routes
  var users = require('../app/controllers/users')
  app.get('/signin', users.signin)
  app.get('/signup', users.signup)
  app.get('/signout', users.signout)
  app.post('/users', users.create)
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/signin', failureFlash: 'Invalid email or password.'}), users.session)
  app.get('/users/me', users.me)
  app.get('/users/:userId', users.show)
  
  app.param('userId', users.user)

  //Contributions routes
  var contributions = require('../app/controllers/contributions')
  app.get('/contributions', contributions.all);
  app.get('/contributions/masterview', contributions.masterall);
  app.get('/contributions/getContributionsForUser', contributions.getContributionsForUser);
  app.get('/contributions/userContributionsPercentage', auth.requiresLogin, contributions.userContributionsPercentage);
  app.post('/contributions', auth.requiresLogin, contributions.create);
  app.post('/contributions/updateContributionRating', auth.requiresLogin, contributions.addRating);
  app.get('/contributions/:contributionId', contributions.show);
  app.put('/contributions/:contributionId', auth.requiresLogin, contributions.update);
  app.del('/contributions/:contributionId', auth.requiresLogin, contributions.destroy);
  
  //If contributionId is set in the URL, the contribution object
  //is attached to the request.
  app.param('contributionId', contributions.contribution);

  //Home route
  var index = require('../app/controllers/index')
  app.get('/', index.render)

}
