(function(webim){
	webim.ui.ready(function(){
		var log = webim.log;
		var _path = "http://p1.com/webim/service/";
		//_path = "http://shopim.webim20.cn/";
		webim.extend( webim.setting.defaults.data, {
			play_sound: true,
			minimize_layout: true,
			buddy_sticky: true
		} );

		webim.route( {
			online: _path + "im.php?webim_action=online",	
			offline: _path + "im.php?webim_action=offline",	
			deactivate: _path + "im.php?webim_action=refresh",	
			message: _path + "im.php?webim_action=message",	
			presence: _path + "im.php?webim_action=presence",	
			status: _path + "im.php?webim_action=status",	
			setting: _path + "im.php?webim_action=setting",	
			history: _path + "im.php?webim_action=history",	
			clear: _path + "im.php?webim_action=clear_history",	
			download: _path + "im.php?webim_action=download_history",	
			members: _path + "im.php?webim_action=members",	
			join: _path + "im.php?webim_action=join",	
			leave: _path + "im.php?webim_action=leave",	
			buddies: _path + "im.php?webim_action=buddies",	
			notifications: _path + "im.php?webim_action=notifications",
			upload: "../images/upload.php",
			logmsg: _path + "im.php?webim_action=logmsg"	
		} );

		webim.ui.emot.init({"dir": _path + "static/images/emot/default"});
		var soundUrls = {
			lib: _path + "static/assets/sound.swf",
			msg: _path + "static/assets/sound/msg.mp3"
		};
		var ui = new webim.ui(document.getElementById("content"), {
			imOptions: {
				jsonp: true
			},
			soundUrls: soundUrls,
			layout: "layout.customer",
			layoutOptions: {
				unscalable: true
			},
			buddyChatOptions: {
				simple: true
			}
		}), im = ui.im;

		//im.setUser( {"id":"51c8450e9bc15","nick":"guest8276","visitor":"true","pic_url":"http:\/\/www.gravatar.com\/avatar\/?s=50","default_pic_url":"http:\/\/www.gravatar.com\/avatar\/?s=50","show":"unavailable","status":null,"url":"http:\/\/www.gravatar.com\/"} );

		ui.addApp("buddy", {
			is_login: true,
			title: "访客" || webim.ui.i18n("online support"),
			highlightable: true,
			disable_user: true,
			disable_group: true
		} );

		ui.render();
		im.online();
	});
})(webim);



