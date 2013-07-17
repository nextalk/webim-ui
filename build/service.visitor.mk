include build/config.mk

PRODUCT_NAME = service.visitor

JS_APP_FILES = ${JS_SRC_DIR}/ui.buddy.js\
	${APP_SRC_DIR}/ui.comment.js\
	${APP_SRC_DIR}/ui.layout.visitor.js\

CSS_APP_FILES = ${CSS_SRC_DIR}/buddy.css\
	${CSS_SRC_DIR}/user.css\
	${APP_SRC_DIR}/comment.css\
	${APP_SRC_DIR}/layout.visitor.css\

include build/include.mk
