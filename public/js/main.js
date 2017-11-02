var tournamentId
jQuery.ajax({
    url: '/tournaments',
    success: function (result) {
        tournamentId = result.tournaments[0]._id
    },
    async: false
});

console.log("Using tournamentId: " + tournamentId)

var fussBallApp = angular.module('fussBallApp', ['ngRoute']);
fussBallApp.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: './views/scores.html',
            controller: 'mainController'
        })

        .when('/games', {
            templateUrl: './views/games.html',
            controller: 'gameController'
        })

        .when('/help', {
            templateUrl: './views/help.html'
        })

        .when('/rules', {
            templateUrl: './views/rules.html'
        })
        ;

});

fussBallApp.controller('mainController', ['$scope', '$http', function ($scope, $http) {
    $scope.loaded = false
    $http.get('/tournaments/' + tournamentId + '/views/scoreboard', headers()).
        then(function (response) {
            $scope.loaded = true
            $scope.scoreBoard = response.data.scores;
        });

}]);

fussBallApp.controller('gameController', ['$scope', '$http', function ($scope, $http) {
    $scope.loaded = false
    $http.get('/tournaments/' + tournamentId, headers()).
        then(function (response) {
            $scope.loaded = true
            $scope.games = response.data.games;
        });

    $scope.markDirty = function (game) {
        game.isDirty = true
    }

    $scope.submitScore = function (game) {
        delete game.isDirty
        $http.put('/tournaments/' + tournamentId + '/games/' + game.id, game), headers().
            then(function (response) {
                // nothing to do here!
            })
    }
}]);

function headers() {
    return {
        headers: { 'Cache-Control': 'no-cache' }
    }
}