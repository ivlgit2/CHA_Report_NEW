/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"bri/CHA_Report/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});