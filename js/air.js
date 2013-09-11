/* webim UI */

function webimUI(element, options){
	var self = this;
	self.element = element;
	self.options = extend({}, webimUI.defaults, options);
	self._init();
}
ClassEvent.on( webimUI );
extend(webimUI.prototype, {
	init: function() {

	},

	render:function() {
		this.layout.render();
	},

	addApp: function( name, options ) {
		var app = webimUI.apps[name]; 
		if ( app )
			return this[name] = app.apply( this, [options] );
	},

	addChat: function( type, id, nick ) {
		type = _tr_type( type );
		var self = this, 
		layout = self.layout, 
		buddy = self.im.buddy, 
		room = self.im.room,
		info; 
		if( layout.chat( type, id ) ) return;
		if( type == "room" ) {
			info = room.get( id ); 
		} else {
			info = buddy.get( id );
			if( !info ) buddy.update( id );
		}
		layout.addChat( type, id, self.addApp( "chat", { 
			type: type, 
			user: self.im.data.user, 
			info: info || { id:id, nick: nick || id } 
		} ) );
	},

	_init: function(){
		var self = this,
		im = self.im = new webim( null, self.options.imOptions ),
		options = self.options;
		self.addApp( "layout", options.layoutOptions );
		self._initEvents();
		isFunction( self.init ) && self.init();
	},
	_initEvents: function() {
		var self = this;
		//im events
		self.im.a( "online", function( e, data ){
			date.init( data.server_time );
			//setting.set(data.setting);
		} );
	}
});

var _countDisplay = function(element, count){
	if (count === undefined){
		return parseInt(element.innerHTML);
	}
	else if (count){
		count = (typeof count == "number") ? count : (parseInt(element.innerHTML) + parseInt(count));
		element.innerHTML = count.toString();
		show(element);
	}
	else {
		element.innerHTML = '0';
		hide(element);
	}
	return count;
};

function mapElements( obj ){
	var elements = obj.getElementsByTagName("*"), 
	el, id, need = {}, pre = ":", preLen = pre.length;
	for(var i = elements.length - 1; i > -1; i--){
		el = elements[i];
		id = el.id;
		if(id && id.indexOf(pre) == 0)need[id.substring(preLen, id.length)] = el;
	}
	return need;
}

function createElement(str){
	var el = document.createElement("div");
	el.innerHTML = str;
	el = el.firstChild; // release memory in IE ???
	return el;
}

var tpl = (function(){
	var dic = null, re = /\<\%\=(.*?)\%\>/ig;
	function call(a, b){
		return dic && dic[b] !=undefined ? dic[b] : i18n(b);
	}
	return function(str, hash){
		if(!str)return '';
		dic = hash;
		return str.replace(re, call);
	};
})();

var plugin = {
	add: function(module, option, set) {
		var proto = webimUI[module].prototype;
		for(var i in set){
			proto.plugins[i] = proto.plugins[i] || [];
			proto.plugins[i].push([option, set[i]]);
		}
	},
	call: function(instance, name, args) {
		var set = instance.plugins[name];
		if(!set || !instance.element.parentNode) { return; }

		for (var i = 0; i < set.length; i++) {
			if (instance.options[set[i][0]]) {
				set[i][1].apply(instance.element, args);
			}
		}
	}
};

/*
* widget
* options:
* 	template
* 	className
*
* attributes:
* 	id
* 	name
* 	className
* 	element
* 	$
*
* methods:
* 	template
*
*/
var _widgetId = 1;
function widget(name, defaults, prototype){
	function m(element, options){
		var self = this;
		self.id = _widgetId++;
		self.name = name;
		self.className = "webim-" + name;
		self.options = extend({}, m['defaults'], options);

		//template
		self.element = element || (self.template && createElement(self.template())) || ( self.options.template && createElement(tpl(self.options.template)));
		if(self.element){
			self.options.className && addClass(self.element, self.options.className);
			self.$ = mapElements(self.element);
		}
		isFunction(self._init) && self._init();
		//isFunction(self._initEvents) && setTimeout(function(){self._initEvents()}, 0);
		isFunction(self._initEvents) && self._initEvents();
	}
	m.defaults = defaults;// default options;
	// add prototype
	ClassEvent.on( m );
	extend(m.prototype, widget.prototype, prototype);
	webimUI[name] = m;
}

extend(widget.prototype, {
	_init: function(){
	}
});

function _tr_type(type){
	return type == "b" || type == "buddy" || type == "chat" ? "buddy" : "room";
}

function app( name, init ) {
	webimUI.apps[name] = init;
}
extend( webimUI, {
	version: "@VERSION",
	widget: widget,
	app: app,
	plugin: plugin,
	i18n: i18n,
	date: date,
	ready: ready,
	createElement: createElement,
	defaults: {},
	apps:{}
} );
webim.ui = webimUI;

