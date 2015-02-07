'use strict';

var app = require('../app');
var express = require('express');
var router = express.Router();
var url = require('url');
var shopifyAPI = require('shopify-node-api');

/*
 * Get /
 *
 * render the main app view
 */
router.get('/', function(req, res) {
  if (!req.session.shopUrl) {
    var parsedUrl = url.parse(req.originalUrl, true);
    if (parsedUrl.query && parsedUrl.query.shop) {
      req.session.shopUrl = 'https://' + parsedUrl.query.shop;
      req.session.shopHostname = parsedUrl.query.shop;
    }
    return res.redirect('/');
  }
  res.render('app/index', {
    title: app.nconf.get('app:name'),
    apiKey: app.nconf.get('oauth:api_key'),
    shopUrl: req.session.shopUrl
  });

  //var Shopify = new shopifyAPI({
  //  shop: req.session.shopHostname,
  //  access_token: req.session.oauth_access_token
  //});
  //
  //Shopify.get('/admin/products.json', function (err, data, headers) {
  //  console.log('/admin/products.json');
  //  console.log(err);
  //  console.log(data);
  //  console.log(headers);
  //
  //  res.render('app_view', {
  //    title: app.nconf.get('app:name'),
  //    apiKey: app.nconf.get('oauth:api_key'),
  //    shopUrl: req.session.shopUrl
  //  });
  //});
});

router.get('/subsection', function(req, res) {
  res.render('app/subsection', {
    title: app.nconf.get('app:name'),
    apiKey: app.nconf.get('oauth:api_key'),
    shopUrl: req.session.shopUrl
  });


});
module.exports = router;