import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const build=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});if(build.status!==0)process.exit(build.status);
const root=path.resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/api/subscribe'){const {default:api}=await import('../api/subscribe.js');return api(req,res);}const requested=decodeURIComponent(u.pathname);let p=path.resolve(root,'.'+requested);if(p!==root&&!p.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}try{if((await stat(p)).isDirectory())p=path.join(p,'index.html');}catch{p=path.join(root,'404.html');res.statusCode=404;}const body=await readFile(p);res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');res.end(body);}catch{res.writeHead(500);res.end('Unable to load page.');}}).listen(Number(process.env.PORT)||4173,'0.0.0.0',()=>console.log('Achievement with AI development server ready. Run npm run build after editing.'));
