/**
* NarabaziLocation
*
* @author code-karkhana
* @location kathmandu
*
* The location object module
* Used to create locations.
*
*/
NarabaziLocation = (function(controller) {
  // private stuff 
  controller.message("Narabazi location management setup", 2);

  /*
  * Save a location
  *
  * @param marker - a leaflet marker object (a location)
  */
  function saveNewLocation(marker) {
    // get the coords from the json object
    latlng = marker.features[0].geometry.coordinates;
    controller.message('Saving new location: ' + latlng, 1);
    
    reqwest ({
      markerStore: marker,
      url: controller.url().locationAdd,
      method: 'post',
      // send the click events data
      data: { lon: latlng[0], lat:latlng[1], q: true },
      // if you want to send an array, use this:
      //  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
      // this is called after the saving is completed:
      success: function (response) { 
        controller.message('Marker added with id: ' + response, 2);
        this.markerStore.features[0].properties.id = response;
      }
    });
  };
  
  /*
  * Delete a location
  *
  * @param marker - a leaflet marker object (a location)
  */
  function deleteLocation(marker) {
    controller.message('Deleting marker: ' + marker.feature.properties.name, 2);

    reqwest ({ // fire our ajax'y thing
      url: controller.url().locationRemove+'/'+marker.feature.properties.id,
      method: 'post',
      // send the click events data
      data: { id: marker.feature.properties.id, q: true },
      // if you want to send an array, use this:
      //  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
      // this is called after the saving is completed:
      success: function(resp){ controller.message('Removed node: '+resp, 1); }
    });
  };
  
  /**
  * Create a marker with some popup data.
  *
  * @param latlan - lattitude and longitude object
  */
  function createMarker(latlng, popup) {
    if(latlng==undefined) {
  	 	Narabazi.message('No location given for marker creation', 2);
  	 	return false;
    } 

    // create a geojson object for the marker
    newMarker = Narabazi.addMarkerToGeoJson(
      Narabazi.getGeoJsonShell(), 
      latlng
    );
 
    // add the marker to the marker layer
    Narabazi.markerLayer.addData(newMarker);
    
    // return our new marker
    return newMarker;
  }

  /**
  * Draw a location marker on the map
  *
  * @param feature  - the marker to draw
  * @param layer    - the icon to draw on
  * @param callback - function to run on click
  */
  function drawLocation(feature, layer, callback) {
    controller.message('Creating marker', 3);
    // create the popup         
    layer.bindPopup(feature.properties.name);
    // set the icon
    layer.setIcon(this.getIcon(feature.properties.icon));
    // watch it for clicks
    layer.on('click', function() { 
      controller.message('Marker clicked', 2);
      // fire this markers actions
      callback(this);
    })
  }
  
  function undrawLocation(marker) {
     controller.message('Removing marker: ' + marker, 2);
     // when clicked, remove the marker from the map
     controller.getMap().removeLayer(marker);
     // and ask the server to delete it too
     deleteLocation(marker);
  }

  /**
  * Create a geolocation point in a geoJson object
  *
  * @param geoJson - initialised geoJson object
  * @param latlng  - latlng object to add
  */
  function addMarkerToGeoJson(geoJson, latlng) {
    controller.message('Creating new marker json for: ' + latlng, 2);
    
    geoJson.features.push( { 
        "type": "Feature",
        "geometry": { 
          "type": "Point", 
          "coordinates": [latlng.lng, latlng.lat]
        },
        "properties": {
          "name" : "Oh noes! This marker does not have a title yet!",
          "icon" : "",
          "id"   : null
        }
    });

    return geoJson;
  };
  
  /**
  * Get a icon object
  *
  * Default: returns a town hall maki icon
  *
  * @param  string name - the name of an icon image to use
  * @return L.Icon
  */
  function getIcon(name) {
    controller.message('Icon name: '+name, 2);
    // TODO: need to test for existing icon file
    
	  // Define a custom icon using the Maki museum icon and return an instance of it.
	  return new (L.Icon.extend({options:{
	    iconUrl: name == '' ? 'images/maki/town-hall-24.png' : name,
	    // use the default options given from leafet for icons
	    shadowUrl: null,
	    iconSize: new L.Point(24, 24),
	    shadowSize: null,
	    iconAnchor: new L.Point(12, 24),
	    popupAnchor: new L.Point(0,-24)
	  }}))();
  };  
 
  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx

    add    : addMarkerToGeoJson,
 
    save   : saveNewLocation,
    delete: deleteLocation,
    undraw : undrawLocation,
    create : drawLocation
    
    
    
  } // end public, aka: revealed section
}(Narabazi));