import {afterEach,describe,expect,it,vi} from 'vitest';
import {askAssistant,classifyAssistantTopic,testAIConfig} from '../../app/assistant';
import type {Atlas} from '../../app/anatomy';

const config={provider:'custom',apiKey:'secret-for-test',baseUrl:'https://api.example/v1',model:'teaching-model'};
const atlas={version:'test',parts:[],concepts:[{id:'FMA7088',name:'heart',elements:[]}],chunks:[],triangles:0} as Atlas;
afterEach(()=>vi.unstubAllGlobals());

describe('浏览器 AI 配置与安全边界',()=>{
 it('区分解剖主题、医疗建议与无关话题',()=>{expect(classifyAssistantTopic('讲解心脏结构')).toBe('anatomy');expect(classifyAssistantTopic('根据症状给我治疗方案')).toBe('medical');expect(classifyAssistantTopic('帮我写一首情诗')).toBe('off-topic');});
 it('连接测试只请求所选兼容接口',async()=>{const fetchMock=vi.fn(async(_url:string)=>({ok:true,json:async()=>({choices:[{message:{content:'{"mode":"live","answer":"连接成功","actions":[],"citations":[],"limitations":[]}'}}]})}));vi.stubGlobal('fetch',fetchMock);await expect(testAIConfig(config)).resolves.toBe(true);expect(fetchMock).toHaveBeenCalledOnce();expect(String(fetchMock.mock.calls[0]?.[0])).toBe('https://api.example/v1/chat/completions');});
 it('无关话题在应用层拒绝且不会发送密钥',async()=>{const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);const reply=await askAssistant('帮我预测明天的彩票号码',config,atlas);expect(reply.answer).toContain('人体解剖学教学助手');expect(reply.actions).toHaveLength(0);expect(fetchMock).not.toHaveBeenCalled();});
 it('实时响应仅保留白名单动作',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({mode:'live',answer:'已定位心脏',actions:[{type:'focus',conceptId:'FMA7088'},{type:'eval',code:'bad'}],citations:[],limitations:[]})}}]})})));const reply=await askAssistant('定位心脏',config,atlas);expect(reply.mode).toBe('live');expect(reply.actions).toEqual([{type:'focus',conceptId:'FMA7088'}]);});
 it('连接失败自动回退演示能力',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>{throw new TypeError('Failed to fetch');}));const reply=await askAssistant('定位心脏',config,atlas);expect(reply.mode).toBe('demo');expect(reply.answer).toContain('已定位心脏');expect(reply.limitations[0]).toContain('已自动使用离线演示');});
});
