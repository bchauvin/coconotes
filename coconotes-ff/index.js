/* Copyright Bertrand Chauvin (2015)

bertrand.chauvin@gmail.com

This software is a computer program whose purpose is to take screenshots of web pages and send them to the coconotes note-taking application.

This software is governed by the CeCILL-C license under French law and
abiding by the rules of distribution of free software.  You can  use, 
modify and/ or redistribute the software under the terms of the CeCILL-C
license as circulated by CEA, CNRS and INRIA at the following URL
"http://www.cecill.info". 

As a counterpart to the access to the source code and  rights to copy,
modify and redistribute granted by the license, users are provided only
with a limited warranty  and the software's author,  the holder of the
economic rights,  and the successive licensors  have only  limited
liability. 

In this respect, the user's attention is drawn to the risks associated
with loading,  using,  modifying and/or developing or reproducing the
software by the user in light of its specific status of free software,
that may mean  that it is complicated to manipulate,  and  that  also
therefore means  that it is reserved for developers  and  experienced
professionals having in-depth computer knowledge. Users are therefore
encouraged to load and test the software's suitability as regards their
requirements in conditions enabling the security of their systems and/or 
data to be ensured and,  more generally, to use and operate it in the 
same conditions as regards security. 

The fact that you are presently reading this means that you have had
knowledge of the CeCILL-C license and that you accept its terms.
*/

exports.dummy = dummy;

var { ToggleButton } 	= require('sdk/ui/button/toggle');
var panels 						= require("sdk/panel");
var preferences 			= require("sdk/simple-prefs").prefs;
var self 							= require("sdk/self");
var tabs 							= require("sdk/tabs");
var activeTab 				= tabs.activeTab;
var window 						= require('sdk/window/utils').getMostRecentBrowserWindow();

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

////
// Connection info management
////

// Update preferences events
require("sdk/simple-prefs").on("serverUrl", updateConnectionInfo);
require("sdk/simple-prefs").on("serverUsername", updateConnectionInfo);
require("sdk/simple-prefs").on("serverPassword", updateConnectionInfo);

// Connection info registration
function updateConnectionInfo(prefName) {
	console.log("Preference " + prefName + " has changed");
	var connectionInfo = { "serverUrl": preferences.serverUrl, "username": preferences.serverUsername, "password": preferences.serverPassword };
	panel.port.emit("connectionInfo", connectionInfo);
}

////
// Panel management
////

var button = ToggleButton({
	id: "coconotes",
	label: "coconotes",
	icon: {
		"16": "./logo/coconotes-logo-16.png",
		"32": "./logo/coconotes-logo-32.png",
		"64": "./logo/coconotes-logo-64.png"
	},
	onChange: handleChange
});

var panel = panels.Panel({
	width: 500,
	height: 425,
	contentURL: self.data.url("panel-coconotes.html"),
	contentScriptFile: [self.data.url("js/jquery-2.1.3.min.js"),self.data.url("js/panel-coconotes.js")],
	onHide: handleHide
});

// When the panel is displayed it generates an event called "show": 
// we will listen for that
panel.on("show", function() {
	var connectionInfo = { "serverUrl": preferences.serverUrl, "username": preferences.serverUsername, "password": preferences.serverPassword };

	panel.port.emit("resetForm");
	panel.port.emit("winTitle", activeTab.title);
	panel.port.emit("tabUrl", activeTab.url);
	panel.port.emit("defaultTags", preferences.defaultTags);
	panel.port.emit("descFocus");
	panel.port.emit("connectionInfo", connectionInfo);

	// Send screenshot
	sendBase64Screenshot();
	
	// Get URL content
	activeTab.attach({
		contentScript: "self.postMessage(document.body.innerHTML);",
		onMessage: function(urlContent) {
		  urlContent = prepareUrlContent(urlContent);
		  console.log("Tab data for URL content received: " + urlContent);
		  panel.port.emit("urlContent", urlContent);
		}
	});
});

function sendBase64Screenshot() {
	var imgData;
	activeTab.attach({
    contentScript: "self.postMessage(document.body.scrollHeight);", // receives the total scroll height of tab
    onMessage: function(data)
    {
    	if(!data) {
    		console.log("WARN: No screenshot data detected, no screenshot can be made.");
    		return null;
    	}
      console.log("Tab data for screenshot received");
      imgData = data;
      var thumbnail = window.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
      thumbnail.width = window.screen.availWidth ;
      thumbnail.height = window.screen.availHeight ;
      var ctx = thumbnail.getContext("2d");
      var snippetWidth = window.outerWidth ;
      var snippetHeight = window.outerHeight ;
      ctx.canvas.left  = 0;
      ctx.canvas.top = 0;
      ctx.canvas.width  = window.innerWidth;
      ctx.canvas.height = imgData; //canvas height is made equal to the scroll height of window
      ctx.drawWindow(window, 0, 0, snippetWidth, snippetHeight+imgData, "rgb(255,255,255)"); 

      var imageDataUri=thumbnail.toDataURL('image/png');
      imageDataUri = imageDataUri.replace("image/png", "image/octet-stream");        
      panel.port.emit("urlScreenshot", imageDataUri);
    }
  });
}

function prepareUrlContent(urlContent) {
	if(!urlContent) {
		console.log("WARN: No content in the active tab, no fulltext can be extracted.");
		return "";
	}
	urlContent = urlContent.replace(/(<([^>]+)>)/ig," "); 		// Remove HTML tags
	urlContent = urlContent.replace(/"/g," "); 								// Remove quotes
	urlContent = urlContent.replace(/<!--[\s\S]*?-->/g,' ');	// Remove HTML comments
	
	// Replace special whitespace characters with a space
	urlContent = urlContent.replace(/\0{1,}/g, ' '); 				// Nul
	urlContent = urlContent.replace(/\n{1,}/g, ' '); 				// New line
	urlContent = urlContent.replace(/\r{1,}/g, ' '); 				// Carriage return
	urlContent = urlContent.replace(/\f{1,}/g, ' '); 				// Line feed
	urlContent = urlContent.replace(/\t{1,}/g, ' '); 				// Tab
	urlContent = urlContent.replace(/\v{1,}/g, ' '); 				// Vertical tab
	urlContent = urlContent.replace(/\s{2,}/g, ' '); 				// Spaces
	return urlContent;
}

function handleChange(state) {
	if (state.checked) {
		panel.show({
			position: button
		});
	}
}

function handleHide() {
	button.state('window', {checked: false});
}
