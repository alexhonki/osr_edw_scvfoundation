'use strict';
const PORT = process.env.PORT || 3000;

const express = require('express');
const bodyParser = require('body-parser');

const xsenv = require('@sap/xsenv');
const dwsClient = require('@sap/dwf-dws-client');

const loopBackUrl = JSON.parse(process.env.VCAP_APPLICATION).full_application_uris[0];
const rejectUnauth = false;

const TaskChain = dwsClient.taskChain.createTaskChainClient(
	xsenv.getServices({
		dwf: {
			tag: 'dwf'
		}
	}).dwf,
	loopBackUrl,
	rejectUnauth
);

const app = express();
module.exports = app; // for testing

/*
const passport = require('passport');

if (process.env.PORT) {
    passport.use('JWT', new dwsClient.helpers.JWTHybridStrategy(
        xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa
    ));
    app.use(passport.initialize());
    app.use(passport.authenticate('JWT', { session: false }));
}
*/

app.use(bodyParser.json());
app.use((err1, req, resp, next) => {
	if (err1) {
		console.error(err1);
	}
	return next(err1, resp);
});

// Register Task Groups to the Data Warehouse Scheduler
TaskChain.addRouter(app, '/backend');

// Start HTTP server for callbacks by Data Warehouse Scheduler
app.listen(
	PORT, err => {
		if (err) {
			console.error(err);
			return process.exit(2);
		}
		TaskChain.registerTaskGroups(err1 => {
			if (err1) {
				console.error(err1);
				return process.exit(1);
			}
			console.log('Backend module listening on: ' + PORT);
		});
	}
);