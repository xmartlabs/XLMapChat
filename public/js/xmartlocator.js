var xmartlabslocator = {};
(function(publicScope) {
	var webSocket, map, markers, myMarker;

	publicScope.initialize = function(socket, mapId) {
		webSocket = socket;
		markers = {};

		var defaultPosition = new google.maps.LatLng(-34.397, 150.644);
		var mapOptions = {
			zoom: 8,
			center: defaultPosition,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		map = new google.maps.Map(document.getElementById(mapId), mapOptions);
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition, errorHandler);
		} else {
			alert("Geolocation is not supported by this browser.");
		}

		webSocket.on('location', updateMarker);
		webSocket.on('all locations', loadMarkers);
		webSocket.on('user disconnected', removeMarker);
		webSocket.emit('request locations');

		$(document).on('click', ".sender", showUserLocation);
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

	function errorHandler(error) {
		alert(getGeolocationErrorMessage(error));
	}

	function addMarker(lat, lng, title) {
		return new google.maps.Marker({
			title: title,
			map: map,
			position: new google.maps.LatLng(lat,lng)
		});
	}

	function showPosition(position) {
		var data = new Object();
		data.lat = position.coords.latitude;
		data.lng = position.coords.longitude;

		myMarker = addMarker(data.lat, data.lng, 'Me');

		map.setCenter(myMarker.getPosition());

		webSocket.emit("location update",data);
	}

	function showUserLocation(event){
		event.preventDefault();
		var userMarker = markers[$(event.currentTarget).data("key")];
		if(userMarker) {			
			map.setCenter(userMarker.getPosition());
		} else {
			map.setCenter(myMarker.getPosition());
		}
	}

	function updateMarker(data) {
		var marker = markers[data.userKey];

		if(marker) {
			marker.setPosition(new google.maps.LatLng(data.lat,data.lng));			
		} else {
			marker = addMarker(data.lat, data.lng, data.username);
		}		
		markers[data.userKey] = marker;
	}

	function loadMarkers(data) {
		for(key in data) {
			var marker = data[key];
			markers[key] = addMarker(marker.lat, marker.lng, marker.username);
		}
	}

	function removeMarker(key){
		var marker = markers[key];
		if(marker){
			marker.setMap(null);
			delete marker;
		}
	}
})(xmartlabslocator);