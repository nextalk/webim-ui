//
/* ui.room:
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

function ruid () {
	return 'xx4xyxyxxxyxyyxy'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

app("room", function( options ) {
	var ui = this, im = ui.im, room = im.room, setting = im.setting,user = im.data.user, layout = ui.layout, buddy = im.buddy;
	var roomUI = ui.room = new webim.ui.room(null, extend(options, { buddy: buddy, user: user })).bind("select",function(e, info){
		layout.addChat("room", info.id);
		layout.focusChat("room", info.id);
	}).bind("discussion", function( e, info, buddies ){
		info.id = info.id || ruid();
		room.invite( info.id, info.nick, buddies, function(){
			layout.addChat("room", info.id);
			layout.focusChat("room", info.id);
		} );
	}).bind("exit", function(e, id) {
        var r = room.get(id);
        if( r && window.confirm(i18n("Exit Room", {name: r.nick})) ) {
            room.leave( id );
            layout.removeChat("room", id);
        }
	});
	im.bind("event", function( e, events ) {
		for (var i = 0; i < events.length; i++) {
			var event = events[i].event;
			if( event && event[0] == "invite" ) {
				var id = event[1];
				room.join( id, event[2], function(){
                    //TODO: no need this callback?
					//layout.addChat("room", id);
				} );
			}
		};
	});
	layout.addWidget( roomUI, {
		title: i18n( "room" ),
		icon: "room",
		sticky: im.setting.get("buddy_sticky"),
		onlyIcon: true,
		isMinimize: true
	} );
	im.setting.bind("update",function(e, key, val){
		if(key == "buddy_sticky")roomUI.window.options.sticky = val;
	});
	room.bind("updated",function(e, info){
        //FIXME: info is a room list??
		updateRoom(info);
	}).bind("leaved", function(e, id){
        //TODO:
        roomUI.remove([id]);
		//updateRoom(info);
	}).bind("blocked", function( e, id, list){
		var info = room.get(id);
		updateRoom(info);
		//room.leave(id);
	}).bind("unblocked", function( e, id, list){
		var info = room.get(id);
		updateRoom(info);
		//room.join(id, info && info.nick);
	});
	//room
	function updateRoom(info){
		var nick = info.nick;
        if(info.all_count === 0) {
            info = extend({}, info, {group:"group", nick: nick});
        } else {
            info = extend({},info,{group:"group", nick: nick + "[" + (parseInt(info.count) + "/"+ parseInt(info.all_count || info.count)) + "]"});
        }
		layout.updateChat(info);
		info.blocked && (info.nick = nick + "[" + i18n("blocked") + "]");
		roomUI.li[info.id] ? roomUI.update(info) : roomUI.add(info);
	}
	hide( roomUI.$.actions );
	im.bind( "beforeOnline", function(){
	}).bind("online", function() {
		show( roomUI.$.actions );
	}).bind( "offline", function( type, msg ) {
		hide( roomUI.$.actions );
		roomUI.removeAll();
	});
	return roomUI;

});
widget("room",{
	template: '<div id="webim-room" class="webim-room webim-flex webim-box">\
	<div id=":list">\
	<div id=":search" class="webim-room-search ui-state-default ui-corner-all"><em class="ui-icon ui-icon-search"></em><input id=":searchInput" type="text" value="" /></div>\
	<div class="webim-room-content webim-flex">\
	<div id=":empty" class="webim-room-empty"><%=empty room%></div>\
	<ul id=":ul"></ul>\
	</div>\
	</div>\
	<div id=":discussion" style="display:none;" class="webim-room-discussion">\
	<h4><%=discussion%></h4>\
	<div><p><%=discussion name%></p><input id=":name" class="webim-room-discussion-name" type="text" /></div>\
	<div><p><%=select discussion buddies%></p><ul class="webim-room-discussion-list ui-widget-content" id=":ul2"></ul></div>\
	<div><a id=":confirm" href="#" class="webim-button ui-state-default ui-corner-all"><%=confirm%></a><a id=":cancel" href="#" class="webim-button ui-state-default ui-corner-all"><%=cancel%></a></div>\
	</div>\
	<div id=":actions" class="webim-room-actions"><a id=":create" href="#" class="webim-button ui-state-default ui-corner-all"><%=create discussion%></a></div>\
	</div>',
	tpl_li: '<li title=""><input class="webim-button ui-state-default ui-corner-all" type="button" value="<%=exit%>" /><input class="webim-button ui-state-default ui-corner-all" type="button" value="<%=invite%>" /><a href="<%=url%>" rel="<%=id%>" class="ui-helper-clearfix"><div id=":tabCount" class="webim-window-tab-count">0</div><img width="25" src="<%=avatar%>" defaultsrc="<%=default_avatar%>" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" /><strong><%=nick%></strong></a></li>'
},{
	_init: function(){
		var self = this;
		self.size = 0;
		self.li = {
		};
		self._count = 0;
		show(self.$.empty);
		if( !self.options.discussion )
			hide( self.$.create );

		//self._initEvents();
	},
	_initEvents: function(){
		var self = this, $ = self.$, search = $.search, input = $.searchInput, placeholder = i18n("search room"), activeClass = "ui-state-active";
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
		addEvent( $.create, "click", function(e){
			preventDefault( e );
			self.updateDiscussion();
		});
		addEvent( $.confirm, "click", function(e){
			preventDefault( e );
			self.confirmDiscussion();
		});
		addEvent( $.cancel, "click", function(e){
			preventDefault( e );
			self.confirmDiscussion(true);
		});
	},
	scroll:function(is){
		toggleClass(this.element, "webim-room-scroll", is);
	},
	_updateInfo:function(el, info){
		el = el.firstChild.nextSibling.nextSibling;
		el.setAttribute("href", info.url);
		el = el.firstChild.nextSibling;
		el.setAttribute("defaultsrc", info.default_avatar ? info.default_avatar : "");
		el.setAttribute("src", info.avatar);
		el = el.nextSibling;
		el.innerHTML = info.nick;
		return el;
	},
	_addOne:function(info, end){
		var self = this, li = self.li, id = info.id, ul = self.$.ul;
		self.size++;
		if(!li[id]){
			if(!info.default_avatar)info.default_avatar = "";
			var el = li[id] = createElement(tpl(self.options.tpl_li, info));
			//self._updateInfo(el, info);
			var exit = el.firstChild;
			var a = el.firstChild.nextSibling;
			if( info.temporary ) {
				addEvent(exit, "click",function(e){
					preventDefault(e);
					self.trigger( "exit", [id] );
				});
				addEvent(a, "click",function(e){
					preventDefault(e);
					self.updateDiscussion( info );
				});
			} else {
				hide( a );
				hide( exit );
			}
			addEvent(a.nextSibling, "click",function(e){
				preventDefault(e);
				self.showCount( id, 0 );
				self.trigger("select", [info]);
				this.blur();
			});
			ul.appendChild(el);
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
	add: function(data){
		var self = this;
		hide(self.$.empty);
		data = makeArray(data);
		for(var i=0; i < data.length; i++){
			self._addOne(data[i]);
		}
		if(self.size > 8){
			self.scroll(true);
		}
	},
	removeAll: function(){
		var ids = [], li = this.li;
		for(var k in li){
			ids.push(k);
		}
		this.remove(ids);
	},
	remove: function(ids){
		var id, el, li = this.li;
		ids = idsArray(ids);
		for(var i=0; i < ids.length; i++){
			id = ids[i];
			el = li[id];
			if(el){
				remove(el);
				delete(li[id]);
			}
		}
	},
	select: function(id){
		var self = this, el = self.li[id];
		el && el.firstChild.click();
		return el;
	},
	destroy: function(){
	},
	confirmDiscussion: function( cancel ){
		var self = this, $ = self.$;
		hide( $.discussion );
		show( $.list );
		show( $.actions );
		if( !cancel ) {
			var info = self._discussion || {};
			info.temporary = true;
			info.nick = $.name.value || i18n("discussion");
			var els = $.ul2.getElementsByTagName("input")
			  , ids = [];
			for (var i = 0; i < els.length; i++) {
				var el = els[i];
				if( el.checked )
					ids.push( el.value );
			};
			self.trigger( "discussion", [info, ids] );
		}
	},
	updateDiscussion: function( info ){
		var self = this
		  , buddy = self.options.buddy
		  , markup = []
          //all buddies
		  , buddies = buddy.all(); 
		self._discussion = info;
		var $ = this.$;
		$.name.value = info && info.nick.replace(/\([^\)]*\)/ig, "") || (i18n("discussion name input", {name: self.options.user.nick}));
		for (var i = 0; i < buddies.length; i++) {
			var b = buddies[i];
            var clz = b.show && (b.show == "unavailable" || b.show == "hidden") ? "ui-state-disabled" : "";
			markup.push('<li class="'+clz+'"><label for="webim-discussion-'+b.id+'"><input id="webim-discussion-'+b.id+'" type="checkbox" name="buddy" value="'+b.id+'" />'
                    +b.nick+'-'+i18n(b.group)+'</label></li>');
		};
		$.ul2.innerHTML = markup.join("");
		show( $.discussion );
		hide( $.list );
		hide( $.actions );
	},
	showCount:function( id, count ){
		var li = this.li;
		if( li[id] ){
			_countDisplay( li[id].firstChild.nextSibling.nextSibling.firstChild, count );
		}
	},
	active: function(id){
		var self = this; 
		if( !self.options.highlightable )
			return;
		if ( self._actived )
			removeClass( self._actived.firstChild.nextSibling, "ui-state-default ui-state-highlight" );
		if( !id ){
			self._actived = null;
			return;
		}
		var el = self.li[id];
		if( el ) {
			addClass( el.firstChild.nextSibling,  "ui-state-default ui-state-highlight" );
			self._actived = el;
		}
	}
});


