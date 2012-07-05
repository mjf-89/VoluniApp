/****copyright notice	*************************************************
 * 
 * 	Original Project: VoluniApp
 * 	Original File: vaPopPg.js
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
 * 	File that contains the script of the popup
 ***********************************************************************/


function setPref(pref,val) {
    var msg = new Object();
    msg["msg"] = "chgLS";
    
    switch(pref) {
        case VoluniAppPref.ACTI:
            msg[VoluniAppPref.ACTI] = val;
            break;
        case VoluniAppPref.HIDE:
            msg[VoluniAppPref.HIDE] = val;
            break;
        case VoluniAppPref.BTT:
            if($("input:checkbox[name=btt]")[0].checked)
                val = VoluniAppPref.BTT_ON;
            else
                val = VoluniAppPref.BTT_OFF;
            msg[VoluniAppPref.BTT] = val;
            break;
        case VoluniAppPref.ADAP:
            if($("input:checkbox[name=adap]")[0].checked)
                val = VoluniAppPref.ADAP_ON;
            else
                val = VoluniAppPref.ADAP_OFF;
            msg[VoluniAppPref.ADAP] = val;
            break;
    }
    
    chrome.extension.sendRequest(msg);
}

function initVal(){
	if(localStorage.acti == VoluniAppPref.ACTI_ACTIVE)
		$('input:radio[name=acti]')[0].checked = true;
	else
		$('input:radio[name=acti]')[1].checked = true;
	 
	if(localStorage.hide == VoluniAppPref.HIDE_AUTO)
		$('input:radio[name=hide]')[0].checked = true;
	else
		$('input:radio[name=hide]')[1].checked = true;
	 
	if(localStorage.adap == VoluniAppPref.ADAP_ON)	
		$("input:checkbox[name=adap]")[0].checked = true;
	else
		$("input:checkbox[name=adap]")[0].checked = false;
	 
	if(localStorage.btt == VoluniAppPref.BTT_ON)	
		$("input:checkbox[name=btt]")[0].checked = true;
	else
		$("input:checkbox[name=btt]")[0].checked = false;
 }

function initHan(){
    $("input[name=acti][value=_a_]").click(function(){setPref('acti','_a_');});
    $("input[name=acti][value=_d_]").click(function(){setPref('acti','_d_');});
    
    $("input[name=hide][value=_a_]").click(function(){setPref('hide','_a_');});
    $("input[name=hide][value=_s_]").click(function(){setPref('hide','_s_');});
    
    $("input[name=btt]").click(function(){setPref('btt',null);});
    
    $("input[name=adap]").click(function(){setPref('adap',null);});
}

$(document).ready(function(){
	initVal();
	initHan();
});