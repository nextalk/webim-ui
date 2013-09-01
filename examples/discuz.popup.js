(function(webim){
	webim.ui.ready(function(){
		var path = "http://"+document.domain+"/uc/discuz/source/plugin/webim/";
		webim.extend(webim.setting.defaults.data, {} );
		webim.route( {
			online: path + "im.php?webim_action=online",
			offline: path + "im.php?webim_action=offline",
			deactivate: path + "im.php?webim_action=refresh",
			message: path + "im.php?webim_action=message",
			presence: path + "im.php?webim_action=presence",
			status: path + "im.php?webim_action=status",
			setting: path + "im.php?webim_action=setting",
			history: path + "im.php?webim_action=history",
			clear: path + "im.php?webim_action=clear_history",
			download: path + "im.php?webim_action=download_history",
			members: path + "im.php?webim_action=members",
			join: path + "im.php?webim_action=join",
			leave: path + "im.php?webim_action=leave",
			buddies: path + "im.php?webim_action=buddies",
			upload: path + "static/images/upload.php",
			notifications: path + "im.php?webim_action=notifications"
		} );

		webim.ui.emot.init({"dir": path + "static/images/emot/default"});
		var soundUrls = {
			lib: path + "static/assets/sound.swf",
			msg: path + "static/assets/sound/msg.mp3"
		};		
		var ui = new webim.ui(document.getElementById("content"), {
			imOptions: {
				//"connectionType": "jsonpd",
				jsonp: true
			},
			soundUrls: soundUrls,
			layout: "layout.popup",
			layoutOptions: {
				unscalable: true
			},
			buddyChatOptions: {
			}
		}), im = ui.im;

		ui.addApp("buddy", {
			is_login: true,
			title: "好友",
		    simple: false
		} );

		ui.addApp("room");
		ui.addApp("setting", {"data": {
			play_sound: webim.setting.defaults.data.play_sound
		}});
		ui.render();

		im.autoOnline() && im.online();
	});
})(webim);



