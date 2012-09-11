asyncTest( "Login test!", function() {
  expect( 1 );
 
  NarabaziBackend.updateAuth({ callback: function() {
    ok( true, "Server logged in successfully!" );
    start();
  }});
  
});