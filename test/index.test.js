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
		title: "4★ SCLEAR",
		body: "Selection cleared",
		route: "super"
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

	assert.equal(
		packageJson.dependencies["cordova-plugin-btb-widget"],
		"file:plugins-src/cordova-plugin-btb-widget"
	);
	assert.match(pluginXml, /android\.appwidget\.action\.APPWIDGET_UPDATE/);
	assert.match(pluginXml, /com\.btb\.widget\.BtbWidgetProvider/);
	assert.match(pluginXml, /com\.btb\.widget\.BtbWidgetInitializer/);
	assert.match(pluginXml, /\$\{applicationId\}\.widget\.initializer/);
	assert.match(widgetInfo, /android:initialLayout="@layout\/btb_widget"/);
	assert.match(widgetLayout, /android:id="@\+id\/btb_widget_toto"/);
});
