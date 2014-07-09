/**/
/*
 ask //
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

model("ask",{
	url: "webim/asks"
},{
	_init: function(){
	},

	grep: function(val, n){
		return val && val.text;
	},

	handle: function(data){
        isArray(data) && this.trigger("data", [data]);
	},
	load: function(){
		var self = this, options = self.options;
		ajax({
			url: route( "asks" ),
			cache: false,
			context: self,
			success: self.handle
		});
	},
    accept: function(askid) {
		var self = this, options = self.options;
		ajax({
			url: route( "accept" ),
			cache: false,
            data: {
                ticket: options.ticket,
                askid: askid,
                csrf_token: webim.csrf_token
            },
			context: self,
			success: self.load
		});
            
    },
    reject: function(askid) {
		var self = this, options = self.options;
		ajax({
			url: route( "reject" ),
			cache: false,
            data: {
                ticket: options.ticket,
                askid: askid,
                csrf_token: webim.csrf_token
            },
			context: self,
			success: self.load
		});
    }
});

