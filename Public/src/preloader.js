
(function(){
 
 var preload = document.getElementById("preload");
 var loading = 0;
 var id = setInterval(frame, 64);

 function frame(){
	
	if(conn){
		if(loading == 50) {
			clearInterval(id);
			document.getElementById("preload").style.visibility="hidden";
			document.getElementById("container").style.visibility="visible";
		}
		else {
			loading = loading + 1;
			if(loading == 40) {
				preload.style.animation = "fadeout 1s ease";
			}
		}
	}
  
 }


})();