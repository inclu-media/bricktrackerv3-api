module.exports = function(Set) {

  Set.getUpdates = function(countryCode, code, lastSynced, cb) {

    var fObj = {
      where: {
        and: [
          { countryCode: countryCode },
          { code: code },
          { or: [{ created: { gt: new Date(lastSynced) }}, { updated: { gt: new Date(lastSynced) }} ]}
        ]
      }
    };

    Set.find(fObj, function(err, sets){
      if (err) {
        Set.app.winston.log('warning', "Set find operation failed.",
          {"msg": err.message, "stack": err.stack});
        return cb(err);
      }
      return cb(null, sets);
    });
  };

  Set.remoteMethod(
    'getUpdates',
    {
      accepts: [
        {arg: 'countryCode', type: 'string', required: true},
        {arg: 'code', type: 'string', required: true},
        {arg: 'lastSynced', type: 'date', required: true}
      ],
      returns: [
        {type: 'array', root: true}
      ],
      http: {path: '/updated', verb: 'post'},
      description: "Gets sets which were updated since the last refresh."
    }
  );

  Set.disableRemoteMethod('create', true);
  Set.disableRemoteMethod('upsert', true);
  Set.disableRemoteMethod('deleteById', true);
  Set.disableRemoteMethod("updateAll", true);
  Set.disableRemoteMethod("updateAttributes", false);
  Set.disableRemoteMethod('createChangeStream', true);
  Set.disableRemoteMethod('findById', true);
  Set.disableRemoteMethod('exists', true);
  Set.disableRemoteMethod('count', true);
};

