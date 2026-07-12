var app = {
	launchpadBaseUrl: "https://188b143btrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f",
	defaultHash: "#Shell-home",
	topicName: "BTB",
	retryDelays: [2000, 5000, 15000, 30000],

	relaunchTimer: null,
	restoreTimer: null,
	waitingBackPressedOnce: false,
	retryAttempt: 0,
	pendingLaunchUrl: null,
	suppressNextExitRelaunch: false,

	browserRef: null,
	backHandler: null,
	firebaseMessageHandlerRegistered: false,

	initialize: function () {
		this.backHandler = this.onBackButton.bind(this);

		document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
	},

	onDeviceReady: function () {
		this.bindRetryButton();
		this.registerFirebase();
		this.enableCustomBack();
		this.registerNetworkHandlers();
		this.startApp();
	},

	bindRetryButton: function () {
		var retryButton = document.getElementById("retryButton");
		if (!retryButton) {
			return;
		}

		retryButton.addEventListener("click", this.retryNow.bind(this), false);
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
		});

		if (typeof messaging.onTokenRefresh === "function") {
			messaging.onTokenRefresh(function () {
				console.log("FCM token refreshed");
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

		var self = this;

		this.firebaseMessageHandlerRegistered = true;

		messaging.onMessageReceived(function (message) {
			if (self.isNotificationTap(message)) {
				self.openNotificationTarget(message);
			}
		}, function (error) {
			console.error("FCM message handler error:", error);
		});
	},

	isNotificationTap: function (message) {
		if (!message) {
			return false;
		}

		return !!(message.tap || message.wasTapped || message.coldstart);
	},

	openNotificationTarget: function (message) {
		var targetUrl = this.getNotificationLaunchUrl(message);

		this.retryAttempt = 0;
		this.startApp(targetUrl, { immediate: true });
	},

	getNotificationLaunchUrl: function (message) {
		var route = this.getMessageValue(message, "route") ||
			this.getMessageValue(message, "target") ||
			this.getMessageValue(message, "screen");

		if (route) {
			return this.getRouteUrl(route);
		}

		var title = this.getMessageValue(message, "title");
		var body = this.getMessageValue(message, "body");
		var text = ((title || "") + " " + (body || "")).toLowerCase();

		if (text.indexOf("super") >= 0 || text.indexOf("sclear") >= 0) {
			return this.getRouteUrl("super");
		}

		return this.getRouteUrl("btb");
	},

	getMessageValue: function (message, key) {
		if (!message || !key) {
			return "";
		}

		if (message[key]) {
			return String(message[key]);
		}

		if (message.data && message.data[key]) {
			return String(message.data[key]);
		}

		if (message.notification && message.notification[key]) {
			return String(message.notification[key]);
		}

		return "";
	},

	getRouteUrl: function (route) {
		var routeText = String(route || "");
		var normalizedRoute = routeText.toLowerCase();
		var hash = this.defaultHash;

		if (
			normalizedRoute === "super" ||
			normalizedRoute === "superlog" ||
			normalizedRoute === "super-log" ||
			normalizedRoute === "sclear"
		) {
			hash = "#SuperLog-display";
		} else if (normalizedRoute === "btb" || normalizedRoute === "main" || normalizedRoute === "live") {
			hash = "#btb-manage";
		} else if (routeText.indexOf("#") === 0) {
			hash = routeText;
		}

		return this.launchpadBaseUrl + hash;
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
		var self = this;

		document.addEventListener("online", function () {
			self.handleOnline();
		}, false);

		document.addEventListener("offline", function () {
			if (!self.browserRef) {
				self.clearTimers();
				self.showOfflineState();
			}
		}, false);
	},

	handleOnline: function () {
		if (this.browserRef) {
			return;
		}

		this.retryAttempt = 0;
		this.startApp(this.pendingLaunchUrl || this.getRouteUrl("home"), { immediate: true });
	},

	setStatusText: function (text) {
		var el = document.getElementById("statusText");
		if (el) {
			el.innerText = text;
		}
	},

	setDetailText: function (text) {
		var el = document.getElementById("detailText");
		if (el) {
			el.innerText = text;
		}
	},

	setRetryVisible: function (visible, label) {
		var retryButton = document.getElementById("retryButton");
		if (!retryButton) {
			return;
		}

		retryButton.hidden = !visible;
		if (label) {
			retryButton.innerText = label;
		}
	},

	isOffline: function () {
		return !!(
			navigator.connection &&
			typeof Connection !== "undefined" &&
			navigator.connection.type === Connection.NONE
		);
	},

	showOfflineState: function () {
		this.setStatusText("No internet connection");
		this.setDetailText("Check your connection and try again.");
		this.setRetryVisible(true, "Retry");
	},

	startApp: function (url, options) {
		var launchUrl = url || this.getRouteUrl("home");
		var settings = options || {};

		this.pendingLaunchUrl = launchUrl;

		if (this.isOffline()) {
			this.showOfflineState();
			return;
		}

		this.setStatusText("Opening BTB");
		this.setDetailText("Connecting to the BTB mobile experience.");
		this.setRetryVisible(false);
		this.scheduleRelaunch(launchUrl, settings.immediate ? settings : { initial: true });
	},

	retryNow: function () {
		this.retryAttempt = 0;
		this.clearTimers();
		this.startApp(this.pendingLaunchUrl || this.getRouteUrl("home"), { immediate: true });
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

	scheduleRelaunch: function (url, options) {
		var self = this;
		var settings = options || {};
		var launchUrl = url || this.getRouteUrl("home");
		var delay = settings.immediate ? 0 : settings.initial ? 1200 : this.getNextRetryDelay();

		this.clearTimers();
		this.waitingBackPressedOnce = false;
		this.pendingLaunchUrl = launchUrl;

		if (delay > 0 && !settings.initial) {
			this.setStatusText("Connection problem");
			this.setDetailText("Retrying in " + Math.round(delay / 1000) + " seconds.");
			this.setRetryVisible(true, "Retry now");
		}

		this.relaunchTimer = setTimeout(function () {
			self.openLaunchpad(launchUrl);
		}, delay);
	},

	getNextRetryDelay: function () {
		var index = Math.min(this.retryAttempt, this.retryDelays.length - 1);
		var delay = this.retryDelays[index];

		this.retryAttempt += 1;
		return delay;
	},

	closeBrowserForRetry: function () {
		if (!this.browserRef) {
			return;
		}

		this.suppressNextExitRelaunch = true;

		try {
			this.browserRef.close();
		} catch (e) {
			console.log("Browser close error:", e);
		}

		this.browserRef = null;
	},

	openLaunchpad: function (url) {
		var self = this;
		var launchUrl = url || this.pendingLaunchUrl || this.getRouteUrl("home");

		this.relaunchTimer = null;
		this.waitingBackPressedOnce = false;
		this.setStatusText("Opening BTB");
		this.setDetailText("Loading the requested BTB screen.");
		this.setRetryVisible(false);

		this.closeBrowserForRetry();

		this.browserRef = cordova.InAppBrowser.open(
			launchUrl,
			"_blank",
			"location=no,toolbar=no,zoom=no,hideurlbar=yes,hardwareback=yes,clearcache=no,clearsessioncache=no"
		);

		if (!this.browserRef) {
			this.setStatusText("Cannot open BTB");
			this.setDetailText("The in-app browser could not be started.");
			this.setRetryVisible(true, "Retry");
			return;
		}

		// Let InAppBrowser handle the hardware back button while it is open.
		this.disableCustomBack();

		this.browserRef.addEventListener("loadstop", function (event) {
			console.log("loadstop url:", event && event.url ? event.url : "");
			self.retryAttempt = 0;
		});

		this.browserRef.addEventListener("loaderror", function (event) {
			console.error("Launchpad load error:", event);

			self.closeBrowserForRetry();
			self.enableCustomBack();
			self.scheduleRelaunch(launchUrl);
		});

		this.browserRef.addEventListener("exit", function () {
			console.log("Browser closed");

			self.enableCustomBack();

			if (self.suppressNextExitRelaunch) {
				self.suppressNextExitRelaunch = false;
				return;
			}

			self.browserRef = null;
			self.setStatusText("BTB closed");
			self.setDetailText("Reopening the mobile experience.");
			self.scheduleRelaunch(self.pendingLaunchUrl || self.getRouteUrl("home"), { initial: true });
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
			this.setDetailText("BTB will reopen automatically if you stay here.");
			this.setRetryVisible(true, "Open BTB");

			this.restoreTimer = setTimeout(function () {
				self.waitingBackPressedOnce = false;
				self.startApp(self.pendingLaunchUrl || self.getRouteUrl("home"));
			}, 2000);
		} else {
			navigator.app.exitApp();
		}
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = app;
}

if (typeof document !== "undefined") {
	app.initialize();
}
