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
		room.join( info.id, info.nick, function(){
			layout.addChat("room", info.id);
			layout.focusChat("room", info.id);
		} );
		for (var i = 0; i < buddies.length; i++) {
			var id = buddies[i];
			var msg = {
				type: "chat"
			  , to: id
			  , from: im.data.user.id
			  , nick: im.data.user.nick
			  , to_nick: buddy.get(id) && buddy.get(id).nick
			  , timestamp: (new Date()).getTime()
			  , body: "webim-event:invite|,|" + info.id + "|,|" + info.nick
			};
			(function(msg, i){
				setTimeout(function(){
					im.sendMessage( msg );
				}, i*500);
			})(msg, i);
		};
	});
	im.bind("event", function( e, events ) {
		for (var i = 0; i < events.length; i++) {
			var event = events[i].event;
			if( event && event[0] == "invite" ) {
				var id = event[1];
				room.join( id, event[2], function(){
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
	room.bind("join",function( e, info){
		updateRoom(info);
		//Save temporary room
		if( info.temporary ) {
			var data = []
			  , list = setting.get("temporary_rooms") || []
			  , has = false, up = false;
			for (var i = 0; i < list.length; i++) {
				if( list[i].id == info.id ) {
					has = true;
					up = list[i].nick != info.nick;
					list[i].nick = info.nick;
				}
				data.push( list[i] );
			};
			if( !has )
				data.push({id: info.id, nick: info.nick});
			if( !has || up )
				setting.set("temporary_rooms",data);
		}
	}).bind("leave", function( e, info){
		//Remove temporary room
		if( info.temporary ) {
			var data = []
			  , list = setting.get("temporary_rooms") || []
			  , has = false;
			for (var i = 0; i < list.length; i++) {
				if( list[i].id == info.id )
					has = true;
				else
					data.push( list[i] );
			};
			if( has )
				setting.set("temporary_rooms",data);
			roomUI.remove( info.id );
		}

	}).bind("block", function( e, id, list){
		var info = room.get(id);
		setting.set("blocked_rooms",list);
		updateRoom(info);
		room.leave(id);
	}).bind("unblock", function( e, id, list){
		var info = room.get(id);
		setting.set("blocked_rooms",list);
		updateRoom(info);
		room.join(id, info && info.nick);
	}).bind("addMember", function( e, room_id, info){
		updateRoom(room.get(room_id), true);
	}).bind("removeMember", function( e, room_id, info){
		updateRoom(room.get(room_id), true);
	});
	//room
	function updateRoom(info, ignore){
		var nick = info.nick;
		info = extend({},info,{group:"group", nick: nick + "(" + (parseInt(info.count) + "/"+ parseInt(info.all_count || info.count)) + ")"});
		layout.updateChat(info);
		info.blocked && (info.nick = nick + "(" + i18n("blocked") + ")");
		roomUI.li[info.id] ? roomUI.update(info) : ( !ignore && roomUI.add(info) );
	}
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
	tpl_li: '<li title=""><input class="webim-button ui-state-default ui-corner-all" type="button" value="<%=invite%>" /><a href="<%=url%>" rel="<%=id%>" class="ui-helper-clearfix"><div id=":tabCount" class="webim-window-tab-count">0</div><img width="25" src="<%=pic_url%>" defaultsrc="<%=default_pic_url%>" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" /><strong><%=nick%></strong></a></li>'
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
		el = el.firstChild.nextSibling;
		el.setAttribute("href", info.url);
		el = el.firstChild.nextSibling;
		el.setAttribute("defaultsrc", info.default_pic_url ? info.default_pic_url : "");
		el.setAttribute("src", info.pic_url);
		el = el.nextSibling;
		el.innerHTML = info.nick;
		return el;
	},
	_addOne:function(info, end){
		var self = this, li = self.li, id = info.id, ul = self.$.ul;
		self.size++;
		if(!li[id]){
			if(!info.default_pic_url)info.default_pic_url = "";
			var el = li[id] = createElement(tpl(self.options.tpl_li, info));
			//self._updateInfo(el, info);
			var a = el.firstChild;
			if( info.temporary ) {
				addEvent(a, "click",function(e){
					preventDefault(e);
					self.updateDiscussion( info );
				});
			} else {
				hide( a );
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
		  , buddies = buddy.all(true);
		self._discussion = info;
		var $ = this.$;
		$.name.value = info && info.nick.replace(/\([^\)]*\)/ig, "") || (self.options.user.nick + "的讨论组");
		for (var i = 0; i < buddies.length; i++) {
			var b = buddies[i];
			markup.push('<li><label for="webim-discussion-'+b.id+'"><input id="webim-discussion-'+b.id+'" type="checkbox" name="buddy" value="'+b.id+'" />'+b.nick+'</label></li>');
		};
		$.ul2.innerHTML = markup.join("");
		show( $.discussion );
		hide( $.list );
		hide( $.actions );
	},
	showCount:function( id, count ){
		var li = this.li;
		if( li[id] ){
			_countDisplay( li[id].firstChild.nextSibling.firstChild, count );
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


