临时讨论组创建流程
=================

Step1: Browser->WebServer HTTP POST webim/join

Request Parameters

csrf_token 
id  d94781a658a1a939
nick    TestRoom
ticket  uid:demo:04355a3a8bc0ca48d9bc

Response:

{"id":"d94781a658a1a939",
 "nick":"TestRoom",
 "temporary":true,
 "avatar":"http:\/\/discuzx3.nextalk.im\/source\/plugin\/nextalk\/static\/images\/chat.png",
 "count":1
}

Step2: Browser->WebServer HTTP POST webim/message

发送invite消息:

Request Parameters:

body    webim-event:invite|,|d94781a658a1a939|,|TestRoom
csrf_token  
from    demo
nick    demo
ticket  uid:demo:04355a3a8bc0ca48d9bc
timestamp   1394540112931
to  admin
to_nick admin
type    chat


Response:

Step3: Browser->WebServer HTTP POST webim/setting

csrf_token  
data  {"play_sound":true,"buddy_sticky":true,"minimize_layout":false,"msg_auto_pop":true,"temporary_rooms":[{"id":"4e4ab3aaa69398ca","nick":"demo2"},{"id":"604cabbfc4bba8da","nick":"Demou7ec4"},{"id":"6f47bb8fb1a3a818","nick":"IST"},{"id":"d94781a658a1a939","nick":"TestRoom"}],"blocked_rooms":[]}


Step4: Browser->WebServer HTTP GET webim/history

Request:

_   1394540113156
csrf_token  
id  d94781a658a1a939
type    grpchat
webim_action    history

Step5: Browser->WebServer HTTP GET Members

Request:

_   1394540113691
csrf_token  
id  d94781a658a1a939
ticket  uid:demo:04355a3a8bc0ca48d9bc
webim_action    members

Response:

[{"id":"demo","nick":"demo", "presence": "online"},
 {"id":"admin","nick":"admin", "presence": "offline"}]

