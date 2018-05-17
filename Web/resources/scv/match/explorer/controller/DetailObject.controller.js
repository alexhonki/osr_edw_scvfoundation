/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018
 */
sap.ui.define([
	"osr/scv/match/explorer/controller/SuperController"
], function(SuperController) {
	"use strict";

	let DetailObject = SuperController.extend("osr.scv.match.explorer.controller.DetailObject", {

		/**
		 * Run on initialize
		 * @return {[type]} [description]
		 */
		onInit: function() {

			this.getRouter().getRoute("objectdetail").attachPatternMatched(this._onRouteMatched, this);

		},

		/**
		 * Everytime route is matched, will trigger below.
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		_onRouteMatched: function(oEvent) {
			let oController = this;

			oController.oPageParam = oEvent.getParameter("arguments");
			oController.sViewName = "objectdetail";
		},

		_readData: function(oEvent) {

		}

	});

	return DetailObject;
});