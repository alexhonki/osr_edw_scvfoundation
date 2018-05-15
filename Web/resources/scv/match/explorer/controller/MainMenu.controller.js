/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018
 */
sap.ui.define([
  "osr/scv/match/explorer/controller/SuperController"
], function (SuperController) {
  "use strict";

  let MainMenu = SuperController.extend("osr.scv.match.explorer.controller.MainMenu", {

    /**
     * Run on initialize
     * @return {[type]} [description]
     */
    onInit: function () {

      this.getRouter().getRoute("homepage").attachPatternMatched(this._onRouteMatched, this);
      this.getRouter().getRoute("appHome").attachPatternMatched(this._onRouteMatched, this);

    },

    /**
     * Everytime route is matched, will trigger below.
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    _onRouteMatched: function (oEvent) {

    },

    onSearch: function (oEvent) {

    },

    onFilterCriteriaPressed: function (oEvent) {
      let oWarningDialog = this.initializeDialog("AdvanceFilter", "osr.scv.match.explorer.view.dialog.", "osr.scv.match.explorer.controller.dialog.AdvanceFilterDialog");

      //oWarningDialog.getContent()[0].bindProperty("text", "i18n>decommission.dialog.perishable");
      //oWarningDialog.getEndButton().setText("Yes");

      oWarningDialog.open();
    }

  });

  return MainMenu;
});
