const path=require("path")
const {open} = require('./core/torrent_parser');
const request = require('./core/request');


const torrent=open(path.resolve(__dirname,"./asset/test.torrent"))


const exec=()=>{
    return new Promise((resolve,reject)=>{
        console.log("开始请求~")
        request.getPeers(torrent, peers => {
            console.log('list of peers: ', peers);
            resolve(peers)
        });
        setTimeout(()=>{
            reject(false)
        },30*1000)
    })
    
}
const start=()=>{
    exec().then(peers=>{
        console.log("success get peers",peers)
    }).catch(timeout=>{
        console.log("timeout!")
        start()
    })
}
start()