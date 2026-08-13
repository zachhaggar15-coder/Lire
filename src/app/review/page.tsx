"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { SavedWord } from "@/types";
import { getSavedWords, markWordAsKnown, recordReviewResult } from "@/lib/storage";
import { getSavedPhrases, recordPhraseReview, type SavedPhrase } from "@/lib/phrases";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { buildReviewQueue, getReviewStats } from "@/lib/spacedRepetition";
import { getReviewPreferences, saveReviewPreferences } from "@/lib/reviewPreferences";
import { getAllInferenceResults, getAllWordTaps } from "@/lib/wordLearning";
import { canSpeak, speakFrench } from "@/lib/speech";
import { classifyVocabularyStates, type VocabularyDecayState, type VocabularyStateItem } from "@/lib/readingAnalytics";
import { recordReviewSuccessXp } from "@/lib/gamification";
import { trackEvent } from "@/lib/analytics/client";
import { updateValidationState } from "@/lib/validation/state";
import { triggerHaptic } from "@/lib/haptics";
import AppIcon from "@/components/AppIcon";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

type ReviewDirection = "fr-en" | "en-fr";
type WordGrade = "knew" | "learning";
type CardFeedback = "correct" | "learning" | null;

const REVIEW_FEEDBACK_DELAY_MS = 760;
/**
 * A word graduates out of the active review deck once it's been graded
 * "Knew it" this many times in a row — an unprompted self-report of "I
 * knew it" three times running is a fair bar for calling a word learned,
 * without needing a separate typed-confirmation pass. Phrases use the
 * same threshold — see PHRASE_GRADUATE_AFTER_CORRECT_STREAK in phrases.ts.
 */
const GRADUATE_AFTER_CORRECT_STREAK = 3;

function promptLabel(direction: ReviewDirection): string {
  return direction === "en-fr" ? "English to French" : "French to English";
}

/** Caps a freshly-built due queue at the remembered session-length preference (reviewPreferences.ts) — null means "no cap, review everything due." */
function capToSessionLength<T>(queue: T[]): T[] {
  const { sessionLength } = getReviewPreferences();
  if (typeof sessionLength !== "number") return queue;
  return queue.slice(0, sessionLength);
}

/** Hear the French word/phrase aloud, reusing the same browser TTS every other speech control in the app already reads (speech.ts) — hidden entirely when the browser has no speechSynthesis support. */
function SpeakButton({ text }: { text: string }) {
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        speakFrench(text);
      }}
      aria-label={`Listen to "${text}"`}
      className="ligne-icon-button ligne-pressable bg-cream text-ink-muted"
    >
      <AppIcon name="volume" className="h-4 w-4" />
    </button>
  );
}

export default function ReviewPage() {
  useDocumentTitle("Review");
  const [words, setWords] = useState<SavedWord[]>([]);
  const [ready, setReady] = useState(false);
  const [wordQueue, setWordQueue] = useState<SavedWord[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ knew: 0, missed: 0 });
  const [articleFilter, setArticleFilter] = useState<string | null>(null);
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [sessionPhraseQueue, setSessionPhraseQueue] = useState<SavedPhrase[]>([]);
  const [reviewMode, setReviewModeState] = useState<"words" | "phrases">(() => getReviewPreferences().mode);
  const [reviewDirection, setReviewDirectionState] = useState<ReviewDirection>(() => getReviewPreferences().direction);
  const [sessionLength, setSessionLengthState] = useState<number | null>(() => getReviewPreferences().sessionLength);

  function setReviewMode(mode: "words" | "phrases") {
    setReviewModeState(mode);
    saveReviewPreferences({ mode });
  }

  function setReviewDirection(direction: ReviewDirection) {
    setReviewDirectionState(direction);
    saveReviewPreferences({ direction });
  }

  function setSessionLength(value: number | null) {
    setSessionLengthState(value);
    saveReviewPreferences({ sessionLength: value });
  }
  const [reviewStarted, setReviewStarted] = useState(false);
  const [phraseReviewStarted, setPhraseReviewStarted] = useState(false);
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const [xpNotice, setXpNotice] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>(null);
  const reviewSessionStarted = useRef(false);
  const reviewSessionCompleted = useRef(false);
  const [wordSessionTotal, setWordSessionTotal] = useState(0);
  const [phraseSessionTotal, setPhraseSessionTotal] = useState(0);
  const phraseScore = useRef({ correct: 0, total: 0 });
  // Tracks distinct words missed at least once this session, not miss events —
  // a missed card is requeued and must eventually be graded "Knew it" to leave
  // the queue, so by the time the session is done every card has a correct
  // grade. Counting events would double up on the "Session complete" screen
  // (a card missed once then learned still reads as one word needing a retry,
  // not one known and one still outstanding). The Set lives in a ref (dedup
  // logic runs in an event handler); missedCount mirrors its size into state
  // since refs can't be read during render.
  const missedWordKeys = useRef<Set<string>>(new Set());
  const [missedCount, setMissedCount] = useState(0);
  const cardFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviewCardRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToReviewCard = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const article = params.get("article");
    const savedWords = getSavedWords();
    const savedPhrases = getSavedPhrases();
    const visibleSavedWords = article ? savedWords.filter((word) => word.sourceTextTitle === article) : savedWords;
    const visibleSavedPhrases = article ? savedPhrases.filter((phrase) => phrase.sourceTextTitle === article) : savedPhrases;
    // Neither queue is capped here — the hub shows the true due count
    // before you start, for both words and phrases; the session-length cap
    // only applies once you actually start (see startWordReview/startPhraseReview).
    const initialWordQueue = buildReviewQueue(visibleSavedWords);
    const initialPhraseQueue = visibleSavedPhrases.filter((phrase) => phrase.status !== "known");
    setArticleFilter(article);
    setWords(visibleSavedWords);
    setPhrases(visibleSavedPhrases);
    setWordQueue(initialWordQueue);
    setSessionPhraseQueue(initialPhraseQueue);
    setWordSessionTotal(initialWordQueue.length);
    setPhraseSessionTotal(initialPhraseQueue.length);
    if (visibleSavedWords.length === 0 && visibleSavedPhrases.length > 0) {
      // Circumstantial (nothing to review as words right now), not a
      // deliberate choice — don't persist this as the remembered preference.
      setReviewModeState("phrases");
    }
    // A direct "review this article's words" deep link already IS the
    // start decision — jump straight in. The general /review entry point
    // (no article filter) shows the practice hub first instead, so
    // direction/mode/session-length are visible and chosen deliberately
    // rather than always being skipped straight past.
    if (article && initialWordQueue.length > 0) {
      setReviewStarted(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    return () => {
      if (cardFeedbackTimeout.current) clearTimeout(cardFeedbackTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (!reviewStarted || !shouldScrollToReviewCard.current) return;
    shouldScrollToReviewCard.current = false;
    reviewCardRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [reviewStarted]);

  const stats = useMemo(() => getReviewStats(words), [words]);
  const vocabularyStates = useMemo(
    () => classifyVocabularyStates(words, getAllWordTaps(), getAllInferenceResults()),
    [words]
  );

  const current = wordQueue[0];
  const currentPhrase = sessionPhraseQueue[0];
  const wordsDone = reviewMode === "words" && ready && reviewStarted && wordSessionTotal > 0 && wordQueue.length === 0;
  const phrasesDone = reviewMode === "phrases" && ready && phraseReviewStarted && phraseSessionTotal > 0 && sessionPhraseQueue.length === 0;
  const done = wordsDone || phrasesDone;
  const hasTranslation = current && current.primaryTranslation !== NOT_TRANSLATED_YET;

  useEffect(() => {
    if (!ready || reviewSessionStarted.current) return;
    if (reviewMode === "words" && !reviewStarted) return;
    const cardCount =
      reviewMode === "words"
        ? wordSessionTotal || wordQueue.length
        : phraseSessionTotal || sessionPhraseQueue.length;
    if (cardCount <= 0) return;
    reviewSessionStarted.current = true;
    trackEvent("review_session_started", {
      mode: reviewMode,
      cardCount,
      articleFiltered: !!articleFilter,
    });
  }, [articleFilter, phraseSessionTotal, ready, reviewMode, reviewStarted, sessionPhraseQueue.length, wordQueue.length, wordSessionTotal]);

  function visibleWords(allWords: SavedWord[]): SavedWord[] {
    return articleFilter ? allWords.filter((word) => word.sourceTextTitle === articleFilter) : allWords;
  }

  function completeReviewSession(mode: "words" | "phrases", totalCards: number, correctCards: number) {
    if (reviewSessionCompleted.current || totalCards <= 0) return;
    reviewSessionCompleted.current = true;
    const completedAt = new Date().toISOString();
    updateValidationState((state) => ({
      ...state,
      firstReviewCompletedAt: state.firstReviewCompletedAt ?? completedAt,
      totalReviewsCompleted: state.totalReviewsCompleted + 1,
    }));
    trackEvent("review_session_completed", {
      mode,
      totalCards,
      correctCards,
      articleFiltered: !!articleFilter,
    });
  }

  function startWordReview() {
    if (!current) return;
    const capped = capToSessionLength(wordQueue);
    if (capped.length !== wordQueue.length) {
      setWordQueue(capped);
      setWordSessionTotal(capped.length);
    }
    shouldScrollToReviewCard.current = true;
    setReviewStarted(true);
  }

  function startPhraseReview() {
    if (!currentPhrase) return;
    // Applying the cap here (not at page load) means changing the
    // session-length option after landing on the hub still takes effect —
    // it previously only ever capped once, at initial load.
    const capped = capToSessionLength(sessionPhraseQueue);
    if (capped.length !== sessionPhraseQueue.length) {
      setSessionPhraseQueue(capped);
      setPhraseSessionTotal(capped.length);
    }
    shouldScrollToReviewCard.current = true;
    setPhraseReviewStarted(true);
  }

  function resetWordCard() {
    setRevealed(false);
  }

  function gradeWord(grade: WordGrade) {
    if (!current || cardFeedback) return;
    const correct = grade === "knew";
    triggerHaptic(correct ? "confirm" : "selection");
    if (!correct) {
      missedWordKeys.current.add(current.word);
      setMissedCount(missedWordKeys.current.size);
    }
    const nextScore = {
      knew: score.knew + (correct ? 1 : 0),
      missed: score.missed + (correct ? 0 : 1),
    };
    setCardFeedback(correct ? "correct" : "learning");
    trackEvent("review_answer_submitted", {
      mode: "words",
      correct,
      grade,
      cardIndex: Math.min(score.knew + score.missed + 1, Math.max(1, wordSessionTotal)),
      totalCards: wordSessionTotal || wordQueue.length,
      articleFiltered: !!articleFilter,
    });
    if (cardFeedbackTimeout.current) clearTimeout(cardFeedbackTimeout.current);
    cardFeedbackTimeout.current = setTimeout(() => {
      const updatedWords = recordReviewResult(current.word, correct ? "correct" : "incorrect");
      const updatedWord = updatedWords.find((w) => w.word === current.word);
      const graduated = correct && (updatedWord?.correctCount ?? 0) >= GRADUATE_AFTER_CORRECT_STREAK;
      const nextWords = visibleWords(graduated ? markWordAsKnown(current.word) : updatedWords);
      if (graduated) {
        const xp = recordReviewSuccessXp(current.word);
        if (xp > 0) {
          setXpNotice(`+${xp} XP`);
          window.setTimeout(() => setXpNotice(null), 1600);
        }
      }
      const remainingQueue = wordQueue.slice(1);
      const nextQueue = correct ? remainingQueue : [...remainingQueue, current];
      setWords(nextWords);
      setWordQueue(nextQueue);
      setScore(nextScore);
      resetWordCard();
      if (nextQueue.length === 0) completeReviewSession("words", wordSessionTotal, nextScore.knew);
      setCardFeedback(null);
      cardFeedbackTimeout.current = null;
    }, REVIEW_FEEDBACK_DELAY_MS);
  }

  function restart() {
    if (cardFeedbackTimeout.current) {
      clearTimeout(cardFeedbackTimeout.current);
      cardFeedbackTimeout.current = null;
    }
    const nextWords = visibleWords(getSavedWords());
    const nextPhrases = articleFilter ? getSavedPhrases().filter((phrase) => phrase.sourceTextTitle === articleFilter) : getSavedPhrases();
    const nextWordQueue = capToSessionLength(buildReviewQueue(nextWords));
    const nextPhraseQueue = capToSessionLength(nextPhrases.filter((phrase) => phrase.status !== "known"));
    setWords(nextWords);
    setPhrases(nextPhrases);
    setWordQueue(nextWordQueue);
    setSessionPhraseQueue(nextPhraseQueue);
    setWordSessionTotal(nextWordQueue.length);
    setPhraseSessionTotal(nextPhraseQueue.length);
    resetWordCard();
    setPhraseRevealed(false);
    setReviewStarted(nextWordQueue.length > 0 && reviewMode === "words");
    setPhraseReviewStarted(nextPhraseQueue.length > 0 && reviewMode === "phrases");
    setScore({ knew: 0, missed: 0 });
    missedWordKeys.current = new Set();
    setMissedCount(0);
    setCardFeedback(null);
    phraseScore.current = { correct: 0, total: 0 };
    reviewSessionStarted.current = false;
    reviewSessionCompleted.current = false;
  }

  function gradePhrase(grade: WordGrade) {
    if (!currentPhrase || cardFeedback) return;
    const correct = grade === "knew";
    triggerHaptic(correct ? "confirm" : "selection");
    phraseScore.current = {
      correct: phraseScore.current.correct + (correct ? 1 : 0),
      total: phraseScore.current.total + 1,
    };
    setCardFeedback(correct ? "correct" : "learning");
    trackEvent("review_answer_submitted", {
      mode: "phrases",
      correct,
      grade,
      cardIndex: Math.min(phraseScore.current.total, Math.max(1, phraseSessionTotal)),
      totalCards: phraseSessionTotal || sessionPhraseQueue.length,
      articleFiltered: !!articleFilter,
    });

    if (cardFeedbackTimeout.current) clearTimeout(cardFeedbackTimeout.current);
    cardFeedbackTimeout.current = setTimeout(() => {
      const updatedPhrases = recordPhraseReview(currentPhrase.phrase, correct);
      setPhrases(articleFilter ? updatedPhrases.filter((phrase) => phrase.sourceTextTitle === articleFilter) : updatedPhrases);
      const remainingQueue = sessionPhraseQueue.slice(1);
      const nextQueue = correct ? remainingQueue : [...remainingQueue, currentPhrase];
      setSessionPhraseQueue(nextQueue);
      setPhraseRevealed(false);
      if (nextQueue.length === 0) completeReviewSession("phrases", phraseSessionTotal, phraseScore.current.correct);
      setCardFeedback(null);
      cardFeedbackTimeout.current = null;
    }, REVIEW_FEEDBACK_DELAY_MS);
  }

  const statsBar = (
    <div className="mb-5 grid grid-cols-4 gap-2">
      {[
        { label: "Due today", value: stats.dueToday },
        { label: "New", value: stats.newWords },
        { label: "Not due yet", value: stats.notDueYet },
        { label: "Total", value: stats.totalLearning },
      ].map((s) => (
        <div key={s.label} className="rounded-2xl border border-cream-dark bg-cream-card p-2.5 text-center">
          <p className="flex min-h-6 items-center justify-center font-numeral text-2xl leading-none text-ink">
            <span key={s.value} className="ligne-state-slot ligne-value-change">{s.value}</span>
          </p>
          <p className="ligne-meta mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );

  const shouldShowWordStart = reviewMode === "words" && !!current && !reviewStarted;
  const shouldShowWordReview = reviewMode === "words" && !!current && reviewStarted;
  const shouldShowPhraseStart = reviewMode === "phrases" && !!currentPhrase && !phraseReviewStarted;
  const shouldShowPhraseReview = reviewMode === "phrases" && !!currentPhrase && phraseReviewStarted;
  const remainingPhraseCount = sessionPhraseQueue.length;
  const shouldShowPracticeHub = shouldShowWordStart || shouldShowPhraseStart;
  const reviewProgressLabel =
    !ready
      ? ""
      : reviewMode === "phrases"
        ? phraseReviewStarted
          ? `${remainingPhraseCount} ${remainingPhraseCount === 1 ? "phrase" : "phrases"} left`
          : `${remainingPhraseCount} ${remainingPhraseCount === 1 ? "phrase" : "phrases"} to review`
        : reviewStarted
          ? `${wordQueue.length} ${wordQueue.length === 1 ? "card" : "cards"} left`
          // Not "due": the queue also includes never-reviewed new words, so
          // saying "3 cards due" directly above a "Due today: 0" tile read as
          // a contradiction.
          : `${wordQueue.length} ${wordQueue.length === 1 ? "card" : "cards"} to review`;
  const wordCardIndex = wordSessionTotal > 0 ? wordSessionTotal - wordQueue.length + 1 : 1;

  // No learning/unsure words saved at all.
  if (!done && ready && stats.totalLearning === 0 && sessionPhraseQueue.length === 0) {
    return (
      <div className="ligne-screen">
        <PageHeader title="Review" subtitle={articleFilter ? `From: ${articleFilter}` : "A quiet place for the words you are learning."} />
        <div className="flex items-center justify-center gap-10 border-y border-cream-dark/80 py-3 text-center">
          <div className="min-w-16">
            <p className="font-numeral text-2xl leading-none text-ink">0</p>
            <p className="ligne-meta mt-1">Due</p>
          </div>
          <div className="h-8 w-px bg-cream-dark" aria-hidden="true" />
          <div className="min-w-16">
            <p className="font-numeral text-2xl leading-none text-ink">0</p>
            <p className="ligne-meta mt-1">Saved</p>
          </div>
        </div>
        <div className="mx-auto flex min-h-[48vh] max-w-xs flex-col items-center justify-center pb-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-light text-brand" aria-hidden="true">
            <AppIcon name="book" active className="h-11 w-11" />
          </div>
          <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">
            {articleFilter ? "No words saved from this text" : "Your review deck is ready when you are"}
          </h2>
          <p className="ligne-body mt-2 max-w-[17rem]">
            {articleFilter
              ? "Add words to review while reading, then come back here."
              : "Words you add to review while reading show up here."}
          </p>
          <Link
            href="/"
            className="ligne-pill ligne-pressable mt-5 bg-brand text-cream"
          >
            Start reading
          </Link>
        </div>
      </div>
    );
  }

  // Words exist, but nothing is due right now.
  if (ready && stats.totalLearning > 0 && wordQueue.length === 0 && !reviewStarted && reviewMode === "words" && sessionPhraseQueue.length === 0) {
    return (
      <div className="ligne-screen">
        <PageHeader title="Review" subtitle="Nothing due right now." />
        {statsBar}
        <div className="mt-8 rounded-card border border-cream-dark bg-cream-card p-5 text-center">
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
      <div className="ligne-screen">
        <PageHeader title="Review" subtitle="Session complete." />
        {phrasesDone ? null : statsBar}
        <div className="mt-8 rounded-card border border-cream-dark bg-cream-card p-5 text-center">
          <p className="mt-2 text-lg font-semibold text-ink">All done!</p>
          <p className="mt-1 text-sm text-ink-muted">
            {phrasesDone ? (
              `Known: ${phraseSessionTotal}`
            ) : (
              <>
                Known: {wordSessionTotal}
                {missedCount > 0 && ` - Needed a retry: ${missedCount}`}
              </>
            )}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={restart}
              className="ligne-pill bg-brand text-cream"
            >
              Check for more
            </button>
            <Link href={phrasesDone ? "/words?tab=phrases" : "/words"} className="ligne-pill bg-cream-fill text-ink-muted">
              {phrasesDone ? "Manage saved phrases" : "Manage saved words"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ligne-screen flex min-h-[70vh] flex-col">
      <header className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="ligne-label">Word practice</p>
          <h1 className="ligne-title mt-1 text-[30px]">Review</h1>
          {articleFilter && <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">From: {articleFilter}</p>}
        </div>
        <span className="ligne-meta min-w-[8.5rem] text-right">
          <span key={reviewProgressLabel} className="ligne-value-change inline-block">{reviewProgressLabel}</span>
        </span>
      </header>

      {xpNotice && (
        <div className="mb-3 rounded-2xl bg-brand-light px-3 py-2 text-sm font-bold text-brand">
          {xpNotice}
        </div>
      )}

      {/*
        Once a review is under way the card is the whole job — eight stat
        tiles above it just pushed it down the screen and had to be scrolled
        past on every answer. They're back as soon as the session ends.
      */}
      {shouldShowPracticeHub && (
        <PracticeHubCard
          wordCount={wordQueue.length}
          dueToday={stats.dueToday}
          newWords={stats.newWords}
          notDueYet={stats.notDueYet}
          totalLearning={stats.totalLearning}
          phraseCount={sessionPhraseQueue.length}
          vocabularyStates={vocabularyStates}
          mode={reviewMode}
          direction={reviewDirection}
          sessionLength={sessionLength}
          onDirectionChange={(direction) => {
            setReviewDirection(direction);
            resetWordCard();
            setPhraseRevealed(false);
          }}
          onModeChange={setReviewMode}
          onSessionLengthChange={setSessionLength}
          onStart={reviewMode === "words" ? startWordReview : startPhraseReview}
        />
      )}

      {!shouldShowPracticeHub && !shouldShowWordReview && reviewMode === "words" && statsBar}

      {!shouldShowPracticeHub && !shouldShowWordReview && reviewMode === "words" && vocabularyStates.length > 0 && (
        <VocabularyStateSummary items={vocabularyStates} />
      )}

      {!shouldShowPracticeHub && phrases.length > 0 && (
        <PhraseModeSwitch mode={reviewMode} onChange={setReviewMode} phraseCount={sessionPhraseQueue.length} />
      )}

      {(shouldShowWordReview || shouldShowPhraseReview) && (
        <ReviewDirectionToggle
          direction={reviewDirection}
          onChange={(direction) => {
            setReviewDirection(direction);
            resetWordCard();
            setPhraseRevealed(false);
          }}
        />
      )}

      {shouldShowPhraseReview && (
        <PhraseReviewCard
          phrase={currentPhrase}
          direction={reviewDirection}
          revealed={phraseRevealed}
          feedback={cardFeedback}
          onReveal={() => setPhraseRevealed(true)}
          onGrade={gradePhrase}
        />
      )}

      {shouldShowWordReview && current && (
        <div ref={reviewCardRef} className="flex flex-1 flex-col pt-2">
          {/* Flashcard */}
          <div className="review-card-stack relative z-0">
            <div
              className={`review-card-smooth relative z-10 flex max-h-[52dvh] min-h-[18rem] flex-col items-center overflow-y-auto rounded-card border border-cream-dark bg-cream-card p-5 text-center ${
                revealed ? "justify-start" : "justify-center"
              } ${
                cardFeedback === "correct"
                  ? "reward-card-lock-in bg-brand-light"
                  : cardFeedback === "learning"
                    ? "reward-card-still-learning ring-2 ring-cream-strong"
                    : ""
              }`}
            >
              <div className="mb-4 flex w-full items-center justify-between gap-3">
                <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">
                  {wordCardIndex}/{Math.max(1, wordSessionTotal)}
                </span>
                <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink-muted">
                  {cardFeedback === "correct"
                    ? "Knew it"
                    : cardFeedback === "learning"
                      ? "Still learning"
                      : revealed
                        ? "Answer side"
                        : "Prompt side"}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {promptLabel(reviewDirection)}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <p className="text-3xl font-bold text-ink">
                  {reviewDirection === "en-fr" ? current.primaryTranslation : current.word}
                </p>
                {reviewDirection === "fr-en" && <SpeakButton text={current.word} />}
              </div>
            {reviewDirection === "fr-en" && current.lemma && current.lemma !== current.word && (
              <p className="text-xs text-ink-muted">from "{current.lemma}"</p>
            )}

            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="ligne-pill mt-6 w-full bg-brand text-cream"
              >
                Show answer
              </button>
            ) : (
              <div className="review-answer-reveal mt-5 w-full border-t border-cream-dark pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Answer</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <p className={`text-xl ${hasTranslation ? "text-ink" : "italic text-ink-muted"}`}>
                    {reviewDirection === "en-fr" ? current.word : current.primaryTranslation}
                  </p>
                  {reviewDirection === "en-fr" && <SpeakButton text={current.word} />}
                </div>
                {reviewDirection === "en-fr" && current.lemma && current.lemma !== current.word && (
                  <p className="mt-1 text-sm text-ink-muted">Lemma: {current.lemma}</p>
                )}
                {reviewDirection === "fr-en" && current.translations.length > 1 && (
                  <p className="mt-1 text-sm text-ink-muted">Also: {current.translations.slice(1).join(", ")}</p>
                )}
                {(current.partOfSpeech || current.gender) && (
                  <p className="mt-1 text-xs text-ink-muted">
                    {current.partOfSpeech}
                    {current.gender && ` - ${current.gender}`}
                  </p>
                )}

                {shouldShowReviewExample(current) && (
                  <div className="mt-4 rounded-2xl bg-cream p-3 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Example</p>
                    <p className="mt-1 text-sm italic text-ink">{current.exampleSentenceFr}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{current.exampleSentenceEn}</p>
                  </div>
                )}

                {current.articleContextSentence && (
                  // Keyed on the word so <details> remounts closed for each
                  // new card — otherwise its native open/closed state would
                  // persist across cards instead of resetting per word.
                  <details key={current.word} className="mt-3 text-left text-xs text-ink-muted">
                    <summary className="cursor-pointer font-semibold uppercase tracking-wide">Show original sentence</summary>
                    <p className="mt-1">"{current.articleContextSentence}"</p>
                  </details>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Grade buttons */}
          <div className="mt-4 pb-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => gradeWord("learning")}
                disabled={!revealed || cardFeedback !== null}
                className="rounded-2xl border border-cream-dark bg-cream-fill px-1 py-3 text-sm font-semibold text-ink-muted disabled:opacity-40"
              >
                Still learning
              </button>
              <button
                type="button"
                onClick={() => gradeWord("knew")}
                disabled={!revealed || cardFeedback !== null}
                className="rounded-2xl border border-brand bg-brand-light px-1 py-3 text-sm font-semibold text-brand disabled:opacity-40"
              >
                Knew it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function shouldShowReviewExample(word: SavedWord): boolean {
  if (!word.exampleSentenceFr || !word.exampleSentenceEn) return false;
  if (word.exampleSentenceFr === word.articleContextSentence) return false;
  if (/^C'est très\s+(mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs)\.?$/i.test(word.exampleSentenceFr)) {
    return false;
  }
  return true;
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-5">
      <p className="ligne-label">Word practice</p>
      <h1 className="ligne-title mt-1 text-[30px]">{title}</h1>
      <p className="ligne-body mt-2">{subtitle}</p>
    </header>
  );
}

function PracticeHubCard({
  wordCount,
  dueToday,
  newWords,
  notDueYet,
  totalLearning,
  phraseCount,
  vocabularyStates,
  mode,
  direction,
  sessionLength,
  onDirectionChange,
  onModeChange,
  onSessionLengthChange,
  onStart,
}: {
  wordCount: number;
  dueToday: number;
  newWords: number;
  notDueYet: number;
  totalLearning: number;
  phraseCount: number;
  vocabularyStates: VocabularyStateItem[];
  mode: "words" | "phrases";
  direction: ReviewDirection;
  sessionLength: number | null;
  onDirectionChange: (direction: ReviewDirection) => void;
  onModeChange: (mode: "words" | "phrases") => void;
  onSessionLengthChange: (value: number | null) => void;
  onStart: () => void;
}) {
  const isPhrases = mode === "phrases";
  const focusCount = vocabularyStates.filter((item) => item.state === "fragile" || item.state === "forgotten").length;
  const readyCopy =
    dueToday > 0 && newWords > 0
      ? `${dueToday} due and ${newWords} new`
      : dueToday > 0
        ? `${dueToday} due`
        : `${newWords} new`;
  const stats = [
    { label: "Due today", value: dueToday },
    { label: "New", value: newWords },
    { label: "Later", value: notDueYet },
    { label: "Total", value: totalLearning },
  ];
  const directionCopy = direction === "fr-en" ? "French-to-English" : "English-to-French";
  // The actual session — what tapping "Review" below is about to start —
  // respects whatever session-length cap is selected. The headline/ready
  // chip intentionally stay uncapped: they're the true due count, giving
  // context for why the button says a smaller number.
  const readyCount = isPhrases ? phraseCount : wordCount;
  const readyNoun = readyCount === 1 ? (isPhrases ? "phrase" : "card") : isPhrases ? "phrases" : "cards";
  const sessionCount = sessionLength != null ? Math.min(readyCount, sessionLength) : readyCount;
  const sessionNoun = sessionCount === 1 ? (isPhrases ? "phrase" : "card") : isPhrases ? "phrases" : "cards";

  return (
    <section className="mb-4 rounded-card border border-cream-dark bg-cream-card p-5">
      <p className="ligne-label text-brand">Practice hub</p>
      <h2 className="mt-1 text-xl font-semibold leading-tight text-ink">
        {readyCount} {readyNoun} ready
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {isPhrases ? "Start a quick phrase review." : `Start with a quick ${directionCopy} review.`}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {isPhrases ? (
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">{phraseCount} to review</span>
        ) : (
          <>
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">{readyCopy}</span>
            {focusCount > 0 && (
              <span className="rounded-full bg-cream-fill px-3 py-1 text-xs font-semibold text-ink-muted">
                {focusCount} need care
              </span>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="ligne-pill mt-4 min-h-12 w-full bg-brand text-cream"
      >
        Review {sessionCount} {sessionNoun}
      </button>

      <details className="mt-3 rounded-2xl bg-cream-sunken px-3 py-2.5">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Review options
        </summary>
        <div className="pb-1">
          {phraseCount > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">Practice type</p>
              <PhraseModeSwitch mode={mode} onChange={onModeChange} phraseCount={phraseCount} />
            </div>
          )}
          <div className="mt-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">Direction</p>
            <ReviewDirectionToggle direction={direction} onChange={onDirectionChange} />
          </div>
          <div className="mt-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">Session length</p>
            <SessionLengthToggle value={sessionLength} onChange={onSessionLengthChange} />
          </div>
        </div>
      </details>
      <Link href={isPhrases ? "/words?tab=phrases" : "/words"} className="mt-2 block text-center text-xs font-semibold text-brand underline underline-offset-2">
        {isPhrases ? "Manage saved phrases" : "Manage saved words"}
      </Link>

      {!isPhrases && (
        <details className="mt-3 rounded-2xl bg-cream-sunken px-3 py-2">
          <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Stats
          </summary>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-cream-dark bg-cream-card p-2 text-center">
                <p className="font-numeral text-xl leading-none text-ink">{item.value}</p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-ink-faint">{item.label}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

const STATE_LABELS: Record<VocabularyDecayState, string> = {
  stable: "Stable",
  emerging: "Emerging",
  fragile: "Fragile",
  forgotten: "Forgotten",
};

const STATE_STYLES: Record<VocabularyDecayState, string> = {
  stable: "bg-brand-light text-brand",
  emerging: "bg-accent-sky text-accent-skytext",
  fragile: "bg-yellow text-yellow-ink",
  forgotten: "bg-rose text-rose-ink",
};

function VocabularyStateSummary({ items }: { items: VocabularyStateItem[] }) {
  const counts = items.reduce<Record<VocabularyDecayState, number>>(
    (acc, item) => ({ ...acc, [item.state]: acc[item.state] + 1 }),
    { stable: 0, emerging: 0, fragile: 0, forgotten: 0 }
  );
  const focus = items.filter((item) => item.state === "fragile" || item.state === "forgotten").slice(0, 3);
  return (
    <section className="mb-4 rounded-card border border-cream-dark bg-cream-card p-4">
      <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Vocabulary health</h2>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {(["stable", "emerging", "fragile", "forgotten"] as const).map((state) => (
          <div key={state} className={`rounded-2xl p-2 ${STATE_STYLES[state]}`}>
            <p className="text-lg font-extrabold">{counts[state]}</p>
            <p className="text-xs font-semibold uppercase tracking-wide">{STATE_LABELS[state]}</p>
          </div>
        ))}
      </div>
      {focus.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold text-ink-muted">Best isolated-review candidates</p>
          {focus.map((item) => (
            <p key={item.word.word} className="text-xs text-ink-muted">
              <span className="font-semibold text-ink">{item.word.lemma ?? item.word.word}</span> - {item.reason}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}


function ReviewDirectionToggle({
  direction,
  onChange,
}: {
  direction: ReviewDirection;
  onChange: (direction: ReviewDirection) => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-cream-fill p-1">
      {[
        { value: "fr-en" as const, label: "French to English" },
        { value: "en-fr" as const, label: "English to French" },
      ].map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={direction === option.value}
          className={`ligne-segmented-button min-h-12 rounded-full px-2 py-2 text-xs font-bold ${
            direction === option.value ? "bg-brand text-cream" : "text-ink-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const SESSION_LENGTH_OPTIONS: { value: number | null; label: string }[] = [
  { value: 10, label: "10 cards" },
  { value: 20, label: "20 cards" },
  { value: null, label: "All cards" },
];

/** Optional cap on how many cards a sitting runs before stopping — lowers the barrier to starting on a day with a big due pile. Persisted via reviewPreferences.ts. */
function SessionLengthToggle({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-full bg-cream-fill p-1">
      {SESSION_LENGTH_OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`ligne-segmented-button min-h-12 rounded-full px-2 py-2 text-xs font-bold ${
            value === option.value ? "bg-brand text-cream" : "text-ink-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
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
    <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-cream-fill p-1">
      <button
        type="button"
        onClick={() => onChange("words")}
        aria-pressed={mode === "words"}
        className={`ligne-segmented-button min-h-12 rounded-full py-2 text-sm font-semibold ${mode === "words" ? "bg-brand text-cream" : "text-ink-muted"}`}
      >
        Words
      </button>
      <button
        type="button"
        onClick={() => onChange("phrases")}
        aria-pressed={mode === "phrases"}
        className={`ligne-segmented-button min-h-12 rounded-full py-2 text-sm font-semibold ${mode === "phrases" ? "bg-brand text-cream" : "text-ink-muted"}`}
      >
        Phrases {phraseCount > 0 ? `(${phraseCount})` : ""}
      </button>
    </div>
  );
}

function PhraseReviewCard({
  phrase,
  direction,
  revealed,
  feedback,
  onReveal,
  onGrade,
}: {
  phrase: SavedPhrase | undefined;
  direction: ReviewDirection;
  revealed: boolean;
  feedback: CardFeedback;
  onReveal: () => void;
  onGrade: (grade: WordGrade) => void;
}) {
  if (!phrase) {
    return (
      <div className="mt-8 rounded-card border border-cream-dark bg-cream-card p-6 text-center">
        <p className="text-sm font-semibold text-ink">No phrase cards due.</p>
        <p className="mt-1 text-xs text-ink-muted">Saved phrases you are still learning will appear here.</p>
      </div>
    );
  }

  const prompt = direction === "en-fr" ? phrase.translation : phrase.phrase;
  return (
    <div className="flex flex-1 flex-col">
      <div className="review-card-stack relative z-0">
        <div
          className={`review-card-smooth relative z-10 rounded-card border border-cream-dark bg-cream-card p-5 ${
            feedback === "correct"
              ? "reward-card-lock-in bg-brand-light"
              : feedback === "learning"
                ? "reward-card-still-learning ring-2 ring-cream-strong"
                : ""
          }`}
        >
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">Phrase card</span>
          <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink-muted">
            {revealed ? "Answer side" : "Prompt side"}
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{promptLabel(direction)}</p>
        <div className="mt-3 flex items-center gap-2">
          <p className="flex-1 rounded-2xl bg-cream px-3 py-3 text-lg font-semibold leading-relaxed text-ink">{prompt}</p>
          {direction === "fr-en" && <SpeakButton text={phrase.phrase} />}
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={onReveal}
            className="ligne-pill mt-4 w-full bg-brand text-cream"
          >
            Show answer
          </button>
        ) : (
          <div className="review-answer-reveal mt-4 space-y-3 border-t border-cream-dark pt-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink">
                {phrase.phrase} = {phrase.translation}
              </p>
              {direction === "en-fr" && <SpeakButton text={phrase.phrase} />}
            </div>
            <div className="rounded-2xl bg-cream p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Original sentence</p>
              <p className="mt-1 text-sm italic text-ink">{phrase.contextSentence}</p>
            </div>
            <div className="rounded-2xl bg-cream p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">New example</p>
              <p className="mt-1 text-sm italic text-ink">On peut {phrase.phrase} cette idee dans un autre article.</p>
              <p className="mt-0.5 text-sm text-ink-muted">You can use this phrase with the same idea in another article.</p>
            </div>
            <p className="text-xs text-ink-muted">
              Register: <span className="font-semibold">{phrase.partOfSpeech?.includes("formal") ? "formal" : "neutral"}</span>
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onGrade("learning")}
            disabled={!revealed || feedback !== null}
            className="rounded-2xl border border-cream-dark bg-cream-fill px-1 py-3 text-sm font-semibold text-ink-muted disabled:opacity-40"
          >
            Still learning
          </button>
          <button
            type="button"
            onClick={() => onGrade("knew")}
            disabled={!revealed || feedback !== null}
            className="rounded-2xl border border-brand bg-brand-light px-1 py-3 text-sm font-semibold text-brand disabled:opacity-40"
          >
            Knew it
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
