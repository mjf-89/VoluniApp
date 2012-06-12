/****copyright notice	*************************************************
 * 
 * 	Original Project: VoluniApp
 * 	Original File: VoluniAppPref.js
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
 * 	Class VoluniAppPref 	
 ***********************************************************************/


/************************************************************************
 * 	function VoluniAppPref constructor
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		define all the attributes of the class and get the preferences
 * 		from the localStorage of the application;
 * 		(pay attention to the getter/setter functions)
 ***********************************************************************/
function VoluniAppPref(va) {
	//hold the state of VoluniApp: Open/Colse
	var stat="";
	//hold the value of the hide preference: Auto/Shortcut
	var hide="";
	//hold the value of the active preference: Actie/Deactivated
	var acti="";
	//hold the value of the adaptContent preference: Adapt/NotAdapt
	var adap=""; 
	//hold the coordinates for the adaptContent feature
	var adapX = 0;
	var adapY = 0;
	var adapW = 0;
	var adapH = 0;
	
	//reference to the VoluniApp object that own this preferences
	this.va = va;
	
	//getter for the stat attribute
	this.__defineGetter__("stat",function(){
		return stat;
	});
	//setter for the stat attribute
    this.__defineSetter__("stat", function(val) {
    	//check if VoluniApp has to hide itself
    	if(val==VoluniAppPref.STAT_CLOSED){
    		//hide the wrapper
    		$(va.wrp).hide();
    		
    		//readapt the content to the window dimension
    		this.adapX = 0;
			this.adapY = 0;
			this.adapW = $(window).width();
			this.adapH = $(window).height();
			this.adap = this.adap;
    	}
    	//if VoluniApp has to show itself
    	else {
    		//show the wrapper
    		$(va.wrp).show();
    		
    		//send a request to get the size of Volunia container
    		chrome.extension.sendRequest({msg:"getSize"}, function(response){
    			//readapt the content
    			va.pref.adapX = response.size.x;
    	    	va.pref.adapY = response.size.y;
    	    	va.pref.adapW = response.size.w;
    	    	va.pref.adapH = response.size.h;
    	    	va.pref.adap = va.pref.adap;
    	    });
    	}
    	
    	//set the attribute
    	stat = val;
    	//save the attribute in the localStorage
    	this.setLocalStorage("stat");
    });
    
    //getter for the acti attribute
    this.__defineGetter__("acti",function(){
		return acti;
	});
    //setter for the acti attribute
    this.__defineSetter__("acti", function(val){
    	//set the value
    	acti = val;
    	//call the initialization function of VoluniApp
    	va.start();
    	//save the attribute in the localStorage
    	this.setLocalStorage("acti");
    });
    
    //getter for the adap attribute
    this.__defineGetter__("adap",function(){
		return adap;
	});
    //setter for the adap attribute
    this.__defineSetter__("adap", function(val){
    	//set the attribute
    	adap = val;
    	//call the adapt function of VoluniApp to adapt the content
    	//Pay attention: this is the setter only for the adap attribute, in
    	//order to adapt properly the content it is needed to set the attributes
    	//adapX, adapY, adapW, adapH before
    	va.adapt(this.adapX, this.adapY, this.adapW, this.adapH);
    	//save the attributes adap,adapX,adapY,adapW,adapH in the localStorage
    	this.setLocalStorage("adap","adapX","adapY","adapW","adapH");
    });
    
    //get the preferences stored in the localStorage
    this.getLocalStorage();
};


/************************************************************************
 * 	function setLocalStorage()
 * 	-arguments:
 * 		list of preferences to store in the localStorage
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		send a request to the background page in order to save the
 * 		preferences in the localStorage of the application.
 * 		If the function is called without arguments it stores the
 * 		whole set of preferences
 ***********************************************************************/
VoluniAppPref.prototype.setLocalStorage = function() {
	var msg = new Object();
	//set the purpose of the message
	msg["msg"] = "setLS";
	
	//parse the arguments and compose the message
	for(var i=0; i<arguments.length; i++){
		msg[arguments[i]] = this[arguments[i]];
	}
	//check if the function is called without arguments
	if(i == 0) {
		msg["stat"] = this.stat;
		msg["hide"] = this.hide;
		msg["acti"] = this.acti;
		msg["adapX"] = this.adapX;
		msg["adapY"] = this.adapY;
		msg["adapW"] = this.adapW;
		msg["adapH"] = this.adapH;
		msg["adap"] = this.adap;
	}
		
	//send the request
	chrome.extension.sendRequest(msg);
};


/************************************************************************
 * 	function getLocalStorage()
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		send a request to the background page in order to get the
 * 		localStorage of the application
 ***********************************************************************/
VoluniAppPref.prototype.getLocalStorage = function() {
	var cl = this;
	chrome.extension.sendRequest({msg:"getLS"},function(response){ 
		cl.stat=response.ls.stat;
		cl.hide=response.ls.hide;
		cl.acti=response.ls.acti;
		cl.adapX = response.ls.adapX;
		cl.adapY = response.ls.adapY;
		cl.adapW = response.ls.adapW;
		cl.adapH = response.ls.adapH;
		cl.adap=response.ls.adap; 
	});
};


//Static attributes(name of preferences and possible values)
VoluniAppPref.STAT = "stat";
VoluniAppPref.HIDE = "hide";
VoluniAppPref.ACTI = "acti";
VoluniAppPref.ADAP = "adap";
VoluniAppPref.ADAP_X = "adapX";
VoluniAppPref.ADAP_Y = "adapY";
VoluniAppPref.ADAP_W = "adapW";
VoluniAppPref.ADAP_H = "adapH";
VoluniAppPref.BTT = "btt";

VoluniAppPref.STAT_OPEN = "_o_";
VoluniAppPref.STAT_CLOSED = "_c_";
VoluniAppPref.HIDE_AUTO = "_a_";
VoluniAppPref.HIDE_SHORT = "_s_";
VoluniAppPref.ACTI_ACTIVE = "_a_";
VoluniAppPref.ACTI_DEACTI = "_d_";
VoluniAppPref.ADAP_ON = "_a_";
VoluniAppPref.ADAP_OFF = "_o_";
VoluniAppPref.BTT_ON = "_y_";
VoluniAppPref.BTT_OFF = "_n_";