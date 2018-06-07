/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018
 */
sap.ui.define([
	"osr/scv/match/explorer/controller/dialog/DialogBaseController",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function(DialogBaseController, Fragment, JSONModel) {
	"use strict";

	let ConfirmationDialog = DialogBaseController.extend("osr.scv.match.explorer.controller.dialog.AdvanceFilterDialog", {

		/**
		 * On init of the controller.
		 * @return {[type]} [as described]
		 */
		onInit: function() {

		},

		/**
		 * on dialognext pressed, let the ownerController took over the action
		 * @param  {[type]} oEvent [description]
		 * @return {[type]}        [description]
		 */
		onDialogNextPressed: function(oEvent) {

			//this can be changed for companies as well, 
			//depending on the status, we just need to set flag. 
			this.ownerController.processAdvanceFilter();
			
			//applied and close.
			this.dialog.close();
		},

		/**
		 * Trigger the search in the owner controller and pass the event along
		 */
		onSearch: function(oEvent) {
			this.ownerController.onSearch(oEvent);
		}

	});

	return ConfirmationDialog;
});