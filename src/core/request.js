// 获取种子内的文件存放的服务器列表 4步协议如下

// 1. 发送连接请求
// 2. 获取连接响应并提取连接 ID
// 3. 使用连接 id 发送通知请求 - 这是我们告诉跟踪器我们感兴趣的文件的地方
// 4. 获取announce 响应并提取peers 列表
const dgram = require('dgram');
const  {respType,parseConnResp,parseAnnounceResp} =require("./response") 
const {buildConnReq,buildAnnounceReq} =require("./util")

module.exports.getPeers = function (torrent, callback) {

    //创建udp4套接字
    const socket = dgram.createSocket('udp4');
    //如果解析出的种子不是announce这种格式的return false
    console.log("torrent is")
    if (!torrent.announce) {
        console.log("torrent format not support~")
        return false
    }
    if(torrent['announce-list']&&Array.isArray(torrent['announce-list'])){
        torrent['announce-list'].forEach(announce=>{
            const urlList = announce.toString('utf8');
            urlList.split(",").forEach(url=>{
                console.log("url is",url)
                execRequest(socket,url)
            })
            
        })
    }
    else{
        const url = torrent.announce.toString('utf8');
        execRequest(socket,url)
    }
 
}
function execRequest(socket,url){
    // 1. 发送连接请求
    udpSend(socket, buildConnReq(), url);
    //响应
    socket.on('message', response => {
        console.log("receive message????")
        if (respType(response) === 'connect') {
            // 2. 获取连接响应并提取连接 ID
            const connResp = parseConnResp(response);
            // 3. 使用连接 id 发送通知请求 - 这是我们告诉跟踪器我们感兴趣的文件的地方
            const announceReq = buildAnnounceReq(connResp.connectionId,torrent);
            udpSend(socket, announceReq, url);
        } else if (respType(response) === 'announce') {
            // 4. 获取announce 响应并提取peers 列表
            const announceResp = parseAnnounceResp(response);
            // 5. pass peers to callback
            callback(announceResp.peers);
        }
    });
}
// 发送连接请求
function udpSend(socket, message, rawUrl, callback = () => { }) {
    const url = new URL(rawUrl);
    socket.send(message, 0, message.length, url.port, url.host, callback);
}