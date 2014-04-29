window.angular.module('ngff.controllers.contributions', [])
  .controller('ContributionsController', ['$scope','$routeParams','$location','Global','Contributions','$http',
    function ($scope, $routeParams, $location, Global, Contributions, $http) {
      $scope.global = Global;
      
      $scope.create = function(){
        var contribution = new Contributions({
          title: this.contribution.title,
          description: this.contribution.description,
          population_impact: this.contribution.population_impact,
          done_before: this.contribution.done_before,
          complete: this.contribution.complete,
          duration: this.contribution.duration
        })

        contribution.$save(function(response){
          $location.path("contributions/" + response._id);
        })

        this.contribution.name = "";
      };
 
      //Find all of the user's contributions and get statistics
      $scope.initDashboard = function(query){
        
        /*
        Contributions.query(query, function(contributions){
          $scope.contributions = contributions;
        });
        */
        Contributions.query({orderBy: 'date'}, function(contributions){
          $scope.contributions = contributions;
        });

        $http.get('/contributions/userContributionsPercentage')
        .success(function(data){
          var contributionScore = data.numberOfContributions.user / data.numberOfContributions.total;
          contributionScore = +contributionScore.toFixed(2);
          $scope.contributionScore = Math.floor(contributionScore*100) + "% of all contributions";

          var scoreDistribution = data.scoreDistribution.user / data.scoreDistribution.total;
          scoreDistribution = +scoreDistribution.toFixed(2);
          $scope.scoreDistribution = Math.floor(scoreDistribution*100) + "% of all contributions";

          $scope.level = getLevel(data.scoreDistribution.user);
          
          $scope.pieChartContributionScore = [
            {"name" : Global.currentUser().name, "score" : data.numberOfContributions.user}, 
            {"name" : "Rest of team", "score" : (data.numberOfContributions.total - data.numberOfContributions.user)}
          ];
          
          $scope.pieChartScoreDistribution = [
            {"name" : Global.currentUser().name, "score" : data.scoreDistribution.user}, 
            {"name" : "Rest of team", "score" : (data.scoreDistribution.total - data.scoreDistribution.user)}
          ];
        })
      }

      var sortBy = 'date';
      var sortDesc = -1;

      $scope.changeSorting = function(sorting){
        if(sortBy == sorting) sortDesc = (-1) * (sortDesc);
        sortBy = sorting;

        Contributions.query({orderBy: sorting, sortDesc: sortDesc}, function(contributions){
          $scope.contributions = contributions;
        });
      }

      $scope.findOne = function(){
        Contributions.get({ contributionId: $routeParams.contributionId }, function(contribution){
          $scope.contribution = contribution;
        });
      }

      $scope.update = function () {
        var contribution = $scope.contribution;
        contribution.$update(function () {
          $location.path('contributions/' + contribution._id);
        });
      }

      $scope.destroy = function (contribution) {
        var confirmDelete = confirm("Are you sure you wish to delete?");
        if(!confirmDelete) return;
        contribution.$remove();
        for (var i in $scope.contributions) {
          if ($scope.contributions[i] == contribution) {
            $scope.contributions.splice(i, 1)
          }
        }
      };
      


      /* Form options */

      $scope.population_impacts = [
        {name:'Up to 20 people', value:'1'},
        {name:'20-100 people', value:'2'},
        {name:'100+ people', value:'3'}
      ];

      $scope.done_befores = [
        {name:'Yes', value:'1'},
        {name:'Yes, different context', value:'2'},
        {name:'No', value:'3'}
      ];

      $scope.completeds = [
        {name:'No', value:'1'},
        {name:'Yes', value:'2'},
      ];

      $scope.durations = [
        {name:'< 1 week', value:'1'},
        {name:'< 2 weeks', value:'2'},
        {name:'< 3 weeks', value:'3'},
        {name:'< 4 weeks', value:'4'},
        {name:'< 5 weeks', value:'5'},
        {name:'< 6 weeks', value:'6'},
        {name:'< 7 weeks', value:'7'},
        {name:'< 8 weeks', value:'8'},
        {name:'< 9 weeks', value:'9'},
        {name:'< 10 weeks', value:'10'}
      ];


      $scope.levels = [
        {name:'Level 1', value:30},
        {name:'Level 2', value:60},
        {name:'Level 3', value:90},
        {name:'Level 4', value:140},
        {name:'Level 5', value:200}
      ];

           
      $scope.valueToText = function(val, type){
        for(var i = 0; i < $scope[type].length; i++){
          if($scope[type][i].value === val){
            return $scope[type][i].name;
          }
        }
        return ""
      }


      $scope.cancelToContributions = function(){
        var confirmCancel = confirm("Are you sure you wish to cancel?");
        if(confirmCancel)
          $location.path("/#!/contributions");
      }

      var getLevel = function(score){
        var level = $scope.levels.length;
        while(level > 0){
          if(parseInt($scope.levels[level-1].value) < parseInt(score)){
            return $scope.levels[level].name;
            break;
          }


          level--;
        }

        return "Level 1";
      }

    }])
.controller('MasterViewController', ['$scope','$routeParams','$location','Global','Contributions','$http',
  function ($scope, $routeParams, $location, Global, Contributions, $http) {
    $scope.global = Global;
    var sortBy = "date";
    var sortDesc = 1;


    $scope.find = function(query){
      Contributions.query(query, function(contributions){
        $scope.contributions = contributions;
      });
    }

    $scope.findAll = function(){
      $http.get('/contributions/masterview').success(function(data){
        $scope.userContributions = data;


        //Now flag all contributions we already ranked
        for(var i=0; i<$scope.userContributions.length; i++){
          for(var z=0; z<$scope.userContributions[i].contributions.length; z++){
            if($scope.userContributions[i].contributions[z].rating != null){
              for(var j=0; j<$scope.userContributions[i].contributions[z].rating.length; j++){
                if($scope.userContributions[i].contributions[z].rating[j]["by_user"] == Global.currentUser()._id){
                  $scope.userContributions[i].contributions[z].rating["read_only"] = true;
                  $scope.userContributions[i].contributions[z].rating["read_only_score"] = $scope.userContributions[i].contributions[z].rating[j].rate;
                }  
              }
            }
          }
          
        }
        


      }).error(function(data){
        alert("Error receiving data from server");
      })
    }

    $scope.findOne = function(){
      Contributions.get({ contributionId: $routeParams.contributionId }, function(contribution){
        $scope.contribution = contribution;
      });
    }

    $scope.update = function () {
      var contribution = $scope.contribution;
      contribution.$update(function () {
        $location.path('contributions/' + contribution._id);
      });
    }

    $scope.saveRating = function (contribution, rating, uindex, cindex) {
      $http({
        url: '/contributions/updateContributionRating',
        method: 'POST',
        data: {contribution: contribution, user: Global.currentUser(), rating: rating}
      })
      .success(function(result){
        $scope.userContributions[uindex].contributions[cindex].score = parseInt(result);
        console.log($scope.userContributions[uindex].contributions[cindex]);
      });
    }

    $scope.changeSorting = function(sorting, user, i){
      if(sortBy == sorting) sortDesc = (-1) * (sortDesc);
      sortBy = sorting;

      $http.get('/contributions/getContributionsForUser',{ params: {orderBy: sorting, sortDesc: sortDesc, user: user} }).success(function(result){
        $scope.userContributions[i].contributions = result.contributions;
      });
    }



    /* Form options */

    $scope.population_impacts = [
      {name:'Up to 20 people', value:'1'},
      {name:'20-100 people', value:'2'},
      {name:'100+ people', value:'3'}
    ];

    $scope.done_befores = [
      {name:'Yes', value:'1'},
      {name:'Yes, different context', value:'2'},
      {name:'No', value:'3'}
    ];

    $scope.completeds = [
      {name:'No', value:'1'},
      {name:'Yes', value:'2'},
    ];

    $scope.durations = [
      {name:'< 1 week', value:'1'},
      {name:'< 2 weeks', value:'2'},
      {name:'< 3 weeks', value:'3'},
      {name:'< 4 weeks', value:'4'},
      {name:'< 5 weeks', value:'5'},
      {name:'< 6 weeks', value:'6'},
      {name:'< 7 weeks', value:'7'},
      {name:'< 8 weeks', value:'8'},
      {name:'< 9 weeks', value:'9'},
      {name:'< 10 weeks', value:'10'}
    ];

      $scope.rate = 7;
      $scope.max = 10;
      $scope.isReadonly = false;

      $scope.hoveringOver = function(value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
      };

      $scope.ratingStates = [
        {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
        {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
        {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
        {stateOn: 'glyphicon-heart'},
        {stateOff: 'glyphicon-off'}
      ];

      
    $scope.valueToText = function(val, type){
      for(var i = 0; i < $scope[type].length; i++){
        if($scope[type][i].value === val){
          return $scope[type][i].name;
        }
      }
      return ""
    }


    $scope.cancelToContributions = function(){
      var confirmCancel = confirm("Are you sure you wish to cancel?");
      if(confirmCancel)
        $location.path("/#!/contributions");
    }






          //TEST

  $scope.rate = 7;
  $scope.max = 10;
  $scope.isReadonly = false;


  $scope.ratingStates = [
    {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
    {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
    {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
    {stateOn: 'glyphicon-heart'},
    {stateOff: 'glyphicon-off'}
  ];

  }]);