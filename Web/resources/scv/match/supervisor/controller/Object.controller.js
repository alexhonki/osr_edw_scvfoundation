/*global location*/
sap.ui.define([
	"osr/scv/match/supervisor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"osr/scv/match/supervisor/model/formatter",
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

	return BaseController.extend("osr.scv.match.supervisor.controller.Object", {

		formatter: formatter,

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

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

		},
		
		/**
		 * Called when the table is rendered.
		 * @public
		 */
		onAfterDetailsTableRendering: function() {
			
			var oItems = this.byId("detailsTable");
			if (oItems) {
				this.byId("detailsTable").getItems()[0].setSelected(true);
			}
			
			/*
			var oTable = this.getView().byId("detailsTable");
			var aItems = oTable.getItems();
			var i = 0;
			var x = 0;
			if (aItems && aItems.length > 0) {
				for (i = 0; i < aItems.length; i++) {
					var aCells = aItems[i].getCells();
					if (aCells[12].getText() === "Date, CustSourceSystem, CustSourceId") {
						//you can set the style via Jquery
						//$("#" + aItems[i].getId()).css("background-color", "red");
						//or add the style
						for (x = 0; x < aCells.length; x++) {
							aCells[x].addStyleClass("fadeMatchPolicy");
						}
						//aItems[i].addStyleClass("redBackground");
					}
				}
			}
			*/
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
			
			var matchRow =  oEvent.getParameter("arguments").objectId.split("|")[1];
			
			// Related match rows
			var sObjectPathRelated = "/matchResultsDetailsRelatedParameters(I_MATCH_ROW='" + matchRow + "')/Results";
			this.byId("detailsTable1").bindItems({path: sObjectPathRelated, template:this.byId("detailsTable1").getBindingInfo("items").template});
			//zTable.bindItems({path: "/itemstit", template:this.byId("detailsTable").getBindingInfo("items").template});
			
			// Pre-select first line
			//this.byId("detailsTable").getItems()[0].setSelected(true);
			
			// Disable change log tab?
			// Read the change log count for current entity
			var that = this;
			this.getModel().read(sObjectPath + "/matchAssessments/$count", {
				success: function(oData) {
					var count = oData;
					//Hide change log tab?
					if (parseInt(count) === 0) {
						that.byId("itb1").getItems()[1].setVisible(false);
					} else {
						that.byId("itb1").getItems()[1].setVisible(true);
					}
				}
			});

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
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

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

			// Update the comments in the list
			//var oList = this.byId("idCommentsList");
			//var oBinding = oList.getBinding("items");
			//oBinding.filter(new Filter("GROUP_ID", FilterOperator.EQ, sObjectId));
		},

		handleStrategyChangeLogLinkPress: function(oEvent) {
			var domRef = oEvent.getParameter("domRef");
			this._getPopover().openBy(domRef);
		},
		
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			//var oItem = oEvent.getSource();
			var newMatchRow = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("MATCH_ROW_STR");
			
			// Update the binding
			var sObjectPathRelated = "/matchResultsDetailsRelatedParameters(I_MATCH_ROW='" + newMatchRow + "')/Results";
			this.byId("detailsTable1").bindItems({path: sObjectPathRelated, template:this.byId("detailsTable1").getBindingInfo("items").template});
			
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
		 *  Accepts a matching group to be promotes into the SCV layer
		 */
		onAccept: function(oEvent) {

			// Get current IDs
			var groupId = this.getView().getBindingContext().getObject().GROUP_ID;
			var entityId = this.getView().getBindingContext().getObject().ENTITY_ID;
			var context = "";
			var that = this;

			// Delay for refresh
			function wait(ms) {
				var start = new Date().getTime();
				var end = start;
				while (end < start + ms) {
					end = new Date().getTime();
				}
			}

			function refresh() {
				wait(1000);
				//that.getView().getModel().loadData(this.getView().getBindingContext().getPath());
				that.getView().getElementBinding().refresh(true);
			}

			if (groupId != null) {
				context = "group " + groupId;
			} else {
				context = "entity " + entityId;
			}

			var dialog = new Dialog({
				title: 'Accept Match Group',
				type: 'Message',
				content: [
					new sap.ui.layout.VerticalLayout({
						content: [
							new Label({
								text: "You are about to accept match group " + context + ". Please select a reason code and provide a comment.",
								labelFor: "submitDialogTextarea"
							}),
							new Label('lblGroupId', {
								text: groupId,
								visible: false
							}),
							new Label('lblEntityId', {
								text: entityId,
								visible: false
							}),
							new ComboBox('acceptReasonComboBox', {
								placeholder: 'Add code (required)',
								items: [
									new sap.ui.core.ListItem("a01", {
										key: "a01",
										text: "Accept: Name Matches Nicknames"
									}),
									new sap.ui.core.ListItem("a02", {
										key: "a02",
										text: "Accept: External Address Details Used to Confirm"
									}),
									new sap.ui.core.ListItem("a03", {
										key: "a03",
										text: "Accept: External Contact Details Used to Confirm"
									}),
									new sap.ui.core.ListItem("a04", {
										key: "a04",
										text: "Accept: Name Pattern Correct"
									})
								]
							}),
							new TextArea('submitDialogTextarea', {
								liveChange: function(oEvent) {
									var sText = oEvent.getParameter('value');
									var parent = oEvent.getSource().getParent();

									//parent.getBeginButton().setEnabled(sText.length > 0);
									sap.ui.getCore().byId("beginButton").setEnabled(sText.length > 0);
								},
								width: '100%',
								placeholder: 'Add comment (required)'
							})

						]
					})

				],
				beginButton: new Button("beginButton", {
					text: 'Submit',
					enabled: false,
					press: function() {

						var code = sap.ui.getCore().byId('acceptReasonComboBox').getSelectedKey();
						var comment = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						var payload = {};
						payload.ENTITY_ID = sap.ui.getCore().byId('lblEntityId').getText();
						payload.STRATEGY = 'Promote';
						payload.ACTION = 'Accept';
						payload.CODE = code;
						payload.COMMENT = comment;
						//var data = JSON.stringify(payload);

						$.ajax({
							type: "GET",
							url: "/scv/match/srv/xs/review/updateMatchAssessments.xsjs",
							contentType: "application/json",
							data: payload,
							dataType: "json",
							crossDomain: true,

							success: function(data) {
								dialog.close();
								// Refresh model
								refresh();
								MessageToast.show('Data saved...');
							},
							error: function(data) {
								var message = JSON.stringify(data);
								alert(message);
							}
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

		/**
		 *  Rejects a matching group to be promoted into the SCV layer
		 */
		onReject: function(oEvent) {

			var groupId = this.getView().getBindingContext().getObject().GROUP_ID;
			var entityId = this.getView().getBindingContext().getObject().ENTITY_ID;
			var context = "";
			var that = this;

			if (groupId != null) {
				context = "group " + groupId;
			} else {
				context = "entity " + entityId;
			}

			function wait(ms) {
				var start = new Date().getTime();
				var end = start;
				while (end < start + ms) {
					end = new Date().getTime();
				}
			}

			function refresh() {
				wait(1000);
				//that.getView().getModel().loadData(this.getView().getBindingContext().getPath());
				that.getView().getElementBinding().refresh(true);
			}

			var dialog = new Dialog({
				title: 'Reject Entity',
				type: 'Message',
				content: [
					new sap.ui.layout.VerticalLayout({
						content: [
							new Label({
								text: "You are about to reject match group " + context + ". Please select a reason code and provide a comment.",
								labelFor: "submitDialogTextarea"
							}),
							new Label('lblGroupId', {
								text: groupId,
								visible: false
							}),
							new Label('lblEntityId', {
								text: entityId,
								visible: false
							}),
							new ComboBox('rejectReasonComboBox', {
								placeholder: 'Add code (required)',
								items: [
									new sap.ui.core.ListItem("r01", {
										key: "r01",
										text: "Reject: Same Address - Different Person"
									}),
									new sap.ui.core.ListItem("r02", {
										key: "r02",
										text: "Reject: Same Address - Related Person"
									}),
									new sap.ui.core.ListItem("r03", {
										key: "r03",
										text: "Reject: Incorrect Address History"
									}),
									new sap.ui.core.ListItem("r04", {
										key: "r04",
										text: "Reject: Incorrect Contact History"
									}),
									new sap.ui.core.ListItem("r05", {
										key: "r05",
										text: "Reject: Known Data Quality Issues"
									}),
									new sap.ui.core.ListItem("r06", {
										key: "r06",
										text: "Reject: Name Pattern Incorrectly Matched"
									})
								]
							}),
							new TextArea('submitDialogTextarea', {
								liveChange: function(oEvent) {
									var sText = oEvent.getParameter('value');
									var parent = oEvent.getSource().getParent();

									//parent.getBeginButton().setEnabled(sText.length > 0);
									sap.ui.getCore().byId("beginButton").setEnabled(sText.length > 0);
								},
								width: '100%',
								placeholder: 'Add comment (required)'
							})

						]
					})

				],
				beginButton: new Button("beginButton", {
					text: 'Submit',
					enabled: false,
					press: function() {

						var code = sap.ui.getCore().byId('rejectReasonComboBox').getSelectedKey();
						var comment = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						var payload = {};
						payload.ENTITY_ID = sap.ui.getCore().byId('lblEntityId').getText();
						payload.STRATEGY = 'Promote';
						payload.ACTION = 'Reject';
						payload.CODE = code;
						payload.COMMENT = comment;
						//var data = JSON.stringify(payload);

						$.ajax({
							type: "GET",
							url: "/scv/match/srv/xs/review/updateMatchAssessments.xsjs",
							contentType: "application/json",
							data: payload,
							dataType: "json",
							crossDomain: true,

							success: function(data) {
								dialog.close();
								// Refresh model
								refresh();
								MessageToast.show('Data saved...');
							},
							error: function(data) {
								var message = JSON.stringify(data);
								alert(message);
							}
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

		}

	});

});