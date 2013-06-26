/* 
 * ui.logmsg
 *
 * Log user message to db.
 *
 * options:
 *
 * methods:
 * 
 * events: 
 * 
 */

app("logmsg", function(options){
	var ui = this, im = ui.im;
	im.bind("message",function(e, messages){
		for (var i = 0; i < messages.length; i++) {
			var msg = messages[i];
			msg.ticket = im.data.connection.ticket;
			ajax( {
				type: "get",
				url: route( "logmsg" ),
				cache: false,
				dataType: "jsonp",
				data:msg
			} );
		};
	});
});

