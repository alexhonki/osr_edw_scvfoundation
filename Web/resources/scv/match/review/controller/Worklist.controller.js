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

			let oViewModel,
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
				globalFilter: "reviewGroups",
				worklistLetterFilter: "",
				worklistCategoryFilter: ""

			});
			this.setModel(oViewModel, "worklistView");

			// Prepare filters
			let uniqueMatchEntitiesFilter = new Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "0");
			let identicalMatchEntitiesFilters = new Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "1");
			let nearIdenticalMatchEntitiesFilters = new Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "2");
			let similarMatchEntitiesFilters = new Filter("GROUP_CATEGORY", sap.ui.model.FilterOperator.EQ, "3");

			// Create an object of filters
			this._mFilters = {
				"uniqueMatchEntities": uniqueMatchEntitiesFilter,
				"identicalMatchEntities": identicalMatchEntitiesFilters,
				"recommendedMatchEntities": nearIdenticalMatchEntitiesFilters,
				"similarMatchEntities": similarMatchEntitiesFilters,
				"all": []
			};

			// Global filters
			let rmsDuplicatesFilter = new Filter("RMS_DUPLICATES", sap.ui.model.FilterOperator.EQ, 1);
			let rmsAllDuplicatesFilter = new Filter("RMS_DUPLICATES", sap.ui.model.FilterOperator.NE, -1);
			let reviewGroupsFilter = new Filter("STRATEGY_RESOLVED", sap.ui.model.FilterOperator.EQ, 'Review');
			let promoteGroupsFilter = new Filter("STRATEGY_RESOLVED", sap.ui.model.FilterOperator.EQ, 'Promote');

			this._mGlobalFilters = {
				"rmsDuplicates": rmsDuplicatesFilter,
				"allDuplicates": rmsAllDuplicatesFilter,
				'reviewGroups': reviewGroupsFilter,
				'promoteGroups': promoteGroupsFilter
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
			let that = this;
			this.fOnDataReceived = function(oData) {
				that._updateTableTitle(oData.getSource().iLength, that);
				that.onRefreshCounts();
			};
			let oBinding = this._oTable.getBinding("rows");
			oBinding.attachDataReceived(this.fOnDataReceived);
		},

		onExit: function() {
			let oBinding = this._oTable.getBinding("rows");

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
			let sTitle,
				oTable = oEvent.getSource(),
				oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {

				// Get current select key from category filter
				let sKey = this.byId("iconTabBar").getSelectedKey();
				let prefix = "";

				// Get current select key from category filter
				let sKey1 = this.byId("subIconTabBar").getSelectedKey();
				let prefix1 = "";

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
			let oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			}
		},

		/**
		 * Responsible for the universal search field.
		 * @return {[type]}        [description]
		 */
		onSearch: function(oEvent) {
			let oViewModel = this.getView().getModel("worklistView");
			if (oEvent.getParameters().refreshButtonPressed) {

				this.getView().byId("table").setBusy(true);
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				let oTableSearchState = [];
				let sQuery = oEvent.getParameter("query");
				//do trim for white spaces.
				sQuery = sQuery.trim();
				sQuery = sQuery.replace(/'/g, "''");
				if (sQuery && sQuery.length > 0) {
					//only enable busy if its a valid search query.
					this.getView().byId("table").setBusy(true);
					// Convert search string to lower case (on backend, convert column content to lowercase as well)

					oTableSearchState = [new Filter("tolower(NAME)", FilterOperator.Contains, "'" + sQuery.toLowerCase() + "'"),
						this._mGlobalFilters[oViewModel.getProperty("/globalFilter")]
					];
					this._applySearch(oTableSearchState);
				}

			}
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			this._oTable.getBinding("rows").refresh();
			this.getView().byId("table").setBusy(false);
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
			let oViewModel = this.getModel("worklistView");

			let catFilter = this.getView().byId("iconTabBar").getSelectedKey();
			let letterFilter = this.getView().byId("subIconTabBar").getSelectedKey();
			let filter;
			let oFilter = this.getLetterFilter(letterFilter);

			if (catFilter === "all" && letterFilter === "all") {
				filter = oTableSearchState;
			} else if (catFilter === "all" && letterFilter !== "all") {
				filter = new Filter([
					oFilter
				], true);

			} else if (catFilter !== "all" && letterFilter === "all") {
				filter = new Filter([
					this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()]
				], true);
			} else {
				if (oTableSearchState.length !== 0) {
					filter = new Filter([
						oFilter,
						this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()]
					], true);
				} else {
					filter = new Filter([
						oFilter,
						this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()]
					], true);
				}
			}

			//add more filters from oTableSearchState if there's any.
			for (let i = 0; i < oTableSearchState.length; i++) {
				filter.aFilters.push(oTableSearchState[i]);
			}

			this._oTable.getBinding("rows").filter(filter, "Application");
			//this._oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}

			//set busy state for the table.
			this.getView().byId("table").setBusy(false);
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

		/**
		 * Responsible for the top 4 buttons.
		 * RMS Duplicates, All Duplicates, Entities for Review, Entities for Promotion
		 * @param  {[type]} oEvent [button object that is being triggered]
		 * @return {[type]}        [description]
		 */
		handleToggleDuplicateViewButtonPress: function(oEvent) {

			this._clearSearchField();

			let oViewModel = this.getModel("worklistView");
			let sKey = oEvent.getSource().getKey();

			//depending on the key that is selected, will set global filter
			//accordingly.
			if (sKey === 'rmsDuplicates') {
				// Show RMS duplicates only
				oViewModel.setProperty("/globalFilter", "rmsDuplicates");
			} else if (sKey === 'reviewGroups') {
				oViewModel.setProperty("/globalFilter", "reviewGroups");
			} else if (sKey === 'promoteGroups') {
				oViewModel.setProperty("/globalFilter", "promoteGroups");
			} else {
				oViewModel.setProperty("/globalFilter", "allDuplicates");
			}

			//these belongs to the 4 buttons next to the entities number
			//"Unique", "Identical", "Recommended", "Similar"
			let oIconTabBar = this.getView().byId("iconTabBar");
			let oCustomEvent = new sap.ui.base.Event("customSelect", oIconTabBar, {
				"selectedKey": oIconTabBar.getSelectedKey(),
				"item": this.getView().byId(this.getView().byId("iconTabBar").getSelectedKey()),
				"selectedItem": this.getView().byId(this.getView().byId("iconTabBar").getSelectedKey())
			});
			//apply the filter.
			this.onQuickFilter(oCustomEvent);

		},

		/**
		 * Gets the filters set by the current UI state for a given category
		 */
		getCategoryFilters: function(sCategory) {

			let oViewModel = this.getModel("worklistView"),
				sKey = this.getView().byId("subIconTabBar").getSelectedKey();

			let oFilter = this.getLetterFilter(sKey);

			if (sCategory === 'all') {
				if (this.getView().byId("subIconTabBar").getSelectedKey() !== 'all') {
					return new Filter([
						this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
						oFilter
						//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()]
					], true);
				} else {
					// Return empty array
					return this._mGlobalFilters[oViewModel.getProperty("/globalFilter")];
				}
			} else {

				if (this.getView().byId("subIconTabBar").getSelectedKey() !== 'all') {
					return new Filter([
						this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
						oFilter,
						//this._mFiltersNames[this.getView().byId("subIconTabBar").getSelectedKey()],
						this._mFilters[sCategory]
					], true);
				} else {
					return new Filter([
						this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
						this._mFilters[sCategory]
					], true);
				}
			}
		},

		getCurrentFilters: function() {
			let catFilter = this.getView().byId("iconTabBar").getSelectedKey();
			let letterFilter = this.getView().byId("subIconTabBar").getSelectedKey();
			let oFilter = this.getLetterFilter(letterFilter);
			let sQuery = this.getView().byId("searchField").getValue();
			let oTableSearchState = [];

			if (sQuery && sQuery.length > 0) {
				// Convert search string to lower case (on backend, convert column content to lowercase as well)
				oTableSearchState = [new Filter("tolower(NAME)", FilterOperator.Contains, "'" + sQuery.toLowerCase() + "'")];
			}

			let filter = [];
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

			this._clearSearchField();

			let oViewModel = this.getModel("worklistView");
			let oSearch = this.getView().byId("searchField");
			let icon = oSearch.$().find('.sapUiSearchFieldIco');
			if (icon.prop('title')) {
				icon.click();
			}

			// temporary patch to fix on second subicon. 
			// if (oEvent.getSource().sId.indexOf("iconTabBar") > 0) {
			// 	let sNumber = oEvent.getParameter("selectedItem").getCount().match(/^[^\s]+/);
			// 	oViewModel.setProperty("/countAllStr", formatter.localePresentation(parseInt(sNumber[0])));
			// }

			let oBinding = this._oTable.getBinding("rows"),
				sKey = oEvent.getParameter("selectedKey"),
				oFilter = this.getLetterFilter(this.getView().byId("subIconTabBar").getSelectedKey());

			if (oEvent.oSource.sId.indexOf("subIconTabBar") > 0) {
				// Letter filter tabf
				oViewModel.setProperty("/worklistLetterFilter", oEvent.getParameter("selectedItem").getText());
				if (sKey === 'all') {

					if (this.getView().byId("iconTabBar").getSelectedKey() === 'all') {
						oBinding.filter(new Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")]], true), sap.ui.model.FilterType
							.Application);
					} else {
						//oBinding.filter(this._mFilters[this.getView().byId("iconTabBar").getSelectedKey()], sap.ui.model.FilterType.Application);
						oBinding.filter(new Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")], this._mFilters[this.getView()
							.byId("iconTabBar").getSelectedKey()]], true), sap.ui.model.FilterType.Application);
					}

				} else {

					// Filter for a specific letter is set, now check if category filter
					if (this.getView().byId("iconTabBar").getSelectedKey() === 'all') {
						//oBinding.filter(this._mFiltersNames[sKey], sap.ui.model.FilterType.Application);
						oBinding.filter(new Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")], oFilter],
							true), sap.ui.model.FilterType.Application);
					} else {
						// Set new filter for letter and combine with current filter selection for group category
						oBinding.filter(
							new Filter([
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
						oBinding.filter(new Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")]], true), sap.ui.model.FilterType
							.Application);
					} else {
						oBinding.filter(new Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")],
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
						oBinding.filter(new Filter([this._mGlobalFilters[oViewModel.getProperty("/globalFilter")], this._mFilters[this.getView()
							.byId("iconTabBar").getSelectedKey()]], true), sap.ui.model.FilterType.Application);
					} else {

						// Set new filter for group category and combine with current filter selection for letter
						oBinding.filter(
							new Filter([
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
			let aSelectedProducts, i, sPath, oProduct, oProductId;

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
			let aSelectedProducts, i, sPath, oProductObject;

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
			let aSelectedEntities;

			let that = this;

			function wait(ms) {
				let start = new Date().getTime();
				let end = start;
				while (end < start + ms) {
					end = new Date().getTime();
				}
			}

			function refresh() {
				wait(1000);
				that.byId("table").getModel().refresh(true);
			}

			aSelectedEntities = this.byId("table").getSelectedItems();
			let dialog;

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

							let payload = {};
							let entities = [];
							let i, oEntity, oEntityId;
							let obj;

							for (i = 0; i < aSelectedEntities.length; i++) {
								obj = {};
								oEntity = aSelectedEntities[i];
								oEntityId = oEntity.getBindingContext().getProperty("ENTITY_ID");
								obj.ENTITY_ID = oEntityId;
								entities.push(obj);
							}

							payload.entities = entities;
							let data = JSON.stringify(payload);

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
									let message = JSON.stringify(data);
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
				let dialog = new Dialog({
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

			let oView = this.getView();
			let oTable = oView.byId("table");

			let mParams = oEvent.getParameters();
			let oBinding = oTable.getBinding("rows");

			// apply sorter to binding
			// (grouping comes before sorting)
			let sPath;
			let bDescending;
			let vGroup;
			let aSorters = [];
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
			let aFilters = [];
			jQuery.each(mParams.filterItems, function(i, oItem) {
				let aSplit = oItem.getKey().split("___");
				let sPath = aSplit[0];
				let sOperator = aSplit[1];
				let sValue1 = aSplit[2];
				let sValue2 = aSplit[3];
				let oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);

			// update filter bar
			//oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			//oView.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		_updateTableTitle: function(oCount, that) {
			let oViewModel = that.getView().getModel("worklistView"),
				oProperty = oViewModel.getData();
			let sTitle = "";
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
			let oController = this;
			let oViewModel = this.getModel("worklistView"),
				oModel = this.getOwnerComponent().getModel();
			// Get the count for all the products and set the value to 'countAll' property
			oModel.read("/matchResultsReview/$count", {
				success: function(oData) {
					oViewModel.setProperty("/countAll", oData);
					oViewModel.setProperty("/countAllStr", formatter.localePresentation(parseInt(oData)));
					//oController._updateTableTitle(oData, oController);
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
					oViewModel.setProperty("/identicalMatchEntitiesCountPercent", ((oData / oViewModel.getProperty("/countAll")) * 100).toFixed(
							1) +
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
			});
		},

		getLetterFilter: function(sKey) {
			let oFilter;

			if (sKey === "Other") {
				oFilter = new Filter([
					new Filter("LAST_NAME", FilterOperator.BT, "", "@"),
					new Filter("LAST_NAME", FilterOperator.BT, "[", "~")
				], false);
			} else if (sKey === "All") {
				oFilter = new Filter("LAST_NAME", FilterOperator.StartsWith, []);
			} else {
				oFilter = new Filter("LAST_NAME", FilterOperator.StartsWith, sKey);
			}

			return oFilter;
		},

		/**
		 * To clear the text set on the search field,
		 * to make sure the ui make sense.
		 * @return {[type]} [NA]
		 */
		_clearSearchField: function() {
			this.getView().byId("searchField").setValue("");
		}

	});
});