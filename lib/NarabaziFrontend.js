/**
* NarabaziFrontend
*
* @author code-karkhana
* @location kathmandu
*
* The frontend module: to display stuff
*
task for today
var qs = encodeURIComponent('node ["office"="Government"](27.706940, 85.317528, 27.724039, 85.340973); out body;');

var obj=callOverpass(qs)
obj[0] is a node 
var node = obj[0]
for each element in array node 
find node.lat + node.long
and add marker at that position
on maps and put node.name if it has name
*/
NarabaziFrontend = (function(controller) {
  // private stuff 
  controller.message("Narabazi frontend setup", 2);
  
 function init(msg)
  {
    controller.message("FRONTEND SETUP: " + msg, 0);
  }
  
  function saveAndDrawLocation(e) {
    controller.message('Map click received at: ' + e.latlng, 2);

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
    );
  };

  function markerClickedAction(marker) {
    Narabazi.message('Location clicked: ' + marker, 2);
    
	Narabazi.message('Requesting links..', 2);
    reqwest ({ // request all links from the data controller
      url: Narabazi.url().links+'/'+marker.feature.properties.id+'.json',
      type: 'json',
      // this is called after the saving is completed:
      success: function(data){
        Narabazi.message('Loading links..', 1);
			
		
            
        
      },
      error: function(data){ Narabazi.message('Error in geoJson', 0); } 
    });
      
  };
   
  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    //go: init,
	onMapClick:          saveAndDrawLocation,
	markerClickedAction: markerClickedAction
	
     
  } // end public, aka: revealed section
}(Narabazi));

/**
* This is the main call to start us running.
*
*/ 
$(function() { // load when the dom is ready
  //NarabaziFrontend.go('NOT DONE');
  Narabazi.env = 'Prod'; // we can overight the env here if needed 
    wax.tilejson(Narabazi.url().tile, function(tilejson) {
    // create the map
    Narabazi.map = new L.Map('map')
    // add our tile
    .addLayer(new wax.leaf.connector(tilejson))
    // center it on our tiles center
    .setView(new L.LatLng(tilejson.center[1], tilejson.center[0]), tilejson.center[2]);

    // overwrite the 'marker' click action, with our one
    Narabazi.markerClickedAction = NarabaziFrontend.markerClickedAction;

    // load our modules and display a blank layer
    Narabazi.init();
   
    // get the geo json nodes from our server and display them on the map
    Narabazi.getGeoJson();
    
    // add a click watcher to the map and call the 'onMapClick' function when fired.
    // note this 'on' function will pass an event into the callback function
    //Narabazi.getMap().on('click', NarabaziFrontend.onMapClick);

  });
  
});