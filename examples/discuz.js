
webim.ui.ready(function(){
	var path = "http://"+document.domain+"/uc/discuz/source/plugin/nextalk/";
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
	var ui = new webim.ui(document.body, {
		imOptions: {
			jsonp: true
		},
		soundUrls: soundUrls,
		buddyChatOptions: {
			upload: true
		},
		roomChatOptions: {
			upload: true
		}
	}), im = ui.im;

	//im.user({"uid":"1","id":"admin","nick":"admin","pic_url":"http:\/\/test.com\/project\/uc\/discuzX\/uc_server\/avatar.php?uid=0&size=small","url":"home.php?mod=space&uid=1"});
	//ui.addApp("menu", {"data": menu});
	//ui.layout.addShortcut( menu);
	var is_login = true;
	ui.addApp("buddy", {
		is_login: is_login
	  , showUnavailable: true
	  //,	userOptions: { show: true }
	});
	ui.addApp("room", {
		discussion: true
	});
	ui.addApp("notification");
	ui.addApp("setting", {"data": webim.setting.defaults.data});
	ui.addApp("chatlink", {
		link_class_out: /out_link/i
	});
	ui.render();
	is_login && im.autoOnline() && im.online();
});

