module.exports = function(app) {

  var btv3config = app.get('btv3');
  var Scraper = require('../btv3/scraper.js');
  var winston = require('winston');
  var mq = require('strong-mq');
  var splunk = require('winston-splunk').splunk;

  // init logger
  winston.add(splunk, {
    splunkHost: app.get('logHost')
  });
  app.winston = winston;

  // init message queue
  var connection = mq.create({
    provider: 'amqp',
    host: app.get('amqpHost'),
    port: app.get('amqpPort')
  });
  connection.open().on('error', function() {
    app.winston.log('error', 'Message Queue', {"msg": "Error connecting to messaging server. Synchronisation disabled."});

  });
  var pull = connection.createPullQueue(btv3config.queueName);

  pull.subscribe(function(msg) {
    if (msg.job.localeCompare(btv3config.syncStoresJob) == 0) {
      app.winston.log('info', 'Job pulled', {"msg": "Stores Sync", "pid": process.pid});
      Scraper.sync(app);
    }
    else if (msg.job.localeCompare(btv3config.syncEANJob) == 0) {
      app.winston.log('info', 'Job pulled', {"msg": "EAN Sync", "pid": process.pid});
      // TODO: ean sync
    }
  });
};
