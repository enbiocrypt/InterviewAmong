const express = require('express'),
     http = require('http');
const fs = require('fs');
var fetch = require('isomorphic-fetch');
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
var Dropbox = require('dropbox').Dropbox;
var firebase = require('firebase');
var multer  = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
const sp = require('synchronized-promise')
const puppeteer = require("puppeteer");

//Fill Firebase Config Below
var firebaseConfig = {
    apiKey: "--smig",
    authDomain: "elemental-axle-.firebaseapp.com",
    databaseURL: "https://elemental-axle-.firebaseio.com",
    projectId: "elemental-axle-",
    storageBucket: "elemental-axle-.appspot.com",
    messagingSenderId: "",
    appId: "1::web:",
    measurementId: ""
  };
firebase.initializeApp(firebaseConfig);

/**Primary Server**/
client  = redis.createClient(6380, 'enbiocrypt.redis.cache.windows.net', 
        {auth_pass: '=', tls: {servername: 'enbiocrypt.redis.cache.windows.net'}});
/**Secondary Server**/
/*client  = redis.createClient(6380, 'ebc.redis.cache.windows.net', 
        {auth_pass: '=', tls: {servername: 'ebc.redis.cache.windows.net'}});*/

const sslop = {
		key: fs.readFileSync(__dirname+'/Public/cert/private.key'),
		cert: fs.readFileSync(__dirname+'/Public/cert/certificate.crt'),
	};
var options = {
	debug: true,
    allow_discovery: true,
	ssl: sslop
};

var dbx = new Dropbox({ accessToken: '', fetch: fetch});
var port = process.env.PORT || 3000;
app.set('view engine','ejs');
app.use(bodyParser.json());      
var upperBound = '1gb';
app.use(bodyParser.urlencoded({extended: false, limit: upperBound}));
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
  /**Server**/
  var con= mysql.createConnection({host: "enbiocrypt.mysql.database.azure.com", user: "", password: "", database: "newfeedbackdb", port: 3306});
  /**localhost**/
  //var con= mysql.createConnection({host: "localhost", user: "root", password: "", database: ""});
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
	/**Server**/
	var connection = new MySql({host: "enbiocrypt.mysql.database.azure.com", user: "", password: "", database: "ibdb", port: 3306});
	/**Localhost**/
	//var connection = new MySql({host: "localhost", user: "root", password: "", database: "ibdb"});
	quer = 'select * from interdemo where sno="'+req.params.pop+'"';
	var result = connection.query(quer);
	console.log(result);
	if(!result.length)
		res.status(404).end("Session Expired (or) Wrong Link, Please Contact Admin or Recheck the link.");
		//res.write("Session Expired (or) Wrong Link, Please Contact Admin or Recheck the link.");
	else{
			if(req.session.idm && req.session.ptype){
				res.render('home',{sender:result[0].sender,reciever:result[0].reciever,type:result[0].ptype});
			}
			else{
				if(result[0].ptype==1)
					req.session.ptype="Interviewer";
				else
					req.session.ptype="Candidate";
				req.session.idm=result[0].session_id;
				dbx.filesCreateFolder({path: `/IB/${req.session.idm}`
						}).then(function (response) {
							//result=response;
							console.log(response);
						}).catch(function (err) {
							//error=err;
							console.log(err);
						});
				res.render('home',{sender:result[0].sender,reciever:result[0].reciever,type:result[0].ptype});
			}
	}
	//const index = path.join(__dirname, 'Public', 'home.html');
	//res.sendFile(index);
});

app.get('/playback_code/:pop',(req,res) => {
	firebase.database().ref(`sessionIB/${req.params.pop}`).on("value", function(snapshot) {
		fun = snapshot.val();
		res.render('playback',{source_code : JSON.stringify(fun.Source_Code)});
	});
});


app.get('/report/:pop',(req,res) => {
	req.session.logger=req.params.pop;
	var lis=[];
	function fun1(item,index){
		ext = item.path_display.split(".")[1]
		if(ext == "txt")
			lis.push(item.name);
			//dbx.filesDownload({path:item.path_display}).then(function(response){lis.push([response.name,response.fileBinary]);}).catch(function(err){console.log(err);});
	}
	/**Server**/
	//var connection = new MySql({host: "enbiocrypt.mysql.database.azure.com", user: "", password: "", database: "ibdb", port: 3306});
	/**Localhost**/
	//var connection = new MySql({host: "localhost", user: "root", password: "", database: "ibdb"});
	var fun;
	var ty;
	firebase.database().ref(`sessionIB/${req.params.pop}`).on("value", function(snapshot) {
		fun = snapshot.val();
		console.log(fun.Logs);
		
		dbx.filesListFolder({path:`/IB/${req.params.pop}`}).then(function(response){
			ty = response.entries;
			ty.forEach(fun1);
			res.render('reports',{snap:JSON.stringify(fun.Logs),endtime:fun.End_Time,starttime:fun.Start_Time,ssid:req.params.pop,vlink:fun.Video_Link,llink:fun.Logs_Link,compiled_files:JSON.stringify(lis),lchats:JSON.stringify(fun.Chats),lcompiled:JSON.stringify(fun.Compiled),problem:fun.Problem});	
		}).catch(function(err){console.log(err);});
		
		}, function (error) {
		res.status(404).end("Unauthorized Access, Please Contact Admin or Recheck the link.");
	});
	
	//const index = path.join(__dirname, 'Public', 'home.html');
	//res.sendFile(index);
});

app.get('/report1/:pop',(req,res) => {
	req.session.logger=req.params.pop;
	var lis=[];
	function fun1(item,index){
		ext = item.path_display.split(".")[1]
		if(ext == "txt")
			lis.push(item.name);
			//dbx.filesDownload({path:item.path_display}).then(function(response){lis.push([response.name,response.fileBinary]);}).catch(function(err){console.log(err);});
	}
	/**Server**/
	//var connection = new MySql({host: "enbiocrypt.mysql.database.azure.com", user: "", password: "", database: "ibdb", port: 3306});
	/**Localhost**/
	//var connection = new MySql({host: "localhost", user: "root", password: "", database: "ibdb"});
	var fun;
	var ty;
	firebase.database().ref(`sessionIB/${req.params.pop}`).on("value", function(snapshot) {
		fun = snapshot.val();
		console.log(fun.Logs);
		
		dbx.filesListFolder({path:`/IB/${req.params.pop}`}).then(function(response){
			ty = response.entries;
			ty.forEach(fun1);
			res.render('reports1',{snap:JSON.stringify(fun.Logs),endtime:fun.End_Time,starttime:fun.Start_Time,ssid:req.params.pop,vlink:fun.Video_Link,llink:fun.Logs_Link,compiled_files:JSON.stringify(lis),lchats:JSON.stringify(fun.Chats),lcompiled:JSON.stringify(fun.Compiled),problem:fun.Problem});	
		}).catch(function(err){console.log(err);});
		
		}, function (error) {
		res.status(404).end("Unauthorized Access, Please Contact Admin or Recheck the link.");
	});
	
	//const index = path.join(__dirname, 'Public', 'home.html');
	//res.sendFile(index);
});

app.post('/report_files',(req,res) => {
	if(req.session.logger){
		dbx.filesDownload({path:`/IB/${req.session.logger}/${req.body.com_file}`}).then(function(response){
			res.end(JSON.stringify([response.name,response.fileBinary.toString()]));
		}).catch(function(err){res.status(404).end("Unauthorized Access, Please Contact Admin or Recheck the link.");});
	}else{
		res.status(404).end("Unauthorized Access, Please Contact Admin or Recheck the link.");
	}
});


app.post('/send',(req,res) => {
	if(req.session.mainadmin){
		/**Server**/
		var connection = new MySql({host: "enbiocrypt.mysql.database.azure.com", user: "", password: "", database: "ibdb", port: 3306});
		/**localhost**/
		//var connection = new MySql({host: "localhost", user: "root", password: "", database: "ibdb"});
		var itemp=md5(md5(req.body.CEmail1)+md5(moment().format('LTS')));
		var ctemp=md5(md5(req.body.IEmail1)+md5(moment().format('LTS')));
		var sender=md5(md5(req.body.IEmail1)+md5(req.body.CEmail1)+md5(moment().format('LTS')));
		var reciever=md5(md5(req.body.CEmail1)+md5(req.body.IEmail1)+md5(moment().format('LTS')));
		var sesid=md5(sender+reciever);
		console.log(`insert into interdemo values('${itemp}','${sender}','${reciever}')`);
		quer = `insert into interdemo values('${itemp}','${sender}','${reciever}',0,'${sesid}')`;
		quer1 = `insert into interdemo values('${ctemp}','${reciever}','${sender}',1,'${sesid}')`;
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
				return res.end("Check Interviewer's mail"); 
			} else { 
				console.log('Email sent successfully'); 
			} 
		});
		mailTransporter.sendMail(CmailDetails, function(err, data) { 
			if(err) { 
				console.log("Check Candidate's mail"); 
				return res.end("Check Candidate's mail");
			} else { 
				console.log('Email sent successfully'); 
			} 
		}); 
		return res.end("Updated");
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
	//res.sendFile(__dirname+'/Public/index.html');
});

app.post('/export/pdf/:pop', (req, res) => {
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`http://localhost:3000/report1/${req.params.pop}`)
        const buffer = await page.pdf({format: 'A4', printBackground : true})
		let mailTransporter = nodemailer.createTransport({ 
			service: 'gmail', 
			auth: { user: 'enbiocrypt@gmail.com', 
					pass: 'rahouigakxkhvuwd' }
		});
		let CmailDetails = { 
			from: 'enbiocrypt@gmail.com', 
			to: `${req.body.CEmail1}`,
			//to: "dineshsurisetti@gmail.com",
			subject: 'A Log Report has been shared..', 
			//html: `Your Interview is on <b> ${req.body.Date} </b> at <b> ${req.body.Time}</b> <br> Link: http://enbiocrypts.nl/${itemp}`
			attachments: {   // define custom content type for the attachment
				filename: `${req.params.pop}.pdf`,
				content: buffer,
				contentType: 'application/pdf'
			}
		};
		mailTransporter.sendMail(CmailDetails, function(err, data) { 
			if(err) { 
				console.log("Check Interviewer's mail"); 
				res.end("Check Interviewer's mail"); 
			} else { 
				res.end('Email sent successfully'); 
			} 
		});
        //res.type('application/pdf')
        //res.send(buffer)
        browser.close()
    })()
})


app.post('/export/pdf_download/:pop', (req, res) => {
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`http://localhost:3000/report1/${req.params.pop}`)
        const buffer = await page.pdf({format: 'A4', printBackground : true})
        res.type('application/pdf')
        res.send(buffer)
        browser.close()
    })()
})

app.post('/save_log',(req,res) => {
	if(req.session.idm && req.session.ptype){
		firebase.database().ref(`sessionIB/${req.session.idm}/Logs`).push({Type:req.session.ptype, Text:req.body.message, Time: req.body.time, Action: req.body.Atype});
		res.end("Done Saving");
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
});

app.post('/time_track',(req,res) => {
	var time_op = moment().format();
	if(req.session.idm && req.session.ptype=="Interviewer"){
		if(req.session.start_timer)
			res.end(time_op);
		else{
			req.session.start_timer=time_op;
			firebase.database().ref(`sessionIB/${req.session.idm}/Start_Time`).set(req.session.start_timer);
			res.end(time_op);
		}
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
});

app.post('/time_track_end',(req,res) => {
	var time_op = moment().format();
	if(req.session.idm && req.session.ptype=="Interviewer"){
		if(req.session.end_timer)
			res.end(time_op);
		else{
			req.session.end_timer=time_op;
			firebase.database().ref(`sessionIB/${req.session.idm}/End_Time`).set(req.session.end_timer);
			res.end(time_op);
		}
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
});

app.post('/save_video', upload.single('upl'),(req,res) => {
	var temo;
	if(req.session.idm && req.session.ptype=="Interviewer"){
		/*if(req.session.video_sessionId){
			dbx.filesUploadSessionAppendV2({contents:req.body.videoChunk, cursor:{session_id:req.session.video_sessionId, offset:req.session.counter}}).then(function(response){temo="Uploaded";console.log(response);}).catch(function(err){temo="Error";});
			res.end(temo);
		}
		else{
			req.session.counter=0;
			dbx.filesUploadSessionStart({contents:req.body.videoChunk}).then(function(response){req.session.video_sessionId=response.session_id;console.log(response);}).catch(function(err){console.log(err);});
			console.log(temo);
			if(temo){
				req.session.counter+=req.body.videoChunk.size;
				req.session.video_sessionId=temo;
				res.end("Uploaded");
			}
			else
				res.end("Error");
		}*/
		var bars;
		var dlink;
		var dfolder;
		dbx.sharingCreateSharedLink({
			path: `/IB/${req.session.idm}`
			}).then(function (response) {
				firebase.database().ref(`sessionIB/${req.session.idm}/Logs_Link`).set(response.url);
			}).catch(function (err) {
				res.end("Error");
		});
		dbx.filesUpload({path: `/IB/${req.session.idm}/${req.session.idm}_${moment().format('LTS')}.webm`,
						 contents: req.file.buffer,
						 autorename:true
						}).then(function (response) {
							//res.end("Success");
							dbx.sharingCreateSharedLink({
								path: `${response.path_display}`
							}).then(function (response) {
								var hue = response.url
								hue = hue.replace("www.dropbox.com","dl.dropboxusercontent.com")
								firebase.database().ref(`sessionIB/${req.session.idm}/Video_Link`).set(hue);
								res.end("Success");
								}).catch(function (err) {
									console.log(err);
									res.end("Error");
							});
						}).catch(function (err) {
							res.end("Error");
							console.log(err);
						});
		//const syncDti = sp(dti)
		//syncDti();
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
});


app.post('/save_chat',(req,res) => {
	if(req.session.idm && req.session.ptype){
		firebase.database().ref(`sessionIB/${req.session.idm}/Chats`).push({Type:req.session.ptype, Text:req.body.message, Time:req.body.time});
		res.end("Done Saving");
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
});

app.post('/save_problem',(req,res) => {
	if(req.session.idm && req.session.ptype){
		firebase.database().ref(`sessionIB/${req.session.idm}/Problem`).set(req.body.message);
		res.end("Done Saving");
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
});

app.post('/save_SourceCode',(req,res) => {
	if(req.session.idm && req.session.ptype){
		firebase.database().ref(`sessionIB/${req.session.idm}/Source_Code`).push({Type:req.session.ptype, Text:req.body.message, Time:req.body.time, Cursor_User:req.body.cur_c, Cursor_Marker:req.body.cur_i, Language : req.body.lang_id});
		res.end("Done Saving");
	}
	else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
	}
});


app.post('/compile/:feedsId',(req,res) => {
	if(req.session.idm && req.session.ptype){
		var result;
		var error;
		dbx.filesUpload({path: `/IB/${req.session.idm}/${req.session.ptype}_${moment().format('LTS')}_${req.params.feedsId}.txt`,
						 contents: req.body.carrier,
						 autorename:true
						}).then(function (response) {
							result=response;
							//console.log(response);
						}).catch(function (err) {
							error=err;
							//console.log(err);
						});
		if(req.params.feedsId=="python2"){
			let resultPromise = python.runSource(req.body.carrier, {stdin : req.body.carrier_ip});
			resultPromise.then(result => {
				firebase.database().ref(`sessionIB/${req.session.idm}/Compiled`).push(result);
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
				firebase.database().ref(`sessionIB/${req.session.idm}/Compiled`).push(result);
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
				firebase.database().ref(`sessionIB/${req.session.idm}/Compiled`).push(result);
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
				firebase.database().ref(`sessionIB/${req.session.idm}/Compiled`).push(result);
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
				firebase.database().ref(`sessionIB/${req.session.idm}/Compiled`).push(result);
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
				firebase.database().ref(`sessionIB/${req.session.idm}/Compiled`).push(result);
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
			var tr = shell.exec(`echo "${req.body.carrier}" | tee /home/logfile.cs`)
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
	}else{
		res.status(404).end("Unauthorized.. Next-Time your IP will be blacklisted...");
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
