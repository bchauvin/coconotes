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

// Reset form
self.port.on("resetForm", function resetForm() {
	$("#formContainer").show();
	$("#progress").html("");

	if($("#previousPanelOpeningUrl").val() !== $("#noteUrl").val() 
	|| $("#previousPanelOpeningUrl").val() == null 
	|| $("#previousPanelOpeningUrl").val().trim() == "" 
	) {
		$("#noteDesc").val("");
	}
});

// Remove firefox name from window's title
self.port.on("winTitle", function setWinTitle(winTitle) {
	noteTitle.value = winTitle.replace(" - Mozilla Firefox", "");
});

// Store URL in a hidden field
self.port.on("tabUrl", function setTabUrl(tabUrl) {
	noteUrl.value = encodeURIComponent(tabUrl);
});

// Store screenshot in a hidden field
self.port.on("urlScreenshot", function setUrlScreenshot(urlScreenshot) {
	urlScreenshot.src = urlScreenshot;
});

// Store URL content in a hidden field
self.port.on("urlContent", function setUrlContent(urlContent) {
	urlContent.value = urlContent;
});

// Put default tags
self.port.on("defaultTags", function setDefaultTags(defaultTags) {
	console.log("previous url: " + $("#previousPanelOpeningUrl").val().trim());
	if($("#previousPanelOpeningUrl").val() !== $("#noteUrl").val()
	|| $("#previousPanelOpeningUrl").val() == null 
	|| $("#previousPanelOpeningUrl").val().trim() == ""  
	) {
		$("#noteTags").val(defaultTags);
	}
});

// Set focus on desc to let user type directly
self.port.on("descFocus", function setDescFocus() {
	noteDesc.focus();
});

// Store connection info for further use
self.port.on("connectionInfo", function setConnectionInfo(connectionInfo) {
	$("#serverUrl").val(connectionInfo.serverUrl);
	$("#username").val(connectionInfo.username);
	$("#password").val(connectionInfo.password);
	console.log("Connection info is now stored");
});

// Send page info to server
$(document).ready(function() {
  console.log("jquery ready");
	
	// Show final confirmation message
	function showConfirmationMsg(coconote) {
		$("#progress").html("<strong>Coconote created !</strong>");
		$("#previousPanelOpeningUrl").val("");
		$("#formContainer").hide();
	}

	$("#go").on( "click", function(event) {
		var url = $("#serverUrl").attr("value");
		var username = $("#username").attr("value");
		var password = $("#password").attr("value");

		// Define current Url to avoid resetting form 
		// when the panel is opened multiple times before storing the coconote 
		$("#previousPanelOpeningUrl").val(decodeURIComponent($("#noteUrl").val()));

		// Prepare to connect
		console.log("GO GO GO !!!");
		console.log("server: " + url);
		console.log("username: " + username);
		if(password) {
			console.log("password: ***");		
		} else {
			console.log("WARN: no password provided");
		}
		$("#progress").html("Connecting...");

		
		var noteTags = $("#noteTags").val();
		// Remove possible typing errors in tags 
		// Multiple commas
		noteTags = noteTags.replace(/,{2,}/g, ',');
		// Multiple spaces
		noteTags = noteTags.replace(/\s{2,}/g, ' ');
		// Space before comma
		noteTags = noteTags.replace(/ ,/g, ',');
		// Trailing comma
		noteTags = noteTags.trim().replace(/,$/, "");
		console.log("tags to be applied: " + noteTags);

		// Prepare variables for note creation
		var noteTitle = $("#noteTitle").val();
		var noteDesc = $("#noteDesc").val();
		var noteUrl = decodeURIComponent($("#noteUrl").val());
		var noteTags = $("#noteTags").val();
		// Remove possible typing errors in tags (multiple commas or spaces, trailing comma)
		noteTags = noteTags.replace(/,{2,}/g, ',');
		noteTags = noteTags.replace(/\s{2,}/g, ' ');
		noteTags = noteTags.trim().replace(/,$/, "");
		console.log("tags to be applied: " + noteTags);
	});
});
