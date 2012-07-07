/****copyright notice	*************************************************
 * 
 * 	Original Project: VoluniApp
 * 	Original File: vaBckPg.js
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
 * 	File that contains the script of the background page
 ***********************************************************************/


initLS();

chrome.extension.onRequest.addListener(function(request, sender, response){    
	switch(request.msg){
		case "getLS":
			response({ls: localStorage});
			break;
		case "setLS":
			setRequestLS(request);
			break;
		case "chgLS":
			setRequestLS(request);
			chrome.tabs.getSelected(null,function(tab){
				chrome.tabs.sendRequest(tab.id,{msg:"chgLS",ls:localStorage});
			});
			break;
		case "event":
			chrome.tabs.sendRequest(sender.tab.id,{msg:"event",e:request.e});
			break;
		case "getElementPoint":
			chrome.tabs.sendRequest(sender.tab.id,{msg:"getElementPoint",x:request.x,y:request.y}, function(innerResponse){
				response({element:innerResponse.element});
			});
			break;
		case "getElementJquery":
			chrome.tabs.sendRequest(sender.tab.id,{msg:"getElementJquery",j:request.j}, function(innerResponse){
				response({element:innerResponse.element});
			});
			break;
		case "getSize":
			chrome.tabs.sendRequest(sender.tab.id,{msg:"getSize",size:request.size}, function(innerResponse){
				response({size:innerResponse.size});
			});
			break;
		case "bookmark":
			chrome.bookmarks.create({
				'title':request.title,
                'url': request.url});
			break;
	}
});

function initLS() {
    if(!localStorage.frst){
        chrome.tabs.create({
                           url: "http://voluniapp.majac89.com"
                           });
        localStorage.frst = "true";
    } 
    
    if(!localStorage.stat || !localStorage.hide || !localStorage.acti || !localStorage.adap|| !localStorage.adapX|| !localStorage.adapY|| !localStorage.adapW|| !localStorage.adapH || !localStorage.btt){
        localStorage.stat = "_o_";
        localStorage.hide = "_s_";
        localStorage.acti = "_a_"; 
        localStorage.adap = "_o_";
        localStorage.adapX = 0;
        localStorage.adapY = 0; 
        localStorage.adapW = 0; 
        localStorage.adapH = 0; 
        localStorage.btt = "_y_";
    }
}

function setRequestLS(request) {
    if(request.stat!=null)
        localStorage.stat = request.stat;
    if(request.hide!=null)
        localStorage.hide = request.hide;
    if(request.acti!=null)
        localStorage.acti = request.acti; 
    if(request.adap!=null)
        localStorage.adap = request.adap;
    if(request.adapX!=null)
        localStorage.adapX = request.adapX;
    if(request.adapY!=null)
        localStorage.adapY = request.adapY;
    if(request.adapW!=null) 
        localStorage.adapW = request.adapW;
    if(request.adapH!=null) 
        localStorage.adapH = request.adapH;
    if(request.btt!=null)
        localStorage.btt = request.btt;
}