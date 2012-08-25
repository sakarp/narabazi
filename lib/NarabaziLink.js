NarabaziLink   = 
{
  _types: null,
  
  types: function()
  {
    if(this._types==null)
    {
      // request the data object from the server
      
      // for now just hard code.
      this._types = 
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
    
    }
    return this._types;
  },
  
  getTypes: function()
  {
    return this._types;    
  },
  
  linkDetails: 
  {
    title: "",
    link: "",
    selectedType: "none"
	},
	
	selectedType: function(selectedType)
	{
		return (selectedType!=="none") ? this._types[selectedType].name : "";
	},

	and: function(a, b) 
	{
    return !!a && !!b;
	}
}