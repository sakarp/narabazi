/**
* Narabazi Core
*
* @author code-karkhana rekarnar
* @location kathmandu
* @credits http://addyosmani.com/blog/jquery-1-7s-callbacks-feature-demystified/
*
* The Pub/Sub core.
*
*/
Narabazi.stack = {};
Narabazi.core = (function(id) {

  var callbacks, 
      method,
      item = id && Narabazi.stack[ id ];

  if ( !item ) {
    callbacks = jQuery.Callbacks();
    item = {
      publish: callbacks.fire,
      subscribe: callbacks.add,
      unsubscribe: callbacks.remove
    };
    if ( id ) {
      Narabazi.stack[ id ] = item;
    }
  }
  return item;
})();