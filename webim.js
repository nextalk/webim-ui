/*!
 * Webim v1.1.0
 * http://www.webim20.cn/
 *
 * Copyright (c) 2013 Arron
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Sun Jan 19 22:26:51 2014 +0800
 * Commit: 35a0daae9d462677b9a51ded149d97254609dc85
 */
(function(window, document, undefined){

function now() {
	return (new Date).getTime();
}

var _toString = Object.prototype.toString;
function isFunction( obj ){
	return _toString.call(obj) === "[object Function]";
}

function isArray( obj ){
	return _toString.call(obj) === "[object Array]";
}
function isObject( obj ){
	return obj && _toString.call(obj) === "[object Object]";
}

function trim( text ) {
	return (text || "").replace( /^\s+|\s+$/g, "" );
}

function checkUpdate (old, add){
	var added = false;
	if (isObject(add)) {
		old = old || {};
		for (var key in add) {
			var val = add[key];
			if (old[key] != val) {
				added = added || {};
				added[key] = val;
			}
		}
	}
	return added;
}
function makeArray( array ){
	var ret = [];
	if( array != null ){
		var i = array.length;
		// The window, strings (and functions) also have 'length'
		if( i == null || typeof array === "string" || isFunction(array) || array.setInterval )
			ret[0] = array;
		else
			while( i )
				ret[--i] = array[i];
	}
	return ret;
}

function extend() {
	// copy reference to target object
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction(target) )
		target = {};
	for ( ; i < length; i++ )
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null )
			// Extend the base object
			for ( var name in options ) {
				var src = target[ name ], copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy )
					continue;

				// Recurse if we're merging object values
				if ( deep && copy && typeof copy === "object" && !copy.nodeType )
					target[ name ] = extend( deep, 
							// Never move original objects, clone them
							src || ( copy.length != null ? [ ] : { } )
							, copy );

				// Don't bring in undefined values
				else if ( copy !== undefined )
					target[ name ] = copy;

			}

	// Return the modified object
	return target;
}

function each( object, callback, args ) {
	var name, i = 0,
	    length = object.length,
	    isObj = length === undefined || isFunction(object);

	if ( args ) {
		if ( isObj ) {
			for ( name in object ) {
				if ( callback.apply( object[ name ], args ) === false ) {
					break;
				}
			}
		} else {
			for ( ; i < length; ) {
				if ( callback.apply( object[ i++ ], args ) === false ) {
					break;
				}
			}
		}

		// A special, fast, case for the most common use of each
	} else {
		if ( isObj ) {
			for ( name in object ) {
				if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
					break;
				}
			}
		} else {
			for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
		}
	}

	return object;
}


function inArray( elem, array ) {
	for ( var i = 0, length = array.length; i < length; i++ ) {
		if ( array[ i ] === elem ) {
			return i;
		}
	}

	return -1;
}


function grep( elems, callback, inv ) {
	var ret = [];

	// Go through the array, only saving the items
	// that pass the validator function
	for ( var i = 0, length = elems.length; i < length; i++ ) {
		if ( !inv !== !callback( elems[ i ], i ) ) {
			ret.push( elems[ i ] );
		}
	}

	return ret;
}

function map( elems, callback ) {
	var ret = [], value;

	// Go through the array, translating each of the items to their
	// new value (or values).
	for ( var i = 0, length = elems.length; i < length; i++ ) {
		value = callback( elems[ i ], i );

		if ( value != null ) {
			ret[ ret.length ] = value;
		}
	}

	return ret.concat.apply( [], ret );
}
/*!
 * ClassEvent.js v0.2
 *
 * http://github.com/webim/ClassEvent.js
 *
 * Copyright (c) 2010 Hidden
 * Released under the MIT, BSD, and GPL Licenses.
 *
 */

function ClassEvent( type ) {
	this.type =  type;
	this.timeStamp = ( new Date() ).getTime();
}

ClassEvent.on = function() {
	var proto, helper = ClassEvent.on.prototype;
	for ( var i = 0, l = arguments.length; i < l; i++ ) {
		proto = arguments[ i ].prototype;
		proto.bind = proto.addEventListener = helper.addEventListener;
		proto.unbind = proto.removeEventListener = helper.removeEventListener;
		proto.trigger = proto.dispatchEvent = helper.dispatchEvent;
	}
};


ClassEvent.on.prototype = {
	addEventListener: function( type, listener ) {
		var self = this, ls = self.__listeners = self.__listeners || {};
		ls[ type ] = ls[ type ] || [];
		ls[ type ].push( listener );
		return self;
	},
	dispatchEvent: function( event, extraParameters ) {
		var self = this, ls = self.__listeners = self.__listeners || {};
		event = event.type ? event : new ClassEvent( event );
		ls = ls[ event.type ];
		if ( Object.prototype.toString.call( extraParameters ) === "[object Array]" ) {
			extraParameters.unshift( event );
		} else {
			extraParameters = [ event, extraParameters ];
		}
		if ( ls ) {
			for ( var i = 0, l = ls.length; i < l; i++ ) {
				ls[ i ].apply( self, extraParameters );
			}
		}
		return self;
	},
	removeEventListener: function( type, listener ) {
		var self = this, ls = self.__listeners = self.__listeners || {};
		if ( ls[ type ] ) {
			if ( listener ) {
				var _e = ls[ type ];
				for ( var i = _e.length; i--; i ) {
					if ( _e[ i ] === listener ) 
						_e.splice( i, 1 );
				}
			} else {
				delete ls[ type ];
			}
		}
		return self;
	}
};
/*!
 * ajax.js v0.1
 *
 * http://github.com/webim/ajax.js
 *
 * Copyright (c) 2010 Hidden
 * Released under the MIT, BSD, and GPL Licenses.
 *
 */
var ajax = ( function(){
	var jsc = ( new Date() ).getTime(),
	//Firefox 3.6 and chrome 6 support script async attribute.
	scriptAsync = typeof( document.createElement( "script" ).async ) === "boolean",
	rnoContent = /^(?:GET|HEAD|DELETE)$/,
	rnotwhite = /\S/,
	rbracket = /\[\]$/,
	jsre = /\=\?(&|$)/,
	rquery = /\?/,
	rts = /([?&])_=[^&]*/,
rurl = /^(\w+:)?\/\/([^\/?#]+)/,
r20 = /%20/g,
rhash = /#.*$/;

// IE can async load script in fragment.
window._fragmentProxy = false;
//Check fragment proxy
var frag = document.createDocumentFragment(),
script = document.createElement( 'script' ),
text = "window._fragmentProxy = true";
try{
	script.appendChild( document.createTextNode( text ) );
} catch( e ){
	script.text = text;
}
frag.appendChild( script );
frag = script = null;

function ajax( origSettings ) {
	var s = {};

	for( var key in ajax.settings ) {
		s[ key ] = ajax.settings[ key ];
	}

	if ( origSettings ) {
		for( var key in origSettings ) {
			s[ key ] = origSettings[ key ];
		}
	}

	var jsonp, status, data, type = s.type.toUpperCase(), noContent = rnoContent.test(type), head, proxy, win = window, script;

	s.url = s.url.replace( rhash, "" );

	// Use original (not extended) context object if it was provided
	s.context = origSettings && origSettings.context != null ? origSettings.context : s;

	// convert data if not already a string
	if ( s.data && s.processData && typeof s.data !== "string" ) {
		s.data = param( s.data, s.traditional );
	}

	// Matches an absolute URL, and saves the domain
	var parts = rurl.exec( s.url ),
	location = window.location,
	remote = parts && ( parts[1] && parts[1] !== location.protocol || parts[2] !== location.host );

	if ( ! /https?:/i.test( location.protocol ) ) {
		//The protocol is "app:" in air.
		remote = false;
	}
	remote = s.forceRemote ? true : remote;
	if ( s.dataType === "jsonp" && !remote ) {
		s.dataType = "json";
	}

	// Handle JSONP Parameter Callbacks
	if ( s.dataType === "jsonp" ) {
		if ( type === "GET" ) {
			if ( !jsre.test( s.url ) ) {
				s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
			}
		} else if ( !s.data || !jsre.test(s.data) ) {
			s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
		}
		s.dataType = "json";
	}

	// Build temporary JSONP function
	if ( s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url)) ) {
		jsonp = s.jsonpCallback || ("jsonp" + jsc++);

		// Replace the =? sequence both in the query string and the data
		if ( s.data ) {
			s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
		}

		s.url = s.url.replace(jsre, "=" + jsonp + "$1");

		// We need to make sure
		// that a JSONP style response is executed properly
		s.dataType = "script";

		// Handle JSONP-style loading
		var customJsonp = window[ jsonp ], jsonpDone = false;

		window[ jsonp ] = function( tmp ) {
			if ( !jsonpDone ) {
				jsonpDone = true;
				if ( Object.prototype.toString.call( customJsonp ) === "[object Function]" ) {
					customJsonp( tmp );

				} else {
					// Garbage collect
					window[ jsonp ] = undefined;

					try {
						delete window[ jsonp ];
					} catch( jsonpError ) {}
				}

				data = tmp;
				helper.handleSuccess( s, xhr, status, data );
				helper.handleComplete( s, xhr, status, data );

				if ( head ) {
					head.removeChild( script );
				}
				proxy && proxy.parentNode && proxy.parentNode.removeChild( proxy );
			}
		}
	}

	if ( s.dataType === "script" && s.cache === null ) {
		s.cache = false;
	}

	if ( s.cache === false && type === "GET" ) {
		var ts = ( new Date() ).getTime();

		// try replacing _= if it is there
		var ret = s.url.replace(rts, "$1_=" + ts);

		// if nothing was replaced, add timestamp to the end
		s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
	}

	// If data is available, append data to url for get requests
	if ( s.data && type === "GET" ) {
		s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
	}

	// Watch for a new set of requests
	if ( s.global && helper.active++ === 0 ) {
		//jQuery.event.trigger( "ajaxStart" );
	}

	// If we're requesting a remote document
	// and trying to load JSON or Script with a GET
	if ( s.dataType === "script" && type === "GET" && remote ) {
		var inFrame = false;
		if ( jsonp && s.async && !scriptAsync ) {
			if( window._fragmentProxy ) {
				proxy = document.createDocumentFragment();
				head = proxy;
			} else {
				inFrame = true;
				// Opera need url path in iframe
				if( s.url.slice(0, 1) == "/" ) {
					s.url = location.protocol + "//" + location.host + (location.port ? (":" + location.port) : "" ) + s.url;
				}
				else if( !/^https?:\/\//i.test( s.url ) ){
					var href = location.href,
				ex = /([^?#]+)\//.exec( href );
				s.url = ( ex ? ex[1] : href ) + "/" + s.url;
				}
				s.url = s.url.replace( "=" + jsonp, "=parent." + jsonp );
				proxy = document.createElement( "iframe" );
				proxy.style.position = "absolute";
				proxy.style.left = "-100px";
				proxy.style.top = "-100px";
				proxy.style.height = "1px";
				proxy.style.width = "1px";
				proxy.style.visibility = "hidden";
				document.body.insertBefore( proxy, document.body.firstChild );
				win = proxy.contentWindow;
			}
		}
		function create() {
			var doc = win.document;
			head = head || doc.getElementsByTagName("head")[0] || doc.documentElement;
			script = doc.createElement("script");
			if ( s.scriptCharset ) {
				script.charset = s.scriptCharset;
			}
			script.src = s.url;

			if ( scriptAsync )
				script.async = s.async;

			// Handle Script loading
			if ( jsonp ) {
				// Attach handlers for all browsers
				script.onload = script.onerror = script.onreadystatechange = function(e){
					if( !jsonpDone && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
						//error
						jsonpDone = true;
						helper.handleError( s, xhr, "error", "load error" );
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}
						proxy && proxy.parentNode && proxy.parentNode.removeChild( proxy );
					}
				};
			} else {
				var done = false;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function() {
					if ( !done && (!this.readyState ||
						       this.readyState === "loaded" || this.readyState === "complete") ) {
						done = true;
					helper.handleSuccess( s, xhr, status, data );
					helper.handleComplete( s, xhr, status, data );

					// Handle memory leak in IE
					script.onload = script.onreadystatechange = null;
					if ( head && script.parentNode ) {
						head.removeChild( script );
					}
					}
				};
			} 

			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709 and #4378).
			head.insertBefore( script, head.firstChild );
		}
		inFrame ? setTimeout( function() { create() }, 0 ) : create();

		// We handle everything using the script element injection
		return undefined;
	}

	var requestDone = false;

	// Create the request object
	var xhr = s.xhr();

	if ( !xhr ) {
		return;
	}

	// Open the socket
	// Passing null username, generates a login popup on Opera (#2865)
	if ( s.username ) {
		xhr.open(type, s.url, s.async, s.username, s.password);
	} else {
		xhr.open(type, s.url, s.async);
	}

	// Need an extra try/catch for cross domain requests in Firefox 3
	try {
		// Set content-type if data specified and content-body is valid for this type
		if ( (s.data != null && !noContent) || (origSettings && origSettings.contentType) ) {
			xhr.setRequestHeader("Content-Type", s.contentType);
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( helper.lastModified[s.url] ) {
				xhr.setRequestHeader("If-Modified-Since", helper.lastModified[s.url]);
			}

			if ( helper.etag[s.url] ) {
				xhr.setRequestHeader("If-None-Match", helper.etag[s.url]);
			}
		}

		// Set header so the called script knows that it's an XMLHttpRequest
		// Only send the header if it's not a remote XHR
		if ( !remote ) {
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		}

		// Set the Accepts header for the server, depending on the dataType
		xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				     s.accepts[ s.dataType ] + ", */*; q=0.01" :
					     s.accepts._default );
	} catch( headerError ) {}

	// Allow custom headers/mimetypes and early abort
	if ( s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false ) {
		// Handle the global AJAX counter
		if ( s.global && helper.active-- === 1 ) {
			//jQuery.event.trigger( "ajaxStop" );
		}

		// close opended socket
		xhr.abort();
		return false;
	}

	if ( s.global ) {
		helper.triggerGlobal( s, "ajaxSend", [xhr, s] );
	}

	// Wait for a response to come back
	var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {
		// The request was aborted
		if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {
			// Opera doesn't call onreadystatechange before this point
			// so we simulate the call
			if ( !requestDone ) {
				helper.handleComplete( s, xhr, status, data );
			}

			requestDone = true;
			if ( xhr ) {
				xhr.onreadystatechange = helper.noop;
			}

			// The transfer is complete and the data is available, or the request timed out
		} else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {
			requestDone = true;
			xhr.onreadystatechange = helper.noop;

			status = isTimeout === "timeout" ?
				"timeout" :
					!helper.httpSuccess( xhr ) ?
						"error" :
							s.ifModified && helper.httpNotModified( xhr, s.url ) ?
								"notmodified" :
									"success";

			var errMsg;

			if ( status === "success" ) {
				// Watch for, and catch, XML document parse errors
				try {
					// process the data (runs the xml through httpData regardless of callback)
					data = helper.httpData( xhr, s.dataType, s );
				} catch( parserError ) {
					status = "parsererror";
					errMsg = parserError;
				}
			}

			// Make sure that the request was successful or notmodified
			if ( status === "success" || status === "notmodified" ) {
				// JSONP handles its own success callback
				if ( !jsonp ) {
					helper.handleSuccess( s, xhr, status, data );
				}
			} else {
				helper.handleError( s, xhr, status, errMsg );
			}

			// Fire the complete handlers
			if ( !jsonp ) {
				helper.handleComplete( s, xhr, status, data );
			}

			if ( isTimeout === "timeout" ) {
				xhr.abort();
			}

			// Stop memory leaks
			if ( s.async ) {
				xhr = null;
			}
		}
	};

	// Override the abort handler, if we can (IE 6 doesn't allow it, but that's OK)
	// Opera doesn't fire onreadystatechange at all on abort
	try {
		var oldAbort = xhr.abort;
		xhr.abort = function() {
			// xhr.abort in IE7 is not a native JS function
			// and does not have a call property
			if ( xhr && oldAbort.call ) {
				oldAbort.call( xhr );
			}

			onreadystatechange( "abort" );
		};
	} catch( abortError ) {}

	// Timeout checker
	if ( s.async && s.timeout > 0 ) {
		setTimeout(function() {
			// Check to see if the request is still happening
			if ( xhr && !requestDone ) {
				onreadystatechange( "timeout" );
			}
		}, s.timeout);
	}

	// Send the data
	try {
		xhr.send( noContent || s.data == null ? null : s.data );

	} catch( sendError ) {
		helper.handleError( s, xhr, null, sendError );

		// Fire the complete handlers
		helper.handleComplete( s, xhr, status, data );
	}

	// firefox 1.5 doesn't fire statechange for sync requests
	if ( !s.async ) {
		onreadystatechange();
	}

	// return XMLHttpRequest to allow aborting the request etc.
	return xhr;
}

function param( a ) {
	var s = [];
	if ( typeof a == "object"){
		for (var key in a) {
			s[ s.length ] = encodeURIComponent(key) + '=' + encodeURIComponent(a[key]);
		}
		// Return the resulting serialization
		return s.join("&").replace(r20, "+");
	}
	return a;
}

ajax.param = param;

var helper = {
	noop: function() {},
	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	handleError: function( s, xhr, status, e ) {
		// If a local callback was specified, fire it
		if ( s.error ) {
			s.error.call( s.context, xhr, status, e );
		}

		// Fire the global callback
		if ( s.global ) {
			helper.triggerGlobal( s, "ajaxError", [xhr, s, e] );
		}
	},

	handleSuccess: function( s, xhr, status, data ) {
		// If a local callback was specified, fire it and pass it the data
		if ( s.success ) {
			s.success.call( s.context, data, status, xhr );
		}

		// Fire the global callback
		if ( s.global ) {
			helper.triggerGlobal( s, "ajaxSuccess", [xhr, s] );
		}
	},

	handleComplete: function( s, xhr, status ) {
		// Process result
		if ( s.complete ) {
			s.complete.call( s.context, xhr, status );
		}

		// The request was completed
		if ( s.global ) {
			helper.triggerGlobal( s, "ajaxComplete", [xhr, s] );
		}

		// Handle the global AJAX counter
		if ( s.global && helper.active-- === 1 ) {
			//jQuery.event.trigger( "ajaxStop" );
		}
	},

	triggerGlobal: function( s, type, args ) {
		//(s.context && s.context.url == null ? jQuery(s.context) : jQuery.event).trigger(type, args);
	},

	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function( xhr ) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return !xhr.status && location.protocol === "file:" ||
				xhr.status >= 200 && xhr.status < 300 ||
					xhr.status === 304 || xhr.status === 1223;
		} catch(e) {}

		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function( xhr, url ) {
		var lastModified = xhr.getResponseHeader("Last-Modified"),
		etag = xhr.getResponseHeader("Etag");

		if ( lastModified ) {
			helper.lastModified[url] = lastModified;
		}

		if ( etag ) {
			helper.etag[url] = etag;
		}

		return xhr.status === 304;
	},

	httpData: function( xhr, type, s ) {
		var ct = xhr.getResponseHeader("content-type") || "",
		xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
		data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.nodeName === "parsererror" ) {
			helper.error( "parsererror" );
		}

		// Allow a pre-filtering function to sanitize the response
		// s is checked to keep backwards compatibility
		if ( s && s.dataFilter ) {
			data = s.dataFilter( data, type );
		}

		// The filter can actually parse the response
		if ( typeof data === "string" ) {
			// Get the JavaScript object, if JSON is used.
			if ( type === "json" || !type && ct.indexOf("json") >= 0 ) {
				data = data ? 
					( window.JSON && window.JSON.parse ?
					 window.JSON.parse( data ) :
						 (new Function("return " + data))() ) : 
							 data;

				// If the type is "script", eval it in global context
			} else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
				//jQuery.globalEval( data );
				if ( data && rnotwhite.test(data) ) {
					// Inspired by code by Andrea Giammarchi
					// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
					var head = document.getElementsByTagName("head")[0] || document.documentElement,
					script = document.createElement("script");
					script.type = "text/javascript";
					try {
						script.appendChild( document.createTextNode( data ) );
					} catch( e ) {
						script.text = data;
					}

					// Use insertBefore instead of appendChild to circumvent an IE6 bug.
					// This arises when a base node is used (#2709).
					head.insertBefore( script, head.firstChild );
					head.removeChild( script );
				}
			}
		}

		return data;
	}

};


ajax.settings = {
	url: location.href,
	global: true,
	type: "GET",
	contentType: "application/x-www-form-urlencoded",
	processData: true,
	async: true,
/*
* timeout: 0,
* data: null,
* username: null,
* password: null,
* traditional: false,
* */
	// This function can be overriden by calling ajax.setup
	xhr: function() {
		return new window.XMLHttpRequest();
	},
	accepts: {
		xml: "application/xml, text/xml",
		html: "text/html",
		script: "text/javascript, application/javascript",
		json: "application/json, text/javascript",
		text: "text/plain",
		_default: "*/*"
	}
};

ajax.setup = function( settings ) {
	if ( settings ) {
		for( var key in settings ) {
			ajax.settings[ key ] = settings[ key ];
		}
	}
}

/*
* Create the request object; Microsoft failed to properly
* implement the XMLHttpRequest in IE7 (can't request local files),
* so we use the ActiveXObject when it is available
* Additionally XMLHttpRequest can be disabled in IE7/IE8 so
* we need a fallback.
*/
if ( window.ActiveXObject ) {
	ajax.settings.xhr = function() {
		if ( window.location.protocol !== "file:" ) {
			try {
				return new window.XMLHttpRequest();
			} catch(xhrError) {}
		}

		try {
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		} catch(activeError) {}
	};
}
return ajax;
} )();


/**
* 
* JSONP
*
* Safari and chrome not support async opiton, it aways async.
*
* Reference:
*
* http://forum.jquery.com/topic/scriptcommunicator-for-ajax-script-jsonp-loading
* http://d-tune.javaeye.com/blog/506074
*
* Opera: 10.01
* 	run sync.
* 	can't load sync.
* 	trigger onload when load js file with content.
* 	trigger error when src is invalid.
* 	don't trigger any event when src is valid and load error.
* 	don't trigger any event when js file is blank.
*
* Chrome: 6.0
* 	run async when use createElement.
* 	run sync when use document.writeln.
* 	prefect onload and onerror event.
*
* Safari: 5.0
* 	run async.
* 	prefect onload and onerror event.
* 
* Firefox: 3.6
* 	run sync.
* 	support async by set script.async = true.
* 	prefect onload and onerror event.
*
*/


/** HTML5 contain JSON */

if ( window.JSON ) {
	var JSON = window.JSON;
} else {
	var JSON = ( function() {
		var chars = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};

		function rChars( chr ) {
			return chars[chr] || '\\u00' + Math.floor( chr.charCodeAt() / 16 ).toString( 16 ) + ( chr.charCodeAt() % 16 ).toString( 16 );
		}

		function encode( obj ) {
			switch ( Object.prototype.toString.call( obj ) ) {
				case '[object String]':
					return '"' + obj.replace( /[\x00-\x1f\\"]/g, rChars ) + '"';
				case '[object Array]':
					var string = [], l = obj.length;
				for( var i = 0; i < l; i++ ){
					string.push( encode( obj[i] ) );
				}
				return '[' + string.join( "," ) + ']';
				case '[object Object]':
					var string = [];
				for( var key in obj ) {
					var json = encode( obj[key] );
					if( json ) string.push( encode( key ) + ':' + json );
				}
				return '{' + string + '}';
				case '[object Number]': case '[object Boolean]': return String(obj);
				case false: return 'null';
			}
			return null;
		}
		return {
			stringify: encode,
			parse: function( str ) {
				str = str.toString();
				if( !str || !str.length ) return null;
				return ( new Function( "return " + str ) )();
				//if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
			}
		}
	} )();
}

/*!
* comet.js v0.1
*
* http://github.com/webim/comet.js
*
* Copyright (c) 2010 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
* Depends:
* 	ClassEvent.js http://github.com/webim/ClassEvent.js
* 	ajax.js http://github.com/webim/ajax.js
*
*/

function comet( url ) {
	var self = this;
	self.URL = url;
	self._setting();
	self._connect();
}

comet.prototype = {
	readyState: 0,
	send: function( data ) {
	},
	_setting: function(){
		var self = this;
		self.readyState = comet.CLOSED;//是否已连接 只读属性
		self._connecting = false; //设置连接开关避免重复连接
		self._onPolling = false; //避免重复polling
		self._pollTimer = null;
		self._pollingTimes = 0; //polling次数 第一次成功后 connected = true; 
		self._failTimes = 0;//polling失败累加2次判定服务器关闭连接
	},
	_connect: function(){
		//连接
		var self = this;
		if ( self._connecting ) 
			return self;
		self.readyState = comet.CONNECTING;
		self._connecting = true;
		if ( !self._onPolling ) {
			window.setTimeout( function() {
				self._startPolling();
			}, 300 );
		}
		return self;
	},
	close: function(){
		var self = this;
		if ( self._pollTimer ) 
			clearTimeout( self._pollTimer );
		self._setting();
		return self;
	},
	_onConnect: function() {
		var self = this;
		self.readyState = comet.OPEN;
		self.trigger( 'open', 'success' );
	},
	_onClose: function( m ) {
		var self = this;
		self._setting();
		//Delay trigger event when reflesh web site
		setTimeout( function(){
			self.trigger( 'close', [ m ] );
		}, 1000 );
	},
	_onData: function(data) {
		var self = this;
		self.trigger( 'message', [ data ] );
	},
	_onError: function( text ) {
		var self = this;
		self._setting();
		//Delay trigger event when reflesh web site
		setTimeout( function(){
			self.trigger( 'error', [ text ] );
		}, 1000 );
	},
	_startPolling: function() {
		var self = this;
		if ( !self._connecting )
			return;
		self._onPolling = true;
		self._pollingTimes++;
		ajax( {
			url: self.URL,
			dataType: 'jsonp',
			cache: false,
			context: self,
			success: self._onPollSuccess,
			error: self._onPollError
		} );
	},
	_onPollSuccess: function(d){
		var self = this;
		self._onPolling = false;
		if ( self._connecting ) {
			if( !d ) {
				return self._onError('error data');
			}else{
				if ( self._pollingTimes == 1 ) {
					self._onConnect();
				}
				self._onData( d );
				self._failTimes = 0;//连接成功 失败累加清零
				self._pollTimer = window.setTimeout(function(){
					self._startPolling();
				}, 200);
			}
		}
	},
	_onPollError: function( m ) {
		var self = this;
		self._onPolling = false;
		if (!self._connecting) 
			return;//已断开连接
		self._failTimes++;
		if (self._pollingTimes == 1) 
			self._onError('can not connect.');
		else{
			if (self._failTimes > 1) {
				//服务器关闭连接
				self._onClose( m );
			}
			else {
				self._pollTimer = window.setTimeout(function(){
					self._startPolling();
				}, 200);
			}
		}
	}
};

//The connection has not yet been established.
comet.CONNECTING = 0;

//The connection is established and communication is possible.
comet.OPEN = 1;

//The connection has been closed or could not be opened.
comet.CLOSED = 2;

//Make the class work with custom events
ClassEvent.on( comet );
/*
 * websocket
 */


function socket( url, options ) {
	var self = this, options = options || {};
	var ws = self.ws = new WebSocket( url );
	ws.onopen = function ( e ) { 
		self.trigger( 'open', 'success' );
		ws.send("subscribe " + options.domain + " " + options.ticket );
	}; 
	ws.onclose = function ( e ) { 
		self.trigger( 'close', [ e.data ] );
	}; 
	ws.onmessage = function ( e ) { 
		var data = e.data;

		try{
			data = data ?
				( window.JSON && window.JSON.parse ?
				window.JSON.parse( data ) :
				(new Function("return " + data))() ) :
				data;
		}catch(e){};

		self.trigger( 'message', [ data ] );
	}; 
	ws.onerror = function ( e ) { 
		self.trigger( 'error', [ ] );
	}; 
}

socket.prototype = {
	readyState: 0,
	send: function( data ) {
	},
	close: function() {
		this.ws.close();
	}
};

socket.enable = !!window.WebSocket;

//The connection has not yet been established.
socket.CONNECTING = 0;

//The connection is established and communication is possible.
socket.OPEN = 1;

//The connection has been closed or could not be opened.
socket.CLOSED = 2;

//Make the class work with custom events
ClassEvent.on( socket );


/*
 * Cookie plugin
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/*
 * Create a cookie with the given name and value and other optional parameters.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/*
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
function cookie(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            //options = extend({}, options); // clone object since it's unexpected behavior if the expired property were changed
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // NOTE Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
function log() {

	var d = new Date(),  time = ['[', d.getHours(), ':', d.getMinutes(), ':', d.getSeconds(), '-', d.getMilliseconds(), ']'].join("");
	if ( window && window.console ) {
		window.console.log.apply( null, arguments );
	} else if ( window && window.runtime && window.air && window.air.Introspector ) {
		window.air.Introspector.Console.log.apply( null, arguments );
	}

}

function webim( element, options ) {
	this.options = extend( {}, webim.defaults, options );
	this._init( element, options );
}

ClassEvent.on( webim );

webim.csrf_token = "";
webim.OFFLINE = 0;
webim.BEFOREONLINE = 1;
webim.ONLINE = 2;

extend(webim.prototype, {
	state: webim.OFFLINE,
	_init: function() {
		var self = this, options = self.options;
		//Default user status info.
		self.data = { 
			user: {
				presence: 'offline', 
				show: 'unavailable'
			}
		};

		ajax.settings.dataType = options.jsonp ? "jsonp" : "json";

		self.status = new webim.status();
		self.setting = new webim.setting();
		self.buddy = new webim.buddy();
		self.room = new webim.room(null, self.data );
		self.history = new webim.history(null, self.data );
		self._initEvents();
	},
	_createConnect: function() {
		var self = this;
		var url = self.data.connection;

		self.connection = self.options.connectionType != "jsonpd" 
			&& url.websocket && socket.enable ? 
			new socket( url.websocket, url ) : new comet( url.server + ( /\?/.test( url ) ? "&" : "?" ) + ajax.param( { ticket: url.ticket, domain: url.domain } ) );

		self.connection.bind( "connect",function( e, data ) {
		}).bind( "message", function( e, data ) {
			self.handle( data );
		}).bind( "error", function( e, data ){
			self._stop( "connect", "Connect Error" );
		}).bind( "close", function( e, data ) {
			self._stop( "connect", "Disconnect" );
		});
	},
	setUser: function( info ) {
		extend( this.data.user, info );
	},
	_ready: function( post_data ) {
		var self = this;
		self.state = webim.BEFOREONLINE;
		//self._unloadFun = window.onbeforeunload;
		//window.onbeforeunload = function(){
		//	self._deactivate();
		//};
		self.trigger( "beforeOnline", [ post_data ] );
	},
	_go: function() {
		var self = this, data = self.data, history = self.history, buddy = self.buddy, room = self.room;
		self.state = webim.ONLINE;
		history.options.userInfo = data.user;
		var ids = [];
		each( data.buddies, function(n, v) {
			history.init( "chat", v.id, v.history );
		});
		buddy.set( data.buddies );
		//rooms
		each( data.rooms, function(n, v) {
			history.init( "grpchat", v.id, v.history );
		});
		//blocked rooms
		var b = self.setting.get("blocked_rooms"), roomData = data.rooms;
		isArray(b) && roomData && each(b,function(n,v){
			roomData[v] && (roomData[v].blocked = true);
		});
		room.set(roomData);
		room.options.ticket = data.connection.ticket;
		self.trigger("online",[data]);
		self._createConnect();
		//handle new messages at last
		var n_msg = [];
		if( data.new_messages ) {
			n_msg = n_msg.concat( data.new_messages );
		}
		if( data.offline_messages ) {
			n_msg = n_msg.concat( data.offline_messages );
		}
		if(n_msg && n_msg.length){
			each(n_msg, function(n, v){
				v["new"] = true;
			});
			self.trigger("message",[n_msg]);
		}
	},
	_stop: function( type, msg ){
		var self = this;
		if ( self.state === webim.OFFLINE ) {
			return;
		}
		self.state = webim.OFFLINE;
		//window.onbeforeunload = self._unloadFun;
		self.data.user.presence = "offline";
		self.data.user.show = "unavailable";
		self.buddy.clear();
		self.trigger("offline", [type, msg] );
	},
	autoOnline: function(){
		return !this.status.get("o");
	},
	_initEvents: function(){
		var self = this
		  , status = self.status
		  , setting = self.setting
		  , history = self.history
		  , buddy = self.buddy
		  , room = self.room;

		self.bind( "message", function( e, data ) {
			var online_buddies = [], l = data.length, uid = self.data.user.id, v, id, type;
			//When revice a new message from router server, make the buddy online.
			for(var i = 0; i < l; i++){
				v = data[i];
				type = v["type"];
				id = type == "chat" ? (v.to == uid ? v.from : v.to) : v.to;
				v["id"] = id;
				if( type == "chat" && !v["new"] ) {
					var msg = { id: id, presence: "online" };
					//update nick.
					if( v.nick && v.to == uid ) msg.nick = v.nick;
					online_buddies.push( msg );
				}
			}
			if( online_buddies.length ) {
				buddy.presence( online_buddies );
				//the chat window will pop out, need complete info
				buddy.complete();
			}
			history.set( data );
		});

		self.bind("presence",function( e, data ) {
			buddy.presence( map( grep( data, grepPresence ), mapFrom ) );
			data = grep( data, grepRoomPresence );
			for (var i = data.length - 1; i >= 0; i--) {
				var dd = data[i];
				if( dd.type == "leave" ) {
					room.removeMember(dd.to || dd.status, dd.from);
				} else {
					room.addMember(dd.to || dd.status, {
						id: dd.from
					  , nick: dd.nick
					});
				}
			};
		});

		function mapFrom( a ) { 
			var d = { id: a.from, presence: a.type }; 
			if( a.show ) d.show = a.show;
			if( a.nick ) d.nick = a.nick;
			if( a.status ) d.status = a.status;
			return d;
		}

		function grepPresence( a ){
			return a.type == "online" || a.type == "offline" || a.type == "show";
		}
		function grepRoomPresence( a ){
			return a.type == "join" || a.type == "leave";
		}
	},
	handle: function(data){
		var self = this;
		if( data.messages && data.messages.length ){
			var origin = data.messages
			  , msgs = []
			  , events = [];
			for (var i = 0; i < origin.length; i++) {
				var msg = origin[i];
				if( msg.body && msg.body.indexOf("webim-event:") == 0 ){
					msg.event = msg.body.replace("webim-event:", "").split("|,|");
					events.push( msg );
				} else {
					msgs.push( msg );
				}
			};
			msgs.length && self.trigger( "message", [ msgs ] );
			events.length && self.trigger( "event", [ events ] );
		}
		data.presences && data.presences.length && self.trigger( "presence", [ data.presences ] );
		data.statuses && data.statuses.length && self.trigger( "status", [ data.statuses ] );
	},
	sendMessage: function( msg, callback ) {
		var self = this;
		msg.ticket = self.data.connection.ticket;
		self.trigger( "sendMessage", [ msg ] );
		ajax({
			type:"post",
			cache: false,
			url: route( "message" ),
			data: extend({csrf_token: webim.csrf_token}, msg),
			success: callback,
			error: callback
		});
	},
	sendStatus: function( msg, callback ){
		var self = this;
		msg.ticket = self.data.connection.ticket;
		self.trigger( "sendStatus", [ msg ] );
		ajax({
			type:"post",
			cache: false,
			url: route( "status" ),			
			data: extend({csrf_token: webim.csrf_token}, msg),
			success: callback,
			error: callback
		});
	},
	sendPresence: function( msg, callback ){
		var self = this;
		msg.ticket = self.data.connection.ticket;
		//save show status
		self.data.user.show = msg.show;
		self.status.set( "s", msg.show );
		self.trigger( "sendPresence", [ msg ] );
		ajax( {
			type:"post",
			cache: false,
			url: route( "presence" ),			
			data: extend({csrf_token: webim.csrf_token}, msg),
			success: callback,
			error: callback
		} );
	},
	//setStranger: function(ids){
	//	this.stranger_ids = idsArray(ids);
	//},
	//stranger_ids: [],
	online: function( params ) {
		var self = this, status = self.status;
		if ( self.state !== webim.OFFLINE ) {
			return;
		}

		var buddy_ids = [], room_ids = [], tabs = status.get("tabs"), tabIds = status.get("tabIds");
		if(tabIds && tabIds.length && tabs){
			each(tabs, function(k,v){
				if(k[0] == "b") buddy_ids.push(k.slice(2));
				if(k[0] == "r") room_ids.push(k.slice(2));
			});
		}
		params = extend({                                
			//stranger_ids: self.stranger_ids.join(","),
			buddy_ids: buddy_ids.join(","),
			room_ids: room_ids.join(","),
			csrf_token: webim.csrf_token,
			show: status.get("s") || "available"
		}, params);
		self._ready(params);
		//set auto open true
		status.set("o", false);
		status.set("s", params.show);

		ajax({
			type:"post",
			cache: false,
			url: route( "online" ),
			data: params,
			success: function( data ){
				if( !data ){
					self._stop( "online", "Not Found" );
				}else if( !data.success ) {
					self._stop( "online", data.error_msg );
				}else{
					data.user = extend( self.data.user, data.user, { presence: "online" } );
					self.data = data;
					self._go();
				}
			},
			error: function( data ) {
				self._stop( "online", "Not Found" );
			}
		});
	},
	offline: function() {
		var self = this, data = self.data;
		if ( self.state === webim.OFFLINE ) {
			return;
		}
		self.status.set("o", true);
		self.connection.close();
		self._stop("offline", "offline");
		ajax({
			type:"post",
			cache: false,
			url: route( "offline" ),
			data: {
				status: 'offline',
				csrf_token: webim.csrf_token,
				ticket: data.connection.ticket
			}
		});

	},
	_deactivate: function(){
		var self = this, data = self.data;
		if( !data || !data.connection || !data.connection.ticket ) return;
		ajax( {
			type:"get",
			cache: false,
			url: route( "deactivate" ),
			data: {
				ticket: data.connection.ticket,
				csrf_token: webim.csrf_token
			}
		} );
	}

});

function idsArray( ids ) {
	return ids && ids.split ? ids.split( "," ) : ( isArray( ids ) ? ids : ( parseInt( ids ) ? [ parseInt( ids ) ] : [] ) );
}
function model( name, defaults, proto ) {
	function m( data, options ) {
		var self = this;
		self.data = data;
		self.options = extend( {}, m.defaults, options );
		isFunction( self._init ) && self._init();
	}
	m.defaults = defaults;
	ClassEvent.on( m );
	extend( m.prototype, proto );
	webim[ name ] = m;
}

function route( ob, val ) {
	var options = ob;
	if( typeof ob == "string" ) {
		options[ ob ] = val;
		if ( val === undefined )
			return route[ ob ];
	}
	extend( route, options );
}

//_webim = window.webim;
window.webim = webim;

extend( webim, {
	version: "1.1.0",
	defaults:{
	},
	log: log,
	idsArray: idsArray,
	now: now,
	isFunction: isFunction,
	isArray: isArray,
	isObject: isObject,
	trim: trim,
	makeArray: makeArray,
	extend: extend,
	each: each,
	inArray: inArray,
	grep: grep,
	map: map,
	JSON: JSON,
	ajax: ajax,
	comet: comet,
	socket: socket,
	model: model,
	route: route,
	ClassEvent: ClassEvent
} );
/*
* 配置(数据库永久存储)
* Methods:
* 	get
* 	set
*
* Events:
* 	update
* 	
*/
model("setting",{
	data: {
		play_sound: true,
		buddy_sticky: true,
		minimize_layout: true,
		msg_auto_pop: true,
		temporary_rooms: [],
		blocked_rooms: []
	}
},{
	_init:function(){
		var self = this;
		self.data = extend( {}, self.options.data, self.data );
	},
	get: function( key ) {
		return this.data[ key ];
	},
	set: function( key, value ) {
		var self = this, options = key;
		if( !key )return;
		if ( typeof key == "string" ) {
			options = {};
			options[ key ] = value;
		}
		var _old = self.data,
		up = checkUpdate( _old, options );
		if ( up ) {
			each( up,function( key,val ) {
				self.trigger( "update", [ key, val ] );
			} );
			var _new = extend( {}, _old, options );
			self.data = _new;
			ajax( {
				type: 'post',
				url: route( "setting" ),
				cache: false,
				data: {
					data: JSON.stringify( _new ),
					csrf_token: webim.csrf_token
				}
			} );
		}
	}
} );
/*
 * 状态(cookie临时存储[刷新页面有效])
 * 
 * get(key);//get
 * set(key,value);//set
 * clear()
 */
//var d = {
//        tabs:{1:{n:5}}, // n -> notice count
//        tabIds:[1],
//        p:5, //tab prevCount
//        a:5, //tab activeTabId
//        b:0, //is buddy open
//        o:0 //has offline
//}

model( "status", {
	key:"_webim"
}, {
	_init:function() {
		var self = this, data = self.data, key = self.options.key;
		var store = window.localStorage;
		if( store ) {
			//无痕浏览模式
			try {
				var testKey = '__store_webim__'
				store.setItem(testKey, testKey)
				if (store.getItem(testKey) == testKey) { 
					self.store = store;
				}
				store.removeItem(testKey);
			} catch(e) {
				self.store = undefined;
			}
		}
		if ( !data ) {
			var c = self.store ? self.store.getItem( key ) : cookie( key );
			self.data = c ? JSON.parse( c ) : {};
		}else{
			self._save( data );
		}
	},
	set: function( key, value ) {
		var options = key, self = this;
		if (typeof key == "string") {
			options = {};
			options[key] = value;
		}
		var old = self.data;
		if ( checkUpdate( old, options ) ) {
			var _new = extend( {}, old, options );
			self._save( _new );
		}
	},
	get: function( key ) {
		return this.data[ key ];
	},
	clear: function() {
		this._save( {} );
	},
	_save: function( data ) {
		var self = this, key = self.options.key;
		self.data = data;
		data = JSON.stringify( data );
		self.store ? self.store.setItem( key, data ) : cookie( key, data, {
			path: '/',
			domain: document.domain
		} );
	}
} );

/**
* buddy //联系人
*/

model( "buddy", {
	active: true
}, {
	_init: function(){
		var self = this;
		self.data = self.data || [];
		self.dataHash = {};
		self.set( self.data );
	},
	clear:function() {
		var self =this;
		self.data = [];
		self.dataHash = {};
	},
	count: function(conditions){
		var data = this.dataHash, count = 0, t;
		for(var key in data){
			if( isObject( conditions ) ) {
				t = true;
				for(var k in conditions){
					if( conditions[k] != data[key][k] ) t = false;
				}
				if(t) count++;
			}else{
				count ++;
			}
		}
		return count;
	},
	get: function( id ) {
		return this.dataHash[ id ];
	},
	all: function( onlyVisible ){
		if( onlyVisible )
			return grep(this.data, function(a){ return a.show != "invisible" && a.presence == "online"});
		else
			return this.data;
	},
	complete: function() {
		var self = this, data = self.dataHash, ids = [], v;
		for( var key in data ) {
			v = data[ key ];
			//Will load offline info for show unavailable buddy.
			//if( v.incomplete && v.presence == 'online' ) {
			if( v.incomplete ) {
				//Don't load repeat. 
				v.incomplete = false;
				ids.push( key );
			}
		}
		self.load( ids );
	},
	update: function( ids ) {
		this.load( ids );
	},
	presence: function( data ) {
		var self = this, dataHash = self.dataHash;
		data = isArray( data ) ? data : [ data ];
		//Complete presence info.
		for( var i in data ) {
			var v = data[ i ];
			//Presence in [show,offline,online]
			v.presence = v.presence == "offline" ? "offline" : "online";
			v.incomplete = !dataHash[ v.id ];
			if( !v.group && v.id ) {
				v.group = v.id.indexOf("vid:") == 0 ? "visitor" : v.group;
			}
		}
		self.set( data );
	},
	load: function( ids ) {
		ids = idsArray( ids );
		if( ids.length ) {
			var self = this, options = self.options;
			ajax( {
				type: "get",
				url: route( "buddies" ),
				cache: false,
				data:{ ids: ids.join(","), csrf_token: webim.csrf_token },
				context: self,
				success: self.set
			} );
		}
	},
	set: function( addData ) {
		var self = this, data = self.data, dataHash = self.dataHash, status = {};
		addData = addData || [];
		var l = addData.length , v, type, add;
		//for(var i = 0; i < l; i++){
		for(var i in addData){
			v = addData[i], id = v.id;
			if(id){
				if(!dataHash[id]){
					v.presence = v.presence || "online";
					v.show = v.show ? v.show : (v.presence == "offline" ? "unavailable" : "available");
					dataHash[id] = {};
					data.push(dataHash[id]);
				}
				v.incomplete = !!v.incomplete;
				add = checkUpdate(dataHash[id], v);
				if(add){
					type = add.presence || "update";
					status[type] = status[type] || [];
					extend(dataHash[id], add);
					status[type].push(dataHash[id]);
				}
			}
		}
		for ( var key in status ) {
			self.trigger( key, [ status[key] ] );
		}
		self.options.active && self.complete();
	}
} );
/*
* room
*
*/
( function() {
	model("room", {
	},{
		_init: function() {
			var self = this;
			self.data = self.data || [];
			self.dataHash = {};
		},
		get: function(id) {
			return this.dataHash[id];
		},
		all: function( onlyTemporary ){
			if( onlyTemporary )
				return grep(this.data, function(a){ return a.temporary });
			else
				return this.data;
		},
		block: function(id) {
			var self = this, d = self.dataHash[id];
			if(d && !d.blocked){
				d.blocked = true;
				var list = [];
				each(self.dataHash,function(n,v){
					if(!v.temporary && v.blocked) list.push(v.id);
				});
				self.trigger("block",[id, list]);
			}
		},
		unblock: function(id) {
			var self = this, d = self.dataHash[id];
			if(d && d.blocked){
				d.blocked = false;
				var list = [];
				each(self.dataHash,function(n,v){
					if(!v.temporary && v.blocked) list.push(v.id);
				});
				self.trigger("unblock",[id, list]);
			}
		},
		set: function(d) {
			var self = this, data = self.data, dataHash = self.dataHash, status = {};
			each(d,function(k,v){
				var id = v.id;
				if(id){
					v.members = v.members || [];
					v.count = v.count || 0;
					v.all_count = v.all_count || 0;
					if(!dataHash[id]){
						dataHash[id] = v;
						data.push(v);
					}
					else extend(dataHash[id], v);
					self.trigger("join",[dataHash[id]]);
				}

			});
		},
		addMember: function(room_id, info){
			var self = this;
			if(isArray(info)){
				each(info, function(k,v){
					self.addMember(room_id, v);
				});
				return;
			};
			var room = self.dataHash[room_id];
			if(room){
				var members = room.members, member;
				for (var i = members.length; i--; i){
					if (members[i].id == info.id) {
						member = members[i];
					}
				}
				if(!member){
					info.nick = info.nick;
					members.push(info);
					room.count = members.length;
					self.trigger("addMember",[room_id, info]);
				}
			}
		},
		removeMember: function(room_id, member_id){
			var self = this
			  , room = this.dataHash[room_id];
			if(room){
				var members = room.members, member;
				for (var i = members.length; i--; i){
					if (members[i].id == member_id) {
						member = members[i];
						members.splice(i, 1);
						room.count--;
					}
				}
				member && self.trigger("removeMember",[room_id, member]);
			}
		},
		initMember: function(id){
			var room = this.dataHash[id];
			if(room && !room.initMember){
				room.initMember = true;
				this.loadMember(id);
			}
		},
		loadMember: function(id){
			var self = this, options = self.options;
			ajax( {
				type: "get",
				cache: false,
				url: route( "members" ),
				data: {
					ticket: options.ticket,
					id: id,
					csrf_token: webim.csrf_token
				},
				success: function(data){
					self.addMember(id, data);
				}
			});
		},
		join:function(id, nick, callback){
			var self = this, options = self.options, user = options.user;

			ajax({
				type: "post",
				cache: false,
				url: route( "join" ),
				data: {
					ticket: options.ticket,
					id: id,
					nick: nick || "", 
					csrf_token: webim.csrf_token
				},
				success: function( data ) {
					self.initMember( id );
					self.set( [ data ] );
					callback && callback( data );
				}
			});
		},
		leave: function(id){
			var self = this, options = self.options, d = self.dataHash[id], user = options.user;
			if(d){
				d.initMember = false;
				ajax({
					type: "post",
					cache: false,
					url: route( "leave" ),
					data: {
						ticket: options.ticket,
						id: id,
						nick: user.nick, 
						csrf_token: webim.csrf_token
					}
				});
				self.trigger("leave",[d]);
			}
		},
		clear:function(){
		}
	} );
} )();
/*
history // 消息历史记录 Support chat and grpchat
*/

model("history", {
}, {
	_init:function(){
		var self = this;
		self.data = self.data || {};
		self.data.chat = self.data.chat || {};
		self.data.grpchat = self.data.grpchat || {};
	},
	get: function( type, id ) {
		return this.data[type][id];
	},
	set:function( addData ) {
		var self = this, data = self.data, cache = {"chat": {}, "grpchat": {}};
		addData = makeArray(addData);
		var l = addData.length , v, id, userId = self.options.userInfo.id;
		if(!l)return;
		for( var i = 0; i < l; i++ ) {
			//for(var i in addData){
			v = addData[i];
			type = v.type;
			id = type == "chat" ? (v.to == userId ? v.from : v.to) : v.to;
			if(id && type){
				cache[type][id] = cache[type][id] || [];
				cache[type][id].push(v);
			}
		}
		for (var type in cache){
			for (var id in cache[type]){
				var v = cache[type][id];
				if(data[type][id]){
					data[type][id] = data[type][id].concat(v);
					self._triggerMsg(type, id, v);
				}else{
					self.load(type, id);
				}
			}
		}
	},
	_triggerMsg: function(type, id, data){
		//this.trigger("message." + id, [data]);
		this.trigger(type, [id, data]);
	},
	clear: function(type, id){
		var self = this, options = self.options;
		self.data[type][id] = [];
		self.trigger("clear", [type, id]);
		ajax({
			url: route( "clear" ),
			type: "post",
			cache: false,
			data:{ type: type, id: id, csrf_token: webim.csrf_token }
		});
	},
	download: function(type, id){
		var self = this, 
		options = self.options, 
		url = route( "download" ),
		f = document.createElement('iframe'), 
		d = new Date(),
		ar = [],
		data = {id: id, type: type, time: (new Date()).getTime(), date: d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() };
		for (var key in data ) {
			ar[ ar.length ] = encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
		}
		url += ( /\?/.test( url ) ? "&" : "?" ) + ar.join( "&" );
		f.setAttribute( "src", url );
		f.style.display = 'none'; 
		document.body.appendChild( f ); 
	},
	init: function(type, id, data){
		var self = this;
		if(isArray(data)){
			self.data[type][id] = data;
			self._triggerMsg( type, id, data );
		}
	},
	load: function(type, id){
		var self = this, options = self.options;
		self.data[type][id] = [];
		ajax( {
			url: route( "history" ),
			cache: false,
			type: "get",
			data:{type: type, id: id, csrf_token: webim.csrf_token},
			//context: self,
			success: function(data){
				self.init(type, id, data);
			}
		} );
	}
} );
})(window, document);
