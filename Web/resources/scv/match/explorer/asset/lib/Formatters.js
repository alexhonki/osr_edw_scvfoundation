sap.ui.define(['jquery.sap.global'], function() {
	"use strict";

	let oFormatter = {

		/**
		 * use moment to return the date in the string e.g 12/12/2017
		 * @param  {[type]} oTime [date object]
		 * @return {[type]}       [string date]
		 */
		formatDateObjectToString: function(oTime) {
			return moment(oTime).format("DD/MM/YYYY");
		},

		/**
		 * Format postal information depending on whether there is text or not
		 * @param  {[type]} sText [String containing the data]
		 * @return {[type]}       [string date]
		 */
		formatNoDataTextPostal: function(sText) {
			if (typeof sText === "undefined" || sText === "") {
				return "No PO Box for this."
			} else {
				return sText;
			}
		},
		
		/**
		 * Format postal information depending on whether there is text or not
		 * @param  {[type]} sText [String containing the data]
		 * @return {[type]}       [string date]
		 */
		formatAddressKind: function(sText) {
			if (typeof sText === "undefined" || sText === "") {
				return "No Kind."
			} else if(sText === "TMR") {
				return "EXT_TMR";
			} else {
				return sText;
			}
		}

	};

	return oFormatter;

});