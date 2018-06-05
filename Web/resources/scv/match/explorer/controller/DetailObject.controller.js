/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018
 */
sap.ui.define([
	"osr/scv/match/explorer/controller/SuperController",
	"sap/ui/model/json/JSONModel",
	"osr/scv/match/explorer/asset/lib/Formatters"
], function(SuperController, JSONModel, Formatters) {
	"use strict";

	let DetailObject = SuperController.extend("osr.scv.match.explorer.controller.DetailObject", {

		Formatters: Formatters,
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
			this.setModel(new JSONModel(), "timelineModel");

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

			oController.getModel("viewModel").setProperty("/SHOW_HISTORY_TABLE", true);
			oController.getModel("viewModel").setProperty("/SHOW_HISTORY_TIMELINE", false);

			//do data read whenever route change. 
			oController._readCurrentPersonData(oController.oPageParam.scvId); //current tab
			oController._readScvContactData(oController.oPageParam.scvId); //current tab for their current contact
			oController._readPersonData(oController.oPageParam.scvId); //person tab
			oController._readAddressesData(oController.oPageParam.scvId); //history tab
			oController._readPostalData(oController.oPageParam.scvId); //postal tab
			
			oController.getView().byId("scv-tabbar").setSelectedKey("1");

		},

		/**
		 * Setter for visibility toggle of the link.
		 * It shows up depending on the visibility flag. 
		 * @param  {[Object]} oEvent [as described]
		 * @return {[type]}        [description]
		 */
		onViewLinkPressed: function(oEvent) {
			let oController = this;
			let sWhichLink = oEvent.getSource().data().sWhichLink;

			//depending on the link, we will show different link and text.
			if (sWhichLink === "showTimeline") {
				oController.getModel("viewModel").setProperty("/SHOW_HISTORY_TABLE", false);
				oController.getModel("viewModel").setProperty("/SHOW_HISTORY_TIMELINE", true);
			} else if (sWhichLink === "showTable") {
				oController.getModel("viewModel").setProperty("/SHOW_HISTORY_TABLE", true);
				oController.getModel("viewModel").setProperty("/SHOW_HISTORY_TIMELINE", false);
			}

		},

		/**
		 * Helper to read addressParameters end point and just grab the top one. 
		 * assumption is there will only be one valid PO Box address. 
		 * @param  {[String]} sScvId [scvId of the entity.]
		 * @return {[type]}        [description]
		 */
		_readPostalData: function(sScvId) {
			let oController = this;
			//make sure its a valid PO box with the year 9999 for valid to and the string contain Po Box 
			oController.getModel("scvExplorerModel").read("/addressParameters" + "(IP_SCV_ID='" + sScvId +
				"',IP_YEAR='9999',IP_PO_BOX='Po%20Box')/Results", {
					urlParameters: {
						"$orderby": "VALID_TO desc"
					},
					success: function(data) {

						// if there is a PO Box coming in through for this particular SCV ID
						if (data.results.length > 0) {

							//transform the result and assign it to the model.
							let oResult = {};
							oResult.ADDRESS = data.results[0].STD_ADDR_ADDRESS_DELIVERY;
							oResult.CITY = data.results[0].STD_ADDR_LOCALITY;
							oResult.STATE = data.results[0].REGION;
							oResult.POSTCODE = data.results[0].STD_ADDR_POSTCODE1;
							oResult.COUNTRY = data.results[0].STD_ADDR_COUNTRY_2CHAR;

							oController.getModel("postalModel").setData(oResult, false);

						}

					},
					error: function(oMessage) {
						console.log(oMessage);
					}
				});
		},

		/**
		 * Bind straight away to the table base on the SCVID. 
		 * @param  {[String]} sScvId [scvId of the entity.]
		 * @return {[type]}        [description]
		 */
		_readPersonData: function(sScvId) {
			let oController = this;
			oController.getView().byId("person-table").bindRows("scvExplorerModel>/personParameters(IP_SCV_ID='" + sScvId + "')/Results");
		},

		/**
		 * Read the address data of a particular SCVID
		 * @param  {[String]} sScvId [the SCV ID of a particular object.]
		 * @return {[type]}        [description]
		 */
		_readAddressesData: function(sScvId) {

			let oController = this;
			oController.getView().byId("history-address-table").bindRows("scvExplorerModel>/addressParameters(IP_SCV_ID='" + sScvId +
				"')/Results");

			//read data for the the timeline via JSON model for easy manipulation. 
			oController.getModel("scvExplorerModel").read("/addressParameters" + "(IP_SCV_ID='" + sScvId +
				"')/Results", {
					urlParameters: {
						"$orderby": "VALID_TO desc"
					},
					success: function(data) {

						// if there are more than 0 addresses then set the data. 
						if (data.results.length > 0) {
							//bind the result to JSON model, for enhancement flexibility 
							//allow easy filter for non case sensitive search.
							oController.getModel("timelineModel").setData(data.results, false);
						}

					},
					error: function(oMessage) {
						console.log(oMessage);
					}
				});

		},

		/**
		 * Helper to read contact data of a particular entity base on their SCVID
		 * @param  {[type]} sScvId [String for the SCV ID that being passed in the URL]
		 * @return {[type]}        [description]
		 */
		_readScvContactData: function(sScvId) {

			let oController = this;
			oController.getModel("scvExplorerModel").read("/contactParameters" + "(IP_SCV_ID='" + sScvId + "')/Results", {
				urlParameters: {
					"$orderby": "SOURCE desc,VALID_TO desc"
				},
				success: function(data) {

					// grab the very top one for the current person. 
					if (data.results.length > 0) {
						//transform the person data to reflect for current.
						oController._transformPersonData(data.results, "contact");
					}

				},
				error: function(oMessage) {
					console.log(oMessage);
				}
			});

			//bind the contact tab for all of the contacts.
			oController.getView().byId("contact-history-table").bindRows("scvExplorerModel>/contactParameters(IP_SCV_ID='" + sScvId +
				"')/Results");

		},

		/**
		 * Everytime route is matched, will trigger below.
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		_readCurrentPersonData: function(sScvId) {
			let oController = this;
			oController.getModel("scvExplorerModel").read("/personParameters(IP_SCV_ID='" + sScvId + "')/Results", {
				urlParameters: {
					"$orderby": "SOURCE desc,VALID_TO desc"
				},
				success: function(data) {

					// grab the very top one for the current person. 
					if (data.results.length > 0) {
						//set the data for for the entire view information. 
						oController.getModel("viewModel").setData(data.results[0], true);

						//transform the person data to reflect for current.
						oController._transformPersonData(data.results, "person");
					}

				},
				error: function(oMessage) {
					console.log(oMessage);
				}
			});

			//bind automatically from the model for all the valid address
			oController.getView().byId("current-address-table").bindRows("scvExplorerModel>/addressParameters(IP_SCV_ID='" + sScvId +
				"',IP_YEAR='9999')/Results");

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
			let i = 0;

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
				for (i = 0; i < oData.length; i++) {
					if (oData[i].SOURCE === "RMS") {
						oResult.BP_NUMBER += oData[i].SOURCE_ID + "\n";
					}

				}

				//set the data and set merge to true, so we dont wipe existing data.
				oController.getModel("personModel").setData(oResult, true);

			} else if (sPath === "contact") {
				//transform for contact number, taking the very first hit for each type. 

				for (i = 0; i < oData.length; i++) {
	
					if (typeof oResult.MOBILE_NUMBER === "undefined") {
						if (oData[i].NUMBER_TYPE === "SMS") {
							oResult.MOBILE_NUMBER = oData[i].CONTACT_NUMBER;
						}
					}

					if (typeof oResult.HOME_NUMBER === "undefined") {
						if (oData[i].NUMBER_TYPE === "PHO") {
							oResult.HOME_NUMBER = oData[i].CONTACT_NUMBER;
						}
					}

					if (typeof oResult.CONTACT_EMAIL === "undefined") {

						if (oData[i].CONTACT_EMAIL !== null) {
							oResult.CONTACT_EMAIL = oData[i].CONTACT_EMAIL;
						}

					}

					//check that all items are in there, if yes break from the loop. 
					if (typeof oResult.MOBILE_NUMBER !== "undefined" &&
						typeof oResult.HOME_NUMBER !== "undefined" &&
						typeof oResult.CONTACT_EMAIL !== "undefined") {

						//break from the loop once all the needed info is there. 
						break;
					}

				}

				//set the data and set merge to true, so we dont wipe existing data.
				oController.getModel("personModel").setData(oResult, true);
			}

		}

	});

	return DetailObject;
});