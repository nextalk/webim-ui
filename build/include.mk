UI_CSS_FILES = ${CSS_BASE_FILES} \
	       ${CSS_APP_FILES}

UI_JS_FILES = ${IM} \
	${JS_SRC_DIR}/intro.js\
	${JS_BASE_FILES} \
	${JS_APP_FILES} \
	${JS_SRC_DIR}/outro.js

UI_VER = `cat ${SRC_DIR}/version` 
DATE=`git log -n 1  --pretty=format:%ad`
COMMIT=`git log -n 1 --pretty=format:%H`

REPLACE = sed 's/@DATE/'"${DATE}"'/' | \
		sed 's/@COMMIT/'"${COMMIT}"'/' | \
		sed s/@VERSION/${UI_VER}/

MINJAR = java -jar ${BUILD_DIR}/yuicompressor-2.4.2.jar
JSMINJAR = java -jar ${BUILD_DIR}/google-compiler-20100616.jar
UNICODE = native2ascii -encoding utf-8 

DIST_DIR = ${PREFIX}/dist/${PRODUCT_NAME}
UI_CSS = ${DIST_DIR}/webim.${PRODUCT_NAME}.css
UI_JS = ${DIST_DIR}/webim.${PRODUCT_NAME}.js

UI_MIN_CSS = ${DIST_DIR}/webim.${PRODUCT_NAME}.min.css
UI_MIN_JS = ${DIST_DIR}/webim.${PRODUCT_NAME}.min.js

all: min copy i18n
	@@echo "WebIM UI build complete."
${IM_SRC}:
	##@@git submodule update --init im

${IM}: ${IM_SRC}
	@@echo "Build webim..."
	##$(MAKE) webim -C ${PREFIX}/im

ui: ${UI_CSS} ${UI_JS}
min: ${UI_MIN_CSS} ${UI_MIN_JS}
copy: ${DIST_DIR}/images ${DIST_DIR}/assets ${DIST_DIR}/themes
i18n: ${DIST_DIR}/i18n

${DIST_DIR}:
	@@echo "Create distribution directory"
	@@mkdir -p ${DIST_DIR}
	@@echo "	"${DIST_DIR}

${UI_CSS}: ${DIST_DIR}
	@@echo "Merge css"
	@@cat ${UI_CSS_FILES} | \
		sed 's/\.\.\/images/images/' | \
	       ${REPLACE} > ${UI_CSS};
	@@echo "	"${UI_CSS}

${UI_JS}: ${DIST_DIR} ${IM}
	@@echo "Merge js"
	@@cat ${UI_JS_FILES} | \
	       ${REPLACE} > ${UI_JS};
	@@echo "	"${UI_JS}

${UI_MIN_CSS}: ${IM_SRC} ${UI_CSS}
	@@echo "Compressing css..."
	@@${MINJAR} --type css ${UI_CSS} > ${UI_MIN_CSS}
	@@echo "	"${UI_MIN_CSS}

${UI_MIN_JS}: ${UI_JS}
	@@echo "Compressing js..."
	@@${JSMINJAR} --js ${UI_JS} --warning_level QUIET >> ${UI_MIN_JS}
	@@#${MINJAR} --type js ${UI_JS} > ${UI_MIN_JS}
	@@echo "	"${UI_MIN_JS}

${DIST_DIR}/images: ${DIST_DIR}
	@@echo "Copy images"
	@@cp -r ${IMAGE_SRC_DIR} ${DIST_DIR}

${DIST_DIR}/assets: ${DIST_DIR}
	@@echo "Copy assets"
	@@cp -r ${ASSET_SRC_DIR} ${DIST_DIR}

${DIST_DIR}/themes: ${DIST_DIR}
	@@echo "Copy themes"
	@@cp -r ${THEME_SRC_DIR} ${DIST_DIR}

${DIST_DIR}/i18n: ${DIST_DIR}
	@@echo "Copy and unicode i18n"
	@@mkdir -p ${DIST_DIR}/i18n
	@@${UNICODE} ${I18N_SRC_DIR}/webim-zh-CN.js > ${DIST_DIR}/i18n/webim-zh-CN.js
	@@${UNICODE} ${I18N_SRC_DIR}/webim-zh-TW.js > ${DIST_DIR}/i18n/webim-zh-TW.js
	@@${UNICODE} ${I18N_SRC_DIR}/webim-en.js > ${DIST_DIR}/i18n/webim-en.js

clean:
	##$(MAKE) clean -C ${PREFIX}/im
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

