
/**
 * layout
 *
 */

webim.ui.i18n.store('zh-CN',{
	"customer offline notice": "当前客服不在线，您可以选择留言或者咨询在线机器人"
  , "robot": "机器人"
});

var __groups = {}
  , __rgroups = {};

function trid(id) {
	return __groups[id] && __groups[id]["id"];
}

function rtrid(id) {
	return __rgroups[id] && __rgroups[id]["name"];
}

function rtridfor( obj ) {
	obj.to_nick = __rgroups[obj.to] && __rgroups[obj.to]["nick"] || "机器人";
	obj.to = rtrid( obj.to ) || "";
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
				if (d.type === "chat"){
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

	history.bind("chat", function( e, id, data){
		var c = layout.chat("chat", trid(id) || id ), count = "+" + data.length;
		if(c){
			c.history.add(data);
		}
		//(c ? c.history.add(data) : im.addChat(id));
	});
	history.bind("grpchat", function(e, id, data){
		var c = layout.chat("grpchat", trid(id) || id), count = "+" + data.length;
		if(c){
			c.history.add(data);
		}
		//(c ? c.history.add(data) : im.addChat(id));
	});
	history.bind("clear", function(e, type, id){
		var c = layout.chat(type, trid( id ) || id );
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

	var $switch = createElement(tpl('<div class="webim-chat-switch"><div class="webim-chat-notice-wrap1"><div class="webim-chat-notice-wrap"><div id=":notice" class="webim-chat-notice ui-state-highlight"><%=customer offline notice%></div></div> </div><p><a id=":note" class="ui-state-default ui-corner-all" href="javascript:void(0);"><%=note%></a><a id=":robot" class="ui-state-default ui-corner-all" href="javascript:void(0);"><%=robot%></a></p></div>'))
	  , $switches = mapElements( $switch )
	  , $eval = createElement( tpl('<div class="webim-chat-eval"><div id=":header" class="webim-window-header ui-widget-header ui-corner-top"><h4 id=":headerTitle">评价</h4></div><div id=":content" class="webim-window-content ui-widget-content"><p>您对客服人员满意吗？</p><p id=":grade">\
	<label for="webim-eval1"><input id="webim-eval1" type="radio" value="1" name="eval" />&nbsp;非常不满意</label>\
	<label for="webim-eval2"><input id="webim-eval2" type="radio" value="2" name="eval" />&nbsp;不满意</label>\
	<label for="webim-eval3"><input id="webim-eval3" type="radio" value="3" name="eval" />&nbsp;基本满意</label>\
	<label for="webim-eval4"><input id="webim-eval4" type="radio" value="4" name="eval" checked="checked"/>&nbsp;满意</label>\
	<label for="webim-eval5"><input id="webim-eval5" type="radio" value="5" name="eval" />&nbsp;非常满意</label>\
	</p><p>你对客服人员有什么建议吗？<textarea id=":note" name="note"></textarea></p><p class="webim-chat-eval-actions">\
	<input id=":cancel" type="button" value="取消" class="ui-state-default ui-corner-all" />\
	<input id=":submit" type="button" value="提交" class="ui-state-default ui-corner-all" />\
	</p></div></div>') )
	  , $evals = mapElements( $eval );

	addEvent( $switches.note, "click", function(e){
		showComment();
		preventDefault(e);
	} );
	addEvent( $switches.robot, "click", function(e){
		showRobot();
		preventDefault(e);
	} );

	var info = im.buddy.get(id) || {
		id: id,
		nick: options.nick || id
	};

	options = extend( {
		clearHistory: true, 
		template: _chatTemplate,
		emot: true 
	}, ui.options.buddyChatOptions, { 
		info: info,
		user: im.data.user,
		history: [], 
		block: false, 
		member: false, 
		msgType: "chat"
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
		msg.group_id = msg.to;
		im.sendMessage( rtridfor( msg ), function(data){
			if( isArray( data ) ) {
				history.set( data );
			}
		});
		msg.to = msg.to || msg.group_id;
		history.set( msg );
	}).bind("sendStatus", function( e, msg ) {
		msg = rtridfor( msg );
		msg.to && im.sendStatus( msg );
	}).bind("clearHistory", function( e, info ){
		var id = rtrid( info.id );
		if( id )
			history.clear( "chat", id );
		else
			history.clear( "chat", info.id );
	}).bind("downloadHistory", function( e, info ) {
		var id = rtrid( info.id );
		if( id )
			history.download( "chat", id );
		else
			alert("机器人无纪录");
	});

	//Comment...
	var noteUI = ui.addApp("note", {
		notice: "当前客服不在线，如有问题请留言。"
	});

	noteUI.bind("note", function(e, data){
		data.group_id = info.id;
		ajax({
			type:"get",
			cache: false,
			url: route( "note" ),
			data: data,
			"success": function(body){
				alert( "留言成功");
				commentOrRobot();
				//win.minimize();
			},
			"error": function(){
				alert( "留言失败");
			}
		});
	});

	im.bind("offline", commentOrRobot);

	//evaluate events
	win.$.close.disabled = true;
	win.$.tabClose.disabled = true;
	addEvent( win.$.close, "click", evaluate);
	addEvent( win.$.tabClose, "click", evaluate);
	addEvent( $evals.cancel, "click", function(){
		win.close();
	});
	addEvent( $evals.submit, "click", function(){
		var text = $evals.note.value
		  ,	elements = $evals.grade.getElementsByTagName("input")
		  , el
		  , grade = 4;
		for(var i = elements.length - 1; i > -1; i--){
			if(  elements[i].checked )
				grade = elements[i].value;
		}
		win.close();
		var bid = rtrid( info.id );
		if( bid ) {
			ajax({
				type:"get",
				cache: false,
				url: route( "eval" ),
				data: {
					suggestion: text,
					grade: grade,
					group_id: info.id,
					buddy_id: bid
				}
			});
		}
	});
	return chatUI;

	function evaluate(){
		if( rtrid( info.id ) ) {
			win.$.window.appendChild( $eval );
		} else {
			win.close();
		}
	}

	function showComment() {
		chatUI.setWindow( win );
		html( chatUI.$.wrap, noteUI.element );
	}

	function showRobot() {
		//history.load( "chat", info.id );
		chatUI.setWindow( win );
		html( chatUI.$.wrap, chatUI.$.container );
	}

	function commentOrRobot() {
		win.html( $switch );
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
		ajax({
			type:"get",
			cache: false,
			url: route( "openchat" ),
			data: {
				group_id: info.id
			  , nick: im.data.user.nick
			  , ticket: im.data.connection.ticket
			},
			success: function( data ){
				if( data && data[0] ) {
					chatUI.setWindow( win );
					chatUI.update();
					data = data[0];
					//match group for buddy
					__groups[ data.name ] = info;
					__rgroups[ info.id ] = data;
					var h = history.get( "chat", data.name );
					if( !h )
						history.load( "chat", data.name );
					else {
						chatUI.history.add( h );
					}


				} else {
					commentOrRobot();
				}
			},
			error: function( data ){
				commentOrRobot();
			}
		});
	}
} );


