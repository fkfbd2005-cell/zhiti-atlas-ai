import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {CORE_CONCEPTS,LESSONS,QUIZZES,isAnswerCorrect,resolveConcept,resolveFreeClickConcept,validateActions,type QuizQuestion} from '../../app/content';
import type {Atlas} from '../../app/anatomy';
const atlas=JSON.parse(readFileSync(new URL('../../public/models/atlas.json',import.meta.url),'utf8')) as Atlas;

describe('教学内容完整性',()=>{
 it('包含三门各六步课程',()=>{expect(LESSONS).toHaveLength(3);for(const lesson of LESSONS)expect(lesson.steps).toHaveLength(6);});
 it('包含十八题且每门六题',()=>{expect(QUIZZES).toHaveLength(18);for(const lesson of LESSONS)expect(QUIZZES.filter(q=>q.lessonId===lesson.id)).toHaveLength(6);});
 it('每门课都含模型点选题',()=>{for(const lesson of LESSONS)expect(QUIZZES.some(q=>q.lessonId===lesson.id&&q.type==='model')).toBe(true);});
 it('全部核心概念和课程概念存在真实模型映射',()=>{const ids=new Set(atlas.concepts.map(c=>c.id));for(const concept of CORE_CONCEPTS)expect(ids.has(concept.id),concept.id).toBe(true);for(const lesson of LESSONS)for(const step of lesson.steps)if(step.conceptId)expect(ids.has(step.conceptId),step.id).toBe(true);});
 it('中文与英文检索指向同一个概念',()=>{expect(resolveConcept(atlas,'心脏')?.id).toBe('FMA7088');expect(resolveConcept(atlas,'heart')?.id).toBe('FMA7088');expect(resolveConcept(atlas,'FMA7088')?.id).toBe('FMA7088');});
 it('自由点选先落到可拆解的整体结构',()=>{
  const leftVentricle=atlas.concepts.find(c=>c.id==='FMA7101')!;
  const skull=atlas.concepts.find(c=>c.id==='FMA46565')!;
  expect(resolveFreeClickConcept(atlas,leftVentricle.elements[0])?.id).toBe('FMA7088');
  expect(resolveFreeClickConcept(atlas,skull.elements[0])?.id).toBe('FMA46565');
 });
});

describe('动作与计分安全',()=>{
 it('拒绝非法概念、越界透明度并限制五个动作',()=>{const actions=validateActions(atlas,[{type:'focus',conceptId:'NOT_REAL'},{type:'setOpacity',system:'muscular',opacity:2},{type:'focus',conceptId:'FMA7088'},{type:'resetView'},{type:'resetView'},{type:'resetView'},{type:'resetView'},{type:'resetView'}] as never);expect(actions).toEqual([{type:'focus',conceptId:'FMA7088'},{type:'resetView'},{type:'resetView'}]);});
 it('比较动作只接受两个真实概念',()=>{expect(validateActions(atlas,[{type:'compare',conceptIds:['FMA7309','FMA7310']}])).toHaveLength(1);expect(validateActions(atlas,[{type:'compare',conceptIds:['FMA7309','BAD']}] as never)).toHaveLength(0);});
 it('选择题与模型网格判定准确',()=>{const choice=QUIZZES.find(q=>q.id==='cq1')!;expect(isAnswerCorrect(choice,'左心室',atlas)).toBe(true);expect(isAnswerCorrect(choice,'右心室',atlas)).toBe(false);const model=QUIZZES.find(q=>q.id==='cq3')!;const heart=atlas.concepts.find(c=>c.id==='FMA7088')!;expect(isAnswerCorrect(model,heart.elements[0],atlas)).toBe(true);expect(isAnswerCorrect(model,'missing',atlas)).toBe(false);});
 it('题库没有空答案或空解析',()=>{for(const q of QUIZZES as QuizQuestion[]){expect(q.prompt.length).toBeGreaterThan(5);expect(q.answer).toBeTruthy();expect(q.explanation.length).toBeGreaterThan(8);}});
});
