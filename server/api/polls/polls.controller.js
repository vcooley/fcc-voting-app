'use strict';

var _ = require('lodash');
var Polls = require('./polls.model');

// Get list of all polls
exports.index = function(req, res) {
  Polls.find(function (err, polls) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(polls);
  });
};

// Get a single poll
exports.show = function(req, res) {
  Polls.findById(req.params.id, function (err, poll) {
    if(err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    return res.json(poll);
  });
};

// Get a list of polls authored by a user
exports.showOwned = function(req, res) {
  Polls.find({ author: req.params.user }, function (err, polls) {
    if(err) { return handleError(res, err); }
    if(!polls) { return res.status(404).send('Not Found'); }
    return res.json(polls);
  });
};

// Creates a new poll in the DB.
exports.create = function(req, res) {
  Polls.create(req.body, function(err, polls) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(polls);
  });
};

// Updates an existing poll in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Polls.findById(req.params.id, function (err, poll) {
    if (err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    var updated = _.extend(poll, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(poll);
    });
  });
};

exports.vote = function(req, res) {
  Polls.findById(req.params.id, function(err, poll) {
    if (err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    if (poll.participants.indexOf(req.params.user) !== -1) {
      return res.status(403).send('Already voted');
    }
    var votesField = 'choices.' + req.params.vote + '.votes';
    var votesObj = {};
    votesObj[votesField] = 1;
    Polls.findByIdAndUpdate(req.params.id, 
      { $inc: votesObj, 
      $push: {participants: req.params.user} 
      }, 
      function(err, updated) {
        if (err) return handleError(res, err);
        return res.status(200).json(updated);
      });
  });
};

// Deletes a poll from the DB.
exports.destroy = function(req, res) {
  Polls.findById(req.params.id, function (err, poll) {
    if(err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    poll.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

// Deletes a choice from a poll.
exports.removeChoice = function(req, res) {
  Polls.findById(req.params.id, function(err, poll) {
      if(err) { return handleError(res, err); }
      if(!poll) { return res.status(404).send('Not Found'); }
      var allChoices = poll.choices;
      delete allChoices[req.params.choice];
      Polls.findByIdAndUpdate(req.params.id, 
      { $set: {choices: allChoices} }, 
      function(err, updated) {
        if(err) { return handleError(res, err); }
        return res.status(200).send('Successfully deleted');
      });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}