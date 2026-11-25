import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const port = Number(process.env.PORT || 4173);
http.createServer(async(req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if (!target.startsWith(root)) {res.writeHead(403);res.end();return;}
    const data = await readFile(target);
    const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
  } catch {res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page not found. Return to /index.html.');}
}).listen(port,'127.0.0.1',()=>console.log(`Study notebook: http://localhost:${port}`));
