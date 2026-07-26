"use strict";

var exec = require("cordova/exec");

exports.listen = function (success, error) {
	exec(success, error, "BtbWidget", "listen", []);
};

exports.update = function (payload, success, error) {
	exec(success, error, "BtbWidget", "update", [payload || {}]);
};

exports.openNotificationSettings = function (success, error) {
	exec(success, error, "BtbWidget", "openNotificationSettings", []);
};

exports.openBilyoner = function (success, error) {
	exec(success, error, "BtbWidget", "openBilyoner", []);
};
