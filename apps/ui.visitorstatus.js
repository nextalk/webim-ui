/* 
* ui.visitorstatus
*
* Show visitor's from site and location in status.
* Auto send from site and location when first message if changed.
*
* options:
*
* methods:
* 
* events: 
* 
*/

app("visitorstatus", {
	init: function(options){
		var ui = this, im = ui.im, status = im.status;
		var last_from = status.get("v_f"),
		last_location = status.get("v_l"),
		current_from = document.referrer,
		current_location = document.location.href,
		location_host = document.location.host;
		if (current_from && current_from != last_from){
			ex = /\/\/([^\/]+)/.exec(current_from);
			var from_host = ex && ex[1];
			if(from_host && from_host != location_host){
				//Change from.
				status.set("v_f", current_from);
			}else{
				current_from = last_from;
			}
		}else{
			current_from = last_from;
		}
		if (current_location != last_location){
			status.set("v_l", current_location);
		}

		ui.visitorstatus = current_location + ( current_from ? (" | " + i18n("from") + " " + current_from) : "");
		var current_sent = {};
		im.bind( "sendMsg" , function( e, msg ){
			var key = "v_to_" + msg.to;
			//Send once.
			if ( !current_sent[key] ){
				current_sent[key] = true;
				var body = "", sent = im.status.get(key);
				if( !sent || current_location != last_location || current_from != last_from ){
					im.status.set(key, 1);
					body = i18n("location") + ": " + current_location;
					if ( current_from && ( !sent || current_from != last_from )){
						body += " \n " + i18n("from") + ": " + current_from;
					}
				}
				if( body ){
					im.sendMsg(extend({}, msg, {"body": body, "transient": true}));
				}
			}
		});
	},
	ready: function( param ) {
		param.visitorstatus = this.visitorstatus;
	}
});

