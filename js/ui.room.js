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
app("room", function( options ) {
	var ui = this, im = ui.im, room = im.room, setting = im.setting,u = im.data.user, layout = ui.layout;
	var roomUI = ui.room = new webim.ui.room(null).bind("select",function( e, info){
		ui.layout.addChat("room", info.id);
		ui.layout.focusChat("room", info.id);
	});
	layout.addWidget( roomUI, {
		container: "tab",
		title: i18n( "room" ),
		icon: "room"
	} );
	//
	im.setting.bind("update",function(key, val){
		//if(key == "buddy_sticky")roomUI.window.option("sticky", val);
	});
	room.bind("join",function( e, info){
		updateRoom(info);
	}).bind("leave", function( e, rooms){

	}).bind("block", function( e, id, list){
		setting.set("blocked_rooms",list);
		updateRoom(room.get(id));
		room.leave(id);
	}).bind("unblock", function( e, id, list){
		setting.set("blocked_rooms",list);
		updateRoom(room.get(id));
		room.join(id);
	}).bind("addMember", function( e, room_id, info){
		updateRoom(room.get(room_id));
	}).bind("removeMember", function( e, room_id, info){
		updateRoom(room.get(room_id));
	});
	//room
	function updateRoom(info){
		var nick = info.nick;
		info = extend({},info,{group:"group", nick: nick + "(" + (parseInt(info.count) + "/"+ parseInt(info.all_count)) + ")"});
		layout.updateChat(info);
		info.blocked && (info.nick = nick + "(" + i18n("blocked") + ")");
		roomUI.li[info.id] ? roomUI.update(info) : roomUI.add(info);
	}
});
widget("room",{
	template: '<div id="webim-room" class="webim-room webim-flex webim-box">\
		<div id=":search" class="webim-room-search ui-state-default ui-corner-all"><em class="ui-icon ui-icon-search"></em><input id=":searchInput" type="text" value="" /></div>\
			<div class="webim-room-content webim-flex">\
				<div id=":empty" class="webim-room-empty"><%=empty room%></div>\
					<ul id=":ul"></ul>\
						</div>\
							</div>',
	tpl_li: '<li title=""><a href="<%=url%>" rel="<%=id%>" class="ui-helper-clearfix"><img width="25" src="<%=pic_url%>" defaultsrc="<%=default_pic_url%>" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" /><strong><%=nick%></strong></a></li>'
},{
	_init: function(){
		var self = this;
		self.size = 0;
		self.li = {
		};
		self._count = 0;
		show(self.$.empty);
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

	},
	scroll:function(is){
		toggleClass(this.element, "webim-room-scroll", is);
	},
	_updateInfo:function(el, info){
		el = el.firstChild;
		el.setAttribute("href", info.url);
		el = el.firstChild;
		el.setAttribute("defaultsrc", info.default_pic_url ? info.default_pic_url : "");
		el.setAttribute("src", info.pic_url);
		el = el.nextSibling;
		el.innerHTML = info.nick;
		//el = el.nextSibling;
		//el.innerHTML = info.status;
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
			addEvent(a, "click",function(e){
				preventDefault(e);
				self.d("select", [info]);
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
	}
});
