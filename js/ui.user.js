/* 
* ui.user:
*
*/
app( "user", function( options ) {
	options = options || {};
	var ui = this, im = ui.im;
	var userUI = new webimUI.user();
	hide( userUI.element );
	options.container && options.container.appendChild( userUI.element );
	userUI.bind("online", function( e, params ) {
		im.online( params );
	}).bind("offline", function(){
		im.offline();
	}).bind("presence", function( e, params ) {
		im.sendPresence( params );
	} );
	userUI.update( im.data.user );
	im.bind( "online", function() {
		show( userUI.element );
		userUI.update( im.data.user );
	}).bind( "offline", function( e, type ) {
		userUI.show( "unavailable" );
	});
	return userUI;
} );

widget("user",{
	template: '<div>  \
		<div id=":user" class="webim-user"> \
			<a id=":userPic" class="webim-user-pic ui-corner-all ui-state-active" href="#id"><img width="50" height="50" defaultsrc="" onerror="var d=this.getAttribute(\'defaultsrc\');if(d && this.src!=d)this.src=d;" class="ui-corner-all"></a> \
				<div class="webim-user-show"><h4><a  id=":userShowTrigger" href="#show"><strong id=":userNick"></strong><span id=":userShow"><em class="webim-icon webim-icon-unavailable"><%=unavailable%></em><%=unavailable%></span><em class="ui-icon ui-icon-triangle-1-s"><%=show_status_list%></em></a></h4>\
					<p id=":userShowList" class="ui-state-active ui-corner-all" style="display: none;">\
						<a href="#available" class="webim-user-show-available"><em class="webim-icon webim-icon-available"><%=available%></em><%=available%></a>\
						<a href="#dnd" class="webim-user-show-dnd"><em class="webim-icon webim-icon-dnd"><%=dnd%></em><%=dnd%></a>\
						<a href="#away" class="webim-user-show-away"><em class="webim-icon webim-icon-away"><%=away%></em><%=away%></a>\
						<a href="#invisible" class="webim-user-show-invisible"><em class="webim-icon webim-icon-invisible"><%=invisible%></em><%=invisible%></a>\
						<a href="#unavailable" class="webim-user-show-unavailable"><em class="webim-icon webim-icon-unavailable"><%=unavailable%></em><%=unavailable%></a>\
					</p>\
				</div> \
					<span id=":userStatus" title="" class="webim-user-status"></span> \
						</div> \
							</div>'
},{
	_init: function(){
		var self = this;
	},
	_initEvents: function(){
		var self = this, $ = self.$, trigger = $.userShowTrigger, list = $.userShowList;
		//hoverClass(trigger, "ui-state-hover");
		addEvent(trigger, "click", function(e){
			list.style.display == "block" ? hide(list) : show(list);
			preventDefault(e);
		});
		each(children(list), function(n, el){
			addEvent(el, "click", function(e){
				self._set(this.href.split("#")[1]);
				hide(list);
				preventDefault(e);
			});
		});
	},
	update: function(info){
		var self = this, type = info.show || "unavailable", $ = self.$;
		self.options.info = info;
		$.userStatus.innerHTML =  stripHTML(info.status) || "&nbsp;";
		$.userNick.innerHTML = info.nick || "";
		$.userPic.setAttribute("href", info.url);
		$.userPic.firstChild.setAttribute("defaultsrc", info.default_pic_url ? info.default_pic_url : "");
		setTimeout(function(){
			if(info.pic_url || info.default_pic_url) {
				$.userPic.firstChild.setAttribute("src", info.pic_url || info.default_pic_url);
			}
		},100);
		self.show(type);
	},
	show: function( type ) {
		var self = this, t = i18n(type);
		self.$.userShow.innerHTML = "<em class=\"webim-icon webim-icon-"+type+"\">"+t+"</em>"+t;
	},
	_set: function(type){
		var self = this, info = self.options.info;
		self.show(type);
		if(!info){
			//offline
			if(type != "unavailable"){
				//self.show(type);
				self.trigger("online", [{show: type}]);
			}
		}else if(info.show != type) {
			if(type == "unavailable"){
				self.trigger( "offline", [] );
			}else if( info.show == "unavailable" ) {
				self.trigger("online", [{show: type}]);
			}else{
				self.trigger("presence", [{show: type, status: info.status}]);
			}
		}
	},
	destroy: function(){
	}
});

