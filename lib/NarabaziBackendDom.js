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

  function setupObservers() {

    // the info close button
    $('#button_close').click(function(e) {
      $(".infoDiv").hide();
    });

    // de/authenticate button  
    $('#login_box_button').click(function(e) {
      NarabaziBackendDom.loading(true);
      Narabazi.core("authClicked").publish();
    }
      if(NarabaziBackend.getAuth()===true) { // if we are logged in
        Narabazi.core("logout").publish();
        NarabaziBackend.updateAuth({state: false}); // set out state as logged out
        NarabaziBackendDom.setAuthButtonText(false); // change the button to show login
      }
      else{ // if we need to login
        reqwest ({ // send the login request
          url: Narabazi.getUrl('login'),
          method: 'post',
          data: { '_username': 'user', '_password': 'userpass' },
          type: 'json',
           success: function (response) { 
            // when login is done, update our state and change the button
            NarabaziAuth.updateAuth(response);
            NarabaziBackendDom.setAuthButtonText(true);
            Narabazi.message('Authed: ' + response.state, 2);
          },
          error: function (response) { 
            Narabazi.message('Error making auth request: ' + response, 0);
            // if there is an error, then revert the button
            NarabaziBackendDom.setAuthButtonText(false);
          }    
        });
      }
    })

  }

  Narabazi.core("authUpdateCompleted").subscribe(setAuthButtonText);
  Narabazi.core("authClicked").subscribe();
  Narabazi.core("logout").subscribe(logout);

  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    setupObservers:          setupObservers,

    
  } // end public, aka: revealed section
}(Narabazi));