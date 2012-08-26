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

  // what is required by this guy  
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
          Narabazi.message('Error from Narabazi module: ' + exception + ' ('+filename+')', 0);
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
     
    // load the layer onto the map.
    // through this we will add all markers
    Narabazi.markerLayer = L.geoJson(Narabazi.getGeoJsonShell(), {
      // call back to do on each data object
      onEachFeature: function (feature, layer) {
        NarabaziLocation.create(feature, layer, Narabazi.markerClickedAction)
      } 
    }).addTo(this.getMap());
  },

  /**
  * Marker clicked. What to do when a marker is  clicked on the map.
  * This should be over written by your own function
  */
  markerClickedAction: function() {
    Narabazi.message('Error, please overload this function', 0);
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