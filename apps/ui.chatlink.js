/* 
 * ui.chatlink
 *
 * Notice: chatlink use user_id
 *
 * TODO: 支持群组Link
 *
 * options:
 * methods:
 * 	add(buddies)
 * 	remove(buddies)
 * 	idsArray()
 * 	removeAll()
 * 	destroy()
 * 
 * events: 
 * 	select
 * 
 */

app("chatlink", function(options){
	var ui = this, im = ui.im;
	var chatlink = ui.chatlink = new webim.ui.chatlink(null, options).bind("select", function(e, id){
		ui.layout.addChat("buddy", id);
		ui.layout.focusChat("buddy", id);
	});
	var grepVisible = function(a){ return a.show != "invisible" && a.presence == "online"};
	var grepInvisible = function(a){ return a.show == "invisible" };
	im.buddy.bind("online",function(e, data){
		chatlink.add(grep(data, grepVisible));
	}).bind("update",function(e, data){
		chatlink.add(grep(data, grepVisible));
		chatlink.remove(grep(data, grepInvisible));
	}).bind("offline",function(e, data){
		chatlink.remove(data);
	});

	im.bind("beforeOnline", function( e, params ){
		params.stranger_ids = chatlink.idsArray();
	}).bind("online", function(e){
		chatlink.remove(im.data.user);
	}).bind("offline", function(e){
		chatlink.removeAll();
	});
});

widget("chatlink",
{
	link_href: [/space\.php\?uid=(\d+)$/i, /space\-(\d+)\.html$/i, /space\-uid\-(\d+)\.html$/i, /\?mod=space&uid=(\d+)$/, /\?(\d+)$/],
	space_href: [/space\.php\?uid=(\d+)$/i, /space\-(\d+)\.html$/i, /space\-uid\-(\d+)\.html$/i, /\?mod=space&uid=(\d+)/, /\?(\d+)$/],
	space_class: /spacemenu_list|line_list|xl\sxl2\scl/i,
	space_id: /profile_act/i,
	link_class: null,
	off_link_class: null,
	link_wrap: null,
	space_wrap: null
},
{
	_init: function(){
		var self = this, element = self.element, list = self.list = {}, 
			options = self.options, anthors = self.anthors = {}, 
			link_href = options.link_href, 
			space_href = options.space_href, 
			space_id = options.space_id, 
			off_link_class = options.off_link_class,
			link_class = options.link_class,
			space_class = options.space_class, 
			space_wrap = options.space_wrap || document, 
			link_wrap = options.link_wrap || document;

		function parse_id(link, re){
			if(!link)return false;
			var re_len = re.length; 
			for(var i = 0; i < re_len; i++){
				var ex = re[i].exec(link);
				if(ex && ex[1]){
					return ex[1];
				}
			}
			return false;
		}
		var a = link_wrap.getElementsByTagName("a"), b;

		a && each(a, function(i, el){
			var id = parse_id(el.href, link_href), text = el.innerHTML;
			if(id && children(el).length == 0 && text && (!el.className || !link_class || link_class.test(el.className)) && (!el.className || !off_link_class || !off_link_class.test(el.className))){
				anthors[id] ? anthors[id].push(el) :(anthors[id] = [el]);
				list[id] = {id: id, name: text};
			}
		});
		var id = parse_id(window.location.href, space_href);
		if(id){
			list[id] = extend(list[id], {id: id});
			var els = space_wrap.getElementsByTagName("*"), l = els.length, el, className, attr_id;
			for(var i = 0; i < l ; i++){
				el = els[i], className = el.className, attr_id = el.id;
				if((space_class && space_class.test(className)) || (space_id && space_id.test(attr_id)))
					{
						el = children(el);
						if(el.length){
							el = el[el.length - 1];
							anthors[id] ? anthors[id].push(el) :(anthors[id] = [el]);
						}
						break;
					}
			}
		}
	},
	_temp:function(attr){
		var self = this;
		var el = createElement(tpl('<a id="<%=id%>" href="#chat" title="<%=title%>" class="webim-chatlink"><%=text%></a>', attr));
		addEvent(el, "click", function(e){
			self.trigger("select", this.id);
			stopPropagation(e);
			preventDefault(e);
		});
		return el;
	},
	idsArray: function(){
		var _ids = [];
		each(this.list, function(k,v){_ids.push(k)});
		return _ids;
	},
	add: function(data){
		var self = this, list = self.list, anthors = self.anthors, l = data.length, i, da, uid, li, anthor;
		for(i = 0; i < l; i++){
			da = data[i];
			if(da.id && (uid = da.uid) && (li = list[uid])){
				anthor = anthors[uid];
				if(!li.elements && anthor){
					li.elements = [];
					for(var j = 0; j < anthor.length; j++){
						if(anthor[j].tagName.toLowerCase() == "li"){
							li.elements[j] = document.createElement("li");
							li.elements[j].appendChild(self._temp({id: da.id, title: "", text: i18n('chat with me')}));
						}else{
							li.elements[j] = self._temp({id: da.id, title: i18n('chat with',{name: li.name}), text: ""});
						}
					}
				}
				anthor && each(anthor, function(n, v){
					v.parentNode.insertBefore(li.elements[n], v.nextSibling);
				});
			}
		}
	},
	remove: function(data){
		var self = this, list = self.list, anthors = self.anthors, l = data.length, i, da, uid, li, anthor;
		for(i = 0; i < l; i++){
			da = data[i];
			if(da.id && (uid = da.uid) && (li = list[uid])){
				li.elements && each(li.elements, function(n, v){
					remove(v);
				});
			}
		}
	},
	removeAll: function(){
		each(this.list, function(k, v){
			v.elements && each(v.elements, function(n, el){
				remove(el);
			});
		});
	}
}
);
