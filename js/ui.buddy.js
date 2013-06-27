//
/* ui.buddy:
*
options:
attributes：

methods:
add(data, [index]) //
remove(ids)
select(id)
update(data, [index])
notice
online
offline

destroy()
events: 
select
offline
online

*/
app("buddy", function( options ){
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
	buddyUI.window.bind("displayStateChange",function(type){
		if(type != "minimize"){
			buddy.options.active = true;
			im.status.set("b", 1);
			buddy.complete();
		}else{
			im.status.set("b", 0);
			buddy.options.active = false;
		}
	});

	var mapId = function(a){ return isObject(a) ? a.id : a };
	var grepVisible = function(a){ return a.show != "invisible" && a.presence == "online"};
	var grepInvisible = function(a){ return a.show == "invisible"; };
	//some buddies online.
	buddy.bind("online", function( e, data){
		buddyUI.add(grep(data, grepVisible));
	});
	//some buddies offline.
	buddy.bind("offline", function( e, data){
		buddyUI.remove(map(data, mapId));
	});
	//some information has been modified.
	buddy.bind( "update", function( e, data){
		buddyUI.add(grep(data, grepVisible));
		buddyUI.update(grep(data, grepVisible));
		buddyUI.remove(map(grep(data, grepInvisible), mapId));
	} );
	buddyUI.offline();
	im.bind( "beforeOnline", function(){
		buddyUI.online();
	}).bind("online", function() {
		buddyUI.titleCount();
	}).bind( "offline", function( type, msg ) {
		buddyUI.offline();
		if ( type == "connect" ) {
		}
	});
	return buddyUI;
});

widget("buddy",{
	template: '<div id="webim-buddy" class="webim-buddy webim-flex webim-box">\
		<div id=":search" class="webim-buddy-search ui-state-default ui-corner-all"><em class="ui-icon ui-icon-search"></em><input id=":searchInput" type="text" value="" /></div>\
			<div class="webim-buddy-content webim-flex" id=":content">\
				<div id=":empty" class="webim-buddy-empty"><%=empty buddy%></div>\
					<ul id=":ul"></ul>\
						</div>\
							</div>',
	tpl_group: '<li><h4><%=title%>(<%=count%>)</h4><hr class="webim-line ui-state-default" /><ul></ul></li>',
	tpl_li: '<li title=""><a href="<%=url%>" rel="<%=id%>" class="ui-helper-clearfix"><em class="webim-icon webim-icon-<%=show%>" title="<%=human_show%>"><%=show%></em><img width="25" src="<%=pic_url%>" defaultsrc="<%=default_pic_url%>" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" /><strong><%=nick%></strong><span><%=status%></span></a></li>'
},{
	_init: function(){
		var self = this, options = self.options;
		self.groups = {
		};
		self.li = {
		};
		self.li_group = {
		};
		self.size = 0;
		if(options.disable_group){
			addClass(self.element, "webim-buddy-hidegroup");
		}
		if(options.simple){
			addClass(self.element, "webim-buddy-simple");
		}

	},
	_initEvents: function(){
		var self = this, $ = self.$, search = $.search, input = $.searchInput, placeholder = i18n("search buddy"), activeClass = "ui-state-active";
		addEvent(search.firstChild, "click",function(){
			input.focus();
		});
		input.value = placeholder;
		addEvent(input, "focus", function(){
			addClass(search, activeClass);
			if(this.value == placeholder)this.value = "";
		});
		addEvent(input, "blur", function(){
			removeClass(search, activeClass);
			if(this.value == "")this.value = placeholder;
		});
		addEvent(input, "keyup", function(){
			var list = self.li, val = this.value;
			each(self.li, function(n, li){
				if(val && (li.text || li.innerHTML.replace(/<[^>]*>/g,"")).indexOf(val) == -1) hide(li);
				else show(li);
			});
		});
/*
var a = $.online.firstChild;
addEvent(a, "click", function(e){
preventDefault(e);
self.trigger("online");
});
hoverClass(a, "ui-state-hover");
addEvent($.offline.firstChild, "click", function(e){
preventDefault(e);
self.trigger("offline");
});
*/

	},
	titleCount: function(){
		var self = this, size = self.size, win = self.window, empty = self.$.empty, element = self.element;
		win && win.title(self.options.title + "(" + (size ? size : "0") + ")");
		if(!size){
			show(empty);
		}else{
			hide(empty);
		}
		if(size > 8){
			self.scroll(true);
		}else{
			self.scroll(false);
		}
	},
	scroll:function(is){
		toggleClass(this.element, "webim-buddy-scroll", is);
	},
	_time:null,
	_titleBuddyOnline: function(name){
		var self = this, win = self.window;
		if(!name) name = "";
		//	win && win.title(subVisibleLength(name, 0, 8) + " " + i18n("online"));
		if(self._time) clearTimeout(self._time);
		self._time = setTimeout(function(){
			self.titleCount();
		}, 5000);
	},
	_title: function(type){
		var win = this.window;
		if(win){
			win.title(this.options.title + "[" + i18n(type) + "]");
		}
	},
	notice: function(type, name){
		var self = this;
		switch(type){
			case "buddyOnline":
				self._titleBuddyOnline(name);
			break;
			default:
				self._title(type);
		}
	},
	online: function(){
		var self = this, $ = self.$, win = self.window;
		self.notice("connect");
		hide( $.empty );
	},
	offline: function(){
		var self = this, $ = self.$, win = self.window;
		self.scroll(false);
		self.removeAll();
		hide( $.empty );
		self.notice("offline");
	},
	_updateInfo:function(el, info){
		el = el.firstChild;
		el.setAttribute("href", info.url);
		el = el.firstChild;
		var show = info.show ? info.show : "available";
		el.className = "webim-icon webim-icon-" + show;
		el.setAttribute("title", i18n(show));
		el = el.nextSibling;
		el.setAttribute("defaultsrc", info.default_pic_url ? info.default_pic_url : "");
		if(info.pic_url || info.default_pic_url) {
			el.setAttribute("src", info.pic_url || info.default_pic_url);
		}
		el = el.nextSibling;
		el.innerHTML = info.nick;
		el = el.nextSibling;
		el.innerHTML = stripHTML(info.status) || "&nbsp;";
		return el;
	},
	_addOne:function(info, end){
		var self = this, li = self.li, id = info.id, ul = self.$.ul;
		if(!li[id]){
			self.size++;
			if(!info.default_pic_url)info.default_pic_url = "";
			info.status = stripHTML(info.status) || "&nbsp;";
			info.show = info.show || "available";
			info.human_show = i18n(info.show);
			info.pic_url = info.pic_url || "";
			var el = li[id] = createElement(tpl(self.options.tpl_li, info));
			//self._updateInfo(el, info);
			var a = el.firstChild;
			addEvent(a, "click",function(e){
				preventDefault(e);
				self.trigger("select", [info]);
				this.blur();
			});

			var groups = self.groups, group_name = i18n(info["group"] || "friend"), group = groups[group_name];
			if(!group){
				var g_el = createElement(tpl(self.options.tpl_group));
				hide( g_el );
				if(group_name == i18n("stranger")) end = true;
				if(end) ul.appendChild(g_el);
				else ul.insertBefore(g_el, ul.firstChild);
				group = {
					name: group_name,
					el: g_el,
					count: 0,
					title: g_el.firstChild,
					li: g_el.lastChild
				};
				self.groups[group_name] = group;
			}
			if(group.count == 0) show(group.el);
			self.li_group[id] = group;
			group.li.appendChild(el);
			group.count++;
			group.title.innerHTML = group_name + "("+ group.count+")";
		}
	},
	_updateOne:function(info){
		var self = this, li = self.li, id = info.id;
		li[id] && self._updateInfo(li[id], info);
	},
	update: function(data){
		data = makeArray(data);
		for(var i=0; i < data.length; i++){
			this._updateOne(data[i]);
		}
	},
	add: function(data, end){
		data = makeArray(data);
		for(var i=0; i < data.length; i++){
			this._addOne(data[i], end);
		}
		this.titleCount();
	},
	removeAll: function(){
		var ids = [], li = this.li;
		for(var k in li){
			ids.push(k);
		}
		this.remove(ids);
		this.titleCount();
	},
	remove: function(ids){
		var self = this, id, el, li = self.li, group, li_group = self.li_group;
		ids = idsArray(ids);
		for(var i=0; i < ids.length; i++){
			id = ids[i];
			el = li[id];
			if(el){
				self.size--;
				group = li_group[id];
				if(group){
					group.count --;
					if(group.count == 0)hide(group.el);
					group.title.innerHTML = group.name + "("+ group.count+")";
				}
				remove(el);
				delete(li[id]);
			}
		}
		self.titleCount();
	},
	select: function(id){
		var self = this, el = self.li[id];
		el && el.firstChild.click();
		return el;
	},
	destroy: function(){
	}
});
