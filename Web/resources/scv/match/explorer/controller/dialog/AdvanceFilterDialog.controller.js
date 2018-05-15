/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018
 */
sap.ui.define([
  "osr/scv/match/explorer/controller/dialog/DialogBaseController",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel"
], function (DialogBaseController, Fragment, JSONModel) {
  "use strict";

  let ConfirmationDialog = DialogBaseController.extend("osr.scv.match.explorer.controller.dialog.AdvanceFilterDialog", {

    /**
     * On init of the controller.
     * @return {[type]} [as described]
     */
    onInit: function () {

    },

    /**
     * Once user confirmed next, this will execute the update.
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    onDialogNextPressed: function (oEvent) {
      //let sViewName = this.ownerController.sViewName;

    }

  });

  return ConfirmationDialog;
});
