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
        Contributions.query(query, function(contributions){
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
      ]
        
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
          if($scope.levels[level-1].value < score){
            break;
          }

          level--;
        }
        console.log(level);
        return $scope.levels[level-1].name;
      }

    }])
.controller('MasterViewController', ['$scope','$routeParams','$location','Global','Contributions','$http',
    function ($scope, $routeParams, $location, Global, Contributions, $http) {
      $scope.global = Global;
      
 

      $scope.find = function(query){
        Contributions.query(query, function(contributions){
          $scope.contributions = contributions;
        });
      }

      $scope.findAll = function(){
        $http.get('/contributions/masterview').success(function(data){
          $scope.userContributions = data;
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

    }]);;