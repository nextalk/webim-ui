(function(webim){
	webim.ui.ready(function(){
		var log = webim.log;
		var _path = "http://p.com/webim/service/";
		//_path = "http://blog.webim20.cn/webim/";
		webim.extend( webim.setting.defaults.data, {
			play_sound: true,
			minimize_layout: true,
			buddy_sticky: true
		} );

		webim.route( {
			online: _path + "im.php?webim_action=online&domain=webim20.cn",	
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
			logmsg: _path + "im.php?webim_action=logmsg",	
			openchat: _path + "im.php?webim_action=openchat",	
			closechat: _path + "im.php?webim_action=closechat"
		} );

		webim.ui.emot.init({"dir": _path + "static/images/emot/default"});
		var soundUrls = {
			lib: _path + "static/assets/sound.swf",
			msg: _path + "static/assets/sound/msg.mp3"
		};
		var ui = new webim.ui(document.body, {
			imOptions: {
				jsonp: true
			  , connectionType: "jsonpd"
			},
			soundUrls: soundUrls,
			layout: "layout.visitor",
			layoutOptions: {
				unscalable: true,
				buddies: [
					{"id":"1","nick":"技术支持","group":"friend","url":"http:\/\/www.gravatar.com\/136e370cbf1cf500cbbf791e56dac614","pic_url":"http:\/\/www.gravatar.com\/avatar\/136e370cbf1cf500cbbf791e56dac614?s=50","presence":"online","show":"available","status":"", "desc": "售后技术支持"}
				]
			},
			buddyChatOptions: {
				simple: true
			}
		}), im = ui.im;

		im.setUser( {"id":"51c8450e9bc15","nick":"guest8276","visitor":"true","pic_url":"http:\/\/www.gravatar.com\/avatar\/?s=50","default_pic_url":"http:\/\/www.gravatar.com\/avatar\/?s=50","show":"unavailable","status":null,"url":"http:\/\/www.gravatar.com\/", "presence": "online"} );

		ui.addApp("visitorstatus");
		ui.addApp("logmsg");

		ui.render();
		//im.online();
	});
})(webim);



