
webim.ui.ready(function(){
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
		}
	}), im = ui.im;
	//im.user({"uid":"1","id":"admin","nick":"admin","pic_url":"http:\/\/test.com\/project\/uc\/discuzX\/uc_server\/avatar.php?uid=0&size=small","url":"home.php?mod=space&uid=1"});
	ui.addApp("menu", {"data": menu});
	ui.layout.addShortcut( menu);
	var is_login = false;
	ui.addApp("buddy", {
		is_login: is_login
	});
	ui.addApp("room");
	ui.addApp("notification");
	ui.addApp("setting", {"data": webim.setting.defaults.data});
	ui.addApp("chatlink", {
		link_class_out: /out_link/i
	});
	ui.render();
	is_login && im.autoOnline() && im.online();
	im.bind("online", function(e, data){
		data.connection.server = "../../js/test/" + data.connection.server;
	});
});

