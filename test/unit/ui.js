module("ui");
test("webim.ui", 1, function() {
	stop();
	var is_login = false;
	webim.ui.ready(function(){
		webim = window.webim;
		_path = "images/";
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
				//jsonp: true
			}
		}), im = ui.im;
		im.setUser({"uid":"1","id":"admin","nick":"admin","pic_url":"http:\/\/test.com\/project\/uc\/discuzX\/uc_server\/avatar.php?uid=0&size=small","url":"home.php?mod=space&uid=1"});
		ui.addApp("menu", {"data": menu});
		ui.layout.addShortcut( menu);
		ui.addApp("buddy", {
			is_login: is_login,
			loginOptions: {
				questions: [["0", "安全提问(未设置请忽略)"], ["1", "母亲的名字"], ["2", "爷爷的名字"], ["3", "父亲出生的城市"], ["4", "你其中一位老师的名字"], ["5", "你个人计算机的型号"], ["6", "你最喜欢的餐馆名称"], ["7", "驾驶执照最后四位数字"]],
				notice: "请使用UChome帐号登录"
			}
		});
		ui.addApp("room");
		ui.addApp("notification");
		ui.addApp("setting", {"data": webim.setting.defaults.data});
		ui.render();
		is_login && im.autoOnline() && im.online();
		//im.online();
		im.bind("go", function(data){
			data.connection.server = "../im/test/" + data.connection.server;
		});
		ok(ui, "create");
		start();
	});
});

