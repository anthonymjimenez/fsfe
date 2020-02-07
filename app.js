var express = require('express');
var app = express();
var path = require('path');

const WebSocketServer = require('ws').Server;
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });

var port = 3000;
app.use('/js', express.static(path.join(__dirname, '/frontend/js/')));

app.use('/css', express.static(path.join(__dirname, '/frontend/css/')));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/index.html'));
});

function handleQuery(query, cb) {
    cb('Awesome');
}

/**
 * Client Counter
 * Count the number of active connections
 * @type {Number}
 */
let cc = 0;

wss.on('connection', function connection(ws) {
   console.log('client connections: ', ++cc);

  ws.on('message', function incoming(message) {
    try {
        const { payload, type } = JSON.parse(message);
        switch(type) {
            case 'query':
                handleQuery(payload, (response) => {
                    ws.send(JSON.stringify({type: 'queryResponse', payload: response}));
                });
                return;
            default:
                console.log(message);
        }

    } catch(e) {
      console.error('Error from message: ', e);
    }
  });

  // Send welcome message on each connection
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({type: 'connected', payload: 'Welcome!'}));
  }

  ws.on('close', function close() {
    --cc;
    if (cc === 0) {
      clearInterval(pingInterval);
    }
    console.log('disconnected');
  });

  ws.on('error', function error() {
    --cc;
    console.log('error');
  });

});

const pingPayload = JSON.stringify({type: 'ping'});
// Keep the connection alive
let pingInterval = setInterval(() => {
  wss.broadcast(pingPayload);
}, 1 * 5000);

/**
 * Broadcast data to all connected clients
 * @param  {Object} data
 * @void
 */
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};



app.listen(port);