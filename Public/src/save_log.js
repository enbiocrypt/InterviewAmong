function hide_logs(){
		document.getElementById("mydiv3").style.visibility="visible";
	}
	function save_chat(xyz){
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "save_chat", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function() {
			console.log(this.responseText);
		}
		xhr.send(JSON.stringify({message : xyz, time : moment().format()}));
	}
	function save_log(xyz, dtime, ttype){
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "save_log", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function() {
			console.log(this.responseText);
		}
		xhr.send(JSON.stringify({message : xyz, time : dtime, Atype : ttype}));
	}
	