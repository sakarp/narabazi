/**
* NarabaziLink
*
* @author code-karkhana
* @location kathmandu
*
* The link object wrapper
*
*/
var narabaziLink = (function()
{
  // private stuff 
  var types = []; 

  /**
  * Object structure to use for generating the link form
  *
  */
  var linkDetails =  
  {
    title      : "",
    link        : "",
    selectedType: "none"
	};

  if(types.length===0)
  {
    // request the data object from the server
    
    // for now we will just hard code.
    types = 
    [
  		{
  			name: "Youtube"
  		},
  		{
  			name: "Facebook image"
  		},
  		{
  			name: "Flickr"
  		}
  	];
  
    console.log("Static link types loaded");
  }

  console.log("Narabazi link management setup");


  // methods exposed to public
    return { // these methods are accessed via this.xx 
        getTypes: function() {
            return types;
        },
        addItem: function(values) {
            basket.push(values);
        },
        getTotal: function(){
//           var q = this.getItemCount(),p=0;
              return 1;
        },

	
	/**
	* Return the current type of this object
	*/
	selectedType: function(selected)
	{
		return (linkDetails.selectedType!=="none") ? types[selected].name : "";
	},

  /**
  *  Utility function
  */
	and: function(a, b) 
	{
    return !!a && !!b;
	}


    }
}());