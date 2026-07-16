"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  VERB_REFERENCES,
  buildGrammarDashboard,
  currentUnlockedLesson,
  getGrammarPracticeEvents,
  getGrammarProgress,
  getLessonProgress,
  getVerbLessons,
  isGrammarAnswerCorrect,
  markGrammarLessonComplete,
  practiceSetForLesson,
  recordGrammarAnswer,
  referenceForVerb,
  tenseLabel,
  type GrammarDashboard,
  type GrammarPracticeQuestion,
  type GrammarProgressRecord,
  type VerbLesson,
  type VerbReference,
  type VerbTense,
} from "@/lib/grammar";
import { trackEvent } from "@/lib/analytics/client";
import { updateValidationState } from "@/lib/validation/state";

type Tab = "learn" | "practice" | "reference";

const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "reference", label: "Reference" },
];

const TENSES: VerbTense[] = ["present", "passe-compose", "imparfait", "futur-simple", "conditionnel"];

export default function GrammarPage() {
  const lessons = getVerbLessons();
  const [tab, setTab] = useState<Tab>("learn");
  const [progress, setProgress] = useState<GrammarProgressRecord[]>([]);
  const [dashboard, setDashboard] = useState<GrammarDashboard>(() => buildGrammarDashboard([], []));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [referenceVerb, setReferenceVerb] = useState(VERB_REFERENCES[0].infinitive);
  const [referenceTense, setReferenceTense] = useState<VerbTense>("present");
  const grammarSessionCompleted = useRef(false);

  const currentLesson = currentUnlockedLesson(progress);
  const currentProgress = progress.find((record) => record.lessonId === currentLesson.id) ?? getLessonProgress(currentLesson.id);
  const questions = practiceSetForLesson(currentLesson.id);
  const currentQuestion = questions[questionIndex] ?? questions[0];
  const reference = referenceForVerb(referenceVerb) ?? VERB_REFERENCES[0];
  const currentLessonNumber = lessons.findIndex((lesson) => lesson.id === currentLesson.id) + 1;

  function refresh() {
    const nextProgress = getGrammarProgress();
    setProgress(nextProgress);
    setDashboard(buildGrammarDashboard(nextProgress, getGrammarPracticeEvents()));
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setSessionCorrect(0);
    setSessionAnswered(0);
  }, [currentLesson.id]);

  const pathProgress = useMemo(
    () => Math.round((dashboard.completedLessons / Math.max(1, dashboard.totalLessons)) * 100),
    [dashboard.completedLessons, dashboard.totalLessons]
  );

  function openPractice() {
    grammarSessionCompleted.current = false;
    trackEvent("grammar_session_started", {
      lessonId: currentLesson.id,
      lessonLevel: currentLesson.level,
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
    recordGrammarAnswer(question.lessonId, question.id, correct);
    if (isFinalQuestion) {
      markGrammarLessonComplete(question.lessonId);
      if (!grammarSessionCompleted.current) {
        grammarSessionCompleted.current = true;
        const completedAt = new Date().toISOString();
        updateValidationState((state) => ({
          ...state,
          totalGrammarSessions: state.totalGrammarSessions + 1,
        }));
        trackEvent("grammar_session_completed", {
          lessonId: question.lessonId,
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
    }
    refresh();
  }

  function nextQuestion() {
    setSelectedAnswer(null);
    setQuestionIndex((index) => (index + 1) % questions.length);
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Grammar</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">Verb conjugation</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          One lesson at a time. Finish the current step to unlock the next.
        </p>
      </header>

      <section className="mb-4 rounded-3xl bg-cream-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Conjugation path</p>
            <p className="mt-1 text-xl font-extrabold text-ink">Lesson {currentLessonNumber}</p>
            <p className="mt-1 text-xs text-ink-muted">{dashboard.completedLessons}/{dashboard.totalLessons} complete</p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-brand text-lg font-extrabold text-white">
            {currentProgress.mastery}%
          </div>
        </div>
        <ProgressBar value={pathProgress} label="Path progress" />
      </section>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
              tab === item.id ? "bg-brand text-white" : "bg-cream-card text-ink-muted shadow-sm"
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
          <PracticeIntro lesson={currentLesson} />
          <PracticeCard
            lesson={currentLesson}
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            sessionCorrect={sessionCorrect}
            sessionAnswered={sessionAnswered}
            questionIndex={questionIndex}
            totalQuestions={questions.length}
            onAnswer={answerQuestion}
            onNext={nextQuestion}
          />
        </div>
      )}

      {tab === "reference" && (
        <ReferencePanel
          reference={reference}
          selectedVerb={referenceVerb}
          selectedTense={referenceTense}
          onVerbChange={setReferenceVerb}
          onTenseChange={setReferenceTense}
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

function LessonDetail({
  lesson,
  lessonNumber,
  progress,
  onPractice,
}: {
  lesson: VerbLesson;
  lessonNumber: number;
  progress: GrammarProgressRecord;
  onPractice: () => void;
}) {
  return (
    <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Lesson {lessonNumber} - {lesson.level}</p>
          <h2 className="mt-1 text-xl font-extrabold leading-tight text-ink">{lesson.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{lesson.purpose}</p>
        </div>
        <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-ink-muted">{tenseLabel(lesson.tense)}</span>
      </div>

      <div className="mt-4 rounded-2xl bg-cream px-3 py-3">
        <p className="text-sm font-semibold leading-relaxed text-ink">{lesson.pattern}</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">{lesson.explanation}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Forms to notice</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {lesson.endings.map((ending) => (
            <span key={ending} className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
              {ending}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-cream px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Example</p>
        <p className="mt-1 text-sm font-semibold text-ink">{lesson.examples[0].french}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{lesson.examples[0].english}</p>
        <p className="mt-1 text-[11px] font-semibold text-brand">{lesson.examples[0].note}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-100/70 px-3 py-2">
        <p className="text-xs font-bold text-ink">Watch for</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{lesson.commonMistake}</p>
      </div>

      <ProgressBar value={progress.mastery} label="Mastery" />

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onPractice} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
          Start 5-question quiz
        </button>
      </div>
    </section>
  );
}

function LockedNextCard({ completedLessons, totalLessons }: { completedLessons: number; totalLessons: number }) {
  const allDone = completedLessons >= totalLessons;
  return (
    <article className="rounded-3xl border border-dashed border-cream-dark bg-cream/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{allDone ? "Path complete" : "Next lesson locked"}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {allDone
          ? "You have finished the current verb-conjugation path."
          : "Finish this lesson to reveal the next one. The rest of the path stays hidden so this section stays simple."}
      </p>
    </article>
  );
}

function PracticeIntro({ lesson }: { lesson: VerbLesson }) {
  return (
    <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Before the quiz</p>
      <h2 className="mt-1 text-lg font-extrabold text-ink">{lesson.shortTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{lesson.explanation}</p>
      <p className="mt-3 rounded-2xl bg-cream px-3 py-2 text-sm font-semibold text-ink">{lesson.pattern}</p>
      <p className="mt-2 text-xs text-ink-muted">Answer 5 questions. When the set is finished, the next lesson opens automatically.</p>
    </section>
  );
}

function PracticeCard({
  lesson,
  question,
  selectedAnswer,
  sessionCorrect,
  sessionAnswered,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
}: {
  lesson: VerbLesson;
  question: GrammarPracticeQuestion;
  selectedAnswer: string | null;
  sessionCorrect: number;
  sessionAnswered: number;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (question: GrammarPracticeQuestion, answer: string) => void;
  onNext: () => void;
}) {
  const answered = selectedAnswer !== null;
  const selectedCorrect = selectedAnswer ? isGrammarAnswerCorrect(question, selectedAnswer) : false;
  return (
    <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{lesson.shortTitle}</p>
          <h2 className="mt-1 text-xl font-extrabold text-ink">Question {questionIndex + 1}/{totalQuestions}</h2>
        </div>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink-muted">
          {sessionCorrect}/{sessionAnswered}
        </span>
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
              className={`w-full rounded-2xl px-3 py-3 text-left text-sm font-semibold active:scale-[0.99] ${
                isAnswer
                  ? "bg-emerald-100 text-emerald-800"
                  : isSelected
                    ? "bg-rose-100 text-rose-800"
                    : "bg-cream text-ink"
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
          <button type="button" onClick={onNext} className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
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
      <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Conjugation reference</h2>
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
              {TENSES.map((tense) => (
                <option key={tense} value={tense}>
                  {tenseLabel(tense)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">{reference.group}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">{reference.infinitive}</h2>
            <p className="text-sm text-ink-muted">{reference.translation}</p>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">{tenseLabel(selectedTense)}</span>
        </div>

        <div className="mt-4 divide-y divide-cream-dark overflow-hidden rounded-2xl bg-cream">
          {reference.forms[selectedTense].map((form) => (
            <p key={form} className="px-3 py-2 text-sm font-semibold text-ink">{form}</p>
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
