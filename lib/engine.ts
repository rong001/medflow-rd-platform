import {seed,readiness,type State} from './model.ts';
export type Action = {type:string;id?:string;project?:string;values?:Record<string,unknown>};
function text(v:unknown,min=1,max=2000){if(typeof v!=='string'||v.trim().length<min||v.length>max)throw new Error(`请填写完整内容（${min}–${max} 字）。`);return v.trim();}
function number(v:unknown,min:number,max:number){const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw new Error(`数值须介于 ${min} 与 ${max} 之间。`);return n;}
function find<T extends {id:string}>(a:T[],id?:string){const r=a.find(x=>x.id===id);if(!r)throw new Error('记录不存在，请刷新后重试。');return r;}
export function gateBlockers(s:State,id:string,includeReviews=true){const p=find(s.projects,id),r=readiness(s,id);const out:string[]=[];
 if(p.stage>=4)return ['项目已完成转产放行'];
 if(!s.requirements.some(x=>x.project===id))out.push('尚未建立设计输入');
 if(p.stage>=1&&r.coverage<100)out.push('需求尚未完整关联验证');
 if(p.stage>=1){const missing=s.requirements.filter(q=>q.project===id&&!s.records.some(x=>x.project===id&&x.kind==='design'&&x.link===q.id&&x.status==='已完成')).length;if(missing)out.push(`${missing} 条需求的设计输出尚未完成`);}
 if(p.stage>=2){if(!r.total||r.passed<r.total)out.push(`${r.total-r.passed} 项验证 / 确认尚未通过`);if(r.risks)out.push(`${r.risks} 项残余风险尚未评审接受`);}
 if(p.stage>=3){if(!r.docTotal||r.docs<r.docTotal)out.push(`${r.docTotal-r.docs} 份转产文件未批准`);if(r.changes)out.push(`${r.changes} 项变更未关闭`);}
 if(p.stage>=3){
  const pending=s.records?.filter(x=>x.project===id&&(['transfer','design'].includes(x.kind)?x.status!=='已完成':x.kind==='materials'?x.status!=='已确认':x.kind==='issues'?x.status!=='已关闭':false))??[];
  if(!s.records.some(x=>x.project===id&&x.kind==='transfer'))out.push('尚未建立制造交接计划');
  if(!s.records.some(x=>x.project===id&&x.kind==='materials'))out.push('尚未建立关键物料基线');
  if(pending.length)out.push(`${pending.length} 项设计、制造或质量事项未闭环`);
 }
 if(includeReviews){const reviews=s.records.filter(x=>x.project===id&&x.kind==='reviews');if(!reviews.length)out.push('尚未建立设计评审记录');else if((p.stage>=2?reviews:reviews.slice(0,1)).some(x=>x.status!=='已完成'))out.push('设计评审记录尚未完成');}
 return out;
}
export function transition(before:State,a:Action):State{
 if(!a||typeof a.type!=='string')throw new Error('操作格式不正确');
 const s:State=structuredClone(before),v=a.values??{};let target=a.id??a.project??'研发中心',detail='',label='';
 if(a.type==='reset'){const n=seed(before.scene);n.logs.unshift({id:crypto.randomUUID(),time:new Date().toISOString(),action:'恢复初始基线',target:'当前工作空间',detail:'恢复当前业务空间的初始基线。'});return n;}
 if(a.type==='project.create'){
  if(s.projects.length>=20)throw new Error('工作空间最多支持 20 个项目');
  const id=text(v.code,2,20);if(!/^[A-Z0-9-]+$/.test(id)||s.projects.some(p=>p.id===id))throw new Error('项目编号须唯一，并仅含大写字母、数字和短横线');
  const due=text(v.due,10,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(due)||Number.isNaN(Date.parse(due))||new Date(due).toISOString().slice(0,10)!==due)throw new Error('请选择有效日期');
  s.projects.push({id,name:text(v.name,2,60),family:text(v.family,2,30),lead:text(v.lead,1,20),stage:0,budget:number(v.budget,1,100000),spent:0,due,market:text(v.market,1,60),color:'#648baf',brief:text(v.brief,5,500)});target=id;label='新建产品项目';detail='完成项目定义，进入立项阶段。';
  seed().docs.filter(d=>d.project==='BG-P2').forEach((d,i)=>s.docs.push({...d,id:`DOC-${id}-${i+1}`,project:id,status:'草稿',version:'A.0',content:`${id} ${d.title}：待完成设计输入、输出及评审。待完成审批后纳入受控基线。`}));
  const projectDocs=s.docs.filter(d=>d.project===id),lead=String(v.lead);
  for(const [i,title] of ['工装与校准能力确认','装配作业与人员培训','试产总结与交接验收'].entries())s.records.push({id:`TRF-${id}-${i+1}`,project:id,kind:'transfer',title,status:'待完成',owner:lead,due,version:'A.0',link:projectDocs[i+1].id,description:'确认受控文件、工艺参数、人员培训及交接验收依据。',priority:'关键'});
  s.records.push({id:`MAT-${id}-1`,project:id,kind:'materials',title:'关键物料规格与供应来源确认',status:'待评审',owner:lead,due,version:'A.0',link:projectDocs[1].id,description:'依据受控 BOM 完成关键器件、供应来源、规格版本及来料验收条件确认。',priority:'关键'});
  for(const [i,title] of ['设计输入与技术方案评审','验证证据与交付评审'].entries())s.records.push({id:`REV-${id}-${i+1}`,project:id,kind:'reviews',title,status:'待评审',owner:lead,due,version:'A.0',link:projectDocs[0].id,description:'复核产品设计基线、当前阶段交付物和未关闭事项，记录评审结论。',priority:'关键'});
 }else if(a.type==='requirement.create'){
  const p=find(s.projects,a.project);if(s.requirements.length>=100)throw new Error('设计需求数量达到上限');
  const id='REQ-'+String(s.requirements.length+1).padStart(3,'0');
  s.requirements.push({id,project:p.id,title:text(v.title,2,100),source:text(v.source,2,100),output:text(v.output,2,100),priority:v.priority==='一般'?'一般':'关键',owner:text(v.owner,1,20)});
  s.tests.push({id:'VVT-'+String(s.tests.length+1).padStart(3,'0'),project:p.id,req:id,title:text(v.test,2,100),status:'待执行',owner:text(v.owner,1,20),method:text(v.method,5,1000),evidence:''});
  s.records.push({id:'DES-'+id,project:p.id,kind:'design',title:String(v.output)+' · '+String(v.title),owner:String(v.owner),status:'待完成',due:p.due,version:'A.0',link:id,description:'依据 '+String(v.source)+' 完成设计输出及评审。验收依据：'+String(v.method),priority:String(v.priority)});
  s.docs.filter(d=>d.project===p.id).forEach(d=>d.status='待评审');s.records.filter(x=>x.project===p.id&&['reviews','transfer'].includes(x.kind)).forEach(x=>x.status='待完成');
  if(p.stage>1)p.stage=1;target=id;label='建立设计需求';detail='同时创建关联验证任务；阶段回到设计开发（如适用）。';
 }else if(a.type==='risk.create'){
  const p=find(s.projects,a.project);const test=find(s.tests,String(v.test));if(test.project!==p.id)throw new Error('请选择本项目的验证任务');
  if(s.risks.length>=100)throw new Error('风险数量达到上限');
  const id='RSK-'+String(s.risks.length+1).padStart(3,'0');s.risks.push({id,project:p.id,title:text(v.title,3,150),severity:number(v.severity,1,5),probability:number(v.probability,1,5),control:text(v.control,8,1500),test:test.id,status:'待控制验证',owner:text(v.owner,1,20)});p.stage=Math.min(p.stage,2);target=id;label='登记风险与控制措施';detail='关联验证 '+test.id+'；等待控制验证及残余风险评审。';
 }else if(a.type==='test.record'){
  const t=find(s.tests,a.id);if(!['通过','失败'].includes(String(v.status)))throw new Error('请选择通过或失败');
  t.status=String(v.status);t.evidence=text(v.evidence,5,1500);label='记录验证结果';detail=`${t.status}；${t.evidence}`;
  if(t.status==='失败'){s.risks.filter(r=>r.test===t.id).forEach(r=>r.status='待控制验证');const p=find(s.projects,t.project);p.stage=Math.min(p.stage,2);s.records.filter(r=>r.project===p.id&&['reviews','transfer'].includes(r.kind)).forEach(r=>r.status='待完成');}
 }else if(a.type==='risk.accept'){
  const r=find(s.risks,a.id);if(find(s.tests,r.test).status!=='通过')throw new Error('关联验证尚未通过，不能接受残余风险');
  if(r.status==='已接受')throw new Error('该风险已经评审接受');
  detail=text(v.note,8,1500);r.status='已接受';label='接受残余风险';
 }else if(a.type==='doc.approve'){
  const d=find(s.docs,a.id);if(d.status==='已批准')throw new Error('文件已批准');
  if(d.content.includes('待完成设计输入、输出及评审'))throw new Error('文件内容尚未建立，请先修订并补全受控文件内容');
  detail=text(v.note,8,1500);d.status='已批准';label='批准转产文件';
 }else if(a.type==='change.create'){
  const p=find(s.projects,a.project);if(s.changes.length>=80)throw new Error('变更数量达到上限');
  const id='ECO-'+String(s.changes.length+1).padStart(3,'0');s.changes.push({id,project:p.id,title:text(v.title,2,100),reason:text(v.reason,5,1000),impact:text(v.impact,8,1500),status:'待评审',owner:text(v.owner,1,20)});p.stage=Math.min(p.stage,2);target=id;label='发起工程变更';detail='已登记原因、影响分析和责任人。';
  s.tests.filter(t=>t.project===p.id).forEach(t=>{t.status='待执行';t.evidence='变更 '+id+' 发起，原证据需重新评估与验证。'});
  s.risks.filter(r=>r.project===p.id).forEach(r=>r.status='待控制验证');
  s.docs.filter(d=>d.project===p.id).forEach(d=>d.status='待评审');
  s.records.filter(r=>r.project===p.id&&r.kind==='transfer').forEach(r=>r.status='待完成');
  s.records.filter(r=>r.project===p.id&&r.kind==='reviews').forEach(r=>r.status='待评审');
  detail+=' 项目验证、风险和文件已重新开启评审。';
 }else if(a.type==='change.advance'){
  const c=find(s.changes,a.id),steps=['待评审','实施中','待验证','已关闭'],i=steps.indexOf(c.status);if(i===3)throw new Error('变更已关闭');
  if(i===2){const r=readiness(s,c.project);if(!r.total||r.passed!==r.total||r.risks)throw new Error('关闭前须完成项目全部验证和残余风险评审');}
  c.status=steps[i+1];detail=text(v.note,8,1500);label=`变更转为${c.status}`;
 }else if(a.type==='gate.approve'){
  const p=find(s.projects,a.id),blocks=gateBlockers(s,p.id);if(blocks.length)throw new Error(blocks.join('；'));
  detail=text(v.note,8,1500);p.stage++;label=p.stage===4?'通过转产放行':'通过阶段评审';
  }else if(a.type==='record.create'){
  const p=find(s.projects,a.project),kind=text(v.kind);
  if(!['design','reviews','issues','materials','transfer','strategy'].includes(kind))throw new Error('业务类型无效');
  if(s.records.length>=400)throw new Error('业务事项数量已达上限');
  const id=kind.toUpperCase()+'-'+crypto.randomUUID().slice(0,8);
  const recordLink=[...s.requirements,...s.tests,...s.docs].find(x=>x.id===v.link&&x.project===p.id);if(!recordLink)throw new Error('请选择本项目的关联业务记录');
  const due=text(v.due,10,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(due)||Number.isNaN(Date.parse(due))||new Date(due).toISOString().slice(0,10)!==due)throw new Error('请选择有效的完成日期');
  s.records.push({id,project:p.id,kind:kind as State['records'][number]['kind'],title:text(v.title,3,120),owner:text(v.owner,1,20),status:kind==='issues'?'待处理':kind==='materials'?'待评审':'待完成',due:text(v.due,10,10),version:'A.0',link:text(v.link,1,80),description:text(v.description,8,1500),priority:v.priority==='关键'?'关键':'一般'});
  if(['design','issues','materials','transfer'].includes(kind))p.stage=Math.min(p.stage,3);
  target=id;label='新建业务事项';detail=kind+' / '+String(v.title);
 }else if(a.type==='record.complete'){
  const r=find(s.records,a.id);detail=text(v.note,8,1500);
  if(['已完成','已关闭','已确认'].includes(r.status))throw new Error('事项已经完成');
  if(r.kind==='issues'&&r.link.startsWith('ECO-')&&find(s.changes,r.link).status!=='已关闭')throw new Error('关联工程变更尚未关闭，不能完成效果确认');
  if(r.kind==='issues'){const tests=s.tests.filter(t=>t.id===r.link||t.req===r.link);if(tests.some(t=>t.status!=='通过'))throw new Error('关联验证尚未通过，不能完成效果确认');}
  if(r.kind==='materials'&&s.docs.some(d=>d.id===r.link&&d.status!=='已批准'))throw new Error('关联物料文件尚未批准，请先完成文档评审');
  if(r.kind==='transfer'&&s.docs.some(d=>d.project===r.project&&d.status!=='已批准'))throw new Error('转产文件尚未全部批准，不能完成交接确认');
  if(r.kind==='reviews'&&gateBlockers(s,r.project,false).length&&find(s.projects,r.project).stage<4)throw new Error('阶段证据未就绪，请先处理阶段门阻塞项');
  r.status=r.kind==='issues'?'已关闭':r.kind==='materials'?'已确认':'已完成';label='完成'+r.title;
 }else if(a.type==='issue.change'){
  const r=find(s.records,a.id);if(r.kind!=='issues')throw new Error('请选择质量问题');
  if(r.link.startsWith('ECO-'))throw new Error('此问题已经关联工程变更');
  const next=transition(s,{type:'change.create',project:r.project,values:{title:r.title,owner:r.owner,reason:r.id+' / '+r.description,impact:text(v.note,8,1500)}});
  const issue=find(next.records,r.id);issue.link=next.changes.at(-1)!.id;issue.status='处理中';return next;
 }else if(a.type==='doc.revise'){
  const d=find(s.docs,a.id);d.version=text(v.version,1,20);d.content=text(v.content,8,1500);d.status='待评审';
  find(s.projects,d.project).stage=Math.min(find(s.projects,d.project).stage,3);
  s.records.filter(r=>r.project===d.project&&r.kind==='transfer').forEach(r=>r.status='待完成');label='修订受控文件';detail=d.version+' / 关联转产事项已重新开启';
  s.records.filter(r=>r.project===d.project&&r.kind==='reviews').forEach(r=>r.status='待评审');
 }else if(a.type==='member.update'){
  const m=find(s.members,a.id);m.load=number(v.load,0,80);m.project=find(s.projects,String(v.project)).id;label='调整资源分配';detail=`${m.name} → ${m.project}，${m.load} 小时 / 周`;
 }else if(a.type==='budget.update'){
  const p=find(s.projects,a.id);p.budget=number(v.budget,1,100000);p.spent=number(v.spent,0,100000);label='更新项目预算';detail=`预算 ${p.budget} 万元，已投入 ${p.spent} 万元`;
 }else throw new Error('不支持此操作');
 s.logs.unshift({id:crypto.randomUUID(),time:new Date().toISOString(),action:label,target,detail});s.logs=s.logs.slice(0,300);return s;
}
