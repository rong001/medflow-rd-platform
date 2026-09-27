import assert from 'node:assert/strict';
import {seed,readiness} from '../lib/model.ts';
import {transition,gateBlockers} from '../lib/engine.ts';
const note={note:'核对关联记录、验收依据与执行证据，确认交付符合批准的设计基线。'};
let assertions=0;
function check(value,message){assert.ok(value,message);assertions++;}
function blocked(state,action,pattern){const before=JSON.stringify(state);assert.throws(()=>transition(state,action),pattern);assert.equal(JSON.stringify(state),before);assertions+=2;}
function apply(state,type,id,values=note){return transition(state,{type,id,values});}
function finish(state,project){
 let s=state;
 for(const t of s.tests.filter(x=>x.project===project))s=apply(s,'test.record',t.id,{status:'通过',evidence:'VR-FINAL / EVT-03 · 软件 2.5.1，按批准方案完成验证，记录已归档。'});
 for(const r of s.risks.filter(x=>x.project===project&&x.status!=='已接受'))s=apply(s,'risk.accept',r.id);
 for(const c of s.changes.filter(x=>x.project===project))while(s.changes.find(x=>x.id===c.id).status!=='已关闭')s=apply(s,'change.advance',c.id);
 for(const d of s.docs.filter(x=>x.project===project&&x.status!=='已批准')){
  if(d.content.includes('待完成设计输入、输出及评审'))s=apply(s,'doc.revise',d.id,{version:'B.0',content:'已建立产品技术规格、配置标识、工艺参数及检验依据，相关设计输出和执行记录已经归档。'});
  s=apply(s,'doc.approve',d.id);
 }
 for(const kind of ['design','materials','issues','transfer','reviews'])for(const r of s.records.filter(x=>x.project===project&&x.kind===kind&&!['已完成','已确认','已关闭'].includes(x.status)))s=apply(s,'record.complete',r.id);
 while(s.projects.find(x=>x.id===project).stage<4){check(!gateBlockers(s,project).length,'all stage prerequisites satisfied');s=apply(s,'gate.approve',project);}
 return s;
}
for(const scene of ['research','transfer','lifecycle']){
 const s=seed(scene);check(s.scene===scene,'scenario identity');check(s.projects.length===4&&s.requirements.length===16&&s.records.length===64,'complete baseline');
 const all=[...s.requirements,...s.tests,...s.docs,...s.changes,...s.records];
 for(const r of s.records)check(all.some(x=>x.id===r.link&&x.project===r.project),'linked record in same project: '+r.id);
 for(const p of s.projects.filter(x=>x.stage===4))check(s.records.filter(x=>x.project===p.id&&x.kind==='reviews').every(x=>x.status==='已完成'),'released baseline reviews complete');
 const finished=finish(s,'BP-A2');check(finished.projects[0].stage===4,'complete existing product flow');
 const failed=apply(finished,'test.record','VVT-002',{status:'失败',evidence:'回归发现低电量中止时异常记录缺失，详见报告 VR-FAILED。'});
 check(failed.projects[0].stage===2&&failed.risks.find(x=>x.id==='RSK-001').status!=='已接受','failure reopens stage and risk');
 blocked(failed,{type:'risk.accept',id:'RSK-001',values:note},/验证尚未通过/);
 check(transition(finished,{type:'reset'}).scene===scene,'reset preserves scenario');
}
let s=seed('research');
blocked(s,{type:'record.complete',id:'TRF-BP-A2-01',values:note},/文件尚未全部批准/);
blocked(s,{type:'gate.approve',id:'BP-A2',values:note},/尚未|未完成/);
s=transition(s,{type:'record.create',project:'BP-A2',values:{kind:'issues',title:'低电量验证问题待效果确认',owner:'孙洁',due:'2026-10-20',link:'VVT-002',description:'复现异常后需完成原因分析与纠正措施有效性验证。',priority:'关键'}});
blocked(s,{type:'record.complete',id:s.records.at(-1).id,values:note},/验证尚未通过/);
const issueId=s.records.at(-1).id;s=apply(s,'issue.change',issueId,note);check(s.records.find(x=>x.id===issueId).link===s.changes.at(-1).id,'issue inherits new change');check(s.docs.filter(x=>x.project==='BP-A2').every(x=>x.status==='待评审'),'change invalidates documents');
let n=transition(seed(),{type:'project.create',values:{code:'BP-QA',name:'血压监测 Q3',family:'血压监测',lead:'陈明',budget:120,due:'2027-03-31',market:'中国',brief:'完成家用血压监测产品的设计开发与制造交付。'}});
check(n.records.filter(x=>x.project==='BP-QA').length===6,'new project has manufacturing and review records');
blocked(n,{type:'doc.approve',id:'DOC-BP-QA-1',values:note},/文件内容尚未建立/);
n=transition(n,{type:'requirement.create',project:'BP-QA',values:{title:'异常状态安全中止',source:'PRD B.0 §3.1',output:'SW-QA-01',priority:'关键',owner:'刘洋',test:'异常中止确认',method:'按已批准的异常处理验收依据，覆盖低电量与采样中断。'}});
check(n.records.some(x=>x.project==='BP-QA'&&x.kind==='design'),'new requirement creates design output task');
n=finish(n,'BP-QA');check(n.projects.find(x=>x.id==='BP-QA').stage===4,'new product can complete without deadlock');check(readiness(n,'BP-QA').docs===6,'six controlled documents approved');
const revised=apply(n,'doc.revise','DOC-BP-QA-2',{version:'C.0',content:'更新物料版本与第二供应来源，重新核对技术参数及采购验收要求。'});
check(revised.projects.find(x=>x.id==='BP-QA').stage===3,'document revision reopens release');check(revised.records.filter(x=>x.project==='BP-QA'&&x.kind==='transfer').every(x=>x.status==='待完成'),'document revision invalidates transfer');
console.log(`PASS: ${assertions} business assertions across three scenarios, complete existing/new project flows, reopening, blocked approvals and immutable failures.`);
