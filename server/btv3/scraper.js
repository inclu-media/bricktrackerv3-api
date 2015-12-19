/**
 * Dependencies
 */
var Xray = require('x-ray');

/**
 * Constants
 */
const STRING_RETIRED = "Retired product";
const KEYS  = ["id", "name", "countryCode", "code", "storeUrl", "thumbUrl", "ean", "created", "updated"];

/**
 * @constructor
 */
function Scraper() {
}

/**
 * Prototype export
 */
var scraper = module.exports = {};

/**
 * Sync database with lego online stores
 * @param app StrongLoop application object
 */
scraper.sync = function(app) {

  var btv3Config   = app.get('btv3');
  var xStore       = Xray();
  var PushModel    = app.models.push;
  var Notification = app.models.notification;
  var db           = app.dataSources.btv3mongo;
  var Set          = app.models.set;

  btv3Config.stores.forEach(function(store){
    xStore('http://search-en.lego.com/?cc=' + store.countryCode + '&count=9999', '.product-thumbnail',[{
      name:           'a.thumbcont@title',
      code:           '.item-code',
      storeUrl:       'a.thumbcont@href',
      thumbUrl:       'a.thumbcont img@src',
      avNow:          'li.availability-now em',
      avFuture:       'li.availability-future em',
      avQuestionable: 'li.availability-questionable em',
      rating:         'div.product-rating@rating',
      price:          'h4 ~ ul li em',
      priceWas:       'li.was-price em',
      priceNow:       'li.now-price em',
      badges:         'ul#product-badges li'
    }])(function(err, sets) {
      if (null == err) {
        processSets(sets, store.countryCode);
      }
      else {
        app.winston.log('warning', 'Problems parsing store scrapes', {"msg": err.message, "stack": err.stack});
      }
    });
  });


  function processSets(sets, countryCode) {
    sets.forEach(function(aSet) {

      // skip 'empty' sets (e.g. Pick a Brick)
      if (!aSet.hasOwnProperty('name') && !aSet.hasOwnProperty('code')) {
        return;
      }

      // add country code
      aSet.countryCode = countryCode;

      // remove price for retired sets
      if (aSet.hasOwnProperty('price') && aSet.price.localeCompare(STRING_RETIRED) == 0) {
        delete aSet.price;
      }

      // strip ?$leaf$ from image url
      if (aSet.hasOwnProperty('thumbUrl')) {
        aSet.thumbUrl = aSet.thumbUrl.slice(0, -7);
      }

      // strip whitespaces from prices
      if (aSet.hasOwnProperty('price')) {
        aSet.price =  aSet.price.replace(/(\s|\t|\n)/g, "");
      }
      if (aSet.hasOwnProperty('priceWas')) {
        aSet.priceWas =  aSet.priceWas.replace(/(\s|\t|\n)/g, "");
      }
      if (aSet.hasOwnProperty('priceNow')) {
        aSet.priceNow =  aSet.priceNow.replace(/(\s|\t|\n)/g, "");
      }

      // insert or update model
      upsertSet(aSet);
    });
  }

  function upsertSet(aSet) {

    Set.find({where: {and: [{countryCode: aSet.countryCode}, {code: aSet.code}]}}, function (err, sets) {
      if (null == err) {

        // set already exists in db, update it if necessary
        if (null != sets && sets.length == 1) {
          var oldSet = sets[0];
          if (!equals(oldSet, aSet)) {

            // transfer important attributes
            aSet.created = oldSet.created;
            aSet.updated = new Date();
            if (oldSet.hasOwnProperty("ean")) {
              aSet.ean = oldSet.ean;
            }

            // delete old set and create a new one (rather than update)
            (function(oldSet) {
              Set.create(aSet, function (err, theSet) {
                if (err != null) {
                  app.winston.log('warning', "Error creating update set in database",
                    {"msg": err.message, "stack": err.stack});
                }
                else {
                  app.winston.log('info', 'Database', {
                    "msg": "Set updated",
                    "code": theSet.code,
                    "name": theSet.name,
                    "countryCode": theSet.countryCode
                  });
                  var tmpOldSet = oldSet;
                  Set.destroyById(oldSet.id, function(err) {
                    if (err) {
                      app.winston.log('warning', "Error deleting set from database after update",
                        {"msg": err.message, "status": err.status});
                    }
                    else {
                      sendPush(tmpOldSet, theSet);
                    }
                  });

                }
              });
            })(oldSet);
          }
        }

        // set does not exist yet, insert it
        else {
          aSet.created = new Date();
          Set.create(aSet, function(err, theSet){
            if (err != null) {
              app.winston.log('error', "Problems creating a new set in the database",
                {"msg": err.message, "stack": err.stack});
            }
            else {
              app.winston.log('info', 'Database', {
                "msg": "New set added",
                "code": theSet.code,
                "name": theSet.name,
                "countryCode": theSet.countryCode
              });
            }
          });
        }

      }
      else {
        app.winston.log('warning', "Problems connecting to database", {"msg": err.message, "status": err.status});
      }
    });
  }

  function sendPush(oldSet, newSet) {

    var setNotification = new Notification({});
    var setString = oldSet.code + "@" + oldSet.countryCode;
    var setQuery = {
      subscriptions: {inq: [setString]}
    };

    PushModel.notifyByQuery(setQuery, setNotification, function(err){
      if (err) {
        app.winston.log('warning', "Sending push notifications failed", {"msg": err.message, "status": err.status});
      }
      else {
        app.winston.log('info', 'Push Notification', {
          "msg": "Push notification send",
          "payload": setString
        });
      }
    });

    PushModel.on('error', function(err) {
      app.winston.log('warning', "Sending push notifications failed", {"msg": err.message, "stack": err.stack});
    });
  }

  function equals(oldSet, newSet) {
    var objOld = JSON.parse(JSON.stringify(oldSet));
    var objNew = JSON.parse(JSON.stringify(newSet));

    var keys = KEYS;
    for (var x = 0; x < keys.length; x++) {
      if (objOld.hasOwnProperty(keys[x])) {
        delete objOld[keys[x]];
      }
      if (objNew.hasOwnProperty(keys[x])) {
        delete objNew[keys[x]];
      }
    }
    return JSON.stringify(objOld) === JSON.stringify(objNew);
  }

};








