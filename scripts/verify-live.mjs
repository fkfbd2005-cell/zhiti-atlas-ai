import assert from 'node:assert/strict';

const base=(process.env.LIVE_TEST_URL||'http://127.0.0.1:3017').replace(/\/$/,'');
const healthResponse=await fetch(`${base}/api/health`);
assert.equal(healthResponse.status,200,'health endpoint must return 200');
const health=await healthResponse.json();
assert.equal(health.mode,'live','AI_MODE must be live');
assert.equal(health.liveConfigured,true,'live credentials must be configured');

const assistantResponse=await fetch(`${base}/api/assistant`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'请找到心脏，把肌肉系统调成半透明，并简要解释心脏的位置。'})});
assert.equal(assistantResponse.status,200,'assistant endpoint must return 200');
const result=await assistantResponse.json();
assert.equal(result.mode,'live','response must come from the live provider');
assert.equal(typeof result.answer,'string');
assert.ok(result.answer.length>5,'answer must contain useful text');
assert.ok(Array.isArray(result.actions)&&result.actions.length>0,'live response must contain at least one validated action');

console.log(JSON.stringify({status:'PASS',provider:'DeepSeek',model:'deepseek-flash',health:{mode:health.mode,liveConfigured:health.liveConfigured},response:{mode:result.mode,answerChars:result.answer.length,actions:result.actions,citationCount:result.citations.length,limitationCount:result.limitations.length}},null,2));
