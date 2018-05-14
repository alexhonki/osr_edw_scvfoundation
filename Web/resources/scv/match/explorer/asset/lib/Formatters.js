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
    }

  };


  return oFormatter;


});
