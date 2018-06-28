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

	let MainMenu = SuperController.extend("osr.scv.match.explorer.controller.MainMenu", {

		/**
		 * Run on initialize
		 * @return {[type]} [description]
		 */
		onInit: function() {

			//to cater for timeout usage throughout the page
			this.oTimeout = null;

			this.setModel(new JSONModel(), "searchResult");

			//set model to the view, so that dialog can be accessed and there's data for it. 
			//since we add dependent to it

			this.setModel(new JSONModel(), "searchParameters");

			this.getRouter().getRoute("homepage").attachPatternMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("appHome").attachPatternMatched(this._onRouteMatched, this);

		},

		/**
		 * Everytime route is matched, will trigger below.
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		_onRouteMatched: function(oEvent) {

			//reset filters that is being applied
			this._resetAllSearch();

		},

		/**
		 * Function helper to reset search filter of the model. 
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		_resetAllSearch: function() {
			//reset the model everytime it enters and clear everything else. 
			// set model for source selection
			// disable, in the event that we want to reset everything else. 
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
			//set the data and replace everything that is inside. 
			this.getModel("searchParameters").setData(oSourceType, false);
			//this.getModel("searchParameters").setProperty("/searchString", "");

		},

		/**
		 * Upon clicking advance filter dialog criteria, it will 
		 */
		processAdvanceFilter: function() {
			let oAdditionalFilter = this.getModel("searchParameters").getData();

			//transform payload data here, additional filters could be place here. 
			//just need to adjust the xsjs
			let oPayload = {};
			oPayload.sQuery = oAdditionalFilter.searchString;
			oPayload.sFuzzy = 0.8;
			oPayload.sCity = oAdditionalFilter.city;
			oPayload.sPostcode = oAdditionalFilter.postcode;
			oPayload.sScvId = oAdditionalFilter.scvId;
			oPayload.sSourceId = oAdditionalFilter.sourceId;
			oPayload.sSourceSystem = oAdditionalFilter.sourceSystem;

			//call the query search func.
			this._querySearch(oPayload);
		},

		/**
		 * Function helper to determine whether a string contain number
		 * @param  {[String]} sString [a string]
		 * @return {[Boolean]}        [true or false depending on the regex]
		 */
		_hasNumber: function(sString) {
			return /\d/.test(sString);
		},

		/**
		 * Function helper to determine whether the search action 
		 * will just trigger the source only comparison or not
		 * @param  {[String]} sQuery [a string]
		 * @return {[Object]}        [the id and flag for whether it source only or not]
		 */
		_determineSearchAction: function(sQuery) {

			let oResult = {};

			//check whether the string contain number first or not
			//then do accordingly
			if (this._hasNumber(sQuery)) {
				let aQueryWords = sQuery.split(" ");
				//loop through each word in the query.
				for (let key in aQueryWords) {

					//check this word is a number or not.
					let bContainNumber = this._hasNumber(aQueryWords[key]);

					//if yes, then check length of the number to determine our source id. 
					if (bContainNumber) {
						//a min of 7 characters to trigger this
						if (aQueryWords[key].length > 6) {
							//if the number is less than 0, add further zero infront 
							//to pad and make sure its consistent.
							let iLetterDiff = 10 - aQueryWords[key].length;
							let sFinalSourceId = aQueryWords[key];
							for (let i = 0; i < iLetterDiff; i++) {
								sFinalSourceId = "0" + sFinalSourceId;
							}

							//set the flag for the query and final source id.
							oResult.sSourceIdRMS = sFinalSourceId; //to accomodate the prefix zeros in front
							oResult.sSourceIdTMR = aQueryWords[key]; //to search through TMR without the zeros
						}
					}
				}
				return oResult;
			} else {
				return; // do nothing and terminate
			}

		},

		/**
		 * Helper to search base on what is the user string. 
		 * this will get triggered after the timeout for the search is cleared. 
		 * @param  {[Object]} oPayload [contain all the payload that will be send to the xsjs]
		 */
		_querySearch: function(oPayload) {

			let oController = this;

			//determine whether we are going to 
			let oFlag = oController._determineSearchAction(oPayload.sQuery);

			//add result from oFlag
			if (typeof oFlag !== "undefined") {
				oPayload.sSourceIdinQueryRMS = oFlag.sSourceIdRMS;
				oPayload.sSourceIdinQueryTMR = oFlag.sSourceIdTMR;
			}
			//for api call search
			let sApiUrl = this.getOwnerComponent().getMetadata().getConfig("unstructuredSearch");

			//add fuzzy level search here. 
			oPayload.sFuzzy = 0.8;
			oController.getView().byId("searchapi-table").setBusy(true);

			$.ajax(sApiUrl, {
				data: oPayload,
				beforeSend: function() {
					//loading effect start if needed
				},
				complete: function() {
					//loading effect end if needed
				},
				success: function(data) {

					oController.getView().byId("searchapi-table").setBusy(false);
					oController.oSearchControlHolder.setBusy(false);
					oController.getModel("searchResult").setData(data, false);
				},
				failure: function(error) {
					oController.getView().byId("searchapi-table").setBusy(false);
					oController.oSearchControlHolder.setBusy(false);
					oController.sendMessageToast("Something went wrong, our apologies. Please try again.");
					console.log(error);
				}
			});
		},
		/**
		 * Responsible for on search query coming.
		 */
		onSearch: function(oEvent) {

			let oController = this;

			//grab the existing parameters if there's any.
			let oAdditionalFilter = oController.getModel("searchParameters").getData();
			// this is for delaying the input to safely wait for the barcode scanner.
			// clear the timeout everytime, so that when its long enough it will go to the timeout self.
			clearTimeout(oController.oTimeout);
			let sQueryString = oEvent.getSource().getValue();
			let oPayload = {
				sQuery: sQueryString,
				sFuzzy: 0.8,
				sCity: oAdditionalFilter.city,
				sPostcode: oAdditionalFilter.postcode,
				sScvId: oAdditionalFilter.scvId,
				sSourceId: oAdditionalFilter.sourceId,
				sSourceSystem: oAdditionalFilter.sourceSystem
			};

			oController.oSearchControlHolder = oEvent.getSource();

			//oTimeout that get clear above and if nothing clear it will go through then.
			oController.oTimeout = setTimeout(function() {
				// once its clear, execute search over here. 
				oController._querySearch(oPayload);
				oController.oSearchControlHolder.setBusy(true);
			}, 500); //500ms before the search get trigger, so we dont bombard the query on every letter. gotta play with magic number.

		},

		onFilterCriteriaPressed: function(oEvent) {
			let oWarningDialog = this.initializeDialog("AdvanceFilter", "osr.scv.match.explorer.view.dialog.",
				"osr.scv.match.explorer.controller.dialog.AdvanceFilterDialog");

			//oWarningDialog.getContent()[0].bindProperty("text", "i18n>decommission.dialog.perishable");
			//oWarningDialog.getEndButton().setText("Yes");

			oWarningDialog.open();
		},

		onItemPressed: function(oEvent) {
			let oCustomData = {
				scvId: oEvent.getSource().data().scvId
			};

			this.showBusyIndicator(true);
			this.getRouter().navTo("objectdetail", oCustomData);
		}

	});

	return MainMenu;
});