var http = require('http');  
var express = require('express');  
var cors = require('cors');
var app = express();  
const httpsPort = 1234;  
var https = require('https');  
var fs = require('fs');  
var options = {  
    key: fs.readFileSync('./key.pem', 'utf8'),  
    cert: fs.readFileSync('./server.crt', 'utf8')  
};
 
//console.log("KEY: ", options.key)  
//console.log("CERT: ", options.cert)  
const corsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: true,
    maxAge: 600,
  };
  app.options('*', cors(corsOptions));
  app.use(cors(corsOptions));
//app.use(cors());
app.use(express.static('public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors({ origin: 'https://localhost:1234' , credentials :  true}));
var secureServer = https.createServer(options, app).listen(httpsPort, () => {  
    console.log(">> CentraliZr listening at port " + httpsPort);  
});  
/*app.get('/oauth2', function(req, res) {  
    res.sendFile(__dirname + '/oauth-form.html');  
});*/
