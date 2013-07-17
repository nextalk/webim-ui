all: uchome discuzX discuz service phpbb phpwind air

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

air:
	@@echo "Build webim for air"
	@@$(MAKE) -f build/air.mk

clean_air:
	@@echo "Clean air"
	@@$(MAKE) clean -f build/air.mk

service_customer:
	@@echo "Build webim for service.customer"
	@@$(MAKE) -f build/service.customer.mk

clean_service_customer:
	@@echo "Clean service.customer"
	@@$(MAKE) clean -f build/service.customer.mk


service_visitor:
	@@echo "Build webim for service.visitor"
	@@$(MAKE) -f build/service.visitor.mk

clean_service_visitor:
	@@echo "Clean service.visitor"
	@@$(MAKE) clean -f build/service.visitor.mk



clean: clean_uchome clean_discuzX clean_discuz clean_service clean_phpbb clean_phpwind clean_air

