all: uchome discuzX discuz service phpbb  phpwind thinksns JishiGou

uchome:
	@@echo "Build webim for uchome"
	@@$(MAKE) -f build/uchome.mk

clean_uchome:
	@@echo "Clean uchome"
	@@$(MAKE) clean -f build/uchome.mk

discuzX:
	@@echo "Build webim for discuzX"
	@@$(MAKE) -f build/discuzX.mk

clean_discuzX:
	@@echo "Clean discuzX"
	@@$(MAKE) clean -f build/discuzX.mk

thinksns:
	@@echo "Build webim for ThinkSNS"
	@@$(MAKE) -f build/thinksns.mk

clean_thinksns:
	@@echo "Clean ThinkSNS"
	@@$(MAKE) clean -f build/thinksns.mk


JishiGou:
	@@echo "Build webim for JishiGou"
	@@$(MAKE) -f build/jishigou.mk

clean_JishiGou:
	@@echo "Clean JishiGou"
	@@$(MAKE) clean -f build/jishigou.mk

discuz:
	@@echo "Build webim for discuz"
	@@$(MAKE) -f build/discuz.mk

clean_discuz:
	@@echo "Clean discuz"
	@@$(MAKE) clean -f build/discuz.mk

service:
	@@echo "Build webim for service"
	@@$(MAKE) -f build/service.mk

clean_service:
	@@echo "Clean service"
	@@$(MAKE) clean -f build/service.mk

phpbb:
	@@echo "Build webim for phpbb"
	@@$(MAKE) -f build/phpbb.mk

clean_phpbb:
	@@echo "Clean phpbb"
	@@$(MAKE) clean -f build/phpbb.mk

phpwind:
	@@echo "Build webim for phpwind"
	@@$(MAKE) -f build/phpwind.mk

clean_phpwind:
	@@echo "Clean phpwind"
	@@$(MAKE) clean -f build/phpwind.mk


clean: clean_uchome clean_discuzX clean_discuz clean_service clean_phpbb clean_phpwind clean_thinksns clean_JishiGou

