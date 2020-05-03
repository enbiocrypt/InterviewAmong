var temp;
	var arr=[];
	ace.require("ace/ext/language_tools");
	window.ep=ace.edit("editor");
	ep.getSession().setUseWrapMode(true);
	//ep.setOption("indentedSoftWrap", false);
	ep.setOptions({
		indentedSoftWrap:true,
		enableBasicAutocompletion: true,
		enableLiveAutocompletion: true
	});
	ep.setShowPrintMargin(false);
	ep.setFontSize(16);
	ep.setTheme("ace/theme/monokai");
	//ep.setTheme("ace/theme/clouds");
	ep.session.setMode("ace/mode/python");
	ep.setAutoScrollEditorIntoView(true);
	function seteditor(){
		//arr[temp]=ep.getSession().getValue();
		var x = document.getElementById("selection").value;
		if(x=="python2" || x=="python3"){
			/*if(x=="python3")
				temp=0;
			else
				temp=1;*/
			ep.session.setMode("ace/mode/python");
		}
		else if(x=="c" || x=="cpp"){
			/*if(x=="cpp")
				temp=2;
			else
				temp=3;
			*/
			ep.session.setMode("ace/mode/c_cpp");
		}
		else if(x=="java"){
			//temp=4;
			ep.session.setMode("ace/mode/java");
		}
		else if(x=="mysql"){
			//temp=4;
			ep.session.setMode("ace/mode/mysql");
		}
		else if(x=="javascript"){
			//temp=4;
			ep.session.setMode("ace/mode/javascript");
		}
		else if(x=="R"){
			//temp=4;
			ep.session.setMode("ace/mode/r");
		}
		else if(x=="Ruby"){
			//temp=4;
			ep.session.setMode("ace/mode/ruby");
		}
		else if(x=="C#"){
			//temp=4;
			ep.session.setMode("ace/mode/csharp");
		}
		/*
		if(arr[temp])
			ep.setValue(arr[temp],1);
		else
			ep.setValue("",-1);
		*/
		document.getElementById("editor").childNodes[0].focus();
	}
	seteditor();
	document.getElementById("editor").childNodes[0].focus();