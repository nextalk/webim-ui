app("layout.customer", function( options ) {

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

	var layout = new webimUI["layout.customer"]( null,extend({
	}, options, {
		ui: ui
	}) );

	im.bind("online",function(e, data){
		layout.options.user = data.user;
	});

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

widget("layout.customer",{
	template: '<div id="webim" class="webim webim-state-ready">\
	<div class="webim-preload ui-helper-hidden-accessible">\
	<div id="webim-flashlib-c">\
	</div>\
	</div>\
	<div id=":layout" class="webim-layout webim-customer"></div>\
	</div>'
},{
	_init: function(element, options){
		var self = this, options = self.options;
		extend(self,{
			widgets: {}
		});
		var content = self.$.content = createElement("<div class='webim-customer-content ui-helper-clearfix'><div class='webim-customer-l ui-widget-content'></div></div>");
		var win = self.win = new webimUI.window(null, {
			closeable: false,
			minimizable: false,
			title: webim.ui.i18n("online support")
		});
		self.$.layout.insertBefore( win.element );
		win.html( content );
	},
	buildUI: function(e){
	},
	widget:function(name){
		return this.widgets[name];
	},
	addWidget: function(widget, options, before, container){
		this.$.content.firstChild.appendChild( widget.element );
		widget.window = this.win;
		this.widgets[widget.name] = widget;
	},
	focusChat: function(type, id){
		id = _id_with_type(type, id);
	},
	chat:function(type, id){
		if( this.__chat && 
			this.__chat.__id == _id_with_type(type, id) )
		return this.__chat;
	},
	updateChat: function(type, data){
	},
	updateAllChat:function(){
	},
	addChat: function(type, id, chatOptions, winOptions, nick){
		type = _tr_type(type);
		var self = this;
		if ( self.__chat )
			remove( self.__chat.element );

		var widget = self.__chat = self.options.ui.addApp("chat", extend({
			id: id, 
			type: type, 
			nick: nick, 
			winOptions: winOptions,
			clearHistory: false,
			downloadHistory: false,
		}, chatOptions ));

		widget.__id = _id_with_type(type, id);
		widget.setWindow( self.win, true );
		self.$.content.appendChild( widget.element );
	}
});


