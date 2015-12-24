var idTokenVerifier = require('google-id-token-verifier');

module.exports = function(User) {

  User.loginWithToken = function(idToken, cb) {

    var btv3Config = User.app.get('btv3');
    var clientId = btv3Config.apiClientId;

    idTokenVerifier.verify(idToken, clientId, function (err, tokenInfo) {

      // invalid token
      if (err) {
        User.app.winston.log('warning', "Id token verification failed", {"msg": err.message, "stack": err.stack});
        return cb(err);
      }

      // token valid
      User.find({where:{email: tokenInfo.email}}, function(err, users) {
        if (err) {
          User.app.winston.log('warning', "Find operation during token validation failed.",
            {"msg": err.message, "stack": err.stack});
          return cb(err);
        }

        if (users != null && users.length == 1) {
          generateToken(users[0], cb);
        }
        else {
          User.create({email: tokenInfo.email, password: "empty"}, function(err, user){
            if (err) {
              User.app.winston.log('warning', "Create operation during token validation failed.",
                {"msg": err.message, "stack": err.stack});
              return cb(err);
            }
            generateToken(user, cb)
          });
        }
      });
    });
  };

  function generateToken(user, cb) {
    user.createAccessToken(user.maxTTL, function(err, token) {
      if (err) {
        User.app.winston.log('warning', "Error creating API access token",
          {"msg": err.message, "stack": err.stack});
        return cb(err);
      }
      return cb(null, token);
    })
  }

  User.remoteMethod(
    'loginWithToken',
    {
      accepts: [
        {arg: 'idToken', type: 'string', required: true}
      ],
      returns: [
        {arg: 'apiToken', type: 'object'}
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
  User.disableRemoteMethod("login", true);
  User.disableRemoteMethod("logout", false);
  User.disableRemoteMethod('createChangeStream', true);
  User.disableRemoteMethod('__count__accessTokens', false);
  User.disableRemoteMethod('__create__accessTokens', false);
  User.disableRemoteMethod('__delete__accessTokens', false);
  User.disableRemoteMethod('__destroyById__accessTokens', false);
  User.disableRemoteMethod('__findById__accessTokens', false);
  User.disableRemoteMethod('__get__accessTokens', false);
  User.disableRemoteMethod('__updateById__accessTokens', false);
};
