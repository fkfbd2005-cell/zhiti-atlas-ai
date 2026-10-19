import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Focus,
  RefreshCcw,
  Shuffle,
} from "lucide-react";
import {
  MODEL_TRAINING_QUESTIONS,
  shuffledModelQuestions,
  type ModelTrainingCategory,
  type ModelTrainingQuestion,
} from "./model-training";

export interface ModelTrainingRecord {
  attempts: number;
  correct: boolean;
  lastPartId: string;
}
export function ModelTrainingPanel({
  stored,
  currentId,
  attempt,
  onBack,
  onOpen,
  onCloseQuestion,
}: {
  stored: Record<string, ModelTrainingRecord>;
  currentId: string | null;
  attempt: { correct: boolean; partId: string } | null;
  onBack: () => void;
  onOpen: (question: ModelTrainingQuestion) => void;
  onCloseQuestion: () => void;
}) {
  const [category, setCategory] = useState<ModelTrainingCategory | "全部">(
      "全部",
    ),
    [status, setStatus] = useState<"全部" | "未练" | "错题">("全部"),
    [queue, setQueue] = useState<string[]>([]);
  const filtered = useMemo(
    () =>
      MODEL_TRAINING_QUESTIONS.filter(
        (q) =>
          (category === "全部" || q.category === category) &&
          (status === "全部" || status === "未练"
            ? !stored[q.id]
            : stored[q.id] && !stored[q.id].correct),
      ),
    [category, status, stored],
  );
  const current = MODEL_TRAINING_QUESTIONS.find((q) => q.id === currentId);
  if (current)
    return (
      <>
        <button className="bank-back" onClick={onCloseQuestion}>
          <ArrowLeft size={15} />
          题目列表
        </button>
        <div className="panel-eyebrow">
          <Focus size={15} />
          模型定位训练
        </div>
        <span className="step-kicker">
          {current.category} · {current.id}
        </span>
        <h2 className="question-title">{current.prompt}</h2>
        <div
          className={`model-task ${attempt ? (attempt.correct ? "correct" : "wrong") : ""}`}
        >
          <Focus size={28} />
          <b>
            {attempt
              ? attempt.correct
                ? "定位正确"
                : "这次没有点中目标"
              : "请直接点击中间三维模型"}
          </b>
          <span>
            {attempt
              ? attempt.correct
                ? "已平滑聚焦正确结构，周围部位保留为低透明度参照。"
                : "已标出正确结构，可观察后返回题目列表。"
              : "模型不会自动切换、隐藏或高亮结构；请自行旋转、缩放或筛选系统。"}
          </span>
        </div>
        {attempt && (
          <div className={`feedback ${attempt.correct ? "correct" : "wrong"}`}>
            <b>
              {current.zhName} · {current.atlasName}
            </b>
            <p>{current.explanation}</p>
            <small>
              {current.conceptId} · {current.meshCount} 个映射网格 · 待专业复核
            </small>
          </div>
        )}
        {attempt && (
          <button
            className="wide-next"
            onClick={() => {
              const queueIndex = queue.indexOf(current.id);
              const nextId =
                queueIndex >= 0 ? queue[queueIndex + 1] : undefined;
              if (nextId)
                onOpen(MODEL_TRAINING_QUESTIONS.find((q) => q.id === nextId)!);
              else onCloseQuestion();
            }}
          >
            下一题
            <ArrowRight size={17} />
          </button>
        )}
      </>
    );
  const answered = MODEL_TRAINING_QUESTIONS.filter((q) => stored[q.id]).length,
    correct = MODEL_TRAINING_QUESTIONS.filter(
      (q) => stored[q.id]?.correct,
    ).length,
    wrong = MODEL_TRAINING_QUESTIONS.filter(
      (q) => stored[q.id] && !stored[q.id].correct,
    );
  return (
    <>
      <button className="bank-back" onClick={onBack}>
        <ArrowLeft size={15} />
        返回课内测验
      </button>
      <div className="panel-eyebrow">
        <Focus size={15} />
        模型定位训练
      </div>
      <h2>五十个真实结构</h2>
      <p className="lead-copy">
        独立于课内 18
        题和知识题库。每题按真实网格映射判定；打开题目后保持完整模型，不会自动显示答案。
      </p>
      <div className="bank-stats">
        <div>
          <b>50</b>
          <span>总题数</span>
        </div>
        <div>
          <b>{answered}</b>
          <span>已练</span>
        </div>
        <div>
          <b>{correct}</b>
          <span>答对</span>
        </div>
        <div>
          <b>{wrong.length}</b>
          <span>待重练</span>
        </div>
      </div>
      <div className="training-actions">
        <button
          onClick={() => {
            const next = shuffledModelQuestions(filtered, 10);
            setQueue(next.map((q) => q.id));
            if (next[0]) onOpen(next[0]);
          }}
        >
          <Shuffle size={14} />
          随机 10 题
        </button>
        <button
          disabled={!wrong.length}
          onClick={() => {
            setQueue(wrong.map((q) => q.id));
            if (wrong[0]) onOpen(wrong[0]);
          }}
        >
          <RefreshCcw size={14} />
          错题重练
        </button>
      </div>
      <div className="bank-filter">
        {(
          ["全部", "循环系统", "呼吸系统", "骨骼系统", "综合系统"] as const
        ).map((v) => (
          <button
            key={v}
            className={category === v ? "active" : ""}
            onClick={() => setCategory(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="bank-filter">
        {(["全部", "未练", "错题"] as const).map((v) => (
          <button
            key={v}
            className={status === v ? "active" : ""}
            onClick={() => setStatus(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="bank-list">
        {filtered.map((q, index) => (
          <button
            key={q.id}
            className={`bank-item ${stored[q.id] ? (stored[q.id].correct ? "correct" : "wrong") : ""}`}
            onClick={() => {
              setQueue([q.id]);
              onOpen(q);
            }}
          >
            <span className="bank-item-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="bank-item-body">
              <small>
                {q.category} · {q.conceptId}
              </small>
              <b>
                {q.zhName}
                <em>{q.atlasName}</em>
              </b>
            </span>
            {stored[q.id]?.correct ? (
              <Check size={15} />
            ) : (
              <ArrowRight size={15} />
            )}
          </button>
        ))}
      </div>
    </>
  );
}
