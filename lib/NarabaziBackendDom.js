/**
* Narabazi Backend Dom
*
* @author code-karkhana
* @location kathmandu
*
* The dom module: to manage all drawing
*
*/
NarabaziBackendDom = (function(controller) {

  function setAuthButtonText(active) {
    controller.message('NarabaziBackendDom: Setting logon button state to: ' + active, 1);    	
    $('#login_box_text').show();
    $('#loading_icon').hide();
  	$('#login_box_text').text(active?'Deauthenticate':'Authenticate');
  }

  function loading(active) {
  	if(active) {
      $('#login_box_text').hide(); 
      $('#loading_icon').show();
    }else {
      $('#login_box_text').show();
      $('#loading_icon').hide();
    }
  }

  function buttonState(state) {
    // activate or disable the login button  
    controller.message('Setting the button state to: ' + state, 1);    
  }

  function drawAddForm(id)
  {

    
  }

  function drawLinks(links, marker) {
    controller.message('NarabaziBackendDom: Drawing links', 2);

        // join the link list data to the link_list div
        $.link.linkTemplate("#link_list", links)
          .off("click", ".button_link_delete") // remove any old events
          .on("click", ".button_link_delete", function(e) {
            id = $(e.target).attr('_data'); // get the id from the _data field in the div
            controller.message('Deleting link: ' + id, 1);
            reqwest ({ // when clicked send the data to be saved
              target: $(e.target), // save for success fuction
              url: controller.url().linkRemove+'/'+id,
              method: 'post',
              success: function (response) { 
                // remove link stuff
                controller.message('Removing display link with id: ' + response, 2);
                this.target.parent().remove();
              }
            });            
          })
          .off("click", "#button_link_add") // remove any ones from previous links
          .on("click", "#button_link_add", function() {
            controller.message('Getting link form for: ' + marker.feature.title, 2);
            // show the addLink template for this location
            $.link.addLinkTemplate( "#link_add", NarabaziLink.getDetails, NarabaziLink );
            // in the link template when the 'add' link button is pressed
            $("#submitAddLink").on( "click", function() {
              controller.message('Saving link for location: ' + marker.feature.properties.id, 1);
              reqwest ({ // when clicked send the data to be saved
                url: controller.url().linkAdd+'/'+marker.feature.properties.id,
                method: 'post',
                // send the click events data
                data: NarabaziLink.getDetails,
                // q: true },
                success: function (response) { 
                  controller.message('Link added with id: ' + response, 1);
                  // now clear and reset the form
                  $('#linkAddForm')[0].reset();
                  $('#linkAddOptions').hide();
                  // something like this we need to do now
                  //$.view(this).refresh();
                }
              });

            });    
          });
  }

  /**
  * Display the heads up info for this marker
  *
  * @param Marker - Leaflet Marker object
  */
  function mapLocationClicked(marker) {
    controller.message('NarabaziBackendDom: Draw location called: ' + marker.feature.properties.id, 2);

    // show the info divs
    $(".infoDiv").show();

    // update the template to reflect this marker (jsRender & jsViews)
    $.link.infoTemplate("#left_info", marker.feature.properties)
      .off("click", "#button_delete") // remove any old events
      // attach the delete action to the new delete button
      .on( "click", "#button_delete", function() {
         controller.core("markerDeleteClicked").publish(marker);
         // and hide the info window
         $(".infoDiv").hide();
      });

    controller.message('NarabaziBackendDom: Requesting links..', 1);
    reqwest ({ // request all links from the data controller
      url: controller.url().links+'/'+marker.feature.properties.id+'.json',
      type: 'json',
      success: function(data) {
        controller.message('NarabaziBackendDom: Loading links..', 1);
        drawLinks(data, marker);
      },
      error: function(data) { 
        controller.message('NarabaziBackendDom: Error in geoJson', 0); 
      } 
    });

  }

  /**
  * Assign the dom click observer functions
  *
  */
  function setupObservers() {
    // the info close button
    $('#button_close').click(function(e) {
      $(".infoDiv").hide();
    });

    // de/authenticate button  
    $('#login_box_button').click(function(e) {
      loading(true);
      controller.core("authClicked").publish();
    });

  }

  controller.core("authUpdateCompleted").subscribe(setAuthButtonText);
  controller.core("showMarkerInfo").subscribe(mapLocationClicked);

  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    setupObservers:          setupObservers
    
  } // end public, aka: revealed section
}(Narabazi));