/*******************************************
* This is the main call to start us running.
*
*/ 
$(function() {
  // add the template libs we need
  $.merge(Narabazi.modules, ['lib/jquery.views.js', 'lib/jsrender.js']);

  // load our modules and files we need
  Narabazi.init({env: 'dev', mode: 'backend', debug: 2});
  
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
  
  // the login box in the top left  
  $('#login_box_button').click(function(e){
    $('#login_box_text').text(''); // reset the loading image
    if(NarabaziBackend.getAuth()===true) { // if we are logged in
      reqwest ({ // the send the logout call
        url: NarabaziBackend.getUrl('logout'),
        method: 'post',
        data: false,
        type: 'json'        
      });
      NarabaziBackend.updateAuth({state: false}); // set out state as logged out
      $('#login_box_text').text('A'); // change the button to show login
    }
    else{ // if we need to login
      $('#loading_icon').show();
      reqwest ({ // send the login request
        url: NarabaziBackend.getUrl('login'),
        method: 'post',
        data: { '_username': 'user', '_password': 'userpass' },
        type: 'json',
        success: function (response) { 
          // when login is done, update our state and change the button
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
    Narabazi.getMap().on('click', NarabaziBackend.onMapClick);
  });
  
});