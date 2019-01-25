const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');
const sha1 = crypto.createHash('sha1');

// console.log(md5.update('str').digest('hex'));

const staticUrl = './'
const appid = 'wx6af904b675635363';
const secret = 'a211b1202dfa539d0c16b71b278c3195';
let wxData = {
    access_token: undefined,
    ticket: undefined
};

const server = http.createServer((req, res) => {
    let url = req.url;
    let file = staticUrl + url;
    let type = path.extname(url);  // path.extname 返回路径中文件的扩展名
    type = type ? type.split('.')[1] : 'unknown';
    if(/^\/api.*$/.test(url)){
        if(/^\/api\/wx_sine\?.*$/.test(url)){
            let urlObj = url2Object(url);

            res.writeHeader(200, {
                'content-type': 'application/json;charset="utf-8"'
            });

            if(urlObj.url){
                getToken().then(r => {
                    wxData.access_token = r.access_token;
                    getTicket().then(tr => {
                        wxData.ticket = tr.ticket;
                        let timestamp = +new Date();
                        timestamp = parseInt(timestamp / 1000);
                        let noncestr = Math.random().toString(16).substr(2);
                        let objStr = object2Url({
                            jsapi_ticket: wxData.ticket,
                            noncestr: noncestr,
                            timestamp: timestamp,
                            url: urlObj.url
                        });
                        console.log(objStr);
                        res.write(JSON.stringify({
                            success: true,
                            access_token: wxData.access_token,
                            ticket: wxData.ticket,
                            timestamp: timestamp,
                            noncestr: noncestr,
                            appId: appid,
                            signature: sha1.update(objStr).digest('hex')
                        }));
                        res.end();
                    });
                });
            }else {
                res.write(JSON.stringify({
                    success: false,
                    msg: '参数不正确'
                }));
                res.end();
            }

            // response.writeHead(200,{
            //     'Content-Type': 'text/plain',
            //     'charset': 'utf-8',
            //     'Access-Control-Allow-Origin': '*',
            //     'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS'
            // });  //可以解决跨域的请求
            // response.writeHead(200,{
            //     'Content-Type': 'application/json',
            //     'Access-Control-Allow-Origin': '*',
            //     'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS'
            // });
        }
        // res.end();
    }else {
        fs.readFile(file , (err, data) => {
            if(err){
                console.log('访问' + staticUrl + req.url + '出错');
                res.writeHeader(404, {
                    'content-type': 'text/html;charset="utf-8"'
                });
                res.write('<h1>404错误</h1><p>你要找的页面不存在</p>');
            }else{
                res.writeHeader(200, {
                    'content-type': 'text/html;charset="utf-8"'
                });
                res.write(data);  // 将index.html显示在浏览器（客服端）
            }
            res.end();
        });
    }
});

server.listen(7800);

console.log('success');

function getToken(){
    let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
    return getAPI(url);
}

function getTicket(){
    let url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${wxData.access_token}&type=jsapi`;
    return getAPI(url);
}
function getAPI(url){
    return new Promise((resolve, reject) => {
        https.get(url , res => {
            res.setEncoding('utf8');
            res.on('data', (data) => {
                data = JSON.parse(data);
                if(data.errcode === 0 || data.access_token){
                    resolve(data);
                    console.log(`SUCCESS:: ${url}`);
                }else {
                    reject(data);
                    console.log(`ERROR:: ${url}`);
                }
                console.log(data);
            });
            res.on('end', () => {});
        }).on('error', (e) => {
            console.error(`ERROR:: ${e.message}`);
            reject(e);
        });
    });
}

function url2Object(url){
    var searchs;
    var retObj = {};
    if(url === undefined || typeof url !== 'string'){
        url = location.href;
    }
    searchs = url.split('?');
    searchs = searchs[1] ? searchs[1].split('&') : [];
    searchs.forEach(function(item){
        var search = item.split('=');
        retObj[search[0]] = search[1];
    });
    return retObj;
}
function object2Url(obj){
    var tempArr = [];
    if(typeof obj === 'object'){
        Object.keys(obj).forEach(function(key){
            tempArr.push(key + '=' + (obj[key] ? obj[key] : ''));
        });
    }
    return tempArr.join('&');
}
