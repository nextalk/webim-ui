module("ui.chat");

test("webim.ui.chat autoLinkUrls", 3, function() {
	var msg = "Hello world.![EVE](https://github.com/zzdhidden/EVE/raw/master/eve.png)(https://secure.gravatar.com/avatar/a128ed994fdba3004a713314a840204c?s=140)..";
	var out = autoLinkUrls(msg, {target:"_blank"});
	ok( out == 'Hello world.<a href="https://github.com/zzdhidden/EVE/raw/master/eve.png" target="_blank"><img src="https://secure.gravatar.com/avatar/a128ed994fdba3004a713314a840204c?s=140" alt="EVE"/></a>..', "Img with thumbnail");

	var re = /(https?:\/\/|www\.)([^\s<]+)|\!\[([^\]]*)\]\(([^\)]+)\)(\(([^\)]+)\))?/ig;
	var res;
	while( res = re.exec(msg) ) {
		//console.log( res );
	}
	msg = "Hello world.![EVE](https://github.com/zzdhidden/EVE/raw/master/eve.png)..";
	out = autoLinkUrls(msg, {target:"_blank"});
	ok( out == 'Hello world.<a href="https://github.com/zzdhidden/EVE/raw/master/eve.png" target="_blank"><img src="https://github.com/zzdhidden/EVE/raw/master/eve.png" alt="EVE"/></a>..', "Img");
	var out = autoLinkUrls(msg, {target:"_blank"});
	while( res = re.exec(msg) ) {
		//console.log( res );
	}
	msg.replace( re, function( a ) {
		//console.log( a );
		//console.log( arguments );
	} );
	msg = "Hello world.( https://github.com/zzdhidden/EVE/raw/master/eve.png )..";
	out = autoLinkUrls(msg, {target:"_blank"});
	ok( out == 'Hello world.( <a href="https://github.com/zzdhidden/EVE/raw/master/eve.png" target="_blank">https://github.com/zzdhidden/EVE/raw/master/eve.png</a> )..', "Url");

	msg.replace( re, function( a ) {
		//console.log( a );
		//console.log( arguments );
	} );

});

