import {anatomicalName} from './atlas-index.mjs';
import type {DialogueTurn} from './assistant';
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Eye,
  EyeOff,
  Focus,
  Info,
  Layers3,
  Library,
  Menu,
  MessageCircle,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import AnatomyScene, {type CameraNavigation,type CameraPose} from "./scene";
import {
  DEFAULT_VISIBLE,
  SYSTEMS,
  type Atlas,
  type SceneState,
  type SystemId,
} from "./anatomy";
import {
  askAssistant,
  readSessionAIConfig,
  type AIConfig,
  type AssistantReply,
} from "./assistant";
import { AIConfigDialog } from "./ai-config-dialog";
import {
  CORE_CONCEPTS,
  LESSONS,
  QUIZZES,
  SOURCES,
  conceptById,
  isAnswerCorrect,
  resolveFreeClickConcept,
  resolveConcept,
  validateActions,
  type Action,
  type ConceptEntry,
  type Lesson,
  type LessonId,
  type LessonStep,
  type QuizQuestion,
} from "./content";
import { QuestionBankPanel } from "./question-bank";
import { EXPANDED_SOURCES, QUIZ_GROUPS } from "./expanded-quiz";
import {
  ModelTrainingPanel,
  type ModelTrainingRecord,
} from "./model-training-panel";
import {
  MODEL_TRAINING_QUESTIONS,
  isModelTrainingAnswer,
  type ModelTrainingQuestion,
} from "./model-training";

type Mode = "explore" | "guide" | "quiz" | "about";
type ProgressState = {
  lessonStep: Partial<Record<LessonId, number>>;
  quizBest: Partial<Record<LessonId, number>>;
};
const SYSTEM_ZH: Record<SystemId, string> = {
  skeletal: "骨骼",
  muscular: "肌肉",
  arterial: "动脉",
  venous: "静脉",
  nervous: "神经",
  digestive: "消化",
  respiratory: "呼吸",
  urinary: "泌尿",
  reproductive: "生殖",
  lymphatic: "淋巴",
  endocrine: "内分泌",
  integumentary: "体表",
  connective: "结缔组织",
  sensory: "感觉器官",
  cardiac: "心脏",
};
const initialScene: SceneState = {
  explode: 0,
  explodeSelection: [],
  visible: DEFAULT_VISIBLE,
  selected: [],
  isolate: false,
  view: "three-quarter",
  rotate: false,
  reset: 0,
  systemOpacity: {},
};
const emptyReply: AssistantReply = {
  mode: "demo",
  answer: "你可以说“找到心脏”“展示呼吸系统”或“开始骨骼课程”。",
  actions: [],
  citations: [],
  limitations: [],
};
const defaultProgress: ProgressState = { lessonStep: {}, quizBest: {} };
const defaultBank: Record<string, { answer: string; correct: boolean }> = {};

export default function Home() {
  const [atlas, setAtlas] = useState<Atlas | null>(null),
    [scene, setScene] = useState<SceneState>(initialScene),
    [loadProgress, setLoadProgress] = useState(0),
    [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState<Mode>("explore"),
    [leftOpen, setLeftOpen] = useState(false),
    [rightOpen, setRightOpen] = useState(true),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<ConceptEntry | null>(null);
  const [lessonId, setLessonId] = useState<LessonId | null>(null),
    [lessonStep, setLessonStep] = useState(0),
    [quizLesson, setQuizLesson] = useState<LessonId>("circulation"),
    [quizIndex, setQuizIndex] = useState(0),
    [answers, setAnswers] = useState<
      Record<string, { answer: string; correct: boolean }>
    >({});
  const navigation = useRef<CameraNavigation|null>(null);
  const levels = useRef<{scene:SceneState; selected:ConceptEntry|null; rightOpen:boolean; pose?:CameraPose}[]>([]);
  const rememberLevel = () => {
    levels.current.push({scene, selected, rightOpen, pose:navigation.current?.capture()});
  };
  const restoreLevel = () => {
    const parent = levels.current.pop();
    if (!parent) return false;
    setScene(current => ({...parent.scene, reset:current.reset + 1}));
    setSelected(parent.selected);
    setRightOpen(parent.rightOpen);
    if(parent.pose) navigation.current?.restore(parent.pose);
    return true;
  };
  const dialogue = useRef<DialogueTurn[]>([]);
  const [reply, setReply] = useState<AssistantReply>(emptyReply),
    [assistantInput, setAssistantInput] = useState(""),
    [assistantBusy, setAssistantBusy] = useState(false),
    [assistantMode, setAssistantMode] = useState<"demo" | "live" | "off">(
      "demo",
    ),
    [aiConfig, setAIConfig] = useState<AIConfig | null>(null),
    [showAIConfig, setShowAIConfig] = useState(false),
    [aiPrompted, setAIPrompted] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(defaultProgress),
    [showIntro, setShowIntro] = useState(false);
  const assistantRef = useRef<HTMLInputElement>(null);
  const [quizView, setQuizView] = useState<"course" | "knowledge" | "model">(
      "course",
    ),
    [bankAnswers, setBankAnswers] =
      useState<Record<string, { answer: string; correct: boolean }>>(
        defaultBank,
      );
  const [modelAnswers, setModelAnswers] = useState<
      Record<string, ModelTrainingRecord>
    >({}),
    [modelQuestionId, setModelQuestionId] = useState<string | null>(null),
    [modelAttempt, setModelAttempt] = useState<{
      correct: boolean;
      partId: string;
    } | null>(null),
    [explodeHintKey, setExplodeHintKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}models/atlas.json`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("人体模型目录加载失败");
        return r.json();
      })
      .then((data) => setAtlas(data as Atlas))
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(error.message);
      });
    try {
      const saved = localStorage.getItem("zhiti-progress-v1");
      if (saved) setProgress(JSON.parse(saved));
      setShowIntro(localStorage.getItem("zhiti-intro-seen") !== "1");
    } catch {
    }
    const sessionConfig = readSessionAIConfig();
    setAIConfig(sessionConfig);
    setAssistantMode(sessionConfig ? "live" : "demo");
    setAIPrompted(sessionStorage.getItem("zhiti-ai-prompted-v1") === "1");
    return () => controller.abort();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("zhiti-progress-v1", JSON.stringify(progress));
    } catch {
    }
  }, [progress]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zhiti-bank-v1");
      if (saved) setBankAnswers(JSON.parse(saved));
    } catch {
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("zhiti-bank-v1", JSON.stringify(bankAnswers));
    } catch {
    }
  }, [bankAnswers]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zhiti-model-training-v1");
      if (saved) setModelAnswers(JSON.parse(saved));
    } catch {
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "zhiti-model-training-v1",
        JSON.stringify(modelAnswers),
      );
    } catch {
    }
  }, [modelAnswers]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !(event.target instanceof HTMLInputElement)
      ) {
        event.preventDefault();
        assistantRef.current?.focus();
      }
      if (event.key === "Escape" && !event.defaultPrevented && !event.repeat && !event.isComposing) {
        event.preventDefault();
        if (showAIConfig) setShowAIConfig(false);
        else if (showIntro) dismissIntro();
        else backOrCloseRightPanel();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const conceptMap = useMemo(
    () => new Map(atlas?.concepts.map((c) => [c.id, c])),
    [atlas],
  );
  const partMap = useMemo(
    () => new Map(atlas?.parts.map((p) => [p.id, p])),
    [atlas],
  );
  const searchResults = useMemo(() => {
    if (!atlas) return [];
    const q = query.trim().toLowerCase();
    if (!q) return CORE_CONCEPTS.slice(0, 10);
    const core = CORE_CONCEPTS.filter((c) =>
      [c.zh, c.en, c.id, ...c.synonyms].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
    const raw = atlas.concepts
      .filter(
        (c) =>
          anatomicalName(c.name).toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
      )
      .slice(0, 12)
      .map((c) => resolveConcept(atlas, c.id))
      .filter((c): c is ConceptEntry => !!c);
    return [...new Map([...core, ...raw].map((c) => [c.id, c])).values()].slice(
      0,
      16,
    );
  }, [atlas, query]);
  const lesson = LESSONS.find((item) => item.id === lessonId),
    currentStep = lesson?.steps[lessonStep];
  const objective =
    mode === "guide" && currentStep
      ? currentStep.title
      : selected
        ? selected.zh
        : mode === "quiz"
          ? "完成本组定位与知识练习"
          : "建立全身空间地图";
  const quizQuestions = QUIZZES.filter(
      (question) => question.lessonId === quizLesson,
    ),
    question = quizQuestions[quizIndex],
    quizAnswered = question ? answers[question.id] : undefined;
  const quizScore = quizQuestions.filter(
      (item) => answers[item.id]?.correct,
    ).length,
    quizDone = quizQuestions.every((item) => answers[item.id]),
    modelTrainingTargets =
      mode === "quiz" &&
      quizView === "model" &&
      modelQuestionId &&
      !modelAttempt
        ? (conceptMap.get(
            MODEL_TRAINING_QUESTIONS.find(
              (item) => item.id === modelQuestionId,
            )?.conceptId ?? "",
          )?.elements ?? [])
        : [];

  const resetScene = () => {
    levels.current = [];
    setScene((current) => ({
      ...initialScene,
      visible: DEFAULT_VISIBLE,
      reset: current.reset + 1,
    }));
    setSelected(null);
  };
  const cueStructureBreakdown = () =>
    setExplodeHintKey((current) => current + 1);
  const showConcept = (id: string, isolate = true, append = false) => {
    if (!atlas) return;
    const concept = conceptMap.get(id);
    if (!concept) return;
    const entry = conceptById(id) ?? resolveConcept(atlas, id) ?? null;
    setSelected(entry);
    setRightOpen(true);
    setScene((current) => ({
      ...current,
      selected: append
        ? [...new Set([...current.selected, ...concept.elements])]
        : concept.elements,
      explode: 0,
      explodeSelection: [],
      isolate: append ? current.isolate : isolate,
      rotate: false,
      visible:
        entry && !current.visible.includes(entry.system)
          ? [...current.visible, entry.system]
          : current.visible,
      reset: current.reset + 1,
    }));
  };
  const applyActions = (actions: Action[]) => {
    if (!atlas) return;
    const valid = validateActions(atlas, actions);
    if(valid.length) levels.current = [];
    let next = {
      ...scene,
      visible: [...scene.visible],
      selected: [...scene.selected],
      systemOpacity: { ...scene.systemOpacity },
    };
    let nextSelected: ConceptEntry | null = selected;
    for (const action of valid) {
      if (action.type === "resetView") {
        next = {
          ...initialScene,
          visible: [...DEFAULT_VISIBLE],
          systemOpacity: {},
          reset: next.reset + 1,
        };
        nextSelected = null;
        continue;
      }
      if (action.type === "selectSystem") {
        next = {
          ...next,
          visible: [action.system],
          selected: [],
          isolate: false,
          explode: 0,
          reset: next.reset + 1,
        };
        continue;
      }
      if (action.type === "setOpacity") {
        next.systemOpacity = {
          ...next.systemOpacity,
          [action.system]: action.opacity,
        };
        continue;
      }
      if (action.type === "startLesson") {
        setMode("guide");
        setLessonId(action.lessonId);
        setLessonStep(0);
        const first = LESSONS.find((l) => l.id === action.lessonId)?.steps[0];
        if (first) setTimeout(() => applyActions(first.actions), 0);
        continue;
      }
      if (action.type === "compare") {
        const concepts = action.conceptIds
          .map((id) => conceptMap.get(id))
          .filter(Boolean);
        if (concepts.length !== 2) continue;
        const entries = action.conceptIds
          .map((id) => conceptById(id) ?? resolveConcept(atlas, id))
          .filter(Boolean);
        if (entries[0]) nextSelected = entries[0];
        next = {
          ...next,
          selected: [
            ...new Set(concepts.flatMap((concept) => concept!.elements)),
          ],
          isolate: true,
          explode: 0,
          rotate: false,
          reset: next.reset + 1,
        };
        continue;
      }
      const concept = conceptMap.get(action.conceptId);
      if (!concept) continue;
      const entry =
        conceptById(action.conceptId) ??
        resolveConcept(atlas, action.conceptId);
      if (entry) nextSelected = entry;
      if (action.type === "focus")
        next = {
          ...next,
          selected: [...concept.elements],
          isolate: true,
          explode: 0,
          rotate: false,
          reset: next.reset + 1,
        };
      if (action.type === "highlight")
        next = {
          ...next,
          selected: [...new Set([...next.selected, ...concept.elements])],
          rotate: false,
        };
      if (action.type === "setVisibility" && entry)
        next.visible = action.visible
          ? [...new Set([...next.visible, entry.system])]
          : next.visible.filter((s) => s !== entry.system);
    }
    setScene(next);
    setSelected(nextSelected);
    setRightOpen(true);
  };
  const openLesson = (id: LessonId, index = 0) => {
    const next = LESSONS.find((item) => item.id === id);
    if (!next) return;
    setMode("guide");
    setLessonId(id);
    setLessonStep(index);
    setRightOpen(true);
    applyActions(next.steps[index].actions);
  };
  const changeLessonStep = (index: number) => {
    if (!lesson) return;
    const bounded = Math.max(0, Math.min(index, lesson.steps.length - 1));
    setLessonStep(bounded);
    setProgress((current) => ({
      ...current,
      lessonStep: {
        ...current.lessonStep,
        [lesson.id]: Math.max(current.lessonStep[lesson.id] ?? 0, bounded + 1),
      },
    }));
    applyActions(lesson.steps[bounded].actions);
  };
  const choosePart = (partId: string) => {
    if (!atlas) return;
    if (
      mode === "quiz" &&
      quizView === "model" &&
      modelQuestionId &&
      !modelAttempt
    ) {
      const target = MODEL_TRAINING_QUESTIONS.find(
        (q) => q.id === modelQuestionId,
      );
      if (target) {
        const correct = isModelTrainingAnswer(target, partId, atlas.concepts);
        setModelAttempt({ correct, partId });
        setModelAnswers((current) => ({
          ...current,
          [target.id]: {
            attempts: (current[target.id]?.attempts ?? 0) + 1,
            correct,
            lastPartId: partId,
          },
        }));
        const concept = conceptMap.get(target.conceptId);
        if (concept)
          setScene((current) => ({
            ...current,
            selected: [...concept.elements],
            isolate: correct,
            rotate: false,
            reset: current.reset + 1,
          }));
        if (correct) cueStructureBreakdown();
        return;
      }
    }
    if (
      mode === "quiz" &&
      quizView === "course" &&
      question?.type === "model" &&
      !quizAnswered
    ) {
      submitQuiz(partId);
      return;
    }
    const part = partMap.get(partId);
    if (!part) return;
    if (scene.explode > 0.1) rememberLevel();
    const core = scene.explode > 0.1 ? undefined : resolveFreeClickConcept(atlas, partId);
    setSelected(
      core ?? {
        id: part.conceptId,
        zh: anatomicalName(part.name),
        en: part.name,
        system: part.system,
        synonyms: [],
        summary: "该结构对应 BodyParts3D 解剖模型。",
        source: "atlas",
      },
    );
    setScene((current) => ({
      ...current,
      selected: core ? (conceptMap.get(core.id)?.elements ?? [partId]) : [partId],
      isolate: true,
      explode: 0,
      explodeSelection: [],
      rotate: false,
      reset: current.reset + 1,
    }));
    cueStructureBreakdown();
    setRightOpen(true);
  };
  const openModelQuestion = (target: ModelTrainingQuestion) => {
    if (!atlas) return;
    if (!conceptMap.has(target.conceptId)) return;
    setModelQuestionId(target.id);
    setModelAttempt(null);
    resetScene();
  };
  const selectSearch = (entry: ConceptEntry) => {
    levels.current = [];
    showConcept(entry.id, true);
    setQuery("");
    setLeftOpen(false);
  };
  const submitQuiz = (answer: string) => {
    if (!question || quizAnswered) return;
    const correct = isAnswerCorrect(question, answer, atlas ?? undefined);
    setAnswers((current) => ({
      ...current,
      [question.id]: { answer, correct },
    }));
    if (question.type === "model" && question.conceptId)
      showConcept(question.conceptId, false);
  };
  const nextQuiz = () => {
    if (quizIndex < quizQuestions.length - 1)
      setQuizIndex((index) => index + 1);
    else
      setProgress((current) => ({
        ...current,
        quizBest: {
          ...current.quizBest,
          [quizLesson]: Math.max(current.quizBest[quizLesson] ?? 0, quizScore),
        },
      }));
  };
  const restartQuiz = () => {
    setAnswers((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([id]) => !quizQuestions.some((question) => question.id === id),
        ),
      ),
    );
    setQuizIndex(0);
    resetScene();
  };
  const submitAssistant = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const message = assistantInput.trim();
    if (!message || assistantBusy) return;
    if (!aiConfig && !aiPrompted) {
      setAIPrompted(true);
      sessionStorage.setItem("zhiti-ai-prompted-v1", "1");
      setShowAIConfig(true);
      return;
    }
    setAssistantBusy(true);
    setAssistantInput("");
    const previous = dialogue.current;
    const response = await askAssistant(message, aiConfig, atlas, previous);
    if (previous !== dialogue.current) { setAssistantBusy(false); return; }
    if (response.mode === "live" && response.contextual) {
      dialogue.current = [...previous, {question: message, answer: response.answer}].slice(-4);
    }
    setReply(response);
    setAssistantMode(aiConfig && !response.error ? "live" : response.mode);
    applyActions(response.actions);
    setAssistantBusy(false);
  };
  const dismissIntro = () => {
    setShowIntro(false);
    try {
      localStorage.setItem("zhiti-intro-seen", "1");
    } catch {
    }
  };
  const backOrCloseRightPanel = () => {
    if (restoreLevel()) return;
    if (mode === "explore" && selected) {
      resetScene();
      return;
    }
    if (mode === "guide" && lessonId) {
      setLessonId(null);
      resetScene();
      return;
    }
    if (mode === "quiz" && quizView !== "course") {
      setQuizView("course");
      setModelQuestionId(null);
      resetScene();
      return;
    }
    if (mode === "about") {
      setMode("explore");
      return;
    }
    setRightOpen(false);
  };

  return (
    <main className={`zhiti-app mode-${mode}`}>
      {atlas && (
        <AnatomyScene
          navigation={navigation}
          atlas={atlas}
          state={{ ...scene, inspectorOpen: rightOpen }}
          preferredSelection={modelTrainingTargets}
          onSelect={choosePart}
          onProgress={setLoadProgress}
          onError={setLoadError}
        />
      )}
      <div className="stage-grid" />
      <div className="stage-vignette" />
      <header className="app-header">
        <button
          className="brand identity"
          onClick={() => setMode("explore")}
          aria-label="返回自由探索"
        >
          <span className="brand-mark">知</span>
          <span>
            <b>知体</b>
            <small>ATLAS AI</small>
          </span>
        </button>
        <nav className="main-nav" aria-label="主导航">
          {[
            { id: "explore", label: "自由探索", icon: Compass },
            { id: "guide", label: "AI 导学", icon: BookOpen },
            { id: "quiz", label: "解剖测验", icon: Trophy },
            { id: "knowledge", label: "知识题库", icon: Library },
            { id: "model", label: "定位训练", icon: Focus },
            { id: "about", label: "关于与来源", icon: Info },
          ].map((item) => (
            <button
              key={item.id}
              aria-current={
                item.id === "knowledge" || item.id === "model"
                  ? mode === "quiz" && quizView === item.id
                    ? "page"
                    : undefined
                  : mode === item.id &&
                      (item.id !== "quiz" || quizView === "course")
                    ? "page"
                    : undefined
              }
              onClick={() => {
                levels.current = [];
                if (item.id === "knowledge" || item.id === "model") {
                  setMode("quiz");
                  setQuizView(item.id);
                  setModelQuestionId(null);
                  setModelAttempt(null);
                  resetScene();
                } else {
                  setMode(item.id as Mode);
                  if (item.id === "quiz") setQuizView("course");
                  if (item.id === "guide" && !aiConfig && !aiPrompted) {
                    setAIPrompted(true);
                    sessionStorage.setItem("zhiti-ai-prompted-v1", "1");
                    setShowAIConfig(true);
                  }
                }
                setRightOpen(true);
              }}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          className={`mode-pill ${assistantMode}`}
          onClick={() => setShowAIConfig(true)}
          aria-label="AI API 配置"
        >
          <i />
          {assistantMode === "live" ? "实时 AI" : "演示模式"}
          <span>
            {assistantMode === "live"
              ? "会话配置 · 可修改"
              : aiConfig
                ? "连接失败 · 点击检查"
                : "点击配置 API"}
          </span>
        </button>
      </header>
      <button
        className="mobile-panel-button left"
        onClick={() => setLeftOpen(true)}
        aria-label="打开结构控制"
      >
        <Menu size={19} />
      </button>
      <button
        className="mobile-panel-button right"
        onClick={() => setRightOpen(true)}
        aria-label="打开学习面板"
      >
        <BookOpen size={19} />
      </button>
      <div className="learning-hud glass" aria-live="polite">
        <span>
          {mode === "guide" ? "当前步骤" : selected ? "当前目标" : "学习目标"}
        </span>
        <b>{objective}</b>
        {mode !== "guide" && (
          <button
            onClick={() => {
              setMode("guide");
              setRightOpen(true);
            }}
          >
            专注学习
          </button>
        )}
      </div>
      <aside
        className={`left-panel glass ${leftOpen ? "open" : ""}`}
        aria-label="结构控制"
      >
        <div className="panel-title">
          <div>
            <span>探索控制台</span>
            <small>真实模型索引</small>
          </div>
          <button
            className="icon-btn mobile-only"
            onClick={() => setLeftOpen(false)}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>
        <label className="search-box">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索心脏 / heart / FMA…"
            aria-label="搜索结构"
          />
        </label>
        {query && (
          <div className="search-results" role="listbox">
            {searchResults.length ? (
              searchResults.map((entry) => (
                <button key={entry.id} onClick={() => selectSearch(entry)}>
                  <span>
                    <b>{entry.zh}</b>
                    <small>{entry.en}</small>
                  </span>
                  <em>{entry.id}</em>
                </button>
              ))
            ) : (
              <p>未找到可验证结构。不会自动映射到相似器官。</p>
            )}
          </div>
        )}
        <div className="section-head">
          <span>解剖系统</span>
          <button
            onClick={() =>
              setScene((current) => ({
                ...current,
                visible: [...DEFAULT_VISIBLE],
                isolate: false,
                selected: [],
              }))
            }
          >
            显示全部
          </button>
        </div>
        <div className="systems-list">
          {SYSTEMS.map((system) => {
            const active = scene.visible.includes(system.id);
            return (
              <button
                key={system.id}
                aria-pressed={active}
                onClick={() =>
                  setScene((current) => ({
                    ...current,
                    visible: active
                      ? current.visible.filter((id) => id !== system.id)
                      : [...current.visible, system.id],
                    selected: [],
                    isolate: false,
                  }))
                }
              >
                <i style={{ background: system.color }} />
                <span>
                  {SYSTEM_ZH[system.id]}
                  <small>{system.name}</small>
                </span>
                {active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            );
          })}
        </div>
        <div className="panel-actions">
          <button
            key={`structure-breakdown-${explodeHintKey}`}
            className={explodeHintKey ? "explode-hint" : undefined}
            onClick={() => {
              if (scene.explode > 0.1 && restoreLevel()) return;
              if (scene.explode <= 0.1) rememberLevel();
              setScene(current => ({
                ...current,
                explode: current.explode > 0.1 ? 0 : 1,
                explodeSelection: current.explode > 0.1 ? [] : [...current.selected],
                view: current.explode > 0.1 ? current.view : "front",
              }));
            }}
          >
            <Layers3 size={16} />
            {scene.explode > 0.1
              ? "还原装配"
              : scene.selected.length
                ? "拆解当前部位"
                : "结构拆解"}
          </button>
          <button onClick={resetScene}>
            <RotateCcw size={16} />
            复位
          </button>
        </div>
      </aside>
      <div className="camera-tools glass" aria-label="视角控制">
        <button
          aria-label="正面视角"
          onClick={() =>
            setScene((current) => ({
              ...current,
              view: "front",
              reset: current.reset + 1,
            }))
          }
        >
          正
        </button>
        <button
          aria-label="侧面视角"
          onClick={() =>
            setScene((current) => ({
              ...current,
              view: "side",
              reset: current.reset + 1,
            }))
          }
        >
          侧
        </button>
        <button
          aria-label="三分之四视角"
          onClick={() =>
            setScene((current) => ({
              ...current,
              view: "three-quarter",
              reset: current.reset + 1,
            }))
          }
        >
          ¾
        </button>
        <span />
        <button aria-label="复位模型" onClick={resetScene}>
          <RotateCcw size={16} />
        </button>
      </div>
      <aside
        className={`right-panel detail-sheet glass ${rightOpen ? "open" : ""}`}
        aria-label="学习面板"
      >
        <button
          className="icon-btn close-panel"
          onClick={backOrCloseRightPanel}
          aria-label="返回上一级或关闭学习面板"
        >
          <X size={18} />
        </button>
        {mode === "explore" && (
          <ExplorePanel
            selected={selected}
            atlas={atlas}
            scene={scene}
            onFocus={(id) => showConcept(id, true)}
            onClear={() => {
              levels.current = [];
              setSelected(null);
              setScene((current) => ({
                ...current,
                selected: [],
                isolate: false,
              }));
            }}
          />
        )}
        {mode === "guide" && (
          <GuidePanel
            lesson={lesson}
            step={currentStep}
            stepIndex={lessonStep}
            onOpen={openLesson}
            onList={() => setLessonId(null)}
            onStep={changeLessonStep}
            onQuiz={(id) => {
              setMode("quiz");
              setQuizView("course");
              setQuizLesson(id);
              setQuizIndex(0);
            }}
          />
        )}
        {mode === "quiz" && quizView === "course" && (
          <QuizPanel
            lessonId={quizLesson}
            question={question}
            index={quizIndex}
            total={quizQuestions.length}
            answered={quizAnswered}
            score={quizScore}
            done={quizDone}
            best={progress.quizBest[quizLesson] ?? 0}
            onLesson={(id) => {
              setQuizLesson(id);
              setQuizIndex(0);
            }}
            onAnswer={submitQuiz}
            onNext={nextQuiz}
            onRestart={restartQuiz}
            onFocus={(id) => showConcept(id, false)}
            onOpenBank={() => setQuizView("knowledge")}
          />
        )}
        {mode === "quiz" && quizView === "knowledge" && (
          <QuestionBankPanel
            stored={bankAnswers}
            onAnswer={(id, answer, correct) =>
              setBankAnswers((current) => ({
                ...current,
                [id]: { answer, correct },
              }))
            }
            onBack={() => setQuizView("course")}
            onOpenModel={() => {
              setQuizView("model");
              setModelQuestionId(null);
              setModelAttempt(null);
            }}
            onFocus={() => {}}
          />
        )}
        {mode === "quiz" && quizView === "model" && (
          <ModelTrainingPanel
            stored={modelAnswers}
            currentId={modelQuestionId}
            attempt={modelAttempt}
            onBack={() => {
              setQuizView("course");
              setModelQuestionId(null);
              resetScene();
            }}
            onOpen={openModelQuestion}
            onCloseQuestion={() => {
              setModelQuestionId(null);
              setModelAttempt(null);
              resetScene();
            }}
          />
        )}{" "}
        {mode === "about" && <AboutPanel />}
      </aside>
      <form className="assistant-bar glass" onSubmit={submitAssistant}>
        <span className="assistant-icon">
          <Sparkles size={18} />
        </span>
        <div className="assistant-copy">
          <small>
            {assistantBusy
              ? "正在解析安全动作…"
              : reply.mode === "live" || assistantMode === "live"
                ? `实时 AI 导学 · ${aiConfig?.model ?? "已连接"}`
                : "演示模式 · 规则引擎，非实时 AI"}
          </small>
          <input
            ref={assistantRef}
            value={assistantInput}
            onChange={(event) => setAssistantInput(event.target.value)}
            onFocus={() => {
              if (!aiConfig && !aiPrompted) {
                setAIPrompted(true);
                sessionStorage.setItem("zhiti-ai-prompted-v1", "1");
                setShowAIConfig(true);
              }
            }}
            placeholder="输入学习目标，例如：找到心脏并讲解"
            maxLength={400}
            aria-label="向导学助手提问"
          />
        </div>
        <button
          type="submit"
          disabled={!assistantInput.trim() || assistantBusy}
          aria-label="发送"
        >
          <Send size={18} />
        </button>
      </form>
      {reply.answer && (
        <div className="assistant-toast glass" role="status">
          <MessageCircle size={16} />
          <div>
            <b>{reply.answer}</b>
            {reply.citations.map((source,index) => (
              <small key={index}>参考来源 · <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></small>
            ))}
            {reply.limitations.map((item) => (
              <small key={item}>{item}</small>
            ))}
          </div>
          <button
            onClick={() => setReply({ ...reply, answer: "" })}
            aria-label="关闭回答"
          >
            <X size={15} />
          </button>
        </div>
      )}
      <footer className="legal-strip">
        仅供解剖学教育参考，不用于诊断、治疗或手术决策 <span>·</span>{" "}
        BodyParts3D 4.0 · CC BY 4.0
      </footer>
      <AIConfigDialog
        open={showAIConfig}
        current={aiConfig}
        onClose={() => setShowAIConfig(false)}
        onSaved={(config) => {
          dialogue.current = [];
          setAIConfig(config);
          setAssistantMode("live");
          setReply({
            ...emptyReply,
            mode: "live",
            answer: `已连接 ${config.model}。现在可以进行解剖学问答和自然语言模型控制。`,
          });
        }}
        onCleared={() => {
          dialogue.current = [];
          setAIConfig(null);
          setAssistantMode("demo");
          setAIPrompted(false);
          setReply({
            ...emptyReply,
            answer: "AI 配置已清除，已切换回离线演示模式。",
          });
        }}
      />
      {loadProgress < 100 && !loadError && (
        <div className="loading-card glass" role="status">
          <div className="pulse-ring" />
          <div>
            <b>正在装配人体模型</b>
            <span>{loadProgress}% · 载入 2,234 个真实网格</span>
            <i>
              <em style={{ width: `${loadProgress}%` }} />
            </i>
          </div>
        </div>
      )}
      {loadError && (
        <div className="loading-card error-card" role="alert">
          <CircleHelp />
          <div>
            <b>三维视图无法启动</b>
            <span>{loadError}</span>
            <button onClick={() => location.reload()}>重新加载</button>
          </div>
        </div>
      )}
      {showIntro && (
        <div className="intro-backdrop">
          <section
            className="intro-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-title"
          >
            <span className="intro-kicker">30 秒上手</span>
            <h2 id="intro-title">把人体当作一张可探索的地图</h2>
            <div className="intro-steps">
              <div>
                <b>01</b>
                <span>
                  <MouseGesture />
                  拖动旋转，滚轮或双指缩放
                </span>
              </div>
              <div>
                <b>02</b>
                <span>
                  <Search size={19} />
                  搜索中文名或原始 FMA ID
                </span>
              </div>
              <div>
                <b>03</b>
                <span>
                  <Sparkles size={19} />
                  用自然语言驱动安全的模型动作
                </span>
              </div>
            </div>
            <button onClick={dismissIntro}>
              开始探索 <ArrowRight size={17} />
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

function MouseGesture() {
  return (
    <span className="mouse-glyph" aria-hidden="true">
      <i />
    </span>
  );
}

function ExplorePanel({
  selected,
  atlas,
  scene,
  onFocus,
  onClear,
}: {
  selected: ConceptEntry | null;
  atlas: Atlas | null;
  scene: SceneState;
  onFocus: (id: string) => void;
  onClear: () => void;
}) {
  const concept =
      selected && atlas?.concepts.find((item) => item.id === selected.id),
    source = selected ? SOURCES[selected.source] : undefined;
  return (
    <>
      {selected ? (
        <>
          <div className="panel-eyebrow">
            <span
              style={{
                background: SYSTEMS.find((s) => s.id === selected.system)
                  ?.color,
              }}
            />
            已验证模型映射
          </div>
          <h2>{selected.zh}</h2>
          <p className="latin">{selected.zh === selected.en ? "暂无中文译名 · 保留英文原名" : selected.en}</p>
          <p className="lead-copy">{selected.summary}</p>
          <div className="mapping-card">
            <div>
              <span>概念 ID</span>
              <b>{selected.id}</b>
            </div>
            <div>
              <span>对应网格</span>
              <b>{concept?.elements.length ?? 1} 个</b>
            </div>
            <div>
              <span>所属系统</span>
              <b>{SYSTEM_ZH[selected.system]}</b>
            </div>
          </div>
          <div className="selection-actions">
            <button className="primary" onClick={() => onFocus(selected.id)}>
              <Focus size={17} />
              {scene.isolate ? "重新聚焦" : "单独观察"}
            </button>
            <button onClick={onClear}>清除选择</button>
          </div>
          {source && (
            <a
              className="source-card"
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <small>知识来源 · {source.reviewStatus}</small>
                <b>{source.title}</b>
              </span>
              <ArrowRight size={16} />
            </a>
          )}
        </>
      ) : (
        <>
          <div className="panel-eyebrow">
            <Compass size={15} />
            自由探索
          </div>
          <h2>从一个结构开始</h2>
          <p className="lead-copy">
            点击人体、使用左侧中文搜索，或让底部导学助手直接带你定位。每个结果都会显示原始概念
            ID 和模型映射状态。
          </p>
          <div className="quick-grid">
            {CORE_CONCEPTS.slice(0, 6).map((item) => (
              <button key={item.id} onClick={() => onFocus(item.id)}>
                <span>{item.zh}</span>
                <small>{item.id}</small>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
          <div className="truth-note">
            <Check size={16} />
            <p>
              <span>找不到可验证网格时，知体会明确说明模型边界。</span>
            </p>
          </div>
        </>
      )}
    </>
  );
}

function GuidePanel({
  lesson,
  step,
  stepIndex,
  onOpen,
  onList,
  onStep,
  onQuiz,
}: {
  lesson: Lesson | undefined;
  step: LessonStep | undefined;
  stepIndex: number;
  onOpen: (id: LessonId, index?: number) => void;
  onList: () => void;
  onStep: (index: number) => void;
  onQuiz: (id: LessonId) => void;
}) {
  if (!lesson || !step)
    return (
      <>
        <div className="panel-eyebrow">
          <Sparkles size={15} />
          情境导学
        </div>
        <p className="lead-copy">
          三门课程共 18
          个有效步骤。每一步都驱动真实模型动作，并标记来源与几何覆盖边界。
        </p>
        <div className="course-list">
          {LESSONS.map((item) => (
            <button
              key={item.id}
              onClick={() => onOpen(item.id)}
              style={{ "--course": item.accent } as React.CSSProperties}
            >
              <i />
              <span>
                <small>
                  {item.steps.length} 步 · {item.duration}
                </small>
                <b>{item.title}</b>
                <em>{item.subtitle}</em>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </>
    );
  const source = SOURCES[step.source];
  return (
    <>
      <div className="lesson-top">
        <button onClick={onList}>
          <ArrowLeft size={16} />
          全部课程
        </button>
        <span>
          {stepIndex + 1} / {lesson.steps.length}
        </span>
      </div>
      <div className="lesson-progress">
        {lesson.steps.map((_, index) => (
          <i key={index} className={index <= stepIndex ? "active" : ""} />
        ))}
      </div>
      <span className="step-kicker">{step.eyebrow}</span>
      <h2>{step.title}</h2>
      <p className="lead-copy lesson-copy">{step.body}</p>
      <div className={`mapping-status ${step.mapping}`}>
        <span>
          {step.mapping === "verified" ? (
            <Check size={15} />
          ) : (
            <Info size={15} />
          )}
        </span>
        <p>
          <b>
            {step.mapping === "verified"
              ? "已核对真实模型映射"
              : "教学示意 · 无独立网格"}
          </b>
          <small>{step.conceptId ?? step.note}</small>
        </p>
      </div>
      {step.note && step.conceptId && <p className="step-note">{step.note}</p>}
      <a
        className="source-card"
        href={source.url}
        target="_blank"
        rel="noreferrer"
      >
        <span>
          <small>本步知识来源 · {source.reviewStatus}</small>
          <b>{source.title}</b>
        </span>
        <ArrowRight size={16} />
      </a>
      <div className="lesson-nav">
        <button
          disabled={stepIndex === 0}
          onClick={() => onStep(stepIndex - 1)}
        >
          <ArrowLeft size={16} />
          上一步
        </button>
        {stepIndex < lesson.steps.length - 1 ? (
          <button className="primary" onClick={() => onStep(stepIndex + 1)}>
            下一步
            <ArrowRight size={16} />
          </button>
        ) : (
          <button className="primary" onClick={() => onQuiz(lesson.id)}>
            进入检测
            <Trophy size={16} />
          </button>
        )}
      </div>
    </>
  );
}

function QuizPanel({
  lessonId,
  question,
  index,
  total,
  answered,
  score,
  done,
  best,
  onLesson,
  onAnswer,
  onNext,
  onRestart,
  onFocus,
  onOpenBank,
}: {
  lessonId: LessonId;
  question: QuizQuestion;
  index: number;
  total: number;
  answered?: { answer: string; correct: boolean };
  score: number;
  done: boolean;
  best: number;
  onLesson: (id: LessonId) => void;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onRestart: () => void;
  onFocus: (id: string) => void;
  onOpenBank: () => void;
}) {
  if (done && index === total - 1 && answered)
    return (
      <>
        <div className="score-orbit">
          <Trophy size={28} />
          <b>
            {score}
            <small>/ {total}</small>
          </b>
        </div>
        <div className="panel-eyebrow">本次完成</div>
        <h2>
          {score === total
            ? "全对，空间地图已建立"
            : score >= 4
              ? "基础路径已经掌握"
              : "回到课程再走一遍"}
        </h2>
        <p className="lead-copy">
          成绩按明确答案规则计算，不代表长期掌握度或医学能力。历史最佳：{best}/
          {total}。
        </p>
        <div className="lesson-nav">
          <button
            onClick={() =>
              onFocus(
                LESSONS.find((l) => l.id === lessonId)?.steps[1].conceptId ??
                  "FMA7088",
              )
            }
          >
            回到模型
          </button>
          <button className="primary" onClick={onRestart}>
            重新开始
            <RotateCcw size={16} />
          </button>
        </div>
      </>
    );
  return (
    <>
      <div className="quiz-tabs">
        {LESSONS.map((item) => (
          <button
            key={item.id}
            className={lessonId === item.id ? "active" : ""}
            onClick={() => onLesson(item.id)}
          >
            {item.id === "circulation"
              ? "循环"
              : item.id === "respiratory"
                ? "呼吸"
                : "骨骼"}
          </button>
        ))}
      </div>
      <button className="bank-entry" onClick={onOpenBank}>
        扩展到 100 题题库
        <ChevronRight size={14} />
      </button>
      <div className="quiz-meta">
        <span>
          题目 {index + 1}/{total}
        </span>
        <span>当前 {score} 分</span>
      </div>
      <div className="quiz-bar">
        <i
          style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }}
        />
      </div>
      <span className="step-kicker">
        {question.type === "model" ? "模型点选题" : "知识选择题"} ·{" "}
        {question.difficulty}
      </span>
      <h2 className="question-title">{question.prompt}</h2>
      {question.type === "model" ? (
        <div
          className={`model-task ${answered ? (answered.correct ? "correct" : "wrong") : ""}`}
        >
          <Focus size={28} />
          <b>
            {answered
              ? answered.correct
                ? "定位正确"
                : "这次没有点中目标"
              : "直接点击中间三维人体作答"}
          </b>
          <span>
            {answered
              ? question.explanation
              : "你仍可旋转、缩放模型；系统不会用相似器官代替答案。"}
          </span>
        </div>
      ) : (
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
              onClick={() => onAnswer(option)}
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
      )}
      {answered && (
        <div className={`feedback ${answered.correct ? "correct" : "wrong"}`}>
          <b>{answered.correct ? "回答正确" : "再看一眼模型关系"}</b>
          <p>{question.explanation}</p>
          <small>来源：{SOURCES[question.source].title} · 待专业复核</small>
        </div>
      )}
      {answered && (
        <button className="wide-next" onClick={onNext}>
          {index < total - 1 ? "下一题" : "查看成绩"}
          <ArrowRight size={17} />
        </button>
      )}
    </>
  );
}

function AboutPanel() {
  const bankSources = useMemo(() => {
    const seen = new Set<string>();
    return Object.entries(EXPANDED_SOURCES)
      .filter(([, source]) => {
        const key = source.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(([key, source]) => ({ key, source }));
  }, []);
  return (
    <>
      <div className="panel-eyebrow">
        <Info size={15} />
        关于与来源
      </div>
      <p className="lead-copy">
        知体是面向解剖学初学者的教育工具，不用于诊断、治疗、手术规划或替代教材。
      </p>
      <div className="about-block">
        <span>01 · 模型与代码</span>
        <h3>Human Atlas × BodyParts3D 4.0</h3>
        <p>
          三维渲染与人体数据基于
          ashemag/human-atlas。应用层交互、中文课程、动作协议、测验与安全后端为本项目新增。原代码保留
          MIT 许可；人体数据按 CC BY 4.0 署名。
        </p>
        <a
          href="https://github.com/ashemag/human-atlas"
          target="_blank"
          rel="noreferrer"
        >
          查看上游仓库 <ArrowRight size={15} />
        </a>
      </div>
      <div className="about-block">
        <span>02 · 模型范围</span>
        <h3>成年男性参考解剖，不代表所有人体</h3>
        <p>
          模型包含 2,234 个源网格和 3,432
          个命名概念。命名概念可能对应多个网格；肺泡等微观结构没有可独立展示的几何体。
        </p>
      </div>
      <div className="about-block">
        <span>03 · 测验体系</span>
        <h3>课内 18 题 + 知识题 100 题 + 模型定位 50 题</h3>
        <p>
          三套题库独立计数并分别保存进度。模型定位训练依据真实 Part.id 与
          Concept.elements 映射判定；医学解释与视觉抽测状态如实标记。
        </p>
      </div>
      <div className="source-stack">
        {Object.values(SOURCES).map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            <span>
              <small>
                {source.reviewStatus} · 访问于 {source.accessedAt}
              </small>
              <b>{source.title}</b>
            </span>
            <ArrowRight size={15} />
          </a>
        ))}
      </div>
      <details className="source-fold">
        <summary>
          扩展题库知识来源 · {bankSources.length} 条{" "}
          <small>OpenStax A&P 2e</small>
        </summary>
        <p className="source-fold-note">
          按系统覆盖：{QUIZ_GROUPS.map((g) => g.label).join("、")}
          。全部条目访问于 {bankSources[0]?.source.accessedAt ?? "2026-10-18"}
          ，当前审核状态为待专业复核。
        </p>
        <div className="source-stack">
          {bankSources.map(({ key, source }) => (
            <a key={key} href={source.url} target="_blank" rel="noreferrer">
              <span>
                <small>{source.reviewStatus}</small>
                <b>
                  {source.title.replace(
                    "OpenStax Anatomy & Physiology 2e · ",
                    "",
                  )}
                </b>
              </span>
              <ArrowRight size={15} />
            </a>
          ))}
        </div>
      </details>
      <div className="license-note">
        <b>署名与修改说明</b>
        <p>
          BodyParts3D © The Database Center for Life Science，CC BY
          4.0。几何已由上游完成坐标转换、简化与浏览器打包；知体新增中文审校词表、教学映射和界面层。完整内容见
          public/ATTRIBUTION.md 与 THIRD_PARTY_NOTICES.md。
        </p>
      </div>
    </>
  );
}
