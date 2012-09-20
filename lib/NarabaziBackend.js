/*******************************************
* NarabaziBackend
*
* @author code-karkhana
* @location kathmandu
*
* This is the main call to start us running.
*
*/
$(function() {
  // some files we will load via head
  head.js("lib/wax/ext/leaflet-src.js", // wax: extra controls for the map etc
          "lib/wax/dist/wax.leaf.js",   // leaflet styles: the tile importer
          "lib/jsrender.js",
          "lib/jquery.views.js",
          "lib/Narabazi.js",
          "lib/NarabaziAuth.js"
         );

  // now load narabazi to get the list of required modules
  head.ready("Narabazi.js", function() {
    Narabazi.message('Narabazi loaded, now starting to load modules..', 1);

    // load our modules and files we need
    Narabazi.init( {
      env:  'dev', 
      mode: 'backend', 
      debug: 2
    })
    .done(function() { 
      Narabazi.message("Narabazi finished loading", 1);
      head.ready("NarabaziAuth.js", function() {
        NarabaziAuth.init();
        NarabaziAuth.updateAuth(); // and setup the login state        
      });
      head.js("lib/NarabaziBackendDom.js", function() {
        NarabaziBackendDom.setupObservers();
        this.status = true;  // set out init state
        goGoGo(); // when init is finished, then start us all going.
      });    
      // make sure jsrender is loaded, then setup our templates
      head.ready('jquery.views.js', function() {
        Narabazi.message('Narabazi: Loading templates', 2);
        $.templates({
          infoTemplate:    "#infoTemplate",
          linkTemplate:    "#linkTemplate",
          addLinkTemplate: "#addLinkTemplate"
        });
      });
    });
  });
  
  /**
  * Process a map click event:
  * Draw a marker at the click location and
  * attempt to save it in our database
  *
  * @param e   - map click event
  */
  function saveAndDrawLocation(e) {
    // possible cool thing, create a popup that asks
    // if the user wants to create a node here
    //
    //    popup.setLatLng(e.latlng)
    //        .setContent("Are you sure you want to create a node at: " + e.latlng.toString())
    //        .openOn(map);

    // save a new marker to the database
    NarabaziLocation.save(
      // add a marker at the click location
      NarabaziLocation.create(e.latlng)
    )
    .fail(function(r) {
      controller.message('Saving marker failed', 0);
      console.log(r);
      //setIcon
    })
  }

  function goGoGo() {
    Narabazi.message('All systems GO, starting to draw map', 1);

    // now draw us a map!
    wax.tilejson(Narabazi.url().tile, function(tilejson) {
      // create the map
      Narabazi.options.map = new L.Map('map')
        // add our tile
        .addLayer(new wax.leaf.connector(tilejson))
        // center it on our tiles center
        .setView(new L.LatLng(tilejson.center[1], tilejson.center[0]), tilejson.center[2]);
  
      // overwrite the 'marker' click action, with our one
      //Narabazi.markerClickedAction = NarabaziBackend.markerClickedAction;
  
      // create a blank marker layer on our map
      Narabazi.initMarkerLayer();    
  
      // get the geo json nodes from our server and display them on the map
      Narabazi.getGeoJson();

      // add a click watcher to the map and call the 'onMapClick' function when fired.
      // note this 'on' function will pass an event into the callback function
      Narabazi.getMap().on('click', saveAndDrawLocation);
    }); // end map tile ready
  }
}); // end dom ready function