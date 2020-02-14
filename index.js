const express = require('express'),
     http = require('http');
const fs = require('fs');
const session = require('express-session');
const {c, cpp, node, python, java} = require('compile-run');
const bodyParser = require('body-parser');
const hostname = 'localhost';
var https = require('https');
var ExpressPeerServer = require('peer').ExpressPeerServer;
var options = {
	debug: true,
    allow_discovery: true,
	ssl:{
		key: fs.readFileSync(__dirname+'/Public/cert/private.key'),
		cert: fs.readFileSync(__dirname+'/Public/cert/certificate.crt')
	}
};
var app = express();
port = process.env.PORT || 3000;

var server = http.createServer(app).listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

var peer = ExpressPeerServer(server, options);


app.set('view engine','ejs');
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/Public'));
app.use(express.static(__dirname + '/Views'));
app.use('/api', peer);



/*const server1 = PeerServer({
  port: 9000,
  ssl: {
    key: fs.readFileSync(__dirname+'/Public/cert/private.key'),
    cert: fs.readFileSync(__dirname+'/Public/cert/certificate.crt')
  },
  path: '/api'
});
//port = process.env.PORT || 3000;
*/

app.get('/',(req,res) => {
	res.render('home',{port:port});
	//res.sendFile(__dirname+'/Public/index.html');
});

app.get('/home',(req,res) => {
	res.render('home',{port:port});
	//res.sendFile(__dirname+'/Public/index.html');
});

app.post('/compile/:feedsId',(req,res) => {
	if(req.params.feedsId=="python2"){
		let resultPromise = python.runSource(req.body.carrier, {stdin : req.body.carrier_ip});
		resultPromise.then(result => {
			if(result.stderr){
				var n=result.stderr.search("-")+1;
				result.stderr=result.stderr.substring(n);
			}
			res.end(JSON.stringify({ result_output: result }));
		})
		.catch(err => {
			res.end("Server Error");
		});
	}
	else if(req.params.feedsId=="python3"){
		let resultPromise = python.runSource(req.body.carrier, {executionPath: 'python3', stdin : req.body.carrier_ip});
		resultPromise.then(result => {
			if(result.stderr){
				var n=result.stderr.search("-")+1;
				result.stderr=result.stderr.substring(n);
			}
			res.end(JSON.stringify({ result_output: result }));
		})
		.catch(err => {
			res.end("Server Error");
		});
	}
	else if(req.params.feedsId=="cpp"){
		let resultPromise = cpp.runSource(req.body.carrier, {stdin : req.body.carrier_ip});
		resultPromise.then(result => {
			if(result.stderr){
				var n=result.stderr.search("-")+1;
				result.stderr=result.stderr.substring(n);
			}
			res.end(JSON.stringify({ result_output: result }));
		})
		.catch(err => {
			res.end("Server Error");
		});
	}
	else if(req.params.feedsId=="c"){
		let resultPromise = c.runSource(req.body.carrier, {stdin : req.body.carrier_ip});
		resultPromise.then(result => {
			if(result.stderr){
				var n=result.stderr.search("-")+1;
				result.stderr=result.stderr.substring(n);
			}
			res.end(JSON.stringify({ result_output: result }));
		})
		.catch(err => {
			res.end("Server Error");
		});
	}
	else if(req.params.feedsId=="java"){
		let resultPromise = java.runSource(req.body.carrier, {stdin : req.body.carrier_ip});
		resultPromise.then(result => {
			if(result.stderr){
				var n=result.stderr.search("-")+1;
				result.stderr=result.stderr.substring(n);
			}
			res.end(JSON.stringify({ result_output: result }));
		})
		.catch(err => {
			res.end("Server Error");
		});
	}
	else{
		res.end("Wrong Selection");
	}
});

peer.on('connection', function (id) {
console.log('user with ', id, 'connected');
});


/*
app.use('/api', ExpressPeerServer(server, options));

server.on('connection', function(id) {
    console.log(id)
	console.log(server._clients)
});
server.on('disconnect', function(id) {
    console.log(id + "deconnected")
});
*/