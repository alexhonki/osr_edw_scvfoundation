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

		},

		_querySearch: function(sQueryString) {

			let oController = this;
			//for api call search
			let sApiUrl = this.getOwnerComponent().getMetadata().getConfig("unstructuredSearch");
			$.ajax(sApiUrl, {
				data: {
					sQuery: sQueryString,
					sFuzzy: 0.8
				},
				beforeSend: function() {
					//loading effect start
				},
				complete: function() {
					//loading effect end
				},
				success: function(data) {

					let oFinalData = data;
					//transform the data according to the results. 
					for (let i = 0; i < data.length; i++) {
						let aSplitResult = data[i].SEARCH_STRING_CLEANSED.split("|");

						if (aSplitResult.length === 10) {
							oFinalData[i].FIRST_NAME = aSplitResult[0];
							oFinalData[i].LAST_NAME = aSplitResult[1];
							oFinalData[i].CITY = aSplitResult[3];
							oFinalData[i].DOB = moment(aSplitResult[2]).format("DD/MM/YYYY");
							oFinalData[i].POSTAL_CODE = aSplitResult[4];
						} else if (aSplitResult.length === 11) {
							oFinalData[i].FIRST_NAME = aSplitResult[0];
							oFinalData[i].LAST_NAME = aSplitResult[1] + " " + aSplitResult[2];
							oFinalData[i].CITY = aSplitResult[4];
							oFinalData[i].DOB = moment(aSplitResult[3]).format("DD/MM/YYYY");
							oFinalData[i].POSTAL_CODE = aSplitResult[5];
						}
					}
					oController.getModel("searchResult").setData(oFinalData, false);
				},
				failure: function(error) {

					console.log(error);
				}
			});
		},
		/**
		 * Responsible for on search query coming.
		 */
		onSearch: function(oEvent) {

			let oController = this;
			// this is for delaying the input to safely wait for the barcode scanner.
			// clear the timeout everytime, so that when its long enough it will go to the timeout self.
			clearTimeout(oController.oTimeout);
			let sQueryString = oEvent.getSource().getValue();
			//oTimeout that get clear above and if nothing clear it will go through then.
			oController.oTimeout = setTimeout(function() {
				// once its clear, execute search over here. 
				oController._querySearch(sQueryString);

			}, 400); //400ms before the search get trigger, so we dont bombard the query on every letter. gotta play with magic number.

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

			this.getRouter().navTo("objectdetail", oCustomData);
		}

	});

	return MainMenu;
});