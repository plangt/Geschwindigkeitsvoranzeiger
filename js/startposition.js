/*
OpenRailwayMap Copyright (C) 2012 Alexander Matheisen
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to redistribute it under certain conditions.
See http://wiki.openstreetmap.org/wiki/OpenRailwayMap for details.
*/


// set start position by given coordinate or, if possible, by geolocation api
function Startposition(map, locateButton)
{
	// set position by user's ip address
	this.setPositionByIp = function()
	{
		var self = this;
		var handler = function(request)
		{
			var response = request.responseText;
			// extract coordinates and show position
			if ((response.length > 0) && (response != "NULL"))
			{
				response = response.split(",");
				self.map.setView(new L.LatLng(response[0], response[1]), 10);
				self.geolocate();
				return true;
			}
			else
			{
				self.geolocate();
				return false;
			}
		}

		requestApi("ippos", "", handler);
	}


	// main locating function
	this.geolocate = function()
	{
		// if geolocation is available
		if (navigator.geolocation)
			this.map.locate({timeout: 3000, enableHighAccuracy: true, setView: true});
	}


	// locating by ip or fixed latlon
	this.setPosition = function()
	{
		if (!this.setPositionByIp())
		{
			// position to zoom on if no permalink is given and geolocation isn't supported
			var lat = 51.58248;
			var lon = 15.6501;
			var zoom = 3;
			this.map.setView(new L.LatLng(lat, lon), zoom);
		}
	}


	this.map = map;
	this.locateButton = gEBI(locateButton);

	// set position if params are set
	var self = this;
	var handler = function(request)
	{
		var response = request.responseText;
		if ((response.length > 0) && (response != "NULL"))
		{
			var results = JSON.parse(response);
			self.map.setView(new L.LatLng(results[0]['lon'], results[0]['lat']), 16);
		}
	};
	// permalink given
	if (params['lat'] && params['lon'])
	{
		if (!params['zoom'])
			params['zoom'] = 17;
		this.map.setView(new L.LatLng(params['lat'], params['lon']), params['zoom']);
	}
	// milestone given
	else if (params['position'] && params['line'])
		requestApi("position", "position="+params['position']+"&line="+params['line'], handler);
	// facility name given
	else if (params['name'])
		requestApi("position", "name="+params['name'], handler);
	// facility ref given
	else if (params['ref'])
		requestApi("position", "ref="+params['ref'], handler);
	// no permalink
	else
		this.setPosition();

	// onclick event of locate button
	var self = this;
	this.locateButton.onclick = function()
	{
		self.setPosition();
	};

	// load markers without moving the map first
	this.map.setView(this.map.getCenter(), this.map.getZoom());
}
