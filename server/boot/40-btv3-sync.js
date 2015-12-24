module.exports = function(app) {

  var btv3config = app.get('btv3');
  var Scraper = require('../btv3/scraper.js');
  var AWS = require('../btv3/aws.js');
  var mq = require('strong-mq');


  // init message queue
  var connection = mq.create({
    provider: 'amqp',
    host: app.get('amqpHost'),
    port: app.get('amqpPort')
  });
  connection.open().on('error', function(err) {
    app.winston.log('error', 'Error connectiong to messaging server', {"msg": err.message, "stack": err.stack});
    throw err;
  });
  var pull = connection.createPullQueue(btv3config.queueName);

  pull.subscribe(function(msg) {
    if (msg.job.localeCompare(btv3config.syncStoresJob) == 0) {
      app.winston.log('info', 'Job pulled', {"msg": "Stores Sync", "pid": process.pid});
      Scraper.sync(app);
    }
    else if (msg.job.localeCompare(btv3config.syncEANJob) == 0) {
      app.winston.log('info', 'Job pulled', {"msg": "EAN Sync", "pid": process.pid});
      AWS.sync(app);
    }
  });
};
