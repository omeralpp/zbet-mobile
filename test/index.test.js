"use strict";

var assert = require("node:assert/strict");
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
