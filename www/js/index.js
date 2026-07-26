var app = {
	launchpadBaseUrl: "https://188b143btrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f",
	defaultHash: "#Shell-home",
	topicName: "BTB",
	retryDelays: [2000, 5000, 15000, 30000],
	browserCloseDelay: 300,
	resumeProbeDelay: 1200,
	resumeHardRefreshAfter: 30000,

	relaunchTimer: null,
	restoreTimer: null,
	resumeProbeTimer: null,
	waitingBackPressedOnce: false,
	retryAttempt: 0,
	pendingLaunchUrl: null,
	pausedAt: 0,

	browserRef: null,
	backHandler: null,
	firebaseMessageHandlerRegistered: false,
	widgetListenerRegistered: false,

	initialize: function () {
		this.backHandler = this.onBackButton.bind(this);

		document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
	},

	onDeviceReady: function () {
		this.bindRetryButton();
		this.registerWidget();
		this.registerFirebase();
		this.enableCustomBack();
		this.registerNetworkHandlers();
		this.registerLifecycleHandlers();
		this.startApp(this.pendingLaunchUrl || undefined);
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

	getWidgetBridge: function () {
		return typeof window !== "undefined" && window.BtbWidget ? window.BtbWidget : null;
	},

	registerWidget: function () {
		var widget = this.getWidgetBridge();

		if (
			this.widgetListenerRegistered ||
			!widget ||
			typeof widget.listen !== "function"
		) {
			return;
		}

		var self = this;
		this.widgetListenerRegistered = true;

		widget.listen(function (event) {
			self.openWidgetTarget(event);
		}, function (error) {
			console.error("Widget route listener error:", error);
		});
	},

	openWidgetTarget: function (event) {
		var route = event && event.route ? event.route : "home";
		var targetUrl = this.getMatchLaunchUrl(event) ||
			this.getTotoProgramLaunchUrl(event) ||
			this.getRouteUrl(route);

		this.retryAttempt = 0;
		this.startApp(targetUrl, { immediate: true });
	},

	updateWidgetFromMessage: function (message) {
		var widget = this.getWidgetBridge();
		var payload = this.getWidgetPayload(message);

		if (!payload || !widget || typeof widget.update !== "function") {
			return false;
		}

		widget.update(payload, function () {
			console.log("BTB widget updated");
		}, function (error) {
			console.error("BTB widget update error:", error);
		});
		return true;
	},

	getWidgetPayload: function (message) {
		if (!message) {
			return null;
		}

		var targetUrl = this.getNotificationLaunchUrl(message);
		var route = targetUrl.indexOf("#SuperLog-display") >= 0
			? "super"
			: targetUrl.indexOf("#SporToto-manage") >= 0 ? "toto" : "btb";
		var title = this.getNotificationTextValue(message, "title");
		var body = this.getMessageValue(message, "widget_body") ||
			this.getNotificationTextValue(message, "body");
		var normalizedRating = this.getNotificationRating(message, body);
		var matchTarget = this.getMatchTarget(message);

		if (!title && !body) {
			return null;
		}

		title = title || (route === "super" ? "Yeni Super bildirimi" : "BTB Mobile");
		body = body || (route === "super"
			? "Super Log’u açmak için dokunun."
			: route === "toto"
				? "Spor Toto programını açmak için dokunun."
				: "BTB uygulamasını açmak için dokunun.");

		body = this.getWidgetBody(body, normalizedRating);

		var payload = {
			title: title,
			body: body,
			route: route
		};

		if (normalizedRating) {
			payload.rating = normalizedRating;
		}

		if (matchTarget) {
			payload.match_id = matchTarget.id;
			payload.match_date = matchTarget.date;
			payload.match_time = matchTarget.time;
		}

		this.addKpiWidgetValues(message, payload);
		return payload;
	},

	addKpiWidgetValues: function (message, payload) {
		var totoHits = this.getMessageValue(message, "toto_coverage_hits");
		var totoTotal = this.getMessageValue(message, "toto_coverage_total");
		var totoTarget = this.getTotoProgramTarget(message);
		var superMinRating = this.getMessageValue(message, "super_min_rating");
		var superWins = this.getMessageValue(message, "super_wins");
		var superLosses = this.getMessageValue(message, "super_losses");
		var superProfit = this.getMessageValue(message, "super_profit");

		if (
			/^\d+$/.test(totoHits) &&
			/^\d+$/.test(totoTotal) &&
			Number(totoHits) <= Number(totoTotal)
		) {
			payload.toto_coverage_hits = Number(totoHits);
			payload.toto_coverage_total = Number(totoTotal);
		}

		if (totoTarget) {
			payload.toto_program_gc_no = Number(totoTarget.gcNo);
			payload.toto_program_version = Number(totoTarget.version);
		}

		if (
			/^[1-5]$/.test(superMinRating) &&
			/^\d+$/.test(superWins) &&
			/^\d+$/.test(superLosses) &&
			superProfit !== "" &&
			Number.isFinite(Number(superProfit))
		) {
			payload.super_min_rating = Number(superMinRating);
			payload.super_wins = Number(superWins);
			payload.super_losses = Number(superLosses);
			payload.super_profit = Number(superProfit);
		}
	},

	getNotificationTextValue: function (message, key) {
		return this.getMessageValue(message, key) ||
			this.getMessageValue(message, "notification_" + key);
	},

	getNotificationRating: function (message, body) {
		var explicitRating = this.getMessageValue(message, "rating") ||
			this.getMessageValue(message, "star") ||
			this.getMessageValue(message, "stars") ||
			this.getMessageValue(message, "super_rating");
		var normalizedRating = Number.parseInt(explicitRating, 10);

		if (normalizedRating >= 1 && normalizedRating <= 5) {
			return normalizedRating;
		}

		var text = String(body || "");
		var legacyMatch = text.match(/\brating\s*([1-5])\b/i);

		if (legacyMatch) {
			return Number.parseInt(legacyMatch[1], 10);
		}

		var starMatch = text.match(/([★⭐]{1,5})/);
		return starMatch ? starMatch[1].length : 0;
	},

	getWidgetBody: function (body, rating) {
		var source = String(body || "").trim();

		if (!rating) {
			return source;
		}

		var cleaned = source
			.replace(/\s*\(\s*rating\s*[1-5]\s*\)\s*[.!?]?\s*$/i, "")
			.replace(/\s*[★⭐]{1,5}\s*[.!?]?\s*$/, "")
			.trim();

		if (!cleaned || /[.!?]$/.test(cleaned)) {
			return cleaned;
		}

		return cleaned + ".";
	},

	normalizeMatchDate: function (value) {
		var text = String(value || "").trim();
		var compact = text.match(/^(\d{4})(\d{2})(\d{2})$/);

		if (compact) {
			return compact[1] + "-" + compact[2] + "-" + compact[3];
		}

		return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
	},

	normalizeMatchTime: function (value) {
		var text = String(value || "").trim();
		var compact = text.match(/^(\d{2})(\d{2})(\d{2})$/);

		if (compact) {
			return compact[1] + ":" + compact[2] + ":" + compact[3];
		}

		return /^\d{2}:\d{2}:\d{2}$/.test(text) ? text : "";
	},

	getMatchTarget: function (message) {
		var id = this.getMessageValue(message, "match_id") ||
			this.getMessageValue(message, "matchId");
		var date = this.normalizeMatchDate(
			this.getMessageValue(message, "match_date") ||
			this.getMessageValue(message, "matchDate")
		);
		var time = this.normalizeMatchTime(
			this.getMessageValue(message, "match_time") ||
			this.getMessageValue(message, "matchTime")
		);

		if (!/^\d+$/.test(id) || Number.parseInt(id, 10) <= 0 || !date || !time) {
			return null;
		}

		return {
			id: String(Number.parseInt(id, 10)),
			date: date,
			time: time
		};
	},

	getMatchLaunchUrl: function (message) {
		var target = this.getMatchTarget(message);

		if (!target) {
			return "";
		}

		var timeParts = target.time.split(":");
		var entityPath = "zbet_cds_005(" +
			"datum=datetime'" + target.date + "T00%253A00%253A00'," +
			"id=" + target.id + "," +
			"uzeit=time'PT" +
				timeParts[0] + "H" +
				timeParts[1] + "M" +
				timeParts[2] + "S')";

		return this.launchpadBaseUrl +
			"#btb-manage?sap-ui-app-id-hint=saas_approuter_com.btb.btb&/" +
			entityPath +
			"/?FCLLayout=MidColumnFullScreen";
	},

	getTotoProgramTarget: function (message) {
		var gcNo = this.getMessageValue(message, "toto_program_gc_no") ||
			this.getMessageValue(message, "totoProgramGcNo");
		var version = this.getMessageValue(message, "toto_program_version") ||
			this.getMessageValue(message, "totoProgramVersion");

		if (
			!/^\d+$/.test(gcNo) ||
			Number.parseInt(gcNo, 10) <= 0 ||
			!/^\d+$/.test(version) ||
			Number.parseInt(version, 10) <= 0
		) {
			return null;
		}

		return {
			gcNo: String(Number.parseInt(gcNo, 10)),
			version: String(Number.parseInt(version, 10))
		};
	},

	getTotoProgramLaunchUrl: function (message) {
		var target = this.getTotoProgramTarget(message);

		if (!target) {
			return "";
		}

		return this.launchpadBaseUrl +
			"#SporToto-manage?" +
			"sap-ui-app-id-hint=saas_approuter_com.btb.toto.zbettotoapp&/" +
			"Programs(gc_no=" + target.gcNo +
				",version_no=" + target.version + ")" +
			"/?FCLLayout=MidColumnFullScreen";
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
			self.updateWidgetFromMessage(message);

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
		var matchUrl = this.getMatchLaunchUrl(message);

		if (matchUrl) {
			return matchUrl;
		}

		var route = this.getMessageValue(message, "route") ||
			this.getMessageValue(message, "target") ||
			this.getMessageValue(message, "screen");

		if (route) {
			return this.getRouteUrl(route);
		}

		var title = this.getNotificationTextValue(message, "title");
		var body = this.getNotificationTextValue(message, "body");
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
		} else if (
			normalizedRoute === "toto" ||
			normalizedRoute === "sportoto" ||
			normalizedRoute === "spor-toto"
		) {
			hash = "#SporToto-manage";
		} else if (normalizedRoute === "btb" || normalizedRoute === "main" || normalizedRoute === "live") {
			hash = "#btb-manage";
		} else if (routeText.indexOf("#") === 0) {
			hash = routeText;
		}

		return this.launchpadBaseUrl + hash;
	},

	isBilyonerMatchUrl: function (url) {
		try {
			var parsedUrl = new URL(String(url || ""));
			var hostname = parsedUrl.hostname.toLowerCase();
			var pathname = parsedUrl.pathname.toLowerCase();

			return parsedUrl.protocol === "https:" &&
				(hostname === "bilyoner.com" || hostname === "www.bilyoner.com") &&
				pathname.indexOf("/mac-karti/") === 0;
		} catch (e) {
			return false;
		}
	},

	openSystemUrl: function (url) {
		if (
			typeof cordova === "undefined" ||
			!cordova.InAppBrowser ||
			typeof cordova.InAppBrowser.open !== "function"
		) {
			return false;
		}

		try {
			cordova.InAppBrowser.open(url, "_system");
			return true;
		} catch (e) {
			console.error("System URL open error:", e);
			return false;
		}
	},

	handleBeforeLoad: function (event, loadUrl) {
		var url = event && event.url ? event.url : "";

		if (this.isBilyonerMatchUrl(url) && this.openSystemUrl(url)) {
			return;
		}

		if (typeof loadUrl === "function" && url) {
			loadUrl(url);
		}
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

	registerLifecycleHandlers: function () {
		document.addEventListener("pause", this.handlePause.bind(this), false);
		document.addEventListener("resume", this.handleResume.bind(this), false);
	},

	handlePause: function () {
		this.pausedAt = Date.now();
	},

	handleResume: function () {
		var backgroundDuration = this.pausedAt ? Date.now() - this.pausedAt : 0;
		var browser = this.browserRef;

		this.pausedAt = 0;

		if (this.relaunchTimer) {
			return;
		}

		if (browser && backgroundDuration >= this.resumeHardRefreshAfter) {
			this.restartBrowserAfterResume(browser);
			return;
		}

		if (browser && typeof browser.show === "function") {
			try {
				browser.show();
				this.disableCustomBack();
				this.verifyBrowserAfterResume(browser);
				return;
			} catch (e) {
				console.error("Browser resume error:", e);
			}
		}

		this.restartBrowserAfterResume(browser);
	},

	verifyBrowserAfterResume: function (browser) {
		var self = this;

		this.clearResumeProbe();
		this.resumeProbeTimer = setTimeout(function () {
			self.resumeProbeTimer = null;
			self.restartBrowserAfterResume(browser);
		}, this.resumeProbeDelay);

		if (!browser || typeof browser.executeScript !== "function") {
			return;
		}

		try {
			browser.executeScript({
				code: "(function(){var b=document.body;return JSON.stringify({href:String(location.href||''),ready:String(document.readyState||''),hasContent:!!(b&&(b.children.length||String(b.innerText||'').trim().length))});})()"
			}, function (results) {
				if (self.browserRef !== browser) {
					self.clearResumeProbe();
					return;
				}

				if (self.isBrowserProbeHealthy(results)) {
					self.retryAttempt = 0;
					self.clearResumeProbe();
					return;
				}

				self.restartBrowserAfterResume(browser);
			});
		} catch (e) {
			console.error("Browser health check error:", e);
			this.restartBrowserAfterResume(browser);
		}
	},

	isBrowserProbeHealthy: function (results) {
		var state;

		if (!Array.isArray(results) || !results.length || typeof results[0] !== "string") {
			return false;
		}

		try {
			state = JSON.parse(results[0]);
		} catch (e) {
			return false;
		}

		return /^https?:\/\//i.test(String(state.href || "")) &&
			(state.ready === "interactive" || state.ready === "complete") &&
			state.hasContent === true;
	},

	clearResumeProbe: function () {
		if (this.resumeProbeTimer) {
			clearTimeout(this.resumeProbeTimer);
			this.resumeProbeTimer = null;
		}
	},

	restartBrowserAfterResume: function (browser) {
		if (browser && this.browserRef !== browser) {
			return;
		}

		this.clearResumeProbe();
		this.retryAttempt = 0;
		this.startApp(this.pendingLaunchUrl || this.getRouteUrl("home"), { immediate: true });
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

		this.clearResumeProbe();
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

	closeBrowserForRetry: function (browser) {
		var browserToClose = browser || this.browserRef;

		if (!browserToClose) {
			return;
		}

		browserToClose.btbIntentionalClose = true;

		try {
			browserToClose.close();
		} catch (e) {
			console.log("Browser close error:", e);
		}

		if (this.browserRef === browserToClose) {
			this.browserRef = null;
		}
	},

	openLaunchpad: function (url) {
		var self = this;
		var launchUrl = url || this.pendingLaunchUrl || this.getRouteUrl("home");

		this.relaunchTimer = null;
		this.waitingBackPressedOnce = false;
		this.setStatusText("Opening BTB");
		this.setDetailText("Loading the requested BTB screen.");
		this.setRetryVisible(false);

		if (this.browserRef) {
			this.closeBrowserForRetry(this.browserRef);
			this.relaunchTimer = setTimeout(function () {
				self.openLaunchpad(launchUrl);
			}, this.browserCloseDelay);
			return;
		}

		var browser = cordova.InAppBrowser.open(
			launchUrl,
			"_blank",
			"location=no,toolbar=no,zoom=no,hideurlbar=yes,hardwareback=yes,clearcache=no,clearsessioncache=no,beforeload=yes"
		);
		this.browserRef = browser;

		if (!browser) {
			this.enableCustomBack();
			this.setStatusText("Cannot open BTB");
			this.setDetailText("The in-app browser could not be started.");
			this.setRetryVisible(true, "Retry");
			return;
		}

		// Let InAppBrowser handle the hardware back button while it is open.
		this.disableCustomBack();

		browser.addEventListener("beforeload", function (event, loadUrl) {
			if (self.browserRef !== browser) {
				return;
			}

			self.handleBeforeLoad(event, loadUrl);
		});

		browser.addEventListener("loadstop", function (event) {
			if (self.browserRef !== browser) {
				return;
			}

			console.log("loadstop url:", event && event.url ? event.url : "");
			self.retryAttempt = 0;
		});

		browser.addEventListener("loaderror", function (event) {
			if (self.browserRef !== browser) {
				return;
			}

			console.error("Launchpad load error:", event);

			self.closeBrowserForRetry(browser);
			self.enableCustomBack();
			self.scheduleRelaunch(launchUrl);
		});

		browser.addEventListener("exit", function () {
			var wasCurrentBrowser = self.browserRef === browser;

			console.log("Browser closed");

			if (wasCurrentBrowser) {
				self.browserRef = null;
			}

			if (browser.btbIntentionalClose || !wasCurrentBrowser) {
				return;
			}

			self.enableCustomBack();
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
