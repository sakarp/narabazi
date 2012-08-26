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
  saveNewLocation: function(marker) {
    // get the coords from the json object
    latlng = marker.features[0].geometry.coordinates;
    controller.message('Saving new location: ' + latlng, 2);
    
    reqwest ({
      markerStore: marker,
      url: controller.url.locationAdd,
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
  deleteLocation: function(marker) {
    controller.message('Deleting marker: ' + marker.feature.properties.name, 2);

    reqwest ({ // fire our ajax'y thing
      url: controller.url.locationRemove+'/'+marker.feature.properties.id,
      method: 'post',
      // send the click events data
      data: { id: marker.feature.properties.id, q: true },
      // if you want to send an array, use this:
      //  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
      // this is called after the saving is completed:
      success: function(resp){ controller.message('Removed node: '+resp, 1); }
    });
  };
  
  undraw: function(marker) {
     controller.message('Removing marker: ' + marker, 2);
     // when clicked, remove the marker from the map
     controller.getMap().removeLayer(marker);
     // and ask the server to delete it too
     deleteNode(marker);
  };
  
  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx

    save   : saveNewLocation,
    delete: deleteLocation,

  } // end public, aka: revealed section
}(Narabazi));