$(document).mouseleave(function () {
			conn.send({action:"alert_log",message:"Cursor away from Window",type:"danger"});
		});
		
		$(document).mouseenter(function () {
			conn.send({action:"alert_log",message:"Cursor on the Window",type:"danger"});
		});
		
		function userCheated() {
		// The user cheated by leaving this window (e.g opening another window)
		// Do something
			conn.send({action:"alert_log",message:"On another tab",type:"danger"});
		}
		
		function userReturn() {
		// The user cheated by leaving this window (e.g opening another window)
		// Do something
		//	conn.send({action:"alert_log",message:"On another tab",type:"danger"});
			conn.send({action:"alert_log",message:"Returned to Current Tab",type:"danger"});
		}
		
		window.onblur = userCheated;
		window.onfocus = userReturn;