sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("osr.scv.match.supervisor.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Generic function to initialize a dialog.
		 * @param  {String} sDialogName     The name of the dialog fragment file.
		 * @param  {String} sDialogPath     The path where the dialog fragment file located in.
		 * @return {sap.ui.core.Control}    Dialog control.
		 */
		initializeDialog: function(sDialogName, sDialogPath, sControllerPath) {

			let dialogController = sap.ui.controller(sControllerPath);

			// assign this controller (the controller from the calling method) to the dialog controller
			// to have access to the controller that call this, in case we want to access anything inside it.
			dialogController.ownerController = this;

			let sDialogId = this.makeRandomId();
			sDialogId += sDialogName;
			dialogController.dialog = sap.ui.xmlfragment(sDialogId, sDialogPath + sDialogName, dialogController);

			dialogController.dialog = sap.ui.xmlfragment(sDialogName, sDialogPath + sDialogName, dialogController);

			// need to assign the controller to the dialog to be able to access the data in case the dialog exists
			dialogController.dialog.controller = dialogController;

			// add dialog as dependent.
			this.getView().addDependent(dialogController.dialog);

			return dialogController.dialog;
		},

		/**
		 * Generate random id base on letters and 8 chars.
		 * @return {[type]} [description]
		 */
		makeRandomId: function() {
			let text = "";
			let sPossible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (let i = 0; i < 8; i++) {
				text += sPossible.charAt(Math.floor(Math.random() * sPossible.length));
			}

			return text;
		}

	});

});