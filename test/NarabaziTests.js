$(document).ready(function(){
  
module( "group a" );

test('Set Up Tests', function() {
  ok(Narabazi, "Narabazi wrapper is exists and is not undefined");
});

// this is not good we should not list this here
test( "GeoJson Shell", function() {
  var s = {
    "features": [],
    "type": "FeatureCollection"
  };
  ok( typeof Narabazi.getGeoJsonShell() == 'object', "GeoJson shell can be retieved correctly" );
});

test( "Get url string", function() {
  ok( typeof Narabazi.url().tile == 'string', "We can get back a url of a string." );
});

test( "Baseurl", function() {
  // get the prod url by default
  equal(Narabazi.options.prodUrl, Narabazi.getBaseUrl(), 'the baseurl for the default env is correct');
  
  Narabazi.options.env = 'dev';
  equal(Narabazi.options.devUrl, Narabazi.getBaseUrl(), 'the baseurl for the dev env matches');

  var reg = new RegExp("^"+Narabazi.options.devUrl+".*");
  ok(reg.test(Narabazi.url().locations), 'getting a url comes in the right env');

  Narabazi.options.env = 'prod';
  equal(Narabazi.options.prodUrl, Narabazi.getBaseUrl(), 'changing back to prod env is correct');

});


module( "group b" );

});