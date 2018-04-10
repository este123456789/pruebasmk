var gettingData = false;
var openWeatherMapKey = "ee2827f2e9d5988a1650d7f3910564df";
var geocoder;
var main__h2 = document.getElementById('main__h2');
var map, infoWindow, pos, marker,service,geoJSON,request
var getWeather = function(northLat, eastLng, southLat, westLng) {
	gettingData = true;
	var requestString = "http://api.openweathermap.org/data/2.5/box/city?bbox="
+ westLng + "," + northLat + "," //left top
+ eastLng + "," + southLat + "," //right bottom
+ map.getZoom()
+ "&cluster=yes&format=json"
+ "&APPID=" + openWeatherMapKey;
request = new XMLHttpRequest();
request.onload = proccessResults;
request.open("get", requestString, true);
request.send();
};
var proccessResults = function() {

	var results = JSON.parse(this.responseText);

	if (results.list.length > 0) {
		resetData();
		for (var i = 0; i < results.list.length; i++) {
			geoJSON.features.push(jsonToGeoJson(results.list[i]));

		}
		drawIcons(geoJSON);
	}
};
var jsonToGeoJson = function (weatherItem) {
	var feature = {
		type: "Feature",
		properties: {
			city: weatherItem.name,
			weather: weatherItem.weather[0].main,
			temperature: weatherItem.main.temp,
			min: weatherItem.main.temp_min,
			max: weatherItem.main.temp_max,
			humidity: weatherItem.main.humidity,
			pressure: weatherItem.main.pressure,
			windSpeed: weatherItem.wind.speed,
			windDegrees: weatherItem.wind.deg,
			windGust: weatherItem.wind.gust,
			icon: "http://openweathermap.org/img/w/"
			+ weatherItem.weather[0].icon  + ".png",
			coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
		},
		geometry: {
			type: "Point",
			coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
		}
	};
	map.data.setStyle(function(feature) {
		return {
			icon: {
				url: feature.getProperty('icon'),
				anchor: new google.maps.Point(25, 25)
			}
		};
	});
	return feature;
};
var drawIcons = function (weather) {
	map.data.addGeoJson(geoJSON);
	gettingData = false;
};
var resetData = function () {
	geoJSON = {
		type: "FeatureCollection",
		features: []
	};
	map.data.forEach(function(feature) {
		map.data.remove(feature);
	});
};
var checkIfDataRequested = function() {
	while (gettingData === true) {
		request.abort();
		gettingData = false;
	}
	getCoords();
};
var getCoords = function() {

	var bounds = map.getBounds();
	var NE = bounds.getNorthEast();
	var SW = bounds.getSouthWest();

	getWeather(NE.lat(), NE.lng(), SW.lat(), SW.lng());
};
//
if ( navigator.geolocation ) {
	navigator.geolocation.getCurrentPosition(function (position) {
		pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		}
		initMap()



	})
} else {
	alert('Tu Navegador no soporta la Geolocalización')
}


// -------------v
window.onload = function() {
    var x = Math.floor((Math.random() * 9) + 2);
	document.getElementById('temp').innerHTML = x;
	document.getElementById('humedad').innerHTML = x;
	document.getElementById('descrip').innerHTML = x;

};

function initMap() {
	if(typeof sessionStorage.address != 'undefined' ){

		main__h2.innerHTML = '<h2 class="main__h2" id="main__h2"><i class="fa fa-arrow-left fa-icon-arrw"></i>'+sessionStorage.address+'</h2>';

	}
	geocoder = new google.maps.Geocoder();
	var mapContainer = document.getElementById('map')
	var config = {
		center: {lat: -34.397, lng: 150.644},
		zoom: 5
	}
	map = new google.maps.Map(mapContainer, config)
	infoWindow = new google.maps.InfoWindow({ map: map })
	service = new google.maps.places.PlacesService(map)
	map.addListener('idle', performSearch)

//
google.maps.event.addListener(map, 'idle', checkIfDataRequested);
map.data.addListener('click', function(event) {




infowindow.setContent(
	"<img src=" + event.feature.getProperty("icon") + ">"
	+ "<br /><strong>" + event.feature.getProperty("city") + "</strong>"
	+ "<br />" + event.feature.getProperty("temperature") + "&deg;C"
	+ "<br />" + event.feature.getProperty("weather")
	);
infowindow.setOptions({
	position:{
		lat: event.latLng.lat(),
		lng: event.latLng.lng()
	},
	pixelOffset: {
		width: 0,
		height: -15
	}
});
infowindow.open(map);

});




}

var button = document.getElementById('main__btnlocaliza')
button.addEventListener('click', function(event) {
	map.setCenter(pos)
	map.setZoom(15)

	if ( navigator.geolocation ) {
		navigator.geolocation.getCurrentPosition(function (position) {
			pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			}
			codeLatLng(pos.lat, pos.lng)



		})
	}

// infoWindow.setPosition(pos)
// infoWindow.setContent('Ubicación Encontrada')
var markerOpts = {
	position: pos,
	map: map
}
marker = new google.maps.Marker(markerOpts)

})


function performSearch() {
	var request = {
		bounds: map.getBounds(),
		keyword: 'coffe'
	};
	service.radarSearch(request, callback);
}

function callback(results, status) {
	if (status !== google.maps.places.PlacesServiceStatus.OK) {
		console.error(status);
		return;
	}

	for (var i = 0, result; result = results[i]; i++) {
		addMarker(result);
	}
}

function addMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: {
			url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
			anchor: new google.maps.Point(10, 10),
			scaledSize: new google.maps.Size(10, 17)
		}
	});

	google.maps.event.addListener(marker, 'click', function() {
		service.getDetails(place, function(result, status) {
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				console.error(status);
				return;
			}
			infoWindow.setContent(result.name);
			infoWindow.open(map, marker);
		});
	});
}


function codeLatLng(lat, lng) {

	if(typeof sessionStorage.address != 'undefined' ){

		main__h2.innerHTML = '<h2 class="main__h2" id="main__h2"><i class="fa fa-arrow-left fa-icon-arrw"></i>'+sessionStorage.address+'</h2>';

	}
	var latlng = new google.maps.LatLng(lat, lng);
	geocoder.geocode({'latLng': latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
//     

if (results[1]) {
	sessionStorage.setItem('address',results[0].formatted_address);
//formatted address
// alert(results[0].formatted_address)




//find country name
for (var i=0; i<results[0].address_components.length; i++) {
	for (var b=0;b<results[0].address_components[i].types.length;b++) {

//there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
//this is the object you are looking for
city= results[0].address_components[i];

break;
}
}
}
//city data

//
//  alert(city.short_name + " " + city.long_name)


} else {
	alert("No results found");
}
} else {
	alert("Geocoder failed due to: " + status);
}
});




}

