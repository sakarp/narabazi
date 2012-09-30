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
NarabaziLink = (function (controller) {
  // private stuff 
  var typesOfLinks, // the list of all avaiable types 

    /**
    * Object structure to use for generating the link form
    */
    linkDetails = {
      title  : "",
      link    : "",
      type   : "none"
	  };

  $.ajax({
    url: controller.url().linkTypes,
    dataType: 'json'
  })
    .done(function (response) {
      controller.message("NarabaziLink: types received", 1);
      typesOfLinks = response;
    });

  controller.message("NarabaziLink: link management setup", 2);

  // methods exposed to public, via the revealing module pattern.
  return { // these methods are accessed to themselves via this.xx
    getTypes:   typesOfLinks,
    getDetails: linkDetails

  }; // end public, aka: revealed section
}(Narabazi));