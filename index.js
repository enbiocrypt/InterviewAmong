const express = require('express'),
     http = require('http');
const fs = require('fs');
const session = require('express-session');
const {c, cpp, node, python, java} = require('compile-run');
const bodyParser = require('body-parser');
const hostname = 'localhost';
const https = require('https');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const path = require('path');
const app = express();
var MySql = require('sync-mysql');
var R = require("r-script");
var shell = require('shelljs');

const sslop = {
		key: fs.readFileSync(__dirname+'/Public/cert/private.key'),
		cert: fs.readFileSync(__dirname+'/Public/cert/certificate.crt'),
	};
var options = {
	debug: true,
    allow_discovery: true,
	ssl: sslop
};


var port = process.env.PORT || 3000;
app.set('view engine','ejs');
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/Public'));
app.use(express.static(__dirname + '/Views'));

//var httpsServer = https.createServer(app);

var server = http.createServer(app).listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

var peer = ExpressPeerServer(server, options);

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

app.get('/:pop',(req,res) => {
	var connection = new MySql({host: "enbiocrypt.mysql.database.azure.com", user: "enbiocrypt@enbiocrypt", password: "25aprial1998QQ!!", database: "ibdb", port: 3306});
	quer = 'select * from interdemo where sno="'+req.params.pop+'"';
	var result = connection.query(quer);
	console.log(result);
	if(!result.length)
		res.status(404).end("Session Expired (or) Wrong Link, Please Contact Admin or Recheck the link.");
		//res.write("Session Expired (or) Wrong Link, Please Contact Admin or Recheck the link.");
	else
		res.render('home',{sender:result[0].sender,reciever:result[0].reciever,type:result[0].ptype});
	//const index = path.join(__dirname, 'Public', 'home.html');
	//res.sendFile(index);
});


app.get('/home',(req,res) => {
	res.render('home',{port:port});
	//res.sendFile(__dirname+'/Public/index.html');
});

app.post('/compile/:feedsId',(req,res) => {
	if(req.params.feedsId=="python2"){
		let resultPromise = python.runSource(req.body.carrier, {stdin : req.body.carrier_ip});
		resultPromise.then(result => {
			console.log(result);
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
	else if(req.params.feedsId=="javascript"){
		let resultPromise = node.runSource(req.body.carrier, {stdin : req.body.carrier_ip});
		resultPromise.then(result => {
			if(result.stderr){
				var n=result.stderr.search("-")+1;
				result.stderr=result.stderr.substring(n);
			}
			console.log(result);
			res.end(JSON.stringify({ result_output: result }));
		})
		.catch(err => {
			res.end("Server Error");
		});
	}
	else if(req.params.feedsId=="mysql"){
		var mysql = require('mysql');
		var connection = mysql.createConnection({host: "localhost", user: "root", password: "", database: "ibdb", port: 3306});
		var quer = req.body.carrier;
		var ls={};
		var ps=[];
		var temp=false
		connection.connect(function(err) {
			if (err)
				res.end(JSON.stringify({ result_output: err }));
			connection.query(quer, function (err, result, fields) {
				if (err)
					res.end(JSON.stringify({ result_output: err }));
				for(var i=0;i<result.length;i++){
					var tmp=[]
					var tmp1=[]
					for(var j in result[i]){
						if(!temp)
							tmp.push(j)
						
						tmp1.push(result[i][j])
						/*if(j in ls)
							ls[j].push(result[i][j])
						else{
							ls[j]=[]
							ls[j].push(result[i][j])
						}*/
					}
					if(!temp){
						ps.push(tmp.join("\t"))
					}
					ps.push(tmp1.join("\t"))
					temp = true
				}
				if(result.message)
					ps.push(result.message)
				console.log(ps.join("\n"))
				res.end(JSON.stringify({ result_output: {"stdout":ps.join("\n")} }));
			});
			connection.end();
		});
	}
	else if(req.params.feedsId=="R"){
		console.log(`echo "${req.body.carrier}" | tee /home/logfile.R`)
		var tr = shell.exec(`echo "${req.body.carrier}" | tee /home/logfile.R`)
		if(tr.code==0){
			var tr1 = shell.exec(`Rscript /home/logfile.R`)
			if(tr1.code==0)
				res.end(JSON.stringify({ result_output: {stdout:tr1.stdout} }));
			else
				res.end(JSON.stringify({ result_output: {stdout:tr1.stderr} }));
		}
		else
			res.end(JSON.stringify({ result_output: {stdout:tr.stderr} }));
			
		/*exec(`echo ${req.body.carrier} | tee /home/logfile.R`, (err, stdout, stderr) => {
		if (err) {
			//some err occurred
			res.end(err);
			} else {
			// the *entire* stdout and stderr (buffered)
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
			}
		});
		exec(`Rscript /home/logfile.R`, (err, stdout, stderr) => {
		if (err) {
			//some err occurred
			res.end(err);
			} else {
			// the *entire* stdout and stderr (buffered)
			console.log(stdout+stderr);
			res.end(JSON.stringify({ result_output: {stdout:stdout+stderr} }));
			}
		});*/
	}
	else{
		res.end("Wrong Selection");
	}
});

peer.on('connection', function (id) {
console.log('user with ', id, 'connected');
});
peer.on('disconnect', function(id) {
    console.log(id + "deconnected")
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