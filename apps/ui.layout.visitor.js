app("layout.visitor", function( options ) {
	options = options || {};
	var ui = this
	  , im = ui.im
	  , __status = false
	  , buddy = im.buddy
	  , history = im.history
	  , status = im.status
	  , setting = im.setting
	  , buddyUI = self.buddy
	  , room = im.room;

	var layout = new webimUI.layout( null,extend({
		chatAutoPop: im.setting.get("msg_auto_pop")
	}, options, {
		ui: ui
	}) );

	im.setting.get("minimize_layout") ? layout.collapse() : layout.expand(); 

	im.bind("beforeOnline",function(){
		layout.changeState("ready");
	}).bind("online",function(e, data){
		layout.changeState("active");
		layout.options.user = data.user;
		_initStatus();
		//setting.set(data.setting);
	}).bind("offline", function(e, type, msg){
		type == "offline" && layout.removeAllChat();
		layout.updateAllChat();
		layout.changeState("stop");
	});

	//setting events
	setting.bind("update",function(e, key, val){
		if( "msg_auto_pop" == key ) {
			layout.options.chatAutoPop = val;
		} else if ( "minimize_layout" == key ) {
			(val ? layout.collapse() : layout.expand());
		}
	});

	buddy.bind("online", function(e, data){
		layout.updateChat("buddy", data);
	}).bind("offline", function(e, data){
		layout.updateChat("buddy", data);
	}).bind("update", function(e, data){
		layout.updateChat("buddy", data);
	});
	room.bind("addMember", function(e, room_id, info){
		var c = layout.chat("room", room_id);
		c && c.addMember(info.id, info.nick, info.id == im.data.user.id);
	}).bind("removeMember", function(e, room_id, info){
		var c = layout.chat("room", room_id);
		c && c.removeMember(info.id, info.nick);
	});
	layout.bind("collapse", function(){
		setting.set("minimize_layout", true);
	});
	layout.bind("expand", function(){
		setting.set("minimize_layout", false);
	});

	//display status
	layout.bind("displayUpdate", function(e){
		_updateStatus(); //save status
	});

	//all ready.
	//message
	im.bind("message", function(e, data){
		var show = false,
			l = data.length, d, uid = im.data.user.id, id, c, count = "+1";
		for(var i = 0; i < l; i++){
			d = data[i];
			id = d["id"], type = d["type"];
			c = layout.chat(type, id);
			c && c.status("");//clear status
			if(!c){	
				if (d.type === "unicast"){
					layout.addChat(type, id, null, null, d.nick);
				}else{
					layout.addChat(type, id);  
				}
				c = layout.chat(type, id);
			}
			c && setting.get("msg_auto_pop") && !layout.activeTabId && layout.focusChat(id);
			c.window.notifyUser("information", count);
			var p = c.window.pos;
			(p == -1) && layout.setNextMsgNum(count);
			(p == 1) && layout.setPrevMsgNum(count);
			if(d.from != uid)show = true;
		}
		if(show){
			sound.play('msg');
			titleShow(i18n("new message"), 5);
		}
	});

	im.bind("status",function(e, data){
		each(data,function(n,msg){
			var userId = im.data.user.id;
			var id = msg['from'];
			if (userId != msg.to && userId != msg.from) {
				id = msg.to; //群消息
				var nick = msg.nick;
			}else{
				var c = layout.chat("buddy", id);
				c && c.status(msg['show']);
			}
		});
	});

	history.bind("unicast", function( e, id, data){
		var c = layout.chat("unicast", id), count = "+" + data.length;
		if(c){
			c.history.add(data);
		}
		//(c ? c.history.add(data) : im.addChat(id));
	});
	history.bind("multicast", function(e, id, data){
		var c = layout.chat("multicast", id), count = "+" + data.length;
		if(c){
			c.history.add(data);
		}
		//(c ? c.history.add(data) : im.addChat(id));
	});
	history.bind("clear", function(e, type, id){
		var c = layout.chat(type, id);
		c && c.history.clear();
	});

	return layout;

	function _initStatus(){
		if(__status)
			return layout.updateAllChat();
		// status start
		__status = true;
		var tabs = status.get("tabs"), 
			tabIds = status.get("tabIds"),
			//prev num
			p = status.get("p"), 
			//focus tab
			a = status.get("a");

		tabIds && tabIds.length && tabs && each(tabs, function(k,v){
			var id = k.slice(2), type = k.slice(0,1);

			layout.addChat(type, id, {}, { isMinimize: true});

			layout.chat(k).window.notifyUser("information", v["n"]);
		});
		p && (layout.prevCount = p) && layout._fitUI();
		a && layout.focusChat(a);
		// status end
	}

	function _updateStatus(){
		var _tabs = {}
		  , panels = layout.panels;
		each(layout.tabs, function(n, v){
			_tabs[n] = {
				n: v._count()//,
				//t: panels[n].options.type //type: buddy,room
			};
		});
		var d = {
			//o:0, //has offline
			tabs: _tabs, // n -> notice count
			tabIds: layout.tabIds,
			p: layout.prevCount, //tab prevCount
			//b: layout.widget("buddy").window.isMinimize() ? 0 : 1, //is buddy open
			a: layout.activeTabId //tab activeTabId
		}
		status.set(d);
	}
});


