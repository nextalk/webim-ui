
(function (webim) {
	webim.ui.chat.defaults.target = "_blank";
	webim = window.webim;
	_path = "images/";
	webim.route({
		upload: "../images/upload.php"
	});
	//webim.extend(webim.setting.defaults.data,{});
	//webim.extend(webim.setting.defaults.data,{block_list: ["1000001"]});
	var menu = [{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"album","icon": _path + "image\/app\/album.gif","link":"space.php?do=album"},{"title":"blog","icon": _path + "image\/app\/blog.gif","link":"space.php?do=blog"},{"title":"thread","icon": _path + "image\/app\/mtag.gif","link":"space.php?do=thread"},{"title":"share","icon": _path + "image\/app\/share.gif","link":"space.php?do=share"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"},{"title":"doing","icon": _path + "image\/app\/doing.gif","link":"space.php?do=doing"}];
	_path = "../";
	webim.ui.emot.init({"dir": _path + "images/emot/default"});
	var ui = new webim.ui(document.body, {
		soundUrls: {
			lib: _path + "assets/sound.swf",
			msg: _path + "assets/sound/msg.mp3"
		},
		imOptions: {
			connectionType: "jsonpd"
		}
	  , buddyChatOptions: {
		  simple: true
		, upload: true
		, downloadHistory: false
		}
	  , roomChatOptions: {
			upload: true
		}
	}), im = ui.im;
	//im.user({"uid":"1","id":"admin","nick":"admin","avatar":"http:\/\/test.com\/project\/uc\/discuzX\/uc_server\/avatar.php?uid=0&size=small","url":"home.php?mod=space&uid=1"});
	ui.addApp("menu", {"data": menu});
	ui.layout.addShortcut( menu);
	var is_login = false;
	ui.addApp("buddy", {
		is_login: is_login
	  , showUnavailable: true
	  , simple: true
	});
	
	ui.addApp("room");
	ui.addApp("notification");
	ui.addApp("setting", {"data": webim.setting.defaults.data});
	ui.addApp("chatlink2", {autoInsertlink: true, elementId: "webim-chatme" });
	ui.render();
	is_login && im.autoOnline() && im.online();
	im.bind("online", function(e, data){
		data.connection.server = "../../webim-js/test/" + data.connection.server;
	});
	window._webimUI = ui;
})(webim);

window._webimUI.im.notification.handle( [{"from":"ok","text":"admin给你发了一条消息","link":"http:\/\/google.com","time":"8:30"},{"from":"ok","text":"test给你发了>一条消息","link":"http:\/\/google.com","time":"8:30"}] );


