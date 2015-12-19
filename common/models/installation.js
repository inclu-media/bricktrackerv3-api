module.exports = function(Installation) {

  /**
   * Subcribe for push notifications
   * @param gcmToken
   * @param setCode "new", "all" or a set code
   * @param setCountryCode
   * @param cb
   */
  Installation.subscribe = function(gcmToken, setCode, setCountryCode, cb) {
    Installation.find({where: {deviceToken: gcmToken}}, function(err, installs){
      if (err) {
        return cb(err);
      }
      if (installs.length != 1) {
        return cb(new Error("Subscription attempt for unregistered app"));
      }

      var install = installs[0];
      var subString = setCode + '@' + setCountryCode;
      if (!install.subscriptions) {
        install.subscriptions = [];
      }
      if (install.subscriptions.indexOf(subString) == -1) {
        install.subscriptions.push(subString);
        install.save(function(err){
          if (err) {
            return cb(err);
          }
        });
      }
      cb();
    });
  };

  /**
   * Unsubscribe from push notifications
   * @param gcmToken
   * @param setCode "new", "all" or a set code.
   * @param setCountryCode
   * @param cb
   */
  Installation.unsubscribe = function(gcmToken, setCode, setCountryCode, cb) {
    Installation.find({where: {deviceToken: gcmToken}}, function(err, installs) {
      if (err) {
        return cb(err);
      }
      if (installs.length != 1) {
        return cb(new Error("Unubscription attempt for unregistered app"));
      }

      var install = installs[0];
      var subString = setCode + '@' + setCountryCode;
      if (install.subscriptions) {
        var pos = install.subscriptions.indexOf(subString);
        if (pos > -1) {
          var tmpArr = install.subscriptions;
          install.subscriptions.splice(pos, 1);
          install.save(function (err) {
            if (err) {
              return cb(err);
            }
          });
        }
      }
      cb();
    });
  };

  Installation.remoteMethod(
    'subscribe',
    {
      accepts: [
        {arg: 'gcmToken', type: 'string', required: true},
        {arg: 'setCode', type: 'string', required: true},
        {arg: 'setCountryCode', type: 'string', required: true}
      ],
      http: {path: '/subscribe', verb: 'post'},
      description: "Subscribe for push notifications (new and all allowed as set codes)"
    }
  );

  Installation.remoteMethod(
    'unsubscribe',
    {
      accepts: [
        {arg: 'gcmToken', type: 'string', required: true},
        {arg: 'setCode', type: 'string', required: true},
        {arg: 'setCountryCode', type: 'string', required: true}
      ],
      http: {path: '/unsubscribe', verb: 'post'},
      description: "Unubscribe for push notifications (new and all allowed as set codes)"
    }
  );

  Installation.disableRemoteMethod("create", false);
  Installation.disableRemoteMethod("upsert", true);
  Installation.disableRemoteMethod("updateAll", true);
  Installation.disableRemoteMethod("updateAttributes", false);
  Installation.disableRemoteMethod("find", true);
  Installation.disableRemoteMethod("findById", true);
  Installation.disableRemoteMethod("findOne", true);
  Installation.disableRemoteMethod("deleteById", true);
  Installation.disableRemoteMethod("count", true);
  Installation.disableRemoteMethod("exists", true);
  Installation.disableRemoteMethod("createChangeStream", true);
  Installation.disableRemoteMethod("findByApp", true);
  Installation.disableRemoteMethod("findByUser", true);
  Installation.disableRemoteMethod("findBySubscriptions", true);
};
