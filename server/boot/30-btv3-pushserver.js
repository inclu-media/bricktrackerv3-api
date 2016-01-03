/**
 * Registeres the api at Google Cloud Messaging.
 * @param app
 */
module.exports = function (app) {

  var Application  = app.models.application;

  function startPushServer() {

    var btv3Config = app.get('btv3');

    var btv3api = {
      id: 'bricktrackerv3-api',
      name: 'bricktrackerv3-api',
      userId: 'martin.melcher@gmail.com',
      description: 'Bricktracker v3 REST API',
      type: 'production',
      pushSettings: {
        gcm: {
          serverApiKey: btv3Config.gcmServerApiKey
        }
      }
    };

    updateOrCreateApp(function (err, appModel) {
      if (err) {
        app.winston.log('error', 'Error registering at GCM', {msg: err.message, stack: err.stack});
        throw err;
      }
    });

    function updateOrCreateApp(cb) {
      Application.findOne({ where: {id: btv3api.id} }, function (err, result) {
          if (err) {
            cb(err);
          }
          if (result) {
            delete btv3api.id;
            result.updateAttributes(btv3api, cb);
          }
          else {
            return registerApp(cb);
          }
        });
    }

    function registerApp(cb) {
      Application.beforeSave = function (next) {
        if (this.name === btv3api.name) {
          this.id = 'bricktrackerv3-api';
        }
        next();
      };
      Application.register(
        btv3api.userId,
        btv3api.name,
        {
          description: btv3api.description,
          pushSettings: btv3api.pushSettings
        },
        function (err, app) {
          if (err) {
            return cb(err);
          }
          return cb(null, app);
        }
      );
    }
  }

  startPushServer();
};
