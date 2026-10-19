import {describe,expect,it} from 'vitest';
import {EXPANDED_QUIZZES,EXPANDED_SOURCES,EXPANDED_TOTAL,QUIZ_GROUPS} from '../../app/expanded-quiz';
import {QUIZZES,SOURCES} from '../../app/content';

describe('扩展题库完整性',()=>{
 it('恰好一百道，且 id 唯一',()=>{
  expect(EXPANDED_TOTAL).toBe(100);
  expect(EXPANDED_QUIZZES).toHaveLength(100);
  expect(new Set(EXPANDED_QUIZZES.map(q=>q.id)).size).toBe(100);
 });

 it('与原课内题库合并后共一百一十八道，且 id 不冲突',()=>{
  const ids=new Set(QUIZZES.map(q=>q.id));
  expect(QUIZZES).toHaveLength(18);
  for(const question of EXPANDED_QUIZZES)expect(ids.has(question.id),question.id).toBe(false);
  expect(QUIZZES.length+EXPANDED_QUIZZES.length).toBe(118);
 });

 it('覆盖十个系统，每个系统至少一道',()=>{
  expect(QUIZ_GROUPS).toHaveLength(10);
  for(const group of QUIZ_GROUPS){
   expect(EXPANDED_QUIZZES.filter(q=>q.group===group.id).length,group.id).toBeGreaterThanOrEqual(1);
  }
 });

 it('全部为选择题，且每题四个互不重复的选项',()=>{
  for(const question of EXPANDED_QUIZZES){
   expect(question.type,question.id).toBe('choice');
   expect(question.options,question.id).toHaveLength(4);
   expect(new Set(question.options).size,question.id).toBe(4);
  }
 });

 it('答案必定落在选项内，且不固定在同一位置',()=>{
  const positions=new Set<number>();
  for(const question of EXPANDED_QUIZZES){
   const index=question.options?.indexOf(question.answer)??-1;
   expect(index,question.id).toBeGreaterThanOrEqual(0);
   positions.add(index);
  }
  expect(positions.size).toBe(4);
 });

 it('题面、解析、难度均有实质内容',()=>{
  for(const question of EXPANDED_QUIZZES){
   expect(question.prompt.length,question.id).toBeGreaterThan(8);
   expect(question.explanation.length,question.id).toBeGreaterThan(10);
   expect(['基础','进阶','挑战'],question.id).toContain(question.difficulty);
  }
 });
});

describe('扩展题库来源',()=>{
 it('每道题的来源都能解析到真实条目',()=>{
  const known=new Set([...Object.keys(SOURCES),...Object.keys(EXPANDED_SOURCES)]);
  for(const question of EXPANDED_QUIZZES)expect(known.has(question.source),`${question.id} → ${question.source}`).toBe(true);
 });

 it('新增来源均为 https 链接且标注待专业复核',()=>{
  for(const [key,source] of Object.entries(EXPANDED_SOURCES)){
   expect(source.url,key).toMatch(/^https:\/\/openstax\.org\/books\/anatomy-and-physiology-2e\/pages\//);
   expect(source.reviewStatus,key).toBe('待专业复核');
   expect(source.accessedAt,key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
 });

 it('全部题目的题面互不重复',()=>{
  const prompts=EXPANDED_QUIZZES.map(q=>q.prompt.trim());
  expect(new Set(prompts).size).toBe(prompts.length);
 });
});
