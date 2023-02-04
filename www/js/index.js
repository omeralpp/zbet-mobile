
function redirectTo(location) {
	window.open = cordova.InAppBrowser.open;
	//showPleasewait('Redirecting','Please wait');
	var d = setInterval(function () {
		window.open(location, '_self',
			'location=no,zoom=no,toolbar=no');
		clearInterval(d);
	}, 1500);
}

var app = {
		// Application Constructor
		initialize: function () {
			document.addEventListener('deviceready',
				this.onDeviceReady.bind(this), false);
		},
		// deviceready Event Handler
		//
		// Bind any cordova events here. Common events are:
		// 'pause', 'resume', etc.
		onDeviceReady: function () {
			
			this.receivedEvent('deviceready');
			window.FirebasePlugin.onTokenRefresh(function(token) {
				// save this server-side and use it to push notifications to this device
				 console.log("OAP:",token);
				 FirebasePlugin.subscribe("BTB", function(){
					console.log("Subscribed to topic");
				}, function(error){
					 console.error("Error subscribing to topic: " + error);
				});
				 
				//  alert("OAP:",token);
				}, function(error) {
				 console.error(error);
				});
		},
		// Update DOM on a Received Event
		receivedEvent: function (id) {
			if (navigator.connection.type == Connection.NONE) {
				navigator.notification.alert('An internet connection is required to continue ');
				}
				else {
					redirectTo("https://eedd7ad0trial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=7878e7a3-ce12-445e-a50b-421f271a65b0#btb-manage?sap-ui-app-id-hint=saas_approuter_com.btb.btb&/?sap-iapp-state--history=TASO8CRGC6FI9RR1EYHGGWF0GEKUIJF1HNQQJ0CLU");
					//Replce URL with your website URL
				}
			}
		};
		app.initialize();