var tournamentId;
jQuery.ajax({
  url: "/tournaments",
  success: function(result) {
    tournamentId = result.tournaments[0]._id;
  },
  async: false
});

console.log("Using tournamentId: " + tournamentId);

var fussBallApp = angular.module("fussBallApp-kiosk", ["ngRoute"]);
fussBallApp.config(function($routeProvider) {
  $routeProvider.when("/", {
    templateUrl: "./views/scores.html",
    controller: "mainController"
  });
});

fussBallApp.controller("mainController", [
  "$scope",
  "$http",
  function($scope, $http) {
    $scope.loaded = false;
    $http
      .get("/tournaments/" + tournamentId + "/views/scoreboard", headers())
      .then(function(response) {
        $scope.loaded = true;
        $scope.scoreBoard = response.data.scores;
      });
  }
]);

function headers() {
  return {
    headers: { "Cache-Control": "no-cache" }
  };
}
