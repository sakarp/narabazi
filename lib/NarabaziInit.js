/*******************************************
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
      NarabaziAuth.updateAuth(); // and setup the login state
      head.js("lib/NarabaziBackendDom.js", function() {
        NarabaziBackendDom.setupObservers();
        this.status = true;  // set out init state
        goGoGo(); // when init is finished, then start us all going.
      });
    });
  });

  // make sure jsrender is loaded, then setup our templates
  head.ready('jsrender.js', function() {
    $.templates({
      infoTemplate:    "#infoTemplate",
      linkTemplate:    "#linkTemplate",
      addLinkTemplate: "#addLinkTemplate"
    });
  });
  
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
      Narabazi.markerClickedAction = NarabaziBackend.markerClickedAction;
  
      // create a blank marker layer on our map
      Narabazi.initMarkerLayer();    
  
      // get the geo json nodes from our server and display them on the map
      Narabazi.getGeoJson();
      
      // add a click watcher to the map and call the 'onMapClick' function when fired.
      // note this 'on' function will pass an event into the callback function
      Narabazi.getMap().on('click', NarabaziBackendDom.onMapClick);
    }); // end map tile ready
  }
}); // end dom ready function