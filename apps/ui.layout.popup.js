app("layout.popup", function( options ) {
	webimUI.buddy && (webimUI.buddy.defaults.highlightable = true);
	webimUI.room && (webimUI.room.defaults.highlightable = true);
	webimUI.chat && (webimUI.chat.defaults.simple = true);

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

	(function(){
		//Update chat status
		im.bind("online",function(e, data){
			layout.options.user = data.user;
			layout.updateAllChat();
		}).bind("offline", function(){
			layout.updateAllChat();
		});
	})();

	(function(){
		//Cache buddy for visitor who has not information at server.
		im.bind("beforeOnline",function(e, params){
			extend(params, {
				buddy_ids: status.get("_cacheBuddy"),
				room_ids: "",
				show: "available"
			});
		});

		var mapper = function(a){ return a && a.id };
		var cacheBuddy = function(e){
			var data = map( buddy.all(true), mapper );
			status.set("_cacheBuddy", data.join(","));
			layout.updateAllChat();
		};
		buddy.bind("online", cacheBuddy).bind("offline", cacheBuddy);
	})();

	(function(){
		//room  events
		room.bind("memberAdded", function(e, room_id, info){
			var c = layout.chat("room", room_id);
			c && c.addMember(info.id, info.nick, info.presence == "offline");
		}).bind("memberRemoved", function(e, room_id, info){
			var c = layout.chat("room", room_id);
			c && c.removeMember(info.id, info.nick);
		});
	})();

	(function(){
		//history events
		history.bind("chat", function( e, id, data){
			var c = layout.chat("chat", id), count = "+" + data.length;
			if(c){
				c.history.add(data);
			}
		});
		history.bind("grpchat", function(e, id, data){
			var c = layout.chat("grpchat", id), count = "+" + data.length;
			if(c){
				c.history.add(data);
			}
		});
		history.bind("clear", function(e, type, id){
			var c = layout.chat(type, id);
			c && c.history.clear();
		});
	})();

	//all ready.
	//message
	im.bind("message", function(e, data){
		var show = false,
			l = data.length, d, uid = im.data.user.id, id, c, count = "+1";
		for(var i = 0; i < l; i++){
			d = data[i];
			id = d["id"], type = d["type"] === "chat" ? "buddy" : "room";
			c = layout.chat(type, id);
			c && c.status("");//clear status
			if(!c){	
				var widget = layout.widget(type);
				widget && widget.showCount( id, count );
				layout.notifyUser( type, count );
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
	<div id=":layout" class="webim-layout webim-popup ui-helper-clearfix"><div id=":left" class="webim-popup-left"></div><div id=":right" class="webim-popup-right"></div>\
	<div id=":widgets" class="webim-widgets ui-widget-content ui-helper-clearfix"><div class="webim-layout-bg ui-state-default ui-toolbar"></div></div>\
	</div>\
	</div>',
	template_tab: '<div class="webim-window-tab-wrap">\
	<div id=":tab" class="webim-window-tab ui-state-default">\
	<div class="webim-window-tab-inner">\
	<div id=":tabTip" class="webim-window-tab-tip">\
	<strong id=":tabTipC"><%=title%></strong>\
	</div>\
	<div id=":tabCount" class="webim-window-tab-count">\
	0\
	</div>\
	<em id=":tabIcon" class="webim-icon webim-icon-<%=icon%>"></em>\
	</div>\
	</div>\
	</div>'
},{
	_init: function(element, options){
		var self = this, options = self.options;
		extend(self,{
			widgets: {}
		  , widgetIds: []
		  , tabs: {}
		  , activeTabId : null
		});
		this.win = new webimUI.window(null, {
			closeable: false,
			minimizable: false,
			isMinimize: false
		});
	},
	buildUI: function(e){
		var self = this
		  , win = self.win;
		win.$.window.appendChild( self.$.widgets );
		self.$.left.appendChild( win.element );
	},
	widget:function(name){
		return this.widgets[name];
	},
	addWidget: function(widget, options){
		var self = this
		  , win = self.win
		  , name = widget.name;
		widget.window = win;
		self.widgetIds.push( name );
		self.widgets[ widget.name ] = widget;

		hide( widget.element );

		win.$.content.appendChild( widget.element );
		self._createTab( name, options );
		if( self.widgetIds.length == 1 ) {
			self._activeTab( name );
		}
	},
	_createTab: function( name, options ) {
		var self = this;
		var el = createElement( tpl( self.options.template_tab, options ) ); 
		el.$ = mapElements( el );
		var tab = el.$.tab;
		addEvent(tab, "click", function(e){
			self._activeTab( name );
			stopPropagation(e);
			preventDefault(e);
		});
		addEvent(tab,"mouseover",function(){
			addClass(this, "ui-state-hover");
			removeClass(this, "ui-state-default");
		});
		addEvent(tab,"mouseout",function(){
			removeClass(this, "ui-state-hover");
			this.className.indexOf("ui-state-") == -1 && addClass(this, "ui-state-default");
		});
		disableSelection(tab);
		self.$.widgets.appendChild( el );
		self.tabs[ name ] = el;
	},
	_activeTab: function( name ) {
		var self = this
		  , tabs = self.tabs;
		for (var i = self.widgetIds.length - 1; i >= 0; i--) {
			var _name = self.widgetIds[i]
			  , widget = self.widgets[_name]
			  , tab = tabs[_name].$.tab;
			if( _name == name ) {
				show( widget.element );
				addClass( tab, "ui-state-active" );
				removeClass( tab, "ui-state-default" );
				_countDisplay(tabs[_name].$.tabCount, 0);
			} else if( _name == self.activeTabId ) {
				hide( widget.element );
				addClass( tab, "ui-state-default" );
				removeClass( tab, "ui-state-active" );
			}
		};
		self.activeTabId = name;
	},
	notifyUser: function(name, count){
		var self = this;
		if( name != this.activeTabId ) {
			var tab = self.tabs[name];
			if( tab ) {
				_countDisplay(tab.$.tabCount, count);
			}
		}
	},
	focusChat: function(type, id){
	},
	chat:function(type, id){
		if( !type || ( this.__chat && this.__chat.__id == _id_with_type(type, id) ) )
			return this.__chat;
		return null;
	},
	updateChat: function(type, data){
		var chat = this.chat();
		chat && chat.update();
	},
	updateAllChat:function(){
		this.updateChat();
	},
	addChat: function(type, id, chatOptions, winOptions, nick){
		type = _tr_type(type);
		var self = this;
		if ( self.__chat )
			remove( self.__chat.window.element );

		var widget = self.widget( type == "room" ? "buddy" : "room" );
		widget && widget.active(null);

		widget = self.widget( type );
		widget && widget.active(id);

		var win = new webimUI.window(null, extend({
			//closeable: false,
			minimizable: false
		}, winOptions )).bind("close", function(){
			//Remove chat
			self.__chat = null;
			widget && widget.active();
		});

		var chat = self.__chat = self.options.ui.addApp("chat", extend(
			{
			}, self.options.ui.options[type + "ChatOptions"], {
				id: id, 
				type: type, 
				nick: nick, 
				winOptions: winOptions
			}, chatOptions 
		));
		chat.__id = _id_with_type(type, id);
		chat.setWindow( win );
		self.$.right.appendChild( win.element );
	}
});


