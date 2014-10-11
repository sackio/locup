'use strict';

var Belt = require('jsbelt')
  , Optionall = require('optionall')
  , Path = require('path')
  , O = new Optionall({'__dirname': Path.resolve('./')})
  , Async = require('async')
  , _ = require('underscore')
  , Locup = new require('../lib/locup.js')(_.extend({'api_key': O.google.server_api_key}, O))
;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['units'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'geocode': function(test) {
    var globals = {};

    return Async.waterfall([
      function(cb){
        globals.address1 = '1600 Pennsylvania Avenue, Washington, DC, US';
        globals.address2 = 'San Francisco, California, US';
        globals.address3 = 'Tokyo, Japan';
        globals.address4 = 'Never-Never Land, Peter Pan, Fictional';
        return cb();
      }
    , function(cb){
        return Locup.geocode(globals.address1, Belt.cs(cb, globals, 'geo1', 1, 0));
      }
    , function(cb){
        return Locup.geocode(globals.address2, Belt.cs(cb, globals, 'geo2', 1, 0));
      }
    , function(cb){
        return Locup.geocode(globals.address3, Belt.cs(cb, globals, 'geo3', 1, 0));
      }
    , function(cb){
        return Locup.geocode(globals.address4, function(err){
          test.ok(err);
          return cb();
        });
      }
    , function(cb){
        test.ok(globals.geo1);
        test.ok(globals.geo2);
        test.ok(globals.geo3);

        return cb();
      }
    , function(cb){
        return Locup.get_coordinates(globals.address1, Belt.cs(cb, globals, 'coords', 1, 0));
      }
    , function(cb){
        return Locup.get_formatted_address(globals.address1, Belt.cs(cb, globals, 'addr', 1, 0));
      }
    , function(cb){
        return Locup.get_components(globals.address1, 'street_number', Belt.cs(cb, globals, 'streetnum', 1, 0));
      }
    , function(cb){
        return Locup.get_components(globals.address3, 'country', Belt.cs(cb, globals, 'country', 1, 0));
      }
    , function(cb){
        test.ok(globals.addr);
        test.ok(globals.coords);
        test.ok(Belt.deepEqual(globals.coords, globals.geo1.geometry.location));
        test.ok(Belt.deepEqual(globals.addr, globals.geo1.formatted_address));
        test.ok(globals.streetnum === '1600');
        test.ok(globals.country === 'Japan');

        return cb();
      }
    , function(cb){
        globals.geo1 = [40.689167, -74.044444];
        return Locup.reverse_geocode(globals.geo1[0], globals.geo1[1], Belt.cs(cb, globals, 'rev1', 1, 0));
      }
    , function(cb){
        test.ok(_.some(globals.rev1, function(r){ return r.formatted_address === '1 Liberty Island, Liberty Island, New York, NY 10004, USA'; }));
        return cb();
      }
    , function(cb){
        return Locup.get_address_components(globals.geo1[0], globals.geo1[1]
               , 'locality', Belt.cs(cb, globals, 'locality', 1, 0));
      }
    , function(cb){
        test.ok(globals.locality[0] === 'New York');
        return cb();
      }
    ], function(err){
      if (err) console.error(err);
      test.ok(!err);
      return test.done();
    });
  },
};
