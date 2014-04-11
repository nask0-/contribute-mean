window.angular.module('ngff.services.contributions', [])
  .factory('Contributions', ['$resource',
    function($resource){
      return $resource(
        'contributions/:contributionId',
        {
          contributionId:'@_id'
        },
        {
          update: {method: 'PUT'}
        }
      )
    }
  ]);