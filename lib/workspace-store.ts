import {seed,type Scene,type State} from './model';
import {transition,type Action} from './engine';
export type Snapshot={state:State;revision:number};
let connection:Promise<IDBDatabase>|undefined;
function db(){return connection??=new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('medflow-workspaces-v2',1);r.onupgradeneeded=()=>r.result.createObjectStore('spaces');r.onsuccess=()=>resolve(r.result);r.onerror=()=>{connection=undefined;reject(new Error('无法访问浏览器存储，请允许此站点保存数据。'));};});}
async function local(scene:Scene,action?:Action,revision?:number):Promise<Snapshot>{
 const database=await db();
 return new Promise((resolve,reject)=>{
  const tx=database.transaction('spaces','readwrite'),store=tx.objectStore('spaces');let next:Snapshot,error:Error|undefined;
  const read=store.get(scene);
  read.onsuccess=()=>{try{const current:Snapshot=read.result??{state:seed(scene),revision:1};
   if(action&&current.revision!==revision)throw new Error('数据已在另一个窗口更新，请刷新后再提交。');
   next=action?{state:transition(current.state,action),revision:current.revision+1}:current;
   store.put(next,scene);
  }catch(e){error=e instanceof Error?e:new Error('保存失败');tx.abort();}};
  tx.oncomplete=()=>resolve(next);tx.onerror=()=>reject(error??new Error('数据保存失败，请检查浏览器存储空间。'));tx.onabort=()=>reject(error??new Error('保存已取消。'));
 });
}
export async function workspaceStore(mode:'browser'|'cloud',scene:Scene,action?:Action,revision?:number):Promise<Snapshot>{
 if(mode==='browser')return local(scene,action,revision);
 const r=await fetch('/api/workspace?scene='+scene,action?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,revision})}:{cache:'no-store'});
 const body=await r.json() as Snapshot&{error?:string};if(!r.ok)throw new Error(body.error??'工作空间暂时无法连接');return body;
}
