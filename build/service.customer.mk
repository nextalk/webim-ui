include build/config.mk

PRODUCT_NAME = service.customer

JS_APP_FILES = ${JS_SRC_DIR}/ui.buddy.js\
	${JS_SRC_DIR}/ui.user.js\
	${APP_SRC_DIR}/ui.layout.popup.js\

CSS_APP_FILES = ${CSS_SRC_DIR}/buddy.css\
	${CSS_SRC_DIR}/user.css\
	${APP_SRC_DIR}/layout.popup.css\

include build/include.mk
