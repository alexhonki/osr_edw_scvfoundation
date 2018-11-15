/*eslint no-console: 0*/
"use strict";

/*Server Authentication*/
var port = process.env.PORT || 3000,
	server = require("http").createServer(),
	express = require("express"),
	//init = require(__dirname + "/" + "utils/initialize"),
	//Initialize Express App for XSA UAA and HDBEXT Middleware
	//app = init.initExpress(),
	app = express(),
	xssec = require("@sap/xssec"),
	passport = require("passport"),
	xsHDBConn = require("@sap/hdbext");

var xsjstest = require("@sap/xsjs-test");
var xsenv = require("@sap/xsenv");
var request = require("request");

var testResultsDir = "./.testresults";
var timestamp = Date.now();
var testResultFileName = timestamp + "_report";
var coverageFile = timestamp + "_coverage";

var options = {
	test: {
		format: "xml",
		/*package: "OSR_SCV_FOUNDATION.Services.test.suites",*/
		pattern: ".*Test",
		reportdir: testResultsDir,
		filename: testResultFileName
	},
	coverage: {
		reporting: {
			reports: ["json"]
		},
		dir: testResultsDir,
		filename: coverageFile,
		instrumentation: {
			includes: ["**/Test*.xsjslib"],
		},
		verbose: false
	} 
};

//configure HANA
try {
	options = Object.assign(options, xsenv.getServices({
		hana: {
			tag: "hana"
		}
	}));
} catch (err) {
	console.error(err);
}

// configure UAA
try {
	options = Object.assign(options, xsenv.getServices({
		uaa: {
			tag: "xsuaa"
		}
	}));
} catch (err) {
	console.error(err);
}

// Authentication Module Configuration
passport.use("JWT", new xssec.JWTStrategy(options.uaa));

// Use for every Request this Authentication mode
app.use(
	passport.authenticate("JWT", {
		session: false
	}),
	xsHDBConn.middleware(options.hana)
);

xsjstest(options).runTests();
app.use(xsjstest);
app.listen(port);