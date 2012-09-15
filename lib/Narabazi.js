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

  options : {
    env         : 'prod', // by default use the prod urls
    prodUrl     : 'http://www.dey.karkhana.asia/',
    devUrl      : 'http://localhost/discontented/web/app_dev.php/',
    map         : '',     // the map object to use
    debug       : 0,      // show debug messages, 0 - errors, 1 - plain, 2 - verbose
    displaying  : '',     // which links div is displaying
    markerLayer : '',     // the layer which contains all the marker stuff
    status     : false,  // false if not initialised 
    mode        : 'frontend',
  },

  
  url : function(){ // declare our endpoints
    // test what env we are in
    baseUrl = this.getBaseUrl();  
    return {
      // the map to use from MapBox (the TileJSON endpoint)
      tile        : 'http://a.tiles.mapbox.com/v3/rekarnar.map-3ryvuu7n.jsonp',
      // our geo json data
      locations   :    baseUrl+'json',    // get all nodes from db
      locationAdd :    baseUrl+'add',     // add a node to the db
      locationRemove : baseUrl+'remove',  // remove a node (append id)
      links       :    baseUrl+'location',// show links of a node (append id)
      linkAdd     :    baseUrl+'link/add', // add a link
      linkRemove  :    baseUrl+'link/remove' // remove a link
    }
  },

  // what is required by this guy (these are auto loaded)
  modules : [
    "lib/NarabaziLink.js",
    "lib/NarabaziLocation.js"
  ],
  
  // utility function to uc the first character of a string.
  ucfirst: function(string){ return string.charAt(0).toUpperCase() + string.slice(1); },
  
  // include all or scripts and set everything up
  init: function(options) {
    if(this.status) {
      Narabazi.message('Init called on already initalised lib', 0);
      return false;  
    }
    
    $.extend(this.options, options);

    // add the 'frontend' or 'backend' script to be loaded
    this.modules.push('lib/Narabazi'+this.ucfirst(this.options.mode)+'.js');

    // run this code after all the deps are loaded
    state = 0; 
    proceed = function() {
      if(Narabazi.modules.length==state++) {
        if(this.options.mode == 'backend') {
          // on initial app loading, check the login state
          NarabaziBackend.updateAuth({ callback: function() {
            // when the state is checked, update it accordingly
            Narabazi.message('Auth finished, setting internal state', 2);
            // ie: if authenticated, then show us the de-auth option 
            if(NarabaziBackend.getAuth()===true) {
              $('#login_box_text').text('X');
            }
            
            NarabaziBackend.init = true;
          }});
        }
             
        // set out init state
        this.status = true;        
      }
    }

    // include our modules
    $(this.modules).each(function(k, filename) {
      jQuery.ajax({
        async: false,
        type: "GET",
        url: 'http://localhost/narabazi/'+filename,
        data: null,
        success: function(script, textStatus) {
          Narabazi.message('Narabazi module loading: ' + textStatus + ' ('+filename+')', 1);
        },
        erroe: function(jqxhr, settings, exception) {
          Narabazi.message('Error from Narabazi module: ' + exception + ' ('+filename+')', 0);
        },
        dataType: 'script'
      });
    });
  },
  
  /**
  * Get the base part of the url depending on the env we are using.
  *
  * @return string
  */
  getBaseUrl: function() {
    return 'prod' === Narabazi.options.env.toLowerCase() ? Narabazi.options.prodUrl : Narabazi.options.devUrl;  
  },

  /**
  * Get the map we are using
  *
  * @return - the map object
  */
  getMap: function() {
    if(Narabazi.options.map == undefined) {
      Narabazi.message('The map object has not been set.');
    }

    return Narabazi.options.map;
  },

  /**
  * Get geo json from some place via the 'reqwest' tool
  *
  * @param string - url to query 
  */ 
  getGeoJson: function(url) {
    Narabazi.message('Getting saved GEOJson from server.. ', 3);
        
    // set default url
    if(url == undefined) url = Narabazi.url().locations;
  	 
    reqwest ({// send an ajax request to the server
      url: url,
      type: 'json',
      success: function(data) { Narabazi.options.markerLayer.addData(data); },
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
    Narabazi.options.markerLayer = L.geoJson(Narabazi.getGeoJsonShell(), {
      // callback to do on each data object
      // ie: all markers now and in the future added to 'Narabazi.markerLayer'
      // will also run this:
      onEachFeature: function (feature, layer) {
        NarabaziLocation.draw(feature, layer, Narabazi.markerClickedAction);
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
  	 if(level<=Narabazi.options.debug) { // if level is above the threshold
	  	 if(!console) { // if there is no console, give us an alert
	  	   alert(msg);
	  	 	 return;
	  	 } 
  	   // then display the message in the most fitting way
      level===0 ? console.error(msg) : console.log(msg);
    }
  }

}