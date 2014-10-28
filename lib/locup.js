/*
 * locup
 * https://github.com/sackio/locup
 *
 * Copyright (c) 2014 Ben Sack
 * Licensed under the MIT license.
 */

'use strict';

var Belt = require('jsbelt')
  , _ = require('underscore')
  , Async = require('async')
;

module.exports = function(O){

  var L = {};
  L.settings = Belt.extend({
    'providers': ['google', 'mapquest']
  , 'api_key': O.api_key
  }, O);

  L.providers = _.object(L.settings.providers, _.map(L.settings.providers, function(p){
    return new require('./providers/' + p + '.js')(L.settings);
  }));

  _.each(L.providers, function(p){
    return _.each(p, function(v, k){
      if (L[k] || !_.isFunction(v)) return;

      return L[k] = function(){
        var args = arguments
          , cb, cb_ind, er, rsp;

        _.each(args, function(a, i){
          if (_.isFunction(a)){ cb = a; cb_ind = i; }
          return;
        });
        delete args[cb_ind];

        return Async.eachSeries(L.settings.providers, function(p, _cb){
          if (!L.providers[p][k] || !_.isFunction(L.providers[p][k])) return _cb();

          return L.providers[p][k].apply(L.providers[p], _.values(Belt.extend({}, args, _.object([cb_ind], [function(err, r){
            if (err){ er = err; return _cb(); }

            rsp = r;
            return _cb(r);
          }]))));
        }, function(){
          if (_.isUndefined(rsp) && !er) er = new Error('Result not found');
          return cb(er, rsp);
        });
      };
    });
  });

  /* 
    Slim down address components into a single hash of key-values
  */
  L.address_components_to_obj = function(components, options){
    var o = options || {};
    o = _.defaults(o, {
      'types_index': 0
    , 'name': 'long_name'
    , 'whitelist': false
    });

    var obj = _.object(Belt.deepPluck(components, 'types.' + o.types_index)
                      , _.pluck(components, o.name));

    if (o.whitelist) obj = _.pick(obj, o.whitelist);
    var vals = _.values(obj);
    return vals.length === 1 ? vals[0] : (vals.length === 0 ? undefined : obj);
  };

  return L;

};
