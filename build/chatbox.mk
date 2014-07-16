include build/config.mk

PRODUCT_NAME = chatbox

JS_APP_FILES = ${JS_SRC_DIR}/ui.setting.js\
	${JS_SRC_DIR}/ui.chatbox.js\

CSS_APP_FILES = ${CSS_SRC_DIR}/chatbox.css\
	${APP_SRC_DIR}/layout.popup.css\

include build/include.mk
