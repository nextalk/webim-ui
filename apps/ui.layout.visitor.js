
/**
 * layout
 *
 */

var __groups = {}
  , __rgroups = {};

function trid(id) {
	return __groups[id] && __groups[id]["id"];
}

function rtrid(id) {
	return __rgroups[id] && __rgroups[id]["name"];
}

function rtridfor( obj ) {
	obj.to = rtrid( obj.to );
	return obj;
}

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

	var layout = ui.layout = new webimUI.layout( null,extend({
		chatAutoPop: im.setting.get("msg_auto_pop"),
		chatApp: "chat.visitor"
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
			id = trid( d["id"] ), type = d["type"];
			if( !id )continue;
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
			var id = trid( msg['from'] );
			if( !id )return;
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
		var c = layout.chat("unicast", trid(id) ), count = "+" + data.length;
		if(c){
			c.history.add(data);
		}
		//(c ? c.history.add(data) : im.addChat(id));
	});
	history.bind("multicast", function(e, id, data){
		var c = layout.chat("multicast", trid(id)), count = "+" + data.length;
		if(c){
			c.history.add(data);
		}
		//(c ? c.history.add(data) : im.addChat(id));
	});
	history.bind("clear", function(e, type, id){
		var c = layout.chat(type, trid( id ) );
		c && c.history.clear();
	});


	var buddies = options.buddies || [];
	if( buddies.length != 1 ) {
		ui.addApp("buddy.visitor", {
			title: webim.ui.i18n(options.buddyTitle || "online support"),
			buddies: options.buddies,
			disable_group: true
		} );
	}
	buddy.presence( options.buddies );
	im.bind("offline", function(){
		buddy.presence( options.buddies );
	});
	if( buddies.length == 1 ) {
		layout.addChat("buddy", buddies[0].id, {}, { isMinimize: true, closeable: false });
	}

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

/**
 *
 * buddy app
 *
 */
app("buddy.visitor", function( options ){
	options = options || {};
	var ui = this, im = ui.im, buddy = im.buddy, layout = ui.layout;
	var buddyUI = new webimUI.buddy(null, extend({
		title: i18n("buddy")
	}, options ) );

	layout.addWidget( buddyUI, {
		className: "webim-buddy-window",
		title: i18n( "buddy" ),
		titleVisibleLength: 19,
		sticky: im.setting.get("buddy_sticky"),
		isMinimize: !im.status.get("b"),
		icon: "buddy"
	} );

	//select a buddy
	buddyUI.bind("select", function(e, info){
		ui.layout.addChat("buddy", info.id);
		ui.layout.focusChat("buddy", info.id);
	});

	//buddy events

	im.setting.bind("update",function(key, val){
		if(key == "buddy_sticky") buddyUI.window.option.sticky = val;
	});

	//Bug... 如果用户还没登录，点击， status.set 会清理掉正在聊天的session
	buddyUI.window && buddyUI.window.bind("displayStateChange",function(e, type){
		if(type != "minimize"){
			buddy.options.active = true;
			im.status.set("b", 1);
			buddy.complete();
		}else{
			im.status.set("b", 0);
			buddy.options.active = false;
		}
	});

	buddyUI.online();
	buddyUI.add(options.buddies);
	buddyUI.titleCount();
	return buddyUI;
});

/**
 *
 * chat app
 *
 */

var _chatTemplate = '<div><table border="0" collapse="0" cellSpacing="0" class="webim-chat-wrap"><tr><td id=":wrap">' 
	+ webimUI.chat.defaults.template
	+ '</td><td id=":board" class="ui-widget-content webim-chat-board"></td></tr></table></div>';
app( "chat.visitor", function( options ) {
	options = options || {};
	var ui = this, 
		im = ui.im,
		buddy = im.buddy,
		room = im.room,
		history = im.history,
		id = options.id,
		type = options.type,
		win = options.window;

	var info = im.buddy.get(id) || {
		id: id,
		nick: options.nick || id
	};

	options = extend( {
		info: info,
		user: im.data.user
	}, ui.options.buddyChatOptions, { 
		template: _chatTemplate,
		history: [], 
		block: false, 
		emot: true, 
		clearHistory: true, 
		member: false, 
		msgType: "unicast"
	}, options );

	var chatUI = new webimUI.chat( null, options );

	// Set board content
	chatUI.$.board && (chatUI.$.board.innerHTML = info.desc);

	if ( win.isMinimize() ) {
		win.bind("displayStateChange",function(e, type){
			if(type != "minimize"){
				check();
			}
		});
	} else {
		check();
	}
	win.bind("close", function(){
		closeChat();
	});

	//im.buddy.set([{id: info.id, nick: info.nick + "-A" }]);

	chatUI.bind("sendMessage", function( e, msg ) {
		im.sendMessage( rtridfor( msg ) );
		history.set( msg );
	}).bind("sendStatus", function( e, msg ) {
		im.sendStatus( rtridfor( msg ) );
	}).bind("clearHistory", function( e, info ){
		history.clear( "unicast", rtrid( info.id ) );
	}).bind("downloadHistory", function( e, info ) {
		history.download( "unicast", rtrid( info.id ) );
	});

	//Comment...
	var noteUI = ui.addApp("note", {
		notice: "当前客服不在线，如有问题请留言。"
	});

	noteUI.bind("note", function(e, data){
		ajax({
			type:"get",
			dataType: "jsonp",
			cache: false,
			url: route( "note" ),
			data: data,
			"success": function(body){
				alert( "留言成功");
				win.minimize();
			},
			"error": function(){
				alert( "留言失败");
			}
		});
	});

	im.bind("offline", showComment);

	return chatUI;

	function showComment() {
		chatUI.setWindow( win );
		html( chatUI.$.wrap, noteUI.element );
	}

	var checked = false;
	function check(){
		if( checked )
			return;
		checked = true;
		win.html('<div class="webim-loading"></div>');
		//
		if( im.state === webim.OFFLINE ) {
			im.bind("online", function(){
				checkCustomer();
			});
			im.online();
		} else {
				checkCustomer();
		}
	}

	function closeChat(){
		var bid = rtrid( info.id );
		if( bid ) {
			ajax({
				type:"get",
				dataType: "jsonp",
				cache: false,
				url: route( "closechat" ),
				data: {
					group_id: info.id
				  , buddy_id: bid
				  , ticket: im.data.connection.ticket
				}
			});
		}
	}

	function checkCustomer(){
		chatUI.setWindow( win );
		chatUI.update();
		ajax({
			type:"get",
			dataType: "jsonp",
			cache: false,
			url: route( "openchat" ),
			data: {
				group_id: info.id
			  , nick: im.data.user.nick
			  , ticket: im.data.connection.ticket
			},
			success: function( data ){
				if( data && data[0] ) {
					data = data[0];
					//match group for buddy
					__groups[ data.name ] = info;
					__rgroups[ info.id ] = data;

					var h = history.get( "unicast", data.name );
					if( !h )
						history.load( "unicast", data.name );


				} else {
					showComment();
				}
			},
			error: function( data ){
				showComment();
			}
		});
	}
} );


