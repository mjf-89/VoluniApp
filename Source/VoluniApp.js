/****copyright notice	*************************************************
 * 
 * 	Original Project: VoluniApp
 * 	Original File: VoluniApp.js
 * 	Copyright (C) 2012 Marco Jacopo Ferrarotti All Rights Reserved.
 * 	Contact: marco.ferrarotti@gmail.com
 * 	
 * 	If you want to redistribute this program, preserve this copyright
 * 	notice and add your own notice above.	
 * 
 ***copying permission	*************************************************
 *
 *	This file is part of VoluniApp.
 *
 *  VoluniApp is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  VoluniApp is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with VoluniApp.  If not, see <http://www.gnu.org/licenses/>.
 *  
 ***********************************************************************/


var va;


/************************************************************************
 * 	Class VoluniApp 	
 ***********************************************************************/


/************************************************************************
 * 	function VoluniApp constructor
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		define all the attributes of the class and initialize the wrapper
 * 		and the iframe that will be injected into the webpage. It also
 * 		binds a listener to the chrome onRequest event, this is useful 
 * 		to catch an event on preference change (like deactivated -> active)
 ***********************************************************************/
function VoluniApp() {
	//hold a reference to the new VoluniApp object
	va = this;
    
	//initialization flag
    va.init = false;
	//the url of the page loaded into the voluniapp iframe
	va.url = "";
	//the rid of the page loaded into the voluniapp iframe
	va.rid = "";
	
	//extension preferences (the constructor send a request to get the 
	//localStorage of the application)
	va.pref = new VoluniAppPref(va);
	
	//Size of the top/right sense area (for the auto hide/show feature)
	va.topSenseHei = 5;
	va.rightSenseWid = 20;
	
	//voluniapp wrapper
	va.wrp = document.createElement("div");
	$(va.wrp).attr("id","vaWrp");
	//voluniapp iframe
	va.frm = document.createElement("iframe");
	$(va.frm).attr("id","vaFrm");
	
	//append every htmlElement to the wrapper that will be injected into the webpage
	$(va.wrp).append(va.frm);
	
	//bind a listener to the chrome onRequest event
	chrome.extension.onRequest.addListener(va.request);
}


/************************************************************************
 * 	function start()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		initialize/deinitialize the application with respect to the "acti"
 * 		preference. Mainly it inject/detach the VoluniApp wrapper into the 
 * 		webpage and bind/unbind all the listeners that are needed.
 ***********************************************************************/
VoluniApp.prototype.start = function (){
	//check if the "acti" preference is set and if the application isn't
	//already initialized
	if(va.pref.acti==VoluniAppPref.ACTI_ACTIVE && !va.init) {
		//set the initialization flag
        va.init = true;
		
        //append the wrapper to the body of the webpage
        $("body").append(va.wrp);
        //set the url of the iframe that contains Volunia to the current webpage
		va.setFrmUrl(window.location.href);
		
		//bind a listener to the DOMReady event
		$(document).ready(va.ready);
		
		//bind a listener to the beforeUnload event
		$(window).bind("beforeunload.voluniapp",function(e){
			va.beforeUnload(e);
		});
		
		//bind a listener to the mousemove event (needed to understand if the mouse
		//has to interact with Volunia or with the webpage)
		$(document).bind("mousemove.voluniapp",function(e){
			va.mouseMove(e.pageX-window.scrollX,e.pageY-window.scrollY);
		});
		
		//bind a listener to the mouseclick event (needed for the autohide feature)
		$(document).bind("click.voluniapp",function(e){
			va.mouseClick(e.pageX-window.scrollX,e.pageY-window.scrollY);
		});
		
		//bind a listener to the keydown event (needed to catch the show/hide shortcut)
		$(document).bind("keydown.voluniapp",function(e){
			va.shortCut(e.keyCode, e.altKey);
		});
		
		//bind a listener to the DOMSubtreeModified event
		$(document).bind("DOMSubtreeModified.voluniapp",va.subModify);
		
		//to set z-index CSS property to the maximum value
		va.bringToFront();
	}
	//if the "acti" preference is set to deactivated and the application was
	//already initialized
	else if(va.pref.acti==VoluniAppPref.ACTI_DEACTI && va.init){
		//detach the wrapper from the webpage
		$(va.wrp).detach();
		
		//unbind all the listeners
		$(document).unbind("mousemove.voluniapp");
		$(document).unbind("click.voluniapp");
		$(document).unbind("keydown.voluniapp");
		$(document).unbind("DOMSubtreeModified.voluniapp");
		
		//unset the initialization flag
		va.init = false;
	}
};


/************************************************************************
 * 	function setFrmUrl(url)
 * 	-arguments:
 * 		String url: the url that you want to set;
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		set the src attribute of the iframe that contains Volunia to the
 * 		proper volunia encripted url and update the application attributes
 * 		url, rid;
 ***********************************************************************/
VoluniApp.prototype.setFrmUrl = function (url){
	$(va.frm).attr("src","http://www.volunia.com/load?rid="+VoluniAppUtils.getRid(url));
	va.url = url;
	va.rid = VoluniAppUtils.getRid(url);
};


/************************************************************************
 * 	function setFrmRid(rid)
 * 	-arguments:
 * 		String rid: the rid that you want to set;
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		set the src attribute of the iframe that contains Volunia to the
 * 		proper volunia encripted url and update the application attributes
 * 		url, rid;
 ***********************************************************************/
VoluniApp.prototype.setFrmRid = function (rid){
	$(va.frm).attr("src","http://www.volunia.com/load?rid="+rid);
	va.url = VoluniAppUtils.getUrl(rid);
	va.rid = rid;
};


/************************************************************************
 * 	function setWinUrl(url)
 * 	-arguments:
 * 		String url: the url that you want to set;
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		set the location of the top window to the specified url;
 ***********************************************************************/
VoluniApp.prototype.setWinUrl = function (url){
	window.location = url;
};


/************************************************************************
 * 	function setWinRid(rid)
 * 	-arguments:
 * 		String rid: the rid that you want to set;
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		set the location of the top window to the specified url
 * 		corresponding to the encrypted rid;
 ***********************************************************************/
VoluniApp.prototype.setWinRid = function (rid){
	window.location = VoluniAppUtils.getUrl(rid);
};


/************************************************************************
 * 	function ready(e)
 * 	-arguments:
 * 		Event e: the event Object that has fired;
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this is the listener binded to the DOMReady event;
 ***********************************************************************/
VoluniApp.prototype.ready = function(e){
	//call the function that fix the problem due to flash content
	//behind HTML elements
	va.wModeFix();
};


/************************************************************************
 * 	function beforeUnload(e)
 * 	-arguments:
 * 		Event e: the event Object that has fired;
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this is the listener binded to the onbeforeunload event;
 ***********************************************************************/
VoluniApp.prototype.beforeUnload = function(e){
	//to fire possible unload events of Volunia (useful for example to have correct 
	//cookies)
	$(va.frm).attr("src","");
}


/************************************************************************
 * 	function subModify(e)
 * 	-arguments:
 * 		Event e: the event Object that has fired;
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this is the listener binded to the DOMSubtreeModified event;
 ***********************************************************************/
VoluniApp.prototype.subModify = function(e){
	//Get the current z-index of the wrapper and check if the new element
	//added to the DOM has an higher value
	var zMax = parseInt($(va.wrp).css("z-index"));
	if(parseInt($(e.srcElement).css("z-index"))>zMax) {
		zMax = parseInt($(e.srcElement).css("z-index"));
		$(va.wrp).css("z-index",zMax+1);
	}	
	
	//if the new element can contain flash content it call the function
	//that fix the problem due to flash content behind HTML elements
	if($(e.srcElement).is("embed") || $(e.srcElement).is("object"))
		va.wModeFix();
	
	//if the location of the top window is changed (after an AJAX request)
	//it adjust the url of the iframe that contains Volunia
	if(va.url != window.location.href) {
		va.setFrmUrl(window.location.href);
	}
};


/************************************************************************
 * 	function wModeFix()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this function provide a way to overcome to the problem of flash
 * 		content that is not rendered properly behind HTML elements also
 * 		behind invisible ones;
 * 		This fix work with three types of tag structure:
 * 			-> embed
 * 			-> object -> embed
 * 			-> object
 ***********************************************************************/
VoluniApp.prototype.wModeFix = function(){
	//if there are <embed> elements
	$("embed").each(function() {
		//set the wmode attribute
		$(this).attr("wmode","transparent");
		
		//reload the element to apply the fix
		$(this).wrap("<div>");
		$(this).unwrap();
		return;
	});
	
	//if there are <object> elements
	$("object").each(function() {
		//look for <embed> children
		$(this).children("embed").each(function(){
			//set the wmode attribute
			$(this).attr("wmode","transparent");
			
			//reload the element to apply the fix
			$(this).wrap("<div>");
			$(this).unwrap();
		});
		
		//look for <param> children
		$(this).children("param").each(function(){
			//set the wmode attribute
			if($(this).attr("name")=="wmode")
				$(this).attr("value","transparent");
			
			//reload the element to apply the fix
			$(this).parent().wrap("<div>");
			$(this).parent().unwrap();
		});
		
		//set the wmode attribute
		$(this).attr("wmode","transparent");
		
		//reload the element to apply the fix
		$(this).wrap("<div>");
		$(this).unwrap();
		return;
	});
};


/************************************************************************
 * 	function adap(x,y,w,h)
 * 	-arguments:
 * 		Number x: x offset to apply to the content
 * 		Number y: y offset to apply to the content
 * 		Number w: width of the content
 * 		Number h: height of the content
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this function tries to adapt the content of the webpage to do not
 * 		overlap with Volunia. Mainly it wrap all body's children into
 * 		a <div> and then resize/reposition it. An additional piece of code
 * 		is added to treat properly fixed elements in the webpage;
 ***********************************************************************/
VoluniApp.prototype.adapt = function (x,y,w,h) {
	//check if the application is active and if the "adap" preference is set
	if(va.pref.acti == VoluniAppPref.ACTI_ACTIVE && va.pref.adap == VoluniAppPref.ADAP_ON) {
		//check if everything was already wrap into the <div>
		if(!$("#vaDimWrp").parent().is("body")) {
			//remove VoluniApp wrapper
			$(va.wrp).detach();
			//enclose everything inside a <div>
			document.getElementsByTagName("body")[0].innerHTML="<div id=vaDimWrp>"+document.getElementsByTagName("body")[0].innerHTML+"</div>";
			//reattach VoluniApp wrapper outside the above <div> 
			$("body").append(va.wrp);
		}
		
		//resize/reposition the <div>
		$("#vaDimWrp").css("overflow","scroll");
		$("#vaDimWrp").css("position","fixed");
		$("#vaDimWrp").css("top",y+"px");
		$("#vaDimWrp").css("height",h+"px");
		$("#vaDimWrp").css("width",w+"px");
		
		//resize/reposition of fixed elements
		$("#vaDimWrp *").each(function(){
			if($(this).css("position")=="fixed") {
				//save original properties of the element into jquery data
				//structure (to treat properly multiple adapt() calls)
				if(!$(this).data("vaAdapt")) {
					$(this).data("vaAdapt",true); 
					$(this).data("vaWidth",$(this).width());
					$(this).data("vaHeight",$(this).height());
					$(this).data("vaLeft",$(this).offset().left);
					$(this).data("vaTop",$(this).offset().top);
					$(this).data("vaRight",$(this).css("right"));
					$(this).data("vaBottom",$(this).css("bottom"));
				}
				
				//resize the element if it is too large/high
				if($(this).data("vaWidth")>w)
					$(this).css("width",w+"px");
				else
					$(this).css("width",$(this).data("vaWidth"));
				if($(this).data("vaHeight")>h)
					$(this).css("height",h+"px");
				else
					$(this).css("height",$(this).data("vaHeight"));
				
				//store in variables all the coordinates
				var l=$(this).data("vaLeft");
				var t=$(this).data("vaTop");
				var r=parseInt($(this).data("vaRight"));
				var b=parseInt($(this).data("vaBottom"));
				if(!r)
					r=$(window).width()-l-$(this).width();
				if(!b)
					b=$(window).height()-t-$(this).height();
				r = $(window).width()-r;
				b = $(window).width()-b;
				
				//calculate new coordinates with standard transformations
				l = l*w/$(window).width()+x;
				t = t*h/$(window).height()+y;
				r = r*w/$(window).width()+x;
				b = b*h/$(window).height()+y;
				
				//applies new coordinates to the element
				$(this).css("left",l+"px");
				$(this).css("top",t+"px");
				$(this).css("right",$(window).width()-r+"px");
				$(this).css("bottom",$(window).height()-b+"px");
			}
		});
	}
	//if the "adap" preference is not set and the conten is adapted reload the page
	else if(va.pref.adap == VoluniAppPref.ADAP_OFF && $("#vaDimWrp").parent().is("body")) {
		window.location = "";
	}
};


/************************************************************************
 * 	function mouseOver(x,y,tElement)
 * 	-arguments:
 * 		Number x: x mouse coordinate
 * 		Number y: y mouse coordinate
 * 		Number tElement: element @(x,y) inside the Volunia
 * 	-return:
 * 		true: if the mouse is over a Volunia visible element
 * 		false: if the mouse is over the webpage
 * 	-behaviour:
 * 		this function is useful to understand if pointer-events over 
 * 		VoluniApp wrapper have to be activated or not; 
 ***********************************************************************/
VoluniApp.prototype.mouseOver = function (x,y,tElement) {   
	if(va.pref.hide==VoluniAppPref.HIDE_AUTO && (y<va.topSenseHei || x>window.innerWidth-va.rightSenseWid))
		return true;
	if(tElement.class=="middleCNT" || va.pref.stat == VoluniAppPref.STAT_CLOSED)
		return false;
	
	return true;
};


/************************************************************************
 * 	function mouseMove(x,y)
 * 	-arguments:
 * 		Number x: x mouse coordinate
 * 		Number y: y mouse coordinate
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this function is called either from the event listener to the
 * 		mousemove event in the webpage or after a message received from
 * 		the frame that contains Volunia;
 ***********************************************************************/
VoluniApp.prototype.mouseMove = function (x,y) {
	//send a request to get the element @(x,y) inside the iframe
	chrome.extension.sendRequest({msg:"getElementPoint",x:x,y:y},function(response){
		//if the mouse is over a Volunia Area
		if(va.mouseOver(x,y,response.element)) {
			//check if the autoHide preference is set and eventually
			//change the state of VoluniApp
			if(va.pref.hide == VoluniAppPref.HIDE_AUTO)
				va.pref.stat = VoluniAppPref.STAT_OPEN;
			
			//enable pointer-events on the iframe
			$(va.frm).css("pointer-events","auto");
			$(va.wrp).css("pointer-events","auto");
		}
		//if the mouse is over the webpage
		else {
			//disable pointer-events on the iframe
			$(va.frm).css("pointer-events","none");
			$(va.wrp).css("pointer-events","none");
		}
    });
};


/************************************************************************
 * 	function mouseClick(x,y)
 * 	-arguments:
 * 		Number x: x mouse coordinate
 * 		Number y: y mouse coordinate
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this function is called either from the event listener to the
 * 		mouseclick event in the webpage or after a message received from
 * 		the frame that contains Volunia;
 ***********************************************************************/
VoluniApp.prototype.mouseClick = function(x,y){
	//check if the autoHide preference is set
	if(va.pref.hide==VoluniAppPref.HIDE_AUTO) {
		//send a request to get the element @(x,y) inside the iframe
		chrome.extension.sendRequest({msg:"getElementPoint",x:x,y:y},function(response){
			//change the state of VoluniApp with respect to the current state
			va.pref.stat = (va.mouseOver(x,y,response.element)) ? VoluniAppPref.STAT_OPEN : VoluniAppPref.STAT_CLOSED;
		});
	};
};


/************************************************************************
 * 	function shortCut(keyCode,altKey)
 * 	-arguments:
 * 		Number keyCode: keyCode of a down key
 * 		Boolean altKey: true if the altKey is down
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this function is called either from the event listener to the
 * 		keydown event in the webpage or after a message received from
 * 		the frame that contains Volunia;
 ***********************************************************************/
VoluniApp.prototype.shortCut = function (keyCode, altKey){
	//check if the shortcut alt+v was pressed
	if(keyCode==86 && altKey)
		//change the state of VoluniApp with respect to the current state
		va.pref.stat = (va.pref.stat == VoluniAppPref.STAT_OPEN) ? VoluniAppPref.STAT_CLOSED : VoluniAppPref.STAT_OPEN;
};


/************************************************************************
 * 	function bringToFront()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this function select all the elements in the webpage and looks for
 * 		the higher value of the z-index CSS property, then gives that
 * 		value to the VoluniApp wrapper
 ***********************************************************************/
VoluniApp.prototype.bringToFront = function() {
	var zMax=0;
	//for each <body> children
	$("body *").each(function(){
		//update zMax if the element has an higher z-index
		if(parseInt($(this).css("z-index"))>zMax)
			zMax = parseInt($(this).css("z-index"));
	});
	
	//assign the higher z-index to the wrapper
	$(va.wrp).css("z-index",zMax+1);
};


/************************************************************************
 * 	function request(request, sender, response)
 * 	-arguments:
 * 		request
 * 		sender
 * 		response
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		this is the listener binded to the chrome onRequest event;
 ***********************************************************************/
VoluniApp.prototype.request = function(request, sender, response){
    switch(request.msg){
    case "event":
    	switch(request.e.type) {
    	//message received from the iframe when its DOMReady event has
    	//fired
    	case "ready":
    		//ensure that Voluni is open to the right webpage
    		if(request.e.url.indexOf("load?rid=")>0){
    			if(VoluniAppUtils.getUrl(request.e.url.substr(request.e.url.indexOf("load?rid=")+9)) != va.url)
    				va.setFrmUrl(window.location.href);
    		}
    		else {
    			if(request.e.url != va.url)
    				va.setFrmUrl(window.location.href);
    		}
    		break;
    	//message received from the iframe when its mousemove event has
        //fired
    	case "mousemove":
    		va.mouseMove(request.e.x,request.e.y);
    		break;
    	//message received from the iframe when its mouseclick event has
        //fired
    	case "mouseclick":
    		va.mouseClick(request.e.x,request.e.y);
    		break;
    	//message received from the iframe when its keydown event has
        //fired
    	case "keydown":
    		va.shortCut(request.e.keyCode,request.e.altKey);
    		break;
    	//message received from the iframe when it want to open an url
    	case "openurl":
    		//check if the url is encrypted and then update the location
    		//of the top browser window
    		if(request.e.url.search("load[?]rid=")!=-1) {
    			va.setWinRid(request.e.url.substr(request.e.url.indexOf("load?rid=")+9));
    		}
    		else {
    			va.setWinUrl(request.e.url);
    		}
    		break;
        //message received from the iframe when the Volunia logo is pressed
    	case "openvol":
    		va.setWinUrl("http://www.volunia.com/load?rid="+VoluniAppUtils.getRid(window.location.href));
    		break;
    	//message received from the iframe when the conteiner dimension is changed
    	//(to readapt the content)
    	case "resize":
    		va.pref.adapX = request.e.x;
    		va.pref.adapY = request.e.y;
    		va.pref.adapW = request.e.w;
    		va.pref.adapH = request.e.h;
    		va.pref.adap = va.pref.adap;
    		break;
    	}
    	break;
    //message received from the PopUp when the preferences of the application
    //changes
    case "chgLS":
        va.pref.stat=request.ls.stat;
        va.pref.hide=request.ls.hide;
       	va.pref.acti=request.ls.acti;
       	va.pref.adapX = request.ls.adapX;
       	va.pref.adapY = request.ls.adapY;
       	va.pref.adapW = request.ls.adapW;
       	va.pref.adapH = request.ls.adapH;
        va.pref.adap=request.ls.adap;
        break;
    }
};