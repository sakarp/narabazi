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
      Narabazi.core("authClicked").publish();
    });


  }

  Narabazi.core("authUpdateCompleted").subscribe(setAuthButtonText);
  
  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    setupObservers:          setupObservers

    
  } // end public, aka: revealed section
}(Narabazi));