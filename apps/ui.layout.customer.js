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

		widget.setWindow( self.win );
		self.$.content.appendChild( widget.element );
	}
});


