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
		title: options.title || i18n("buddy")
	}, options ) );

	layout.addWidget( buddyUI, {
		className: "webim-buddy-window",
		title: options.title || i18n( "buddy" ),
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
	var userUI;
	if(!options.disable_user) {
		userUI = ui.addApp( "user", options.userOptions );
		if( options.is_login ) {
			buddyUI.window.subHeader( userUI.element );
			show( userUI.element );
			userUI = null;
		}
	}
	if( !options.is_login && !options.disable_login ) {
		ui.addApp("login", extend( { container: buddyUI.$.content }, options.loginOptions ) );
	}
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

	var mapId = function(a){ return isObject(a) ? a.id : a };
	var grepVisible = function(a){ return a.show != "invisible" && a.presence == "online"};
	var grepInvisible = function(a){ return a.show == "invisible"; };
	//some buddies online.
	buddy.bind("online", function( e, data){
		buddyUI.add(grep(data, grepVisible));
		buddyUI.update(data);
	});
	//some buddies offline.
	buddy.bind("offline", function( e, data){
		if ( options.showUnavailable ) {
			buddyUI.remove(map(data, mapId));
			buddyUI.add(data);
			//buddyUI.update(data);
		} else {
			buddyUI.remove(map(data, mapId));
		}
        
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
		userUI && buddyUI.window.subHeader( userUI.element );
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
	tpl_group: '<li><h4><em class="ui-icon ui-icon-triangle-1-s"></em><span><%=title%>(<%=count%>)</span></h4><hr class="webim-line ui-state-default" /><ul></ul></li>',
	tpl_li: '<li title="" class="webim-buddy-<%=show%>"><a href="<%=url%>" rel="<%=id%>" class="ui-helper-clearfix"><div id=":tabCount" class="webim-window-tab-count">0</div><em class="webim-icon webim-icon-<%=show%>" title="<%=human_show%>"><%=show%></em><img width="25" src="<%=pic_url%>" defaultsrc="<%=default_pic_url%>" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" /><strong><%=nick%></strong><span><%=status%></span></a></li>'
},{
	_init: function(){
		var self = this, options = self.options;
		self.groups = {
		};
		self.li = {
		};
		self.li_group = {
		};
        //added in 5.4
        self.on_li = {
        };
        self.on_li_group = {
        };
		self.size = 0;
        //id: "online" | "offline"
        self.presences = {
        }
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
			var val = this.value;
            if(val == undefined || val == "") {
                //show all when finished
                each(self.groups, function(n, grp) { show(grp.el) });
                each(self.on_li, function(n,li) { show(li); });
                each(self.li, function(n,li) { show(li); });
            } else {
                //hide all first
                each(self.groups, function(n, grp) { hide(grp.el) });      
                each(self.on_li, function(n,li) { hide(li); });
                each(self.li, function(n,li) { hide(li); });
                //show searched
                each(self.li, function(id, li){
                     if ( (li.text || li.innerHTML.replace(/<[^>]*>/g, "")).indexOf(val) >= 0 ) {
                         var grp = self.li_group[id];
                         if(grp) show(grp.el);
                         show(li);
                     }
                });
            }
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
    //FIXME Later: should be moved to model...
	titleCount: function(){
		var self = this, size = self.size, win = self.window, empty = self.$.empty, element = self.element;
        var ol_sz = 0;
        each(self.presences, function(id, p) { if(p.o) ol_sz++; });
		win && win.title(self.options.title + "(" + ol_sz + "/" + (size ? size : "0") + ")");
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

    //FIXME Later: should be moved to model...
    groupTitleCount: function(grp) {
        var self = this, oncnt = 0;
        if(grp.name == i18n("online_group")) {
            grp.title.innerHTML = grp.name + "(" + grp.count+")";
        } else {
            each(self.presences, function(id, p) { 
                if(p.o && p.g == grp.name) oncnt++; 
            });
            grp.title.innerHTML = grp.name + "(" + oncnt + "/" + grp.count+")";
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
        self.presences = {};
		hide( $.empty );
		self.notice("offline");
	},
	_updateInfo:function(el, info){
		var show = info.show ? info.show : "available";
		el.className = "webim-buddy-" + show;
		el = el.firstChild;
		el.setAttribute("href", info.url);
		el = el.firstChild;//tabCount...
		el = el.nextSibling;
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
	showCount:function( id, count ){
		var li = this.li;
		if( li[id] ){
			_countDisplay( li[id].firstChild.firstChild, count );
		}
	},
    isOnline: function(show) {
        return !((show == "unavailable") || (show == "hidden"));
    },
	_addOne:function(info, end) {
		var self = this, li = self.li, on_li = self.on_li, li_group = self.li_group, on_li_group = self.on_li_group;
        info.show = info.show || "available";
        if(self.options.online_group && self.isOnline(info.show)) {
            this._addOne2Grp(info, on_li, "online_group", on_li_group, false);
        }
        var group_name = info["group"] || "friend";
        this._addOne2Grp(info, li, group_name, li_group, end);
    },

    _addOne2Grp:function(info, li, group_name, li_group, end) {
		var self = this, id = info.id, ul = self.$.ul, on_li = self.on_li;
		if(!li[id]){
			if(li === self.li) {
                //to count online 
                self.presences[info.id] = {o: self.isOnline(info.show), g: i18n(group_name)};
                self.size++;
            }
			if(!info.default_pic_url)info.default_pic_url = "";
			info.status = stripHTML(info.status) || "&nbsp;";
			//info.show = info.show || "available";
			info.human_show = i18n(info.show);
			info.pic_url = info.pic_url || "";
			var el = li[id] = createElement(tpl(self.options.tpl_li, info));
			//self._updateInfo(el, info);
			var a = el.firstChild;
			addEvent(a, "click",function(e){
				preventDefault(e);
				self.showCount( id, 0 );
				self.trigger("select", [info]);
				this.blur();
			});
			var groups = self.groups, group_name = i18n(group_name), group = groups[group_name];
			if(!group){
				var g_el = createElement(tpl(self.options.tpl_group));
				hide( g_el );
				if(group_name == i18n("stranger")) end = true;
                if(group_name == i18n("online_group")) {
                    //insert firstchild
                    ul.insertBefore(g_el, ul.firstChild);
                } else {
                    if(end) {
                        ul.appendChild(g_el);
                        self._lastChild = g_el;
                    } else {
                        self._lastChild ? 
                            ul.insertBefore(g_el, ul.lastChild) :
                            ul.appendChild(g_el);
                    }
                }
				var li_el = g_el.lastChild
				  , trigger = g_el.firstChild
				  , _icon = trigger.firstChild
				  , openC = "ui-icon-triangle-1-s"
				  , closeC = "ui-icon-triangle-1-e"
				  , collapse = self.options.collapse;

				group = {
					name: group_name,
					el: g_el,
					count: 0,
                    online_count: 0,
					title: g_el.firstChild.lastChild,
					li: li_el
				};
				self.groups[group_name] = group;
				if( collapse === undefined ) {
					hide( _icon );
				} else {
					if ( collapse ) {
						replaceClass( _icon, openC, closeC );
						hide( li_el );
					}
					addEvent( trigger, "click", function(){
						if( hasClass(_icon, openC) ) {
							replaceClass( _icon, openC, closeC );
							hide( li_el );
						} else {
							replaceClass( _icon, closeC, openC );
							show( li_el );
						}
					} );
				}
			}
			if(group.count == 0) show(group.el);
			li_group[id] = group;
			group.li.appendChild(el);
			group.count++;
            self.groupTitleCount(group);
		}
	},

	_updateOne:function(info){
		var self = this, li = self.li, on_li = self.on_li, id = info.id;
		li[id] && self._updateInfo(li[id], info);
        on_li[id] && self._updateInfo(on_li[id], info);
        //added in 5.4... count online
        var show = info.show || "available";
        var group_name = i18n(info.group || "friend");
        var group = self.groups[group_name];
        if(group) { self.groupTitleCount(group); }
        self.presences[info.id] = {o: self.isOnline(show), g: group_name};
	},
	update: function(data){
		data = makeArray(data);
		for(var i=0; i < data.length; i++){
			this._updateOne(data[i]);
		}
		this.titleCount();
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
		//this.titleCount();
	},
	remove: function(ids){
		var self = this, id, el, li = self.li, group, li_group = self.li_group;
		ids = idsArray(ids);
		for(var i=0; i < ids.length; i++){
            var id = ids[i];
            self._removeOne(id, self.on_li, self.on_li_group);
            self._removeOne(id, self.li, self.li_group);
		}
		self.titleCount();
	},
    _removeOne: function(id, li, li_group) {
        var self = this, el = li[id];
        if(el){
            if(li == self.li) {
                self.size--;
                delete(self.presences[id]);
            }
            group = li_group[id];
            if(group){
                group.count--;
                if(group.count == 0)hide(group.el);
                self.groupTitleCount(group);
            }
            remove(el);
            delete(li[id]);
        }
    },
    
	select: function(id){
		var self = this, el = self.li[id];
		el && el.firstChild.click();
		return el;
	},
	active: function(id){
		var self = this; 
		if( !self.options.highlightable )
			return;
		if ( self._actived )
			removeClass( self._actived.firstChild, "ui-state-default ui-state-highlight" );
		if( !id ){
			self._actived = null;
			return;
		}
		var el = self.li[id];
		if( el ) {
			addClass( el.firstChild,  "ui-state-default ui-state-highlight" );
			self._actived = el;
		}
	},
	destroy: function(){
	}
});
