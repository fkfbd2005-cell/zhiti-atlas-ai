import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Focus,
  Library,
} from "lucide-react";
import {
  EXPANDED_QUIZZES,
  EXPANDED_SOURCES,
  QUIZ_GROUPS,
  type ExpandedQuizQuestion,
  type QuizGroupId,
} from "./expanded-quiz";
import { SOURCES } from "./content";

export function QuestionBankPanel({
  stored,
  onAnswer,
  onBack,
  onOpenModel,
  onFocus,
}: {
  stored: Record<string, { answer: string; correct: boolean }>;
  onAnswer: (id: string, answer: string, correct: boolean) => void;
  onBack: () => void;
  onOpenModel: () => void;
  onFocus: (id: string) => void;
}) {
  const [group, setGroup] = useState<QuizGroupId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const questions = useMemo(
    () =>
      group === "all"
        ? EXPANDED_QUIZZES
        : EXPANDED_QUIZZES.filter((q) => q.group === group),
    [group],
  );

  const current = openId
    ? EXPANDED_QUIZZES.find((q) => q.id === openId)
    : undefined;
  if (current)
    return (
      <QuestionCard
        question={current}
        answered={stored[current.id]}
        onAnswer={onAnswer}
        onBack={() => setOpenId(null)}
        onFocus={onFocus}
      />
    );

  const answeredCount = EXPANDED_QUIZZES.filter((q) => stored[q.id]).length;
  const correctCount = EXPANDED_QUIZZES.filter(
    (q) => stored[q.id]?.correct,
  ).length;

  return (
    <>
      <button className="bank-back" onClick={onBack}>
        <ArrowLeft size={15} />
        返回课内测验
      </button>
      <button className="bank-entry model-bank-entry" onClick={onOpenModel}>
        进入 50 道模型定位训练 <Focus size={14} />
      </button>
      <div className="panel-eyebrow">
        <Library size={15} />
        扩展题库
      </div>
      <h2>十个系统，一百道题</h2>
      <p className="lead-copy">
        课内三套测验之外的补充题库，覆盖循环、呼吸、骨骼、肌肉、消化、神经、感觉、泌尿、内分泌与淋巴。全部为知识选择题，每道题都可展开解析与知识来源核对。
      </p>
      <div className="bank-stats">
        <div>
          <b>{EXPANDED_QUIZZES.length}</b>
          <span>道题</span>
        </div>
        <div>
          <b>{QUIZ_GROUPS.length}</b>
          <span>个系统</span>
        </div>
        <div>
          <b>{correctCount}</b>
          <span>答对</span>
        </div>
        <div>
          <b>{answeredCount}</b>
          <span>已作答</span>
        </div>
      </div>
      <div className="bank-filter">
        {QUIZ_GROUPS.map((item) => (
          <button
            key={item.id}
            className={group === item.id ? "active" : ""}
            onClick={() => setGroup(group === item.id ? "all" : item.id)}
          >
            {item.label}
            <small>
              {EXPANDED_QUIZZES.filter((q) => q.group === item.id).length}
            </small>
          </button>
        ))}
      </div>
      <p className="bank-group-note">
        {group === "all"
          ? "全部十个系统 · 按课内顺序与新增系统排列"
          : QUIZ_GROUPS.find((g) => g.id === group)?.blurb}
      </p>
      <div className="bank-list">
        {questions.map((question, index) => {
          const record = stored[question.id];
          return (
            <button
              key={question.id}
              className={`bank-item ${record ? (record.correct ? "correct" : "wrong") : ""}`}
              onClick={() => setOpenId(question.id)}
            >
              <span className="bank-item-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="bank-item-body">
                <small>
                  {QUIZ_GROUPS.find((g) => g.id === question.group)?.label} ·{" "}
                  {question.difficulty}
                </small>
                <b>{question.prompt}</b>
              </span>
              {record ? <Check size={15} /> : <ChevronRight size={15} />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function QuestionCard({
  question,
  answered,
  onAnswer,
  onBack,
  onFocus,
}: {
  question: ExpandedQuizQuestion;
  answered?: { answer: string; correct: boolean };
  onAnswer: (id: string, answer: string, correct: boolean) => void;
  onBack: () => void;
  onFocus: (id: string) => void;
}) {
  const source = EXPANDED_SOURCES[question.source] ?? SOURCES[question.source];
  const group = QUIZ_GROUPS.find((g) => g.id === question.group);
  return (
    <>
      <div className="lesson-top">
        <button onClick={onBack}>
          <ArrowLeft size={16} />
          题库
        </button>
        <span>{group?.label}</span>
      </div>
      <span className="step-kicker">知识选择题 · {question.difficulty}</span>
      <h2 className="question-title">{question.prompt}</h2>
      <div className="options">
        {question.options?.map((option) => (
          <button
            key={option}
            disabled={!!answered}
            className={
              answered
                ? option === question.answer
                  ? "correct"
                  : answered.answer === option
                    ? "wrong"
                    : ""
                : ""
            }
            onClick={() =>
              onAnswer(question.id, option, option === question.answer)
            }
          >
            <span>{option}</span>
            {answered && option === question.answer ? (
              <Check size={17} />
            ) : (
              <i />
            )}
          </button>
        ))}
      </div>
      {answered && (
        <div className={`feedback ${answered.correct ? "correct" : "wrong"}`}>
          <b>{answered.correct ? "回答正确" : "再看一眼结构关系"}</b>
          <p>{question.explanation}</p>
          {source && (
            <small>
              来源：{source.title} · {source.reviewStatus}
            </small>
          )}
        </div>
      )}
      {answered && (
        <button className="wide-next" onClick={onBack}>
          返回题库
          <ArrowRight size={17} />
        </button>
      )}
      {!answered && (
        <p className="bank-hint">
          选择一项即计入题库记录；此处不参与课内测验成绩。
        </p>
      )}
    </>
  );
}
