// var HOST = "http://ranky-magnuslarsen.rhcloud.com/";


var HOST = "http://139.59.211.36";
//var HOST = "http://localhost:3000";

angular.module('starter', ['ionic'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }).factory('Projects', function ($http) {
  function getLastActiveIndex () {
    return parseInt(window.localStorage['lastActiveProject']) || 0;
  }
  return {
    getAll: function ($scope,done) {
      $http.get(HOST + "/api/projects").then(
        function OK(response) {
          $scope.projects = response.data;
          $scope.activeProject = $scope.projects[getLastActiveIndex()];
          done();
        },
        function Error(response) {
          console.log("Error");
        })
    },
    save: function (projects, $scope) {
      $http.post(HOST + "/api/projects", projects).then(
        function ok(res) {
          var project = res.data;
          $scope.projects.push(project);
          $scope.selectProject(project, $scope.projects.length - 1);
        },
        function error(res) {
          console.log("Todo: handle error");
        });
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function (projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: [],
        matches: "test"
      };
    },
    updateProject: function (project) {
      //Todo Handle response, especially for errors (new task is already added to client list)
      $http.put(HOST + "/api/projects", project);
    },
    getLastActiveIndex: getLastActiveIndex,
    setLastActiveIndex: function (index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
}).factory('Players', function ($http) {

  return {
    getAll: function ($scope,done) {
      $http.get(HOST + "/api/players").then(
        function OK(response) {
          $scope.players = response.data;
          done();
        },
        function Error(response) {
          console.log("Error");
        })
    },
    savePlayer: function (players, $scope) {
      $http.post(HOST + "/api/players", players).then(
        function ok(res) {
          var player = res.data;
          $scope.players.push(player);
        //  $scope.selectPlayer(player, $scope.player.length - 1);
        },
        function error(res) {
          console.log("Todo: handle error");
        });
      window.localStorage['players'] = angular.toJson(players);
    },

    newPlayer: function (playerName) {
      // Add a new player
      return {
        name: playerName,
        score: 1000
      };
    },
    updatePlayer: function (match) {

      var kFactor = 32;

      // function EloRatingCalc() {
      //   var winElo = winner.rating;
      //   var loseElo = loser.rating;
      //   var qw = Math.pow(10,(winElo/400));
      //   var ql = Math.pow(10,(loseElo/400));
      //   var lossExpectation = ql/(ql+qw);
      //   winner.rating += parseInt(kFactor*lossExpectation);
      //   loser.rating -= parseInt(kFactor*lossExpectation);
      // };
console.log("score1")
      console.log(match.score1)
      console.log("score2")
      console.log(match.score2)

          if(match.score1 > match.score2){

            combinedRatingWin = (match.player1.score + match.player2.score)/2;
            combinedRatingLose = (match.player3.score + match.player4.score)/2;
            var qw = Math.pow(10,(combinedRatingWin/400));
            var ql = Math.pow(10,(combinedRatingLose/400));
            var lossExpectation = ql/(ql+qw);
            var endresult = parseInt(kFactor*lossExpectation)
            match.player1.score += endresult;
            match.player2.score += endresult;
            match.player3.score -= endresult;
            match.player4.score -= endresult;
            $http.put(HOST + "/api/players", match.player1);
            $http.put(HOST + "/api/players", match.player2);
            $http.put(HOST + "/api/players", match.player3);
            $http.put(HOST + "/api/players", match.player4);
      }else{

            combinedRatingWin = (match.player3.score + match.player4.score)/2;
            combinedRatingLose = (match.player1.score + match.player2.score)/2;
            var qw = Math.pow(10,(combinedRatingWin/400));
            var ql = Math.pow(10,(combinedRatingLose/400));
            var lossExpectation = ql/(ql+qw);
            var endresult = parseInt(kFactor*lossExpectation)
            match.player3.score += endresult;
            match.player4.score += endresult;
            match.player1.score -= endresult;
            match.player2.score -= endresult;
            $http.put(HOST + "/api/players", match.player1);
            $http.put(HOST + "/api/players", match.player2);
            $http.put(HOST + "/api/players", match.player3);
            $http.put(HOST + "/api/players", match.player4);
      }

      //player1
    //  $http.put(HOST + "/api/players", player);


    },


  }
}).factory('Matches', function ($http) {

  return {
    getAll: function ($scope,done) {
      $http.get(HOST + "/api/matches").then(
        function OK(response) {
          $scope.matches = response.data;
          done();
        },
        function Error(response) {
          console.log("Error");
        })
    },
    saveMatch: function (matches, $scope) {
      $http.post(HOST + "/api/matches", matches).then(
        function ok(res) {
          var match = res.data;
          $scope.matches.push(match);
          //  $scope.selectPlayer(player, $scope.player.length - 1);
        },
        function error(res) {
          console.log("Todo: handle error");
        });
      window.localStorage['matches'] = angular.toJson(matches);
    },

    newMatch: function (player1,player2,score1,player3,player4,score2) {
      // Add a new match
      return {
        player1: player1,
        player2: player2,
        score1: score1,
        player3: player3,
        player4: player4,
        score2: score2
      };
    },


  }
})

  .controller('TodoCtrl', function ($scope, $timeout, $ionicModal, Projects, Players, Matches, $ionicSideMenuDelegate,$timeout) {

    // A utility function for creating a new project
    // with the given projectTitle
    var createProject = function (projectTitle) {
      var newProject = Projects.newProject(projectTitle);
      Projects.save(newProject, $scope);
    }

    // A utility function for creating a new Player
    // with the given playerName
    var createPlayer = function (playerName) {
      var newPlayer = Players.newPlayer(playerName);
      Players.savePlayer(newPlayer, $scope);
    }


    // A utility function for creating a new match
    // with the given match
    var createMatch = function (player1,player2,score1,player3,player4,score2) {

      var newMatch = Matches.newMatch(player1,player2,score1,player3,player4,score2);

      Matches.saveMatch(newMatch, $scope);
      Players.updatePlayer(newMatch)
    }



    // Load or initialize projects
    //$scope.projects = Projects.all();
    Projects.getAll($scope,function(){
      if ($scope.projects.length == 0) {
        //Create first project before we can start
        while (true) {
          var projectTitle = prompt('Your first project title:');
          if (projectTitle) {
            createProject(projectTitle);
            break;
          }
        }
      }
    });

    // Load or initialize players
    //$scope.players = Players.all();
    Players.getAll($scope,function(){
      if ($scope.players.length == 0) {
        //Create first project before we can start
        while (true) {
          var playerName = prompt('Your first player:');
          if (playerName) {
            createPlayer(playerName);
            break;
          }
        }
      }
    });

    // Load or initialize matches
    //$scope.matches = matches.all();
    Matches.getAll($scope,function(){

    });



    // Called to create a new project
    $scope.newProject = function () {
      var projectTitle = prompt('Project name');
      if (projectTitle) {
        createProject(projectTitle);
      }
    };

    // Called to create a new Player
    $scope.newPlayer = function () {
      var playerName = prompt('Player name');
      if (playerName) {
        createPlayer(playerName);
      }
    };




    // Called to select the given project
    $scope.selectProject = function (project, index) {
      $scope.activeProject = project;
      Projects.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(false);
  };

    // Called to select the given player
    $scope.selectPlayer = function (player, index) {
      $scope.activePlayer = player;
      Players.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(false);
    };


    // Create our modal
    $ionicModal.fromTemplateUrl('new-task.html', function (modal, Project) {
      $scope.taskModal = modal;
    }, {
      scope: $scope
    });

    // Called to create a new Match
    $scope.newMatch = function (match) {
  console.log("b4")

      if (match.player1,match.player2,match.score1,match.player3,match.player4,match.score2) {

        createMatch(match.player1,match.player2,match.score1,match.player3,match.player4,match.score2);

      }else if((match.player1,match.player2,match.player3,match.player4) && (match.score1 == 0 | match.score2 ==0)){
        createMatch(match.player1,match.player2,match.score1,match.player3,match.player4,match.score2);
      }
      $scope.taskModal.hide();
    };

    //
    // $scope.createTask = function (task) {
    //   if (!$scope.activeProject || !task) {
    //     return;
    //   }
    //   $scope.activeProject.tasks.push({
    //     title: task.title
    //   });
    //
    //   Projects.updateProject($scope.activeProject);
    //
    //
    //   task.title = "";
    // };

    $scope.newTask = function () {
      $scope.taskModal.show();
    };

    $scope.closeNewTask = function () {
      $scope.taskModal.hide();
    }

    $scope.toggleProjects = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  }).filter('range', function() {
  return function(input, min, max) {
    min = parseInt(min); //Make string input int
    max = parseInt(max);
    for (var i=min; i<max; i++)
      input.push(i);
    return input;
  };
});
