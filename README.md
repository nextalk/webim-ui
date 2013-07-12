WebIM UI
=========================

WebIM user interface base on [WebIM JS][webim_js].


###ui

addChat( type, id, nick )

addApp( name, options )

render()

init()

####Events
newMessage


###ui.layout

render()

notifyUser( type )

chat( type, id )

updateChat( type, infos )

focusChat( type, id )

addChat( type, id, chatUI )

addWidget( widget, container, options )

showWidet( widget\_name )

addBookmark()


###ui.window

####Options

icon

title

visible

maximizable

minimizable

closable

resizable

x

y

width

height

minWidth

minHeight

maxWidth

maxHeight


####Methods

title( content )

icon( url )

header( element )

content( element )

notifyUser( type )

show()

hide()

maximize()

minimize()

restore()

activate()

close()

isActive()

isMaximized()

isMinimized()

####Events

close

activate

deactivate

displayStateChange

resize

move

[webim_js]: http://github.com/webim/webim-js
