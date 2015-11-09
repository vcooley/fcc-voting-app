'use strict';

angular.module('workspaceApp')

  .service('sharedPoll', function() {
    // Service to share a poll between chart and dashboard controllers
    var poll = {};
    return {
      getPoll: function() {
        return poll;
      },
      setPoll: function(newPoll) {
        poll = newPoll;
      }
    };
  })
  
  .controller('DashboardCtrl', function ($scope, $http, Auth, sharedPoll) {
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.message = '';
    $scope.title = '';
    $scope.choices = ['', ''];
    $scope.polls = [];
    $scope.selIndex = 0;
    $scope.editMode = false;
    $scope.chartCreated = false;
    
    var i;

    // Add an option to the current poll
    $scope.addChoice = function() {
      for(i = 0; i < $scope.choices.length; i++){
        if($scope.choices[i] === '') {
          $scope.message = "Enter a value for all choices first.";
          return;
        }
      }
      $scope.message = '';
      $scope.choices.push('');
    };
    
    // Validate and add poll to database
    $scope.addPoll = function(form) {
      if ($scope.title === '') {
        $scope.message = 'You must enter a title for your poll.';
        return;
      }
      var numChoices = 0;
      for (i=0; i<$scope.choices.length; i++) {
        if ($scope.choices[i] !== '') {
          numChoices++;
        }
        if ($scope.choices.indexOf($scope.choices[i]) !== i) {
          $scope.message = 'All of your choices must be different.';
          return;
        }
      }
      if (numChoices < 2) {
        $scope.message = 'You must have at least two options in your poll.';
        return;
      }
      var pollChoices = {};
      for (i=0; i<$scope.choices.length; i++) {
        if($scope.choices[i] !== '') {
          pollChoices[$scope.choices[i]] = {
            votes: 0,
            voters: []
          };
        }
      }
      $http.post('/api/polls', {
        title: $scope.title,
        author: $scope.getCurrentUser(),
        info: '',
        active: true,
        choices: pollChoices,
        totalVotes: 0
      }).
      success(function(poll) {
        $scope.title = '';
        $scope.choices = ['', ''];
        $scope.message = 'Successfully submitted poll.';
      });
    };

    // Refresh poll options
    $scope.updatePoll = function() {
      // Update currently selected poll. To be called every time poll is changed
      // or when poll is synced to database 
      if (!$scope.polls[$scope.selIndex]) { $scope.selIndex = 0; }
      $scope.selected = $scope.polls[$scope.selIndex];
      if($scope.selected && $scope.selected.choices) {
        $scope.voteOptions = Object.keys($scope.selected.choices);
      }
      else { $scope.voteOptions = []; }
      return $scope.voteOptions;
    };
    
    // Check if next button should be enabled
    $scope.checkNext = function() {
      if($scope.polls[$scope.selIndex + 1]) {
        return true;
      }
      else return false;
    };
    
    // Check if back button should be enabled
    $scope.checkBack = function() {
      if($scope.polls[$scope.selIndex - 1]) {
        return true;
      }
      else return false;
    };
    
    // Submit a vote on the selected poll
    $scope.addVote = function(vote) {
      var id = $scope.selected._id;
      var user = $scope.getCurrentUser()._id;
      $http.post('/api/polls/' + id + '/' + vote + '/' + user + '/').
        then(function successCallback(res) {
          // Should update poll somehow
          $scope.selected = res.body;
        }, function errorCallback(res) {
          if (res.status === 404) {
            $scope.message = 'That poll wasn\'t found';
          }
          else if (res.status === 403) {
            $scope.message = 'You have already voted on this poll.';
          }
          else { $scope.message = 'There was some problem with voting.'; }
        });
        
    };
    
    // Check if the user has voted on the selected poll
    $scope.voted = function() {
      var poll = $scope.selected;
      var participants = poll.participants;
      if (!poll || !participants) { 
        poll = {};
        participants = [];
      }
      if (participants.indexOf($scope.getCurrentUser()._id) === -1) {
        return false;
      }
      return true;
    };
    
    // Navigate to the next poll
    $scope.nextPoll = function() {
      $scope.selIndex++;
      $scope.updatePoll();
      $scope.chart();
    };
    
    // Navigate to the previous poll
    $scope.backPoll = function() {
      $scope.selIndex -= 1;
      $scope.updatePoll();
      $scope.chart();
    };
    
    // Toggle edit mode
    $scope.toggleEdit = function() {
      $scope.editMode = !$scope.editMode;
    };
    
    // Turn edit mode off. For use when navigating to browse polls tabs while
    // edit mode may be on from my polls tab.
    $scope.editOff = function() {
      $scope.editMode = false;
    };
    
    // Delete an entire poll
    $scope.deletePoll = function() {
      var id = $scope.selected._id;
      $http.delete('/api/polls/' + id + '/').then(
          function successCallback(res) {
          $scope.message = 'Poll deleted.';
          $scope.getPolls($scope.getCurrentUser());
        }, function errorCallback(res) {
          $scope.message = 'Poll was not deleted.';
        }
      );
    };
    
    // Delete a choice in a poll
    $scope.deleteChoice = function(choice) {
      var id = $scope.selected._id;
      $http.delete('api/polls/' + id + '/' + choice).
      then(
        function successCallback(res){
          $scope.updatePoll();
        },
        function errorCallback(res) {
          
        }
      );
    };
    
    // Add a choice to a poll
    $scope.newChoice = function(choice) {
      console.log($scope.selected);
      if (choice === '') {
        $scope.message = "Enter a valid choice.";
        return;
      }
      if($scope.selected.choices) {
        var allChoices = Object.keys($scope.selected.choices);
      }
      else { allChoices = []; } 
      if (allChoices.indexOf(choice) !== -1) {
        $scope.message = "All choices must be different.";
        return;
      }
      if (!$scope.selected.choices) {
        $scope.selected.choices = {};
      }
      $scope.selected.choices[choice] = {votes: 0, voters: []};
      $http.put('/api/polls/' + $scope.selected._id, $scope.selected).
      then(function successCallback(res) {
        $scope.message = 'Succssfully added choice to poll.';
      }, function errorCallback(res) {
        $scope.message = 'Did not add choice to poll. Something went wrong.';
      });
    };
    
    // Chart results of selected poll
    $scope.chart = function() {
      var poll = $scope.selected;
      $scope.chartCreated = false;
      try {
        $scope.labels = Object.keys(poll.choices);
      }
      catch (e) {
        $scope.labels = [];
      }
      $scope.type = "Pie";
      $scope.data = [];
      for(var i=0; i<$scope.labels.length; i++) {
        var choice = $scope.labels[i];
        var votes = poll.choices[choice]['votes'];
        if (votes) { $scope.chartCreated = true; }
        $scope.data.push(votes);
      }
      $scope.toggle = function() {
        $scope.type = $scope.type === 'Pie' ? 'PolarArea' : 'Pie';
      };
    };
      
    // Get all of a user's polls or all polls in database (for browse view)
    // if null is passed as user argument.
    $scope.getPolls = function(user) {
      var endpoint;
      if (user) { endpoint = '/api/polls/user/' + user._id; }
      else { endpoint = '/api/polls/'; }
      $http.get(endpoint).success(function(polls) {
        $scope.polls = polls;
        $scope.selected = polls[$scope.selIndex];
        $scope.updatePoll();
        $scope.chart();
      });
    };
    
  });
  
  