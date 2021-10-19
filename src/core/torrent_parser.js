// 解析种子
const fs = require('fs');
const bencode = require('bencode');
const crypto = require("crypto")
// 它可能大于 32 位整数。
const bignum=require("bignum")
module.exports = {
    open(filepath) {
        return bencode.decode(fs.readFileSync(filepath));
    },
    size(torrent) {
        const size = torrent.info.files ?
    torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
    torrent.info.length;
    // 将数字写入缓冲区。该选项{size: 8}告诉函数您要将数字写入大小为 8 字节的缓冲区
    return bignum.toBuffer(size, {size: 8});
    },
    // 获取 info 属性并通过 SHA1 散列函数传递它
    infoHash(torrent) {
        console.log("torrent is", torrent)
        const info = bencode.encode(torrent.info);
        return crypto.createHash('sha1').update(info).digest();
    }
}