/*
 * Created by Stefanus
 * Base template to start a brand new SAPUI5 App
 * 02.05.2018 
 */
sap.ui.define([
  "osr/scv/match/explorer/controller/SuperController",
  "sap/ui/model/json/JSONModel"
], function (SuperController, JSONModel) {
  "use strict";

  let AppController = SuperController.extend("osr.scv.match.explorer.controller.App", {

    /**
     * On initialize
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    onInit: function (oEvent) {

      let oController = this;

      this.getRouter().attachRoutePatternMatched(this._onRouteMatched, this);

    },

    onAfterRendering: function () {

    },

    /**
     * Everytime route is matched, will trigger below.
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    _onRouteMatched: function (oEvent) {

    }

  });

  return AppController;
});
