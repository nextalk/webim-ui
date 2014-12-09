/* webim UI:
 *
 * options:
 * attributes:
 * 	im
 * 	layout
 *
 * methods:
 *
 * events:
 *
 */

/*----------------------------------------
 Windows size
----------------------------------------*/
function winSize() {
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
	return {x: x, y: y};
}

/*----------------------------------------
 Webim UI
----------------------------------------*/

function webimUI(element, options){
	var self = this;
	self.element = element;
	self.options = extend({}, webimUI.defaults, options);
	self._init();
}

ClassEvent.on( webimUI );

extend(webimUI.prototype, {
	render:function(){
		var self = this, layout = self.layout;
		// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
		self.element.insertBefore( layout.element, self.element.firstChild );
		setTimeout(function(){self.initSound()}, 1000);
		layout.buildUI();
	},
	_init: function(){
		var self = this
		  , im = self.im = new webim(null, self.options.imOptions)
		  , options = self.options
		  , layout = self.layout = self.addApp( options.layout || "layout", 
			options.layoutOptions );

		im.setting.get("play_sound") ? 
			sound.enable() : sound.disable() ;

		//im events
		im.bind("online",function(e, data){
			date.init(data.server_time);
		});
		//setting events
		im.setting.bind("update",function(e, key, val){
			if( "play_sound" == key ) {
				(val ? sound.enable() : sound.disable() );
			}
		});
	},
	addApp: function(name, options){
		var e = webimUI.apps[name];
		if(!e)return;
		var self = this, im = self.im;
		return isFunction(e) && e.apply(self, [options]);
	},
	initSound: function(urls){
		sound.init(urls || this.options.soundUrls);
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

function mapElements(obj){
	var elements = obj.getElementsByTagName("*"), el, id, need = {}, pre = ":", preLen = pre.length;
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

function app(name, events){
	webimUI.apps[name] = events || {};
}
extend(webimUI,{
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
});
webim.ui = webimUI;

