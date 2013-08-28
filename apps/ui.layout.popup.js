app("layout.popup", function( options ) {

	options = options || {};
	var ui = this
	  , im = ui.im
	  , __status = false
	  , buddy = im.buddy
	  , history = im.history
	  , status = im.status
	  , setting = im.setting
	  , room = im.room;

	var layout = new webimUI["layout.popup"]( null,extend({
	}, options, {
		ui: ui
	}) );

	im.bind("beforeOnline",function(e, params){
		extend(params, {
			buddy_ids: status.get("_cacheBuddy"),
			room_ids: "",
			show: "available"
		});
	});

	im.bind("online",function(e, data){
		layout.options.user = data.user;
	});

	var mapper = function(a){ return a && a.id };
	var cacheBuddy = function(e){
		var data = map( buddy.all(true), mapper );
		status.set("_cacheBuddy", data.join(","));
		layout.updateAllChat();
	};
	buddy.bind("online", cacheBuddy).bind("offline", cacheBuddy);

	history.bind("unicast", function( e, id, data){
		var c = layout.chat("unicast", id), count = "+" + data.length;
		if(c){
			c.history.add(data);
		}
	});
	history.bind("clear", function(e, type, id){
		var c = layout.chat(type, id);
		c && c.history.clear();
	});

	//all ready.
	//message
	im.bind("message", function(e, data){
		var show = false,
			l = data.length, d, uid = im.data.user.id, id, c, count = "+1";
		var buddyUI = layout.widget("buddy");

		for(var i = 0; i < l; i++){
			d = data[i];
			id = d["id"], type = d["type"];
			c = layout.chat(type, id);
			c && c.status("");//clear status
			if(!c){	
				buddyUI.showCount(id, count);
			}
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


	return layout;

});

widget("layout.popup",{
	template: '<div id="webim" class="webim webim-state-ready">\
	<div class="webim-preload ui-helper-hidden-accessible">\
	<div id="webim-flashlib-c">\
	</div>\
	</div>\
	<div id=":layout" class="webim-layout webim-popup ui-helper-clearfix"><div id=":left" class="webim-popup-left"></div><div id=":right" class="webim-popup-right"></div></div>\
	</div>'
},{
	_init: function(element, options){
		var self = this, options = self.options;
		extend(self,{
			widgets: {}
		});
	},
	buildUI: function(e){
	},
	widget:function(name){
		return this.widgets[name];
	},
	addWidget: function(widget, options){
		var win = self.win = new webimUI.window(null, extend(options, {
			closeable: false,
			minimizable: false,
			isMinimize: false
		}));
		widget.window = win;
		win.html( widget.element );
		this.$.left.appendChild( win.element );
		this.widgets[widget.name] = widget;
	},
	focusChat: function(type, id){
		id = _id_with_type(type, id);
	},
	chat:function(type, id){
		if( !type || ( this.__chat && this.__chat.__id == _id_with_type(type, id) ) )
			return this.__chat;
		return null;
	},
	updateChat: function(type, data){
	},
	updateAllChat:function(){
		var chat = this.chat();
		chat && chat.update();
	},
	addChat: function(type, id, chatOptions, winOptions, nick){
		type = _tr_type(type);
		var self = this;
		if ( self.__chat )
			remove( self.__chat.window.element );

		var win = self.win = new webimUI.window(null, extend({
			//closeable: false,
			minimizable: false
		}, winOptions )).bind("close", function(){
			//Remove chat
			self.__chat = null;
			self.widgets["buddy"] && self.widgets["buddy"].active();
		});

		var widget = self.__chat = self.options.ui.addApp("chat", extend(
			{
				clearHistory: true
			}, self.options.ui.options.buddyChatOptions, {
				id: id, 
				type: type, 
				nick: nick, 
				winOptions: winOptions
			}, chatOptions ));

		widget.__id = _id_with_type(type, id);
		widget.setWindow( win );
		self.$.right.appendChild( win.element );
	}
});


