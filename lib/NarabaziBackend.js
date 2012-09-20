/**
* NarabaziBackend
*
* @author code-karkhana
* @location kathmandu
*
* The backend object module: to manage things
*
*/
NarabaziBackend = (function(controller) {

  /**
  * Process a map click event:
  * Draw a marker at the click location and
  * attempt to save it in our database
  *
  * @param e   - map click event
  */
  function saveAndDrawLocation(e) {
    controller.message('Map click received at: ' + e.latlng, 1);

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
    // .done(function(r) {
      // controller.message('Marker saved successfully', 2);
      // console.log(r);
    // })
    .fail(function(r) {
      controller.message('Saving marker failed', 0);
      console.log(r);
      //setIcon
    })
  };

  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    saveAndDraw:         saveAndDrawLocation

  } // end public, aka: revealed section
}(Narabazi));