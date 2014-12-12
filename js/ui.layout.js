//
/* webim layout :
 *
 options:
 attributes：

 methods:
 addWidget(widget, options)
 addShortcut(title,icon,link, isExtlink)
 chat(type, id)
 addChat(type, info, options)
 focusChat(type, id)
 updateChat(type, data)
 removeChat(type, id)

 online() //
 offline()

 activate(window) // activate a window

 destroy()

 events: 
 displayUpdate //ui displayUpdate

 */

app("layout", function( options ) {

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

	var layout = ui.layout = new webimUI.layout( null,extend({
		chatAutoPop: im.setting.get("msg_auto_pop")
	}, options, {
		ui: ui
	}) );

	im.setting.get("minimize_layout") ? layout.collapse() : layout.expand(); 

	im.bind("beforeOnline",function(){
		layout.changeState("ready");
	}).bind("online",function(e, data){
		layout.changeState("active");
		layout.options.user = data.user;
		_initStatus(im);
		//setting.set(data.setting);
	}).bind("offline", function(e, type, msg){
		type == "offline" && layout.removeAllChat();
		layout.updateAllChat();
		layout.changeState("stop");
	});

	//setting events
	setting.bind("update",function(e, key, val){
		if( "msg_auto_pop" == key ) {
			layout.options.chatAutoPop = val;
		} else if ( "minimize_layout" == key ) {
			(val ? layout.collapse() : layout.expand());
		}
	});

	buddy.bind("online", function(e, data){
		layout.updateChat("buddy", data);
	}).bind("offline", function(e, data){
		layout.updateChat("buddy", data);
	}).bind("update", function(e, data){
		layout.updateChat("buddy", data);
	});

	layout.bind("collapse", function(){
		setting.set("minimize_layout", true);
	});
	layout.bind("expand", function(){
		setting.set("minimize_layout", false);
	});

	//display status
	layout.bind("displayUpdate", function(e){
		_updateStatus(); //save status
	});

	(function(){
		//room  events TODO: Remove
		room.bind("memberAdded", function(e, room_id, info){
			var c = layout.chat("room", room_id);
			c && c.addMember(info.id, info.nick, info.id == im.data.user.id);
		}).bind("memberRemoved", function(e, room_id, info){
			var c = layout.chat("room", room_id);
			c && c.removeMember(info.id, info.nick);
		}).bind("updated", function(e, data){ //room data
			var c = layout.chat("room", data.id);
            c && c.updateRoom(data);
        
        });
	})();

	//all ready.
	//message
	im.bind("message", function(e, data){
		var show = false,
			l = data.length, d, uid = im.data.user.id, id, c, count = "+1";
		for(var i = 0; i < l; i++){
			d = data[i];
			id = d["id"], type = d["type"];
			c = layout.chat(type, id);
			c && c.status("");//clear status
			if(!c){	
				if (d.type === "chat"){
					layout.addChat(type, id, null, null, d.nick);
				}else{
					layout.addChat(type, id);  
				}
				c = layout.chat(type, id);
			}
			c && setting.get("msg_auto_pop") && !layout.activeTabId && layout.focusChat(id);
			c.window.notifyUser("information", count);
			var p = c.window.pos;
			(p == -1) && layout.setNextMsgNum(count);
			(p == 1) && layout.setPrevMsgNum(count);
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

	(function(){
		//history events
		history.bind("chat", function( e, id, data){
			var c = layout.chat("chat", id), count = "+" + data.length;
			if(c){
				c.history.add(data);
			}
			//(c ? c.history.add(data) : im.addChat(id));
		});
		history.bind("grpchat", function(e, id, data){
			var c = layout.chat("grpchat", id), count = "+" + data.length;
			if(c){
				c.history.add(data);
			}
			//(c ? c.history.add(data) : im.addChat(id));
		});
		history.bind("clear", function(e, type, id){
			var c = layout.chat(type, id);
			c && c.history.clear();
		});
	})();

	return layout;

	function _initStatus(im){
		if(__status)
			return layout.updateAllChat();
		// status start
		__status = true;
		var tabs = status.get("tabs"), 
			tabIds = status.get("tabIds"),
			//prev num
			p = status.get("p"),
			//focus tab
			a = status.get("a");

		tabIds && tabIds.length && tabs && each(tabs, function(k,v){
			var id = k.slice(2), type = k.slice(0,1);
            //fix issue #31
            if( type == "r" && !im.room.get(id) ) return;
            layout.addChat(type, id, {}, { isMinimize: true}); 
            layout.chat(k).window.notifyUser("information", v["n"]);
		});
		p && (layout.prevCount = p) && layout._fitUI();
		a && layout.focusChat(a);
		// status end
	}

	function _updateStatus(){
		var _tabs = {}
		  , panels = layout.panels;
		each(layout.tabs, function(n, v){
			_tabs[n] = {
				n: v._count()//,
				//t: panels[n].options.type //type: buddy,room
			};
		});
		var d = {
			//o:0, //has offline
			tabs: _tabs, // n -> notice count
			tabIds: layout.tabIds,
			p: layout.prevCount, //tab prevCount
			//b: layout.widget("buddy").window.isMinimize() ? 0 : 1, //is buddy open
			a: layout.activeTabId //tab activeTabId
		}
		status.set(d);
	}
});

widget("layout",{
	template: '<div id="webim" class="webim webim-state-ready">\
	<div class="webim-preload ui-helper-hidden-accessible">\
	<div id="webim-flashlib-c">\
	</div>\
	</div>\
	<div id=":layout" class="webim-layout"><iframe class="webim-bgiframe" frameborder="0" tabindex="-1" src="about:blank;" ></iframe><div class="webim-layout-bg ui-state-default ui-toolbar"></div><div class="webim-ui ui-helper-clearfix">\
	<div id=":shortcut" class="webim-shortcut">\
	</div>\
	<div class="webim-layout-r">\
	<div id=":panels" class="webim-panels">\
	<div class="webim-window-tab-wrap ui-widget webim-panels-next-wrap">\
	<div id=":next" class="webim-window-tab webim-panels-next ui-state-default">\
	<div id=":nextMsgCount" class="webim-window-tab-count">\
	0\
	</div>\
	<em class="ui-icon ui-icon-triangle-1-w"></em>\
	<span id=":nextCount">0</span>\
	</div>\
	</div>\
	<div id=":tabsWrap" class="webim-panels-tab-wrap">\
	<div id=":tabs" class="webim-panels-tab">\
	</div>\
	</div>\
	<div class="webim-window-tab-wrap ui-widget webim-panels-prev-wrap">\
	<div id=":prev" class="webim-window-tab webim-panels-prev ui-state-default">\
	<div id=":prevMsgCount" class="webim-window-tab-count">\
	0\
	</div>\
	<span id=":prevCount">0</span>\
	<em class="ui-icon ui-icon-triangle-1-e"></em>\
	</div>\
	</div>\
	<div class="webim-window-tab-wrap webim-collapse-wrap ui-widget">\
	<div id=":collapse" class="webim-window-tab webim-collapse ui-state-default" title="<%=collapse%>">\
	<em class="ui-icon ui-icon-circle-arrow-e"></em>\
	</div>\
	</div>\
	<div class="webim-window-tab-wrap webim-expand-wrap ui-widget">\
	<div id=":expand" class="webim-window-tab webim-expand ui-state-default" title="<%=expand%>">\
	<em class="ui-icon ui-icon-circle-arrow-w"></em>\
	</div>\
	</div>\
	</div>\
	<div id=":widgets" class="webim-widgets">\
	</div>\
	</div>\
	</div></div>\
	</div>',
	shortcutLength:5,
	chatAutoPop: true,
	tpl_shortcut: '<div class="webim-window-tab-wrap ui-widget webim-shortcut-item"><a class="webim-window-tab" href="<%=link%>" target="<%=target%>">\
	<div class="webim-window-tab-tip">\
	<strong><%=title%></strong>\
	</div>\
	<em class="webim-icon" style="background-image:url(<%=icon%>)"></em>\
	</a>\
	</div>',
	chatApp: "chat"
},{
	_init: function(element, options){
		var self = this, options = self.options;
		extend(self,{
			window: window,
			widgets : {},
			panels: {},
			tabWidth : 136,
			maxVisibleTabs: null,
			animationTime : 210,
			activeTabId : null,
			tabs : {},
			tabIds : [],
			nextCount : 0,
			prevCount : 0

		});
		if(options.unscalable){
			addClass(this.$.layout, "webim-layout-unscalable");
		}
		options.isMinimize && self.collapse();
		//self.addShortcut(options.shortcuts);
		//self._initEvents();
		//self.buildUI();
		//self.element.parent("body").length && self.buildUI();
		//
		//test
	},
	changeState: function(state){
		this.element.className = "webim webim-state-" + state;//ready,go,stop
	},
	_ready:false,
	buildUI: function(e){
		var self = this, $ = self.$;
		//var w = self.element.width() - $.shortcut.outerWidth() - $.widgets.outerWidth() - 55;
		var w = (windowWidth() - 45) - $.shortcut.offsetWidth - $.widgets.offsetWidth - 70 - 105;
		self.maxVisibleTabs = parseInt(w / self.tabWidth);
		self._fitUI();
		if( !self.options.disableResize )
			self._autoResizeWindow();
		self._ready = true;
	},
	_autoResizeWindow: function(){
		var self = this, $ = self.$
		  , width = $.widgets.offsetWidth;
		for( var key in self.widgets ) {
			var window = self.widgets[key] && self.widgets[key].window;
			window = window && window.$ && window.$.window;
			if( window )
				window.style.width = width + "px";
		}
	},
	_updatePrevCount: function(activeId){
		var self = this, tabIds = self.tabIds, max = self.maxVisibleTabs, len = tabIds.length, id = activeId, count = self.prevCount;
		if (len <= max) 
			return;
		if (!id) {
			count = len - max;
		}
		else {
			var nn = 0;
			for (var i = 0; i < len; i++) {
				if (tabIds[i] == id) {
					nn = i;
					break;
				}
			}
			if (nn <= count) 
				count = nn;
			else 
				if (nn >= count + max) 
					count = nn - max + 1;
		}
		self.prevCount = count;
	},
	_setVisibleTabs: function(all){
		var self = this, numPrev = self.prevCount, upcont = numPrev + self.maxVisibleTabs, tabs = self.tabs, tabIds = self.tabIds;
		var len = tabIds.length, nextN = 0, prevN = 0;
		for (var i = 0; i < len; i++) {
			var tab = tabs[tabIds[i]];
			if (i < numPrev || i >= upcont) {
				if (all) 
					show(tab.element);
				else {
					if (self.activeTabId == tabIds[i]) 
						tab.minimize();
					var n = tab._count();
					if (i < numPrev) {
						prevN += n;
						tab.pos = 1;
					}
					else {
						nextN += n;
						tab.pos = -1;
					}
					hide(tab.element);
				}
			}
			else {
				tab.pos = 0;
				show(tab.element);
			}
		}
		if (!all) {
			self.setNextMsgNum(nextN);
			self.setPrevMsgNum(prevN);
		}
	},
	setNextMsgNum: function(num){
		_countDisplay(this.$.nextMsgCount, num);
	},
	setPrevMsgNum: function(num){
		_countDisplay(this.$.prevMsgCount, num);
	},
	slideing: false,
	_slide: function(direction){
		var self = this, pcount = self.prevCount, ncount = self.nextCount;

		if ((ncount > 0 && direction == -1) || (pcount > 0 && direction == 1)) {

			self.slideing = true;
			if (ncount == 1 && direction == -1 || pcount == 1 && direction == 1) {

				self.slideing = false;
			}

			self._slideSetup(false);
			self._setVisibleTabs(true);

			if (direction == -1) {
				self.nextCount--;
				self.prevCount++;
			}
			else 
				if (direction == 1) {
					self.nextCount++;
					self.prevCount--;
				}

				var tabs = self.$.tabs, old_left = parseFloat(tabs.style.left), 
					left = -1 * self.tabWidth * self.nextCount, 
					times = parseInt(500/13),
					i = 1,
					pre = (left - old_left)/times;
				var time = setInterval(function(){
					tabs.style.left = old_left + pre*i + 'px';
					if(i == times){
						if (self.slideing) 
							self._slide(direction);
						else {
							self._fitUI();
							self._slideReset();
						}
						clearInterval(time);
						return;
					}
					i++;
				},13);
		}

	},
	_slideUp: function(){
		this.slideing = false;

	},
	_slideSetup: function(reset){
		var self = this, $ = self.$, tabsWrap = $.tabsWrap, tabs = $.tabs;

		if (!self._tabsWidth) {
			self._tabsWidth = tabs.clientWidth;
		}
		if (reset) {
			self._tabsWidth = null;
		}
		tabsWrap.style.position = reset ? '' : 'relative';
		tabsWrap.style.overflow = reset ? 'visible' : 'hidden';
		tabsWrap.style.width = reset ? '' : self._tabsWidth + "px";
		tabs.style.width = reset ? '' : self.tabWidth * self.tabIds.length + "px";
		tabs.style.position = reset ? '' : 'relative';
	},
	_slideReset: function(){
		this._slideSetup(true);

	},
	_updateCount: function(){
		var self = this, tabIds = self.tabIds, max = self.maxVisibleTabs, len = tabIds.length, pcount = self.prevCount, ncount = self.nextCount;
		if (len <= max) {
			ncount = 0;
			pcount = 0;
		}
		else {
			ncount = len - max - pcount;
			ncount = ncount < 0 ? 0 : ncount;
			pcount = len - max - ncount;
		}
		self.prevCount = pcount;
		self.nextCount = ncount;
	},
	_updateCountUI: function(){
		var self = this, $ = self.$, pcount = self.prevCount, ncount = self.nextCount;
		if (ncount <= 0) {
			addClass($.next, 'ui-state-disabled');
		}
		else {
			removeClass($.next, 'ui-state-disabled');
		}
		if (pcount <= 0) {
			addClass($.prev, 'ui-state-disabled');
		}
		else {
			removeClass($.prev, 'ui-state-disabled');
		}
		if (pcount > 0 || ncount > 0) {
			$.next.style.display = "block";
			$.prev.style.display = "block";
		}
		else {
			hide($.next);
			hide($.prev);
		}
		$.nextCount.innerHTML = ncount.toString();
		$.prevCount.innerHTML = pcount.toString();
	},
	_initEvents: function(){
		var self = this, win = self.window, $ = self.$;
		//Ie will call resize events after onload.
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
	isMinimize: function(){
		return hasClass(this.$.layout, "webim-layout-minimize");
	},
	collapse: function(){
		var self = this;
		if(self.isMinimize()) return;
		addClass(this.$.layout, "webim-layout-minimize");
	},
	expand: function(){
		var self = this;
		if(!self.isMinimize()) return;
		removeClass(self.$.layout, "webim-layout-minimize");
	},
	_displayUpdate:function(e){
		this._ready && this.trigger("displayUpdate");
	},
	_fitUI: function(){
		var self = this, $ = self.$, widgets = $.widgets;
		self._updateCount();
		self.$.tabs.style.left = -1 * self.tabWidth * self.nextCount + 'px';
		self._updateCountUI();
		self._setVisibleTabs();
		//self.tabs.height(h);
		self._displayUpdate();
	},
	_stickyWin: null,
	_widgetStateChange:function(win, state){
		var self = this;
		if(state != "minimize"){
			each(self.widgets, function(key, val){
				if(val.window != win){
					val.window.minimize();
				}
			});
		}
		self._displayUpdate();
	},
	widget:function(name){
		return this.widgets[name];
	},
	addWidget: function(widget, options, before, container){
		var self = this, options = extend(options,{closeable: false, subHeader: widget.header});
		var win, el = widget.element;
		win = new webimUI.window(null, options);
		win.html(el);
		self.$[container ? container : "widgets"].insertBefore(win.element, before && self.widgets[before] ? self.widgets[before].window.element : null);
		widget.window = win;
		win.bind("displayStateChange", function(e, state){ self._widgetStateChange(this, state);});
		self.widgets[widget.name] = widget;
	},
	focusChat: function(type, id){
		id = _id_with_type(type, id);
		var self = this, tab = self.tabs[id], panel = self.panels[id];
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
	_onChatClose:function(id){
		var self = this;
		self.tabIds = grep(self.tabIds, function(v, i){
			return v != id;
		});
		delete self.tabs[id];
		delete self.panels[id];
		self._changeActive(id, true);
		self._fitUI();
	},
	_onChatChange:function(id, type){
		var self = this;
		if(type == "minimize"){
			self._changeActive(id, true);
			self._displayUpdate();
		}else{
			self._changeActive(id);
			self._fitUI();
		}
	},
	_changeActive: function(id, leave){
		var self = this, a = self.activeTabId;
		if(leave){
			a == id && (self.activeTabId = null);
		}else{
            var activeTab = self.tabs[a];
            //fixed in 5.5
            //don't minimize if detached
			a && a != id && !activeTab.isDetached() && activeTab.minimize();
			self.activeTabId = id;
			self._updatePrevCount(id);
		}
	},
	addChat: function(type, id, chatOptions, winOptions, nick){
		type = _tr_type(type);
		var self = this;
		if(self.chat(type, id))return;

		var  panels 	= self.panels;
		var panelId = _id_with_type(type, id);

		var win = self.tabs[panelId] = new webimUI.window(null, extend({
			isMinimize: self.activeTabId || !self.options.chatAutoPop,
			tabWidth: self.tabWidth -2,
            detachable: self.options.detachable || false,
			maximizable: self.options.maximizable || false,
			titleVisibleLength: 9
		}, winOptions))
			.bind("close", function(){ 
				self._onChatClose(panelId)
			})
			.bind("displayStateChange", function(e, state){ 
				self._onChatChange(panelId,state)
			});

		var widget = self.options.ui.addApp(self.options.chatApp, extend({
			id: id, 
			type: type, 
			nick: nick, 
			window: win
		}, chatOptions ));

		panels[panelId] = widget;
		self.tabIds.push(panelId);
		self.$.tabs.insertBefore(win.element, self.$.tabs.firstChild);
		!win.isMinimize() && self._changeActive(panelId);
		self._fitUI();
		//else self.focusChat(panelId);
		return win;
	},
	removeChat: function(type, id){
		//ids = idsArray(ids);
		//var self = this, id, l = ids.length, tab;
		//for(var i = 0; i < l; i++){
		//tab = this.tabs[ids[i]];
		var tab = this.tabs[_id_with_type(type, id)];
		tab && tab.close();
		//}
	},
	removeAllChat: function(){
		each(this.tabs, function(n, tab){
			tab.close();
		});
	},
	addShortcut: function(data){
		var self = this;
		if(isArray(data)){
			each(data, function(n,v){
				self.addShortcut(v);
			});
			return;
		}
		if(!isObject(data)) return;
		var content = self.$.shortcut, temp = self.options.tpl_shortcut;
		if(content.childNodes.length > self.options.shortcutLength + 1)return;
		temp = createElement(tpl(temp,{title: i18n(data.title), icon: data.icon, link: data.link, target: data.isExtlink ? "_blank" : ""}));

		hoverClass(temp.firstChild, "ui-state-hover");
		content.appendChild(temp);
	}

});

function windowWidth(){
	return document.compatMode === "CSS1Compat" && document.documentElement.clientWidth || document.body.clientWidth;
}
function _id_with_type(type, id){
	return id ? (type == "b" || type == "buddy" || type == "chat" ? ("b_" + id) : ("r_" + id)) : type;
}

function _tr_type(type){
	return type == "b" || type == "buddy" || type == "chat" ? "buddy" : "room";
}


