var Narabazi.stack = {};

Narabazi.core = function( id ) {
  var callbacks, method,
  item = id && Narabazi.stack[ id ];
  if ( !item ) {
    callbacks = jQuery.Callbacks();
    item = {
      publish: callbacks.fire,
      subscribe: callbacks.add,
      unsubscribe: callbacks.remove
    };
    if ( id ) {
      Narabazi.stack[ id ] = item
    }
  }
  return item
};