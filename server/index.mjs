import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {createReadStream,readFileSync} from 'node:fs';
import {extname,join,normalize,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {demoAssistant,requestLiveAssistant,sanitizeAssistantResponse} from './protocol.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url))),dist=join(root,'dist');
const atlas=JSON.parse(readFileSync(join(root,'public','models','atlas.json'),'utf8'));
const conceptIds=new Set(atlas.concepts.map(c=>c.id)),lessonIds=new Set(['circulation','respiratory','skeletal']);
const port=Number(process.env.PORT||3017),configuredMode=['live','demo','off'].includes(process.env.AI_MODE)?process.env.AI_MODE:(process.env.AI_API_KEY?'live':'demo');
const requests=new Map();
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));};
const readBody=async req=>{let body='';for await(const chunk of req){body+=chunk;if(body.length>16384)throw Object.assign(new Error('请求内容过长。'),{status:413});}return JSON.parse(body||'{}');};
const rateOk=ip=>{const now=Date.now(),entry=requests.get(ip);if(!entry||now-entry.since>60000){requests.set(ip,{since:now,count:1});return true;}entry.count++;return entry.count<=20;};
const liveConcepts=atlas.concepts.filter(c=>['FMA7088','FMA7101','FMA7098','FMA3734','FMA8612','FMA66643','FMA7309','FMA7310','FMA7394','FMA7409','FMA13295','FMA23876','FMA71221','FMA46565','FMA7574','FMA7485','FMA9914','FMA9611','FMA13303','FMA24476','FMA23463','FMA23466','FMA50801'].includes(c.id)).map(c=>({id:c.id,name:c.name}));

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.bin':'application/octet-stream','.gz':'application/gzip','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,mode:configuredMode,liveConfigured:!!(process.env.AI_API_KEY&&process.env.AI_BASE_URL&&process.env.AI_MODEL),service:'zhiti-atlas-ai'});
  if(req.method==='POST'&&url.pathname==='/api/assistant'){
   const ip=req.socket.remoteAddress||'local';if(!rateOk(ip))return json(res,429,{error:'请求过于频繁，请稍后再试。'});
   const body=await readBody(req),message=typeof body.message==='string'?body.message.trim():'';if(!message||message.length>400)return json(res,400,{error:'请输入 1–400 个字符的学习问题。'});
   if(configuredMode==='off')return json(res,503,{error:'AI 助手当前已关闭。',mode:'off'});
   if(configuredMode==='live'){
    try{return json(res,200,await requestLiveAssistant(message,{env:process.env,validConceptIds:conceptIds,validLessonIds:lessonIds,concepts:liveConcepts}));}catch(error){return json(res,error?.status||502,{error:error?.name==='AbortError'?'实时 AI 请求超时。':'实时 AI 暂不可用，请切换演示模式。',mode:'live'});}
   }
   return json(res,200,sanitizeAssistantResponse(demoAssistant(message),conceptIds,lessonIds));
  }
  if(!['GET','HEAD'].includes(req.method||''))return json(res,405,{error:'Method not allowed'});
  let relative=decodeURIComponent(url.pathname).replace(/^\/+/,''),file=join(dist,relative||'index.html');
  if(!normalize(file).startsWith(normalize(dist)))return json(res,403,{error:'Forbidden'});
  try{if((await stat(file)).isDirectory())file=join(file,'index.html');}catch{file=join(dist,'index.html');}
  const info=await stat(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','content-length':info.size,'cache-control':extname(file)==='.html'?'no-cache':'public, max-age=31536000, immutable'});if(req.method==='HEAD')return res.end();createReadStream(file).pipe(res);
 }catch(error){json(res,error?.status||500,{error:error instanceof SyntaxError?'请求 JSON 无效。':(error?.message||'服务器错误。')});}
});
server.listen(port,'0.0.0.0',()=>console.log(`[zhiti] http://localhost:${port} · AI_MODE=${configuredMode}`));
