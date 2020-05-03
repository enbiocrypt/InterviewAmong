function submit(){
			document.getElementById("exec").disabled=true;
			document.getElementById("exec").childNodes[0].classList.value="spinner-border spinner-border-sm";
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "compile/"+document.getElementById("selection").value, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			
			xhr.onload = function() {
				if(this.responseText=="Wrong Selection" || this.responseText=="Server Error" ){
						document.getElementById("status").innerHTML=this.responseText.fontcolor("red");
					}
				else{
						console.log(this.responseText);
						var rest=JSON.parse(this.responseText);
						if(rest.result_output.errorType){
							var temp=rest.result_output.errorType+" Error";
							//document.getElementById("status").innerHTML=temp.fontcolor("red");
							document.getElementById('output').value=rest.result_output.stderr;
						}
						else{
							//document.getElementById("status").innerHTML="Successfully Compiled".fontcolor("green");
							document.getElementById('output').value=rest.result_output.stdout;
						}
					}
					document.getElementById("exec").childNodes[0].classList.value="fa fa-chevron-right";
					document.getElementById("exec").disabled=false;
				}
		xhr.send(JSON.stringify({carrier : ep.getSession().getValue(), carrier_ip : document.getElementById("input").value}));
	}