'use strict';

var express = require('express');
var controller = require('./polls.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/user/:user', controller.showOwned);
router.post('/', controller.create);
router.post('/:id/:vote/:user', auth.isAuthenticated(), controller.vote);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.delete('/:id/:choice', auth.isAuthenticated(), controller.removeChoice);

module.exports = router;