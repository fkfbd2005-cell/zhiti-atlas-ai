import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  MODEL_TRAINING_QUESTIONS,
  isModelTrainingAnswer,
  modelTrainingSystem,
  shuffledModelQuestions,
} from "../../app/model-training";

const atlas = JSON.parse(
  readFileSync(
    new URL("../../public/models/atlas.json", import.meta.url),
    "utf8",
  ),
) as {
  concepts: { id: string; elements: string[] }[];
  parts: { id: string }[];
};
describe("模型定位训练题库", () => {
  it("恰好 50 题且题目与概念 ID 唯一", () => {
    expect(MODEL_TRAINING_QUESTIONS).toHaveLength(50);
    expect(new Set(MODEL_TRAINING_QUESTIONS.map((q) => q.id)).size).toBe(50);
    expect(new Set(MODEL_TRAINING_QUESTIONS.map((q) => q.conceptId)).size).toBe(
      50,
    );
    expect(MODEL_TRAINING_QUESTIONS.filter((q) => q.existingInV2)).toHaveLength(
      6,
    );
  });
  it("每个概念存在、映射非空且网格计数与 atlas 一致", () => {
    const parts = new Set(atlas.parts.map((p) => p.id));
    for (const q of MODEL_TRAINING_QUESTIONS) {
      const concept = atlas.concepts.find((c) => c.id === q.conceptId);
      expect(concept, q.id).toBeTruthy();
      expect(concept!.elements.length, q.id).toBe(q.meshCount);
      expect(
        concept!.elements.every((id) => parts.has(id)),
        q.id,
      ).toBe(true);
    }
  });
  it("所有字段有效并保留待复核状态", () => {
    for (const q of MODEL_TRAINING_QUESTIONS) {
      expect(q.prompt.length, q.id).toBeGreaterThan(8);
      expect(q.explanation.length, q.id).toBeGreaterThan(15);
      expect(q.reviewStatus, q.id).toBe("待专业复核");
      expect(q.visualStatus, q.id).toBe("待浏览器抽测");
    }
  });
  it("按真实 Part.id 到 Concept.elements 映射判定", () => {
    const q = MODEL_TRAINING_QUESTIONS[0],
      concept = atlas.concepts.find((c) => c.id === q.conceptId)!;
    expect(isModelTrainingAnswer(q, concept.elements[0], atlas.concepts)).toBe(
      true,
    );
    expect(isModelTrainingAnswer(q, "not-a-part", atlas.concepts)).toBe(false);
  });
  it("随机组卷不重复且限制题数", () => {
    const sample = shuffledModelQuestions(
      MODEL_TRAINING_QUESTIONS,
      10,
      () => 0.4,
    );
    expect(sample).toHaveLength(10);
    expect(new Set(sample.map((q) => q.id)).size).toBe(10);
  });
  it("每题只准备一个明确的主系统", () => {
    expect(modelTrainingSystem(MODEL_TRAINING_QUESTIONS[0])).toBe("cardiac");
    expect(modelTrainingSystem(MODEL_TRAINING_QUESTIONS[5])).toBe("arterial");
    expect(modelTrainingSystem(MODEL_TRAINING_QUESTIONS[14])).toBe(
      "respiratory",
    );
    expect(modelTrainingSystem(MODEL_TRAINING_QUESTIONS[45])).toBe("nervous");
    expect(modelTrainingSystem(MODEL_TRAINING_QUESTIONS[49])).toBe("urinary");
  });
});
