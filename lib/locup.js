/*
 * locup
 * https://github.com/sackio/locup
 *
 * Copyright (c) 2014 Ben Sack
 * Licensed under the MIT license.
 */

'use strict';

var Belt = require('jsbelt')
  , _ = require('underscore');

module.exports = function(O) {

  var L = {};
  L.settings = Belt.extend({
    'provider': 'google'
  , 'api_key': O.api_key
  }, O);

  L._api = new require('./providers/' + L.settings.provider + '.js')(L.settings);

  _.extend(L, _.omit(L._api, ['settings']));

  return L;

};
