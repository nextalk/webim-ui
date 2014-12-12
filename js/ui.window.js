/* webim ui window:
 *
 options:
 attributes：
 active //boolean
 displayState //normal, maximize, minimize

 methods:
 html()
 title(str, icon)
 notifyUser(type,count)  //type in [air.NotificationType.INFORMATIONAL, air.NotificationType.CRITICAL]
 isMinimize()
 isMaximize()
 activate()
 deactivate()
 maximize()
 restore()
 minimize()
 close() //
 height()

 events: 
 //ready
 activate
 deactivate
 displayStateChange
 close
 //resize
 //move
 */
widget("window", {
        isMinimize: false,
        minimizable:true,
        detachable: false,
        maximizable:false,
        closeable:true,
        sticky: true,
        titleVisibleLength: 12,
        count: 0, // notifyUser if count > 0
	//A box with position:absolute next to a float may disappear
	//http://www.brunildo.org/test/IE_raf3.html
	//here '<div><div id=":window"'
        template:'<div id=":webim-window" class="webim-window ui-widget">\
                                            <div class="webim-window-tab-wrap">\
                                            <div id=":tab" class="webim-window-tab ui-state-default">\
                                            <div class="webim-window-tab-inner">\
                                                    <div id=":tabTip" class="webim-window-tab-tip">\
                                                            <strong id=":tabTipC"><%=tooltip%></strong>\
                                                    </div>\
                                                    <a id=":tabClose" title="<%=close%>" class="webim-window-close" href="#close"><em class="ui-icon ui-icon-close"><%=close%></em></a>\
                                                    <div id=":tabCount" class="webim-window-tab-count">\
                                                            0\
                                                    </div>\
                                                    <em id=":tabIcon" class="webim-icon webim-icon-comments"></em>\
                                                    <h4 id=":tabTitle"><%=title%></h4>\
                                            </div>\
                                            </div>\
                                            </div>\
                                            <div><div id=":window" class="webim-window-window">\
						<iframe id=":bgiframe" class="webim-bgiframe" frameborder="0" tabindex="-1" src="about:blank;" ></iframe>\
                                                    <div id=":header" class="webim-window-header ui-widget-header ui-corner-top">\
                                                            <span id=":actions" class="webim-window-actions">\
                                                                    <a id=":minimize" title="<%=minimize%>" class="webim-window-minimize" href="#minimize"><em class="ui-icon ui-icon-minus"><%=minimize%></em></a>\
                                                                    <a id=":detach" title="<%=detach%>" class="webim-window-detach" href="#detach"><em class="ui-icon ui-icon-arrowthick-1-ne"><%=detach%></em></a>\
                                                                    <a id=":maximize" title="<%=maximize%>" class="webim-window-maximize" href="#maximize"><em class="ui-icon ui-icon-plus"><%=maximize%></em></a>\
                                                                    <a id=":close" title="<%=close%>" class="webim-window-close" href="#close"><em class="ui-icon ui-icon-close"><%=close%></em></a>\
                                                            </span>\
                                                            <h4 id=":headerTitle"><%=title%></h4>\
                                                            <div id=":subHeader" class="webim-window-subheader"></div>\
                                                    </div>\
                                                    <div id=":content" class="webim-window-content ui-widget-content">\
                                                    </div>\
                                            </div>\
                                            </div>\
                                            </div>'
},
{
	html: function(obj){
		html( this.$.content, obj );
	},
	subHeader: function(obj) {
		html( this.$.subHeader, obj );
	},
	_init: function(element, options){
		var self = this, options = self.options, $ = self.$;
		element = self.element;
		element.window = self;
		//$.title = $.headerTitle.add($.tabTitle);
		options.tabWidth && ($.tab.style.width = options.tabWidth + "px");
		options.subHeader && self.subHeader(options.subHeader);
		self.title(options.title, options.icon);
		!options.minimizable && hide($.minimize);
		!options.maximizable && hide($.maximize);
        !options.detachable && hide($.detach);
		if(!options.closeable){
		       	hide($.tabClose);
		       	hide($.close);
		}
		if(options.isMinimize){
			self.minimize();
		}else{
			self.restore();
		}
        self.position = {right: 0, bottom: 0};
        if(options.detached) {
            self.position.right = options.detached.right; 
            self.position.bottom = options.detached.bottom;
            self.detach();
        }
		if(options.onlyIcon){
			hide($.tabTitle);
		}else{
			remove($.tabTip);
		}
		options.count && self.notifyUser("information", options.count);
		//self._initEvents();
		//self._fitUI();
		//setTimeout(function(){self.trigger("ready");},0);
		winManager(self);
	},
	notifyUser: function(type, count){
		var self = this, $ = self.$;
		if(type == "information"){
			if(self.isMinimize()){
				if(_countDisplay($.tabCount, count)){
					addClass($.tab,"ui-state-highlight");
					removeClass($.tab, "ui-state-default");
				}
			}
		}
	},
	_count: function(){
		return _countDisplay(this.$.tabCount);
	},
	title: function(title, icon){
		var self = this, $ = self.$, tabIcon = $.tabIcon;
		if(icon){
			if(isUrl(icon)){
				tabIcon.className = "webim-icon";
				tabIcon.style.backgroundImage = "url("+ icon +")";
			}
			else{
				tabIcon.className = "webim-icon webim-icon-" + icon;
			}
		}
		$.tabTipC.innerHTML = title;
		var t = subVisibleLength(title, 0, self.options.titleVisibleLength);
		$.tabTitle.innerHTML = t;
		t && title && t.length < title.length && $.tabTitle.setAttribute("title",title);
		$.headerTitle.innerHTML = title;
	},
	_changeState:function(state){
		var el = this.element, className = state == "restore" ? "normal" : state;
		replaceClass(el, "webim-window-normal webim-window-maximize webim-window-minimize", "webim-window-" + className);
		this.trigger("displayStateChange", [state]);
	},
	active: function(){
		return hasClass(this.element, "webim-window-active");
	},
	activate: function(){
		var self = this;
		if(self.active())return;
		addClass(self.element, "webim-window-active");
		self.trigger("activate");
	},
	deactivate: function(){
		var self = this;
		if(!self.active())return;
		removeClass(self.element, "webim-window-active");
		if(!self.options.sticky) self.minimize();
		self.trigger("deactivate");
	},
	_setVisibile: function(){
		var self = this, $ = self.$;
        if(self.isDetached()) { 
            hide($.tab); 
        } else {
            replaceClass($.tab, "ui-state-default ui-state-highlight", "ui-state-active");
        }
		self.activate();
		_countDisplay($.tabCount, 0);
	},
	maximize: function() {
		var self = this, win = self.$.window;
		//TODO: 5.8 max window, is this ok? 
		if(self.isMaximize()) {
			//TODO: NORMAL, fixme
			window.onresize = null;
			removeClass(win, "webim-maximized-window");
			self._changeState("restore");
			return;
		}
		addClass(win, "webim-maximized-window");
		self._setVisibile();
		self._changeState("maximize");
		window.onresize = function() {
			self._changeState("maximize");
		};
	},

	restore: function(){
		var self = this;
		if(hasClass(self.element, "webim-window-normal"))return;
		self._setVisibile();
		self._changeState("restore");
	},
	minimize: function(){
		var self = this;
		if(self.isMinimize())return;
        show(self.$.tab);
		replaceClass(self.$.tab, "ui-state-active", "ui-state-default");
		self.deactivate();
		self._changeState("minimize");
	},

	tabClose: function(){
		this.close();
	},

	close: function(){
		var self = this;
		self.trigger("close");
		remove(self.element);
	},

    detach: function() {
        var self = this, position = self.position, tab = self.$.tab, win = self.$.window, btn = self.$.detach;
        if(self.isDetached())return;
        //hide tab first
        hide(this.$.tab);
        win.style.bottom = position.bottom + 'px';
        win.style.right = position.right + "px";
        replaceClass(btn.firstChild, "ui-icon-arrowthick-1-ne", "ui-icon-arrowthick-1-sw");
        self.detached = true;
    },

    isDetached: function() {
        return this.detached || false; 
    },

    attach : function() {
        var self = this, position = self.position, tab = self.$.tab, win = self.$.window, btn = self.$.detach;
        show(this.$.tab);
        position.right = 0;
        position.bottom = 0;
        win.style.bottom = "26.4px";
        win.style.right = "0px";
        replaceClass(btn.firstChild, "ui-icon-arrowthick-1-sw", "ui-icon-arrowthick-1-ne");
        self.detached = false;
    },

    _beforeMove: function(e) {
        var self = this, position = self.position, win= self.$.window;
        if(win.style.right) position.right = parseInt(win.style.right);
        if(win.style.bottom) position.bottom = parseInt(win.style.bottom);
        position.right = position.right || 0;
        position.bottom = position.bottom || 0;
        position.mouseX = e.pageX || e.clientX;
        position.mouseY = e.pageY || e.clientY;
    },
    
    move: function(e) {
        var self = this, position = self.position, win = self.$.window;
        var offsetX = (e.pageX || e.clientX) - position.mouseX;
        var offsetY = (e.pageY || e.clientY) - position.mouseY;
        position.mouseX = (e.pageX || e.clientX);
        position.mouseY = (e.pageY || e.clientY);
        position.right -= offsetX;
        position.bottom -= offsetY
        win.style.right = position.right + "px";
        win.style.bottom = position.bottom + "px";
    },

	_initEvents:function(){
		var self = this, element = self.element, $ = self.$, tab = $.tab, header = $.header, win = $.window;
		var stop = function(e){
			stopPropagation(e);
			preventDefault(e);
		};
		//resize
		var minimize = function(e){
			self.minimize();
		};

        if(self.options.detachable) {

            //the window should be detached first
            addEvent($.detach, "click", function(e) {
                self.isDetached() ?  self.attach() : self.detach();
				stop(e);
            });

            //if detached, move...
            var _move = function(e) { self.move(e); }

            addEvent(header, "mouseover", function() {
                if(self.isDetached()) { 
                    header.style.cursor = "move"; 
                } else {
                    header.style.cursor = "default"; 
                }
            });

            addEvent(header, "mousedown", function(e) {
                if(self.isDetached()) {
                    self._beforeMove(e);
                    addEvent(header, "mousemove", _move);
                }
            });

            addEvent(header, "mouseup", function(e) {
                removeEvent(header, "mousemove", _move);
            });

        }

		//addEvent($.header, "click", minimize);
		addEvent(tab, "click", function(e){
			if(self.isMinimize())self.restore();
			else self.minimize();
			stop(e);
		});
		addEvent(tab,"mouseover",function(){
			addClass(this, "ui-state-hover");
			removeClass(this, "ui-state-default");
		});
		addEvent(tab,"mouseout",function(){
			removeClass(this, "ui-state-hover");
			this.className.indexOf("ui-state-") == -1 && addClass(this, "ui-state-default");
		});
		addEvent(tab,"mousedown",stop);
		disableSelection(tab);
		each(children($.actions), function(n,el){
			hoverClass(el, "ui-state-hover");
		});

		each(["minimize", "maximize", "close", "tabClose"], function(n,v){
			addEvent($[v], "click", function(e){
				//Different the element `disabled` attr
				if(!this.disable)self[v]();
				stop(e);
			});
			addEvent($[v],"mousedown", stop);
		});

	},
	height:function(){
		return this.$.content.offsetHeight;
	},
	_fitUI: function(bounds){
		return;
	},
	isMaximize: function(){
		return hasClass(this.element,"webim-window-maximize");
	},
	isMinimize: function(){
		return hasClass(this.element,"webim-window-minimize");
	}
});
var winManager = (function(){
	var curWin = false;
	var deactivateCur = function(){
		curWin && curWin.deactivate();
		curWin = false;
		return true;
	};
	var activate = function(e){
		var win = this;
		win && win != curWin && deactivateCur() && (curWin = win);
	};
	var deactivate = function(e){
		var win = this;
		win && curWin == win && (curWin = false);
	};
	var register = function(win){
		if(win.active()){
			deactivateCur();
			curWin = win;
		}
		win.bind("activate", activate);
		win.bind("deactivate", deactivate);
	};
	///////////
	addEvent(document,"mousedown",function(e){
		e = target(e);
		var el;
		while(e){
			if(e.id == ":webim-window"){
				el = e;
				break;
			}
			else
				e = e.parentNode;
		}
		if(el){
			var win = el.window;
			win && win.activate();
		}else{
			deactivateCur();
		}
	});
	return function(win){
		register(win);
	}
})();
