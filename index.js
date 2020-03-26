const express = require('express'),
     http = require('http');
const fs = require('fs');
const nodemailer = require('nodemailer');
const session = require('express-session');
const {c, cpp, node, python, java} = require('compile-run');
const bodyParser = require('body-parser');
const hostname = 'localhost';
const https = require('https');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const path = require('path');
const app = express();
const redis = require('redis');
const redisStore = require('connect-redis')(session);
var md5 = require('md5');
var moment=require("moment");
var MySql = require('sync-mysql');
var R = require("r-script");
var shell = require('shelljs');

client  = redis.createClient(6380, 'enbiocrypt.redis.cache.windows.net', 
        {auth_pass: 'pQANwbSPqEA0rHqOpDznzOhJeb9sqyzWbZLWo6W5oZc=', tls: {servername: 'enbiocrypt.redis.cache.windows.net'}});

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

app.use(session({
    secret: 'ssshhhhhhhh',
    // create new redis store.
    store: new redisStore({client: client, disableTTL: true}),
    saveUninitialized: false,
    resave: false
}));
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

app.post('/main_admin_login', (req,res) => {
  if(req.session.mainadmin){
	res.render('admin');}
  else{
  userid = req.body.userid
  password = req.body.password
  var mysql = require('mysql');
  var con= mysql.createConnection({host: "enbiocrypt.mysql.database.azure.com", user: "enbiocrypt@enbiocrypt", password: "25aprial1998QQ!!", database: "newfeedbackdb", port: 3306});
    con.connect(function(err) {
    if (err) throw err;
    con.query(`select userid FROM mainadmin WHERE userid="${userid}" AND password="${password}"`, function (err, result, fields) {
      if (err) throw err;
    console.log(result,result.length)
    if(result.length!=0)
    {
      req.session.mainadmin=result[0].userid;
      res.end("correct");
    }
    else{
      res.end("Wrong Credentials!! Please Re-Enter");
    }
    });
    con.end();
    });
  }
});

app.get('/login',(req,res) => {
	if(req.session.mainadmin){
		res.render('admin');
	}
	else{
		res.render('login');
	}
	//res.sendFile(__dirname+'/Public/index.html');
});

app.get('/admin_portal',(req,res) => {
	if(req.session.mainadmin){
		res.render('admin');
	}
	else{
		res.render('login');
	}
	//res.sendFile(__dirname+'/Public/index.html');
});

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

app.post('/send',(req,res) => {
	var connection = new MySql({host: "enbiocrypt.mysql.database.azure.com", user: "enbiocrypt@enbiocrypt", password: "25aprial1998QQ!!", database: "ibdb", port: 3306});
	var itemp=md5(md5(req.body.CEmail1)+md5(moment().format('LTS')));
	var ctemp=md5(md5(req.body.IEmail1)+md5(moment().format('LTS')));
	var sender=md5(md5(req.body.IEmail1)+md5(req.body.CEmail1)+md5(moment().format('LTS')));
	var reciever=md5(md5(req.body.CEmail1)+md5(req.body.IEmail1)+md5(moment().format('LTS')));
	console.log(`insert into interdemo values('${itemp}','${sender}','${reciever}')`);
	quer = `insert into interdemo values('${itemp}','${sender}','${reciever}',0)`;
	quer1 = `insert into interdemo values('${ctemp}','${reciever}','${sender}',1)`;
	var result = connection.query(quer);
	var result1 = connection.query(quer1);
	console.log(req.body.CTag1);
	var vtag=req.body.CTag1;
	var ttag=vtag.join(",");
	console.log(result,result1);
	let mailTransporter = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { user: 'enbiocrypt@gmail.com', 
			pass: 'rahouigakxkhvuwd' }
	});
	let CmailDetails = { 
		from: 'enbiocrypt@gmail.com', 
		to: `${req.body.CEmail1}`, 
		subject: 'Your Interview Has been Scheduled', 
		html: `Your Interview is on <b> ${req.body.Date} </b> at <b> ${req.body.Time}</b> <br> Link: http://enbiocrypts.nl/${itemp}`
	};
	let ImailDetails = { 
		from: 'enbiocrypt@gmail.com', 
		to: `${req.body.IEmail1}`, 
		subject: 'An Interview Has been Scheduled', 
		html: `An Interview is scheduled on <b>${req.body.Date}</b> at <b>${req.body.Time}</b><br>Candidate with Skill Set: <b>${ttag}</b><br>Link: http://enbiocrypts.nl/${ctemp}`
	};
	mailTransporter.sendMail(ImailDetails, function(err, data) { 
		if(err) { 
			console.log("Check Interviewer's mail"); 
			res.end("Check Interviewer's mail"); 
		} else { 
			console.log('Email sent successfully'); 
		} 
	});
	mailTransporter.sendMail(CmailDetails, function(err, data) { 
		if(err) { 
			console.log("Check Candidate's mail"); 
			res.end("Check Candidate's mail");
		} else { 
			console.log('Email sent successfully'); 
		} 
	}); 
	res.end("Updated");
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
			
	}
	else if(req.params.feedsId=="Ruby"){
		console.log(`echo "${req.body.carrier}" | tee /home/logfile.rb`)
		var tr = shell.exec(`echo "${req.body.carrier}" | tee /home/logfile.rb`)
		if(tr.code==0){
			var tr1 = shell.exec(`ruby /home/logfile.rb`)
			if(tr1.code==0)
				res.end(JSON.stringify({ result_output: {stdout:tr1.stdout} }));
			else
				res.end(JSON.stringify({ result_output: {stdout:tr1.stderr} }));
		}
		else
			res.end(JSON.stringify({ result_output: {stdout:tr.stderr} }));
			
	}
	else if(req.params.feedsId=="C#"){
		console.log(`echo "${req.body.carrier}" | tee /home/logfile.c`)
		var tr = shell.exec(`echo "${req.body.carrier}" | tee /home/logfile.rb`)
		if(tr.code==0){
			var tr1 = shell.exec(`csc /home/logfile.cs`)
			if(tr1.code==0)
				res.end(JSON.stringify({ result_output: {stdout:tr1.stdout} }));
			else
				res.end(JSON.stringify({ result_output: {stdout:tr1.stderr} }));
		}
		else
			res.end(JSON.stringify({ result_output: {stdout:tr.stderr} }));
			
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