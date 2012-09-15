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
  var init = false; // has auth been initialised 
  var auth = false; // authentication state with server
  
  var urls = {
    check:  'authed',
    logout: 'logout',
    login:  'login_check'
  };
  
  var credentials = {
    user: 'user',
    pass: 'userpass'  
  }
  
  function buttonState(state) {
    // activate or disable the login button  
    controller.message('Setting the button state to: ' + state, 1);    
  }
  
  /**
  * Get the auth state from the server.
  * @param options object
  *               .state    = state to force (not state set then server is quererd) 
  *               .callback = function to run on success
  *
  */
  function updateAuth(options) {
    controller.message('Update authed called', 2);
    if(options && options.state!=undefined) {
      controller.message('Setting auth state manually: ' + options.state, 1);
      return $.Deferred(function(dfd){ 
        auth = options.state; dfd.resolve();
      });
    }
    else {
      buttonState(false); // disable the button for this longer call
      controller.message('Requesting state from server...', 1);
      return $.ajax( { // request all links from the data controller
        url: getUrl('check'),
        type: 'post',
        dataType: 'json'
      })
      .done(function(response) { 
        controller.message('Authed state from server: ' + response.state, 1);
        // set the state
        auth = response.state;
      })
      .fail(function(response) {
        controller.message('Error getting auth from server', 0);
      })
      .always(function() {
        Narabazi.message('Auth check finished, setting internal state', 2);
        NarabaziBackendDom.setAuthButtonText(auth);
        buttonState(true); // re-enable the button
      })
    }
  }
   
  /**
  * Get the local auth state
  *
  * @reutrn boolean
  */
  function getAuth() {
    return auth;  
  }
  
   /**
  * Get a url
  *
  * @reutrn string
  */
  function getUrl(name) {
    return Narabazi.getBaseUrl() + urls[name];  
  }  
  
  /**
  * Get the credentials
  *
  * @reutrn array
  */
  function getCredentials() {
    return credentials;  
  }  
  
  /**
  * Process a map click event:
  * Draw a marker at the click location and
  * attempt to save it in our database
  *
  * @param e   - map click event
  */
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

  /**
  * Display the heads up info for this marker
  *
  * @param Marker - Leaflet Marker object
  */
  function markerClickedAction(marker) {
    Narabazi.message('Location clicked: ' + marker, 2);
    // show the info divs
    $(".infoDiv").show();

    // update the template to reflect this marker (jsRender & jsViews)
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
      url: Narabazi.url().links+'/'+marker.feature.properties.id+'.json',
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
              url: Narabazi.url().linkRemove+'/'+id,
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
                url: Narabazi.url().linkAdd+'/'+marker.feature.properties.id,
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
      
  };
  
  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    onMapClick:          saveAndDrawLocation,
    markerClickedAction: markerClickedAction,
    updateAuth:          updateAuth,
    getAuth:             getAuth,
    getUrl:              getUrl
    
  } // end public, aka: revealed section
}(Narabazi));