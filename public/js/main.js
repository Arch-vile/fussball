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

        .when('/changelog', {
            templateUrl: './views/changelog.html',
            controller: 'changeLogController'
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

fussBallApp.controller('changeLogController', ['$scope', '$http', function ($scope, $http) {
    $scope.loaded = false
    $http.get('https://api.github.com/repos/arch-vile/fussball/commits?per_page=50').
        then(function (response) {
            $scope.loaded = true
            $scope.commits = response.data;
        });
    $scope.commitFilter = function(commit)   { 
        return commit.commit.message.toLowerCase().includes('feature') || commit.commit.message.toLowerCase().includes('bugfix')
    }
}]);

fussBallApp.controller('gameController', ['$scope', '$http', function ($scope, $http) {
    $scope.loaded = false
    $http.get('/tournaments/' + tournamentId, headers()).
        then(function (response) {
            $scope.loaded = true
            $scope.pendingGames = _.filter(response.data.games, function(game) { 
                return !(game.team1Score && game.team2Score);
             });
            $scope.completedGames = _.difference(response.data.games, $scope.pendingGames);
        });

    $scope.submitScore = function (game) {
        $http.put('/tournaments/' + tournamentId + '/games/' + game.id, game, headers()).
            then(function (response) {
                $scope.pendingGames = _.without($scope.pendingGames, game);
                $scope.completedGames.push(response.data);
            })
    }
}]);

function headers() {
    return {
        headers: { 'Cache-Control': 'no-cache' }
    }
}