Invite and Join

UserA->WebServer: POST /webim/room/invite

WebServer->IM Server: POST /messages(webim-event:invite)

WebServer-->UserA: Room Object

IM Server-->UserB: PUSH(webim-event:invite)

UserB->WebServer: POST /webim/room/join

