const crypto = require("crypto")
const Buffer = require('buffer').Buffer;
let id = null;
const {size,infoHash}=require("./torrent_parser")
module.exports = {
    //1. 构建连接请求参数
    // Offset  Size            Name            Value
    // 0       64-bit integer  connection_id   0x41727101980
    // 8       32-bit integer  action          0 // connect
    // 12      32-bit integer  transaction_id  ? // random
    buildConnReq() {
        const buf = Buffer.alloc(16); // 2
        // connection id
        buf.writeUInt32BE(0x417, 0); // 3
        buf.writeUInt32BE(0x27101980, 4);
        // action
        buf.writeUInt32BE(0, 8); // 4
        // transaction id
        crypto.randomBytes(4).copy(buf, 12); // 5

        return buf;
    },
    // 3. 构建连接 id 发送通知请求参数
    // Offset  Size    Name    Value
    // 0       64-bit integer  connection_id
    // 8       32-bit integer  action          1 // announce
    // 12      32-bit integer  transaction_id
    // 16      20-byte string  info_hash
    // 36      20-byte string  peer_id
    // 56      64-bit integer  downloaded
    // 64      64-bit integer  left
    // 72      64-bit integer  uploaded
    // 80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
    // 84      32-bit integer  IP address      0 // default
    // 88      32-bit integer  key             ? // random
    // 92      32-bit integer  num_want        -1 // default
    // 96      16-bit integer  port            ? // should be betwee
    buildAnnounceReq(connId, torrent, port = 6881) {
        const buf = Buffer.allocUnsafe(98);
        // connection id
        connId.copy(buf, 0);
        // action
        buf.writeUInt32BE(1, 8);
        // transaction id
        crypto.randomBytes(4).copy(buf, 12);
        // info hash
        infoHash(torrent).copy(buf, 16);
        // peerId
        this.genId().copy(buf, 36);
        // downloaded
        Buffer.alloc(8).copy(buf, 56);
        // left
        size(torrent).copy(buf, 64);
        // uploaded
        Buffer.alloc(8).copy(buf, 72);
        // event
        buf.writeUInt32BE(0, 80);
        // ip address
        buf.writeUInt32BE(0, 80);
        // key
        crypto.randomBytes(4).copy(buf, 88);
        // num want
        buf.writeInt32BE(-1, 92);
        // port
        buf.writeUInt16BE(port, 96);

        return buf;
    },
    genId() {
        if (!id) {
            id = crypto.randomBytes(20);
            Buffer.from('-AT0001-').copy(id, 0);
        }
        return id;
    }
}