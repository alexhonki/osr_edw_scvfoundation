sap.ui.define([
	"osr/scv/match/review/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("osr.scv.match.review.controller.NotFound", {

		/**
		 * Navigates to the worklist when the link is pressed
		 * @public
		 */
		onLinkPressed: function() {
			this.getRouter().navTo("worklist");
		}

	});

});