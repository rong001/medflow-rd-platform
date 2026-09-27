export const stages = ['产品立项', '设计开发', '设计验证', '设计确认', '转产放行'];
export type Project = { id:string; name:string; family:string; lead:string; stage:number; budget:number; spent:number; due:string; market:string; color:string; brief:string };
export type Requirement = { id:string; project:string; title:string; source:string; output:string; priority:string; owner:string };
export type Verification = { id:string; project:string; req:string; title:string; status:string; owner:string; method:string; evidence:string };
export type Risk = { id:string; project:string; title:string; severity:number; probability:number; control:string; test:string; status:string; owner:string };
export type Doc = { id:string; project:string; title:string; type:string; version:string; status:string; owner:string; content:string };
export type Change = { id:string; project:string; title:string; reason:string; impact:string; status:string; owner:string };
export type Member = { id:string; name:string; role:string; team:string; capacity:number; load:number; project:string };
export type Log = { id:string; time:string; action:string; target:string; detail:string };
export type Scene = 'research'|'transfer'|'lifecycle';
export const scenes = [{value:'research',label:'研发攻关',subtitle:'技术验证与设计控制'},{value:'transfer',label:'转产交付',subtitle:'生产准备与交付协同'},{value:'lifecycle',label:'上市改进',subtitle:'现场反馈与版本迭代'}] as const;
export type RecordKind = 'design'|'reviews'|'issues'|'materials'|'transfer'|'strategy';
export type BusinessRecord = {id:string;project:string;kind:RecordKind;title:string;owner:string;status:string;due:string;version:string;link:string;description:string;priority:string};
export type State = { scene:Scene; records:BusinessRecord[]; projects:Project[]; requirements:Requirement[]; tests:Verification[]; risks:Risk[]; docs:Doc[]; changes:Change[]; members:Member[]; logs:Log[] };
function baseSeed():Omit<State,'scene'|'records'> {
 const projects:Project[] = [
 {id:'BP-A2',name:'臂式电子血压计 A2',family:'血压监测',lead:'陈明',stage:2,budget:260,spent:184,due:'2026-11-20',market:'中国 · 欧盟',color:'#139b8d',brief:'面向家庭场景的上臂式血压监测产品，软硬件协同完成算法、测量可靠性与量产导入。'},
 {id:'BG-G1',name:'智能血糖仪 G1',family:'血糖监测',lead:'林悦',stage:1,budget:320,spent:128,due:'2027-02-15',market:'中国',color:'#6479d3',brief:'血糖仪与配套试纸协同开发，重点管理批间一致性、测量性能和使用场景确认。'},
 {id:'BP-W1',name:'腕式血压计 W1',family:'血压监测',lead:'王磊',stage:3,budget:180,spent:146,due:'2026-10-30',market:'中国',color:'#b18c4e',brief:'轻量化腕式产品，关注测量姿态提示、可用性与生产校准工序。'},
 {id:'BG-P2',name:'便携血糖仪 P2',family:'平台预研',lead:'赵宁',stage:0,budget:120,spent:24,due:'2027-05-20',market:'中国 · 美国（评估）',color:'#648baf',brief:'下一代低功耗血糖平台预研；分类、注册路径及检测方案均待立项评估。'}];
 const requirements:Requirement[]=[
 {id:'REQ-001',project:'BP-A2',title:'压力测量准确性',source:'产品需求 PRD §3.1',output:'压力采样设计 DDS-012',priority:'关键',owner:'陈明'},
 {id:'REQ-002',project:'BP-A2',title:'低电量状态安全中止测量',source:'风险分析 RMF §4.2',output:'电源管理固件 SW-028',priority:'关键',owner:'刘洋'},
 {id:'REQ-003',project:'BP-A2',title:'测量记录可追溯与完整性',source:'用户需求 URS §2.3',output:'存储设计 SW-031',priority:'一般',owner:'刘洋'},
 {id:'REQ-004',project:'BP-A2',title:'家庭用户操作提示可理解',source:'使用场景 USE-002',output:'交互规范 UX-008',priority:'关键',owner:'林悦'},
 {id:'REQ-005',project:'BG-G1',title:'试纸批次识别与异常提示',source:'产品需求 PRD §2.2',output:'批次识别设计 HW-014',priority:'关键',owner:'赵宁'},
 {id:'REQ-006',project:'BG-G1',title:'测量结果与设备记录一致',source:'软件需求 SRS §3.4',output:'通信协议 COM-004',priority:'一般',owner:'刘洋'},
 {id:'REQ-007',project:'BP-W1',title:'测量姿态提示与用户确认',source:'使用场景 USE-006',output:'人机交互 UX-011',priority:'关键',owner:'王磊'},
 {id:'REQ-008',project:'BG-P2',title:'目标用户与预期用途界定',source:'市场调研 MR-002',output:'概念方案 CON-002',priority:'关键',owner:'赵宁'}];
 const tests:Verification[]=[
 {id:'VVT-001',project:'BP-A2',req:'REQ-001',title:'压力传感器多点校准验证',status:'通过',owner:'孙洁',method:'按批准方案 VP-001，在多个压力点和环境条件下验证；判定以设计输入为准。',evidence:'VR-001 rev.B / 样机 EVT-02 · 固件 2.4.0'},
 {id:'VVT-002',project:'BP-A2',req:'REQ-002',title:'低电量中止与数据完整性验证',status:'失败',owner:'孙洁',method:'模拟电量跌落，检查中止提示、放气与记录一致性。失败项：中止后日志未完整保存。',evidence:'VR-002 rev.A / 第 7 项失败'},
 {id:'VVT-003',project:'BP-A2',req:'REQ-003',title:'断电恢复记录一致性验证',status:'通过',owner:'孙洁',method:'覆盖写入中断、恢复与重复写入场景。',evidence:'VR-003 rev.A / 样机 EVT-02 · 固件 2.4.0'},
 {id:'VVT-004',project:'BP-A2',req:'REQ-004',title:'家庭用户使用场景确认',status:'待执行',owner:'林悦',method:'组织目标用户完成关键任务，记录误用、理解偏差和改进项。记录关键任务完成情况与使用偏差。',evidence:''},
 {id:'VVT-005',project:'BG-G1',req:'REQ-005',title:'异常试纸识别验证',status:'待执行',owner:'孙洁',method:'覆盖过期、批次不符及受损试纸的识别场景。',evidence:''},
 {id:'VVT-006',project:'BG-G1',req:'REQ-006',title:'通信记录一致性验证',status:'通过',owner:'刘洋',method:'验证设备与应用记录的完整性及重复传输处理。',evidence:'VR-006 rev.A / 样机 EVT-02 · 固件 2.4.0'},
 {id:'VVT-007',project:'BP-W1',req:'REQ-007',title:'姿态提示使用确认',status:'通过',owner:'林悦',method:'目标使用场景下执行关键任务与姿态纠正。',evidence:'VAL-007 rev.B / 样机 EVT-02 · 固件 2.4.0'}];
 const risks:Risk[]=[
 {id:'RSK-001',project:'BP-A2',title:'低电量导致测量中断及误判',severity:4,probability:3,control:'增加低电量中止逻辑、主动放气与异常记录提示；控制后需重新验证并评审残余风险。',test:'VVT-002',status:'待控制验证',owner:'刘洋'},
 {id:'RSK-002',project:'BP-A2',title:'错误使用姿态影响结果理解',severity:3,probability:2,control:'增加图示引导与异常姿态提醒，完成使用场景确认。',test:'VVT-004',status:'待控制验证',owner:'林悦'},
 {id:'RSK-003',project:'BG-G1',title:'异常试纸导致结果偏差',severity:4,probability:3,control:'试纸识别、错误提示和检测中止。',test:'VVT-005',status:'待控制验证',owner:'赵宁'},
 {id:'RSK-004',project:'BP-W1',title:'测量部位偏离正确位置',severity:3,probability:1,control:'姿态提示与用户引导；残余风险经评审接受。',test:'VVT-007',status:'已接受',owner:'王磊'}];
 const templates=[['产品技术规格','设计输出','陈明','预期用途、工作原理、系统组成、性能要求与验收依据。具体指标需由产品设计输入和适用法规标准确定。'],['BOM 与关键物料清单','物料','王磊','主控板 PCBA rev.C；压力传感器 PS-02；泵阀组件 PV-03；显示模组 LCD-02。关键物料替代必须经过变更影响分析和验证。'],['装配与校准作业指导书','工艺','王磊','来料检验 → PCBA 装配 → 气路检漏 → 校准 → 功能检验 → 包装。转产前需确认工装、方法和人员能力。'],['成品检验规范','质量','孙洁','记录设备编号、批次、工装版本和检验结果。隔离不合格品；按批准的规范执行复检与处置。'],['标签与说明书','标识','林悦','型号、预期用途、使用方法、警示及追溯标识。关联已批准的标签版本和追溯标识。'],['软件发布与配置清单','软件','刘洋','固件 2.4.0；构建标识 REL-240；需求基线 SRS rev.C；验证报告集合。受控发布需确认配置完整性。']];
 const docs:Doc[]=projects.flatMap((p,pi)=>templates.map((a,i)=>({id:`DOC-${pi+1}0${i+1}`,project:p.id,title:a[0],type:a[1],owner:a[2],version:i===1?'C.0':'B.0',status:pi===0&&i>3?'待评审':pi===3?'草稿':'已批准',content:(pi===1||pi===3)&&i===1?'血糖测量主板 AFE-02；试纸连接器 CN-04；低功耗主控 MCU-03；显示模组 LCD-02。需评估关键物料替代对测量性能的影响。':(pi===1||pi===3)&&i===2?'来料检验 → PCBA 装配 → 连接器检查 → 电气校准 → 试纸批次识别 → 性能抽检 → 包装。工装、试纸及设备需受控。':a[3]})));
 return {projects,requirements,tests,risks,docs,changes:[{id:'ECO-001',project:'BP-A2',title:'低电量中止逻辑与日志修复',reason:'VVT-002 验证失败，发现中止后日志保存不完整。',impact:'关联 REQ-002、VVT-002、RSK-001 及软件发布清单；关闭前必须完成复测。',status:'实施中',owner:'刘洋'},{id:'ECO-002',project:'BG-G1',title:'试纸连接器替代物料评估',reason:'保障关键部件第二供应来源。',impact:'重新评估接触可靠性、测量性能、采购和工艺文件。',status:'待评审',owner:'赵宁'}],members:[{id:'M1',name:'陈明',role:'系统架构 / 项目负责人',team:'系统工程',capacity:40,load:36,project:'BP-A2'},{id:'M2',name:'刘洋',role:'嵌入式软件工程师',team:'软件研发',capacity:40,load:44,project:'BP-A2'},{id:'M3',name:'王磊',role:'硬件与工艺负责人',team:'硬件研发',capacity:40,load:32,project:'BP-W1'},{id:'M4',name:'林悦',role:'产品与可用性工程师',team:'产品设计',capacity:40,load:30,project:'BG-G1'},{id:'M5',name:'孙洁',role:'验证与质量工程师',team:'质量验证',capacity:40,load:42,project:'BP-A2'},{id:'M6',name:'赵宁',role:'算法与平台预研',team:'技术预研',capacity:40,load:24,project:'BG-P2'}],logs:[{id:'LOG-SEED',time:'2026-09-26T09:00:00+08:00',action:'研发基线建立',target:'研发中心',detail:'四个产品项目纳入研发组合，关联设计输入与交付基线。'}]};
}
export function readiness(s:State,p:string){const t=s.tests.filter(x=>x.project===p);const d=s.docs.filter(x=>x.project===p);const r=s.requirements.filter(x=>x.project===p);const passed=t.filter(x=>x.status==='通过').length;return {passed,total:t.length,coverage:r.length?Math.round(r.filter(q=>t.some(x=>x.req===q.id)).length/r.length*100):0,docs:d.filter(x=>x.status==='已批准').length,docTotal:d.length,risks:s.risks.filter(x=>x.project===p&&x.status!=='已接受').length,changes:s.changes.filter(x=>x.project===p&&x.status!=='已关闭').length};}


export function seed(scene:Scene='research'):State {
 const s:State={...baseSeed(),scene,records:[]};
 const colors=['#6263df','#3697a6','#9a79ce','#6888b6'];
 s.projects.forEach((p,i)=>{p.color=colors[i];});
 // Each workspace has its own complete relational baseline.
 for(const p of s.projects){
  const current=s.requirements.filter(q=>q.project===p.id);
  const subjects=p.family==='血压监测'?['气路泄漏检测','袖带佩戴反馈','测量结果异常提示']:['低采血量识别','试纸批间一致性','异常测量中止'];
  for(let i=current.length;i<4;i++){
   const n=s.requirements.length+1,id='REQ-'+String(n).padStart(3,'0');
   s.requirements.push({id,project:p.id,title:subjects[(i-current.length)%3],source:'PRD rev.C §'+(i+3),output:'DDS-'+p.id+'-'+(i+1),priority:i%2?'一般':'关键',owner:p.lead});
  }
  for(const q of s.requirements.filter(q=>q.project===p.id))if(!s.tests.some(t=>t.req===q.id)){
   const id='VVT-'+String(s.tests.length+1).padStart(3,'0');
   s.tests.push({id,project:p.id,req:q.id,title:q.title+'验证',status:p.stage>=3?'通过':'待执行',owner:'孙洁',method:'依据 '+q.source+' 的已批准验收条件执行，记录样机编号、方法版本、偏差及判定依据。',evidence:p.stage>=3?id+'-R1 / EVT-02 · 验证记录归档':''});
  }
  if(!s.risks.some(r=>r.project===p.id)){
   const test=s.tests.find(t=>t.project===p.id)!;
   s.risks.push({id:'RSK-'+String(s.risks.length+1).padStart(3,'0'),project:p.id,title:'目标使用场景与提示理解偏差',severity:3,probability:2,control:'明确目标使用者与预期用途；验证提示可理解性与异常处理。',test:test.id,status:'待控制验证',owner:p.lead});
  }
 }
 if(scene==='transfer'){
  s.projects.forEach((p,i)=>{p.stage=i===3?1:3;p.spent=Math.round(p.budget*(i===3?.38:.81));p.due=['2026-10-18','2026-11-05','2026-10-12','2027-01-30'][i];});
  s.tests.forEach(t=>{t.status='通过';t.evidence=t.id+'-R2 / DVT-03 · 批次 2609 · 记录已归档';});
  s.risks.forEach(r=>r.status='已接受');s.changes.forEach(c=>c.status='已关闭');
  s.docs.forEach(d=>d.status=d.id==='DOC-103'?'待评审':'已批准');
 } else if(scene==='lifecycle'){
  s.projects.forEach((p,i)=>{p.stage=i===0?2:i===3?1:4;p.spent=Math.round(p.budget*.88);});
  s.tests.forEach(t=>{t.status=t.id==='VVT-002'?'失败':'通过';t.evidence=t.status==='失败'?'FR-2609-018 / 现场日志复现中止记录丢失':t.id+'-R3 / 版本 2.5.0 回归记录';});
  s.risks.forEach(r=>r.status=r.id==='RSK-001'?'待控制验证':'已接受');
  s.changes[0].title='现场反馈：低电量异常记录可靠性改进';s.changes[0].reason='现场反馈 FR-2609-018，低电量中止场景下历史记录不完整。';s.changes[1].status='已关闭';
  s.docs.forEach(d=>{d.status=d.project==='BP-A2'&&d.type==='软件'?'待评审':'已批准';d.version='C.1';});
 }
 const add=(p:Project,kind:RecordKind,n:number,title:string,status:string,owner:string,link:string,description:string)=>s.records.push({id:({design:'DES',reviews:'REV',issues:'QIR',materials:'MAT',transfer:'TRF',strategy:'STR'}[kind])+'-'+p.id+'-'+String(n).padStart(2,'0'),project:p.id,kind,title,status,owner,link,description,due:'2026-'+(n%2?'10-12':'10-20'),version:scene==='lifecycle'?'C.1':'B.0',priority:n===1?'关键':'一般'});
 for(const p of s.projects){
  const qs=s.requirements.filter(q=>q.project===p.id),ts=s.tests.filter(t=>t.project===p.id);
  qs.forEach((q,i)=>add(p,'design',i+1,q.output+' · '+q.title,i<2||scene!=='research'?'已完成':'进行中',q.owner,q.id,'设计输入：'+q.title+'。交付软硬件设计说明、接口定义与单元验证记录；评审后纳入受控配置。'));
  add(p,'reviews',1,'设计输入与技术方案评审','已完成',p.lead,qs[0].id,'评审预期用途、技术路线、资源投入与需求可验证性。记录关联基线与遗留事项。');
  add(p,'reviews',2,scene==='transfer'?'转产交接评审':'验证证据与风险评审',p.stage===4?'已完成':'待评审','孙洁',ts[0].id,'复核验证结论、风险控制、文件批准与变更关闭情况；阶段门条件通过后推进项目。');
  add(p,'issues',1,p.id==='BP-A2'?'低电量中止后记录不完整':p.family==='血压监测'?'校准工装定位重复性偏差':'试纸连接器接触稳定性复核',p.id==='BP-A2'&&scene!=='transfer'?'处理中':ts[0].status==='通过'?'已关闭':'待处理','孙洁',p.id==='BP-A2'?'ECO-001':ts[0].id,'问题来源：'+(scene==='lifecycle'?'现场反馈与售后趋势':'研发验证与生产准备')+'。完成根因分析、纠正措施、回归验证及效果确认。');
  add(p,'issues',2,'说明书关键操作图示优化',ts[ts.length-1].status==='通过'?'已关闭':'待处理','林悦',ts[ts.length-1].id,'根据使用任务评估更新图示顺序，依据关联验证完成版本复核与效果确认。');
  const materials=p.family==='血压监测'?['压力传感器 PS-02','泵阀组件 PV-03','主控板 PCBA-C']:['模拟前端 AFE-02','试纸连接器 CN-04','低功耗主控 MCU-03'];
  materials.forEach((name,i)=>add(p,'materials',i+1,name,i===0&&scene==='research'?'待评审':'已确认','王磊',s.docs.find(d=>d.project===p.id&&d.type==='物料')!.id,['瑞衡传感','精工电子','博芯器件'][i]+' / 交期 '+(12+i*4)+' 天 / 安全库存 '+(300+i*100)+' 件。已绑定技术规格、来料检验依据和受控物料版本。'));
  ['工装与校准能力确认','装配作业与人员培训','试产总结与交接验收'].forEach((name,i)=>add(p,'transfer',i+1,name,scene==='lifecycle'&&p.id!=='BP-A2'||scene==='transfer'&&i<2?'已完成':'待完成','王磊',s.docs.find(d=>d.project===p.id&&d.type===(i===0?'质量':i===1?'工艺':'设计输出'))!.id,'核对 '+p.id+' 发布基线、工艺版本、设备编号与人员能力，登记执行证据及交接结论。'));
  add(p,'strategy',1,p.family==='血压监测'?'家庭监测易用性与测量可靠性':'低采血量识别与试纸一致性','进行中',p.lead,qs[0].id,'产品机会：降低操作偏差，提升使用体验。季度目标：完成设计输入基线、技术验证与产品化评估。');
  add(p,'strategy',2,'第二供应来源与成本优化','待评审','王磊',s.docs.find(d=>d.project===p.id&&d.type==='物料')!.id,'建立关键器件替代路线，综合评估可靠性、供货周期与验证成本。年度预算在资源与预算模块统一管理。');
 }
 s.logs=s.records.filter((_,i)=>i%4===0).slice(0,18).map((r,i)=>({id:'LOG-'+scene+'-'+i,time:new Date(Date.UTC(2026,8,27,8-i)).toISOString(),action:r.status==='已完成'?'完成交付记录':'更新'+({design:'设计输出',reviews:'评审计划',issues:'质量问题',materials:'物料基线',transfer:'转产事项',strategy:'技术规划'}[r.kind]),target:r.id,detail:r.title+' · 责任人 '+r.owner+' · '+r.status}));
 return s;
}
