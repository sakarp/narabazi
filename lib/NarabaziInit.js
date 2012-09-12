/*******************************************
* This is the main call to start us running.
*
*/ 
$(function() {
  // some files we will load via head
  head.js("lib/wax/ext/leaflet-src.js", // wax: extra controls for the map etc
          "lib/wax/dist/wax.leaf.js",   // leaflet styles: the tile importer
          "lib/Narabazi.js",
          "lib/jsrender.js",
          "lib/jquery.views.js"
         );
  
  modulesLoading = new $.Deferred(); // the promise we need in a global scope
  
  // now load narabazi to get the list of required modules
  head.ready("Narabazi.js", function() {
    Narabazi.message('Narabazi loaded, now starting to load modules..', 1);

    // load our modules and files we need
    modulesLoading = Narabazi.init({env: 'dev', mode: 'backend', debug: 2});
    modulesLoading.resolve()
  });   
$.when(modulesLoading).then(function(){console.log('ddd')});
  head.ready('jsrender.js', function() {
    // define our templates for jsrender
    $.templates({
      infoTemplate: "#infoTemplate",
      linkTemplate: "#linkTemplate",
      addLinkTemplate: "#addLinkTemplate"
    });
  })
  
  // the info close button
  $('#button_close').click(function(e){
    $(".infoDiv").hide();
  });
  
  // the login box in the top left  
  $('#login_box_button').click(function(e){
    $('#login_box_text').text(''); // reset the loading image
    if(NarabaziBackend.getAuth()===true) { // if we are logged in
      var def = $.Deferred();
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
  
  /*    
$.when(modulesLoading.promise(), updatingAuth).then(function(){
  NarabaziBackend.init = true;
  // set out init state
  this.status = true;   
})    
 
      if(this.options.mode == 'backend') {
        // on initial app loading, check the login state
        updatingAuth = NarabaziBackend.updateAuth();
        updatingAuth.done(function(){
          // when the state is checked, update it accordingly
          Narabazi.message('Auth finished, setting internal state', 2);
          // ie: if authenticated, then show us the de-auth option 
          if(NarabaziBackend.getAuth()===true) {
            $('#login_box_text').text('X');
          }
        })
      }
    */    
modulesLoading.fail(function(){ console.log('Failedddd'); });
modulesLoading.done(function(){
//$.when(modulesLoading).then(function() {
  console.log('DDDD');
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
    Narabazi.getMap().on('click', NarabaziBackend.onMapClick);
  }); // map tile ready
  
}); // modules loaded

}); // dom ready function