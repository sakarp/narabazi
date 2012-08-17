// declare our endpoints:

// the map to use from MapBox (the TileJSON endpoint)
var url          = 'http://a.tiles.mapbox.com/v3/rekarnar.map-3ryvuu7n.jsonp';
// our geo json data
var geoJson      = 'http://localhost/discontented/web/app_dev.php/json';
// where to send our new nodes to save them
var saveNodesUrl = 'http://localhost/discontented/web/app_dev.php/add';

// Get metadata about the map from MapBox
wax.tilejson(url, function(tilejson) 
{
  // Define a custom icon using the Maki museum icon
  var MuseumIcon = L.Icon.extend({options:{
    iconUrl: 'images/maki/town-hall-24.png',
    shadowUrl: null,
    iconSize: new L.Point(24, 24),
    shadowSize: null,
    iconAnchor: new L.Point(12, 24),
    popupAnchor: new L.Point(0,-24)
  }}); 

  // set this ican as the default
  var defaultIcon = new MuseumIcon();

  // get our geo json from whereever it is via reqwest
  var displayGeoJson = function(url)
  {
    reqwest((url.match(/geojsonp$/)) ? {
      url: url + (~url.indexOf('?') ? '&' : '?') + 'callback=grid',
      type: 'jsonp',
      jsonpCallback: 'callback',
      success: setup_geoJson,
      error: setup_geoJson
    } : {
      url: url,
      type: 'json',
      success: setup_geoJson,
      error: setup_geoJson
    });  
  }
  
  var setup_geoJson = function(data) {
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
     }).addTo(map);
        // if we want the layer we can do it this way
//      var layer = L.geoJson().addTo(map);
//      layer.addData(data);
  }
        
  // create the map
  var map = new L.Map('map')
    // add our tile
    .addLayer(new wax.leaf.connector(tilejson))
    // center it on our tiles center
    .setView(new L.LatLng(tilejson.center[1], tilejson.center[0]), tilejson.center[2]);

  // display the geo json nodes on the map
  displayGeoJson(geoJson);


function onMapClick(e) {
//    popup.setLatLng(e.latlng)
//        .setContent("You clicked the map at " + e.latlng.toString())
//        .openOn(map);
  //console.log(e.latlng);
  var marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
  saveNewNodes(e.latlng);
}

function saveNewNodes(latlng)
{
  reqwest({
       url: saveNodesUrl
     , method: 'post'
     , data: { name: 'test', lat: latlng.lat, lon: latlng.lng, q: true }
     //  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
     , success: function (resp) {
         //qwery('#content').html(resp)
         //console.log(resp);
       }
  });
}

map.on('click', onMapClick);
// manual marker add
//var marker = L.marker([51.5, -0.09]).addTo(map);
//marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

});
