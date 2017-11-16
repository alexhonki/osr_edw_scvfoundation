sap.ui.define([
		"sap/ui/core/ValueState"
	],
	function(ValueState) {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit: function(sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},

			/**
			 * Creates a presentation for locale en-AU for a given number.
			 * @public
			 * @param {number} The number to convert
			 * @retursn {string} The converted number into a locale presentation
			 */
			localePresentation: function(sValue) {
				return sValue.toLocaleString('en-AU');
			},

			/**
			 * Defines a value state based on the stock level
			 * @public
			 * @param {number} iValue the stock level of a product
			 * @returns {sap.ui.core.ValueState} the value state for the stock level
			 */
			quantityState: function(iValue) {
				if (iValue === 0) {
					return ValueState.Error;
				} else if (iValue <= 10) {
					return ValueState.Warning;
				} else {
					return ValueState.Success;
				}
			},

			matchPolicyState: function(cellValue) {
				this.onAfterRendering = function() {
					//!!! if not after redering, can't get the dom
					var cellId = this.getId();
					$("#" + cellId).parent().parent().parent().css("color", "red");
					return 'value';
				};
			},
			/**
			 * Defines a value state based on the match score
			 * @public
			 * @param {number} iValue the match scors
			 * @returns {sap.ui.core.ValueState} the value state for the match score
			 */
			matchState: function(iValue) {
				if (iValue === 100) {
					return ValueState.Success;
				} else if (iValue >= 95 && iValue < 100) {
					return ValueState.Warning;
				} else {
					return ValueState.Error;
				}
			},

			/**
			 * Defines a value state based on the stock level
			 * @public
			 * @param {number} iValue the stock level of a product
			 * @returns {sap.ui.core.ValueState} the value state for the stock level
			 */
			scoreState: function(iValue) {
				if (iValue === 100 || !iValue) {
					return ValueState.Success;
				} else if (iValue >= 95) {
					return ValueState.Warning;
				} else {
					return ValueState.Error;
				}
			}

		};

	});