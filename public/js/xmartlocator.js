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
		xmartlabsutil.geolocation(showPosition);

		webSocket.on('location update', updateMarker);
		webSocket.on('all locations', loadMarkers);
		webSocket.on('user disconnected', removeMarker);
		webSocket.emit('request locations');

		$(document).on('click', ".sender", showUserLocation);
	}

	function addMarker(lat, lng, title) {
		return new google.maps.Marker({
			title: title,
			map: map,
			position: new google.maps.LatLng(lat,lng)
		});
	}

	function showPosition(position) {
		var data = {
			lat : position.coords.latitude,
			lng : position.coords.longitude,
		}

		myMarker = addMarker(data.lat, data.lng, 'Me');

		map.setCenter(myMarker.getPosition());

		webSocket.emit("send location",data);
	}

	function showUserLocation(event){
		event.preventDefault();
		var key = $(event.currentTarget).data("key");
		if(key == xmartlabschat.user.key)
			map.setCenter(myMarker.getPosition());
		else {
			var userMarker = markers[key];
			if(userMarker)			
				map.setCenter(userMarker.getPosition());
			else
				alert("The user is no longer connected")
		}
	}

	function updateMarker(data) {
		var marker = markers[data.key];

		if(marker) {
			marker.setPosition(new google.maps.LatLng(data.lat,data.lng));			
		} else {
			marker = addMarker(data.lat, data.lng, data.name);
		}		
		markers[data.key] = marker;
	}

	function loadMarkers(data) {
		for(key in data) {
			var user = data[key];
			xmartlabschat.addUser(user);
			markers[key] = addMarker(user.lat, user.lng, user.name);
		}
	}

	function removeMarker(key){
		var marker = markers[key];
		if(marker){
			marker.setMap(null);
			delete markers[key];
		}
	}
})(xmartlabslocator);