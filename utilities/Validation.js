jQuery.sap.declare("CHA_Report.Formatter");
	CHA_Report.Formatter = {
	convertToSAPdate: function (value) {
		if (value) {
			var mnth, day, output;
			if (value instanceof Date) {
				var NewDateform = value;
				mnth = ("0" + (NewDateform.getMonth() + 1)).slice(-2);
				day = ("0" + NewDateform.getDate()).slice(-2);
				output = [NewDateform.getFullYear(), mnth, day].join("-") + "T00:00:00";
				// return output;
			} else if (value.indexOf("T00:00:00")) {
				output = value;
			}
			return output;
		}
		return null;
	},

	formatDate: function (value) { // value is the date
		var year, month, day, output;
		if (typeof value === 'undefined' || value === null || value == "00000000" || value == "") {
			return "";
		} else if (value instanceof Date) {
			var NewDateform = value;
			month = ("0" + (NewDateform.getMonth() + 1)).slice(-2);
			day = ("0" + NewDateform.getDate()).slice(-2);
			output = [day, month, NewDateform.getFullYear()].join("/");
			return output;
		} else {
			year = value.substring(0, 4);
			month = value.substring(5, 7);
			day = value.substring(8, 10);
			return day + "/" + month + "/" + year; // return the formatted date
		}
	},

	convertToBoolean: function (value) {
		if (value.match("X")) {
			return true;
		} else {
			return false;
		}
	},

	checkEmpty: function (value) {
		if (value.length > 0) {
			return true;
		} else {
			return false;
		}
	}
};