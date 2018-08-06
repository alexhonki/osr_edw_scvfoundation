/*global location*/
sap.ui.define([
  "osr/scv/match/review/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "osr/scv/match/review/model/formatter",
  "sap/ui/core/format/DateFormat",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Label",
  "sap/m/TextArea",
  "sap/m/Button",
  "sap/m/ComboBox",
  "sap/m/MessageToast"
], function(BaseController, JSONModel, History, formatter, DateFormat, Filter, FilterOperator, MessageBox, Dialog, Label, TextArea,
  Button, ComboBox, MessageToast) {
  "use strict";

  return BaseController.extend("osr.scv.match.review.controller.Object", {

    formatter: formatter,
    currentMatchRow: null,

    /* =========================================================== */
    /* lifecycle methods                                           */
    /* =========================================================== */

    /**
     * Called when the worklist controller is instantiated.
     * @public
     */
    onInit: function() {
      // Model used to manipulate control states. The chosen values make sure,
      // detail page is busy indication immediately so there is no break in
      // between the busy indication for loading the view's meta data
      var iOriginalBusyDelay,
        oViewModel = new JSONModel({
          busy: true,
          delay: 0
        });

      //on route matched, call _onObjectMatched func
      this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

      // Store original busy indicator delay, so it can be restored later on
      iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
      this.setModel(oViewModel, "objectView");
      this.getOwnerComponent().getModel().metadataLoaded().then(function() {
        // Restore original busy indicator delay for the object view
        oViewModel.setProperty("/delay", iOriginalBusyDelay);
      });

      //assigning to global variable.
      this._oTable = this.byId("table");
      this._oDetailTable = this.byId("detailsTable1");

    },

    /**
     * Called when the table is rendered.
     * @public
     */
    onAfterDetailsTableRendering: function() {

    },

    /* =========================================================== */
    /* event handlers                                              */
    /* =========================================================== */

    /**
     * Event handler  for navigating back.
     * It checks if there is a history entry. If yes, history.go(-1) will happen.
     * If not, it will replace the current entry of the browser history with the worklist route.
     * Furthermore, it removes the defined binding context of the view by calling unbindElement().
     * @public
     */
    onNavBack: function() {

      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();
      var tableLength = this.byId("table").getRows().length;
      this.byId("table").removeSelectionInterval(0, tableLength);

      this.getView().unbindElement();

      if (sPreviousHash !== undefined) {
        // The history contains a previous entry
        history.go(-1);
      } else {
        // Otherwise we go backwards with a forward history
        var bReplace = true;
        this.getRouter().navTo("worklist", {}, bReplace);
      }
    },

    /* =========================================================== */
    /* internal methods                                            */
    /* =========================================================== */

    /**
     * Gets the popover to display the change log
     */
    _getPopover: function() {
      if (!this._oPopover) {
        this._oPopover = sap.ui.xmlfragment("myCompany.myApp.PopoverStrategyChangeLog", this);
      }
      return this._oPopover;
    },

    /**
     * Binds the view to the object path.
     * @function
     * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
     * @private
     */
    _onObjectMatched: function(oEvent) {

      //var sObjectPath = "/matchResultsReview('" + oEvent.getParameter("arguments").objectId + "')/matchResults";
      var sObjectPath = "/matchResultsReview('" + oEvent.getParameter("arguments").objectId.split("|")[0] + "')";
      this._bindView(sObjectPath);

      // Disable change log tab?
      // Read the change log count for current entity
      var that = this;
      this.getModel().read(sObjectPath + "/matchAssessments/$count", {
        success: function(oData) {
          var oRowCount = parseInt(oData),
            maxRowCount = 17;
          if (oRowCount < maxRowCount) {
            that.getView().byId("changeLogTable").setVisibleRowCount(oRowCount);
          } else {
            that.getView().byId("changeLogTable").setVisibleRowCount(maxRowCount);
          }
          //Hide change log tab?
          if (oRowCount === 0) {
            that.byId("itb1").getItems()[1].setVisible(false);
          } else {
            that.byId("itb1").getItems()[1].setVisible(true);
          }
        }
      });

      let oController = this;

      this.fOnDataReceived = function(oData) {

        // once data is recieved, details table get binding with the very first
        // result of the data set, ensuring the first row is always loaded and selected.
        let matchRow = oData.getParameters().data.results[0].MATCH_ROW;
        oController.currentMatchRow = matchRow;
        oController.getView().byId("tableDetails1Header").setText("Matches for Row " + matchRow);
        let sObjectPathRelated = "/matchResultsDetailsRelatedParameters(I_MATCH_ROW='" + matchRow + "')/Results";
        oController.byId("detailsTable1").bindRows({
          path: sObjectPathRelated,
          template: oController.byId("detailsTable1").getBindingInfo("rows").template
        });

        //disable the very first button on the main table.
        oController._disableFirstButton();

        oController.getView().byId("table").setVisibleRowCount(oData.getSource().iLength);

        // Read assessments and set initial selection
        oController.getModel().read(sObjectPath + "/matchAssessments", {

          urlParameters: {
            "$orderby": "TIMESTAMP desc"
          },
          success: function(oData) {
            // Adjust selection for checkboxes
            if (oData.results.length > 0) {
              oController._selectRows(oData);
            }
          }
        });

      };

      //attached a function call once data is received call
      //fOnDataReceived function
      var oBinding = this._oTable.getBinding("rows");
      oBinding.attachDataReceived(this.fOnDataReceived);
      
      // For the second table

      this.fOnDataReceived2 = function(oData) {
        var tableLength = oData.getSource().iLength;
        if (tableLength === 0) {
          that.getView().byId("detailsTable1").setVisibleRowCount(1);
        } else {
          that.getView().byId("detailsTable1").setVisibleRowCount(tableLength);

        }
      };
      
      // //attached a function call once data is received call
      //fOnDataReceived2 function
      var oBinding2 = this._oDetailTable.getBinding("rows");
      oBinding2.attachDataReceived(this.fOnDataReceived2);

    },

    /**
     * Enable all the buttons on the first table
     * according to the number of rows on the table itself.
     * @return {[type]}        [description]
     */
    _enableAllButtons: function() {
      var that = this;
      var oTable = that.byId("table");

      // Get rows
      var oRows = oTable.getRows();
      for (var i = 0; i < oRows.length; i++) {
        oRows[i].getCells()[10].setEnabled(true);
      }
    },

    /**
     * Disable the very first button on the table1 according
     * current id of the table "table"
     * @return {[type]}        [description]
     */
    _disableFirstButton: function() {

      var that = this;
      // Enable all buttons first
      that._enableAllButtons();

      var oTable = that.byId("table");
      var firstRow = oTable.getRows()[0];
      firstRow.getCells()[10].setEnabled(false);
    },

    /**
     * Helper function to set the check box to be ticked or unticked
     * depending on the group of the items
     * current id of the table "table"
     * @return {[type]}        [description]
     */
    _selectRows: function(oData) {
      var that = this;
      var oTable = that.byId("table");
      oTable.detachRowSelectionChange(that.boxTickedEvent, that);

      // Get rows
      var oRows = oTable.getRows();
      var currentMatchRow;
      var oDataMatchRow;

      for (var i = 0; i < oRows.length; i++) {

        currentMatchRow = that.getModel().getProperty(oRows[i].getBindingContext().getPath() + "/MATCH_ROW");

        for (var ix = 0; ix < oRows.length; ix++) {
          oDataMatchRow = oData.results[ix].MATCH_ROW;
          if (currentMatchRow === oDataMatchRow) {
            if (oData.results[ix].ACTION === 'Accept') {
              oTable.addSelectionInterval(i, i);
            }
            break;
          }
        }
      }

      oTable.attachRowSelectionChange(that.boxTickedEvent, that);
    },

    /**
     * Binds the view to the object path.
     * @function
     * @param {string} sObjectPath path to the object to be bound
     * @private
     */
    _bindView: function(sObjectPath) {
      var oViewModel = this.getModel("objectView"),
        oDataModel = this.getModel();

      this.getView().bindElement({
        path: sObjectPath,
        events: {
          change: this._onBindingChange.bind(this),
          dataRequested: function() {
            oDataModel.metadataLoaded().then(function() {
              // Busy indicator on view should only be set if metadata is loaded,
              // otherwise there may be two busy indications next to each other on the
              // screen. This happens because route matched handler already calls '_bindView'
              // while metadata is loaded.
              oViewModel.setProperty("/busy", true);
            });
          },
          dataReceived: function(oData) {
            oViewModel.setProperty("/busy", false);
          }
        }
      });
    },

    /**
     * [description]
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    _onBindingChange: function(oEvent) {
      var oView = this.getView(),
        oViewModel = this.getModel("objectView");

      // No data for the binding
      if (!oView.getBindingContext()) {
        this.getRouter().getTargets().display("objectNotFound");
        return;
      }

      var oResourceBundle = this.getResourceBundle(),
        oObject = oView.getBindingContext().getObject(),
        sObjectId = oObject.ENTITY_ID,
        sObjectName = oObject.NAME;

      // Everything went fine.
      oViewModel.setProperty("/busy", false);
      oViewModel.setProperty("/shareSendEmailSubject",
        oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
      oViewModel.setProperty("/shareSendEmailMessage",
        oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

    },

    handleStrategyChangeLogLinkPress: function(oEvent) {
      var domRef = oEvent.getParameter("domRef");
      this._getPopover().openBy(domRef);
    },

    /**
     * Handle the loading of detail of a selected item and load according to
     * what is selected.
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    onPress2: function(oEvent) {

      //set busy state for matching rows table.
      this.getView().byId("detailsTable1").setBusy(true);

      // Enable all buttons and disable source
      this._enableAllButtons();
      oEvent.getSource().setEnabled(false);

      // The source is the list item that got pressed
      var newMatchRow = oEvent.getSource().getBindingContext().getProperty("MATCH_ROW_STR");
      var sObjectPathRelated = "/matchResultsDetailsRelatedParameters(I_MATCH_ROW='" + newMatchRow + "')/Results";
      var oController = this;

      oController.byId("detailsTable1").bindRows({
        path: sObjectPathRelated,
        template: oController.byId("detailsTable1").getBindingInfo("rows").template
      });

      //attached binding to the function after it load finished
      var oBinding2 = oController._oDetailTable.getBinding("rows");
      oBinding2.attachDataReceived(oController.fOnDataReceived2);

      oController.fOnDataReceived2 = function(oData) {

        //set busy state for matching rows table.
        oController.getView().byId("detailsTable1").setBusy(false);

        var tableLength = oData.getSource().iLength;
        if (tableLength === 0) {
          oController.getView().byId("detailsTable1").setVisibleRowCount(1);
        } else {
          oController.getView().byId("detailsTable1").setVisibleRowCount(tableLength);

        }
        // Set new title for details table
        oController.getView().byId("tableDetails1Header").setText("Matches for Row " + newMatchRow);

      };

    },

    _showObject: function(oItem) {
      var newMatchRow = oItem.getBindingContext().getProperty("MATCH_ROW_STR");
      var sObjectPathRelated = "/matchResultsDetailsRelatedParameters(I_MATCH_ROW='" + newMatchRow + "')/Results";
      this.byId("detailsTable1").bindRows({
        path: sObjectPathRelated,
        template: this.byId("detailsTable1").getBindingInfo("rows").template
      });
    },

    /**
     * Updates the model with the user comments on Products.
     * @function
     * @param {sap.ui.base.Event} oEvent object of the user input
     */
    onPost: function(oEvent) {
      var oFormat = DateFormat.getDateTimeInstance({
        style: "medium"
      });
      var sDate = oFormat.format(new Date());
      var oObject = this.getView().getBindingContext().getObject();
      var sValue = oEvent.getParameter("value");
      var oEntry = {
        groupID: oObject.GROUP_ID,
        type: "Comment",
        date: sDate,
        comment: sValue
      };

      // update model
      var oFeedbackModel = this.getModel("productFeedback");
      var aEntries = oFeedbackModel.getData().productComments;
      aEntries.push(oEntry);
      oFeedbackModel.setData({
        productComments: aEntries
      });
    },

    /**
     *  Accepts a matching group to be promoted into the SCV layer
     */
    onAccept: function() {
      var rowIndices = this.byId("table").getSelectedIndices();

      var entityId = this.getView().getBindingContext().getObject().ENTITY_ID,
        acceptComment = sap.ui.getCore().byId("acceptComment").getValue(),
        acceptComboBoxKey = sap.ui.getCore().byId("acceptComboBox").getSelectedKey(),
        rowTable = this.byId("table").getRows(),
        allTicked = false,
        that = this;
      if (rowIndices.length === rowTable.length) {
        allTicked = true;
      }
      this.onCloseDialog();
      for (var i = 0; i < rowTable.length; i++) {
        if (that.byId("table").isIndexSelected(i)) {
          var payload = {};
          payload.ENTITY_ID = entityId;
          payload.STRATEGY = 'Promote';
          payload.ACTION = 'Accept';
          if (allTicked) {
            payload.ACTION_RESOLVED_STATUS = 'Success';
          } else {
            payload.ACTION_RESOLVED_STATUS = 'Warning';
          }
          payload.CODE = acceptComboBoxKey;
          payload.COMMENT = acceptComment;
          payload.MATCH_ROW = that.getModel().getProperty(rowTable[i].getBindingContext().getPath() + "/MATCH_ROW_STR");

          $.ajax({
            type: "GET",
            url: "/scv/match/srv/xs/review/updateMatchAssessments.xsjs",
            contentType: "application/json",
            data: payload,
            dataType: "json",
            crossDomain: true,
            success: function() {
              //refresh();
              that.getView().getElementBinding().refresh(true);
              MessageToast.show('Data saved...');
            },
            error: function(data) {
              var message = JSON.stringify(data);
              alert(message);
            }
          });
        } else {
          var payload = {};
          payload.ENTITY_ID = entityId;
          payload.STRATEGY = 'Promote';
          payload.ACTION = 'Reject';
          if (allTicked) {
            payload.ACTION_RESOLVED_STATUS = 'Error';
          } else {
            payload.ACTION_RESOLVED_STATUS = 'Warning';
          }
          payload.CODE = acceptComboBoxKey;
          payload.COMMENT = acceptComment;
          payload.MATCH_ROW = that.getModel().getProperty(rowTable[i].getBindingContext().getPath() + "/MATCH_ROW_STR");

          $.ajax({
            type: "GET",
            url: "/scv/match/srv/xs/review/updateMatchAssessments.xsjs",
            contentType: "application/json",
            data: payload,
            dataType: "json",
            crossDomain: true,
            success: function() {
              //refresh();
              that.getView().getElementBinding().refresh(true);
              MessageToast.show('Data saved...');
            },
            error: function(data) {
              var message = JSON.stringify(data);
              alert(message);
            }
          });

        }
      }

    },

    /**
     * Rejects a matching group to be promoted into the SCV layer
     * @return {[type]} [description]
     */
    onReject: function() {
      var
        //rowIndices = this.byId("table").getSelectedIndices(),
        entityId = this.getView().getBindingContext().getObject().ENTITY_ID,
        rejectComment = sap.ui.getCore().byId("rejectComment").getValue(),
        rejectComboBoxKey = sap.ui.getCore().byId("rejectComboBox").getSelectedKey(),
        rowTable = this.byId("table").getRows(),
        that = this;
      /*if (rowIndices === rowTable.length) {
      	allTicked = true;
      }*/
      this.onCloseDialog();
      for (var i = 0; i < rowTable.length; i++) {
        var payload = {};
        payload.ENTITY_ID = entityId;
        payload.STRATEGY = 'Promote';
        payload.ACTION = 'Reject';
        payload.ACTION_RESOLVED_STATUS = 'Error';
        payload.CODE = rejectComboBoxKey;
        payload.COMMENT = rejectComment;
        payload.MATCH_ROW = that.getModel().getProperty(rowTable[i].getBindingContext().getPath() + "/MATCH_ROW_STR");

        $.ajax({
          type: "GET",
          url: "/scv/match/srv/xs/review/updateMatchAssessments.xsjs",
          contentType: "application/json",
          data: payload,
          dataType: "json",
          crossDomain: true,
          success: function() {
            //refresh();
            that.getView().getElementBinding().refresh(true);
            MessageToast.show('Data saved...');
          },
          error: function(data) {
            var message = JSON.stringify(data);
            alert(message);
          }
        });

      }

    },

    /**
     * Open dialog based on tick boxes in the table
     * @return {[type]} [description]
     */
    onOpenAcceptDialog: function() {
      if (this.checkTableTick()) {
        this._oDialog = sap.ui.xmlfragment("osr.scv.match.review.view.AcceptDialog", this);
      } else {
        this._oDialog = sap.ui.xmlfragment("osr.scv.match.review.view.RejectDialog", this);
      }
      this.getView().addDependent(this._oDialog);
      var dialog = this._oDialog;
      dialog.open();
    },

    /**
     * Clsoe dialog func and destroy the dialog on close.
     * @return {[type]} [description]
     */
    onCloseDialog: function() {
      this._oDialog.close();
      this._oDialog.destroy();

    },
    /**
     * Helper method that is being called from within these 2 dialogs below.
     * Accept Dialog
     * Reject Dialog
     * @param  {[type]} oControlEvent [description]
     * @return {[type]}               [description]
     */
    handleLoadItems: function(oControlEvent) {
      oControlEvent.getSource().getBinding("items").resume();
    },

    checkTableTick: function() {
      var rowIndices = this.byId("table").getSelectedIndices();
      if (rowIndices.length === 0) {
        return (false);
      } else {
        return (true);
      }
    },

    checkSwitchTick: function() {
      var oRows = this.byId("table").getRows();
      var that = this;
      var oRow, oSwitch, i;
      var countAccept = 0;
      for (i = 0; i < oRows.length; i++) {
        oRow = that.byId("table").getRows()[i];
        oSwitch = oRow.getCells()[0];
        if (oSwitch.getState()) {
          countAccept++;
        }
      }
      return (countAccept);
    },

    /**
     * Main function that handle check all or uncheck all for all
     * of the different items in the table
     * @param  {[type]} oEvent [as described]
     * @return {[type]}        [description]
     */
    boxTickedEvent: function(oEvent) {

      var that = this;

      if (typeof oEvent.getParameters().rowContext !== "undefined" && oEvent.getParameters().rowContext !== null) {
        var path = oEvent.getParameters().rowContext.sPath;
        var sysId = that.getModel().getProperty(path + "/GROUP_TAG");
        var oRows = that.byId("table").getRows();

        if (that.byId("table").isIndexSelected(oEvent.getParameter("rowIndex"))) {
          for (var i = 0; i < oRows.length; i++) {
            if (sysId === that.getModel().getProperty(oRows[i].getBindingContext().getPath() + "/GROUP_TAG")) {
              if (!that.byId("table").isIndexSelected(i)) {
                that.byId("table").addSelectionInterval(i, i);
              }
            }
          }
        } else {

          //allow a single item to be unticked
          //that.byId("table").removeSelectionInterval(oEvent.getParameters().rowIndex, oEvent.getParameters().rowIndex);

          // in case we want to disable all the ticked base on their grouping.

          for (var i = 0; i < oRows.length; i++) {
            if (sysId === that.getModel().getProperty(oRows[i].getBindingContext().getPath() + "/GROUP_TAG")) {
              if (that.byId("table").isIndexSelected(i)) {
                that.byId("table").removeSelectionInterval(i, i);
              }
            }
          }
        }
      }

    },
		
    onSwitchChange: function(oEvent) {
      var path = oEvent.getSource().getParent().getBindingContext().getPath() + "/GROUP_TAG";
      var sysId = this.getModel().getProperty(path);
      var oRows = this.byId("table").getRows();
      var that = this;
      var oRow, oSwitch, i;
      if (oEvent.getParameters().state) {
        for (i = 0; i < oRows.length; i++) {
          if (sysId === that.getModel().getProperty(oRows[i].getBindingContext().getPath() + "/GROUP_TAG")) {
            oRow = this.byId("table").getRows()[i];
            oSwitch = oRow.getCells()[0];
            if (!oSwitch.getState()) {
              oSwitch.setState(true);
            }
          }
        }
      } else {
        for (i = 0; i < oRows.length; i++) {
          if (sysId === that.getModel().getProperty(oRows[i].getBindingContext().getPath() + "/GROUP_TAG")) {
            oRow = this.byId("table").getRows()[i];
            oSwitch = oRow.getCells()[0];
            if (oSwitch.getState()) {
              oSwitch.setState(false);
            }
          }
        }
      }
    }
  });

});
