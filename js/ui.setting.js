//
/* ui.setting:
*
options:
data

attributes：

methods:
check_tag

destroy()
events: 
change

*/
app("setting", function(options){
		var ui = this, im = ui.im, setting = im.setting, layout = ui.layout;
		var settingUI = ui.setting = new webimUI.setting(null, options);
		layout.addWidget(settingUI, {
			title: i18n("setting"),
			icon: "setting",
			sticky: false,
			onlyIcon: true,
			isMinimize: true
		});
		//setting events
		setting.bind("update",function(e, key, val){
			if(typeof val != "object"){
				settingUI.check_tag(key, val);
			}
		});
		settingUI.bind("change", function(e, key, val){
			setting.set(key, val);
		});
		//handle 
		//settingUI.bind("offline",function(){
		//	im.trigger("stop");
		//});
		//settingUI.bind("online",function(){
		//	im.trigger("ready");  
		//	im.online();
		//});
});

widget("setting",{
	template: '<div id="webim-setting" class="webim-setting">\
			<ul id=":ul"><%=tags%></ul>\
		   </div>',
	tpl_check: '<li id=":<%=name%>"><input type="checkbox" <%=checked%> id="webim-setting-<%=name%>" name="<%=name%>"/><label for="webim-setting-<%=name%>"><%=label%></label></li>'
},{
	_init: function(){
		//this._initEvents();
		var copyright = this.options.copyright;	
		if( copyright ) {
			copyright = copyright === true ? '<p style="margin: 5px 10px;"><a class="webim-gray" href="http://nextalk.im/" target="_blank">Powered by <strong>NexTalk</strong><em>&nbsp 5.4.1</em></a></p>' : copyright;
			this.element.appendChild(createElement(copyright));
		}
	},
	template: function(){
		var self = this, temp = [], data = self.options.data;
		data && each(data, function(key, val){
			if(val && typeof val != "boolean") {
				return;
			}
			temp.push(self._check_tpl(key, val));
		});
		return tpl(self.options.template,{
			tags:temp.join("")
		});
	},
	_initEvents:function(){
		var self = this, data = self.options.data, $ = self.$;
		data && each(data, function(key, val){
			$[key] && self._check_event($[key]);
		});
		//addEvent($.offline,"click",function(e){
		//	self.trigger("offline");
		//});
		//addEvent($.online,"click",function(e){
		//	self.trigger("online");
		//});
	},
	//offline:function(){
	//	var $ = this.$;
	//	hide($.offline);//.style.display="none";
	//	show($.online);//.style.display="block";   
	//},
	//online:function(){
	//	var $ = this.$;
	//	show($.offline);//.style.display="block";
	//	hide($.online);//.style.display="none";   
	//},
	_check_tpl: function(name, isChecked){
		return tpl(this.options.tpl_check,{
			label: i18n(name),
			name: name,
			checked: isChecked ? 'checked="checked"' : ''
		});
	},
	_check_event: function(el){
		var self = this;
		addEvent(el.firstChild, "click", function(e){
			self._change(this.name, this.checked);
		});
	},
	check_tag: function(name, isChecked){
		var self = this;
		if(isObject(name)){
			each(name, function(key,val){
				self.check_tag(key, val);
			});
			return;
		}
		var $ = self.$, tag = $[name];
		if(isChecked && typeof isChecked != "boolean") {
			return;
		}
		if(tag){
			tag.firstChild.checked = isChecked;
			return;
		}
		var el = $[name] = createElement(self._check_tpl(name, isChecked));
		self._check_event(el);
		$.ul.appendChild(el);
	},
	_change:function(name, value){
		this.trigger("change", [name, value]);
	},
	destroy: function(){
	}
});
