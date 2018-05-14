sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "osr/scv/match/explorer/model/models",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, JSONModel) {
  "use strict";

  return UIComponent.extend("osr.scv.match.explorer.Component", {

    metadata: {
      manifest: "json"
    },

    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    init: function () {

      //this.setModel(new JSONModel(oCurrentDeviceModelData), "currentDeviceStatus");

      // set the device model
      this.setModel(models.createDeviceModel(), "device");

      // set app wide model.
      this.setModel(new JSONModel(), "advanceFilterModel");

      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);

      // create the views based on the url/hash
      this.getRouter().initialize();

    }

  });
});
