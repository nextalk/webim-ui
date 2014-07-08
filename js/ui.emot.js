widget("emot", {
                template: '<div class="webim-emot ui-widget-content"><%=emots%></div>'
},{
        _init: function(options){
                var self = this, element = self.element;
		each(element.firstChild.childNodes, function(i,v){
			addEvent(v, "click", function(e){
				removeClass(element, "webim-emot-show");
				self.trigger('select', this.firstChild.getAttribute('rel'));
			});
		});
        },
	template: function(){
                var self = this, emots = self.emots = webim.ui.emot.emots;
                var markup = [];
                markup.push('<ul class="ui-helper-clearfix">');
                each(emots, function(n, v){
                    var src = v.src, title = v.t ? v.t : v.q[0];
                    markup.push('<li><img src="');
                    markup.push(src);
                    markup.push('" title="');
                    markup.push(title);
                    markup.push('" alt="');
                    markup.push(v.q[0]);
                    markup.push('" rel="');
                    markup.push(v.q[0]);
                    markup.push('" /></li>');
                });
                markup.push('</ul>');
		return tpl(self.options.template, { emots: markup.join('')});

	},
        toggle: function(){
                toggleClass(this.element, "webim-emot-show");
        }
});
extend(webimUI.emot, {
        emots: [
                {"t":"smile","src":"smile","q":[":)"]},
                {"t":"smile_big","src":"smile-big","q":[":d",":-d",":D",":-D"]},
                {"t":"sad","src":"sad","q":[":(",":-("]},
                {"t":"wink","src":"wink","q":[";)",";-)"]},
                {"t":"tongue","src":"tongue","q":[":p",":-p",":P",":-P"]},
                {"t":"shock","src":"shock","q":["=-O","=-o"]},
                {"t":"kiss","src":"kiss","q":[":-*"]},
                {"t":"glasses_cool","src":"glasses-cool","q":["8-)"]},
                {"t":"embarrassed","src":"embarrassed","q":[":-["]},
                {"t":"crying","src":"crying","q":[":'("]},
                {"t":"thinking","src":"thinking","q":[":-\/",":-\\"]},
                {"t":"angel","src":"angel","q":["O:-)","o:-)"]},
                {"t":"shut_mouth","src":"shut-mouth","q":[":-X",":-x"]},
                {"t":"moneymouth","src":"moneymouth","q":[":-$"]},
                {"t":"foot_in_mouth","src":"foot-in-mouth","q":[":-!"]},
                {"t":"shout","src":"shout","q":[">:o",">:O"]}
        ],
        init: function(options){
            var emot = webim.ui.emot, q = emot._q = {};
            options = extend({
                dir: 'webim/static/emot/default',
                ext: 'png'
            }, options);
            if (options.emots) 
                emot.emots = options.emots;
            var dir = options.dir + "/";
            var ext = options.ext;
            each(emot.emots, function(key, v){
                if (v && v.src) 
                    v.src = dir + v.src + '.' + ext;
                v && v.q &&
                each(v.q, function(n, val){
                    q[val] = key;
                });

            });
        },
        parse: function(str){
            var q = webim.ui.emot._q, emots = webim.ui.emot.emots;
            q && each(q, function(n, v){
                var emot = emots[v], src = emot.src, title = emot.t ? emot.t : emot.q[0], markup = [];
                markup.push('<img src="');
                markup.push(src);
                markup.push('" title="');
                markup.push(title);
                markup.push('" alt="');
                markup.push(emot.q[0]);
                markup.push('" />');
                n = HTMLEnCode(n);
                n = n.replace(new RegExp('(\\' + '.$^*\\[]()|+?{}:<>'.split('').join('|\\') + ')', "g"), "\\$1");
                str = str.replace(new RegExp(n, "g"), markup.join(''));

            });
            return str;
        }
});
