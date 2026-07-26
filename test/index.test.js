"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");
var app = require("../www/js/index.js");

test("routes explicit SCLEAR notifications to Super Log", function () {
	var url = app.getNotificationLaunchUrl({ data: { route: "SCLEAR" } });

	assert.equal(url, app.launchpadBaseUrl + "#SuperLog-display");
});

test("routes SCLEAR notification text to Super Log", function () {
	var url = app.getNotificationLaunchUrl({ title: "SCLEAR", body: "Selection cleared" });

	assert.equal(url, app.launchpadBaseUrl + "#SuperLog-display");
});

test("does not reopen an active browser when connectivity returns", function () {
	var originalBrowserRef = app.browserRef;
	var originalRetryAttempt = app.retryAttempt;
	var originalStartApp = app.startApp;
	var calls = 0;

	app.browserRef = {};
	app.retryAttempt = 3;
	app.startApp = function () {
		calls += 1;
	};

	try {
		app.handleOnline();

		assert.equal(calls, 0);
		assert.equal(app.retryAttempt, 3);
	} finally {
		app.browserRef = originalBrowserRef;
		app.retryAttempt = originalRetryAttempt;
		app.startApp = originalStartApp;
	}
});

test("retries immediately when connectivity returns without a browser", function () {
	var originalBrowserRef = app.browserRef;
	var originalPendingLaunchUrl = app.pendingLaunchUrl;
	var originalRetryAttempt = app.retryAttempt;
	var originalStartApp = app.startApp;
	var receivedUrl = null;
	var receivedOptions = null;

	app.browserRef = null;
	app.pendingLaunchUrl = app.launchpadBaseUrl + "#btb-manage";
	app.retryAttempt = 3;
	app.startApp = function (url, options) {
		receivedUrl = url;
		receivedOptions = options;
	};

	try {
		app.handleOnline();

		assert.equal(app.retryAttempt, 0);
		assert.equal(receivedUrl, app.pendingLaunchUrl);
		assert.deepEqual(receivedOptions, { immediate: true });
	} finally {
		app.browserRef = originalBrowserRef;
		app.pendingLaunchUrl = originalPendingLaunchUrl;
		app.retryAttempt = originalRetryAttempt;
		app.startApp = originalStartApp;
	}
});

test("recognizes only Bilyoner match-card URLs", function () {
	assert.equal(
		app.isBilyonerMatchUrl("https://www.bilyoner.com/mac-karti/futbol/12345/oranlar"),
		true
	);
	assert.equal(app.isBilyonerMatchUrl("https://www.bilyoner.com/uyelik"), false);
	assert.equal(
		app.isBilyonerMatchUrl("https://www.bilyoner.com.example.org/mac-karti/futbol/12345/oranlar"),
		false
	);
});

test("opens Bilyoner match-card URLs in the Android system", function () {
	var originalOpenSystemUrl = app.openSystemUrl;
	var openedUrl = null;
	var browserLoads = 0;
	var matchUrl = "https://www.bilyoner.com/mac-karti/futbol/12345/oranlar";

	app.openSystemUrl = function (url) {
		openedUrl = url;
		return true;
	};

	try {
		app.handleBeforeLoad({ url: matchUrl }, function () {
			browserLoads += 1;
		});

		assert.equal(openedUrl, matchUrl);
		assert.equal(browserLoads, 0);
	} finally {
		app.openSystemUrl = originalOpenSystemUrl;
	}
});

test("keeps normal URLs inside the BTB browser", function () {
	var launchpadUrl = app.launchpadBaseUrl + "#btb-manage";
	var loadedUrl = null;

	app.handleBeforeLoad({ url: launchpadUrl }, function (url) {
		loadedUrl = url;
	});

	assert.equal(loadedUrl, launchpadUrl);
});

test("falls back to the browser when Android cannot open Bilyoner", function () {
	var originalOpenSystemUrl = app.openSystemUrl;
	var loadedUrl = null;
	var matchUrl = "https://www.bilyoner.com/mac-karti/futbol/12345/oranlar";

	app.openSystemUrl = function () {
		return false;
	};

	try {
		app.handleBeforeLoad({ url: matchUrl }, function (url) {
			loadedUrl = url;
		});

		assert.equal(loadedUrl, matchUrl);
	} finally {
		app.openSystemUrl = originalOpenSystemUrl;
	}
});

test("opens the Bilyoner home app through the native bridge", function () {
	var originalWindow = global.window;
	var openCalls = 0;

	global.window = {
		BtbWidget: {
			openBilyoner: function (done) {
				openCalls += 1;
				done();
			}
		}
	};

	try {
		assert.equal(app.handleBrowserMessage({
			data: JSON.stringify({ action: "openBilyoner" })
		}), true);
		assert.equal(openCalls, 1);
	} finally {
		global.window = originalWindow;
	}
});

test("configures the native Android splash with BTB branding", function () {
	var configXml = fs.readFileSync(path.join(__dirname, "..", "config.xml"), "utf8");

	assert.match(
		configXml,
		/<preference name="AndroidWindowSplashScreenAnimatedIcon" value="www\/img\/logo\.png" \/>/
	);
	assert.match(
		configXml,
		/<preference name="SplashScreenBackgroundColor" value="#05111F" \/>/
	);
	assert.match(configXml, /<preference name="SplashScreenDelay" value="1500" \/>/);
});

test("shows the existing Launchpad browser when the app resumes", function () {
	var originalBrowserRef = app.browserRef;
	var originalRelaunchTimer = app.relaunchTimer;
	var originalResumeProbeTimer = app.resumeProbeTimer;
	var originalPausedAt = app.pausedAt;
	var originalStartApp = app.startApp;
	var originalDisableCustomBack = app.disableCustomBack;
	var showCalls = 0;
	var probeCalls = 0;
	var startCalls = 0;
	var backCalls = 0;

	app.browserRef = {
		show: function () {
			showCalls += 1;
		},
		executeScript: function (details, done) {
			probeCalls += 1;
			assert.match(details.code, /document\.readyState/);
			done([JSON.stringify({
				href: app.launchpadBaseUrl,
				ready: "complete",
				hasContent: true
			})]);
		}
	};
	app.relaunchTimer = null;
	app.resumeProbeTimer = null;
	app.pausedAt = Date.now();
	app.startApp = function () {
		startCalls += 1;
	};
	app.disableCustomBack = function () {
		backCalls += 1;
	};

	try {
		app.handleResume();

		assert.equal(showCalls, 1);
		assert.equal(probeCalls, 1);
		assert.equal(startCalls, 0);
		assert.equal(backCalls, 1);
		assert.equal(app.resumeProbeTimer, null);
	} finally {
		app.clearResumeProbe();
		app.browserRef = originalBrowserRef;
		app.relaunchTimer = originalRelaunchTimer;
		app.resumeProbeTimer = originalResumeProbeTimer;
		app.pausedAt = originalPausedAt;
		app.startApp = originalStartApp;
		app.disableCustomBack = originalDisableCustomBack;
	}
});

test("reopens Launchpad when the app resumes without a browser", function () {
	var originalBrowserRef = app.browserRef;
	var originalPendingLaunchUrl = app.pendingLaunchUrl;
	var originalRelaunchTimer = app.relaunchTimer;
	var originalPausedAt = app.pausedAt;
	var originalRetryAttempt = app.retryAttempt;
	var originalStartApp = app.startApp;
	var receivedUrl = null;
	var receivedOptions = null;

	app.browserRef = null;
	app.pendingLaunchUrl = app.launchpadBaseUrl + "#btb-manage";
	app.relaunchTimer = null;
	app.pausedAt = 0;
	app.retryAttempt = 3;
	app.startApp = function (url, options) {
		receivedUrl = url;
		receivedOptions = options;
	};

	try {
		app.handleResume();

		assert.equal(app.retryAttempt, 0);
		assert.equal(receivedUrl, app.pendingLaunchUrl);
		assert.deepEqual(receivedOptions, { immediate: true });
	} finally {
		app.browserRef = originalBrowserRef;
		app.pendingLaunchUrl = originalPendingLaunchUrl;
		app.relaunchTimer = originalRelaunchTimer;
		app.pausedAt = originalPausedAt;
		app.retryAttempt = originalRetryAttempt;
		app.startApp = originalStartApp;
	}
});

test("does not compete with a notification relaunch already in progress", function () {
	var originalRelaunchTimer = app.relaunchTimer;
	var originalPausedAt = app.pausedAt;
	var originalStartApp = app.startApp;
	var startCalls = 0;

	app.relaunchTimer = {};
	app.pausedAt = 0;
	app.startApp = function () {
		startCalls += 1;
	};

	try {
		app.handleResume();
		assert.equal(startCalls, 0);
	} finally {
		app.relaunchTimer = originalRelaunchTimer;
		app.pausedAt = originalPausedAt;
		app.startApp = originalStartApp;
	}
});

test("rejects an empty or blank InAppBrowser health response", function () {
	assert.equal(app.isBrowserProbeHealthy([]), false);
	assert.equal(
		app.isBrowserProbeHealthy([JSON.stringify({
			href: "about:blank",
			ready: "complete",
			hasContent: false
		})]),
		false
	);
	assert.equal(
		app.isBrowserProbeHealthy([JSON.stringify({
			href: app.launchpadBaseUrl,
			ready: "complete",
			hasContent: true
		})]),
		true
	);
});

test("reopens Launchpad after a long background suspension", function () {
	var originalBrowserRef = app.browserRef;
	var originalPendingLaunchUrl = app.pendingLaunchUrl;
	var originalRelaunchTimer = app.relaunchTimer;
	var originalPausedAt = app.pausedAt;
	var originalRefreshAfter = app.resumeHardRefreshAfter;
	var originalStartApp = app.startApp;
	var showCalls = 0;
	var receivedUrl = null;

	app.browserRef = {
		show: function () {
			showCalls += 1;
		}
	};
	app.pendingLaunchUrl = app.launchpadBaseUrl + "#btb-manage";
	app.relaunchTimer = null;
	app.pausedAt = Date.now() - 1000;
	app.resumeHardRefreshAfter = 500;
	app.startApp = function (url) {
		receivedUrl = url;
	};

	try {
		app.handleResume();

		assert.equal(showCalls, 0);
		assert.equal(receivedUrl, app.pendingLaunchUrl);
	} finally {
		app.browserRef = originalBrowserRef;
		app.pendingLaunchUrl = originalPendingLaunchUrl;
		app.relaunchTimer = originalRelaunchTimer;
		app.pausedAt = originalPausedAt;
		app.resumeHardRefreshAfter = originalRefreshAfter;
		app.startApp = originalStartApp;
	}
});

test("waits for the previous Android browser to close before replacement", function () {
	var originalBrowserRef = app.browserRef;
	var originalRelaunchTimer = app.relaunchTimer;
	var originalSetTimeout = global.setTimeout;
	var originalSetStatusText = app.setStatusText;
	var originalSetDetailText = app.setDetailText;
	var originalSetRetryVisible = app.setRetryVisible;
	var closeCalls = 0;
	var scheduledDelay = null;

	app.browserRef = {
		close: function () {
			closeCalls += 1;
		}
	};
	app.relaunchTimer = null;
	app.setStatusText = function () {};
	app.setDetailText = function () {};
	app.setRetryVisible = function () {};
	global.setTimeout = function (callback, delay) {
		scheduledDelay = delay;
		return { callback: callback };
	};

	try {
		app.openLaunchpad(app.launchpadBaseUrl);

		assert.equal(closeCalls, 1);
		assert.equal(app.browserRef, null);
		assert.equal(scheduledDelay, app.browserCloseDelay);
		assert.ok(app.relaunchTimer);
	} finally {
		app.browserRef = originalBrowserRef;
		app.relaunchTimer = originalRelaunchTimer;
		global.setTimeout = originalSetTimeout;
		app.setStatusText = originalSetStatusText;
		app.setDetailText = originalSetDetailText;
		app.setRetryVisible = originalSetRetryVisible;
	}
});

test("builds a Super widget payload from notification data", function () {
	var payload = app.getWidgetPayload({
		data: {
			notification_title: "SCLEAR",
			notification_body: "Selection cleared",
			rating: "4"
		}
	});

	assert.deepEqual(payload, {
		title: "SCLEAR",
		body: "Selection cleared.",
		route: "super",
		rating: 4
	});
});

test("replaces a legacy numeric rating with a separate star rating", function () {
	var payload = app.getWidgetPayload({
		data: {
			notification_title: "Super coupon created",
			notification_body: "Inter Turku - Gnistan : Ms1X selected (rating 3)."
		}
	});

	assert.deepEqual(payload, {
		title: "Super coupon created",
		body: "Inter Turku - Gnistan : Ms1X selected.",
		route: "super",
		rating: 3
	});
});

test("builds a BTB Object Page deep link from notification match keys", function () {
	var message = {
		data: {
			notification_title: "Super coupon created",
			widget_body: "Inter Turku - Gnistan : Ms1X selected.",
			rating: "3",
			match_id: "481516",
			match_date: "20260726",
			match_time: "162300"
		}
	};
	var expectedUrl = app.launchpadBaseUrl +
		"#btb-manage?sap-ui-app-id-hint=saas_approuter_com.btb.btb&/" +
		"zbet_cds_005(" +
			"datum=datetime'2026-07-26T00%253A00%253A00'," +
			"id=481516," +
			"uzeit=time'PT16H23M00S')" +
		"/?FCLLayout=MidColumnFullScreen";

	assert.equal(app.getNotificationLaunchUrl(message), expectedUrl);
	assert.match(expectedUrl, /sap-ui-app-id-hint=saas_approuter_com\.btb\.btb/);
	assert.match(expectedUrl, /T00%253A00%253A00/);
	assert.match(expectedUrl, /FCLLayout=MidColumnFullScreen/);
	assert.doesNotMatch(expectedUrl, /sap-iapp-state/);
	assert.deepEqual(app.getWidgetPayload(message), {
		title: "Super coupon created",
		body: "Inter Turku - Gnistan : Ms1X selected.",
		route: "btb",
		rating: 3,
		match_id: "481516",
		match_date: "2026-07-26",
		match_time: "16:23:00"
	});
});

test("routes Toto widget content to the Spor Toto Launchpad app", function () {
	var payload = app.getWidgetPayload({
		data: {
			notification_title: "Spor Toto",
			notification_body: "Program sonucu hazır",
			route: "toto"
		}
	});

	assert.equal(app.getRouteUrl("toto"), app.launchpadBaseUrl + "#SporToto-manage");
	assert.deepEqual(payload, {
		title: "Spor Toto",
		body: "Program sonucu hazır",
		route: "toto"
	});
});

test("passes the dual KPI snapshot to the native widget bridge", function () {
	var payload = app.getWidgetPayload({
		data: {
			notification_title: "BTB KPI",
			notification_body: "Performance updated",
			toto_coverage_hits: "3",
			toto_coverage_total: "4",
			toto_program_gc_no: "348",
			toto_program_version: "1",
			super_min_rating: "3",
			super_wins: "5",
			super_losses: "3",
			super_profit: "1.0600"
		}
	});

	assert.deepEqual(payload, {
		title: "BTB KPI",
		body: "Performance updated",
		route: "btb",
		toto_coverage_hits: 3,
		toto_coverage_total: 4,
		toto_program_gc_no: 348,
		toto_program_version: 1,
		super_min_rating: 3,
		super_wins: 5,
		super_losses: 3,
		super_profit: 1.06
	});
});

test("opens the KPI Toto program Object Page with stable keys", function () {
	var originalStartApp = app.startApp;
	var receivedUrl = null;

	app.startApp = function (url) {
		receivedUrl = url;
	};

	try {
		app.openWidgetTarget({
			route: "toto",
			toto_program_gc_no: "348",
			toto_program_version: "1"
		});

		assert.equal(
			receivedUrl,
			app.launchpadBaseUrl +
				"#SporToto-manage?" +
				"sap-ui-app-id-hint=saas_approuter_com.btb.toto.zbettotoapp&/" +
				"Programs(gc_no=348,version_no=1)" +
				"/?FCLLayout=MidColumnFullScreen"
		);
	} finally {
		app.startApp = originalStartApp;
	}
});

test("falls back to the Toto list when program keys are unavailable", function () {
	assert.equal(
		app.getTotoProgramLaunchUrl({
			toto_program_gc_no: "invalid",
			toto_program_version: "1"
		}),
		""
	);
	assert.equal(app.getRouteUrl("toto"), app.launchpadBaseUrl + "#SporToto-manage");
});

test("does not replace widget content for an empty FCM message", function () {
	assert.equal(app.getWidgetPayload({ data: {} }), null);
});

test("opens the requested Launchpad route from the Android widget", function () {
	var originalRetryAttempt = app.retryAttempt;
	var originalStartApp = app.startApp;
	var receivedUrl = null;
	var receivedOptions = null;

	app.retryAttempt = 3;
	app.startApp = function (url, options) {
		receivedUrl = url;
		receivedOptions = options;
	};

	try {
		app.openWidgetTarget({ route: "super" });

		assert.equal(app.retryAttempt, 0);
		assert.equal(receivedUrl, app.getRouteUrl("super"));
		assert.deepEqual(receivedOptions, { immediate: true });
	} finally {
		app.retryAttempt = originalRetryAttempt;
		app.startApp = originalStartApp;
	}
});

test("opens the notification match from the widget content area", function () {
	var originalStartApp = app.startApp;
	var receivedUrl = null;

	app.startApp = function (url) {
		receivedUrl = url;
	};

	try {
		app.openWidgetTarget({
			route: "btb",
			match_id: "481516",
			match_date: "2026-07-26",
			match_time: "16:23:00"
		});

		assert.equal(
			receivedUrl,
			app.launchpadBaseUrl +
				"#btb-manage?sap-ui-app-id-hint=saas_approuter_com.btb.btb&/" +
				"zbet_cds_005(" +
					"datum=datetime'2026-07-26T00%253A00%253A00'," +
					"id=481516," +
					"uzeit=time'PT16H23M00S')" +
				"/?FCLLayout=MidColumnFullScreen"
		);
	} finally {
		app.startApp = originalStartApp;
	}
});

test("passes notification content to the native widget bridge", function () {
	var originalWindow = global.window;
	var receivedPayload = null;

	global.window = {
		BtbWidget: {
			update: function (payload, done) {
				receivedPayload = payload;
				done();
			}
		}
	};

	try {
		assert.equal(app.updateWidgetFromMessage({
			title: "BTB Live",
			body: "New selection",
			route: "main"
		}), true);
		assert.deepEqual(receivedPayload, {
			title: "BTB Live",
			body: "New selection",
			route: "btb"
		});
	} finally {
		global.window = originalWindow;
	}
});

test("creates the Super and general BTB notification channels", function () {
	var channelOptions = [];
	var messaging = {
		listChannels: function (done) {
			done([]);
		},
		createChannel: function (options) {
			channelOptions.push(options);
		}
	};

	assert.equal(app.configureNotificationChannels(messaging), true);
	assert.deepEqual(
		channelOptions.map(function (channel) {
			return { id: channel.id, sound: channel.sound };
		}),
		[
			{ id: "btb_super_goal_v1", sound: "btb_super_goal" },
			{
				id: "btb_general_whistle_v1",
				sound: "btb_referee_whistle"
			}
		]
	);
});

test("keeps existing BTB notification channels", function () {
	var createCalls = 0;
	var deletedChannels = [];
	var messaging = {
		listChannels: function (done) {
			done([
				{ id: "btb_super_goal_v1" },
				{ id: "btb_general_whistle_v1" },
				{ id: "btb_alerts_v1" }
			]);
		},
		createChannel: function () {
			createCalls += 1;
		},
		deleteChannel: function (channelId) {
			deletedChannels.push(channelId);
		}
	};

	assert.equal(app.configureNotificationChannels(messaging), true);
	assert.equal(createCalls, 0);
	assert.deepEqual(deletedChannels, ["btb_alerts_v1"]);
});

test("injects mobile shortcuts and opens Android notification settings", function () {
	var originalWindow = global.window;
	var openCalls = 0;
	var injectedCode = "";

	global.window = {
		BtbWidget: {
			openNotificationSettings: function (done) {
				openCalls += 1;
				done();
			}
		}
	};

	try {
		assert.equal(app.handleBrowserMessage({
			data: JSON.stringify({ action: "openNotificationSettings" })
		}), true);
		assert.equal(openCalls, 1);
		assert.equal(app.injectMobileControls({
			executeScript: function (details) {
				injectedCode = details.code;
			}
		}), true);
		assert.match(injectedCode, /btb-mobile-notification-settings/);
		assert.match(injectedCode, /btb-mobile-quick-toggle/);
		assert.match(injectedCode, /navigateLaunchpad/);
		assert.match(injectedCode, /openBilyoner/);
		assert.match(injectedCode, /Bilyoner/);
		assert.match(injectedCode, /Super Log/);
		assert.match(injectedCode, /Toto/);
		assert.match(injectedCode, /cordova_iab\.postMessage/);
		assert.match(injectedCode, /makeDraggable/);
		assert.match(injectedCode, /pointerdown/);
		assert.match(injectedCode, /btb-mobile-quick-position-v1/);
		assert.match(injectedCode, /window\.localStorage/);
		assert.match(injectedCode, /btb-menu-up/);
		assert.match(injectedCode, /btb-menu-down/);
		assert.match(injectedCode, /bottom:82px/);
		assert.match(
			injectedCode,
			/#btb-mobile-quick-menu\{[^}]*pointer-events:none/
		);
		assert.match(
			injectedCode,
			/#btb-mobile-quick-nav\.btb-open #btb-mobile-quick-menu\{pointer-events:auto/
		);
		assert.doesNotThrow(function () {
			return new Function(injectedCode);
		});
	} finally {
		global.window = originalWindow;
	}
});

test("navigates to a Launchpad app with an in-browser transition splash", function () {
	var originalBrowserRef = app.browserRef;
	var originalPendingLaunchUrl = app.pendingLaunchUrl;
	var injectedCode = "";

	app.browserRef = {
		executeScript: function (details) {
			injectedCode = details.code;
		}
	};

	try {
		assert.equal(app.handleBrowserMessage({
			data: JSON.stringify({ action: "navigateLaunchpad", route: "super" })
		}), true);
		assert.equal(app.pendingLaunchUrl, app.getRouteUrl("super"));
		assert.match(injectedCode, /btb-mobile-route-splash/);
		assert.match(injectedCode, /Super Log yukleniyor/);
		assert.match(injectedCode, /#SuperLog-display/);
		assert.doesNotThrow(function () {
			return new Function(injectedCode);
		});
		assert.equal(app.navigateLaunchpadRoute("unsupported"), false);
	} finally {
		app.browserRef = originalBrowserRef;
		app.pendingLaunchUrl = originalPendingLaunchUrl;
	}
});

test("declares branded Android notification resources", function () {
	var root = path.join(__dirname, "..");
	var configXml = fs.readFileSync(path.join(root, "config.xml"), "utf8");
	var packageJson = JSON.parse(
		fs.readFileSync(path.join(root, "package.json"), "utf8")
	);
	var iconXml = fs.readFileSync(
		path.join(root, "res", "notification", "notification_icon.xml"),
		"utf8"
	);
	var superSound = fs.readFileSync(
		path.join(root, "res", "notification", "btb_super_goal.wav")
	);
	var generalSound = fs.readFileSync(
		path.join(root, "res", "notification", "btb_referee_whistle.wav")
	);

	assert.match(configXml, /drawable\/notification_icon\.xml/);
	assert.match(configXml, /drawable\/notification_icon_large\.png/);
	assert.match(configXml, /raw\/btb_super_goal\.wav/);
	assert.match(configXml, /raw\/btb_referee_whistle\.wav/);
	assert.match(iconXml, /android:strokeColor="#FFFFFFFF"/);
	assert.equal(superSound.subarray(0, 4).toString("ascii"), "RIFF");
	assert.equal(superSound.subarray(8, 12).toString("ascii"), "WAVE");
	assert.equal(generalSound.subarray(0, 4).toString("ascii"), "RIFF");
	assert.equal(generalSound.subarray(8, 12).toString("ascii"), "WAVE");
	assert.equal(
		packageJson.cordova.plugins["cordova-plugin-firebasex-messaging"]
			.ANDROID_ICON_ACCENT,
		"#1597E5"
	);
});

test("declares the tracked Android widget Cordova plugin", function () {
	var root = path.join(__dirname, "..");
	var packageJson = JSON.parse(
		fs.readFileSync(path.join(root, "package.json"), "utf8")
	);
	var pluginXml = fs.readFileSync(
		path.join(root, "plugins-src", "cordova-plugin-btb-widget", "plugin.xml"),
		"utf8"
	);
	var widgetInfo = fs.readFileSync(
		path.join(
			root,
			"plugins-src",
			"cordova-plugin-btb-widget",
			"src",
			"android",
			"res",
			"xml",
			"btb_widget_info.xml"
		),
		"utf8"
	);
	var widgetLayout = fs.readFileSync(
		path.join(
			root,
			"plugins-src",
			"cordova-plugin-btb-widget",
			"src",
			"android",
			"res",
			"layout",
			"btb_widget.xml"
		),
		"utf8"
	);
	var widgetPlugin = fs.readFileSync(
		path.join(
			root,
			"plugins-src",
			"cordova-plugin-btb-widget",
			"src",
			"android",
			"BtbWidgetPlugin.java"
		),
		"utf8"
	);
	var kpiWidgetInfo = fs.readFileSync(
		path.join(
			root,
			"plugins-src",
			"cordova-plugin-btb-widget",
			"src",
			"android",
			"res",
			"xml",
			"btb_kpi_widget_info.xml"
		),
		"utf8"
	);
	var kpiWidgetLayout = fs.readFileSync(
		path.join(
			root,
			"plugins-src",
			"cordova-plugin-btb-widget",
			"src",
			"android",
			"res",
			"layout",
			"btb_kpi_widget.xml"
		),
		"utf8"
	);
	var kpiWidgetProvider = fs.readFileSync(
		path.join(
			root,
			"plugins-src",
			"cordova-plugin-btb-widget",
			"src",
			"android",
			"BtbKpiWidgetProvider.java"
		),
		"utf8"
	);
	var superButtonIndex = widgetLayout.indexOf(
		'android:id="@+id/btb_widget_super"'
	);
	var btbButtonIndex = widgetLayout.indexOf(
		'android:id="@+id/btb_widget_open"'
	);
	var totoButtonIndex = widgetLayout.indexOf(
		'android:id="@+id/btb_widget_toto"'
	);

	assert.equal(
		packageJson.dependencies["cordova-plugin-btb-widget"],
		"file:plugins-src/cordova-plugin-btb-widget"
	);
	assert.match(pluginXml, /android\.appwidget\.action\.APPWIDGET_UPDATE/);
	assert.match(pluginXml, /com\.btb\.widget\.BtbWidgetProvider/);
	assert.match(pluginXml, /com\.btb\.widget\.BtbKpiWidgetProvider/);
	assert.match(pluginXml, /com\.btb\.widget\.BtbWidgetInitializer/);
	assert.match(pluginXml, /\$\{applicationId\}\.widget\.initializer/);
	assert.match(widgetInfo, /android:initialLayout="@layout\/btb_widget"/);
	assert.match(
		kpiWidgetInfo,
		/android:initialLayout="@layout\/btb_kpi_widget"/
	);
	assert.match(widgetLayout, /android:id="@\+id\/btb_widget_rating"/);
	assert.match(widgetLayout, /android:id="@\+id\/btb_widget_toto"/);
	assert.ok(superButtonIndex < btbButtonIndex);
	assert.ok(btbButtonIndex < totoButtonIndex);
	assert.match(widgetPlugin, /EXTRA_MATCH_ID/);
	assert.match(widgetPlugin, /EXTRA_MATCH_DATE/);
	assert.match(widgetPlugin, /EXTRA_MATCH_TIME/);
	assert.match(widgetPlugin, /EXTRA_TOTO_GC_NO/);
		assert.match(widgetPlugin, /EXTRA_TOTO_VERSION/);
		assert.match(widgetPlugin, /ACTION_APP_NOTIFICATION_SETTINGS/);
		assert.match(widgetPlugin, /com\.bilyoner\.app/);
		assert.match(widgetPlugin, /getLaunchIntentForPackage/);
		assert.match(pluginXml, /<package android:name="com\.bilyoner\.app" \/>/);
	assert.match(kpiWidgetLayout, /android:id="@\+id\/btb_kpi_toto_chart"/);
	assert.match(kpiWidgetLayout, /android:id="@\+id\/btb_kpi_super_chart"/);
	assert.match(kpiWidgetProvider, /createDonut/);
	assert.match(kpiWidgetProvider, /super_min_rating/);
	assert.match(kpiWidgetProvider, /createTotoOpenIntent/);
});
