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
  
  /**
  * Get the auth state from the server.
  * @param options object
  *               .state    = state to force (not state set then server is quererd) 
  *               .callback = function to run on success
  *
  */
  function updateAuth(options) {
    controller.message('Update authed called, optional set state: ' + options.state, 2);
    if(options.state!=undefined) {
      controller.message('Setting state manually: ' + options.state, 1);
      this.auth = options.state;
    }
    else {
      controller.message('Requesting state from server...', 1);
      reqwest ({ // request all links from the data controller
        url: 'http://localhost/discontented/web/app_dev.php/authed',
        method: 'post',
        type: 'json',
        success: function (response) { 
          controller.message('Authed state from server: ' + response.state, 1);
          // set the state
          NarabaziBackend.auth = response.state;
          if(options.callback) options.callback(); // run the callback if there is one.
        },
        error: function (response) { 
          controller.message('Error getting auth from server', 0);
        }
      });
    }
  }    

  /**
  * Get the local auth state
  *
  * @reutrn boolean
  */
  function getAuth() {
    return this.auth;  
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

    // update the template to reflect this marker (jsRenderer & jsViews)
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
    getAuth:             getAuth
    
  } // end public, aka: revealed section
}(Narabazi));

/**
* This is the main call to start us running.
*
*/ 
$(function() { // load when the dom is ready
  // define our templates for jsrender
  $.templates({
    infoTemplate: "#infoTemplate",
    linkTemplate: "#linkTemplate",
    addLinkTemplate: "#addLinkTemplate"
  });
  
  // the info close button
  $('#button_close').click(function(e){
    $(".infoDiv").hide();
  });
<<<<<<< HEAD
  
  Narabazi.env = 'Prod'; // we can overight the env here if needed 
=======
    
  // the login box in the top left  
  $('#login_box_button').click(function(e){
    $('#login_box_text').text('');
    if(NarabaziBackend.getAuth()===true) {
      reqwest ({ // request all links from the data controller
        url: 'http://localhost/discontented/web/app_dev.php/logout',
        method: 'post',
        data: false,
        type: 'json'        
      });
      NarabaziBackend.updateAuth({state: false});
      $('#login_box_text').text('A');      
    }
    else{
      // fake it being fast and just add us an a.
      $('#loading_icon').show();
      reqwest ({ // request all links from the data controller
        url: 'http://localhost/discontented/web/app_dev.php/login_check',
        method: 'post',
        data: { '_username': 'user', '_password': 'userpass' },
        type: 'json',
        success: function (response) { 
          NarabaziBackend.updateAuth(response.state);
          $('#loading_icon').hide();
          $('#login_box_text').text('X');
          Narabazi.message('Authed: ' + response.state, 2);
        },
        error: function (response) { 
          Narabazi.message('Error making auth request: ' + response, 0);
          // if there is an error, then revert the button
          $('#login_box_text').text('A');
        }
      });
    }
  });

  NarabaziBackend.updateAuth({ callback: function() {
    Narabazi.message('Auth finished, setting internal state', 2);

    // if authenticated, then show us the de-auth option 
    if(NarabaziBackend.getAuth()===true) {
      $('#login_box_text').text('X');
    }
    
    NarabaziBackend.init = true;
  }});
     
  //Narabazi.env = 'Prod'; // we can overight the env here if needed 
>>>>>>> afc837d5dc20af85d915949575bdb6ff288ce62b
  wax.tilejson(Narabazi.url().tile, function(tilejson) {
    // create the map
    Narabazi.map = new L.Map('map')
      // add our tile
      .addLayer(new wax.leaf.connector(tilejson))
      // center it on our tiles center
      .setView(new L.LatLng(tilejson.center[1], tilejson.center[0]), tilejson.center[2]);

    // overwrite the 'marker' click action, with our one
    Narabazi.markerClickedAction = NarabaziBackend.markerClickedAction;

    // load our modules and display a blank layer
    Narabazi.init();
   
    // get the geo json nodes from our server and display them on the map
    Narabazi.getGeoJson();
    
    // add a click watcher to the map and call the 'onMapClick' function when fired.
    // note this 'on' function will pass an event into the callback function
    Narabazi.getMap().on('click', NarabaziBackend.onMapClick);
  });
  
});