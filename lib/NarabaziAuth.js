/**
* Narabazi Auth
*
* @author code-karkhana
* @location kathmandu
*
* The auth module: to authenticate the app with the data server
*
*/
NarabaziAuth = (function(controller) {

  var state = false; // has auth been initialised 
  var auth  = false; // authentication state with server
  
  var urls = {
    check:  'authed',
    logout: 'logout',
    login:  'login_check'
  };
  
  var credentials = {
    user: 'user',
    pass: 'userpass'  
  }
  
  /**
  * Get the credentials
  *
  * @return array
  */
  function getCredentials() {
    return credentials;  
  }

  function login() {
    return $.ajax( { 
        url: controller.getBaseUrl()+urls.login,
        type: 'post',
        data: { '_username': credentials.user, '_password': credentials.pass },
      })
  }

  function logout() {
    return $.ajax( {
        url: controller.getBaseUrl()+urls.logout,
        type: 'post'
      })
  }

  /**
  * Change the current auth state to its opposite.
  * 
  */
  function toggleAuth() {
    controller.message('NarabaziAuth: ToggleAuth from: ' + auth, 1);
    var request;
    if(auth===true) { // if we are logged in
      controller.core("logoutStarted").publish();
      request = logout().done(function(){
        updateAuth({state: false}); // set out state as logged out
      })
    }else { // if we need to login
      request = login().done(function(response) {
      	updateAuth(response);
      })
      .fail(function(response) {
        controller.message('NarabaziAuth: Error making auth request: ' + response, 0);
      })
    }

    request.always(function(){
      controller.core("authUpdateCompleted").publish(auth);
    })
  }

  /**
  * Get the auth state from the server.
  * @param options object
  *               .state    = state to force (not state set then server is quererd) 
  */
  function updateAuth(options) {
    controller.message('NarabaziAuth: Update Auth called', 2);
    controller.core("authUpdateCalled").publish();
    if(options && options.state!=undefined) {
      controller.message('NarabaziAuth: Setting auth state manually: ' + options.state, 1);
      // def not required, here for testing only
      return $.Deferred(function(dfd){ 
        auth = options.state; dfd.resolve();
      });
    }
    else {
      //buttonState(false); // disable the button for this longer call
      controller.message('NarabaziAuth: Requesting state from server...', 1);
      return $.ajax( { // request all links from the data controller
        url: controller.getBaseUrl()+urls['check'],
        type: 'post',
        dataType: 'json'
      })
      .done(function(response) { 
        controller.message('NarabaziAuth: Authed state from server: ' + response.state, 1);
      })
      .fail(function() {
        controller.message('NarabaziAuth: Error getting auth from server', 0);
      })
      .always(function(response) {
        auth = response.state; // set the state
        controller.message('NarabaziAuth: Auth check finished, setting internal state', 2);
        controller.core("authUpdateCompleted").publish(auth); // let the dom watch know
      });
    }
  }

  /**
  * Add the watchers to make this puppy purr
  *
  *
  */
  function init() {
    controller.core("authClicked").subscribe(toggleAuth);
  }

  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
  	init:        init,
    updateAuth:  updateAuth,
    login:       login,
    logout:      logout

  } // end public, aka: revealed section
}(Narabazi));