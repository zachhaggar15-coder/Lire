"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BackButton from "@/components/BackButton";
import {
  STRUCTURE_REFERENCES,
  VERB_REFERENCES,
  buildGrammarDashboard,
  buildStructureDashboard,
  currentUnlockedLesson,
  currentUnlockedStructureLesson,
  getGrammarPracticeEvents,
  getGrammarProgress,
  getLessonProgress,
  getStructureLessons,
  getVerbLessons,
  isGrammarAnswerCorrect,
  markGrammarLessonComplete,
  practiceSetForLesson,
  recordGrammarAnswer,
  referenceForStructureTopic,
  referenceForVerb,
  tenseLabel,
  type GrammarDashboard,
  type GrammarDomain,
  type GrammarLesson,
  type GrammarPracticeQuestion,
  type GrammarProgressRecord,
  type StructureLesson,
  type StructureReference,
  type VerbLesson,
  type VerbReference,
  type VerbTense,
} from "@/lib/grammar";
import { recordGrammarPracticeXp, evaluateAndUnlockAchievements } from "@/lib/gamification";
import { trackEvent } from "@/lib/analytics/client";
import { toPercent } from "@/lib/format";
import { updateValidationState } from "@/lib/validation/state";

type Tab = "learn" | "practice" | "reference";

const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "reference", label: "Reference" },
];

const TRACKS: { id: GrammarDomain; label: string }[] = [
  { id: "verbs", label: "Verbs" },
  { id: "sentence-grammar", label: "Sentence Grammar" },
];

const TRACK_META: Record<GrammarDomain, { title: string; subtitle: string; pathLabel: string }> = {
  verbs: {
    title: "Verb conjugation",
    subtitle: "Practise one verb pattern at a time.",
    pathLabel: "Verbs path",
  },
  "sentence-grammar": {
    title: "Sentence grammar",
    subtitle: "Practise one sentence pattern at a time.",
    pathLabel: "Sentence Grammar path",
  },
};

const ALL_TENSES: VerbTense[] = [
  "present",
  "passe-compose",
  "imparfait",
  "futur-simple",
  "conditionnel",
  "subjonctif-present",
  "subjonctif-passe",
  "plus-que-parfait",
  "passe-simple",
  "conditionnel-passe",
  "futur-anterieur",
];

export default function GrammarPage() {
  const [track, setTrack] = useState<GrammarDomain>("verbs");
  const [tab, setTab] = useState<Tab>("practice");
  const [progress, setProgress] = useState<GrammarProgressRecord[]>([]);
  const [dashboard, setDashboard] = useState<GrammarDashboard>(() => buildGrammarDashboard([], []));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xpNotice, setXpNotice] = useState<string | null>(null);
  const [referenceVerb, setReferenceVerb] = useState(VERB_REFERENCES[0].infinitive);
  const [referenceTense, setReferenceTense] = useState<VerbTense>("present");
  const [referenceTopicId, setReferenceTopicId] = useState(STRUCTURE_REFERENCES[0]?.id ?? "");
  const grammarSessionCompleted = useRef(false);
  const xpNoticeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lessons: GrammarLesson[] = track === "verbs" ? getVerbLessons() : getStructureLessons();
  const currentLesson: GrammarLesson = track === "verbs" ? currentUnlockedLesson(progress) : currentUnlockedStructureLesson(progress);
  const currentProgress = progress.find((record) => record.lessonId === currentLesson.id) ?? getLessonProgress(currentLesson.id);
  const questions = practiceSetForLesson(currentLesson.id);
  const currentQuestion = questions[questionIndex] ?? questions[0];
  const verbReference = referenceForVerb(referenceVerb) ?? VERB_REFERENCES[0];
  const structureReference = referenceForStructureTopic(referenceTopicId) ?? STRUCTURE_REFERENCES[0] ?? null;
  const currentLessonNumber = lessons.findIndex((lesson) => lesson.id === currentLesson.id) + 1;
  const meta = TRACK_META[track];

  function refresh() {
    const nextProgress = getGrammarProgress();
    setProgress(nextProgress);
    const events = getGrammarPracticeEvents();
    setDashboard(track === "verbs" ? buildGrammarDashboard(nextProgress, events) : buildStructureDashboard(nextProgress, events));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setSessionCorrect(0);
    setSessionAnswered(0);
    setStreak(0);
  }, [currentLesson.id]);

  useEffect(() => {
    return () => {
      if (xpNoticeTimeout.current) clearTimeout(xpNoticeTimeout.current);
    };
  }, []);

  const pathProgress = useMemo(
    () => toPercent(dashboard.completedLessons / Math.max(1, dashboard.totalLessons)),
    [dashboard.completedLessons, dashboard.totalLessons]
  );

  function switchTrack(nextTrack: GrammarDomain) {
    if (nextTrack === track) return;
    setTrack(nextTrack);
    setTab("practice");
  }

  function openPractice() {
    grammarSessionCompleted.current = false;
    trackEvent("grammar_session_started", {
      lessonId: currentLesson.id,
      lessonLevel: currentLesson.level,
      domain: currentLesson.domain,
      questionCount: questions.length,
    });
    setTab("practice");
  }

  function answerQuestion(question: GrammarPracticeQuestion, answer: string) {
    if (selectedAnswer !== null) return;
    const correct = isGrammarAnswerCorrect(question, answer);
    const isFinalQuestion = questionIndex >= questions.length - 1;
    const nextAnswered = sessionAnswered + 1;
    const nextCorrect = sessionCorrect + (correct ? 1 : 0);
    setSelectedAnswer(answer);
    setSessionAnswered((value) => value + 1);
    setSessionCorrect((value) => value + (correct ? 1 : 0));
    setStreak((value) => (correct ? value + 1 : 0));
    recordGrammarAnswer(question.lessonId, question.id, correct);
    if (correct) {
      const xp = recordGrammarPracticeXp(question.id);
      if (xp > 0) {
        if (xpNoticeTimeout.current) clearTimeout(xpNoticeTimeout.current);
        setXpNotice(`+${xp} XP`);
        xpNoticeTimeout.current = setTimeout(() => setXpNotice(null), 1600);
      }
    }
    if (isFinalQuestion) {
      markGrammarLessonComplete(question.lessonId);
      evaluateAndUnlockAchievements();
      if (!grammarSessionCompleted.current) {
        grammarSessionCompleted.current = true;
        const completedAt = new Date().toISOString();
        updateValidationState((state) => ({
          ...state,
          totalGrammarSessions: state.totalGrammarSessions + 1,
        }));
        trackEvent("grammar_session_completed", {
          lessonId: question.lessonId,
          domain: currentLesson.domain,
          correctAnswers: nextCorrect,
          totalQuestions: nextAnswered,
          completedAt,
        });
      }
      setTab("learn");
      setQuestionIndex(0);
      setSelectedAnswer(null);
      setSessionCorrect(0);
      setSessionAnswered(0);
      setStreak(0);
    }
    refresh();
  }

  function nextQuestion() {
    setSelectedAnswer(null);
    setQuestionIndex((index) => (index + 1) % questions.length);
  }

  return (
    <div className="px-4 pt-6">
      <BackButton fallbackHref="/settings" />
      <header className="mb-5 mt-2">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Grammar</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">{meta.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{meta.subtitle}</p>
      </header>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {TRACKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => switchTrack(item.id)}
            aria-pressed={track === item.id}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
              track === item.id ? "bg-ink text-white" : "bg-cream-card text-ink-muted shadow-card"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {xpNotice && (
        <div className="mb-3 rounded-2xl bg-brand-light px-3 py-2 text-sm font-bold text-brand">{xpNotice}</div>
      )}

      {tab !== "practice" && (
        <section className="mb-4 rounded-card bg-cream-card p-4 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{meta.pathLabel}</p>
              <p className="mt-1 text-xl font-extrabold text-ink">Lesson {currentLessonNumber} of {dashboard.totalLessons}</p>
              <p className="mt-1 text-xs text-ink-muted">{dashboard.completedLessons}/{dashboard.totalLessons} complete</p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-brand text-lg font-extrabold text-white">
              {currentProgress.mastery}%
            </div>
          </div>
          <LessonStepper lessons={lessons} progress={progress} currentLessonId={currentLesson.id} />
        </section>
      )}

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
              tab === item.id ? "bg-brand text-white" : "bg-cream-card text-ink-muted shadow-card"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "learn" && (
        <div className="space-y-4">
          <LessonDetail lesson={currentLesson} lessonNumber={currentLessonNumber} progress={currentProgress} onPractice={openPractice} />
          <LockedNextCard completedLessons={dashboard.completedLessons} totalLessons={dashboard.totalLessons} />
        </div>
      )}

      {tab === "practice" && (
        <div className="space-y-4">
          <PracticeCard
            lesson={currentLesson}
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            sessionCorrect={sessionCorrect}
            sessionAnswered={sessionAnswered}
            streak={streak}
            questionIndex={questionIndex}
            totalQuestions={questions.length}
            onAnswer={answerQuestion}
            onNext={nextQuestion}
          />
        </div>
      )}

      {tab === "reference" && track === "verbs" && (
        <ReferencePanel
          reference={verbReference}
          selectedVerb={referenceVerb}
          selectedTense={referenceTense}
          onVerbChange={setReferenceVerb}
          onTenseChange={setReferenceTense}
        />
      )}

      {tab === "reference" && track === "sentence-grammar" && structureReference && (
        <StructureReferencePanel
          reference={structureReference}
          selectedTopicId={referenceTopicId}
          onTopicChange={setReferenceTopicId}
        />
      )}
    </div>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-dark" role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function LessonStepper({
  lessons,
  progress,
  currentLessonId,
}: {
  lessons: GrammarLesson[];
  progress: GrammarProgressRecord[];
  currentLessonId: string;
}) {
  const completed = new Set(progress.filter((record) => record.completed).map((record) => record.lessonId));
  return (
    <div className="mt-3 flex flex-wrap gap-1.5" role="list" aria-label="Lesson path progress">
      {lessons.map((lesson, index) => {
        const isCompleted = completed.has(lesson.id);
        const isCurrent = lesson.id === currentLessonId;
        return (
          <span
            key={lesson.id}
            role="listitem"
            aria-label={`Lesson ${index + 1}${isCompleted ? ", complete" : isCurrent ? ", current" : ", locked"}`}
            title={lesson.shortTitle}
            className={`h-2 w-6 shrink-0 rounded-full ${
              isCompleted ? "bg-brand" : isCurrent ? "bg-brand/40 ring-2 ring-brand/50" : "bg-cream-dark"
            }`}
          />
        );
      })}
    </div>
  );
}

function LessonDetail({
  lesson,
  lessonNumber,
  progress,
  onPractice,
}: {
  lesson: GrammarLesson;
  lessonNumber: number;
  progress: GrammarProgressRecord;
  onPractice: () => void;
}) {
  const isVerb = lesson.domain === "verbs";
  return (
    <section className="rounded-card bg-cream-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Lesson {lessonNumber} - {lesson.level}</p>
          <h2 className="mt-1 text-xl font-extrabold leading-tight text-ink">{lesson.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{lesson.purpose}</p>
        </div>
        {isVerb && (
          <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-ink-muted">{tenseLabel(lesson.tense)}</span>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-cream px-3 py-3">
        <p className="text-sm font-semibold leading-relaxed text-ink">{isVerb ? lesson.pattern : lesson.corePattern}</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">{lesson.explanation}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{isVerb ? "Forms to notice" : "Key forms"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(isVerb ? lesson.endings : lesson.keyForms).map((form, index) => (
            <span key={`${form}-${index}`} className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
              {form}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-cream px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Example</p>
        <p className="mt-1 text-sm font-semibold text-ink">{lesson.examples[0].french}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{lesson.examples[0].english}</p>
        <p className="mt-1 text-xs font-semibold text-brand">{lesson.examples[0].note}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-100/70 px-3 py-2">
        <p className="text-xs font-bold text-ink">Watch for</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{lesson.commonMistake}</p>
      </div>

      <ProgressBar value={progress.mastery} label="Mastery" />

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onPractice} className="rounded-full bg-brand px-4 py-2 shadow-raised text-sm font-semibold text-white active:scale-95">
          Start 5-question quiz
        </button>
      </div>
    </section>
  );
}

function LockedNextCard({ completedLessons, totalLessons }: { completedLessons: number; totalLessons: number }) {
  const allDone = completedLessons >= totalLessons;
  return (
    <article className="rounded-card border border-dashed border-cream-dark bg-cream/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{allDone ? "Path complete" : "Next lesson locked"}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {allDone
          ? "You have finished the current path."
          : "Finish this lesson to reveal the next one. The rest of the path stays hidden so this section stays simple."}
      </p>
    </article>
  );
}

function PracticeCard({
  lesson,
  question,
  selectedAnswer,
  sessionCorrect,
  sessionAnswered,
  streak,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
}: {
  lesson: GrammarLesson;
  question: GrammarPracticeQuestion;
  selectedAnswer: string | null;
  sessionCorrect: number;
  sessionAnswered: number;
  streak: number;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (question: GrammarPracticeQuestion, answer: string) => void;
  onNext: () => void;
}) {
  const answered = selectedAnswer !== null;
  const selectedCorrect = selectedAnswer ? isGrammarAnswerCorrect(question, selectedAnswer) : false;
  return (
    <section
      className={`rounded-card bg-cream-card p-4 shadow-card ${
        answered ? (selectedCorrect ? "reward-card-lock-in bg-brand-light" : "reward-card-still-learning ring-2 ring-cream-strong") : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{lesson.shortTitle}</p>
          <h2 className="mt-1 text-xl font-extrabold text-ink">Question {questionIndex + 1}/{totalQuestions}</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink-muted">
            {sessionAnswered === 0 ? "0 correct" : `${sessionCorrect} correct`}
          </span>
          {streak >= 2 && (
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">{streak} in a row</span>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm font-bold text-ink">{question.prompt}</p>
      <p className="mt-3 rounded-2xl bg-cream px-3 py-3 text-lg font-semibold leading-relaxed text-ink">{question.sentence}</p>

      <div className="mt-4 space-y-2">
        {question.choices.map((choice) => {
          const isAnswer = answered && isGrammarAnswerCorrect(question, choice);
          const isSelected = selectedAnswer === choice;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onAnswer(question, choice)}
              disabled={answered}
              className={`w-full rounded-2xl px-3 py-3 text-left text-sm font-semibold active:scale-[0.99] disabled:active:scale-100 ${
                isAnswer
                  ? "bg-emerald-100 text-emerald-800"
                  : isSelected
                    ? "bg-rose-100 text-rose-800"
                    : "bg-cream text-ink disabled:opacity-40"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 rounded-2xl bg-cream px-3 py-3">
          <p className={`text-sm font-bold ${selectedCorrect ? "text-emerald-700" : "text-rose-700"}`}>
            {selectedCorrect ? "Correct" : "Not quite"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{question.explanation}</p>
          <button type="button" onClick={onNext} className="mt-3 rounded-full bg-brand px-4 py-2 shadow-raised text-sm font-semibold text-white active:scale-95">
            Next question
          </button>
        </div>
      )}
    </section>
  );
}

function ReferencePanel({
  reference,
  selectedVerb,
  selectedTense,
  onVerbChange,
  onTenseChange,
}: {
  reference: VerbReference;
  selectedVerb: string;
  selectedTense: VerbTense;
  onVerbChange: (verb: string) => void;
  onTenseChange: (tense: VerbTense) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-card bg-cream-card p-4 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Conjugation reference</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Verb</span>
            <select value={selectedVerb} onChange={(event) => onVerbChange(event.target.value)} className="mt-1 w-full rounded-2xl bg-cream px-3 py-2 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-brand/30">
              {VERB_REFERENCES.map((verb) => (
                <option key={verb.infinitive} value={verb.infinitive}>
                  {verb.infinitive}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Tense</span>
            <select value={selectedTense} onChange={(event) => onTenseChange(event.target.value as VerbTense)} className="mt-1 w-full rounded-2xl bg-cream px-3 py-2 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-brand/30">
              {ALL_TENSES.map((tense) => (
                <option key={tense} value={tense}>
                  {tenseLabel(tense)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-card bg-cream-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">{reference.group}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">{reference.infinitive}</h2>
            <p className="text-sm text-ink-muted">{reference.translation}</p>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">{tenseLabel(selectedTense)}</span>
        </div>

        <div className="mt-4 divide-y divide-cream-dark overflow-hidden rounded-2xl bg-cream">
          {(reference.forms[selectedTense] ?? []).map((form) => (
            <p key={form} className="px-3 py-2 text-sm font-semibold text-ink">{form}</p>
          ))}
          {!reference.forms[selectedTense] && (
            <p className="px-3 py-2 text-sm text-ink-muted">Not available for this verb yet.</p>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {reference.notes.map((note) => (
            <p key={note} className="rounded-2xl bg-brand-light px-3 py-2 text-xs font-semibold text-brand">{note}</p>
          ))}
        </div>
      </section>
    </div>
  );
}

function StructureReferencePanel({
  reference,
  selectedTopicId,
  onTopicChange,
}: {
  reference: StructureReference;
  selectedTopicId: string;
  onTopicChange: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-card bg-cream-card p-4 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Reference topic</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STRUCTURE_REFERENCES.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => onTopicChange(topic.id)}
              aria-pressed={selectedTopicId === topic.id}
              className={`rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
                selectedTopicId === topic.id ? "bg-brand text-white" : "bg-cream text-ink-muted"
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-card bg-cream-card p-4 shadow-card">
        <h2 className="text-xl font-extrabold text-ink">{reference.title}</h2>

        <div className="mt-4 divide-y divide-cream-dark overflow-hidden rounded-2xl bg-cream">
          {reference.rows.map((row) => (
            <div key={row.label} className="px-3 py-2">
              <p className="text-sm font-bold text-ink">{row.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{row.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {reference.notes.map((note) => (
            <p key={note} className="rounded-2xl bg-brand-light px-3 py-2 text-xs font-semibold text-brand">{note}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
