import {anatomicalName} from './atlas-index.mjs';
import {MODEL_TRAINING_QUESTIONS} from './model-training';
import type {Atlas,SystemId} from './anatomy';

export type Action =
 | {type:'focus'|'highlight'|'showInfo';conceptId:string}
 | {type:'compare';conceptIds:[string,string]}
 | {type:'setVisibility';conceptId:string;visible:boolean}
 | {type:'setOpacity';system:SystemId;opacity:number}
 | {type:'selectSystem';system:SystemId}
 | {type:'resetView'}
 | {type:'startLesson';lessonId:LessonId};

export interface Source {title:string;url:string;accessedAt:string;reviewStatus:'待专业复核'}
export interface ConceptEntry {id:string;zh:string;en:string;system:SystemId;synonyms:string[];summary:string;source:string}
export type LessonId='circulation'|'respiratory'|'skeletal';
export interface LessonStep {id:string;title:string;eyebrow:string;body:string;conceptId?:string;mapping:'verified'|'illustrative';actions:Action[];source:string;note?:string}
export interface Lesson {id:LessonId;title:string;subtitle:string;duration:string;accent:string;steps:LessonStep[]}
export interface QuizQuestion {id:string;lessonId:LessonId;type:'choice'|'model';prompt:string;options?:string[];answer:string;conceptId?:string;explanation:string;source:string;difficulty:'基础'|'进阶'}

export const SOURCES:Record<string,Source>={
 heart:{title:'OpenStax Anatomy & Physiology 2e · Heart Anatomy',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy',accessedAt:'2026-10-17',reviewStatus:'待专业复核'},
 circulation:{title:'OpenStax Anatomy & Physiology 2e · Circulatory Pathways',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/20-5-circulatory-pathways',accessedAt:'2026-10-17',reviewStatus:'待专业复核'},
 respiratory:{title:'OpenStax Anatomy & Physiology 2e · Organs and Structures of the Respiratory System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system',accessedAt:'2026-10-17',reviewStatus:'待专业复核'},
 lungs:{title:'OpenStax Anatomy & Physiology 2e · The Lungs',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-2-the-lungs',accessedAt:'2026-10-17',reviewStatus:'待专业复核'},
 skeletal:{title:'OpenStax Anatomy & Physiology 2e · Divisions of the Skeletal System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/7-1-divisions-of-the-skeletal-system',accessedAt:'2026-10-17',reviewStatus:'待专业复核'},
 atlas:{title:'BodyParts3D 4.0 · Anatomy model and metadata',url:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/',accessedAt:'2026-10-17',reviewStatus:'待专业复核'},
};

export const CORE_CONCEPTS:ConceptEntry[]=[
 {id:'FMA7088',zh:'心脏',en:'heart',system:'cardiac',synonyms:['心','心脏位置'],summary:'位于胸腔纵隔内的肌性泵，推动血液进入肺循环与体循环。',source:'heart'},
 {id:'FMA7101',zh:'左心室',en:'left ventricle',system:'cardiac',synonyms:['左室'],summary:'将富氧血泵入主动脉与体循环，壁通常比右心室厚。',source:'heart'},
 {id:'FMA7098',zh:'右心室',en:'right ventricle',system:'cardiac',synonyms:['右室'],summary:'将低氧血泵入肺动脉干，送往肺循环。',source:'heart'},
 {id:'FMA3734',zh:'主动脉',en:'aorta',system:'arterial',synonyms:['大动脉'],summary:'体循环的主要输出血管，从左心室接收血液。',source:'circulation'},
 {id:'FMA8612',zh:'肺动脉干',en:'pulmonary trunk',system:'arterial',synonyms:['肺动脉'],summary:'从右心室发出，并分向左右肺。',source:'circulation'},
 {id:'FMA66643',zh:'肺静脉',en:'pulmonary vein',system:'venous',synonyms:['肺静脉群'],summary:'把经肺部气体交换后的血液送回左心房。',source:'circulation'},
 {id:'FMA4720',zh:'上腔静脉',en:'superior vena cava',system:'venous',synonyms:['上腔静脉'],summary:'收集上半身静脉血并回流至右心房。',source:'circulation'},
 {id:'FMA10951',zh:'下腔静脉',en:'inferior vena cava',system:'venous',synonyms:['下腔静脉'],summary:'收集下半身静脉血并回流至右心房。',source:'circulation'},
 {id:'FMA7309',zh:'右肺',en:'right lung',system:'respiratory',synonyms:['肺','肺部','双肺'],summary:'右侧胸腔内的呼吸器官，含上、中、下叶。',source:'lungs'},
 {id:'FMA7310',zh:'左肺',en:'left lung',system:'respiratory',synonyms:['左边的肺'],summary:'左侧胸腔内的呼吸器官，为心脏留有心切迹。',source:'lungs'},
 {id:'FMA7394',zh:'气管',en:'trachea',system:'respiratory',synonyms:['主气道'],summary:'连接喉与主支气管的导气通道，由软骨支撑。',source:'respiratory'},
 {id:'FMA7409',zh:'支气管',en:'bronchus',system:'respiratory',synonyms:['主支气管','支气管树'],summary:'气管分叉后进入肺内的导气通道。',source:'respiratory'},
 {id:'FMA13295',zh:'膈肌',en:'diaphragm',system:'muscular',synonyms:['横膈膜'],summary:'分隔胸腹腔的主要吸气肌，收缩时增大胸腔容积。',source:'respiratory'},
 {id:'FMA23876',zh:'全身骨架',en:'skeleton (in vivo)',system:'skeletal',synonyms:['骨骼','骨架','骨骼系统'],summary:'提供支撑、保护并与肌肉共同产生运动。',source:'skeletal'},
 {id:'FMA71221',zh:'中轴骨骼',en:'axial skeleton',system:'skeletal',synonyms:['轴骨','中轴骨'],summary:'包括头、颈、胸和背部的中央骨性结构。',source:'skeletal'},
 {id:'FMA46565',zh:'颅骨',en:'skull',system:'skeletal',synonyms:['头骨'],summary:'围成颅腔并保护脑，同时构成面部骨性框架。',source:'skeletal'},
 {id:'FMA7574',zh:'肋骨',en:'rib',system:'skeletal',synonyms:['胸廓肋骨'],summary:'与胸椎、胸骨共同组成胸廓的重要部分。',source:'skeletal'},
 {id:'FMA7485',zh:'胸骨',en:'sternum',system:'skeletal',synonyms:['胸骨体'],summary:'位于胸前正中的扁骨，与肋软骨共同构成胸廓。',source:'skeletal'},
 {id:'FMA9914',zh:'椎骨',en:'vertebra',system:'skeletal',synonyms:['脊椎骨','脊柱'],summary:'构成脊柱的系列骨，支撑躯干并保护脊髓。',source:'skeletal'},
 {id:'FMA9611',zh:'股骨',en:'femur',system:'skeletal',synonyms:['大腿骨'],summary:'大腿的长骨，近端连接髋部，远端参与膝关节。',source:'skeletal'},
 {id:'FMA13303',zh:'肱骨',en:'humerus',system:'skeletal',synonyms:['上臂骨'],summary:'上臂长骨，连接肩关节与肘关节。',source:'skeletal'},
 {id:'FMA24476',zh:'胫骨',en:'tibia',system:'skeletal',synonyms:['小腿胫骨'],summary:'小腿内侧主要承重长骨。',source:'skeletal'},
 {id:'FMA23463',zh:'桡骨',en:'radius',system:'skeletal',synonyms:['前臂桡骨'],summary:'前臂外侧（解剖学姿势下拇指侧）的长骨。',source:'skeletal'},
 {id:'FMA23466',zh:'尺骨',en:'ulna',system:'skeletal',synonyms:['前臂尺骨'],summary:'前臂内侧长骨，近端参与构成肘关节。',source:'skeletal'},
 {id:'FMA50801',zh:'脑',en:'brain',system:'nervous',synonyms:['大脑','脑部'],summary:'中枢神经系统的重要组成，承担感觉整合、运动调控与高级认知。',source:'atlas'},
];

const step=(id:string,title:string,eyebrow:string,body:string,conceptId:string|undefined,actions:Action[],source:string,note?:string):LessonStep=>({id,title,eyebrow,body,conceptId,actions,source,note,mapping:conceptId?'verified':'illustrative'});
export const LESSONS:Lesson[]=[
 {id:'circulation',title:'一滴血的双循环旅程',subtitle:'从心脏出发，理解肺循环与体循环',duration:'约 8 分钟',accent:'#D56D55',steps:[
  step('c1','先看循环全景','01 · 系统全景','心血管系统由心脏、动脉和静脉共同组成。先把三类结构放在同一视野中，建立“泵—输出—回流”的整体框架。',undefined,[{type:'selectSystem',system:'cardiac'},{type:'setOpacity',system:'arterial',opacity:1},{type:'setOpacity',system:'venous',opacity:1}],'circulation','系统组合展示；无单一概念 ID。'),
  step('c2','心脏：循环的动力泵','02 · 心脏聚焦','心脏位于胸腔纵隔。右心把血液送往肺，左心把血液送往全身。模型中的心脏概念包含 83 个可追溯网格。','FMA7088',[{type:'focus',conceptId:'FMA7088'},{type:'showInfo',conceptId:'FMA7088'}],'heart'),
  step('c3','右心室到肺动脉干','03 · 肺循环起点','右心室收缩后，血液经肺动脉干进入肺循环。肺动脉虽名为“动脉”，判断依据是离开心脏，而不是含氧量。','FMA8612',[{type:'focus',conceptId:'FMA8612'}],'circulation'),
  step('c4','肺静脉返回左心','04 · 肺循环回程','完成气体交换后的血液经肺静脉回到左心房，再进入左心室。肺静脉是把血液带回心脏的静脉。','FMA66643',[{type:'focus',conceptId:'FMA66643'}],'circulation'),
  step('c5','主动脉开启体循环','05 · 体循环输出','左心室将血液泵入主动脉，主动脉再分支向全身组织供血。模型可独立定位主动脉及其多个节段。','FMA3734',[{type:'focus',conceptId:'FMA3734'}],'circulation'),
  step('c6','回顾：泵、去路与归路','06 · 路径回顾','记住方向：心室是“泵出”，心房是“接收”；动脉离心，静脉回心。点击进入测验，检验你是否能在模型上完成定位。','FMA7088',[{type:'highlight',conceptId:'FMA7088'},{type:'highlight',conceptId:'FMA3734'}],'circulation'),
 ]},
 {id:'respiratory',title:'空气从气管到肺',subtitle:'沿导气路径理解气体交换边界',duration:'约 7 分钟',accent:'#6F9F9C',steps:[
  step('r1','呼吸系统全景','01 · 系统全景','导气区把空气送向肺，呼吸区承担气体交换。当前模型适合观察气管、支气管与肺的大体空间关系。',undefined,[{type:'selectSystem',system:'respiratory'}],'respiratory','系统级展示；无单一概念 ID。'),
  step('r2','气管：有支架的通道','02 · 导气起点','气管由软骨支撑，连接喉部与左右主支气管。它负责导气而不是直接完成气体交换。','FMA7394',[{type:'focus',conceptId:'FMA7394'}],'respiratory'),
  step('r3','支气管：不断分支','03 · 气道分叉','气管分叉为主支气管并继续形成支气管树。分支越向远端越细，最终通向呼吸区。','FMA7409',[{type:'focus',conceptId:'FMA7409'}],'respiratory'),
  step('r4','左右肺：成对但不完全对称','04 · 肺叶观察','右肺通常分为三叶，左肺为心脏留出空间并具有心切迹。先观察右肺，再对照左肺。','FMA7309',[{type:'focus',conceptId:'FMA7309'},{type:'highlight',conceptId:'FMA7310'}],'lungs'),
  step('r5','肺泡：模型覆盖边界','05 · 气体交换示意','氧和二氧化碳在肺泡与毛细血管形成的呼吸膜两侧扩散。本模型没有可独立定位的肺泡网格，因此本步只用肺部定位配合文字示意。',undefined,[{type:'focus',conceptId:'FMA7309'},{type:'highlight',conceptId:'FMA7310'}],'respiratory','教学示意，非生理仿真；肺泡无独立网格。'),
  step('r6','膈肌：改变胸腔容积','06 · 呼吸动力','膈肌收缩时胸腔容积增大，有助于空气进入肺。这里展示空间位置，不模拟真实压力或肺容积变化。','FMA13295',[{type:'focus',conceptId:'FMA13295'}],'respiratory','位置教学，非呼吸运动仿真。'),
 ]},
 {id:'skeletal',title:'从中轴到四肢的骨架地图',subtitle:'用骨性地标建立全身定位能力',duration:'约 8 分钟',accent:'#B28C4B',steps:[
  step('s1','全身骨架','01 · 支撑框架','骨骼为身体提供支撑与保护，并为肌肉产生运动提供杠杆。先以完整骨架建立方向感。','FMA23876',[{type:'selectSystem',system:'skeletal'},{type:'highlight',conceptId:'FMA23876'}],'skeletal'),
  step('s2','中轴骨骼','02 · 身体中轴','中轴骨骼包括颅骨、脊柱与胸廓等位于身体中央轴线的结构，主要承担支撑与保护。','FMA71221',[{type:'focus',conceptId:'FMA71221'}],'skeletal'),
  step('s3','颅骨与胸廓','03 · 保护结构','颅骨保护脑；肋骨、胸骨和胸椎共同构成胸廓，为心肺提供骨性保护。','FMA46565',[{type:'focus',conceptId:'FMA46565'},{type:'highlight',conceptId:'FMA7574'},{type:'highlight',conceptId:'FMA7485'}],'skeletal'),
  step('s4','上肢骨性地标','04 · 附肢示例','肱骨位于上臂，桡骨和尺骨位于前臂。它们通过肩、肘和腕相关关节形成灵活的上肢链。','FMA13303',[{type:'focus',conceptId:'FMA13303'},{type:'highlight',conceptId:'FMA23463'},{type:'highlight',conceptId:'FMA23466'}],'skeletal'),
  step('s5','股骨与胫骨','05 · 下肢承重','股骨位于大腿，是人体重要的承重长骨；胫骨位于小腿内侧并承担主要负荷。','FMA9611',[{type:'focus',conceptId:'FMA9611'},{type:'highlight',conceptId:'FMA24476'}],'skeletal'),
  step('s6','命名定位回顾','06 · 空间回顾','从中央到四肢复述一遍：颅骨—脊柱—胸廓构成中轴框架；肱骨、前臂骨、股骨与胫骨属于四肢骨性地标。','FMA9914',[{type:'highlight',conceptId:'FMA9914'},{type:'highlight',conceptId:'FMA13303'},{type:'highlight',conceptId:'FMA9611'}],'skeletal'),
 ]},
];

export const QUIZZES:QuizQuestion[]=[
 {id:'cq1',lessonId:'circulation',type:'choice',prompt:'把血液泵入主动脉的是哪一结构？',options:['左心室','右心室','右心房','肺动脉干'],answer:'左心室',explanation:'左心室收缩将血液泵入主动脉，进入体循环。',source:'heart',difficulty:'基础'},
 {id:'cq2',lessonId:'circulation',type:'choice',prompt:'“动脉”的判定依据是什么？',options:['血液一定富含氧','血管离开心脏','血管壁一定最厚','血管位于身体深处'],answer:'血管离开心脏',explanation:'动脉按血流方向定义：把血液带离心脏；肺动脉可运送低氧血。',source:'circulation',difficulty:'基础'},
 {id:'cq3',lessonId:'circulation',type:'model',prompt:'请在三维模型中点选心脏。',answer:'FMA7088',conceptId:'FMA7088',explanation:'心脏位于胸腔纵隔，模型概念 ID 为 FMA7088。',source:'heart',difficulty:'基础'},
 {id:'cq4',lessonId:'circulation',type:'choice',prompt:'肺静脉把血液送到哪里？',options:['离开心脏去肺','从肺回到心脏','从左心室到全身','从全身回到右心室'],answer:'从肺回到心脏',explanation:'肺静脉把气体交换后的血液带回左心房。',source:'circulation',difficulty:'基础'},
 {id:'cq5',lessonId:'circulation',type:'model',prompt:'请在模型中点选主动脉。',answer:'FMA3734',conceptId:'FMA3734',explanation:'主动脉是体循环的主要输出血管，概念 ID 为 FMA3734。',source:'circulation',difficulty:'进阶'},
 {id:'cq6',lessonId:'circulation',type:'choice',prompt:'体循环的正确起点是？',options:['左心室','右心室','右心房','上腔静脉'],answer:'左心室',explanation:'体循环从左心室泵入主动脉开始。',source:'circulation',difficulty:'基础'},
 {id:'rq1',lessonId:'respiratory',type:'choice',prompt:'气管的主要直接功能是？',options:['完成气体交换','传导空气','泵出血液','产生红细胞'],answer:'传导空气',explanation:'气管属于导气通道，气体交换主要发生在肺泡区域。',source:'respiratory',difficulty:'基础'},
 {id:'rq2',lessonId:'respiratory',type:'model',prompt:'请在三维模型中点选气管。',answer:'FMA7394',conceptId:'FMA7394',explanation:'气管连接喉与主支气管，概念 ID 为 FMA7394。',source:'respiratory',difficulty:'基础'},
 {id:'rq3',lessonId:'respiratory',type:'choice',prompt:'气体交换主要跨越哪一结构进行？',options:['呼吸膜','气管软骨','肋骨','胸骨'],answer:'呼吸膜',explanation:'肺泡壁与毛细血管壁共同形成很薄的呼吸膜，气体由此扩散。',source:'respiratory',difficulty:'进阶'},
 {id:'rq4',lessonId:'respiratory',type:'model',prompt:'请在模型中点选右肺。',answer:'FMA7309',conceptId:'FMA7309',explanation:'右肺概念 ID 为 FMA7309。',source:'lungs',difficulty:'基础'},
 {id:'rq5',lessonId:'respiratory',type:'choice',prompt:'膈肌收缩时通常发生什么？',options:['胸腔容积增大','胸腔容积必然归零','气管关闭','心脏停止'],answer:'胸腔容积增大',explanation:'膈肌收缩下降，有助于增大胸腔容积并吸气。',source:'respiratory',difficulty:'基础'},
 {id:'rq6',lessonId:'respiratory',type:'choice',prompt:'本模型对肺泡的展示状态是？',options:['有独立可选肺泡网格','仅教学示意，无独立网格','实时生理仿真','临床级显微结构'],answer:'仅教学示意，无独立网格',explanation:'知体明确区分医学知识与模型覆盖范围，不为缺失结构伪造几何映射。',source:'respiratory',difficulty:'基础'},
 {id:'sq1',lessonId:'skeletal',type:'choice',prompt:'中轴骨骼不包括下列哪一项？',options:['颅骨','脊柱','胸廓','股骨'],answer:'股骨',explanation:'股骨属于下肢骨；颅骨、脊柱和胸廓属于中轴骨骼。',source:'skeletal',difficulty:'基础'},
 {id:'sq2',lessonId:'skeletal',type:'model',prompt:'请在三维模型中点选股骨。',answer:'FMA9611',conceptId:'FMA9611',explanation:'股骨位于大腿，概念 ID 为 FMA9611。',source:'skeletal',difficulty:'基础'},
 {id:'sq3',lessonId:'skeletal',type:'choice',prompt:'位于上臂的长骨是？',options:['肱骨','股骨','胫骨','胸骨'],answer:'肱骨',explanation:'肱骨位于上臂，近端连肩、远端参与肘关节。',source:'skeletal',difficulty:'基础'},
 {id:'sq4',lessonId:'skeletal',type:'model',prompt:'请在模型中点选颅骨。',answer:'FMA46565',conceptId:'FMA46565',explanation:'颅骨围成颅腔并保护脑，概念 ID 为 FMA46565。',source:'skeletal',difficulty:'基础'},
 {id:'sq5',lessonId:'skeletal',type:'choice',prompt:'桡骨位于解剖学姿势下前臂的哪一侧？',options:['拇指侧','小指侧','大腿内侧','胸前正中'],answer:'拇指侧',explanation:'解剖学姿势下，桡骨位于前臂外侧，也就是拇指侧。',source:'skeletal',difficulty:'进阶'},
 {id:'sq6',lessonId:'skeletal',type:'choice',prompt:'骨骼系统的功能不包括？',options:['提供支撑','保护器官','参与运动','直接完成肺泡气体交换'],answer:'直接完成肺泡气体交换',explanation:'骨骼提供支撑、保护并参与运动；肺泡气体交换属于呼吸系统功能。',source:'skeletal',difficulty:'基础'},
];

export function conceptById(id:string){return CORE_CONCEPTS.find(c=>c.id===id);}
const FREE_CLICK_PARENT:Record<string,string>={
 'FMA7101':'FMA7088',
 'FMA7098':'FMA7088',
};
export function resolveFreeClickConcept(atlas:Atlas,partId:string){
 const matches=CORE_CONCEPTS
  .map(entry=>({entry,concept:atlas.concepts.find(concept=>concept.id===entry.id)}))
  .filter((item):item is {entry:ConceptEntry;concept:Atlas['concepts'][number]}=>!!item.concept?.elements.includes(partId))
  .sort((a,b)=>a.concept.elements.length-b.concept.elements.length);
 const closest=matches[0]?.entry;if(!closest)return undefined;
 const parentId=FREE_CLICK_PARENT[closest.id];
 return (parentId?CORE_CONCEPTS.find(entry=>entry.id===parentId):undefined)??closest;
}
export function resolveConcept(atlas:Atlas,query:string){
 const q=query.trim().toLowerCase().replace(/\s+/g,' ');if(!q)return undefined;
 const exact=CORE_CONCEPTS.find(c=>[c.id,c.zh,c.en,...c.synonyms].some(term=>term.toLowerCase()===q));
 if(exact&&atlas.concepts.some(c=>c.id===exact.id))return exact;
 const matches=(c:Atlas['concepts'][number])=>[c.id,c.name,anatomicalName(c.name)].some(term=>term.toLowerCase()===q);
 let raw=atlas.concepts.find(matches);
 if(!raw){
  const local=CORE_CONCEPTS.find(c=>[c.zh,c.en,...c.synonyms].some(term=>term.toLowerCase().includes(q)));
  if(local&&atlas.concepts.some(c=>c.id===local.id))return local;
  raw=atlas.concepts.find(c=>[c.name,anatomicalName(c.name)].some(term=>term.toLowerCase().includes(q)));
 }
 if(!raw)return undefined;const part=atlas.parts.find(p=>raw.elements.includes(p.id));
 const lesson=MODEL_TRAINING_QUESTIONS.find(item=>item.conceptId===raw.id);
 return {id:raw.id,zh:anatomicalName(raw.name),en:raw.name,system:part?.system??'connective',synonyms:[],summary:lesson?.explanation??'该结构对应 BodyParts3D 解剖模型。',source:lesson?.source??'atlas'} satisfies ConceptEntry;
}

export function validateActions(atlas:Atlas,actions:Action[]){
 const concepts=new Set(atlas.concepts.map(c=>c.id));const lessons=new Set(LESSONS.map(l=>l.id));
 return actions.slice(0,5).filter(a=>{
  if(a.type==='resetView'||a.type==='selectSystem'||a.type==='setOpacity')return a.type!=='setOpacity'||Number.isFinite(a.opacity)&&a.opacity>=0&&a.opacity<=1;
  if(a.type==='startLesson')return lessons.has(a.lessonId);
  if(a.type==='compare')return a.conceptIds.length===2&&a.conceptIds.every(id=>concepts.has(id));
  return concepts.has(a.conceptId);
 });
}

export function isAnswerCorrect(question:QuizQuestion,answer:string,atlas?:Atlas){
 if(question.type==='choice')return question.answer===answer;
 if(!atlas||!question.conceptId)return question.answer===answer;
 const target=atlas.concepts.find(c=>c.id===question.conceptId);return answer===question.conceptId||!!target?.elements.includes(answer);
}
