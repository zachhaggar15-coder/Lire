"use client";

import { useEffect, useMemo, useState } from "react";
import {
  VERB_REFERENCES,
  buildGrammarDashboard,
  getGrammarPracticeEvents,
  getGrammarProgress,
  getLessonProgress,
  getVerbLesson,
  getVerbLessons,
  isGrammarAnswerCorrect,
  markGrammarLessonComplete,
  questionsForLesson,
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

type Tab = "learn" | "practice" | "reference" | "progress";

const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "reference", label: "Reference" },
  { id: "progress", label: "Progress" },
];

const TENSES: VerbTense[] = ["present", "passe-compose", "imparfait", "futur-simple", "conditionnel"];

export default function GrammarPage() {
  const lessons = getVerbLessons();
  const [tab, setTab] = useState<Tab>("learn");
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [progress, setProgress] = useState<GrammarProgressRecord[]>([]);
  const [dashboard, setDashboard] = useState<GrammarDashboard>(() => buildGrammarDashboard([], []));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [referenceVerb, setReferenceVerb] = useState(VERB_REFERENCES[0].infinitive);
  const [referenceTense, setReferenceTense] = useState<VerbTense>("present");

  const selectedLesson = getVerbLesson(selectedLessonId);
  const selectedProgress = progress.find((record) => record.lessonId === selectedLessonId) ?? getLessonProgress(selectedLessonId);
  const questions = questionsForLesson(selectedLessonId);
  const currentQuestion = questions[questionIndex] ?? questions[0];
  const reference = referenceForVerb(referenceVerb) ?? VERB_REFERENCES[0];

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
  }, [selectedLessonId]);

  const pathProgress = useMemo(
    () => Math.round((dashboard.completedLessons / Math.max(1, dashboard.totalLessons)) * 100),
    [dashboard.completedLessons, dashboard.totalLessons]
  );

  function openPractice(lessonId: string) {
    setSelectedLessonId(lessonId);
    setTab("practice");
  }

  function completeLesson(lessonId: string) {
    markGrammarLessonComplete(lessonId);
    refresh();
  }

  function answerQuestion(question: GrammarPracticeQuestion, answer: string) {
    if (selectedAnswer !== null) return;
    const correct = isGrammarAnswerCorrect(question, answer);
    setSelectedAnswer(answer);
    setSessionAnswered((value) => value + 1);
    setSessionCorrect((value) => value + (correct ? 1 : 0));
    recordGrammarAnswer(question.lessonId, question.id, correct);
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
          A standalone grammar track for recognising French verb forms in real reading.
        </p>
      </header>

      <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Conjugation path</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{dashboard.completedLessons}/{dashboard.totalLessons} lessons complete</p>
            <p className="mt-1 text-xs text-ink-muted">Next: {dashboard.nextLesson.shortTitle}</p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-brand text-lg font-extrabold text-white">
            {dashboard.averageMastery}%
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
          <LessonDetail lesson={selectedLesson} progress={selectedProgress} onPractice={() => openPractice(selectedLesson.id)} onComplete={() => completeLesson(selectedLesson.id)} />
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Verb path</h2>
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  selected={lesson.id === selectedLessonId}
                  progress={progress.find((record) => record.lessonId === lesson.id) ?? getLessonProgress(lesson.id)}
                  onSelect={() => setSelectedLessonId(lesson.id)}
                  onPractice={() => openPractice(lesson.id)}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "practice" && (
        <div className="space-y-4">
          <LessonPicker lessons={lessons} selectedLessonId={selectedLessonId} progress={progress} onSelect={setSelectedLessonId} />
          <PracticeCard
            lesson={selectedLesson}
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

      {tab === "progress" && (
        <ProgressPanel dashboard={dashboard} lessons={lessons} progress={progress} />
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
  progress,
  onPractice,
  onComplete,
}: {
  lesson: VerbLesson;
  progress: GrammarProgressRecord;
  onPractice: () => void;
  onComplete: () => void;
}) {
  return (
    <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{lesson.level} - {tenseLabel(lesson.tense)}</p>
          <h2 className="mt-1 text-xl font-extrabold leading-tight text-ink">{lesson.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{lesson.purpose}</p>
        </div>
        <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-ink-muted">{lesson.group}</span>
      </div>

      <div className="mt-4 rounded-2xl bg-cream px-3 py-3">
        <p className="text-sm leading-relaxed text-ink">{lesson.explanation}</p>
        <p className="mt-2 text-xs font-semibold text-brand">{lesson.pattern}</p>
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

      <div className="mt-4 space-y-2">
        {lesson.examples.map((example) => (
          <div key={example.french} className="rounded-2xl bg-cream px-3 py-2">
            <p className="text-sm font-semibold text-ink">{example.french}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{example.english}</p>
            <p className="mt-1 text-[11px] font-semibold text-brand">{example.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-amber-100/70 px-3 py-2">
        <p className="text-xs font-bold text-ink">Common trap</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{lesson.commonMistake}</p>
      </div>

      <ProgressBar value={progress.mastery} label="Mastery" />

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onPractice} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
          Practise
        </button>
        <button type="button" onClick={onComplete} className="rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink active:scale-95">
          Mark learnt
        </button>
      </div>
    </section>
  );
}

function LessonCard({
  lesson,
  index,
  selected,
  progress,
  onSelect,
  onPractice,
}: {
  lesson: VerbLesson;
  index: number;
  selected: boolean;
  progress: GrammarProgressRecord;
  onSelect: () => void;
  onPractice: () => void;
}) {
  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${selected ? "border-brand/30 bg-brand-light" : "border-transparent bg-cream-card"}`}>
      <button type="button" onClick={onSelect} className="w-full text-left active:scale-[0.99]">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${progress.completed ? "bg-brand text-white" : "bg-cream-dark text-ink"}`}>
            {progress.completed ? "OK" : index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-ink">{lesson.shortTitle}</h3>
                <p className="mt-0.5 text-xs text-ink-muted">{lesson.purpose}</p>
              </div>
              <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-ink-muted">{lesson.level}</span>
            </div>
            <ProgressBar value={progress.mastery} label={`${progress.correct}/${progress.attempts} correct`} />
          </div>
        </div>
      </button>
      <button type="button" onClick={onPractice} className="mt-3 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-brand active:scale-95">
        Practice this
      </button>
    </article>
  );
}

function LessonPicker({
  lessons,
  selectedLessonId,
  progress,
  onSelect,
}: {
  lessons: VerbLesson[];
  selectedLessonId: string;
  progress: GrammarProgressRecord[];
  onSelect: (lessonId: string) => void;
}) {
  return (
    <section className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {lessons.map((lesson) => {
        const record = progress.find((item) => item.lessonId === lesson.id) ?? getLessonProgress(lesson.id);
        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onSelect(lesson.id)}
            className={`w-40 shrink-0 rounded-3xl p-3 text-left shadow-sm active:scale-[0.99] ${
              selectedLessonId === lesson.id ? "bg-brand text-white" : "bg-cream-card text-ink"
            }`}
          >
            <p className="text-xs font-bold opacity-80">{lesson.level}</p>
            <p className="mt-1 text-sm font-extrabold leading-tight">{lesson.shortTitle}</p>
            <p className="mt-2 text-xs opacity-80">{record.mastery}% mastery</p>
          </button>
        );
      })}
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

function ProgressPanel({
  dashboard,
  lessons,
  progress,
}: {
  dashboard: GrammarDashboard;
  lessons: VerbLesson[];
  progress: GrammarProgressRecord[];
}) {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="Completed" value={`${dashboard.completedLessons}/${dashboard.totalLessons}`} />
        <MetricCard label="Average mastery" value={`${dashboard.averageMastery}%`} />
        <MetricCard label="Strongest" value={dashboard.strongestLesson?.shortTitle ?? "No practice yet"} />
        <MetricCard label="Focus next" value={dashboard.weakestLesson?.shortTitle ?? dashboard.nextLesson.shortTitle} />
      </section>

      <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Lesson mastery</h2>
        <div className="mt-3 space-y-3">
          {lessons.map((lesson) => {
            const record = progress.find((item) => item.lessonId === lesson.id) ?? getLessonProgress(lesson.id);
            return (
              <div key={lesson.id} className="rounded-2xl bg-cream px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{lesson.shortTitle}</p>
                    <p className="text-xs text-ink-muted">{record.correct}/{record.attempts} correct</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.completed ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"}`}>
                    {record.completed ? "Learnt" : `${record.mastery}%`}
                  </span>
                </div>
                <ProgressBar value={record.mastery} label="Mastery" />
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Recent practice</h2>
        {dashboard.recentEvents.length > 0 ? (
          <div className="mt-3 space-y-2">
            {dashboard.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-2xl bg-cream px-3 py-2">
                <p className="text-xs font-semibold text-ink">{getVerbLesson(event.lessonId).shortTitle}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${event.correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {event.correct ? "Correct" : "Missed"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl bg-cream px-3 py-3 text-sm text-ink-muted">No practice attempts yet.</p>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold leading-tight text-ink">{value}</p>
    </article>
  );
}
