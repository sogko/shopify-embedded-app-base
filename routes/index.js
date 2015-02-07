'use strict';

var app = require('../app');
var express = require('express');
var router = express.Router();
var url = require('url');
var shopifyAPI = require('shopify-node-api');

/*
 * Get /
 *
 * if we already have an access token then
 * redirect to render the app, otherwise
 * redirect to app authorisation.
 */
router.get('/', function(req, res) {
  if (!req.session.oauth_access_token) {
    var parsedUrl = url.parse(req.originalUrl, true);
    if (parsedUrl.query && parsedUrl.query.shop) {
      req.session.shopUrl = 'https://' + parsedUrl.query.shop;
      req.session.shopHostname = parsedUrl.query.shop;
    }
    res.redirect('/auth');
  }
  else {
    res.redirect('/app');
  }
});


module.exports = router;