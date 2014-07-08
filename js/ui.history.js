//
/* ui.history:
 *
 options:
 attributes：

 methods:
 add(data) //
 clear

 destroy()
 events: 
 clear
 update

 */
widget("history", {
        user: {},
        info: {},
        template:'<div class="webim-history">\
                        <div id=":content" class="webim-history-content"> \
                </div></div>'
},{
	_init: function(){
		var self = this, element = self.element, options = self.options;
		plugin.call(self, "init", [null, self.ui()]);
	},
	clear:function(){
		var self = this;
		self.$.content.innerHTML = "";
		self.trigger("clear");
	},
	add: function(data){
		data = makeArray(data);
		var self = this, l = data.length, markup = [];
		if(!l)return;
		for (var i = 0; i < l; i++){
			var val = data[i];
			markup.push(self._renderMsg(val));
		}
		//self.$.content.innerHTML += markup.join('');
		self.$.content.appendChild( createElement( "<div>"+markup.join('')+"</div>" ) );
		self.trigger("update");
	},
	notice: function( type, msg ) {
		this.$.content.appendChild( createElement( '<div class="webim-history-notice ui-state-default ui-state-' + type + '">' + msg + '</div>' ) );
		this.trigger("update");
	},
    
	_renderMsg: function(logItem){
		var self = this;
		logItem = extend({}, logItem);
		plugin.call(self, "render", [null, self.ui({msg: logItem})]);
		var  from = logItem.from, to = logItem.to, time = logItem.timestamp, msg = logItem.body, shouldTilte = true, last = self._lastLogItem, markup = [], info = self.options.info, user = self.options.user, nick;
		nick = logItem.nick;
		//var fromSelf = from == user.id;
		//var other = !fromSelf && user.id != to;

		//var nick = other ? logItem.nick : fromSelf ? user.nick : (info.nick ? '<a href="' + info.url + '">' + info.nick + '</a>' : info.id);
		if (last && last.to == to && last.from == from && time - last.timestamp < 60000){
			shouldTilte = false;
		}
		//markup.push(self._renderDateBreak(time));
		if (shouldTilte) {
			self._lastLogItem = logItem;
			var t = (new date(time));
			markup.push('<h4><span class="webim-gray">');
			markup.push(t.getDay(true));
			markup.push(" ");
			markup.push(t.getTime());
			markup.push('</span>');
			markup.push(nick);
			markup.push('</h4><hr class="webim-line ui-state-default" />');
		}
        if(logItem.style) {
            markup.push('<p style="' + logItem.style + '">');
        } else {
            markup.push('<p>');
        }
		markup.push(msg);
		markup.push('</p>');
		return markup.join("");
	},
	_renderDateBreak: function(time){
		var self = this, last = self._lastLogItem, newDate = new Date(), lastDate = new Date(), markup = [];
		newDate.setTime(time);
		last && lastDate.setTime(last.timestamp);
		if(!last || newDate.getDate() != lastDate.getDate() || newDate.getMonth() != lastDate.getMonth()){
			markup.push("<h5>");
			markup.push((new date(time)).getDay(true));
			markup.push("</h5>");
		}
		return markup.join("");
	},
	ui:function(ext){
		var self = this;
		return extend({
			element: self.element,
			$: self.$
		}, ext);
	},
	plugins:{}

});
//<p class="webim-history-actions"> \
//                                                        <a href="#"><%=clear history%></a> \
//                                                        </p> \

var autoLinkUrls = (function(){
	var attrStr;
	function filterUrl(a, b, c, _x, d, e, _z, f){
		if( b )
			return '<a href="' + (b=='www.' ? ('http://' + a) : a) + '"' + attrStr + '>' + a + '</a>'
		if( _x )
			return '<a class="webim-img" href="'+e+'"'+attrStr+'><img src="'+(f || e)+'" alt="'+(d || e)+'"/></a>';
		return '<a class="webim-file" href="'+e+'"'+attrStr+'>'+(d || e)+'</a>';
	}
	function serialize(key, val){
		attrStr += ' ' + key + '="' + val + '"';
	}
	return function(str, attrs){
		attrStr = "";
		attrs && isObject(attrs) && each(attrs, serialize);
		return str.replace(/(https?:\/\/|www\.)([^\s<]+)|(\!?)\[([^\]]*)\]\(([^\)]+)\)(\(([^\)]+)\))?/ig, filterUrl);
	};
})();

webimUI.history.defaults.parseMsg = true;
plugin.add("history","parseMsg",{
	render:function(e, ui){
		var msg = ui.msg.body;
		msg = HTMLEnCode(msg);
		msg = autoLinkUrls(msg, {target:"_blank"});
		ui.msg.body = msg;
	}
});

webimUI.history.defaults.emot = true;
plugin.add("history","emot",{
	render:function(e, ui){
		ui.msg.body = webimUI.emot.parse(ui.msg.body);
	}
});


