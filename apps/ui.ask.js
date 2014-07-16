//
/* ui.ask
 *
 options:
 data [{}]
 attributes：

 methods:

 destroy()
 events: 

 */
app("ask", function(options) {
		var ui = this, im = ui.im, layout = ui.layout;
		var ask = im.ask = new webim.ask(null, {
			jsonp: im.options.jsonp
		});
		var askUI = ui.ask = new webimUI.ask(null, options);
        askUI.bind("accept", function(e, id) {
            ask.accept(id);
        }).bind("reject", function(e, id) {
            ask.reject(id);
        });
		layout.addWidget(askUI, {
			title: i18n("ask app"),
			icon: "ask",
			sticky: false,
			onlyIcon: true,
			isMinimize: true
		});
		///asks
		ask.bind("data",function(e, data){
			data.length && askUI.window.notifyUser("information", "+" + data.length);
			askUI.addAll(data);
		});
		setTimeout(function() {
			ask.load();
		}, 1000);
});


widget("ask",{
	template: '<div id="webim-ask" class="webim-ask">\
	<ul id=":ul"></ul>\
	<div id=":empty" class="webim-ask-empty"><%=empty ask%></div>\
	</div>',
	tpl_btn_li: '<li title=""><input class="webim-button ui-state-default ui-corner-all" type="button" value="<%=reject%>" /><input class="webim-button ui-state-default ui-corner-all" type="button" value="<%=accept%>" /><%=text%></li>',
	tpl_li: '<li><%=text%></li>'
},{
	_init: function(){
		var self = this, element = self.element, options = self.options;
		var win = options.window;
		options.data && options.data.length && hide(self.$.empty);
		self._initEvents();
	},

    _initEvents: function() {
        var self = this, $ = self.$;   

    },

    addAll: function(data) {
        var self = this, $ = self.$;
		if(isArray(data)) {
            //remove all children
            hide($.empty);
            $.ul.innerHTML = "";
			each(data, function(i,val){
				self.addOne(val);
			});
        }
    },

	addOne: function(v) {
		var self = this, $ = self.$;
		$.ul.appendChild(self._li(v));
	},

	_li: function(data) {
        var self = this, text, answer = data.answer, li;
        if(answer == 0) {
            text = i18n("Ask Initiate", {name: data.nick, time: data.time});
        } else if(answer == 1) {
            text = i18n("Ask Accepted", {name: data.nick, time: data.time});
        } else if(answer == 2) {
            text = i18n("Ask Rejected", {name: data.nick, time: data.time});
        }
        if(answer > 0) {
            li = createElement(tpl(this.options.tpl_li, { text: text }));
        } else {
            li = createElement(tpl(this.options.tpl_btn_li, { 
                    text: text, 
                    accept: i18n("accept"), 
                    reject: i18n("reject")
                }));
            var rejectBtn = li.firstChild;
            var accetpBtn = rejectBtn.nextSibling;
            addEvent(accetpBtn, "click", function(e) {
                preventDefault(e);
                self.trigger( "accept", [data.id] );
            });
            addEvent(rejectBtn, "click", function(e) {
                preventDefault(e);
                self.trigger( "reject", [data.id] );
            });
        }
        return li;
	},

	_fitUI:function(){
		var el = this.element;
		if(el.clientHeight > 300)
			el.style.height = 300 + "px";
	},

	destroy: function(){
	}

});
