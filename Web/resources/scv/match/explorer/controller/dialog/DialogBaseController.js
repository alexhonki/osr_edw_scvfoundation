/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018
 */
// Provides the generic dialog controller which is inherited by all dialog and the parent is still the SuperController
sap.ui.define([
  "osr/scv/match/explorer/controller/SuperController",
  "sap/ui/core/routing/History",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel"
], function (SuperController, History, Fragment, JSONModel, Formatters) {
  "use strict";

  /**
   * Constructor for new dialog.
   * The DialogBaseController controller provides predefined functions that allow to handle the exit and next events.
   */

  let DialogBaseController = SuperController.extend("osr.scv.match.explorer.controller.dialog.DialogBaseController", {

    Formatters: Formatters,

    /**
     * Destroy the dialog to that it's not in the memory anymore.
     * So that it is always new and no left over.
     */
    onDestroyDialog: function (oEvent) {
      this.dialog.destroy();
    },

    /**
     * Used to trigger the press event when the back button is clicked.
     * Will used this, unless it is being override by its own subcontroller
     */
    onDialogCancelPressed: function (oEvent) {
      this.dialog.close();
    },

    /**
     * each sub dialog controller will need to implement their own next.
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    onDialogNextPressed: function (oEvent) {
      //sub controller will implement this.
    }

  });

  return DialogBaseController;
});
