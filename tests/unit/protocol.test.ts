import {describe,expect,it} from 'vitest';
import {demoAssistant,requestLiveAssistant,sanitizeAssistantResponse} from '../../server/protocol.mjs';
const concepts=new Set(['FMA7088','FMA7101','FMA3734','FMA7309','FMA7310']),lessons=new Set(['circulation','respiratory','skeletal']);

describe('演示意图引擎',()=>{
 const cases=['找到心脏','解释左心室','找到主动脉','展示呼吸系统','比较左右肺','找到气管','观察支气管','肺泡在哪里','单独观察股骨','找到颅骨','展示骨骼','帮我复习主要骨骼','开始骨骼课程','开始呼吸课程','开始循环课程','重置视图'];
 for(const input of cases)it(`处理：${input}`,()=>{const result=demoAssistant(input);expect(result.answer.length).toBeGreaterThan(3);expect(result.actions.length).toBeGreaterThan(0);});
 it('拒绝诊断请求',()=>{const result=demoAssistant('根据症状给我确诊');expect(result.actions).toHaveLength(0);expect(result.limitations.length).toBeGreaterThan(0);});
 it('未知请求诚实声明规则边界',()=>{const result=demoAssistant('讲讲一个完全未知的话题');expect(result.answer).toContain('演示模式');expect(result.limitations[0]).toContain('不是实时大模型');});
});

describe('服务端协议过滤',()=>{
 it('过滤注入动作、无效 ID、越界参数与 javascript URL',()=>{const result=sanitizeAssistantResponse({mode:'live',answer:'ok',actions:[{type:'eval',code:'alert(1)'},{type:'focus',conceptId:'BAD'},{type:'focus',conceptId:'FMA7088'},{type:'setOpacity',system:'muscular',opacity:-1}],citations:[{title:'bad',url:'javascript:alert(1)'},{title:'good',url:'https://openstax.org'}],limitations:[]},concepts,lessons);expect(result.actions).toEqual([{type:'focus',conceptId:'FMA7088'}]);expect(result.citations).toHaveLength(1);});
 it('限制最多五个动作',()=>{const result=sanitizeAssistantResponse({answer:'ok',actions:Array.from({length:9},()=>({type:'resetView'}))},concepts,lessons);expect(result.actions).toHaveLength(5);});
 it('比较动作必须恰好包含两个有效概念',()=>{const result=sanitizeAssistantResponse({answer:'ok',actions:[{type:'compare',conceptIds:['FMA7309','FMA7310']},{type:'compare',conceptIds:['FMA7309','BAD']}]},concepts,lessons);expect(result.actions).toEqual([{type:'compare',conceptIds:['FMA7309','FMA7310']}]);});
 it('把 401 和 429 转为安全错误状态',async()=>{for(const status of [401,429])await expect(requestLiveAssistant('test',{env:{AI_API_KEY:'x',AI_BASE_URL:'https://api.example/v1',AI_MODEL:'m'},fetchFn:async()=>({ok:false,status}),validConceptIds:concepts,validLessonIds:lessons} as any)).rejects.toMatchObject({status:status===429?429:502});});
 it('拒绝实时模型的无效 JSON',async()=>{await expect(requestLiveAssistant('test',{env:{AI_API_KEY:'x',AI_BASE_URL:'https://api.example/v1',AI_MODEL:'m'},fetchFn:async()=>({ok:true,status:200,json:async()=>({choices:[{message:{content:'not-json'}}]})}),validConceptIds:concepts,validLessonIds:lessons} as any)).rejects.toBeInstanceOf(SyntaxError);});
 it('实时请求可超时中止',async()=>{const fetchFn:any=(_url:unknown,options:{signal:AbortSignal})=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>{const error=new Error('aborted');error.name='AbortError';reject(error);}));await expect(requestLiveAssistant('test',{env:{AI_API_KEY:'x',AI_BASE_URL:'https://api.example/v1',AI_MODEL:'m',AI_TIMEOUT_MS:'5'},fetchFn,validConceptIds:concepts,validLessonIds:lessons} as any)).rejects.toMatchObject({name:'AbortError'});});
});
