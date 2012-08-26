/**
* NarabaziLink
*
* @author code-karkhana
* @location kathmandu
*
* The link object module
* Used to create link objects for locations.
*
*/
NarabaziLink = (function(controller) {
  // private stuff 
  var typesOfLinks = []; // the list of all avaiable types 

  /**
  * Object structure to use for generating the link form
  *
  */
  var linkDetails = {
    title  : "",
    link    : "",
    type   : "none"
	};

  // on init, setup some of the data structure
  if (typesOfLinks.length===0) {
    // request the data object from the server
    
    // for now we will just hard code.
    typesOfLinks = [
  		{ name: "Youtube" },
  		{	name: "Facebook image" },
  		{	name: "Flickr" }
  	];
  
    controller.message("Static link types loaded", 2);
  }

  controller.message("Narabazi link management setup", 2);

  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx

    getTypes: typesOfLinks,
    getDetails: linkDetails,

  } // end public, aka: revealed section
}(Narabazi));