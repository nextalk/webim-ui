
webim.ui.i18n.store('zh-CN',{
	"name": "称呼"
  , "contact": "联系方式"
  , "content": "留言内容"
  , "note": "留言"
});

app("note", function( options ) {
	options = options || {};
	var ui = this, im = ui.im;
	var noteUI = new webimUI.note(null, options);
	options.container && options.container.appendChild( noteUI.element );
	return noteUI;
});

widget("note", {
	notice: "",
	template: '<div id=":note" class="webim-note"> \
			<div class="webim-note-notice" id=":notice"></div>\
			<div class="ui-state-error webim-note-error ui-corner-all" style="display: none;" id=":error"></div>\
			<form id=":form">\
				<p class="ui-helper-clearfix"><label for=":name"><%=name%></label><input name="name" id=":name" type="text" /></p>\
				<p class="ui-helper-clearfix"><label for=":contact"><%=contact%></label><input name="contact" id=":contact" type="text" /></p>\
				<p class="ui-helper-clearfix"><label for=":content"><%=content%></label><textarea name="content" id=":content"></textarea></p>\
				<p class="ui-helper-clearfix"><input name="submit" id=":submit" class="ui-state-default ui-corner-all webim-note-submit" value="<%=note%>" type="submit" /></p>\
			</form>\
		</div>'
},{
	_init: function() {
		var self = this, $ = self.$;
		$.notice.innerHTML = self.options.notice;
	},
	_initEvents: function() {
		var self = this, $ = self.$;
		hoverClass( $.submit, "ui-state-hover" );
		addEvent( $.form, "submit", function( e ) {
			preventDefault( e );
			self.trigger( "note", [{ 
				name: $.name.value
			  , contact: $.contact.value 
			  , content: $.content.value 
			}] );
		} );
	},
	hide: function() {
		hide( this.element );
	},
	show: function() {
		show( this.element );
	},
	hideError: function() {
		hide( this.$.error );
	},
	showError: function( msg ) {
		var er = this.$.error;
		er.innerHTML = i18n( msg );
		show( er );
	},
	destroy: function(){
	}
});

