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
		ajax({
			url: route( "notifications" ),
			cache: false,
			context: self,
			success: self.handle
		});
	}
});

