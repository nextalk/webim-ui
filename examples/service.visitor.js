(function(webim){
	webim.ui.ready(function(){
		var log = webim.log;
		var _path = "http://p2.com/webim/service/";
		//_path = "http://shopim1.webim20.cn/";
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
		  , note: _path + "note.php"
		  , "eval": _path + "eval.php"
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
				buddyTitle: "在线客服",
				buddies: [{"id":"1","nick":"\u6280\u672f\u652f\u6301","desc":"shouhou jishu zhichi ","presence":"online","show":"available","pic_url":"http:\/\/www.gravatar.com\/avatar\/e08894cc7de84fed191944a8be9f6ad6?s=50"},{"id":"2","nick":"\u5546\u52a1\u652f\u6301","desc":"shouqian ","presence":"online","show":"available","pic_url":"http:\/\/www.gravatar.com\/avatar\/e08894cc7de84fed191944a8be9f6ad6?s=50"}]
			},
			buddyChatOptions: {
				upload: true,
				simple: true
			}
		}), im = ui.im;

		im.setUser( {"id":"51c8450e9bc15","nick":"guest8276","visitor":"true","pic_url":"http:\/\/www.gravatar.com\/avatar\/?s=50","default_pic_url":"http:\/\/www.gravatar.com\/avatar\/?s=50","show":"unavailable","status":null,"url":"http:\/\/www.gravatar.com\/", "presence": "online"} );

		ui.addApp("visitorstatus");
		ui.addApp("logmsg");
		ui.addApp("setting", {"data": {
			play_sound: webim.setting.defaults.data.play_sound
		}});

		ui.render();
		//im.online();
	});
})(webim);



