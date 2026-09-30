import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import './build.mjs';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.xml':'application/xml','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif','.mp4':'video/mp4','.webm':'video/webm','.txt':'text/plain'};
const server=http.createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let target=path.resolve(root,'.'+pathname);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}if((await stat(target)).isDirectory())target=path.join(target,'index.html');const body=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'404.html')));}
});
server.listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('Preview: http://localhost:'+(Number(process.env.PORT)||4173)));
