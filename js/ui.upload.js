
//image/jpeg,image/jpg,image/gif,image/png,thumbnailUrl

widget("upload", {
	template: '<div class="webim-upload ui-widget-content"><form class="ui-helper-clearfix" id=":form" method="POST" enctype="multipart/form-data" encoding="multipart/form-data"><input id=":input" type="file" name="files" /><input class="ui-state-default ui-corner-all webim-upload-submit" type="submit" value="<%=upload%>" /></form></div>'
},{
	_init: function(options){
		var self = this, element = self.element;
		self.$.form.setAttribute( "action", route("upload") );
		upload( self.$.form, function( data ){
			data = data && data[0];
			if( data ) {
				if( !data.url || data.error ) {
					alert( data.error || 'Upload error' );
				} else {
					var markup = "", ar = ["image/jpeg","image/jpg","image/gif","image/png"];
					for (var i = 0; i < ar.length; i++) {
						if( ar[i] == data.type ) {
							markup = "!";break;
						}
					};
					markup += "["+(data.name || "").replace(/\[|\]/ig, "")+"]("+data.url+")";
					if( data.thumbnailUrl )
						markup += "("+data.thumbnailUrl+")";
					try{
						self.$.form.reset();
						self.$.input.value = "";
					} catch(e){
					}
					self.toggle();
					self.trigger('upload', markup);
				}
			} else {
				alert("Upload error");
			}

		} );
	},
	toggle: function(){
		toggleClass(this.element, "webim-upload-show");
	}
});


