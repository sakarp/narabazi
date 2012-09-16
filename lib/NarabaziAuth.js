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

  function login() {
    return $.ajax( { 
        url: Narabazi.getUrl('logout'),
        type: 'post'
      })
  }

  function logout() {
    return $.ajax( { 
        url: Narabazi.getUrl('logout'),
        type: 'post'
      })
  }

  /**
  * Get the auth state from the server.
  * @param options object
  *               .state    = state to force (not state set then server is quererd) 
  *               .callback = function to run on success
  *
  */
  function updateAuth(options) {
    controller.message('NarabaziAuth: Update Auth called', 2);
    Narabazi.core("authUpdateCalled").publish();
    if(options && options.state!=undefined) {
      controller.message('NarabaziAuth: Setting auth state manually: ' + options.state, 1);
      // def not required, here for testing
      return $.Deferred(function(dfd){ 
        auth = options.state; dfd.resolve();
      });
    }
    else {
      //buttonState(false); // disable the button for this longer call
      controller.message('NarabaziAuth: Requesting state from server...', 1);
      return $.ajax( { // request all links from the data controller
        url: Narabazi.getBaseUrl()+urls['check'],
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
        Narabazi.message('NarabaziAuth: Auth check finished, setting internal state', 2);
        Narabazi.core("authUpdateCompleted").publish(auth); // let the dom watch know
      });
    }
  }


  function changeAuth() {
    Narabazi.message('NarabaziAuth: Change Auth call', 1); 
  }
  
  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    updateAuth:          updateAuth,

    changeAuth:          changeAuth

  } // end public, aka: revealed section
}(Narabazi));