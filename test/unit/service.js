module("ui");
test("webim.ui", 1, function() {
	stop();
//webim.notification.defaults.url = _path + "data/notifications.php";
	webim.ui.ready(function(){
		webim = window.webim;
		_path = "images/";
		//webim.extend(webim.setting.defaults.data,{});
		//webim.extend(webim.setting.defaults.data,{block_list: ["1000001"]});
		webim.setting.defaults.data = {
			play_sound: true,
			minimize_layout: true,
			buddy_sticky: true
		};
		_path = "../";
		webim.ui.emot.init({"dir": _path + "images/emot/default"});
		var ui = new webim.ui(document.body, {
			soundUrls: {
				lib: _path + "assets/sound.swf",
				msg: _path + "assets/sound/msg.mp3"
			},
			layoutOptions: {
				unscalable: true
			},
			buddyChatOptions: {
				simple: true
			},
			imOptions: {
				jsonp: true
			}
		}), im = ui.im;
		//im.user({"uid":"1","id":"admin","nick":"admin","avatar":"http:\/\/test.com\/project\/uc\/discuzX\/uc_server\/avatar.php?uid=0&size=small","show":"available","url":"home.php?mod=space&uid=1"});
		ui.addApp("buddy", {
			title: webim.ui.i18n("online support"),
			simple: true,
			disable_user: true,
			disable_group: true
		});
		ui.addApp("visitorstatus");
		//ui.addApp("setting", {"data": webim.setting.defaults.data});
		ui.render();
		//im.autoOnline() && im.online();
		im.online();
		im.bind("go", function(data){
			data.connection.server = "../im/test/" + data.connection.server;
		});
		ok(ui, "create");
		start();
	});
});

