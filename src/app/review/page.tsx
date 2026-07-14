"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SavedWord } from "@/types";
import { getSavedWords, recordReviewResult, markWordAsKnown } from "@/lib/storage";
import { getSavedPhrases, markPhraseKnown, type SavedPhrase } from "@/lib/phrases";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { buildReviewQueue, getReviewStats } from "@/lib/spacedRepetition";

export default function ReviewPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ knew: 0, missed: 0 });
  const [articleFilter, setArticleFilter] = useState<string | null>(null);
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [reviewMode, setReviewMode] = useState<"words" | "phrases">("words");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseAnswer, setPhraseAnswer] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const article = params.get("article");
    const savedWords = getSavedWords();
    const savedPhrases = getSavedPhrases();
    const visibleSavedWords = article ? savedWords.filter((word) => word.sourceTextTitle === article) : savedWords;
    const visibleSavedPhrases = article ? savedPhrases.filter((phrase) => phrase.sourceTextTitle === article) : savedPhrases;
    setArticleFilter(article);
    setWords(visibleSavedWords);
    setPhrases(visibleSavedPhrases);
    if (visibleSavedWords.length === 0 && visibleSavedPhrases.length > 0) {
      setReviewMode("phrases");
    }
    setReady(true);
  }, []);

  // Snapshotting the queue at mount (rather than recomputing on every
  // word-state change) means answering a card doesn't reshuffle the deck
  // out from under the reader mid-session.
  const queue = useMemo(() => buildReviewQueue(words), [words]);
  const stats = useMemo(() => getReviewStats(words), [words]);
  const phraseQueue = useMemo(() => phrases.filter((phrase) => phrase.status !== "known"), [phrases]);

  const current = queue[index];
  const currentPhrase = phraseQueue[phraseIndex];
  const done = reviewMode === "words" && ready && queue.length > 0 && index >= queue.length;
  const hasTranslation = current && current.primaryTranslation !== NOT_TRANSLATED_YET;

  function visibleWords(allWords: SavedWord[]): SavedWord[] {
    return articleFilter ? allWords.filter((word) => word.sourceTextTitle === articleFilter) : allWords;
  }

  function answer(result: "correct" | "incorrect") {
    if (current) setWords(visibleWords(recordReviewResult(current.word, result)));
    setScore((s) => ({
      knew: s.knew + (result === "correct" ? 1 : 0),
      missed: s.missed + (result === "correct" ? 0 : 1),
    }));
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function handleMarkKnown() {
    if (!current) return;
    setWords(visibleWords(markWordAsKnown(current.word)));
    // markWordAsKnown drops this word from the (memoised) queue, so
    // whatever now sits at `index` is already the next card.
    setRevealed(false);
  }

  function restart() {
    setWords(visibleWords(getSavedWords()));
    setPhrases(articleFilter ? getSavedPhrases().filter((phrase) => phrase.sourceTextTitle === articleFilter) : getSavedPhrases());
    setIndex(0);
    setRevealed(false);
    setPhraseIndex(0);
    setPhraseAnswer(null);
    setScore({ knew: 0, missed: 0 });
  }

  function phraseOptions(phrase: SavedPhrase): string[] {
    return [phrase.phrase, ...phrases.filter((candidate) => candidate.phrase !== phrase.phrase).map((candidate) => candidate.phrase), "avoir lieu", "faire face à"]
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .slice(0, 3);
  }

  function cloze(sentence: string, phrase: string): string {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return sentence.replace(new RegExp(escaped, "i"), "___");
  }

  function answerPhrase(option: string) {
    setPhraseAnswer(option);
  }

  function nextPhrase() {
    const gotIt = !!currentPhrase && phraseAnswer === currentPhrase.phrase;
    if (gotIt && currentPhrase) {
      markPhraseKnown(currentPhrase.phrase);
      setPhrases(articleFilter ? getSavedPhrases().filter((phrase) => phrase.sourceTextTitle === articleFilter) : getSavedPhrases());
    }
    setPhraseAnswer(null);
    if (!gotIt) setPhraseIndex((value) => value + 1);
  }

  const statsBar = (
    <div className="mb-5 grid grid-cols-4 gap-2">
      {[
        { label: "Due today", value: stats.dueToday },
        { label: "New", value: stats.newWords },
        { label: "Not due yet", value: stats.notDueYet },
        { label: "Total", value: stats.totalLearning },
      ].map((s) => (
        <div key={s.label} className="rounded-2xl bg-cream-card p-2.5 text-center shadow-sm">
          <p className="text-lg font-extrabold text-ink">{s.value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );

  // No learning/unsure words saved at all.
  if (ready && stats.totalLearning === 0 && phraseQueue.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-ink">Review</h1>
        <div className="mt-16 text-center">
          <p className="text-ink-muted">{articleFilter ? "No saved words from this article yet." : "Nothing to review yet."}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {articleFilter
              ? "Save words as Learning or Unsure while reading, then come back here."
              : "Words you save as Learning or Unsure while reading show up here."}
          </p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Start reading
          </Link>
        </div>
      </div>
    );
  }

  // Words exist, but nothing is due right now.
  if (ready && stats.totalLearning > 0 && queue.length === 0 && reviewMode === "words" && phraseQueue.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-2xl font-extrabold text-ink">Review</h1>
        {statsBar}
        <div className="mt-8 text-center">
          <p className="text-4xl">✅</p>
          <p className="mt-2 text-ink-muted">All caught up — nothing due right now.</p>
          <p className="mt-1 text-xs text-ink-muted">
            {stats.notDueYet} {stats.notDueYet === 1 ? "word is" : "words are"} scheduled for later.
          </p>
        </div>
      </div>
    );
  }

  // Finished this session's queue.
  if (done) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-2xl font-extrabold text-ink">Review</h1>
        {statsBar}
        <div className="mt-8 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 text-lg font-semibold text-ink">All done!</p>
          <p className="mt-1 text-sm text-ink-muted">
            Knew it: {score.knew} · Didn&apos;t know: {score.missed}
          </p>
          <button
            onClick={restart}
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Check for more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col px-4 pt-6">
      <header className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Review</h1>
          {articleFilter && <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">From: {articleFilter}</p>}
        </div>
        <span className="text-sm text-ink-muted">
          {ready ? `card ${index + 1} of ${queue.length} due` : ""}
        </span>
      </header>

      {statsBar}

      {phrases.length > 0 && (
        <PhraseModeSwitch mode={reviewMode} onChange={setReviewMode} phraseCount={phraseQueue.length} />
      )}

      {reviewMode === "phrases" && (
        <PhraseReviewCard
          phrase={currentPhrase}
          options={currentPhrase ? phraseOptions(currentPhrase) : []}
          selected={phraseAnswer}
          onSelect={answerPhrase}
          onNext={nextPhrase}
          cloze={currentPhrase ? cloze(currentPhrase.contextSentence, currentPhrase.phrase) : ""}
        />
      )}

      {reviewMode === "words" && current && (
        <div className="flex flex-1 flex-col">
          {/* Flashcard */}
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-cream-card p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              French
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">{current.word}</p>
            {current.lemma && current.lemma !== current.word && (
              <p className="text-xs text-ink-muted">from “{current.lemma}”</p>
            )}

            {revealed ? (
              <div className="mt-6 w-full border-t border-cream-dark pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Meaning
                </p>
                <p
                  className={`mt-1 text-xl ${
                    hasTranslation ? "text-ink" : "italic text-ink-muted"
                  }`}
                >
                  {current.primaryTranslation}
                </p>
                {current.translations.length > 1 && (
                  <p className="mt-1 text-sm text-ink-muted">
                    Also: {current.translations.slice(1).join(", ")}
                  </p>
                )}
                {(current.partOfSpeech || current.gender) && (
                  <p className="mt-1 text-xs text-ink-muted">
                    {current.partOfSpeech}
                    {current.gender && ` · ${current.gender}`}
                  </p>
                )}

                {current.exampleSentenceFr && (
                  <div className="mt-4 rounded-2xl bg-cream p-3 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      Example
                    </p>
                    <p className="mt-1 text-sm italic text-ink">{current.exampleSentenceFr}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{current.exampleSentenceEn}</p>
                  </div>
                )}

                {current.articleContextSentence && (
                  <p className="mt-3 text-xs text-ink-muted">
                    <span className="font-semibold uppercase tracking-wide">Original article context: </span>
                    “{current.articleContextSentence}”
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="mt-6 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white active:scale-95"
              >
                Reveal meaning
              </button>
            )}
          </div>

          {/* Answer buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => answer("incorrect")}
              disabled={!revealed}
              className="rounded-2xl bg-rose-100 py-4 text-sm font-semibold text-rose-700 active:scale-95 disabled:opacity-40"
            >
              Didn&apos;t know it
            </button>
            <button
              onClick={() => answer("correct")}
              disabled={!revealed}
              className="rounded-2xl bg-emerald-100 py-4 text-sm font-semibold text-emerald-700 active:scale-95 disabled:opacity-40"
            >
              Knew it
            </button>
          </div>
          <button
            onClick={handleMarkKnown}
            className="mt-2 rounded-2xl bg-cream-dark py-3 text-sm font-semibold text-ink-muted active:scale-95"
          >
            Mark as known
          </button>
        </div>
      )}
    </div>
  );
}

function PhraseModeSwitch({
  mode,
  onChange,
  phraseCount,
}: {
  mode: "words" | "phrases";
  onChange: (mode: "words" | "phrases") => void;
  phraseCount: number;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-cream-card p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("words")}
        className={`rounded-xl py-2 text-sm font-semibold ${mode === "words" ? "bg-brand text-white" : "text-ink-muted"}`}
      >
        Words
      </button>
      <button
        type="button"
        onClick={() => onChange("phrases")}
        className={`rounded-xl py-2 text-sm font-semibold ${mode === "phrases" ? "bg-brand text-white" : "text-ink-muted"}`}
      >
        Phrases {phraseCount > 0 ? `(${phraseCount})` : ""}
      </button>
    </div>
  );
}

function PhraseReviewCard({
  phrase,
  options,
  selected,
  onSelect,
  onNext,
  cloze,
}: {
  phrase: SavedPhrase | undefined;
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
  onNext: () => void;
  cloze: string;
}) {
  if (!phrase) {
    return (
      <div className="mt-8 rounded-3xl bg-cream-card p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-ink">No phrase cards due.</p>
        <p className="mt-1 text-xs text-ink-muted">Saved phrases you are still learning will appear here.</p>
      </div>
    );
  }

  const answered = selected !== null;
  const correct = selected === phrase.phrase;
  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-3xl bg-cream-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Phrase in context</p>
        <p className="mt-3 rounded-2xl bg-cream px-3 py-3 text-lg font-semibold leading-relaxed text-ink">{cloze}</p>
        <div className="mt-4 space-y-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`w-full rounded-2xl px-3 py-3 text-left text-sm font-semibold ${
                answered && option === phrase.phrase
                  ? "bg-emerald-100 text-emerald-800"
                  : answered && option === selected
                    ? "bg-rose-100 text-rose-800"
                    : "bg-cream text-ink"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {answered && (
          <div className="mt-4 space-y-3 border-t border-cream-dark pt-4">
            <p className={`text-sm font-semibold ${correct ? "text-emerald-700" : "text-rose-700"}`}>
              {correct ? "Correct." : "Not quite."} {phrase.phrase} = {phrase.translation}
            </p>
            <div className="rounded-2xl bg-cream p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Original sentence</p>
              <p className="mt-1 text-sm italic text-ink">{phrase.contextSentence}</p>
            </div>
            <div className="rounded-2xl bg-cream p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Natural translation</p>
              <p className="mt-1 text-sm text-ink">{phrase.translation}</p>
            </div>
            <div className="rounded-2xl bg-cream p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">New example</p>
              <p className="mt-1 text-sm italic text-ink">On peut {phrase.phrase} cette idée dans un autre article.</p>
              <p className="mt-0.5 text-sm text-ink-muted">You can use this phrase with the same idea in another article.</p>
            </div>
            <p className="text-xs text-ink-muted">
              Register: <span className="font-semibold">{phrase.partOfSpeech?.includes("formal") ? "formal" : "neutral"}</span>
            </p>
            <button
              type="button"
              onClick={onNext}
              className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
            >
              Next phrase
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
