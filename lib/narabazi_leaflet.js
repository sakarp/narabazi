/**
* Narabazi
*
* @author an unnamed collective
* @location kathmandu
*
* Note: This style is called 'Object Literal Notation'
* you can read more here http://addyosmani.com/largescalejavascript/#objliteral
*/
var Narabazi =
{
  // declare our endpoints:

  // the map to use from MapBox (the TileJSON endpoint)
  tileUrl      : 'http://a.tiles.mapbox.com/v3/rekarnar.map-3ryvuu7n.jsonp',
  // our geo json data
  geoJsonUrl   : 'http://localhost/discontented/web/app_dev.php/json',
  // where to send our new nodes to save them
  saveNodesUrl : 'http://localhost/discontented/web/app_dev.php/add',
 
  // the map object to use
  map : '',

  // Define a custom icon using the Maki museum icon
  MuseumIcon: L.Icon.extend({options:{
    iconUrl: 'images/maki/town-hall-24.png',
    shadowUrl: null,
    iconSize: new L.Point(24, 24),
    shadowSize: null,
    iconAnchor: new L.Point(12, 24),
    popupAnchor: new L.Point(0,-24)
  }}),

  /**
  * Get the default icon
  *
  * @return L.Icon
  */
  getDefaultIcon: function()
  {
    return new this.MuseumIcon();
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
      console.log('The map object has not been set.');
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
    var successFunctionName = 'this.process_geoJson()';

    // check to see if this is a 'p' type tile
    // if so change some options
    reqwest((url.match(/geojsonp$/)) ? {
      url: url + (~url.indexOf('?') ? '&' : '?') + 'callback=grid',
      type: 'jsonp',
      jsonpCallback: 'callback',
      success: process_geoJson,
      error: successFunctionName
    } : {
      url: url,
      type: 'json',
      success: Narabazi.process_geoJson(),
      error: successFunctionName
    });  
  },

  /**
  * Process a list of geoJson objects and add it to a map
  *
  * @param geoJson - list of objects
  */
  process_geoJson: function(data) 
  {
     // load the object into the map
     L.geoJson(data, {
       style: function (feature) {
         return {color: feature.properties.color};
       },
       
       // call back to do on each data object
       onEachFeature: function (feature, layer) {
         layer.bindPopup(feature.properties.title);
         layer.setIcon(defaultIcon);
       }
     }).addTo(this.getMap());

     // if we want the layer we can do it this way
     //var layer = L.geoJson().addTo(map);
     //layer.addData(data);
  },

  /**
  * Process a map click event
  *
  *
  * @param e   - map click event
  */
  onMapClick: function(e) {
    // possible cool thing, create a popup that asks
    // if the user wants to create a node here
    //
    //    popup.setLatLng(e.latlng)
    //        .setContent("Are you sure you want to create a node at: " + e.latlng.toString())
    //        .openOn(map);

    // add a marker at the click location
    var marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(Narabazi.getMap());

    // if you want to add a popup to a marker, use this:
    //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

    // save it in the database
    Narabazi.saveNewNodes(e.latlng);
  },

  /*
  * Save a node
  *
  * @param lanlng - a wax location object
  */
  saveNewNodes: function(latlng)
  {
    // fire our ajax'y thing 
    reqwest({
         url: Narabazi.saveNodesUrl
       , method: 'post'
       // send the click events data
       , data: { name: 'test', lat: latlng.lat, lon: latlng.lng, q: true }
       // if you want to send an array, use this:
       //  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
       // this is called after the saving is completed:
       , success: function (resp) {
           //console.log(resp);
         }
    });
  }

}

/**
* This is the main call to start the map building.
*
*
* @param string   - url of a tile to render
* @param function - function to execute on success
*/ 
wax.tilejson(Narabazi.tileUrl, function(tilejson) 
{
  var defaultIcon = Narabazi.getDefaultIcon();
        
  // create the map
  Narabazi.map = new L.Map('map')
    // add our tile
    .addLayer(new wax.leaf.connector(tilejson))
    // center it on our tiles center
    .setView(new L.LatLng(tilejson.center[1], tilejson.center[0]), tilejson.center[2]);

  // display the geo json nodes on the map
  Narabazi.getGeoJson(Narabazi.geoJsonUrl);

  // add a click watcher to the map and call the 'onMapClick' function when fired.
  // note this 'on' function will pass an even into the callback function
  Narabazi.getMap().on('click', Narabazi.onMapClick);

});
