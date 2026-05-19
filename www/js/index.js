var app = {
	launchUrl: "https://188b143btrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f#Shell-home",
	topicName: "BTB",

	relaunchTimer: null,
	restoreTimer: null,
	waitingBackPressedOnce: false,

	browserRef: null,
	backHandler: null,
	firebaseMessageHandlerRegistered: false,

	initialize: function () {
		this.backHandler = this.onBackButton.bind(this);

		document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
	},

	onDeviceReady: function () {
		this.registerFirebase();
		this.enableCustomBack();
		this.registerNetworkHandlers();
		this.startApp();
	},

	enableCustomBack: function () {
		document.removeEventListener("backbutton", this.backHandler, false);
		document.addEventListener("backbutton", this.backHandler, false);
	},

	disableCustomBack: function () {
		document.removeEventListener("backbutton", this.backHandler, false);
	},

	getFirebaseMessaging: function () {
		return window.FirebasexMessaging || window.FirebasePlugin || null;
	},

	registerFirebase: function () {
		var messaging = this.getFirebaseMessaging();
		if (!messaging) {
			console.warn("Firebase messaging plugin is not available");
			return;
		}

		var self = this;

		this.requestNotificationPermission(function () {
			self.registerFirebaseMessageHandler();
			self.subscribeToNotifications();
			self.logFirebaseToken();
		});

		if (typeof messaging.onTokenRefresh === "function") {
			messaging.onTokenRefresh(function (token) {
				console.log("FCM Token refreshed:", token);
				self.subscribeToNotifications();
			}, function (error) {
				console.error("FCM token refresh error:", error);
			});
		}
	},

	requestNotificationPermission: function (done) {
		var messaging = this.getFirebaseMessaging();

		if (!messaging || typeof messaging.hasPermission !== "function") {
			done();
			return;
		}

		messaging.hasPermission(function (hasPermission) {
			if (hasPermission) {
				console.log("Notification permission is granted");
				done();
				return;
			}

			if (typeof messaging.grantPermission !== "function") {
				console.warn("Notification permission is not granted and cannot be requested");
				done();
				return;
			}

			messaging.grantPermission(function (granted) {
				console.log("Notification permission was " + (granted ? "granted" : "denied"));
				done();
			}, function (error) {
				console.error("Notification permission error:", error);
				done();
			});
		}, function (error) {
			console.error("Notification permission check error:", error);
			done();
		});
	},

	registerFirebaseMessageHandler: function () {
		var messaging = this.getFirebaseMessaging();

		if (
			this.firebaseMessageHandlerRegistered ||
			!messaging ||
			typeof messaging.onMessageReceived !== "function"
		) {
			return;
		}

		this.firebaseMessageHandlerRegistered = true;

		messaging.onMessageReceived(function (message) {
			console.log("FCM Message:", JSON.stringify(message));
		}, function (error) {
			console.error("FCM message handler error:", error);
		});
	},

	logFirebaseToken: function () {
		var messaging = this.getFirebaseMessaging();

		if (!messaging || typeof messaging.getToken !== "function") {
			return;
		}

		messaging.getToken(function (token) {
			console.log("FCM Token:", token);
		}, function (error) {
			console.error("FCM token error:", error);
		});
	},

	subscribeToNotifications: function () {
		var messaging = this.getFirebaseMessaging();

		if (!messaging || typeof messaging.subscribe !== "function") {
			return;
		}

		messaging.subscribe(
			this.topicName,
			function () {
				console.log("Subscribed to BTB");
			},
			function (error) {
				console.error("Subscribe error:", error);
			}
		);
	},

	registerNetworkHandlers: function () {
		document.addEventListener("online", this.startApp.bind(this), false);

		document.addEventListener("offline", function () {
			if (!app.browserRef) {
				app.clearTimers();
				app.setStatusText("No internet connection");
			}
		}, false);
	},

	setStatusText: function (text) {
		var el = document.getElementById("statusText");
		if (el) {
			el.innerText = text;
		}
	},

	startApp: function () {
		if (
			navigator.connection &&
			typeof Connection !== "undefined" &&
			navigator.connection.type === Connection.NONE
		) {
			this.setStatusText("No internet connection");
			return;
		}

		this.setStatusText("Please wait...");
		this.scheduleRelaunch();
	},

	clearTimers: function () {
		if (this.relaunchTimer) {
			clearTimeout(this.relaunchTimer);
			this.relaunchTimer = null;
		}

		if (this.restoreTimer) {
			clearTimeout(this.restoreTimer);
			this.restoreTimer = null;
		}
	},

	scheduleRelaunch: function () {
		var self = this;

		this.clearTimers();
		this.waitingBackPressedOnce = false;
		this.setStatusText("Please wait...");

		this.relaunchTimer = setTimeout(function () {
			self.openLaunchpad();
		}, 2000);
	},

	openLaunchpad: function () {
		var self = this;

		this.relaunchTimer = null;
		this.waitingBackPressedOnce = false;
		this.setStatusText("Opening...");

		if (this.browserRef) {
			try {
				this.browserRef.close();
			} catch (e) {
				console.log("Browser close error:", e);
			}
			this.browserRef = null;
		}

		this.browserRef = cordova.InAppBrowser.open(
			this.launchUrl,
			"_blank",
			"location=no,toolbar=no,zoom=no,hideurlbar=yes,hardwareback=yes,clearcache=no,clearsessioncache=no"
		);

		if (!this.browserRef) {
			this.setStatusText("Cannot open browser");
			return;
		}

		// Let InAppBrowser handle the hardware back button while it is open.
		this.disableCustomBack();

		this.browserRef.addEventListener("loadstop", function (event) {
			console.log("loadstop url:", event && event.url ? event.url : "");
		});

		this.browserRef.addEventListener("loaderror", function (event) {
			console.error("Launchpad load error:", event);

			self.browserRef = null;
			self.enableCustomBack();
			self.setStatusText("Load error, retrying...");
			self.scheduleRelaunch();
		});

		this.browserRef.addEventListener("exit", function () {
			console.log("Browser closed");

			self.browserRef = null;
			self.enableCustomBack();
			self.setStatusText("Please wait...");
			self.scheduleRelaunch();
		});
	},

	onBackButton: function () {
		var self = this;

		// This handler is active only on the logo/loading screen.
		if (this.browserRef) {
			return;
		}

		this.clearTimers();

		if (!this.waitingBackPressedOnce) {
			this.waitingBackPressedOnce = true;
			this.setStatusText("Press back again to exit");

			this.restoreTimer = setTimeout(function () {
				self.waitingBackPressedOnce = false;
				self.setStatusText("Please wait...");
				self.scheduleRelaunch();
			}, 2000);
		} else {
			navigator.app.exitApp();
		}
	}
};

app.initialize();
