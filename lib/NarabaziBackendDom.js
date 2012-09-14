var NarabaziBackendDom = {
  setAuthButtonText: function(active) {
  	$('#login_box_text').text(active?'Deauthenticate':'Authenticate');
  }
}