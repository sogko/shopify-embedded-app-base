'use strict';

var app = require('../app');
var router = require('express').Router();
var OAuth = require('oauth').OAuth2;
var url = require('url');

var shopifyOAuth = function (shopUrl) {
  return new OAuth(
    app.nconf.get('oauth:api_key'),
    app.nconf.get('oauth:client_secret'),
    shopUrl,
    '/admin/oauth/authorize',
    '/admin/oauth/access_token');
};

/*
 * Get /
 *
 * initiates the Shopify App authorisation
 */
router.get('/', function(req, res) {
  if (!req.session.oauth_access_token) {
    res.redirect('/auth/escape_iframe');
  } else {
    res.redirect('/app');
  }
});

/*
 * Get /escape_iframe
 *
 * renders a view that contains javascript
 * which will change the browser top window
 * location to start the oauth process
 *
 * See http://docs.shopify.com/embedded-app-sdk/getting-started#oauth
 */
router.get('/escape_iframe', function(req, res) {
  res.render('auth/escape_iframe');
});

/*
 * Get /authorized_url
 *
 * gets the temporary token which we can exchange
 * for a permanent token. User may be prompted to accept
 * the scope being requested
 */
router.get('/authorized_url', function(req, res) {
  var redirectUrl = shopifyOAuth(req.session.shopUrl).getAuthorizeUrl({
    redirect_uri: app.nconf.get('oauth:redirect_url'),
    scope: app.nconf.get('oauth:scope')
  });
  res.redirect(redirectUrl);
});

/*
 * Get /access_token
 *
 * get the permanent access token which is valid
 * for the lifetime of the app install, it does
 * not expire
 */
router.get('/access_token', function(req, res) {
  var parsedUrl = url.parse(req.originalUrl, true);

  shopifyOAuth(req.session.shopUrl).getOAuthAccessToken(
    parsedUrl.query.code, {},
    function (error, accessToken /*, refreshToken */) {
      if (error) {
        res.status(403);
        res.render('noentry', {title: app.nconf.get('app:title')});
      } else {
        req.session.oauth_access_token = accessToken;
        res.redirect('/app');
      }
    }
  );
});


module.exports = router;