/**
* NarabaziFrontend
*
* @author code-karkhana
* @location kathmandu
*
* The frontend module: to display stuff
*
*/
NarabaziFrontend = (function(controller) {
  // private stuff 
  controller.message("Narabazi frontend setup", 2);
  
  function init(msg)
  {
    controller.message("FRONTEND SETUP: " + msg, 0);
  }

  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    go: init
    
  } // end public, aka: revealed section
}(Narabazi));

/**
* This is the main call to start us running.
*
*/ 
$(function() { // load when the dom is ready
  NarabaziFrontend.go('NOT DONE');
});