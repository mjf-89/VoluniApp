/****copyright notice	*************************************************
 * 
 * 	Original Project: VoluniApp
 * 	Original File: vaVoluniaCS.js
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


/************************************************************************
 * 	File that contains the ContentScript to inject inside Volunia 
 * 	(*.volunia.com/* exclunded secure.volunia.com/* )
 ***********************************************************************/


//check if Volunia is inside the VoluniApp iframe 
if(window.name=="vaFrm"){
	//<script> injection @documentStart to bypass the iframe killer of Volunia
	//(hack of the String.prototype.indexOf function)
	var scr = document.createElement("script");
	scr.innerHTML = "String.prototype.indexOfBck = String.prototype.indexOf;";
	scr.innerHTML += "String.prototype.indexOf = function(str,s){if(str=='http://www.volunia.com' || str=='https://secure.volunia.com')return 1;else return this.indexOfBck(str,s);};";
	scr.innerHTML += "function reset(){if(document.body){String.prototype.indexOf=String.prototype.indexOfBck;}else{setTimeout('reset()',1);}}setTimeout('reset()',1);";
	document.documentElement.appendChild(scr);
	
	//programmatic injection of the stylsheet that will modify the apparence
	//of Volunia inside VoluniApp
	var lnk = document.createElement("link");
	lnk.rel = 'stylesheet';
	lnk.type = 'text/css';
	lnk.href = chrome.extension.getURL("Source/vaVoluniaCS.css");
	document.documentElement.appendChild(lnk);
	
	//this listener is needed in order to avoid that Volunia (inside Volunia)
	//can load his own frame
	$(document).bind("DOMSubtreeModified.voluniappBlck",function(e){
		$("#content>iframe").detach();
	});
	
	//wait for DOMReady
	$(document).ready(function(){
		//send an event-message "ready" to VoluniApp
		var event = new Object();
		event.type = "ready";
		event.url = document.location.href;
		chrome.extension.sendRequest({msg:"event",e:event});
		
		//ensure that the background of Volunia is transparent
		$("html").css("background-color","transparent");
		$("body").css("background-color","transparent");
		
		//inject a <div> in the Header in order to print the name
		//of the application
		setVoluniappDiv();
		//modify the behaviour of the Volunia-logo-button
		setOpenVoluniaBtt();
		
		//bind a listener to the "mousemove" event
		$(document).bind("mousemove.voluniapp",function(e){
			//send an event-message "mousemove" to VoluniApp
			var event = new Object();
			event.type = "mousemove";
			event.x = e.pageX;
			event.y = e.pageY;
                              
			chrome.extension.sendRequest({msg:"event",e:event});
		});
		
		//bind a listener to the "keydown" event
		$(document).bind("keydown.voluniapp",function(e){
			//send an event-message "keydown" to VoluniApp
			var event = new Object();
			event.type = "keydown";
			event.keyCode = e.keyCode;
			event.altKey = e.altKey;
			chrome.extension.sendRequest({msg:"event",e:event});
		});
		
		//bind a listener to the "DOMSubtreeModified" event
		$(document).bind("DOMSubtreeModified.voluniapp",function(e){
			//if the element is a reachMe button
			if($(".ui-tooltip-content a[rel*='reachme']").legth != 0) {
				//modify the behaviour of the button
				setReachMeHandler();
			}
			
			//if the element is the chat_panel
			if($(e.srcElement).attr("id")=="ch_chat_panel"){
				//send an event-message "resize" to VoluniApp
				resizeEvent();
			}
		});
	});
}
//if Volunia is not closed in VoluniApp iframe
else{
	$(document).ready(function(){
		//create the VoluniApp button in Volunia Header
		setVoluniappBtt();
	});
}
	

//add a listener to chrome onRequest event
chrome.extension.onRequest.addListener(function(request, sender, response){
    switch(request.msg){
    case "getElementPoint":
    	//return the element @(x,y)
    	//Pay attention: the element returned is a small JSON object with
    	//just few properties (see function getResponseElement)
        response({element:getResponseElement($(document.elementFromPoint(request.x,request.y)))});
        break;
    case "getElementJquery":
    	//return the element $(request.j)
    	//Pay attention: the element returned is a small JSON object with
    	//just few properties (see function getResponseElement)
    	response({element:getResponseElement($(request.j))});
    	break;
    case "getSize":
    	//return the size of the free area (in order to adapt the content
    	//of the webpage)
    	response({size:getSize()});
    	break;
    }
});


/************************************************************************
 * 	function setVoluniappDiv()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		inject a <div> in the Header in order to print the name
 *		of the application
 ***********************************************************************/
function setVoluniappDiv() {
	//create the <div> element
	var divVoluniapp = document.createElement("div");
	divVoluniapp.innerHTML = "VOLUNIAPP v2.0";
	
	//set the position of the <div> with respect to the Header
	$(divVoluniapp).css("position","absolute");
	$(divVoluniapp).css("left","15%");
	$(divVoluniapp).css("top","25%");
	$(divVoluniapp).css("display","table-cell");
	$(divVoluniapp).css("vertical-align","middle");
	//set some properties of the <div> to adjust the apparence
	$(divVoluniapp).css("font-family","Arial,Helvetica,sans-serif");
	$(divVoluniapp).css("font-size",$(".headerCTR").height()*0.6+"px");
	$(divVoluniapp).css("-webkit-user-select","none");
	$(divVoluniapp).css("color","white");
	
	//append the <div> to the Header
	$(".headerCNT").append(divVoluniapp);
}


/************************************************************************
 * 	function setOpenVoluniaBtt()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		change the behaviour of the Volunia-logo-button in order to open
 * 		Volunia to the current webpage when it is pressed
 ***********************************************************************/
function setOpenVoluniaBtt() {
	//select the logo-button
	var btt = $(".logoHeader a").first();
	//create a handler for the "click" event
	var handler = function() {
		//send an event-message "openvol" to VoluniApp
		var event = new Object();
		event.type = "openvol";
		chrome.extension.sendRequest({msg:"event",e:event});
	};
	
	//bind the handler to modify the behaviour and clear the href attribute
	btt.click(handler);
	btt.attr("title","open in www.volunia.com");
	btt.attr("href","");
	btt.attr("rel","");
}


/************************************************************************
 * 	function setVoluniappBtt()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		create the VoluniApp button in Volunia Header;
 ***********************************************************************/
function setVoluniappBtt() {
	//send a request to the VoluniApp in order to get the preferences
	chrome.extension.sendRequest({msg:"getLS"},function(response){
		//check if the btt preference is set
		if(response.ls.btt == VoluniAppPref.BTT_ON){
			//create the button (<li> element)
			var voluniappBtt = document.createElement("li");
			$(voluniappBtt).attr("id","voluniappBtt");
			$(voluniappBtt).attr("title","open VoluniAPP");
			$(voluniappBtt).css("cursor","pointer");
			
			//bind the listener for the click event
			$(voluniappBtt).click(function(){
				//change the location to the url opened inside Volunia
				window.location = VoluniAppUtils.getUrl(window.location.href.substr(window.location.href.indexOf("rid=")+4));
				//open VoluniApp
				chrome.extension.sendRequest({msg:"setLS",stat:VoluniAppPref.STAT_OPEN});
			});
			
			//set some properties to adjust the apparence
			$(voluniappBtt).css("width","20px");
			var img = document.createElement("img");
			$(img).attr("src",chrome.extension.getURL("Resources/voluniapp32.png"));
			
			//append the button to the Header
			$(voluniappBtt).append(img);
			$(".headerRight .headerIcoList").append(voluniappBtt);
		}
	});
}


/************************************************************************
 * 	function setReachMeHandler()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		change the behaviour of the reachMe button in order to change the
 * 		location of the top window when the button is pressed
 ***********************************************************************/
function setReachMeHandler() {
	//select possible reachMe buttons
	$(".ui-tooltip-content a[rel*='reachme']").each(function(){
		//save the href property of the button
		var cl = $(this).attr("href");
		//create the click handler
		var handler = function() {
			//send an event-message "openurl" to VoluniApp
			var event = new Object();
			event.type = "openurl";
			event.url = cl;
			chrome.extension.sendRequest({msg:"event",e:event});
		};
		
		//bind the handler to modify the behaviour and clear the href attribute
		$(this).click(handler);
		$(this).attr("href","");
		$(this).attr("rel","");
	});
}


/************************************************************************
 * 	function resizeEvent()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		send an event-message "resize" to VoluniApp to inform the
 * 		application that the content of the website has to be readapted
 ***********************************************************************/
function resizeEvent() {
	//send an event-message "resize" to VoluniApp
	var event = new Object();
	var size = getSize();
	event.type = "resize";
	event.x = size.x;
	event.y = size.y;
	event.w = size.w;
	event.h = size.h;
		
	chrome.extension.sendRequest({msg:"event",e:event});
}


/************************************************************************
 * 	function getResponseElement()
 * 	-arguments:
 * 		jElement: a jQuery selection;
 * 	-return:
 * 		element: a JSON object ready to be sent with sendRequest
 * 	-behaviour:
 * 		it convert the first element in the jQuery selection to a simple
 * 		JSON object with few properties.
 ***********************************************************************/
function getResponseElement(jElement) {
	var element = new Object();
	if(jElement.length) {
		element.id = jElement.first().attr("id");
		element.class = jElement.first().attr("class");
		element.left = jElement.first().offset().left;
		element.top = jElement.first().offset().top;
		element.width = jElement.first().width();
		element.height = jElement.first().height();
		element.display = jElement.first().css("display");
	}
	return element;
}


/************************************************************************
 * 	function getSize()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		size: object that holds the size of the 
 * 	-behaviour:
 * 		return the size of the free area (needed in order to adapt the 
 *		content of the webpage)
 ***********************************************************************/
function getSize() {
	var size = new Object();
	
	//set the default free-area size
	size.x = 0;
	size.y = $(".headerCTR").height();
	size.w = $(window).width();
	size.h = $(window).height();
	
	//if the chat is open than subtract its width
	if($("#ch_panel").css("display") != "none")
		size.w -= $("#ch_panel").width();
	//if the subHeader is open than subtract its height
	if($(".subHeaderCTR").css("display") != "none") {
		size.y += $(".subHeaderCTR").height();
		size.h -= $(".subHeaderCTR").height();
	}
	
	return size;
}
