/**
 * Initialise environment.
 * @param app
 */
module.exports = function(app) {

  var envs = require('envs');
  var btv3Config = app.get('btv3');
  var winston = require('winston');
  var splunk = require('winston-splunk').splunk;

  // init logger
  winston.add(splunk, {
    splunkHost: app.get('logHost')
  });
  app.winston = winston;

  // read config from env vars (prod) or config.local (dev)
  btv3Config.gcmServerApiKey    = envs('GCM_KEY', btv3Config.gcmServerApiKey);
  btv3Config.awsAccessKeyID     = envs('AWS_ID', btv3Config.awsAccessKeyID);
  btv3Config.awsSecretAccessKey = envs('AWS_SECRET', btv3Config.awsSecretAccessKey);
  btv3Config.awsAssociateTag    = envs('AWS_TAG', btv3Config.awsAssociateTag);
  btv3Config.apiClientId        = envs('API_CL_ID', btv3Config.apiClientId);

  if (!btv3Config.gcmServerApiKey ||
      !btv3Config.awsAccessKeyID  ||
      !btv3Config.awsSecretAccessKey ||
      !btv3Config.awsAssociateTag ||
      !btv3Config.apiClientId) {
    var err = new Error("Environment not correctly configured. Check env. vars or config file.");
    app.winston.log('error', 'Configuration Error', {"msg": err.message});
    throw err;
  }
};

