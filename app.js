var express = require('express');
var app = express();
var path = require('path');
var port = 3000;

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/index.html'));
});



app.listen(port);