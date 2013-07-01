PREFIX := .

IM = ${PREFIX}/webim.js
BUILD_DIR = ${PREFIX}/../js/build
DOCS_DIR = ${PREFIX}/docs

SRC_DIR = ${PREFIX}
CSS_SRC_DIR = ${SRC_DIR}/css
JS_SRC_DIR = ${SRC_DIR}/js
APP_SRC_DIR = ${SRC_DIR}/apps
I18N_SRC_DIR = ${SRC_DIR}/js/i18n

IMAGE_SRC_DIR = ${SRC_DIR}/images
THEME_SRC_DIR = ${SRC_DIR}/themes
ASSET_SRC_DIR = ${SRC_DIR}/assets

CSS_BASE_FILES = ${CSS_SRC_DIR}/core.css\
	${CSS_SRC_DIR}/ui.core.css\
	${CSS_SRC_DIR}/icons.css\
	${CSS_SRC_DIR}/emot.css\
	${CSS_SRC_DIR}/history.css\
	${CSS_SRC_DIR}/layout.css\
	${CSS_SRC_DIR}/chat.css\


JS_BASE_FILES = ${JS_SRC_DIR}/core.js\
	${JS_SRC_DIR}/date.js\
	${JS_SRC_DIR}/notice.js\
	${JS_SRC_DIR}/i18n.js\
	${JS_SRC_DIR}/ui.js\
	${JS_SRC_DIR}/ui.window.js\
	${JS_SRC_DIR}/ui.layout.js\
	${JS_SRC_DIR}/ui.history.js\
	${JS_SRC_DIR}/ui.emot.js\
	${JS_SRC_DIR}/ui.chat.js\

