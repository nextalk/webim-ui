/* 
 * ui.chatbtn
 *
 * HTML页面:
 * <a class="webim-chatbtn" href="/chat/2">和我聊天</a>
 *
 * webim.$product.js:
 *
 * ui.addApp("chatbtn", {
 *  wrap: document.getElementById('wrap'),
 *  elementId: null,
 * 	classRe: /webim-chatbtn/,
 *  hrefRe: [/chat\/([^\/]+)/i],
 *  autoInsertlink: false,
 *  chatbox: false
 * });
 * 
 * TODO: 支持群组Link
 *
 * options:
 * methods:
 * 	on(buddies)
 * 	off(buddies)
 * 	idsArray()
 * 	offAll()
 * 	destroy()
 * 
 * events: 
 * 	select
 * 
 */

app("chatbtn", function(options) {
	var ui = this, im = ui.im;
	var chatbtn = ui.chatbtn = new webim.ui.chatbtn(null, options).bind("select", function(e, id, url){
		if(options.chatbox) {
			openChatbox(url);
		} else {
			ui.im.online();
			id = id.substr("webim-chatid-".length);
			ui.layout.addChat("buddy", id);
			ui.layout.focusChat("buddy", id);
			if( options && options.autoInsertlink ) {
				var chat = ui.layout.chat( "buddy", id );
				chat && chat.insert( window.location.href );
			}
		}
	});
	var grepVisible = function(a){ return a.show != "invisible" && a.show != "unavailable"};
	var grepInvisible = function(a){ return a.show == "invisible" };
	im.models['presence'].bind("online",function(e, data){
		chatbtn.on(data);
	}).bind("update",function(e, data){
		chatbtn.on(grep(data, grepVisible));
		chatbtn.off(grep(data, grepInvisible));
	}).bind("offline",function(e, data){
		chatbtn.off(data);
	});

	im.bind("beforeOnline", function( e, params ){
		params.chatlink_ids = chatbtn.idsArray();
	}).bind("online", function(e){
		chatbtn.off(im.data.user);
	}).bind("offline", function(e){
		chatbtn.offAll();
	});
});

widget("chatbtn",
{
	wrap: null,
	elementId: null,
	hrefRe: [/chat\/([^\/]+)/i],
	classRe: /webim-chatbtn/
},
{
	_init: function(){
		var self = this, element = self.element, list = self.list = {}, 
			options = self.options, anthors = self.anthors = {}, 
			hrefRe = options.hrefRe,
			elementId = options.elementId, 
			classRe = options.classRe,
			wrap = options.wrap || document;

		function parse_id(link, re){
			if(!link)return false;
			if(!re)return false;
			var re_len = re.length; 
			for(var i = 0; i < re_len; i++){
				var ex = re[i].exec(link);
				if(ex && ex[1]){
					return ex[1];
				}
			}
			return false;
		}
		var a, b;
		if( elementId ) {
			a = document.getElementById( elementId );
			a = a ? [ a ] : null;
		} else {
			a = wrap.getElementsByTagName("a");
		}
		a && each(a, function(i, el) {
			var id = parse_id(el.href, hrefRe), text = el.innerHTML;
			if(id && children(el).length == 0 && text && (elementId || classRe.test(el.className))){
				anthors[id] ? anthors[id].push(el) :(anthors[id] = [el]);
				list[id] = {id: id, name: text};
				var icon = createElement('<i class="webim-chaticon"><em></em></i>');
				el.appendChild( icon );
				el.icon = icon;
				el.title = i18n("offline");
				el.id = 'webim-chatid-' + id;
				//5.8: don't respond 'click' on mobile device
				if( !webim.isMobile() ) {
					addEvent(el, "click", function(e) {
						self.trigger("select", [this.id, el.href]);
						stopPropagation(e);
						preventDefault(e);
					});
				}
			}
		});
	},
	idsArray: function(){
		var _ids = [];
		each(this.list, function(k,v){_ids.push(k)});
		return _ids;
	},
	on: function(data){
		var self = this, list = self.list, anthors = self.anthors, l = data.length, i, da, uid, li, anthor;
		for(i = 0; i < l; i++){
			da = data[i];
			if(da.id && (uid = da.uid || da.id) && (li = list[uid])){
				anthor = anthors[uid];
				if(anthor){
					for(var j = 0; j < anthor.length; j++){
						var el = anthor[j];
						el && el.icon && addClass( el.icon, "webim-chaticon-online");
						el && ( el.title = i18n("available") );
					}
				}
			}
		}
	},
	off: function(data){
		var self = this, list = self.list, anthors = self.anthors, l = data.length, i, da, uid, li, anthor;
		for(i = 0; i < l; i++){
			da = data[i];
			if(da.id && (uid = da.uid || da.id) && (li = list[uid])){
				anthor = anthors[uid];
				if(anthor){
					for(var j = 0; j < anthor.length; j++){
						var el = anthor[j];
						el && el.icon && removeClass( el.icon, "webim-chaticon-online");
						el && ( el.title = i18n("unavailable") );
					}
				}
			}
		}
	},
	offAll: function(){
		each(this.anthors, function(k, v){
			v && each(v, function(n, el){
				el && el.icon && removeClass( el.icon, "webim-chaticon-online");
				el && ( el.title = i18n("unavailable") );
			});
		});
	}
}
);
