//
/* ui.chat:
 *
 options:
 window
 history

 methods:
 update(info)
 status(type)
 insert(text, isCursorPos)
 focus
 notice(text, timeOut)
 destroy()

 events: 
 sendMessage
 sendStatus

 */

app( "chat", function( options ) {
	options = options || {};
	var ui = this, 
		im = ui.im,
		buddy = im.buddy,
		room = im.room,
		history = im.history,
		id = options.id,
		type = options.type;
	if( type == "room" ) {

		var h = history.get( "multicast", id );
		if( !h )
			history.load( "multicast", id );

		var info = im.room.get(id) || {
			id: id,
			nick: options.nick || id
		};
		info.presence = "online";

		options = extend( {
			info: info,
			user: im.data.user
		}, ui.options.roomChatOptions, { 
			history: h, 
			block: true, 
			emot: true, 
			clearHistory: false, 
			member: true, 
			type: type, 
			downloadHistory: false 
		}, options );

		var chatUI = new webimUI.chat( null, options );

		chatUI.bind( "sendMessage", function( e, msg ) {
			im.sendMessage( msg );
			history.set( msg );
		}).bind("downloadHistory", function( e, info ){
			history.download( "multicast", info.id );
		}).bind("select", function( e, info ) {
			info.presence = "online";
			buddy.presence( info );//online
			ui.layout.addChat( "buddy", info.id, info.nick );
			ui.layout.focusChat( "buddy", info.id );
		}).bind("block", function( e, d ){
			room.block( d.id );
		}).bind("unblock", function( e, d ) {
			room.unblock( d.id );
		}).bind( "destroy", function() {
			chatUI.options.info.blocked && room.leave(id);
		});
		setTimeout( function(){
			if( chatUI.options.info.blocked )
				room.join( id );
			else room.initMember( id );
		}, 500 );
		isArray( info.members ) && each( info.members, function( n, info ){
			chatUI.addMember( info.id, info.nick, info.id == im.data.user.id );
		} );

	} else {
		var h = history.get( "unicast", id );
		if( !h )
			history.load( "unicast", id );

		var info = im.buddy.get(id) || {
			id: id,
			nick: options.nick || id
		};

		options = extend( {
			info: info,
			user: im.data.user
		}, ui.options.buddyChatOptions, { 
			history: h, 
			block: false, 
			emot: true, 
			clearHistory: true, 
			member: false, 
			msgType: "unicast"
		}, options );

		var chatUI = new webimUI.chat( null, options );

		if(!im.buddy.get(id)) 
			im.buddy.update(id);

		chatUI.bind("sendMessage", function( e, msg ) {
			im.sendMessage( msg );
			history.set( msg );
		}).bind("sendStatus", function( e, msg ) {
			im.sendStatus( msg );
		}).bind("clearHistory", function( e, info ){
			history.clear( "unicast", info.id );
		}).bind("downloadHistory", function( e, info ) {
			history.download( "unicast", info.id );
		});
	}
	return chatUI;
} );

widget("chat",{
	tpl_header: '<div><div id=":user" class="webim-user"> \
	<a id=":userPic" class="webim-user-pic ui-corner-all ui-state-active" href="#id"><img width="50" height="50" src="" defaultsrc="" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" class="ui-corner-all"></a> \
	<span id=":userStatus" title="" class="webim-user-status">&nbsp;</span> \
	</div></div>',
	template:'<div id=":container" class="webim-chat webim-box webim-flex"> \
	<div class="webim-chat-notice-wrap"><div id=":notice" class="webim-chat-notice ui-state-highlight"></div></div> \
	<div id=":content" class="webim-chat-content webim-flex webim-box-h"> \
	<div id=":sidebar" class="webim-chat-sidebar webim-box"></div><div class="webim-flex webim-box"><div id=":main" class="webim-chat-main webim-flex"><div id=":status" class="webim-chat-status webim-gray"></div></div></div> \
	</div> \
	<div id=":actions" class="webim-chat-actions"> \
	<div id=":toolContent" class="webim-chat-tool-content"></div>\
	<div id=":tools" class="webim-chat-tools ui-helper-clearfix ui-state-default"></div>\
	<table class="webim-chat-t" cellSpacing="0"> \
	<tr> \
	<td style="vertical-align:top;"> \
	<em class="webim-icon webim-icon-chat-edit"></em>\
	</td> \
	<td style="vertical-align:top;width:100%;"> \
	<div class="webim-chat-input-wrap">\
	<textarea id=":input" class="webim-chat-input webim-gray ui-widget-content"><%=input notice%></textarea> \
	</div> \
	</td> \
	</tr> \
	</table> \
	</div> \
	</div>'
},{
	_init: function(){
		var self = this, element = self.element, options = self.options, win = options.window;
		var history = self.history = new webimUI.history(null,{
			user: options.user,
			info: options.info
		});
		addClass( element, "webim-chat-" + options.type );
		self.$.main.insertBefore(history.element, self.$.main.firstChild);
		self.header = createElement( tpl( options.tpl_header ) );
		extend( self.$, mapElements( self.header ) );
		self._initEvents();
		if( win ) {
			self.setWindow( win );
		}
		if( options.simple ) {
			hide( self.header );
		}
		self.update(options.info);
		history.add(options.history);
		plugin.call(self, "init", [null, self.ui()]);
		setTimeout(function(){
			self._adjustContent();
		},0);
	},
	setWindow: function( win, notInsert ) {
		var self = this;
		self.window = win;
		win.subHeader( self.header );
		!notInsert && win.html( self.element );
		win.title( self.options.info.nick );
		self._bindWindow();
	},
	update: function(info){
		var self = this;
		if(info){
			self.options.info = info;
			self.history.options.info = info;
			self._updateInfo(info);
		}
		var userOn = self.options.user.presence == "online";
		var buddyOn = self.options.info.presence == "online";
		if(!userOn){
			self.notice(i18n("user offline notice"));
		}else if(!buddyOn){
			self.notice(i18n("buddy offline notice",{name: self.options.info.nick}));
		}else{
			self.notice("");
		}
		plugin.call(self, "update", [null, self.ui()]);
	},
	focus: function(){
		//this.$.input.focus();
		//fix firefox
		var item = this.$.input;
		window.setTimeout(function(){
			try{item.focus()}catch(e){};
		},0);
	},
	_noticeTime: null,
	_noticeTxt:"",
	notice: function(text, timeOut){
		var self = this, content = self.$.notice, time = self._noticeTime;
		if(time)clearTimeout(time);
		if(!text){
			self._noticeTxt = null;
			hide(content);
			return;
		}
		if(timeOut){
			content.innerHTML = text;
			show(content);
			setTimeout(function(){
				if(self._noticeTxt)
					content.innerHTML = self._noticeTxt;
				else hide(content, 500);
			}, timeOut);

		}else{
			self._noticeTxt = text;
			content.innerHTML = text;
			show(content);
		}
	},
	_adjustContent: function(){
		var main = this.$.main;
		//Don't auto scroll when user view history.
		//if ( main.scrollHeight - main.scrollTop - main.clientHeight < 200 )
		if( main.scrollTop != main.scrollHeight)
			main.scrollTop = main.scrollHeight;
	},
	_fitUI: function(e){
		var self = this, win = self.window, $ = self.$;
		self._adjustContent();

	},
	_bindWindow: function(){
		var self = this, win = self.window;
		win.bind("displayStateChange", function(e, type){
			if(type != "minimize"){
				//fix firefox
				window.setTimeout(function(){self.$.input.focus();},0);
				//self.$.input.focus();
				self._adjustContent();
			}
		}).bind("close", function(){
			self.destroy();
		});
		//win.bind("resize",{self: self}, self._fitUI);
	},
	_inputAutoHeight:function(){
		var el = this.$.input, scrollTop = el[0].scrollTop;
		if(scrollTop > 0){
			var h = el.height();
			if(h> 32 && h < 100) el.height(h + scrollTop);
		}
	},
	_sendMessage: function(val){
		var self = this, options = self.options, info = options.info;
		var msg = {
			type: options.type == "room" ? "multicast" : "unicast",
			to: info.id,
			from: options.user.id,
			nick: options.user.nick,
			//stype: '',
			offline: info.presence != "online",
			timestamp: (new Date()).getTime(),
			body: val
		};
		plugin.call(self, "send", [null, self.ui({msg: msg})]);
		self.trigger('sendMessage', [msg]);
		//self.sendStatus("");
	},
	_inputkeypress: function(e){
		var self =  this, $ = self.$;
		if (e.keyCode == 13){
			if(e.ctrlKey){
				self.insert("\n", true);
				return true;
			}else{
				var el = target(e), val = el.value;
				// "0" will false
				if (trim(val).length) {
					self._sendMessage( val );
					el.value = "";
					preventDefault(e);
				}
			}
		}
		else self._typing();

	},
	_onFocusInput: function(e){
		var self = this, el = target(e);

		//var val = el.setSelectionRange ? el.value.substring(el.selectionStart, el.selectionEnd) : (window.getSelection ? window.getSelection().toString() : (document.selection ? document.selection.createRange().text : ""));
		var val = window.getSelection ? window.getSelection().toString() : (document.selection ? document.selection.createRange().text : "");
		if(!val){
			//self.$.input.focus();
			//fix firefox
			window.setTimeout(function(){self.$.input.focus();},0);
		}
	},
	_initEvents: function(){
		var self = this, options = self.options, $ = self.$, placeholder = i18n("input notice"), gray = "webim-gray", input = $.input;

		self.history.bind("update", function(){
			self._adjustContent();
		}).bind("clear", function(){
			self.notice(i18n("clear history notice"), 3000);
		});
		//输入法中，进入输入法模式时keydown,keypress触发，离开输入法模式时keyup事件发生。
		//autocomplete之类事件放入keyup，回车发送事件放入keydown,keypress

		addEvent(input,'keyup',function(){
			ieCacheSelection.call(this);
		});
		addEvent(input,"click", ieCacheSelection);
		addEvent(input,"select", ieCacheSelection);
		addEvent(input,'focus',function(){
			removeClass(this, gray);
			if(this.value == placeholder)this.value = "";
		});
		addEvent(input,'blur',function(){
			if(this.value == ""){
				addClass(this, gray);
				this.value = placeholder;
			}
		});
		addEvent(input,'keypress',function(e){
			self._inputkeypress(e);
		});
		addEvent($.main, "click", function(e){self._onFocusInput(e)});

	},
	_updateInfo:function(info){
		var self = this, $ = self.$;
		$.userPic.setAttribute("href", info.url);
		$.userPic.firstChild.setAttribute("defaultsrc", info.default_pic_url ? info.default_pic_url : "");
		setTimeout(function(){
			if(info.pic_url || info.default_pic_url) {
				try{$.userPic.firstChild.setAttribute("src", info.pic_url || info.default_pic_url);}catch(e){};
			}
		},100);
		$.userStatus.innerHTML = stripHTML(info.status) || "&nbsp";
		self.window && self.window.title( info.nick, info.show );
	},
	insert:function(value, isCursorPos){
		//http://hi.baidu.com/beileyhu/blog/item/efe29910f31fd505203f2e53.html
		var self = this,input = self.$.input;
		input.focus();
		if(!isCursorPos){
			input.value = value;
			return;
		}
		if(!value) value = "";
		if(input.setSelectionRange){
			var val = input.value, rangeStart = input.selectionStart, rangeEnd = input.selectionEnd, tempStr1 = val.substring(0,rangeStart), tempStr2 = val.substring(rangeEnd), len = value.length;  
			input.value = tempStr1+value+tempStr2;  
			input.setSelectionRange(rangeStart+len,rangeStart+len);
		}else if(document.selection){
			var caretPos = input.caretPos;
			if(caretPos){
				caretPos.text = value;
				caretPos.collapse();
				caretPos.select();
			}
			else{
				input.value += value;
			}
		}else{
			input.value += value;
		}
	},
	_statusText: '',
	sendStatus: function(show){
		var self = this;
		if (!show || show == self._statusText || self.options.info.presence == "offline") return;
		self._statusText = show;
		self.trigger('sendStatus', [ {
			to: self.options.info.id,
			show: show
		} ]);
	},
	_checkST: false,
	_typing: function(){
		var self = this;
		self.sendStatus("typing");
		if (self._checkST) 
			clearTimeout(self._checkST);
		self._checkST = window.setTimeout(function(){
			self.sendStatus('clear');
		}, 6000);
	},
	_setST: null,
	status: function(type){
		//type ['typing']
		type = type || 'clear';
		var self = this, el = self.$.status, nick = self.options.info.nick, markup = '';
		markup = type == 'clear' ? '' : nick + i18n(type);
		el.innerHTML = markup;
		self._adjustContent();
		if (self._setST)  clearTimeout(self._setST);
		if (markup != '') 
			self._setST = window.setTimeout(function(){
				el.innerHTML = '';
			}, 10000);
	},
	destroy: function(){
		this.trigger( "destroy" );
	},
	ui:function(ext){
		var self = this;
		return extend({
			self: self,
			$: self.$,
			history: self.history
		}, ext);
	},
	plugins: {}
});

/*
 webimUI.chat.defaults.fontcolor = true;
 plugin.add("chat","fontcolor",{
 init:function(e, ui){
 var chat = ui.self;
 var fontcolor = new webimUI.fontcolor();
 fontcolor.bind("select",function(e, alt){
 chat.focus();
 chat.setStyle("color", alt);
 });
 var trigger = createElement(tpl('<a href="#chat-fontcolor" title="<%=font color%>"><em class="webim-icon webim-icon-fontcolor"></em></a>'));
 addEvent(trigger,"click",function(e){
 preventDefault(e);
 fontcolor.toggle();
 });
 ui.$.toolContent.appendChild(fontcolor.element);
 ui.$.tools.appendChild(trigger);
 },
 send:function(e, ui){
 }
 });
 */

webimUI.chat.defaults.emot = true;
plugin.add("chat","emot",{
	init:function(e, ui){
		var chat = ui.self;
		var emot = new webimUI.emot();
		emot.bind("select",function( e, alt){

			chat.focus();
			chat.insert(alt, true);
		});
		var trigger = createElement(tpl('<a href="#chat-emot" title="<%=emot%>"><em class="webim-icon webim-icon-emot"></em></a>'));
		addEvent(trigger,"click",function(e){
			preventDefault(e);
			emot.toggle();
		});
		ui.$.toolContent.appendChild(emot.element);
		ui.$.tools.appendChild(trigger);
	},
	send:function(e, ui){
	}
});

webimUI.chat.defaults.clearHistory = true;
plugin.add("chat","clearHistory",{
	init:function(e, ui){
		var chat = ui.self;
		var trigger = createElement(tpl('<a href="#chat-clearHistory" title="<%=clear history%>"><em class="webim-icon webim-icon-clear"></em></a>'));
		addEvent(trigger,"click",function(e){
			preventDefault(e);
			chat.trigger("clearHistory",[chat.options.info]);
		});
		ui.$.tools.appendChild(trigger);
	}
});
webimUI.chat.defaults.block = true;
plugin.add("chat","block",{
	init:function(e, ui){
		var chat = ui.self;
		var blocked = chat.options.info.blocked,
			nick = chat.options.info.nick,
			block = createElement('<a href="#chat-block" style="display:'+(blocked ? 'none' : '')+'" title="'+ i18n('block group',{name:nick}) +'"><em class="webim-icon webim-icon-unblock"></em></a>'),
			unblock = createElement('<a href="#chat-block" style="display:'+(blocked ? '' : 'none')+'" title="'+ i18n('unblock group',{name:nick}) +'"><em class="webim-icon webim-icon-block"></em></a>');
		addEvent(block,"click",function(e){
			preventDefault(e);
			hide(block);
			show(unblock);
			chat.trigger("block",[chat.options.info]);
		});
		addEvent(unblock,"click",function(e){
			preventDefault(e);
			hide(unblock);
			show(block);
			chat.trigger("unblock",[chat.options.info]);
		});
		ui.$.tools.appendChild(block);
		ui.$.tools.appendChild(unblock);
	}
});
webimUI.chat.defaults.member = true;
extend(webimUI.chat.prototype, {
	addMember: function(id, nick, disable){
		var self = this, ul = self.$.member, li = self.memberLi;
		if(li[id])return;
		var el = createElement('<li><a class="'+ (disable ? 'ui-state-disabled' : '') +'" href="'+ id +'">'+ nick +'</a></li>');
		addEvent(el.firstChild,"click",function(e){
			preventDefault(e);
			disable || self.trigger("select", [{id: id, nick: nick}]);
		});
		li[id] = el;
		self.$.member.appendChild(el);
		self.$.memberCount.innerHTML = parseInt(self.$.memberCount.innerHTML) + 1;
	},
	removeMember: function(id){
		var self = this, el = self.memberLi[id];
		if(el){
			self.$.member.removeChild(el);
			delete self.memberLi[id];
			self.$.memberCount.innerHTML = parseInt(self.$.memberCount.innerHTML) - 1;
		}
	}
});
plugin.add( "chat", "member", {
	init:function(e, ui){
		var chat = ui.self, $ = ui.$;
		chat.memberLi = {};
		var member = createElement(tpl('<div class="webim-box webim-flex  webim-member ui-widget-content ui-corner-left"><iframe id=":bgiframe" class="webim-bgiframe" frameborder="0" tabindex="-1" src="about:blank;" ></iframe><h4><%=room member%>(<span id=":memberCount">0</span>)</h4><ul id=":ul" class="webim-flex"></ul></div>')), els = mapElements(member);
		$.member = els.ul;
		$.memberCount = els.memberCount;
		$.sidebar.appendChild( member );
	}
} );

webimUI.chat.defaults.downloadHistory = true;
plugin.add("chat","downloadHistory",{
	init:function(e, ui){
		var chat = ui.self;
		var trigger = createElement(tpl('<a style="float: right;" href="#chat-downloadHistory" title="<%=download history%>"><em class="webim-icon webim-icon-download"></em></a>'));
		addEvent(trigger,"click",function(e){
			preventDefault(e);
			chat.trigger("downloadHistory",[chat.options.info]);
		});
		ui.$.tools.appendChild(trigger);
	}
});

function ieCacheSelection(e){
	document.selection && (this.caretPos = document.selection.createRange());
}
