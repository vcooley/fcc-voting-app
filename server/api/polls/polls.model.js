'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PollsSchema = new Schema({
  title: String,
  info: String,
  created: {
    type: Date, 
    default: Date.now() 
  },
  active: Boolean,
  author: String,
  participants: {
    type: Array,
    default: []
  },
  choices: Object,
  totalVotes: Number,
  privatePoll: {
    type: Boolean,
    default: false
  },
  anonVotes: {
    type: Boolean,
    default: false
  },
  authorizedVoters: {
    type: Array,
    default: []
  },
  active: {
    type: Boolean,
    default: true
  },
  expiration: {
    type: Number,
    default: 0
  }
  
  
});

module.exports = mongoose.model('Polls', PollsSchema);