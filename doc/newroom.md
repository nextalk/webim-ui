临时讨论组新创建流程
===================

Step1: Browser->WebServer HTTP POST webim/invite

Request Parameters

csrf_token 
id  d94781a658a1a939
nick    TestRoom
ticket  uid:demo:04355a3a8bc0ca48d9bc
members: 1,2,3,4


Step2: WebServer->IMServer HTTP POST /messages

Loop send:

body    webim-event:invite|,|d94781a658a1a939|,|TestRoom
from    demo
nick    demo
ticket  uid:demo:04355a3a8bc0ca48d9bc
timestamp   1394540112931
to  admin
to_nick admin
type    chat


Step3: Browser->WebServer

Request:

_   1394540113156
csrf_token  
id  d94781a658a1a939
type    grpchat
webim_action    history

Response:

Step5: Browser->WebServer HTTP GET Members

Request:

_   1394540113691
csrf_token  
id  d94781a658a1a939
ticket  uid:demo:04355a3a8bc0ca48d9bc
webim_action    members

Response:

[{"id":"demo","nick":"demo"},
 {"id":"admin","nick":"admin"}]





