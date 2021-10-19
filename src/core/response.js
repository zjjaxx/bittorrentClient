module.exports = {
    // 通用解析响应
    respType(resp) {
        const action = resp.readUInt32BE(0);
        if (action === 0) return 'connect';
        if (action === 1) return 'announce';
    },
    // 2. 获取连接响应并提取连接 ID
    parseConnResp(resp) {
        return {
            action: resp.readUInt32BE(0),
            transactionId: resp.readUInt32BE(4),
            connectionId: resp.slice(8)
        }
    },
    // 4. 获取announce 响应并提取peers 列表
    // Offset      Size            Name            Value
    // 0           32-bit integer  action          1 // announce
    // 4           32-bit integer  transaction_id
    // 8           32-bit integer  interval
    // 12          32-bit integer  leechers
    // 16          32-bit integer  seeders
    // 20 + 6 * n  32-bit integer  IP address
    // 24 + 6 * n  16-bit integer  TCP port
    // 20 + 6 * N
    parseAnnounceResp(resp) {
        function group(iterable, groupSize) {
            let groups = [];
            for (let i = 0; i < iterable.length; i += groupSize) {
                groups.push(iterable.slice(i, i + groupSize));
            }
            return groups;
        }

        return {
            action: resp.readUInt32BE(0),
            transactionId: resp.readUInt32BE(4),
            leechers: resp.readUInt32BE(8),
            seeders: resp.readUInt32BE(12),
            peers: group(resp.slice(20), 6).map(address => {
                return {
                    ip: address.slice(0, 4).join('.'),
                    port: address.readUInt16BE(4)
                }
            })
        }
    },
}