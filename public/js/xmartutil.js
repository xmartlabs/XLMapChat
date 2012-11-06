var xmartlabsutil = {};
(function(publicScope) {

	publicScope.geolocation = function(successHandler, errorHandler) {
		errorHandler = errorHandler || geolocationErrorHandler;

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}

	function geolocationErrorHandler(error) {
		alert(getGeolocationErrorMessage(error));
	}

	function getGeolocationErrorMessage(error) {
		switch(error.code) {
		case error.PERMISSION_DENIED:
			return "Your location will not be shared with other users."
		case error.POSITION_UNAVAILABLE:
			return "Location information is unavailable."
		case error.TIMEOUT:
			return "The request to get your location timed out."
		case error.UNKNOWN_ERROR:
			return "An unknown error occurred."
		}
	}

	publicScope.getHoursAndMinutes = function(){
		var date = new Date();
		var hours =	date.getHours().toString();
		var minutes = date.getMinutes().toString();
		if(hours.length < 2)
			hours = "0" + hours;
		if(minutes.length < 2)
			minutes = "0" + minutes;
		return hours+":"+minutes;
	}

})(xmartlabsutil);