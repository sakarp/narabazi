/**
* Narabazi
*
* @author code-karkhana
* @location kathmandu
*
* Note: This style is called 'Object Literal Notation'
* you can read more here http://addyosmani.com/largescalejavascript/#objliteral
*/
var Narabazi = {
  url : { // declare our endpoints
    // the map to use from MapBox (the TileJSON endpoint)
    tile        : 'http://a.tiles.mapbox.com/v3/rekarnar.map-3ryvuu7n.jsonp',
    // our geo json data
    locations   :    'http://localhost/discontented/web/app_dev.php/json',    // get all nodes from db
    locationAdd :    'http://localhost/discontented/web/app_dev.php/add',     // add a node to the db
    locationRemove : 'http://localhost/discontented/web/app_dev.php/remove',  // remove a node (append id)
    links       :    'http://localhost/discontented/web/app_dev.php/location',// show links of a node (append id)
    linkAdd     :    'http://localhost/discontented/web/app_dev.php/link/add', // add a link
    linkRemove  :    'http://localhost/discontented/web/app_dev.php/link/remove' // remove a link
  },
  
  modules : [
    "lib/NarabaziLink.js",
    "lib/NarabaziLocation.js"
  ],
 
  map           : '',     // the map object to use
  debug         : 1,      // show debug messages, 0 - errors, 1 - plain, 2 - verbose
  displaying    : '',     // which links div is displaying
  markerLayer   : '',     // the layer which contains all the marker stuff
  status       : false,  // false if not initialised

  init: function() {
    if(this.status) {
      Narabazi.message('Init called on already initalised lib', 0);
      return false;  
    }
    
    this.status = true;

    // include our modules
    $(this.modules).each(function(k, filename) {
      $.getScript(filename)
        .done(function(script, textStatus) {
          Narabazi.message('Narabazi module loading: ' + textStatus + ' ('+filename+')', 1);
        })
        .fail(function(jqxhr, settings, exception) {
          Narabazi.message('Narabazi link module: ' + exception + ' ('+filename+')', 0);
        });  
    });

    // create a blank marker layer on our map
    Narabazi.initMarkerLayer();
  },

  /**
  * Get a icon object
  *
  * Default: returns a town hall maki icon
  *
  * @param  string name - the name of an icon image to use
  * @return L.Icon
  */
  getIcon: function(name) {
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
  getMap: function() {
    if(this.map == undefined) {
      Narabazi.message('The map object has not been set.');
    }

    return this.map;
  },

  /**
  * Get geo json from some place via the 'reqwest' tool
  *
  * @param string - url to query 
  */ 
  getGeoJson: function(url) {
    // set default url
    if(url == undefined) url = Narabazi.url.locations;
  	 
    reqwest ({// send an ajax request to the server
      url: url,
      type: 'json',
      success: function(data) { Narabazi.markerLayer.addData(data); },
      error: function(data) { Narabazi.message('Error in geoJson', 0); } 
    });  
  },
  
  /**
  * Setup a marker layer
  *
  * This defines how all markers added to this layer will be created
  */  
  initMarkerLayer: function() {
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
  onMapClick: function(e) {
     Narabazi.message('Map click recieved at: ' + e.latlng, 2);

    // possible cool thing, create a popup that asks
    // if the user wants to create a node here
    //
    //    popup.setLatLng(e.latlng)
    //        .setContent("Are you sure you want to create a node at: " + e.latlng.toString())
    //        .openOn(map);

    // save a new marker to the database
    NarabaziLocation.saveNewNode(
      // add a marker at the click location
      Narabazi.createMarker(e.latlng)
    );
  },
  
  /**
  * Create a marker with some popup data.
  *
  * @param latlan - lattitude and longitude object
  */
  createMarker: function(latlng, popup) {
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
  },
  
  /**
  * Get a new geoJson object
  *
  * @return geoJson - an empty object
  */
  getGeoJsonShell: function() {
    shell = {
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
  addMarkerToGeoJson: function(geoJson, latlng) {
    Narabazi.message('Creating new marker json for: ' + latlng, 2);
    
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
  },
  
  /**
  * Display the heads up info for this marker
  *
  * @param Marker - Leaflet Marker object
  */
  displayActions: function(marker) {
    Narabazi.message('Location clicked: ' + marker, 2);
    // show the info divs
    $(".infoDiv").show();
    
    // update the template to reflect this marker (jsRenderer & jsViews)
    $.link.infoTemplate( "#left_info", marker.feature.properties )
      .off("click", "#button_delete") // remove any old events
      // attach the delete action to the new delete button
      .on( "click", "#button_delete", function() {
         NarabaziLocation.undraw(marker);
         // and hide the info window
         $(".infoDiv").hide();
      });
		      
    Narabazi.message('Requesting links..', 2);
    reqwest ({ // request all links from the data controller
      url: Narabazi.url.links+'/'+marker.feature.properties.id+'.json',
      type: 'json',
      // this is called after the saving is completed:
      success: function(data){
        Narabazi.message('Loading links..', 2);
        // join the link list data to the link_list div
        $.link.linkTemplate("#link_list", data)
          .off("click", ".button_link_delete") // remove any old events
          .on("click", ".button_link_delete", function(e) {
            id = $(e.target).attr('_data'); // get the id from the _data field in the div
            Narabazi.message('Deleting link: ' + id, 1);
            reqwest ({ // when clicked send the data to be saved
              target: $(e.target), // save for success fuction
              url: Narabazi.url.linkRemove+'/'+id,
              method: 'post',
              success: function (response) { 
                // remove link stuff
                Narabazi.message('Removing display link with id: ' + response, 2);
                this.target.parent().remove();
              }
            });            
          })
          .off("click", "#button_link_add") // remove any ones from previous links
          .on("click", "#button_link_add", function() {
            Narabazi.message('Getting link form for: ' + marker.feature.title, 2);
            // show the addLink template for this location
            $.link.addLinkTemplate( "#link_add", NarabaziLink.getDetails, NarabaziLink );
            // in the link template when the 'add' link button is pressed
            $("#submitAddLink").on( "click", function() {
              Narabazi.message('Saving link for location: ' + marker.feature.properties.id, 1);
              reqwest ({ // when clicked send the data to be saved
                url: Narabazi.url.linkAdd+'/'+marker.feature.properties.id,
                method: 'post',
                // send the click events data
                data: NarabaziLink.getDetails,
                // q: true },
                success: function (response) { 
                  Narabazi.message('Link added with id: ' + response, 1);
                  // now clear and reset the form
                  $('#linkAddForm')[0].reset();
                  $('#linkAddOptions').hide();
                  // something like this we need to do now
                  //$.view(this).refresh();
                }
              });

            });
            
        });
      },
      error: function(data){ Narabazi.message('Error in geoJson', 0); } 
    });
      
  },
  
  /**
  * Log a message
  *
  * @param string msg - message to display
  * @param level int  - if this flag is set, display it as an error
  */
  message: function(msg, level) {
  	 if(level==undefined) level = 1; // if no level, then display as plain
  	 if(level<=Narabazi.debug) { // if level is above the threshold
	  	 if(!console) { // if there is no console, give us an alert
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
$(function() { // load when the dom is ready
  wax.tilejson(Narabazi.url.tile, function(tilejson) {
    // create the map
    Narabazi.map = new L.Map('map')
      // add our tile
      .addLayer(new wax.leaf.connector(tilejson))
      // center it on our tiles center
      .setView(new L.LatLng(tilejson.center[1], tilejson.center[0]), tilejson.center[2]);

    // setup everything!
    Narabazi.init();
   
    // display the geo json nodes on the map
    Narabazi.getGeoJson();

    // add a click watcher to the map and call the 'onMapClick' function when fired.
    // note this 'on' function will pass an even into the callback function
    Narabazi.getMap().on('click', Narabazi.onMapClick);

  });
  
  // define our templates for jsrender
  $.templates({
    infoTemplate: "#infoTemplate",
    linkTemplate: "#linkTemplate",
    addLinkTemplate: "#addLinkTemplate"
  });
  
  // the info close button
  $('#button_close').click(function(e){
    $(".infoDiv").hide();
  });

});