/* 
* ui.login:
*
*/
app("login", function( options ) {
	options = options || {};
	var ui = this, im = ui.im;
	var loginUI = new webimUI.login(null, options);
	options.container && options.container.appendChild( loginUI.element );
	loginUI.bind( "login", function( e, params ){
		im.online( params );
	});
	im.bind("online", function() {
		loginUI.hide();
	}).bind("offline", function( e, type, msg ) {
		type == "online" && loginUI.showError( msg );
	});
	return loginUI;
});

widget("login", {
	questions: null,
	notice: "",
	template: '<div id=":login" class="webim-login"> \
			<div class="webim-login-logo" id=":logo"></div>\
			<div class="webim-login-notice" id=":notice"></div>\
			<div class="ui-state-error webim-login-error ui-corner-all" style="display: none;" id=":error"></div>\
			<form id=":form">\
				<p class="ui-helper-clearfix"><label for=":username"><%=username%></label><input name="username" id=":username" type="text" /></p>\
				<p class="ui-helper-clearfix"><label for=":password"><%=password%></label><input name="password" id=":password" type="password" /></p>\
				<div id=":more">\
				<p class="ui-helper-clearfix"><label for=":question"><%=question%></label><select name="question" id=":question" ></select></p>\
				<p class="ui-helper-clearfix"><label for=":answer"><%=answer%></label><input name="answer" id=":answer" type="text" /></p>\
				</div>\
				<p class="ui-helper-clearfix"><input name="submit" id=":submit" class="ui-state-default ui-corner-all webim-login-submit" value="<%=login%>" type="submit" /></p>\
			</form>\
		</div>'
},{
	_init: function() {
		var self = this, questions = self.options.questions, $ = self.$;
		if ( questions && questions.length ) {
			each( questions, function(n, v) {
				var option = document.createElement( "option" );
				option.value = v[0];
				option.innerHTML = v[1];
				$.question.appendChild( option );
			} );
		} else {
			hide( $.more );
		}
		$.notice.innerHTML = self.options.notice;
		
	},
	_initEvents: function() {
		var self = this, $ = self.$;
		hoverClass( $.submit, "ui-state-hover" );
		addEvent( $.form, "submit", function( e ) {
			preventDefault( e );
			self.trigger( "login", [{ username: $.username.value,  password: $.password.value, question: $.question.value, answer: $.answer.value }] );
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

