/**
* Narabazi
*
* @author code-karkhana
* @location kathmandu
*
* Note: This style is called 'Object Literal Notation'
* you can read more here http://addyosmani.com/largescalejavascript/#objliteral
*/
var Narabazi =
{
  url : // declare our endpoints
  {
    // the map to use from MapBox (the TileJSON endpoint)
    tile        : 'http://a.tiles.mapbox.com/v3/rekarnar.map-3ryvuu7n.jsonp',
    // our geo json data
    locations   :    'http://localhost/discontented/web/app_dev.php/json',   // get all nodes from db
    locationAdd :    'http://localhost/discontented/web/app_dev.php/add',    // add a node to the db
    locationRemove : 'http://localhost/discontented/web/app_dev.php/remove', // remove a node (append id)
    links       :    'http://localhost/discontented/web/app_dev.php/location'// show links of a node (append id)
  },
 
  map : '', // the map object to use
  debug : 1, // show debug messages, 0 - errors, 1 - plain, 2 - verbose
  displaying : '', // which links div is displaying
  markerLayer: '', // the layer which contains all the marker stuff

  /**
  * Get a icon object
  *
  * Default: returns a town hall maki icon
  *
  * @param  string name - the name of an icon image to use
  * @return L.Icon
  */
  getIcon: function(name)
  {
  	  Narabazi.message('Icon name: '+name, 2);
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
  },

  /**
  * Get the map we are using
  *
  * @return - the map object
  */
  getMap: function()
  {
    if(this.map == undefined)
    {
      Narabazi.message('The map object has not been set.');
    }

    return this.map;
  },

  /**
  * Get geo json from some place via the 'reqwest' tool
  *
  * @param string - url to query 
  */ 
  getGeoJson: function(url)
  {
  	 // set default url
  	 if(url == undefined) url = Narabazi.url.locations;
  	 
    reqwest // send an ajax request to the server
    ({
      url: url,
      type: 'json',
      success: function(data){ Narabazi.markerLayer.addData(data); },
      error: function(data){ Narabazi.message('Error in geoJson', 0); } 
    });  
  },
  
  /**
  * Setup a marker layer
  *
  * This defines how all markers added to this layer will be created
  */  
  initMarkerLayer: function()
  {
     Narabazi.message('Setting up marker layer', 3);
     
     // load the object into the map
     Narabazi.markerLayer = L.geoJson(Narabazi.getGeoJsonShell(), {
       // call back to do on each data object
       onEachFeature: function (feature, layer) {
         Narabazi.message('Creating marker', 3);
         // create the popup         
         layer.bindPopup(feature.properties.name);
         // set the icon
         layer.setIcon(Narabazi.getIcon(feature.properties.icon));
         // watch it for clicks
         layer.on('click', function() { 
           Narabazi.message('Marker clicked', 2);
           // if clicked then display all the stuff.
           Narabazi.displayActions(this);
         })
       }
     }).addTo(this.getMap());
  },

  /**
  * Process a map click event:
  * Draw a marker at the click location and
  * attempt to save it in our database
  *
  * @param e   - map click event
  */
  onMapClick: function(e)
  {
     Narabazi.message('Map click recieved at: ' + e.latlng, 2);

    // possible cool thing, create a popup that asks
    // if the user wants to create a node here
    //
    //    popup.setLatLng(e.latlng)
    //        .setContent("Are you sure you want to create a node at: " + e.latlng.toString())
    //        .openOn(map);

    // save a new marker to the database
    Narabazi.saveNewNode(
      // add a marker at the click location
      Narabazi.createMarker(e.latlng)
    );
  },
  
  /**
  * Create a marker with some popup data.
  *
  * @param latlan - lattitude and longitude object
  */
  createMarker: function(latlng, popup)
  {
  	 if(latlng==undefined)
  	 {
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
  },
  
  /**
  * Get a new geoJson object
  *
  * @return geoJson - an empty object
  */
  getGeoJsonShell: function()
  {
    shell =
    {
      "type": "FeatureCollection",
      "features": [] 
    };
    return shell;
  }, 
  
  /**
  * Add a point to a geoJson string
  *
  * @param geoJson - initialised geoJson object
  * @param latlng  - latlng object to add
  */
  addMarkerToGeoJson: function(geoJson, latlng)
  {
  	 Narabazi.message('Creating new marker json for: ' + latlng, 2);
    
    geoJson.features.push({ 
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
  },

  /*
  * Save a node
  *
  * @param marker - a leaflet marker object (a location)
  */
  saveNewNode: function(marker)
  {
    // get the coords from the json object
    latlng = marker.features[0].geometry.coordinates;
    Narabazi.message('Saving new location: ' + latlng, 2);

    // fire our ajax'y thing 
    reqwest
    ({
      markerStore: marker,
      url: Narabazi.url.locationAdd,
      method: 'post',
      // send the click events data
      data: { lon: latlng[0], lat:latlng[1], q: true },
      // if you want to send an array, use this:
      //  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
      // this is called after the saving is completed:
      success: function (response, marker)
      { 
        Narabazi.message('Marker added with id: ' + response, 2);
        this.markerStore.features[0].properties.id = response;
      }
    });
  },
  
  /*
  * Delete a node
  *
  * @param marker - a leaflet marker object (a location)
  */
  deleteNode: function(marker)
  {
    Narabazi.message('Deleting marker: ' + marker.feature.properties.name, 2);

    reqwest // fire our ajax'y thing
    ({
      url: Narabazi.url.locationRemove+'/'+marker.feature.properties.id,
      method: 'post',
      // send the click events data
      data: { id: marker.feature.properties.id, q: true },
      // if you want to send an array, use this:
      //  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
      // this is called after the saving is completed:
      success: function(resp){ Narabazi.message(resp); }
    });
  },
  
  /**
  * Display the heads up info for this marker
  *
  * @param Marker - Leaflet Marker object
  */
  displayActions: function(marker)
  {
    Narabazi.message('Location clicked: ' + marker, 2);
    // show the info divs
    $(".infoDiv").show();
    
    // update the template to reflect this marker (jsRenderer & jsViews)
    $.link.infoTemplate( "#left_info", marker.feature.properties )
      // attach the delete action to the new delete button
      .on( "click", "#button_delete", function() {
         Narabazi.message('Removing marker: ' + marker, 2);
         // when clicked, remove the marker from the map
         Narabazi.getMap().removeLayer(marker);
         // and ask the server to delete it too
         Narabazi.deleteNode(marker);
      });
    
      
    Narabazi.message('Requesting links..', 1);
    links = {};
    reqwest // fire our ajax'y thing
    ({
      url: Narabazi.url.links+'/'+marker.feature.properties.id+'.json',
      type: 'json',
      // this is called after the saving is completed:
      success: function(data){
        Narabazi.message('Loading links..', 1);
      },
        //$.link.linkTemplate( "#link_list", data );
      error: function(data){ Narabazi.message('Error in geoJson', 0); } 
    });
      
  },
  
  /**
  * Get a link to remove a marker from the map
  *
  * @param Marker - A leaflet marker object
  * @return clickable div that will remove the marker
  */
  getDeleteLink: function(marker)
  {  
     // create a div
     return $("<div></div>", {
       id: 'delete_',
       text: 'Delete this marker'
     // add a click function to it
     }).click(function(e){
       Narabazi.message('Removing marker: ' + marker, 2);
       // when clicked, remove the marker from the map
       Narabazi.getMap().removeLayer(marker);
       // and ask the server to delete it too
       Narabazi.deleteNode(marker);
     });
  },
  
  /**
  * Log a message
  *
  * @param string msg - message to display
  * @param level int  - if this flag is set, display it as an error
  */
  message: function(msg, level)
  {
  	 if(level==undefined) level = 1; // if no level, then display as plain
  	 if(level<=Narabazi.debug) // if level is above the threshold
  	 {
	  	 if(!console) // if there is no console, give us an alert
	  	 {
	  	 	alert(msg);
	  	 	return;
	  	 } 
  	   // then display the message in the most fitting way
      level==0 ? console.error(msg) : console.log(msg);
    }
  }

}

/**
* This is the main call to start the map building.
*
*
* @param string   - url of a tile to render
* @param function - function to execute on success
*/ 
$(document).ready(function() // load when the dom is ready
{ 
  wax.tilejson(Narabazi.url.tile, function(tilejson) 
  {
    // create the map
    Narabazi.map = new L.Map('map')
      // add our tile
      .addLayer(new wax.leaf.connector(tilejson))
      // center it on our tiles center
      .setView(new L.LatLng(tilejson.center[1], tilejson.center[0]), tilejson.center[2]);

    // create a blank marker layer to use
    Narabazi.initMarkerLayer();
   
    // display the geo json nodes on the map
    Narabazi.getGeoJson();

    // add a click watcher to the map and call the 'onMapClick' function when fired.
    // note this 'on' function will pass an even into the callback function
    Narabazi.getMap().on('click', Narabazi.onMapClick);

  });
  
  // define our templates (jsrender and jsview)
  $.templates({
    infoTemplate: "#infoTemplate",
    linkTemplate: "#linkTemplate"
  });
  
  // the info close button
  $('#button_close').click(function(e){
//    Narabazi.displaying
    $(".infoDiv").hide();
  });


});