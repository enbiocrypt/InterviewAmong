const express = require('express'),
     http = require('http');
const fs = require('fs');
const {c, cpp, node, python, java} = require('compile-run');
const bodyParser = require('body-parser');
const hostname = 'localhost';
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
port = process.env.PORT || 3000;


app.set('view engine','ejs');
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/Public'));
app.use(express.static(__dirname + '/Views'));

var options = {
	/*debug: true,*/
    allow_discovery: true,
	ssl: {
		key: fs.readFileSync(__dirname+'/Public/cert/private.key'),
		cert: fs.readFileSync(__dirname+'/Public/cert/certificate.crt')
	},
	secure : false
}


app.get('/',(req,res) => {
	
	res.render('index',{port:port});
	//res.sendFile(__dirname+'/Public/index.html');
});

app.get('/index',(req,res) => {
	res.render('index',{port:port});
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

var server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

app.use('/api', ExpressPeerServer(server, options));

server.on('connection', function(id) {
    console.log(id)
	console.log(server._clients)
});
/*
server.on('disconnect', function(id) {
    console.log(id + "deconnected")
});
*/