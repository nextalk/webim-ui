UI库使用文档
==========================

webim UI是根据webim js库建立的前端基础界面，实现完整的聊天界面。其中实现主题分离，语言国际化，模版自定义，插件式管理。


主题自定义
-------------------------

主题部分使用jQuery UI主题开发，可使用jQuery UI的[themeroller](http://jqueryui.com/themeroller/)自定义主题，然后安装到themes文件夹，在html中引入或通过配置修改。


语言国际化
-------------------------

参考`js/i18n/webim-zh-CN.js`格式修改语言，然后在html中引入，或者通过配置修改。

例如：

配置语言

	webim.ui.i18n.locale = 'zh-TW';
	webim.ui.i18n.store('zh-TW',{
	    "close":"關閉"
	});

获取语言参数

	webim.ui.i18n("close");


插件开发
-------------------------

webim UI界面由底部tab工具条，以及窗口window组成布局layout。其中自建了一个window管理类处理各个窗口之间的关联触发。



###window

窗口管理

####设置选项options

名称			|类型		|描述
------------------------|---------------|------------
template		|		|
isMinimize		|		|
minimizable		|		|
maximizable		|		|
closeable		|		|
sticky			|		|是否固定窗口，固定窗口取消激活不缩小
titleVisibleLength	|		|限制标题最长显示文字数
count			|		|提示数量badge



####事件

名称			|参数		|描述
------------------------|---------------|------------
activate		|		|
deactivate		|		|
displayStateChange	|state		|[restore, normal,maximize,minimize]
close			|		|

####方法

名称			|返回		|描述
------------------------|---------------|------------
html( element )		|void		|
subHeader( element )	|void		|
notifyUser( type, count)|void		|窗口提示badge, type可以是[information, null]
title( title, icon )	|void		|标题，icon为图标名称
active()		|boolean	|返回该窗口是否为当前激活窗口
activate()		|void		|激活当前窗口
deactivate()		|void		|解除激活
maximize()		|void		|最大化
minimize()		|void		|最小化
restore()		|void		|恢复
close()			|void		|关闭并触发关闭事件
height()		|number		|返回内容区高度
isMaximize()		|boolean	|是否最大化了
isMinimize()		|boolean	|是否最小化了


###layout


####设置选项options

名称			|类型		|描述
------------------------|---------------|------------
shortcutLength		|number		|快捷工具栏最多显示数量
chatAutoPop		|boolean	|是否自动打开窗口
template		|		|
tpl\_shortcut		|		|



####方法

名称						|返回		|描述
------------------------------------------------|---------------|------------
widget( name )					|widget		|
addWidget( widget,winOptions,before,container )	|void		|
addChat( widget,winOptions )			|void		|



