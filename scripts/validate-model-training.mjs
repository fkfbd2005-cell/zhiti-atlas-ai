import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MODEL_TRAINING_QUESTIONS} from '../app/model-training.ts';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
const concepts=new Map(atlas.concepts.map(concept=>[concept.id,concept]));
const parts=new Set(atlas.parts.map(part=>part.id));
assert.equal(MODEL_TRAINING_QUESTIONS.length,50,'question total');
assert.equal(new Set(MODEL_TRAINING_QUESTIONS.map(q=>q.id)).size,50,'question ids');
assert.equal(new Set(MODEL_TRAINING_QUESTIONS.map(q=>q.conceptId)).size,50,'concept ids');
assert.equal(MODEL_TRAINING_QUESTIONS.filter(q=>q.existingInV2).length,6,'existing V2 count');
for(const question of MODEL_TRAINING_QUESTIONS){const concept=concepts.get(question.conceptId);assert.ok(concept,`${question.id}: missing concept`);assert.ok(concept.elements.length,`${question.id}: empty mapping`);assert.equal(concept.elements.length,question.meshCount,`${question.id}: mesh count`);assert.ok(concept.elements.every(id=>parts.has(id)),`${question.id}: missing part`);assert.ok(question.prompt&&question.explanation&&question.zhName&&question.atlasName,`${question.id}: required field`);}
console.log('Verified exactly 50 unique model-training questions, 6 reused V2 concepts, and every non-empty Part.id mapping.');
