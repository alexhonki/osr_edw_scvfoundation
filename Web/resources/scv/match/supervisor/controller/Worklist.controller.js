sap.ui.define([
  "osr/scv/match/supervisor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "osr/scv/match/supervisor/model/formatter",
  "sap/ui/model/Filter",
  "sap/ui/model/Sorter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  'sap/m/IconTabFilter',
  'sap/m/Text',
  'sap/m/IconTabSeparator',
  'sap/m/Button',
  'sap/m/Dialog'

], function(BaseController, JSONModel, formatter, Filter, Sorter, FilterOperator, MessageToast, MessageBox, IconTabFilter, Text,
  IconTabSeparator, Button, Dialog) {
  "use strict";

  return BaseController.extend("osr.scv.match.supervisor.controller.Worklist", {

    formatter: formatter,

    /* =========================================================== */
    /* lifecycle methods                                           */
    /* =========================================================== */

    onAfterRendering: function() {

      var vizFrame = this.byId("idVizFrame");
      vizFrame.getModel().attachRequestSent(function() {
        //sap.ui.core.BusyIndicator.show(0);
        vizFrame.setBusy(true);
      });
      vizFrame.getModel().attachRequestCompleted(function() {
        //sap.ui.core.BusyIndicator.hide();
        vizFrame.setBusy(false);
      });

    },

    /**
     * Called when the worklist controller is instantiated.
     * @public
     */
    onInit: function() {

      //set a holder for the dialog and reference it so it can be open and close
      //at anytime necessary.
      this.oBusyDialog = sap.ui.xmlfragment("osr.scv.match.supervisor.dialogs.BusyDialog");
      this.getView().addDependent(this.oBusyDialog);

      this.getRouter().getRoute("worklist").attachPatternMatched(this._onRouteMatched, this);
    },

    /**
     * Get triggered whenever the route is being called.
     * @param  {[type]} oEvent [if there's any]
     * @return {[type]}        [description]
     */
    _onRouteMatched: function(oEvent) {
	 
	 // initial check whether any procedure is running is being disabled.
	 // all funcs relating to SCV Promote Btn.
	 
      // let oController = this;
      //oController.getView().byId("promoteToSCVBtn").setEnabled(false); //assume something running

      //do an ajax call to check whether it is working at the moment or not.
      //let sCheckerUrl = this.getOwnerComponent().getMetadata().getConfig("scvProcedureChecker");
      //$.ajax(sCheckerUrl, {
      //  success: function(data) {
      //    // boolean checker whether promote procedures running.
      //    // 1 is true and the rest are false.
      //    if (data !== 1) {
      //      //no more procedures running in regards to promote SCV
      //      oController.getView().byId("promoteToSCVBtn").setEnabled(true);
      //      oController.oBusyDialog.close();
      //    } else {

      //      oController.oBusyDialog.open();
      //      oController.getView().byId("promoteToSCVBtn").setEnabled(false);
      //    }

      //  },
      //  error: function(error) {
      //    //check for http error and serve accordingly.
      //    if (error.status === 403) {
      //      oController.sendMessageToast("You do not have enough authorisation please contact your system admin.");
      //    } else {
      //      oController.sendMessageToast("Something went wrong, our apologies. Please close the browser and try again.");
      //    }

      //  }
      //});

      //checker start to run interval for every 30seconds
      //can be change to longer if necessary. e.g 1min interval
      //time in millisecond.
      //disable function
      //this.startIntervalChecker(30000);
    },

    /**
     * Interval checker to know whether there is any procedure in relation of
     * promote to SCV that is still running as of now.
     * @param  {[type]} iMilliseconds [time in ms for the interval check]
     * @return {[type]}               [description]
     */
    startIntervalChecker: function(iMilliseconds) {

      let oController = this;
      //for api call search
      let sCheckerUrl = this.getOwnerComponent().getMetadata().getConfig("scvProcedureChecker");

      setInterval(function() {
        $.ajax(sCheckerUrl, {
          success: function(data) {
            // boolean checker whether promote procedures running.
            // 1 is true and the rest are false.
            if (data !== 1) {
              //no more procedures running in regards to promote SCV
              oController.getView().byId("promoteToSCVBtn").setEnabled(true);
              oController.oBusyDialog.close();

            } else {
              //if procedures is running make sure dialog is open button is disabled.
              oController.oBusyDialog.open();
              oController.getView().byId("promoteToSCVBtn").setEnabled(false);
            }
          },
          error: function(error) {
            //check for http error and serve accordingly.
            if (error.status === 403) {
              oController.sendMessageToast("You do not have enough authorisation please contact your system admin.");
            } else {
              oController.sendMessageToast("Something went wrong, our apologies. Please close the browser and try again.");
            }

          }
        });
      }, iMilliseconds);
    },

    /* =========================================================== */
    /* internal methods                                            */
    /* =========================================================== */

    /**
     * Displays an error message dialog. The displayed dialog is content density aware.
     * @param {String} sMsg The error message to be displayed
     * @private
     */
    _showErrorMessage: function(sMsg) {
      MessageBox.error(sMsg, {
        styleClass: this.getOwnerComponent().getContentDensityClass()
      });
    },

    _setBusyStateFrame: function(bShow) {
      let oController = this;
      oController.getView().byId("idVizFrame").setBusy(bShow);
    },

    onPromoteToSCV: function() {

      let oController = this;

      var dialog = new Dialog({
        title: 'Confirm',
        type: 'Message',
        content: new Text({
          text: 'Promote all entities to SCV layer? Note: This will move all entities with strategy \'Promote\' to the SCV foundation layer.'
        }),
        beginButton: new Button({
          text: 'Promote',
          press: function() {

            // Set to busy
            //oController._setBusyStateFrame(true);
            oController.oBusyDialog.open();

            $.ajax({
              type: "POST",
              url: "/scv/match/srv/xs/supervisor/moveEntitiesToShadowTable.xsjs",
              contentType: "application/json",
              crossDomain: true
            });

            dialog.close();
          }
        }),
        endButton: new Button({
          text: 'Cancel',
          press: function() {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();

    },

    handleConfirm: function(oEvent) {

      var oView = this.getView();
      var oTable = oView.byId("table");

      var mParams = oEvent.getParameters();
      var oBinding = oTable.getBinding("items");

      // apply sorter to binding
      // (grouping comes before sorting)
      var sPath;
      var bDescending;
      var vGroup;
      var aSorters = [];
      if (mParams.groupItem) {
        sPath = mParams.groupItem.getKey();
        bDescending = mParams.groupDescending;
        vGroup = this.mGroupFunctions[sPath];
        aSorters.push(new Sorter(sPath, bDescending, vGroup));
      }
      sPath = mParams.sortItem.getKey();
      bDescending = mParams.sortDescending;
      aSorters.push(new Sorter(sPath, bDescending));
      oBinding.sort(aSorters);

      // apply filters to binding
      var aFilters = [];
      jQuery.each(mParams.filterItems, function(i, oItem) {
        var aSplit = oItem.getKey().split("___");
        var sPath = aSplit[0];
        var sOperator = aSplit[1];
        var sValue1 = aSplit[2];
        var sValue2 = aSplit[3];
        var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
        aFilters.push(oFilter);
      });
      oBinding.filter(aFilters);
    }

  });

});
