import type {Atlas,SystemId} from './anatomy';
import {SYSTEMS} from './anatomy';
import {LESSONS,type Action,type LessonId} from './content';
export interface AssistantReply {mode:'demo'|'live'|'off';answer:string;actions:Action[];citations:{title:string;url:string}[];limitations:string[];error?:string}
export interface AIConfig {provider:string;apiKey:string;baseUrl:string;model:string}
export const AI_PRESETS=[
 {id:'aliyun',label:'阿里云百炼',baseUrl:'https://dashscope.aliyuncs.com/compatible-mode/v1',model:'qwen-plus'},
 {id:'deepseek',label:'DeepSeek',baseUrl:'https://api.deepseek.com/v1',model:'deepseek-chat'},
 {id:'custom',label:'其他兼容接口',baseUrl:'',model:''},
] as const;
export const AI_SESSION_KEY='zhiti-ai-config-v1';
const SYSTEM_PROMPT=`你是“知体 · ATLAS AI”的中文人体解剖学教学助手。只回答人体结构、器官功能、解剖学知识、当前课程内容与本项目操作。对任何无关话题礼貌拒绝。不得提供疾病诊断、症状判断、治疗方案、处方或个体医疗建议。只能返回严格 JSON：{"mode":"live","answer":"...","actions":[],"citations":[],"limitations":[]}。允许动作仅为 focus、highlight、showInfo、setVisibility、compare、setOpacity、selectSystem、resetView、startLesson；最多5个动作；只能使用所给上下文中的 conceptId、lessonId 和系统名；不得输出代码、HTML、文件操作或其他工具调用。`;
const TOPIC_RE=/解剖|人体|身体|器官|骨|肌|心|肺|脑|肝|肾|胃|肠|血管|动脉|静脉|神经|呼吸|循环|泌尿|生殖|内分泌|淋巴|皮肤|关节|韧带|课程|模型|结构|部位|定位|聚焦|显示|隐藏|透明|旋转|复位|拆解|atlas|anatom|organ|heart|lung|brain|bone|muscle|artery|vein|nerve|kidney|liver/i;
const MEDICAL_ADVICE_RE=/诊断|确诊|处方|治疗|用药|药物|剂量|我是不是得了|症状|疼|痛|疾病|治病|手术建议/;
export function classifyAssistantTopic(message:string){if(MEDICAL_ADVICE_RE.test(message))return'medical' as const;if(!TOPIC_RE.test(message))return'off-topic' as const;return'anatomy' as const;}
export function readSessionAIConfig():AIConfig|null{try{const raw=sessionStorage.getItem(AI_SESSION_KEY);if(!raw)return null;const value=JSON.parse(raw);return value&&typeof value.apiKey==='string'&&typeof value.baseUrl==='string'&&typeof value.model==='string'?value:null;}catch{return null;}}
export function saveSessionAIConfig(config:AIConfig){sessionStorage.setItem(AI_SESSION_KEY,JSON.stringify(config));}
export function clearSessionAIConfig(){sessionStorage.removeItem(AI_SESSION_KEY);}
const endpoint=(baseUrl:string)=>{const base=baseUrl.trim().replace(/\/+$/,'');return /\/chat\/completions$/i.test(base)?base:`${base}/chat/completions`;};
const stripFence=(text:string)=>text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
function sanitizeClientReply(value:unknown,atlas:Atlas):AssistantReply{
 const raw=value&&typeof value==='object'?value as Record<string,unknown>:{};const conceptIds=new Set(atlas.concepts.map(c=>c.id)),lessonIds=new Set(LESSONS.map(l=>l.id)),systems=new Set(SYSTEMS.map(s=>s.id));const actions:Action[]=[];
 for(const item of Array.isArray(raw.actions)?raw.actions.slice(0,5):[]){if(!item||typeof item!=='object')continue;const a=item as Record<string,unknown>,type=a.type;
  if(['focus','highlight','showInfo','setVisibility'].includes(String(type))&&typeof a.conceptId==='string'&&conceptIds.has(a.conceptId)){actions.push({type:type as 'focus',conceptId:a.conceptId,...(type==='setVisibility'?{visible:a.visible===true}:{})} as Action);continue;}
  if(type==='compare'&&Array.isArray(a.conceptIds)&&a.conceptIds.length===2&&a.conceptIds.every(id=>typeof id==='string'&&conceptIds.has(id)))actions.push({type:'compare',conceptIds:a.conceptIds as [string,string]});
  else if(type==='setOpacity'&&typeof a.system==='string'&&systems.has(a.system as SystemId)&&typeof a.opacity==='number'&&a.opacity>=0&&a.opacity<=1)actions.push({type:'setOpacity',system:a.system as SystemId,opacity:a.opacity});
  else if(type==='selectSystem'&&typeof a.system==='string'&&systems.has(a.system as SystemId))actions.push({type:'selectSystem',system:a.system as SystemId});
  else if(type==='startLesson'&&typeof a.lessonId==='string'&&lessonIds.has(a.lessonId as LessonId))actions.push({type:'startLesson',lessonId:a.lessonId as LessonId});
  else if(type==='resetView')actions.push({type:'resetView'});
 }
 const citations=(Array.isArray(raw.citations)?raw.citations:[]).slice(0,4).flatMap(item=>{if(!item||typeof item!=='object')return[];const x=item as Record<string,unknown>;if(typeof x.title!=='string'||typeof x.url!=='string')return[];try{const url=new URL(x.url);return ['http:','https:'].includes(url.protocol)?[{title:x.title.slice(0,120),url:url.toString()}]:[];}catch{return[];}});
 return{mode:'live',answer:typeof raw.answer==='string'?raw.answer.slice(0,1600):'没有可显示的回答。',actions,citations,limitations:(Array.isArray(raw.limitations)?raw.limitations:[]).filter((x):x is string=>typeof x==='string').map(x=>x.slice(0,240)).slice(0,4)};
}
async function callCompatibleAPI(message:string,config:AIConfig,atlas?:Atlas){
 const context=atlas?{lessons:LESSONS.map(l=>l.id),concepts:atlas.concepts.slice(0,180).map(c=>({id:c.id,name:c.name})),systems:SYSTEMS.map(s=>s.id)}:{};const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(endpoint(config.baseUrl),{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${config.apiKey}`},body:JSON.stringify({model:config.model,messages:[{role:'system',content:SYSTEM_PROMPT},{role:'system',content:`可用项目上下文：${JSON.stringify(context)}`},{role:'user',content:message}],temperature:.2,max_tokens:900}),signal:controller.signal});if(!response.ok)throw new Error(response.status===401?'API Key 无效或无权访问该模型。':`接口返回 ${response.status}。`);const payload=await response.json();const text=payload?.choices?.[0]?.message?.content;if(typeof text!=='string')throw new Error('接口返回格式不兼容。');return atlas?sanitizeClientReply(JSON.parse(stripFence(text)),atlas):true;}finally{clearTimeout(timer);}
}
export async function testAIConfig(config:AIConfig){await callCompatibleAPI('请仅返回 JSON：{"mode":"live","answer":"连接成功","actions":[],"citations":[],"limitations":[]}',config);return true;}
const base=(answer:string,actions:Action[]=[],limitations:string[]=[]):AssistantReply=>({mode:'demo',answer,actions,citations:[],limitations});
export function localDemo(message:string):AssistantReply{
 const q=message.trim().toLowerCase();
 if(/诊断|确诊|处方|治疗方案|症状/.test(q))return base('知体只提供解剖学教育信息，不能依据症状作出诊断或治疗建议。若有不适，请咨询具备资质的医疗专业人员。',[],['不提供个体医疗决策。']);
 if(/重置|还原|复位/.test(q))return base('已经还原视图。',[{type:'resetView'}]);
 const course=(id:LessonId,title:string)=>base(`已打开“${title}”课程。`,[{type:'startLesson',lessonId:id}]);
 if(/骨骼.*课程|开始.*骨/.test(q))return course('skeletal','从中轴到四肢的骨架地图');
 if(/呼吸.*课程|开始.*呼吸/.test(q))return course('respiratory','空气从气管到肺');
 if(/循环.*课程|开始.*循环/.test(q))return course('circulation','一滴血的双循环旅程');
 if(/比较.*(左右肺|两肺)|左右肺.*(比较|区别)/.test(q))return base('已把左右肺纳入同一构图。右肺通常三叶；左肺通常两叶，并为心脏留出心切迹。当前模型主要呈现肺内气道与血管分支，肺叶外形覆盖有限。',[{type:'compare',conceptIds:['FMA7309','FMA7310']}],['肺叶差异来自课程知识；当前几何不能完整呈现肺叶表面。']);
 if(/左心室/.test(q))return base('已定位左心室。它把血液泵入主动脉。',[{type:'focus',conceptId:'FMA7101'}]);
 if(/肌肉.*透明|透明.*肌肉/.test(q))return base('已将肌肉系统调为半透明。',[{type:'setOpacity',system:'muscular',opacity:.18}]);
 if(/心脏|找到心/.test(q))return base('已定位心脏。它是肺循环与体循环共同的动力泵。',[{type:'focus',conceptId:'FMA7088'},{type:'showInfo',conceptId:'FMA7088'},...(/透明/.test(q)?[{type:'setOpacity',system:'muscular',opacity:.18} as Action]:[])]);
 if(/主动脉/.test(q))return base('已定位主动脉。',[{type:'focus',conceptId:'FMA3734'}]);
 if(/气管/.test(q))return base('已定位气管。',[{type:'focus',conceptId:'FMA7394'}]);
 if(/支气管/.test(q))return base('已定位支气管。',[{type:'focus',conceptId:'FMA7409'}]);
 if(/肺泡/.test(q))return base('肺泡没有独立网格，已用双肺作为空间参照。',[{type:'focus',conceptId:'FMA7309'},{type:'highlight',conceptId:'FMA7310'}],['肺泡仅作文字教学示意。']);
 if(/肺|呼吸系统/.test(q))return base('已显示呼吸系统并定位双肺。',[{type:'selectSystem',system:'respiratory'},{type:'focus',conceptId:'FMA7309'},{type:'highlight',conceptId:'FMA7310'}]);
 if(/股骨|大腿骨/.test(q))return base('已定位股骨。',[{type:'focus',conceptId:'FMA9611'}]);
 if(/颅骨|头骨/.test(q))return base('已定位颅骨。',[{type:'focus',conceptId:'FMA46565'}]);
 if(/复习.*骨|主要骨骼/.test(q))return base('已打开骨骼学习路径；完成后可直接进入定位练习。',[{type:'startLesson',lessonId:'skeletal'}]);
 if(/骨骼|骨架/.test(q))return base('已切换到骨骼系统。',[{type:'selectSystem',system:'skeletal'}]);
 if(/脑|大脑/.test(q))return base('已定位脑。',[{type:'focus',conceptId:'FMA50801'}]);
 return base('演示模式支持心脏、主动脉、肺、气管、支气管、股骨、颅骨、脑、骨骼系统、三门课程与视图重置。开放式问答需配置实时 AI。',[],['本回答来自前端规则降级，不是实时大模型。']);
}
export async function askAssistant(message:string,config?:AIConfig|null,atlas?:Atlas|null):Promise<AssistantReply>{
 const topic=classifyAssistantTopic(message);if(topic==='medical')return{...base('知体只提供人体解剖学教育信息，不提供疾病诊断、症状判断或治疗建议。若有健康问题，请咨询具备资质的医疗专业人员。',[],['不提供个体医疗决策。']),mode:config?'live':'demo'};if(topic==='off-topic')return{...base('我是人体解剖学教学助手，只能回答人体结构、器官功能、解剖课程和知体项目操作相关问题。我们可以继续学习心脏、肺、骨骼或其他人体结构。'),mode:config?'live':'demo'};
 if(!config||!atlas)return localDemo(message);
 try{return await callCompatibleAPI(message,config,atlas) as AssistantReply;}catch(error){const fallback=localDemo(message);return{...fallback,error:error instanceof Error?error.message:'实时 AI 连接失败。',limitations:[`实时连接失败：${error instanceof Error?error.message:'未知错误'}，已自动使用离线演示。`,...fallback.limitations]};}
}
