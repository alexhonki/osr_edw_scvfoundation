/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018
 */
sap.ui.define([
	"osr/scv/match/explorer/controller/SuperController",
	"sap/ui/model/json/JSONModel"
], function(SuperController, JSONModel) {
	"use strict";

	let DetailObject = SuperController.extend("osr.scv.match.explorer.controller.DetailObject", {

		/**
		 * Run on initialize
		 * @return {[type]} [description]
		 */
		onInit: function() {

			//setting up of all models to serve.
			this.setModel(new JSONModel(), "viewModel");
			this.setModel(new JSONModel(), "personModel");
			this.setModel(new JSONModel(), "addressesModel");
			this.setModel(new JSONModel(), "contactsModel");
			this.setModel(new JSONModel(), "currentModel");
			this.setModel(new JSONModel(), "postalModel");

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

			//do data read. 
			oController._readCurrentPersonData("scvExplorerModel", "personParameters", oController.oPageParam.scvId);
		},

		/**
		 * Everytime route is matched, will trigger below.
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		_readPostalData: function(sModelName, sEndPointPath, sScvId) {
			let oController = this;
			oController.getModel("scvExplorerModel").read("/xxthe parameters for postal" + "(IP_SCV_ID='" + sScvId + "')/Results", {
				urlParameters: {
					"$orderby": "SOURCE desc,VALID_TO"
				},
				success: function(data) {

					// if there is a PO Box coming in through for this particular SCV ID
					if (data.results.length > 0) {

						oController.getModel("postalModel").setData(data.results[0], false);

					}

				},
				error: function(oMessage) {
					console.log(oMessage);
				}
			});
		},

		/**
		 * Everytime route is matched, will trigger below.
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		_readAddressesData: function(sModelName, sEndPointPath, sScvId) {

			// depending on how this looks + the smart tables, we might just need to 
			// bind the element straight away, since the column sorting is from the oData.
			let oController = this;
			oController.getModel("scvExplorerModel").read("/xxthe parameters for address" + "(IP_SCV_ID='" + sScvId + "')/Results", {
				urlParameters: {
					"$orderby": "SOURCE desc,VALID_TO"
				},
				success: function(data) {

					// if there is a PO Box coming in through for this particular SCV ID
					if (data.results.length > 0) {

						oController.getModel("addressesModel").setData(data.results[0], false);

					}

				},
				error: function(oMessage) {
					console.log(oMessage);
				}
			});
		},

		/**
		 * Everytime route is matched, will trigger below.
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		_readCurrentPersonData: function(sModelName, sEndPointPath, sScvId) {
			let oController = this;
			oController.getModel(sModelName).read("/" + sEndPointPath + "(IP_SCV_ID='" + sScvId + "')/Results", {
				urlParameters: {
					"$orderby": "SOURCE desc,VALID_TO"
				},
				success: function(data) {

					// grab the very top one for the current person. 
					if (data.results.length > 0) {
						//set the data for for the entire view information. 
						oController.getModel("viewModel").setData(data.results[0], false);

						//transform the person data to reflect for current.
						oController._transformPersonData(data.results, "person");
					}

				},
				error: function(oMessage) {
					console.log(oMessage);
				}
			});
		},

		/**
		 * Helper method to transform the payload received for the current information. 
		 * (1st Tab - Current)
		 * Also set the data to the JSON model for the Person
		 * @param  {[Object]} oData [data received from the CV]
		 * @param  {[STring]} sPath [e.g person, contact]
		 * @return {[type]}        [description]
		 */
		_transformPersonData: function(oData, sPath) {

			let oController = this;
			let oResult = {};

			if (sPath === "person") {
				//grab the very first result for the person name. 
				// it can either be TMR. By default its sorted via SOURCE, so TMR will be the very first. 
				oResult.STD_PERSON_FN = oData[0].STD_PERSON_FN;
				oResult.STD_PERSON_GN = oData[0].STD_PERSON_GN;
				oResult.STD_PERSON_GN2 = oData[0].STD_PERSON_GN2;
				oResult.BIRTH_DATE = moment(oData[0].BIRTH_DATE).format("DD/MM/YYYY");
				oResult.DRIVER_LICENSE = oData[0].SOURCE_ID;
				oResult.BP_NUMBER = "";

				//loop through all the results set. 
				for (let i = 0; i < oData.length; i++) {
					if (oData[i].SOURCE === "RMS") {
						oResult.BP_NUMBER += oData[i].SOURCE_ID + "\n";
					}

				}

				oController.getModel("personModel").setData(oResult, true);
			} else {
				//transform for contact number
			}

		}

	});

	return DetailObject;
});