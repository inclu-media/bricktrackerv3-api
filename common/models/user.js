var idTokenVerifier = require('google-id-token-verifier');

module.exports = function(User) {

  User.loginWithToken = function(idToken, cb) {

    var userModel = this.constructor;
    var app = userModel.app;
    var btv3Config = app.get('btv3');
    var clientId = btv3Config.apiClientId;

    idTokenVerifier.verify(idToken, clientId, function (err, tokenInfo) {
      if (err) {
        app.winston.log('warning', 'Id token verification failed', {"msg": err.message, "stack": err.stack});
        cb(err);
      }

      console.log(tokenInfo);
    });
  };

  User.remoteMethod(
    'loginwithtoken',
    {
      accepts: [
        {arg: 'idToken', type: 'string', required: true},
      ],
      http: {path: '/loginwithtoken', verb: 'post'},
      description: "Login with a google id token."
    }
  );

  User.disableRemoteMethod("create", true);
  User.disableRemoteMethod("upsert", true);
  User.disableRemoteMethod("updateAll", true);
  User.disableRemoteMethod("updateAttributes", false);
  User.disableRemoteMethod("find", true);
  User.disableRemoteMethod("findById", true);
  User.disableRemoteMethod("findOne", true);
  User.disableRemoteMethod("deleteById", true);
  User.disableRemoteMethod("confirm", true);
  User.disableRemoteMethod("count", true);
  User.disableRemoteMethod("exists", true);
  User.disableRemoteMethod("resetPassword", true);
  User.disableRemoteMethod('createChangeStream', true);
  User.disableRemoteMethod('__count__accessTokens', false);
  User.disableRemoteMethod('__create__accessTokens', false);
  User.disableRemoteMethod('__delete__accessTokens', false);
  User.disableRemoteMethod('__destroyById__accessTokens', false);
  User.disableRemoteMethod('__findById__accessTokens', false);
  User.disableRemoteMethod('__get__accessTokens', false);
  User.disableRemoteMethod('__updateById__accessTokens', false);
};
