sap.ui.define([
	"osr/scv/match/review/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"osr/scv/match/review/model/formatter",
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

	return BaseController.extend("osr.scv.match.review.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {

			/*var oIconTabBar = this.getView().byId("subIconTabBar");
			oIconTabBar.addItem(new IconTabFilter({
				key: 'all',
				text: 'All'
			}));
			oIconTabBar.addItem(new IconTabSeparator({}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'a',
				text: 'A'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'b',
				text: 'B'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'c',
				text: 'C'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'd',
				text: 'D'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'e',
				text: 'E'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'f',
				text: 'F'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'g',
				text: 'G'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'h',
				text: 'H'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'i',
				text: 'I'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'j',
				text: 'J'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'k',
				text: 'K'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'l',
				text: 'L'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'm',
				text: 'M'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'n',
				text: 'N'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'o',
				text: 'O'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'p',
				text: 'P'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'q',
				text: 'Q'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'r',
				text: 'R'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 's',
				text: 'S'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 't',
				text: 'T'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'u',
				text: 'U'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'v',
				text: 'V'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'w',
				text: 'W'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'x',
				text: 'X'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'y',
				text: 'Y'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'z',
				text: 'Z'
			}));
			oIconTabBar.addItem(new IconTabFilter({
				key: 'other',
				text: 'Other'
			}));*/

			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			this._oTable = oTable;
			// keeps the search state
			this._oTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0,
				uniqueEntitiesCount: 0,
				highConfidenceCount: 0,
				mediumConfidenceCount: 0,
				lowConfidenceCount: 0,
				uniqueMatchEntitiesCount: 0,
				identicalMatchEntitiesCount: 0,
				recommendedMatchEntitiesCount: 0,
				similarMatchEntitiesCount: 0,
				uniqueMatchEntitiesCountStr: "",
				identicalMatchEntitiesCountStr: "",
				recommendedMatchEntitiesCountStr: "",
				similarMatchEntitiesCountStr: "",
				identicalMatchEntitiesCountPercent: 0,
				recommendedMatchEntitiesCountPercent: 0,
				similarMatchEntitiesCountPercent: 0,
				inStock: 0,
				shortage: 0,
				outOfStock: 0,
				countAll: 0,
				countAllStr: "",
				globalFilter: "rmsDuplicates",
				worklistLetterFilter: "",
				worklistCategoryFilter: ""

			});
			this.setModel(oViewModel, "worklistView");

			// Prepare filters
			var uniqueMatchEntitiesFilter = new sap.ui.model.Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "0");
			var identicalMatchEntitiesFilters = new sap.ui.model.Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "1");
			var nearIdenticalMatchEntitiesFilters = new sap.ui.model.Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "2");
			var similarMatchEntitiesFilters = new sap.ui.model.Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "3");
			/*	var aSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "A");
				var bSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "B");
				var cSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "C");
				var dSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "D");
				var eSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "E");
				var fSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "F");
				var gSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "G");
				var hSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "H");
				var iSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "I");
				var jSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "J");
				var kSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "K");
				var lSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "L");
				var mSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "M");
				var nSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "N");
				var oSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "O");
				var pSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "P");
				var qSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "Q");
				var rSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "R");
				var sSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "S");
				var tSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "T");
				var uSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "U");
				var vSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "V");
				var wSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "W");
				var xSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "X");
				var ySurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "Y");
				var zSurnameFilter = new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.StartsWith, "Z");
				var otherSurnameFilter = new sap.ui.model.Filter([
					new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.BT, "", "@"),
					new sap.ui.model.Filter("LAST_NAME", sap.ui.model.FilterOperator.BT, "[", "~")
				], false);
				*/

			// Create an object of filters
			this._mFilters = {
				"uniqueMatchEntities": uniqueMatchEntitiesFilter,
				"identicalMatchEntities": identicalMatchEntitiesFilters,
				"recommendedMatchEntities": nearIdenticalMatchEntitiesFilters,
				"similarMatchEntities": similarMatchEntitiesFilters,
				"all": []
			};

			/*this._mFiltersNames = {
				"a": aSurnameFilter,
				"b": bSurnameFilter,
				"c": cSurnameFilter,
				"d": dSurnameFilter,
				"e": eSurnameFilter,
				"f": fSurnameFilter,
				"g": gSurnameFilter,
				"h": hSurnameFilter,
				"i": iSurnameFilter,
				"j": jSurnameFilter,
				"k": kSurnameFilter,
				"l": lSurnameFilter,
				"m": mSurnameFilter,
				"n": nSurnameFilter,
				"o": oSurnameFilter,
				"p": pSurnameFilter,
				"q": qSurnameFilter,
				"r": rSurnameFilter,
				"s": sSurnameFilter,
				"t": tSurnameFilter,
				"u": uSurnameFilter,
				"v": vSurnameFilter,
				"w": wSurnameFilter,
				"x": xSurnameFilter,
				"y": ySurnameFilter,
				"z": zSurnameFilter,
				"other": otherSurnameFilter,
				"all": []
			};*/

			// Global filters
			var rmsDuplicatesFilter = new sap.ui.model.Filter("RMS_DUPLICATES", sap.ui.model.FilterOperator.EQ, 1);
			var rmsAllDuplicatesFilter = new sap.ui.model.Filter("RMS_DUPLICATES", sap.ui.model.FilterOperator.NE, -1);

			this._mGlobalFilters = {
				"rmsDuplicates": rmsDuplicatesFilter,
				"allDuplicates": rmsAllDuplicatesFilter
			};

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});

		},

		onBeforeRendering: function() {
			this.getView().byId("subIconTabBar").setSelectedKey("all");
			this.onRefreshCounts();
			var that = this;
			this.fOnDataReceived = function(oData) {
				that._updateTableTitle(oData.getSource().iLength, that);
				that.onRefreshCounts();
			};
			var oBinding = this._oTable.getBinding("rows");
			oBinding.attachDataReceived(this.fOnDataReceived);
		},

		onExit: function() {
			var oBinding = this._oTable.getBinding("rows");

			oBinding.detachDataReceived(this.fOnDataReceived);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {

				// Get current select key from category filter
				var sKey = this.byId("iconTabBar").getSelectedKey();
				var prefix = "";

				// Get current select key from category filter
				var sKey1 = this.byId("subIconTabBar").getSelectedKey();
				var prefix1 = "";

				if (sKey === "uniqueMatchEntities") {
					prefix = 'Unique ';
				} else if (sKey === "identicalMatchEntities") {
					prefix = 'Identical ';
				} else if (sKey === "recommendedMatchEntities") {
					prefix = 'Recommended ';
				} else if (sKey === "similarMatchEntities") {
					prefix = 'Similar ';
				}

				if (sKey1.length === 1) {
					prefix1 = " - " + sKey1.toUpperCase();
				}

				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [prefix, prefix1, formatter.localePresentation(parseInt([
					iTotalItems
				]))]);

				// Get the count for all the products and set the value to 'countAll' property
				this.getModel().read("/matchResultsReview/$count", {
					success: function(oData) {
						oViewModel.setProperty("/countAll", oData);
						oViewModel.setProperty("/countAllStr", formatter.localePresentation(parseInt(oData)));
					},
					filters: [this.getCategoryFilters('all')]
						//filters: []
				});

				// read the count for the high confidence matches
				this.getModel().read("/matchResultsReview/$count", {
					success: function(oData) {
						oViewModel.setProperty("/uniqueMatchEntitiesCount", oData);
						oViewModel.setProperty("/uniqueMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
						oViewModel.setProperty("/uniqueMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(1) +
							'%');
					},
					filters: [this.getCategoryFilters('uniqueMatchEntities')]
						//filters: [this._mFilters.uniqueMatchEntities]
						//filters: [currentFilters]

				});

				// read the count for the high confidence matches
				this.getModel().read("/matchResultsReview/$count", {
					success: function(oData) {
						oViewModel.setProperty("/identicalMatchEntitiesCount", oData);
						oViewModel.setProperty("/identicalMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
						oViewModel.setProperty("/identicalMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(1) +
							'%');
					},
					filters: [this.getCategoryFilters('identicalMatchEntities')]
						//filters: [this._mFilters.identicalMatchEntities]
				});

				// read the count for the medium confidence matches
				this.getModel().read("/matchResultsReview/$count", {
					success: function(oData) {
						oViewModel.setProperty("/recommendedMatchEntitiesCount", oData);
						oViewModel.setProperty("/recommendedMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
						oViewModel.setProperty("/recommendedMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(
							1) + '%');
					},
					filters: [this.getCategoryFilters('recommendedMatchEntities')]
						//filters: [this._mFilters.recommendedMatchEntities]
						//this._mFiltersNames[sKey]

				});

				// read the count for the low confidence matches
				this.getModel().read("/matchResultsReview/$count", {
					success: function(oData) {
						oViewModel.setProperty("/similarMatchEntitiesCount", oData);
						oViewModel.setProperty("/similarMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
						oViewModel.setProperty("/similarMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(1) +
							'%');
					},
					filters: [this.getCategoryFilters('similarMatchEntities')]
						//filters: [this._mFilters.similarMatchEntities]
						//this._mFiltersNames[sKey]
				});

			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page.
		 * @public
		 */
		onNavBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			}
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					// Convert search string to lower case (on backend, convert column content to lowercase as well)
					oTableSearchState = [new Filter("tolower(NAME)", FilterOperator.Contains, "'" + sQuery.toLowerCase() + "'")];
				}
				this._applySearch(oTableSearchState);
			}
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			this._oTable.getBinding("rows").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ENTITY_ID") + '|' + oItem.getBindingContext().getProperty("MATCH_ROW")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {array} oTableSearchState an array of filters for the search
		 * @private
		 */
		_applySearch: function(oTableSearchState) {
			var oViewModel = this.getModel("worklistView");

			var catFilter = this.getView().byId("iconTabBar").getSelectedKey();
			var letterFilter = this.getView().byId("subIconTabBar").getSelectedKey();
			var filter;
			var oFilter = this.getLetterFilter(letterFilter);

			if (catFilter === "all" && letterFilter === "all") {
				filter = oTableSearchState;
			} else if (catFilter === "all" && letterFilter !== "all") {
				filter = new sap.ui.model.Filter([
					oFilter,
					//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()],
					oTableSearchState[0]
				], true);
			} else if (catFilter !== "all" && letterFilter === "all") {
				filter = new sap.ui.model.Filter([
					this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()],
					oTableSearchState[0]
				], true);
			} else {
				if (oTableSearchState.length !== 0) {
					filter = new sap.ui.model.Filter([
						oFilter,
						//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()],
						this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()],
						oTableSearchState[0]
					], true);
				} else {
					filter = new sap.ui.model.Filter([
						oFilter,
						//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()],
						this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()]
					], true);
				}
			}

			this._oTable.getBinding("rows").filter(filter, "Application");
			//this._oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}

			// Reset icon tab filters
			//this.getView().byId("iconTabBar").setSelectedKey('all');
			//this.getView().byId("subIconTabBar").setSelectedKey('all');

		},

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

		handleToggleDuplicateViewButtonPress: function(oEvent) {

			var oViewModel = this.getModel("worklistView");
			var sKey = oEvent.getSource().getKey();

			if (sKey === 'rmsDuplicates') {
				// Show RMS duplicates only
				oViewModel.setProperty("/globalFilter", "rmsDuplicates");
			} else {
				oViewModel.setProperty("/globalFilter", "allDuplicates");
			}

			// Get selected category and trigger click event
			//this.getView().byId(this.getView().byId("iconTabBar").getSelectedKey()).click();

			var oIconTabBar = this.getView().byId("iconTabBar");
			var oEvent = new sap.ui.base.Event("customSelect", oIconTabBar, {
				"selectedKey": oIconTabBar.getSelectedKey(),
				"item": this.getView().byId(this.getView().byId("iconTabBar").getSelectedKey())
			});
			this.onQuickFilter(oEvent);

			// Trigger refresh
			//var oBinding = this._oTable.getBinding("items");
			//oBinding.filter(new sap.ui.model.Filter([this._mGlobalFilters.rmsDuplicates], true), sap.ui.model.FilterType.Application);
		},

		/**
		 * Gets the filters set by the current UI state for a given category
		 * 
		 * 
		 */
		getCategoryFilters: function(sCategory) {

			var oViewModel = this.getModel("worklistView"),
				sKey = this.getView().byId("subIconTabBar").getSelectedKey();

			var oFilter = this.getLetterFilter(sKey);

			if (sCategory === 'all') {
				if (this.getView().byId("subIconTabBar").getSelectedKey() !== 'all') {
					return new sap.ui.model.Filter([
						this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
						oFilter
						//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()]
					], true);
				} else {
					// Return empty array
					//return this._mFilters.all;
					return this._mGlobalFilters[oViewModel.getProperty("/globalFilter")];
				}
			} else {

				if (this.getView().byId("subIconTabBar").getSelectedKey() !== 'all') {
					return new sap.ui.model.Filter([
						this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
						oFilter,
						//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()],
						this._mFilters[sCategory]
					], true);
				} else {
					return new sap.ui.model.Filter([
						this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
						this._mFilters[sCategory]
					], true);
				}
			}
		},

		getCurrentFilters: function() {
			var catFilter = this.getView().byId("iconTabBar").getSelectedKey();
			var letterFilter = this.getView().byId("subIconTabBar").getSelectedKey();
			var oFilter = this.getLetterFilter(letterFilter);
			var sQuery = this.getView().byId("searchField").getValue();
			var oTableSearchState = [];

			if (sQuery && sQuery.length > 0) {
				// Convert search string to lower case (on backend, convert column content to lowercase as well)
				oTableSearchState = [new Filter("tolower(NAME)", FilterOperator.Contains, "'" + sQuery.toLowerCase() + "'")];
			}

			var filter = [];
			if (catFilter !== "all") {
				filter.push(this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()]);
			}
			if (letterFilter !== "all") {
				filter.push(oFilter);
			}
			if (sQuery && sQuery.length > 0) {
				filter.push(oTableSearchState[0]);
			}

			return filter;
		},

		/**
		 * Event handler when a filter tab gets pressed.
		 * 
		 * Note: This method handles event from both fiter bars!
		 * 
		 * @param {sap.ui.base.Event} oEvent the filter tab event
		 * @public
		 */
		onQuickFilter: function(oEvent) {

			var oViewModel = this.getModel("worklistView");
			var oSearch = this.getView().byId("searchField");
			var icon = oSearch.$().find('.sapUiSearchFieldIco');
			if (icon.prop('title')) {
				icon.click();
			}

			var oBinding = this._oTable.getBinding("rows"),
				sKey = oEvent.getParameter("selectedKey"),
				oFilter = this.getLetterFilter(this.getView().byId("subIconTabBar").getSelectedKey());

			if (oEvent.oSource.sId.indexOf("subIconTabBar") > 0) {
				// Letter filter tab
				oViewModel.setProperty("/worklistLetterFilter", oEvent.getParameter("selectedItem").getText());
				if (sKey === 'all') {

					if (this.getView().byId("iconTabBar").getSelectedKey() === 'all') {
						oBinding.filter(new sap.ui.model.Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")]], true), sap.ui.model.FilterType
							.Application);
					} else {
						//oBinding.filter(this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()], sap.ui.model.FilterType.Application);
						oBinding.filter(new sap.ui.model.Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")], this._mFilters[this.getView()
							.byId("iconTabBar").getSelectedKey()]], true), sap.ui.model.FilterType.Application);
					}

				} else {

					// Filter for a specific letter is set, now check if category filter
					if (this.getView().byId("iconTabBar").getSelectedKey() === 'all') {
						//oBinding.filter(this._mFiltersNames[sKey], sap.ui.model.FilterType.Application);
						oBinding.filter(new sap.ui.model.Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")], oFilter],
							true), sap.ui.model.FilterType.Application);
					} else {
						// Set new filter for letter and combine with current filter selection for group category
						oBinding.filter(
							new sap.ui.model.Filter([
								this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
								this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()],
								oFilter
								//this._mFiltersNames[sKey]
							], true), sap.ui.model.FilterType.Application);
					}

				}

			} else {
				// Category filter tab
				if (sKey === 'all') {
					oViewModel.setProperty("/worklistCategoryFilter", "");
					// All categories, set filter for letter selection only
					//oBinding.filter(this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()], sap.ui.model.FilterType.Application
					if (this.getView().byId("subIconTabBar").getSelectedKey() === 'all') {
						oBinding.filter(new sap.ui.model.Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")]], true), sap.ui.model.FilterType
							.Application);
					} else {
						oBinding.filter(new sap.ui.model.Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
							oFilter
							//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()]
						], true), sap.ui.model.FilterType.Application);
					}

				} else {
					oViewModel.setProperty("/worklistCategoryFilter", oEvent.getParameter("selectedItem").getText());
					// Specific category, check filter for letter selection
					if (this.getView().byId("subIconTabBar").getSelectedKey() === 'all') {
						// Letter selection is all, only one filter for category required
						//oBinding.filter(this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()], sap.ui.model.FilterType.Application);
						oBinding.filter(new sap.ui.model.Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")], this._mFilters[this.getView()
							.byId("iconTabBar").getSelectedKey()]], true), sap.ui.model.FilterType.Application);
					} else {

						// Set new filter for group category and combine with current filter selection for letter
						oBinding.filter(
							new sap.ui.model.Filter([
								this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
								oFilter,
								//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()],
								this._mFilters[sKey]
							], true), sap.ui.model.FilterType.Application);
					}
				}
			}
		},

		/**
		 * Error and success handler for the unlist action.
		 * @param {string} sProductId the product ID for which this handler is called
		 * @param {boolean} bSuccess true in case of a success handler, else false (for error handler)
		 * @param {number} iRequestNumber the counter which specifies the position of this request
		 * @param {number} iTotalRequests the number of all requests sent
		 * @private
		 */
		_handleUnlistActionResult: function(sProductId, bSuccess, iRequestNumber, iTotalRequests) {
			// we could create a counter for successful and one for failed requests
			// however, we just assume that every single request was successful and display a success message once
			if (iRequestNumber === iTotalRequests) {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockRemovedSuccessMsg", [iTotalRequests]));
			}
		},

		/**
		 * Error and success handler for the reorder action.
		 * @param {string} sProductId the product ID for which this handler is called
		 * @param {boolean} bSuccess true in case of a success handler, else false (for error handler)
		 * @param {number} iRequestNumber the counter which specifies the position of this request
		 * @param {number} iTotalRequests the number of all requests sent
		 * @private
		 */
		_handleReorderActionResult: function(sProductId, bSuccess, iRequestNumber, iTotalRequests) {
			// we could create a counter for successful and one for failed requests
			// however, we just assume that every single request was successful and display a success message once
			if (iRequestNumber === iTotalRequests) {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockUpdatedSuccessMsg", [iTotalRequests]));
			}
		},

		/**
		 * Event handler for the unlist button. Will delete the
		 * product from the (local) model.
		 * @public
		 */
		onUnlistObjects: function() {
			var aSelectedProducts, i, sPath, oProduct, oProductId;

			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					oProduct = aSelectedProducts[i];
					oProductId = oProduct.getBindingContext().getProperty("GROUP_ID");
					sPath = oProduct.getBindingContextPath();
					this.getModel().remove(sPath, {
						success: this._handleUnlistActionResult.bind(this, oProductId, true, i + 1, aSelectedProducts.length),
						error: this._handleUnlistActionResult.bind(this, oProductId, false, i + 1, aSelectedProducts.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		},

		/**
		 * Event handler for the reorder button. Will reorder the
		 * product by updating the (local) model
		 * @public
		 */
		onUpdateStockObjects: function() {
			var aSelectedProducts, i, sPath, oProductObject;

			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					sPath = aSelectedProducts[i].getBindingContextPath();
					oProductObject = aSelectedProducts[i].getBindingContext().getObject();
					oProductObject.UnitsInStock += 10;
					this.getModel().update(sPath, oProductObject, {
						success: this._handleReorderActionResult.bind(this, oProductObject.ProductID, true, i + 1, aSelectedProducts.length),
						error: this._handleReorderActionResult.bind(this, oProductObject.ProductID, false, i + 1, aSelectedProducts.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		},

		/**
		 * Event handler for the promote to SCV.
		 * @public
		 */
		onPromoteToSCV: function() {
			var aSelectedEntities;

			var that = this;

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
				that.byId("table").getModel().refresh(true);
			}

			aSelectedEntities = this.byId("table").getSelectedItems();
			var dialog;

			if (aSelectedEntities.length > 0) {

				//Some entities were selected, only transfer these
				dialog = new Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new Text({
						text: 'Promote selected entities to SCV layer?'
					}),
					beginButton: new Button({
						text: 'Promote',
						press: function() {

							var payload = {};
							var entities = [];
							var i, oEntity, oEntityId;
							var obj;

							for (i = 0; i < aSelectedEntities.length; i++) {
								obj = {};
								oEntity = aSelectedEntities[i];
								oEntityId = oEntity.getBindingContext().getProperty("ENTITY_ID");
								obj.ENTITY_ID = oEntityId;
								entities.push(obj);
								//sPath = oProduct.getBindingContextPath();
								//this.getModel().remove(sPath, {
								//	success : this._handleUnlistActionResult.bind(this, oProductId, true, i + 1, aSelectedEntities.length),
								//	error : this._handleUnlistActionResult.bind(this, oProductId, false, i + 1, aSelectedEntities.length)
								//});
							}

							payload.entities = entities;
							var data = JSON.stringify(payload);

							$.ajax({
								type: "POST",
								url: "/scv//match/srv/xs/supervisor/moveEntitiesToShadowTable.xsjs",
								contentType: "application/json",
								data: data,
								dataType: "json",
								crossDomain: true,

								success: function(data) {
									// Refresh model
									//sap.ui.getCore().byId("table").getModel().refresh(true);
									refresh();
									MessageToast.show('Selected Entities promoted!');
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

			} else {

				// Transfer all entities flagged for promotion to shadow table
				var dialog = new Dialog({
					title: 'No Entities Selected',
					type: 'Message',
					content: new Text({
						text: 'No entities selected for promotion to SCV.'
					}),
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();

				/*dialog = new Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new Text({
						text: 'Promote all entities to SCV layer? Note: This will move all entities with status \'Promote\' to the SCV foundation layer.'
					}),
					beginButton: new Button({
						text: 'Promote',
						press: function() {

							var payload = {};
							payload.entities = aSelectedEntities;
							var data = JSON.stringify(payload);

							$.ajax({
								type: "POST",
								url: "/webapp/xs/scv/moveEntitiesToShadowTable.xsjs",
								contentType: "application/json",
								data: data,
								dataType: "json",
								crossDomain: true,

								success: function(data) {
									// Refresh model
									//sap.ui.getCore().byId("table").getModel().refresh(true);
									refresh();
									MessageToast.show('All Entities promoted!');
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

				dialog.open();*/

			}
		},

		handleViewSettingsDialogButtonPressed: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("osr.scv.match.review.dialogs.TableViewSettingsDialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleConfirm: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("table");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("rows");

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

			// update filter bar
			//oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			//oView.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		_updateTableTitle: function(oCount, that) {
			var oViewModel = that.getView().getModel("worklistView"),
				oProperty = oViewModel.getData();
			var sTitle = "";
			if (oProperty.worklistCategoryFilter) {
				sTitle = oProperty.worklistCategoryFilter + " ";
			}

			if (oProperty.worklistLetterFilter) {
				sTitle = sTitle + "Entities - " + oProperty.worklistLetterFilter + " (" + formatter.localePresentation(parseInt(oCount)) + ")";
			} else {
				sTitle = sTitle + "Entities (" + formatter.localePresentation(parseInt(oCount)) + ")";
			}

			oViewModel.setProperty("/worklistTableTitle", sTitle);
		},

		onRefreshCounts: function() {

			var oViewModel = this.getModel("worklistView"),
				oModel = this.getOwnerComponent().getModel();
			// Get the count for all the products and set the value to 'countAll' property
			oModel.read("/matchResultsReview/$count", {
				success: function(oData) {
					oViewModel.setProperty("/countAll", oData);
					oViewModel.setProperty("/countAllStr", formatter.localePresentation(parseInt(oData)));
				},
				filters: [this.getCategoryFilters('all')]
					//filters: []
			});

			// read the count for the high confidence matches
			oModel.read("/matchResultsReview/$count", {
				success: function(oData) {
					oViewModel.setProperty("/uniqueMatchEntitiesCount", oData);
					oViewModel.setProperty("/uniqueMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
					oViewModel.setProperty("/uniqueMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(1) +
						'%');
				},
				filters: [this.getCategoryFilters('uniqueMatchEntities')]
					//filters: [this._mFilters.uniqueMatchEntities]
					//filters: [currentFilters]

			});

			// read the count for the high confidence matches
			oModel.read("/matchResultsReview/$count", {
				success: function(oData) {
					oViewModel.setProperty("/identicalMatchEntitiesCount", oData);
					oViewModel.setProperty("/identicalMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
					oViewModel.setProperty("/identicalMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(1) +
						'%');
				},
				filters: [this.getCategoryFilters('identicalMatchEntities')]
					//filters: [this._mFilters.identicalMatchEntities]
			});

			// read the count for the medium confidence matches
			oModel.read("/matchResultsReview/$count", {
				success: function(oData) {
					oViewModel.setProperty("/recommendedMatchEntitiesCount", oData);
					oViewModel.setProperty("/recommendedMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
					oViewModel.setProperty("/recommendedMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(
						1) + '%');
				},
				filters: [this.getCategoryFilters('recommendedMatchEntities')]
					//filters: [this._mFilters.recommendedMatchEntities]
					//this._mFiltersNames[sKey]

			});

			// read the count for the low confidence matches
			oModel.read("/matchResultsReview/$count", {
				success: function(oData) {
					oViewModel.setProperty("/similarMatchEntitiesCount", oData);
					oViewModel.setProperty("/similarMatchEntitiesCountStr", formatter.localePresentation(parseInt(oData)));
					oViewModel.setProperty("/similarMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(1) +
						'%');
				},
				filters: [this.getCategoryFilters('similarMatchEntities')]
					//filters: [this._mFilters.similarMatchEntities]
					//this._mFiltersNames[sKey]
			});
		},

		getLetterFilter: function(sKey) {
			var oFilter;

			if (sKey === "Other") {
				oFilter = new Filter([
					new sap.ui.model.Filter("LAST_NAME", FilterOperator.BT, "", "@"),
					new sap.ui.model.Filter("LAST_NAME", FilterOperator.BT, "[", "~")
				], false);
			} else if (sKey === "All") {
				oFilter = new Filter("LAST_NAME", FilterOperator.StartsWith, []);
			} else {
				oFilter = new Filter("LAST_NAME", FilterOperator.StartsWith, sKey);
			}

			return oFilter;
		}

	});
});