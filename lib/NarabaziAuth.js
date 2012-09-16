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
  
  /**
  * Get the credentials
  *
  * @reutrn array
  */
  function getCredentials() {
    return credentials;  
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
      //buttonState(false); // disable the button for this longer call
      controller.message('Requesting state from server...', 1);
      return $.ajax( { // request all links from the data controller
        url: Narabazi.getBaseUrl()+'check',
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

  function changeAuth() {
    Narabazi.message('Change auth call in Narabazi Core', 1); 
  }
  
  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    updateAuth:          updateAuth,
    getAuth:             getAuth,
    changeAuth:          changeAuth

  } // end public, aka: revealed section
}(Narabazi));