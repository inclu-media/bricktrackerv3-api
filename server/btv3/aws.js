/**
 * Dependencies
 */
var awsApi = require('aws-lib');


/**
 * @constructor
 */
function AWS() {
}

/**
 * Prototype export
 */
var aws = module.exports = {};

/**
 * Sync database with amazon marketplace (get EAN code and pricing info)
 * @param app StrongLoop application object
 */
aws.sync = function(app) {

  var btv3Config   = app.get('btv3');
  var Set          = app.models.set;

  btv3Config.stores.forEach(function(store){
    if (store.hasOwnProperty('awsHost')) {  // not all regions have an Amazon Marketplace

      var awsProdApiClient = awsApi.createProdAdvClient(
        btv3Config.awsAccessKeyID,
        btv3Config.awsSecretAccessKey,
        btv3Config.awsAssociateTag,
        {
          host: store.awsHost
        }
      );

      Set.find({where: {countryCode: store.countryCode}}, function(err, sets){
        if (err == null) {
          sets.forEach(function(aSet) {

            // comment in order to work with all sets
            // e.g. when adding other attributes from aws
            if (aSet.hasOwnProperty('ean') &&
                aSet.hasOwnProperty('asin') &&
                aSet.hasOwnProperty('amazonPageUrl')) {
              return;
            }

            getAWSInfo(aSet, awsProdApiClient)
          });
        }
        else {
          app.winston.log('warning', "Problem connecting to database", {"msg": err.message, "status": err.status});
        }
      });
    }
  });

  function getAWSInfo(aSet, awsProdApiClient) {

    awsProdApiClient.call("ItemSearch",
      {
        SearchIndex: "Toys",
        Keywords: aSet.code + " " + aSet.name,
        Availability: "Available",
        Sort: "price",
        ResponseGroup: "ItemAttributes"
      },
      function(err, result) { // result holds the AWS search results -> inspect for more AWS attribs.
        if (err == null) {
          if (result.Items.hasOwnProperty('Item')) {
            var setList = result.Items.Item;
            for (var x=0; x<setList.length; x++) {
              var awsSet = setList[x];
              var awsSetAttr = awsSet.ItemAttributes;
              if (awsSetAttr.hasOwnProperty('MPN') && awsSetAttr.MPN.localeCompare(aSet.code) == 0) {

                aSet.ean = awsSetAttr.EAN;
                aSet.asin = awsSet.ASIN;
                aSet.amazonPageUrl = awsSet.DetailPageUrl;

                aSet.save(function(err) {
                  if (err == null) {
                    app.winston.log('info', 'Amazon Sync Match', {"code": aSet.code, "ASIN": awsSet.ASIN});
                  }
                  else {
                    app.winston.log('warning', 'Amazon data could not be saved to set', {"msg": err.message, "status": err.status});
                  }
                });
                break;
              }
            }
          }
        }
        else {
          app.winston.log('warning', 'Problems retrieving results from Amazon PA API', {"msg": err.message, "status": err.status});
        }
     })

  }
};
