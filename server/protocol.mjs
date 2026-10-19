export const ALLOWED_ACTIONS=new Set(['focus','highlight','compare','setVisibility','setOpacity','selectSystem','resetView','startLesson','showInfo']);
export const VALID_SYSTEMS=new Set(['skeletal','muscular','arterial','venous','nervous','digestive','respiratory','urinary','reproductive','lymphatic','endocrine','integumentary','connective','sensory','cardiac']);

const citation=(title,url)=>({title,url});
const source={heart:citation('OpenStax · Heart Anatomy','https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy'),respiratory:citation('OpenStax · Respiratory System','https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system'),skeletal:citation('OpenStax · Skeletal System','https://openstax.org/books/anatomy-and-physiology-2e/pages/7-1-divisions-of-the-skeletal-system')};
const result=(answer,actions=[],citations=[],limitations=[])=>({mode:'demo',answer,actions,citations,limitations});

export function demoAssistant(input){
 const q=String(input??'').trim().toLowerCase();
 if(!q)return result('请告诉我你想观察的结构，例如“找到心脏”或“开始骨骼课程”。');
 if(/诊断|确诊|处方|治疗方案|我是不是得了|症状/.test(q))return result('知体只提供解剖学教育信息，不能依据症状作出诊断或治疗建议。若你有身体不适，请咨询具备资质的医疗专业人员。',[],[],['不提供个体诊断、用药或治疗决策。']);
 if(/重置|还原|回到开始|复位/.test(q))return result('已经还原视图与系统显示。',[{type:'resetView'}]);
 if(/骨骼.*课程|开始.*骨|学习.*骨/.test(q))return result('已打开“从中轴到四肢的骨架地图”课程。',[{type:'startLesson',lessonId:'skeletal'}],[source.skeletal]);
 if(/呼吸.*课程|开始.*呼吸|学习.*呼吸/.test(q))return result('已打开“空气从气管到肺”课程。',[{type:'startLesson',lessonId:'respiratory'}],[source.respiratory]);
 if(/循环.*课程|开始.*循环|学习.*心血管/.test(q))return result('已打开“一滴血的双循环旅程”课程。',[{type:'startLesson',lessonId:'circulation'}],[source.heart]);
 if(/比较.*(左右肺|两肺)|左右肺.*(比较|区别)/.test(q))return result('已将左右肺纳入同一观察构图。右肺通常有三叶；左肺通常有两叶，并为心脏留出心切迹。当前模型主要呈现肺内气道与血管分支，肺叶外形覆盖有限。',[{type:'compare',conceptIds:['FMA7309','FMA7310']}],[source.respiratory],['肺叶差异为教学文字，当前几何不能完整呈现肺叶表面。']);
 if(/左心室/.test(q))return result('左心室将血液泵入主动脉与体循环；在当前模型中它有独立概念映射。',[{type:'focus',conceptId:'FMA7101'},{type:'showInfo',conceptId:'FMA7101'}],[source.heart]);
 if(/肌肉.*透明|透明.*肌肉/.test(q))return result('已将肌肉系统调为半透明，便于观察深层结构。',[{type:'setOpacity',system:'muscular',opacity:.18}]);
 if(/心脏|心在哪|找到心/.test(q)){
  const actions=[{type:'focus',conceptId:'FMA7088'},{type:'showInfo',conceptId:'FMA7088'}];
  if(/透明|半透明/.test(q))actions.push({type:'setOpacity',system:'muscular',opacity:.18});
  return result('已定位心脏。它位于胸腔纵隔，是肺循环与体循环共同的动力泵。',actions,[source.heart]);
 }
 if(/主动脉/.test(q))return result('已定位主动脉，它从左心室接收血液并开启体循环。',[{type:'focus',conceptId:'FMA3734'}],[source.heart]);
 if(/气管/.test(q))return result('已定位气管。它是由软骨支撑的导气通道，向下分为主支气管。',[{type:'focus',conceptId:'FMA7394'}],[source.respiratory]);
 if(/支气管/.test(q))return result('已定位支气管。气道继续分支并最终通向呼吸区。',[{type:'focus',conceptId:'FMA7409'}],[source.respiratory]);
 if(/肺泡/.test(q))return result('肺泡是气体交换的重要场所，但当前 BodyParts3D 模型没有可独立选择的肺泡网格。我已定位双肺作为空间参照。',[{type:'focus',conceptId:'FMA7309'},{type:'highlight',conceptId:'FMA7310'}],[source.respiratory],['肺泡仅作文字教学，不是独立三维网格。']);
 if(/肺|呼吸系统/.test(q))return result('已显示呼吸系统并定位左右肺。右肺与左肺在模型中都有独立映射。',[{type:'selectSystem',system:'respiratory'},{type:'focus',conceptId:'FMA7309'},{type:'highlight',conceptId:'FMA7310'}],[source.respiratory]);
 if(/股骨|大腿骨/.test(q))return result('已单独定位股骨。股骨是大腿的主要长骨。',[{type:'focus',conceptId:'FMA9611'}],[source.skeletal]);
 if(/颅骨|头骨/.test(q))return result('已定位颅骨。颅骨围成颅腔并保护脑。',[{type:'focus',conceptId:'FMA46565'}],[source.skeletal]);
 if(/复习.*骨|主要骨骼/.test(q))return result('已打开骨骼学习路径，完成后可直接进入定位练习。',[{type:'startLesson',lessonId:'skeletal'}],[source.skeletal]);
 if(/骨骼|骨架|骨头/.test(q))return result('已切换到骨骼系统。你可以继续指定股骨、颅骨或椎骨。',[{type:'selectSystem',system:'skeletal'}],[source.skeletal]);
 if(/脑|大脑/.test(q))return result('已定位脑。当前展示用于解剖空间学习，不用于诊断。',[{type:'focus',conceptId:'FMA50801'}]);
 return result('演示模式目前支持心脏、主动脉、左右心室、肺、气管、支气管、股骨、颅骨、脑、骨骼系统、三门课程与视图重置。开放式问答需要配置实时 AI。',[],[],['演示模式是规则引擎，不是实时大模型。']);
}

function safeText(value,max){return typeof value==='string'?value.slice(0,max):'';}
export function sanitizeAssistantResponse(value,validConceptIds,validLessonIds){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('AI response must be a JSON object.');
 const actions=[];
 for(const raw of Array.isArray(value.actions)?value.actions.slice(0,5):[]){
  if(!raw||typeof raw!=='object'||!ALLOWED_ACTIONS.has(raw.type))continue;
  if(['focus','highlight','setVisibility','showInfo'].includes(raw.type)){
   if(!validConceptIds.has(raw.conceptId))continue;actions.push({type:raw.type,conceptId:raw.conceptId,...(raw.type==='setVisibility'?{visible:raw.visible===true}:{})});continue;
  }
  if(raw.type==='compare'){
   if(!Array.isArray(raw.conceptIds)||raw.conceptIds.length!==2||!raw.conceptIds.every(id=>validConceptIds.has(id)))continue;actions.push({type:'compare',conceptIds:[raw.conceptIds[0],raw.conceptIds[1]]});continue;
  }
  if(raw.type==='setOpacity'){
   if(!VALID_SYSTEMS.has(raw.system)||typeof raw.opacity!=='number'||raw.opacity<0||raw.opacity>1)continue;actions.push({type:raw.type,system:raw.system,opacity:raw.opacity});continue;
  }
  if(raw.type==='selectSystem'){
   if(!VALID_SYSTEMS.has(raw.system))continue;actions.push({type:raw.type,system:raw.system});continue;
  }
  if(raw.type==='startLesson'){
   if(!validLessonIds.has(raw.lessonId))continue;actions.push({type:raw.type,lessonId:raw.lessonId});continue;
  }
  if(raw.type==='resetView')actions.push({type:'resetView'});
 }
 const citations=(Array.isArray(value.citations)?value.citations:[]).slice(0,4).flatMap(item=>{
  if(!item||typeof item!=='object')return[];const title=safeText(item.title,120),url=safeText(item.url,500);try{const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol)||!title)return[];return[{title,url:parsed.toString()}];}catch{return[];}
 });
 return {mode:value.mode==='live'?'live':'demo',answer:safeText(value.answer,1600)||'没有可显示的回答。',actions,citations,limitations:(Array.isArray(value.limitations)?value.limitations:[]).map(x=>safeText(x,240)).filter(Boolean).slice(0,4)};
}

const systemPrompt=`你是中文解剖学习助手。只提供教育信息，不做诊断。返回严格 JSON：{mode:"live",answer:string,citations:[{title,url}],actions:[],limitations:[]}。允许动作仅为 focus/highlight/showInfo/setVisibility(conceptId)、compare(conceptIds恰好2个)、setOpacity(system,opacity 0..1)、selectSystem(system)、resetView、startLesson(lessonId)。只能使用上下文中给出的 conceptId 与 lessonId，最多5个动作，不得输出代码或HTML。`;
export async function requestLiveAssistant(message,{env=process.env,fetchFn=fetch,validConceptIds,validLessonIds,concepts=[]}={}){
 if(!env.AI_API_KEY||!env.AI_BASE_URL||!env.AI_MODEL)throw Object.assign(new Error('实时 AI 配置不完整。'),{status:503});
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),Number(env.AI_TIMEOUT_MS||20000));
 try{
  const context={lessons:[...validLessonIds],concepts};
  const response=await fetchFn(`${env.AI_BASE_URL.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${env.AI_API_KEY}`},body:JSON.stringify({model:env.AI_MODEL,messages:[{role:'system',content:systemPrompt},{role:'system',content:`可用上下文：${JSON.stringify(context)}`},{role:'user',content:message}],temperature:.2,max_tokens:Number(env.AI_MAX_OUTPUT_TOKENS||900),response_format:{type:'json_object'}}),signal:controller.signal});
  if(!response.ok)throw Object.assign(new Error(`实时 AI 服务返回 ${response.status}。`),{status:response.status===429?429:502});
  const payload=await response.json(),text=payload?.choices?.[0]?.message?.content;if(typeof text!=='string')throw new Error('实时 AI 返回格式缺少内容。');
  return sanitizeAssistantResponse(JSON.parse(text),validConceptIds,validLessonIds);
 }finally{clearTimeout(timeout);}
}
