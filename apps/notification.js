/**/
/*
 notification //
 attributes：
 data []所有信息 readonly 
 methods:
 handle(data) //handle data and distribute events
 events:
 data
 */
/*
 * {"from":"","text":"","link":""}
 */

model("notification",{
	url: "webim/notifications"
},{
	_init: function(){
		var self = this;
		if(self.options.jsonp)
			self.request = jsonp;
		else
			self.request = ajax;
	},
	grep: function(val, n){
		return val && val.text;
	},
	handle: function(data){
		var self = this;
		data = grep(makeArray(data), self.grep);
		if(data.length)self.trigger("data", [data]);
	},
	load: function(){
		var self = this, options = self.options;
		self.request({
			url: route( "notifications" ),
			cache: false,
			dataType: "json",
			context: self,
			success: self.handle
		});
	}
});

