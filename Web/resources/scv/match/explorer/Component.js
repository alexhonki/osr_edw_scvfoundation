sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"osr/scv/match/explorer/model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("osr.scv.match.explorer.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {

			//this.setModel(new JSONModel(oCurrentDeviceModelData), "currentDeviceStatus");

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set app wide model for advance filter
			let oSourceType = {
				"SourceType": [{
					"name": "",
					"code": ""
				}, {
					"name": "TMR",
					"code": "TMR"
				}, {
					"name": "RMS",
					"code": "RMS"
				}]
			};

			//set model to the view, so that dialog can be accessed and there's data for it. 
			//since we add dependent to it
			this.setModel(new JSONModel(oSourceType), "searchParameters");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

		}

	});
});