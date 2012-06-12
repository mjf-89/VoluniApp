/****copyright notice	*************************************************
 * 
 * 	Original Project: VoluniApp
 * 	Original File: VoluniAppUtils.js
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
 * 	Class VoluniAppUtils 	
 ***********************************************************************/


/************************************************************************
 * 	function VoluniAppUtils constructor
 * 	-arguments:
 * 		/
 * 	-return:
 * 		/
 * 	-behaviour:
 * 		the class is just a container to hold a set of utilities.
 * 		There are only static methods, the costructor has nothing to
 * 		do;
 ***********************************************************************/
function VoluniAppUtils() {
};

//function to encode a string with Base64 algorithm
VoluniAppUtils.eBase64 = function (str){
	var enc="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var msk=0xFC0000;
	var pad;
	var ind;
	
	var strE="";
	
	pad=0;
	while(str.length%3){
		str = str.concat(String.fromCharCode(0x00));
		pad++;
	}
	
	for(var i=0; i<str.length/3; i++){
		ind = 0x00;
		ind=(str.charCodeAt(i*3)<<16)|(str.charCodeAt(i*3+1)<<8)|(str.charCodeAt(i*3+2));
		for(var j=0; j<4; j++){
			strE = strE.concat(enc[(ind&msk)>>18]);
			ind = ind<<6;
		};
	}
	
	strE = strE.slice(0,strE.length-pad);
	for(var i=0; i<pad; i++){
		strE = strE.concat(enc[64]);
	}
	
	return strE;
};

//function to decode a string encoded with Base64 algorithm
VoluniAppUtils.dBase64 = function (str){
	var enc="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var msk=0xFF0000;
	var ind;
	
	var strD="";
	
	while(str.length%4){
		str = str.concat("=");
	}
	
	for(var i=0; i<str.length/4; i++){
		ind = 0x00;
		for(var j=0; j<4; j++){
			ind = ind<<6;
			if(str[i*4+j]!="="){
				ind = ind|enc.indexOf(str[i*4+j]);
			}
			else{
				ind = ind|0x00;
			}
		}
		for(var j=0; j<3; j++){
			strD = strD.concat(String.fromCharCode((ind&msk)>>16));
			ind = ind<<8;
		}
	}
	return strD;
};

//function to encode an url into a rid (used in www.volunia.com as encoded url)
VoluniAppUtils.getRid = function (url){
	var ridDom;
	var ridUrl;
	var rid;
	
	ridDom = VoluniAppUtils.eBase64(url.substring(0,url.indexOf("/",url.indexOf("//")+2)+1)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
	ridUrl = VoluniAppUtils.eBase64(url).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
	while(ridUrl[ridUrl.length-1]==String.fromCharCode(0))
		ridUrl = ridUrl.substr(0,ridUrl.length-1);
	rid = ridDom+"%2A"+ridUrl;
	
	return rid;
};

//function to decode an encoded Volunia url
VoluniAppUtils.getUrl = function(rid){
	var url;
	
	url = VoluniAppUtils.dBase64(rid.replace(/-/g,"+").replace(/_/g,"/").replace(/\%2A/g,"*").split("*")[1]);
	while(url[url.length-1]==String.fromCharCode(0))
		url = url.substr(0,url.length-1);
	
	return url;
};
