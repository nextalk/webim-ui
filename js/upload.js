/**
 * Cross domain file upload
 *
 * https://github.com/blueimp/jQuery-File-Upload
 * https://github.com/bkuzmic/jquery-crossdomain-data-plugin/blob/master/jquery.crossdomain.data.js
 *
 */

function _addEvent( obj, type, fn ) {
	if ( obj.addEventListener ) {
		obj.addEventListener( type, fn, false );
	} else{
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){return obj['e'+type+fn]( window.event );}
		obj.attachEvent( 'on'+type, obj[type+fn] );
	}
}
function _removeEvent( obj, type, fn ) {
	if ( obj.addEventListener ) {
		obj.removeEventListener( type, fn, false );
	} else{
		obj.detachEvent( 'on'+type, obj[type+fn] );
		obj[type+fn] = null;
	}
}

function _remove(obj){
	obj && obj.parentNode && (obj.parentNode.removeChild(obj));
}

function _parseJSON( data ){
	return data = data ?
		( window.JSON && window.JSON.parse ?
		window.JSON.parse( data ) :
		(new Function("return " + data))() ) :
		data;
}

function upload( element, callback, start ){
	_addEvent( element, "submit", function(e){
		var name = "_upload_form13123";
		start && start();
		element.setAttribute("target", name);

		var el = document.createElement("div");
		el.innerHTML = '<iframe name="'+name+'" id="'+name+'" style="display:none;" scrolling="no" frameborder="0"></iframe>';
		var frm = el.firstChild;
		document.body.appendChild( el );

		if (window.postMessage) {
			var _cb = function(e){
				_removeEvent(window, "message", _cb);
				_remove( el );
				callback && callback( _parseJSON( e.data ) );
			};
			_addEvent(window, "message", _cb);
		} else {
			var loaded = false;
			_addEvent( frm, "load", function(e){
				if( loaded ) {
					if( !window.attachEvent )
						retrieveData();
				} else {
					loaded = true;
					frm.contentWindow.location = "about:blank";
				}
			});
			if( window.attachEvent ) {
				frm.onreadystatechange = function(){
					if( loaded ) {
						retrieveData();
					}
				}
			}
		}
		function retrieveData(){
			try {
				var data = frm.contentWindow.name || null;
				if (data != null) {
					_remove( el );
					callback && callback( _parseJSON( data ) );
				} else {
					throw new Error("Empty data");
				}
			} catch (e) {
				_remove( el );
				callback && callback( {error: "Retrieve data error"} );
			}
		}
	} );
}


