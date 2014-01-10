/* 
 * ui.chatlink2
 * <a class="webim-chat" href="/chat/2/Susan">和我聊天</a>
 * Notice: chatlink2 use user_id
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

app("chatlink2", function(options){
	var ui = this, im = ui.im;
	var chatlink2 = ui.chatlink2 = new webim.ui.chatlink2(null, options).bind("select", function(e, id){
		ui.im.online();
		ui.layout.addChat("buddy", id);
		ui.layout.focusChat("buddy", id);
		if( options && options.autoInsertlink ) {
			var chat = ui.layout.chat( "buddy", id );
			chat && chat.insert( window.location.href );
		}
	});
	var grepVisible = function(a){ return a.show != "invisible" && a.presence == "online"};
	var grepInvisible = function(a){ return a.show == "invisible" };
	im.buddy.bind("online",function(e, data){
		chatlink2.on(grep(data, grepVisible));
	}).bind("update",function(e, data){
		chatlink2.on(grep(data, grepVisible));
		chatlink2.off(grep(data, grepInvisible));
	}).bind("offline",function(e, data){
		chatlink2.off(data);
	});

	im.bind("beforeOnline", function( e, params ){
		params.stranger_ids = chatlink2.idsArray();
	}).bind("online", function(e){
		chatlink2.off(im.data.user);
	}).bind("offline", function(e){
		chatlink2.offAll();
	});
});

widget("chatlink2",
{
	wrap: null,
	re_id: [/chat\/([^\/]+)/i],
	elementId: null,
	className: /webim-chat/
},
{
	_init: function(){
		var self = this, element = self.element, list = self.list = {}, 
			options = self.options, anthors = self.anthors = {}, 
			re_id = options.re_id, 
			elementId = options.elementId, 
			className = options.className,
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
		a && each(a, function(i, el){
			var id = parse_id(el.href, re_id), text = el.innerHTML;
			if(id && children(el).length == 0 && text && (elementId || className.test(el.className))){
				anthors[id] ? anthors[id].push(el) :(anthors[id] = [el]);
				list[id] = {id: id, name: text};
				var icon = createElement('<a class="webim-chatlink2"><em>');;
				el.appendChild( icon );
				el.icon = icon;
				el.title = i18n("offline");
				el.id = id;
				addEvent(el, "click", function(e){
					self.trigger("select", this.id);
					stopPropagation(e);
					preventDefault(e);
				});
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
						el && el.icon && addClass( el.icon, "webim-chatlink2-online");
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
						el && el.icon && removeClass( el.icon, "webim-chatlink2-online");
						el && ( el.title = i18n("unavailable") );
					}
				}
			}
		}
	},
	offAll: function(){
		each(this.anthors, function(k, v){
			v && each(v, function(n, el){
				el && el.icon && removeClass( el.icon, "webim-chatlink2-online");
				el && ( el.title = i18n("unavailable") );
			});
		});
	}
}
);
