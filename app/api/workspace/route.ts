import {database} from '@/lib/database';
import {seed,type Scene} from '@/lib/model';
function scene(r:Request):Scene{const x=new URL(r.url).searchParams.get('scene');return x==='transfer'||x==='lifecycle'?x:'research';}
function cookieName(r:Request){return 'medflow_v2_'+scene(r);}
import {transition} from '@/lib/engine';
const headers={'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8'};
function respond(data:unknown,status=200,extra:Record<string,string>={}){return new Response(JSON.stringify(data),{status,headers:{...headers,...extra}});}
function session(r:Request){const id=r.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName(r)+'='))?.split('=')[1];return id&&/^[a-f0-9-]{36}$/.test(id)?id:null;}
export async function GET(request:Request){try{
 const db=database(),id=session(request)??crypto.randomUUID();
 await db.prepare('INSERT OR IGNORE INTO demo_workspaces (id,payload,revision,updated_at) VALUES (?,?,1,?)').bind(id,JSON.stringify(seed(scene(request))),new Date().toISOString()).run();
 const row=await db.prepare('SELECT payload,revision FROM demo_workspaces WHERE id=?').bind(id).first<{payload:string;revision:number}>();
 if(!row)throw new Error('空间初始化失败');
 return respond({state:JSON.parse(row.payload),revision:row.revision},200,{'Set-Cookie':`${cookieName(request)}=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${new URL(request.url).protocol==='https:'?'; Secure':''}`});
 }catch{return respond({error:'工作空间暂时无法连接，请稍后重试。'},503);}}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return respond({error:'请求来源无效'},403);
 const id=session(request);if(!id)return respond({error:'会话已过期，请刷新页面'},401);
 try{const body=await request.text();if(body.length>16000)return respond({error:'提交内容过长'},413);const {action,revision}=JSON.parse(body);
 const db=database(),row=await db.prepare('SELECT payload,revision FROM demo_workspaces WHERE id=?').bind(id).first<{payload:string;revision:number}>();
 if(!row)return respond({error:'会话不存在，请刷新页面'},401);
 if(revision!==row.revision)return respond({error:'数据已更新，已为你重新同步，请再次提交。'},409);
 const state=transition(JSON.parse(row.payload),action);
 const result=await db.prepare('UPDATE demo_workspaces SET payload=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(JSON.stringify(state),new Date().toISOString(),id,revision).run();
 if(!result.meta.changes)return respond({error:'其他操作已更新数据，请刷新后重试。'},409);
 return respond({state,revision:revision+1});
 }catch(e){return respond({error:e instanceof Error?e.message:'操作未完成'},400);}
}
