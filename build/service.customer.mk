include build/config.mk

PRODUCT_NAME = service

JS_APP_FILES = ${JS_SRC_DIR}/ui.buddy.js\
	${APP_SRC_DIR}/ui.layout.customer.js\

CSS_APP_FILES = ${CSS_SRC_DIR}/buddy.css\
	${CSS_SRC_DIR}/user.css\
	${APP_SRC_DIR}/service.css\
	${APP_SRC_DIR}/layout.customer.css\

include build/include.mk
