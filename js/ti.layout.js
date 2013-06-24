app( "layout", function( options ) {
	options = options || {};
	var ui = this, im = ui.im;
	layoutUI = new webimUI.layout( options.layout, options.layoutOptions );
	ui.addApp( "login", extend( { container: layoutUI.element }, options.loginOptions ) );
	ui.addApp( "user", extend( { container: layoutUI.window.$.subHeader }, options.userOptions ) );
	im.bind( "go", function(){
		layoutUI.showWidget();
	});
	layoutUI.window.subHeader( layoutUI.tabs.element );
	return layoutUI;
} );

widget("layout", {
	template: '<div id=":layout" class="webim-layout webim-flex webim-box">\
		<div id=":widgets" class="webim-widgets webim-flex webim-box webim-hide"></div>\
		<div id=":shortcut" class="webim-shortcut"></div>\
	</div>'
}, {
	_init: function( element, options ){
		var self = this, 
		options = self.options;
		extend( self, {
			window: new webimUI.window( null, {
				main: true,
				name: "layout",
				title: "webim",
				maximizable: true,
				icon: ""
			} ),
			widgets : {},
			panels: {},
			tabs: new webimUI.tabs( null, {
				panel: self.$.widgets
			} ),
			chatWindows : {}
		} );
		self.window.html( self.element );
	},
	_initEvents: function(){
		var self = this, win = self.window, $ = self.$;
		//Ie will call resize events after onload.
		return;
		var c = false;
		addEvent(win,"resize", function(){
			if(c){
				c = true;
				self.buildUI();
			}
		});
		addEvent($.next,"mousedown", function(){self._slide(-1);});
		addEvent($.next,"mouseup", function(){self._slideUp();});
		disableSelection($.next);
		addEvent($.prev,"mousedown", function(){self._slide(1);});
		addEvent($.prev,"mouseup", function(){self._slideUp();});
		disableSelection($.prev);
		addEvent($.expand, "click", function(){
			if(!self.isMinimize()) return false;
			self.expand();
			self.trigger("expand");
			return false;
		});
		addEvent($.collapse, "click", function(){
			if(self.isMinimize()) return false;
			self.collapse();
			self.trigger("collapse");
			return false;
		});
		hoverClass($.collapse, "ui-state-hover", "ui-state-default");
		hoverClass($.expand, "ui-state-hover", "ui-state-default");
	},
	render: function() {
		document.body.appendChild( this.window.element );
	},
	isMinimize: function(){
		return hasClass(this.$.layout, "webim-layout-minimize");
	},

	widget:function(name){
		return this.widgets[name];
	},
	addWidget: function( widget, options ) {
		var self = this, 
		$ = self.$,
		container = options.container,
		winOptions = extend( options, { main: false, closeable: false, subHeader: widget.header } ),
		win, el = widget.element;
		self.widgets[widget.name] = widget;
		if ( container == "window" ) {
			win = new webimUI.window(null, winOptions);
			win.html( el );
			widget.container = win;
		} else if ( container == "tab" ) {
			self.tabs.add( widget.element, options.title, options.icon );
			self.tabs.select( options.title );
		}
		//self.$[container ? container : "widgets"].insertBefore(win.element, before && self.widgets[before] ? self.widgets[before].window.element : null);
		//win.bind("displayStateChange", function(e, state){ self._widgetStateChange(this, state);});
	},
	focusChat: function( type, id ) {
		id = _id_with_type(type, id);
		var self = this, tab = self.chatWindows[id], panel = self.panels[id];
		tab && tab.isMinimize() && tab.restore();
		panel && panel.focus();
	},
	chat:function(type, id){
		return this.panels[_id_with_type(type, id)];
	},
	updateChat: function(type, data){
		data = makeArray(data);
		var self = this, info, l = data.length, panel;
		for(var i = 0; i < l; i++){
			info = data[i];
			panel = self.panels[_id_with_type(type, info.id)];
			panel && panel.update(info);
		}
	},
	updateAllChat:function(){
		each(this.panels, function(k,v){
			v.update();
		});
	},
	addChat: function( type, id, chatUI ) {
		var self = this, panels = self.panels;
		id = _id_with_type( type, id );
		if( !panels[ id ] ) {
			var win = self.chatWindows[id] = new webimUI.window(null, {
				main: false,
				name: "chat",
				title: "webim",
				maximizable: true,
				icon: ""
			} );
			chatUI.setWindow( win );
			self.tabIds.push( id );
			panels[id] = chatUI;
		}
	},
	removeChat: function(type, id){
		//ids = idsArray(ids);
		//var self = this, id, l = ids.length, tab;
		//for(var i = 0; i < l; i++){
		//tab = this.chatWindows[ids[i]];
		var tab = this.chatWindows[_id_with_type(type, id)];
		tab && tab.close();
		//}
	},
	removeAllChat: function(){
		each(this.chatWindows, function(n, tab){
			tab.close();
		});
	},
	showWidget: function() {
		removeClass( this.$.widgets, "webim-hide" );
	}
});

function _id_with_type(type, id){
	return id ? (type == "b" || type == "buddy" || type == "unicast" ? ("b_" + id) : ("r_" + id)) : type;
}
