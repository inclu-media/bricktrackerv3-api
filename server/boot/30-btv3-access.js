/**
 * Creates a default user for the app to use.
 * @param app
 */
module.exports = function(app) {

  var User = app.models.user;
  var Role = app.models.Role;
  var btv3Config = app.get('btv3');

  User.find({where: {email: btv3Config.appUserEmail}}, function(err, users){
    if (err) {
      app.winston.log('error', "Error connecting to database", {"msg": err.message, "stack": err.stack});
      throw err;
    }
    if (users.length == 0) {
      createAppUser();
    }
  });

  function createAppUser() {
    User.create([
      {username: btv3Config.appUserName, email: btv3Config.appUserEmail , password:btv3Config.appUserPassword }
    ], function(err, users) {
      if (err) {
        app.winston.log('error', "Error creating app authentication user", {msg: err.message, stack: err.stack});
        throw err;
      }

      Role.create({name: "app"}, function(err, role){
        if (err) {
          app.winston.log('error', "Error creating app authentication role", {msg: err.message, stack: err.stack});
          throw err;
        }
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[0].id
        }, function(err, principal) {
          if (err) {
            app.winston.log('error', "Error assigning app authtntication user to rolw",
              {msg: err.message, stack: err.stack});
            throw err;
          }
        });
      });
    });
  }
};
