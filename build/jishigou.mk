include build/config.mk

PRODUCT_NAME = jishigou

JS_APP_FILES = ${JS_SRC_DIR}/ui.setting.js\
	${JS_SRC_DIR}/ui.user.js\
	${JS_SRC_DIR}/ui.login.js\
	${JS_SRC_DIR}/ui.buddy.js\
	${JS_SRC_DIR}/ui.room.js\
	${JS_SRC_DIR}/ui.menu.js\
	${APP_SRC_DIR}/ui.chatlink.js\
	${APP_SRC_DIR}/notification.js\
	${APP_SRC_DIR}/ui.notification.js\
	${APP_SRC_DIR}/ui.layout.popup.js\

CSS_APP_FILES = ${CSS_SRC_DIR}/buddy.css\
	${CSS_SRC_DIR}/setting.css\
	${CSS_SRC_DIR}/user.css\
	${CSS_SRC_DIR}/login.css\
	${CSS_SRC_DIR}/room.css\
	${CSS_SRC_DIR}/menu.css\
	${APP_SRC_DIR}/chatlink.css\
	${APP_SRC_DIR}/notification.css\
	${APP_SRC_DIR}/layout.popup.css\

include build/include.mk
