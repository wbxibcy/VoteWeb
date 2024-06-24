var redis = require('redis')

var client = redis.createClient({
    url: 'redis://127.0.0.1:6379'
})

client.on('error', function (err) {
  console.log('Error ' + err);
});

client.on('ready', function() {
  console.log('Redis is ready...');
});

module.exports = client;