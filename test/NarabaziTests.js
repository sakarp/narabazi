test( "GeoJson Shell", function() {
  ok( Narabazi.getGeoJsonShell() == Object, "Passed!" );
});



test( "Appends a div", function() {
  var $fixture = $( "#qunit-fixture" );
 
  $fixture.append( "<div>hello!</div>" );
  equal( $( "div", $fixture ).length, 1, "div added successfully!" );
});