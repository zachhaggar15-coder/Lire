"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { texts as hardcodedTexts } from "@/data/texts";
import type { SavedWord } from "@/types";
import { getSavedWords, markWordAsKnown, recordReviewResult } from "@/lib/storage";
import { getSavedPhrases, markPhraseKnown, type SavedPhrase } from "@/lib/phrases";
import { getCustomTexts } from "@/lib/customTexts";
import { getOfflineRssTexts } from "@/lib/rss/rssTextCache";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { buildReviewQueue, getReviewStats } from "@/lib/spacedRepetition";
import {
  applyTypedWordCorrectPass,
  clearTypedWordCorrectPass,
  getTypedWordCorrectPasses,
  type WordReviewConfirmationPasses,
} from "@/lib/reviewSession";
import { getAllInferenceResults, getAllWordTaps } from "@/lib/wordLearning";
import { buildContextualReviewArticles, classifyVocabularyStates, type ContextualReviewArticle, type VocabularyDecayState, type VocabularyStateItem } from "@/lib/readingAnalytics";
import { recordReviewSuccessXp } from "@/lib/gamification";
import { trackEvent } from "@/lib/analytics/client";
import { updateValidationState } from "@/lib/validation/state";

type ReviewDirection = "fr-en" | "en-fr";
type ReviewGrade = "knew" | "repeat" | "missed";
type CardFeedback = "correct" | "repeat" | "missed" | null;

const REVIEW_FEEDBACK_DELAY_MS = 760;

function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateVariants(value: string): string[] {
  const pieces = value
    .split(/[,;/]|\bor\b|\(|\)/i)
    .map((part) => part.trim())
    .filter(Boolean);
  const values = pieces.length > 0 ? pieces : [value];
  return values.flatMap((part) => {
    const withoutTo = part.replace(/^to\s+/i, "");
    const withoutArticle = part.replace(/^(a|an|the)\s+/i, "");
    return [part, withoutTo, withoutArticle];
  });
}

function answerMatches(input: string, candidates: string[]): boolean {
  const normalizedInput = normalizeAnswer(input);
  if (!normalizedInput) return false;
  const compactInput = normalizedInput.replace(/\s+/g, "");

  return candidates
    .flatMap(candidateVariants)
    .some((candidate) => {
      const normalizedCandidate = normalizeAnswer(candidate);
      if (!normalizedCandidate) return false;
      return normalizedInput === normalizedCandidate || compactInput === normalizedCandidate.replace(/\s+/g, "");
    });
}

function wordAnswerCandidates(word: SavedWord, direction: ReviewDirection): string[] {
  if (direction === "en-fr") {
    return [word.word, word.lemma ?? ""].filter(Boolean);
  }
  return [word.primaryTranslation, ...word.translations].filter(
    (translation) => translation && translation !== NOT_TRANSLATED_YET
  );
}

function phraseAnswerCandidates(phrase: SavedPhrase, direction: ReviewDirection): string[] {
  return direction === "en-fr"
    ? [phrase.phrase, phrase.lemma].filter(Boolean)
    : [phrase.translation].filter(Boolean);
}

function promptLabel(direction: ReviewDirection): string {
  return direction === "en-fr" ? "English to French" : "French to English";
}

export default function ReviewPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [ready, setReady] = useState(false);
  const [wordQueue, setWordQueue] = useState<SavedWord[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [score, setScore] = useState({ knew: 0, missed: 0 });
  const [articleFilter, setArticleFilter] = useState<string | null>(null);
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [sessionPhraseQueue, setSessionPhraseQueue] = useState<SavedPhrase[]>([]);
  const [reviewMode, setReviewMode] = useState<"words" | "phrases">("words");
  const [reviewDirection, setReviewDirection] = useState<ReviewDirection>("fr-en");
  const [reviewStarted, setReviewStarted] = useState(false);
  const [phraseTypedAnswer, setPhraseTypedAnswer] = useState("");
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const [xpNotice, setXpNotice] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>(null);
  const [wordConfirmationPasses, setWordConfirmationPasses] = useState<WordReviewConfirmationPasses>({});
  const [wordFeedbackMessage, setWordFeedbackMessage] = useState<string | null>(null);
  const [contextualArticles, setContextualArticles] = useState<ContextualReviewArticle[]>([]);
  const reviewSessionStarted = useRef(false);
  const reviewSessionCompleted = useRef(false);
  const [wordSessionTotal, setWordSessionTotal] = useState(0);
  const [phraseSessionTotal, setPhraseSessionTotal] = useState(0);
  const phraseScore = useRef({ correct: 0, total: 0 });
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
    const initialWordQueue = buildReviewQueue(visibleSavedWords);
    const initialPhraseQueue = visibleSavedPhrases.filter((phrase) => phrase.status !== "known");
    setArticleFilter(article);
    setWords(visibleSavedWords);
    setPhrases(visibleSavedPhrases);
    setWordQueue(initialWordQueue);
    setSessionPhraseQueue(initialPhraseQueue);
    setWordSessionTotal(initialWordQueue.length);
    setPhraseSessionTotal(initialPhraseQueue.length);
    setContextualArticles(
      buildContextualReviewArticles(
        [...getCustomTexts(), ...getOfflineRssTexts(), ...hardcodedTexts],
        visibleSavedWords,
        getAllWordTaps(),
        3
      )
    );
    if (visibleSavedWords.length === 0 && visibleSavedPhrases.length > 0) {
      setReviewMode("phrases");
    }
    if (initialWordQueue.length > 0) {
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
  const done = reviewMode === "words" && ready && reviewStarted && wordSessionTotal > 0 && wordQueue.length === 0;
  const hasTranslation = current && current.primaryTranslation !== NOT_TRANSLATED_YET;
  const typedAnswerCorrect = current ? answerMatches(typedAnswer, wordAnswerCandidates(current, reviewDirection)) : false;
  const currentWordCorrectPasses = current ? getTypedWordCorrectPasses(wordConfirmationPasses, current.word) : 0;

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
    shouldScrollToReviewCard.current = true;
    setReviewStarted(true);
  }

  function resetWordCard() {
    setTypedAnswer("");
    setRevealed(false);
    setWordFeedbackMessage(null);
  }

  function submitCorrectWordAnswer(answerValue = typedAnswer) {
    if (!current || cardFeedback) return;
    if (!answerMatches(answerValue, wordAnswerCandidates(current, reviewDirection))) return;

    const passResult = applyTypedWordCorrectPass(wordConfirmationPasses, current.word);
    const savedAsKnown = passResult.outcome === "known";
    const nextScore = {
      knew: score.knew + (savedAsKnown ? 1 : 0),
      missed: score.missed,
    };
    setWordConfirmationPasses(passResult.confirmationPasses);
    setRevealed(true);
    setCardFeedback("correct");
    setWordFeedbackMessage(savedAsKnown ? "Saved as known" : "Correct. One more time.");
    trackEvent("review_answer_submitted", {
      mode: "words",
      correct: true,
      typedCorrect: true,
      grade: savedAsKnown ? "knew" : "repeat",
      typedPass: savedAsKnown ? 2 : 1,
      cardIndex: Math.min(score.knew + score.missed + 1, Math.max(1, wordSessionTotal)),
      totalCards: wordSessionTotal || wordQueue.length,
      articleFiltered: !!articleFilter,
    });
    if (savedAsKnown) {
      const xp = recordReviewSuccessXp(current.word);
      if (xp > 0) {
        setXpNotice(`+${xp} XP`);
        window.setTimeout(() => setXpNotice(null), 1600);
      }
    }
    if (cardFeedbackTimeout.current) clearTimeout(cardFeedbackTimeout.current);
    cardFeedbackTimeout.current = setTimeout(() => {
      const remainingQueue = wordQueue.slice(1);
      const nextQueue = savedAsKnown ? remainingQueue : [...remainingQueue, current];
      if (savedAsKnown) recordReviewResult(current.word, "correct");
      const nextWords = savedAsKnown
        ? visibleWords(markWordAsKnown(current.word))
        : visibleWords(getSavedWords());
      setWords(nextWords);
      setWordQueue(nextQueue);
      setScore(nextScore);
      resetWordCard();
      if (nextQueue.length === 0) completeReviewSession("words", wordSessionTotal, nextScore.knew);
      setCardFeedback(null);
      cardFeedbackTimeout.current = null;
    }, REVIEW_FEEDBACK_DELAY_MS);
  }

  function answer(grade: Exclude<ReviewGrade, "knew">) {
    if (!current || cardFeedback) return;
    const nextScore = {
      knew: score.knew,
      missed: score.missed + 1,
    };
    setRevealed(true);
    setWordConfirmationPasses((passes) => clearTypedWordCorrectPass(passes, current.word));
    setWordFeedbackMessage(grade === "repeat" ? "Still in the deck" : "Needs review later");
    setCardFeedback(grade === "repeat" ? "repeat" : "missed");
    trackEvent("review_answer_submitted", {
      mode: "words",
      correct: false,
      typedCorrect: typedAnswerCorrect,
      grade,
      cardIndex: Math.min(score.knew + score.missed + 1, Math.max(1, wordSessionTotal)),
      totalCards: wordSessionTotal || wordQueue.length,
      articleFiltered: !!articleFilter,
    });
    if (cardFeedbackTimeout.current) clearTimeout(cardFeedbackTimeout.current);
    cardFeedbackTimeout.current = setTimeout(() => {
      const nextWords = visibleWords(recordReviewResult(current.word, "incorrect"));
      const remainingQueue = wordQueue.slice(1);
      const nextQueue = grade === "repeat" ? [...remainingQueue, current] : remainingQueue;
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
    const nextWordQueue = buildReviewQueue(nextWords);
    const nextPhraseQueue = nextPhrases.filter((phrase) => phrase.status !== "known");
    setWords(nextWords);
    setPhrases(nextPhrases);
    setWordQueue(nextWordQueue);
    setSessionPhraseQueue(nextPhraseQueue);
    setWordSessionTotal(nextWordQueue.length);
    setPhraseSessionTotal(nextPhraseQueue.length);
    resetWordCard();
    setPhraseTypedAnswer("");
    setPhraseRevealed(false);
    setReviewStarted(nextWordQueue.length > 0 && reviewMode === "words");
    setScore({ knew: 0, missed: 0 });
    setCardFeedback(null);
    setWordConfirmationPasses({});
    setWordFeedbackMessage(null);
    phraseScore.current = { correct: 0, total: 0 };
    reviewSessionStarted.current = false;
    reviewSessionCompleted.current = false;
  }

  function answerPhrase(grade: ReviewGrade, typedCorrect: boolean) {
    if (!currentPhrase || cardFeedback) return;
    const correct = grade === "knew";
    phraseScore.current = {
      correct: phraseScore.current.correct + (correct ? 1 : 0),
      total: phraseScore.current.total + 1,
    };
    setPhraseRevealed(true);
    setCardFeedback(grade === "knew" ? "correct" : grade === "repeat" ? "repeat" : "missed");
    trackEvent("review_answer_submitted", {
      mode: "phrases",
      correct,
      typedCorrect,
      grade,
      cardIndex: Math.min(phraseScore.current.total, Math.max(1, phraseSessionTotal)),
      totalCards: phraseSessionTotal || sessionPhraseQueue.length,
      articleFiltered: !!articleFilter,
    });

    if (cardFeedbackTimeout.current) clearTimeout(cardFeedbackTimeout.current);
    cardFeedbackTimeout.current = setTimeout(() => {
      if (correct) {
        markPhraseKnown(currentPhrase.phrase);
        setPhrases(articleFilter ? getSavedPhrases().filter((phrase) => phrase.sourceTextTitle === articleFilter) : getSavedPhrases());
      }
      const remainingQueue = sessionPhraseQueue.slice(1);
      const nextQueue = grade === "repeat" ? [...remainingQueue, currentPhrase] : remainingQueue;
      setSessionPhraseQueue(nextQueue);
      setPhraseTypedAnswer("");
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
          <p className="font-numeral text-2xl leading-none text-ink">{s.value}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">{s.label}</p>
        </div>
      ))}
    </div>
  );

  const shouldShowWordStart = reviewMode === "words" && !!current && !reviewStarted;
  const shouldShowWordReview = reviewMode === "words" && !!current && reviewStarted;
  const remainingPhraseCount = sessionPhraseQueue.length;
  const shouldShowPracticeHub = shouldShowWordStart;
  const reviewProgressLabel =
    !ready
      ? ""
      : reviewMode === "phrases"
        ? `${remainingPhraseCount} ${remainingPhraseCount === 1 ? "phrase" : "phrases"}`
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
        <PageHeader title="Review" subtitle={articleFilter ? `From: ${articleFilter}` : "Typing checks itself."} />
        <div className="mt-16 text-center">
          <p className="text-ink-muted">{articleFilter ? "No saved words from this article yet." : "Nothing to review yet."}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {articleFilter
              ? "Add words to review while reading, then come back here."
              : "Words you add to review while reading show up here."}
          </p>
          <Link
            href="/"
            className="ligne-pill mt-3 inline-block bg-brand text-cream"
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
        {statsBar}
        <div className="mt-8 rounded-card border border-cream-dark bg-cream-card p-5 text-center">
          <p className="mt-2 text-lg font-semibold text-ink">All done!</p>
          <p className="mt-1 text-sm text-ink-muted">
            Known: {score.knew} - Needs another look: {score.missed}
          </p>
          <button
            onClick={restart}
            className="ligne-pill mt-5 bg-brand text-cream"
          >
            Check for more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ligne-screen flex min-h-[70vh] flex-col">
      <header className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="ligne-label">Word practice</p>
          <h1 className="mt-1 text-[30px] font-semibold leading-none text-ink">Review</h1>
          {articleFilter && <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">From: {articleFilter}</p>}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">
          {reviewProgressLabel}
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
          direction={reviewDirection}
          onDirectionChange={(direction) => {
            setReviewDirection(direction);
            resetWordCard();
            setPhraseTypedAnswer("");
            setPhraseRevealed(false);
          }}
          onModeChange={setReviewMode}
          onStart={startWordReview}
        />
      )}

      {!shouldShowPracticeHub && !shouldShowWordReview && reviewMode === "words" && statsBar}

      {!shouldShowPracticeHub && !shouldShowWordReview && reviewMode === "words" && vocabularyStates.length > 0 && (
        <VocabularyStateSummary items={vocabularyStates} />
      )}

      {!shouldShowPracticeHub && phrases.length > 0 && (
        <PhraseModeSwitch mode={reviewMode} onChange={setReviewMode} phraseCount={sessionPhraseQueue.length} />
      )}

      {(shouldShowWordReview || reviewMode === "phrases") && (
        <ReviewDirectionToggle
          direction={reviewDirection}
          onChange={(direction) => {
            setReviewDirection(direction);
            resetWordCard();
            setPhraseTypedAnswer("");
            setPhraseRevealed(false);
          }}
        />
      )}

      {reviewMode === "phrases" && (
        <PhraseReviewCard
          phrase={currentPhrase}
          direction={reviewDirection}
          typedAnswer={phraseTypedAnswer}
          revealed={phraseRevealed}
          feedback={cardFeedback}
          onAnswerChange={(value) => {
            setPhraseTypedAnswer(value);
            setPhraseRevealed(false);
          }}
          onCheck={() => setPhraseRevealed(true)}
          onGrade={answerPhrase}
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
                  : cardFeedback === "repeat" || cardFeedback === "missed"
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
                    ? "Correct"
                    : currentWordCorrectPasses > 0
                      ? "1 tick earned"
                      : revealed
                        ? "Answer side"
                        : "Prompt side"}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {promptLabel(reviewDirection)}
              </p>
              <p className="mt-2 text-3xl font-bold text-ink">
                {reviewDirection === "en-fr" ? current.primaryTranslation : current.word}
              </p>
            {reviewDirection === "fr-en" && current.lemma && current.lemma !== current.word && (
              <p className="text-xs text-ink-muted">from "{current.lemma}"</p>
            )}

            <form
              className="mt-6 w-full"
              onSubmit={(event) => {
                event.preventDefault();
                if (!typedAnswer.trim()) return;
                if (typedAnswerCorrect) {
                  submitCorrectWordAnswer();
                } else {
                  setRevealed(true);
                }
              }}
            >
              <label htmlFor="word-review-answer" className="sr-only">
                {reviewDirection === "en-fr" ? "Type the French" : "Type the English"}
              </label>
              <input
                id="word-review-answer"
                type="text"
                value={typedAnswer}
                onChange={(event) => {
                  const nextAnswer = event.target.value;
                  setTypedAnswer(nextAnswer);
                  setRevealed(false);
                  setWordFeedbackMessage(null);
                  if (current && answerMatches(nextAnswer, wordAnswerCandidates(current, reviewDirection))) {
                    submitCorrectWordAnswer(nextAnswer);
                  }
                }}
                placeholder={reviewDirection === "en-fr" ? "Type the French" : "Type the English"}
                autoCapitalize="none"
                autoCorrect="off"
                disabled={cardFeedback !== null}
                className="w-full rounded-2xl bg-cream px-4 py-3 text-center text-base font-semibold text-ink outline-none ring-1 ring-cream-dark transition-shadow focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!typedAnswer.trim() || cardFeedback !== null}
                className="ligne-pill mt-3 w-full bg-brand text-cream disabled:opacity-40"
              >
                {typedAnswerCorrect ? "Correct" : "Show answer"}
              </button>
              {wordFeedbackMessage && (
                <div
                  aria-live="polite"
                  className={`mt-3 inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
                    cardFeedback === "correct"
                      ? "bg-brand-light text-brand"
                      : "bg-cream-fill text-ink-muted"
                  }`}
                >
                  {cardFeedback === "correct" && (
                    <span
                      aria-hidden="true"
                      className="grid h-5 w-5 place-items-center rounded-full bg-brand text-xs text-cream"
                    >
                      {"\u2713"}
                    </span>
                  )}
                  <span>{wordFeedbackMessage}</span>
                </div>
              )}
            </form>

              {revealed && (
              <div className="review-answer-reveal mt-5 w-full border-t border-cream-dark pt-5">
                <p className={`text-sm font-bold ${typedAnswerCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                  {typedAnswerCorrect ? "Looks right." : "Check it against the answer."}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand">Answer</p>
                <p className={`mt-1 text-xl ${hasTranslation ? "text-ink" : "italic text-ink-muted"}`}>
                  {reviewDirection === "en-fr" ? current.word : current.primaryTranslation}
                </p>
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
                  <p className="mt-3 text-xs text-ink-muted">
                    <span className="font-semibold uppercase tracking-wide">Original article context: </span>
                    "{current.articleContextSentence}"
                  </p>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Answer buttons */}
          <div className="mt-4 pb-6">
            <div className="rounded-card border border-cream-dark bg-cream-card p-2">
              <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold text-ink-muted">
                <span>Need help?</span>
                <span>{revealed ? "Keep practicing or move on" : "Correct typing checks itself"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => answer("repeat")}
                  disabled={!revealed || cardFeedback !== null}
                  className="rounded-2xl border border-cream-dark bg-cream-fill px-1 py-3 text-xs font-semibold text-ink-muted active:scale-95 disabled:opacity-40"
                >
                  Keep in deck
                </button>
                <button
                  onClick={() => answer("missed")}
                  disabled={cardFeedback !== null}
                  className="rounded-2xl border border-cream-dark bg-rose px-1 py-3 text-xs font-semibold text-rose-ink active:scale-95 disabled:opacity-40"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!shouldShowWordReview && contextualArticles.length > 0 && (
        <ContextualArticleReview items={contextualArticles} />
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
      <h1 className="mt-1 text-[30px] font-semibold leading-none text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
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
  direction,
  onDirectionChange,
  onModeChange,
  onStart,
}: {
  wordCount: number;
  dueToday: number;
  newWords: number;
  notDueYet: number;
  totalLearning: number;
  phraseCount: number;
  vocabularyStates: VocabularyStateItem[];
  direction: ReviewDirection;
  onDirectionChange: (direction: ReviewDirection) => void;
  onModeChange: (mode: "words" | "phrases") => void;
  onStart: () => void;
}) {
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

  return (
    <section className="mb-4 rounded-card border border-cream-dark bg-cream-card p-5">
      <p className="ligne-label text-brand">Practice hub</p>
      <h2 className="mt-1 text-xl font-semibold leading-tight text-ink">
        {wordCount} {wordCount === 1 ? "card" : "cards"} ready
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        Start with a quick {directionCopy} review. No setup needed; options are here if you want them.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">{readyCopy}</span>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink-muted">
          {promptLabel(direction)}
        </span>
        {focusCount > 0 && (
          <span className="rounded-full bg-cream-fill px-3 py-1 text-xs font-semibold text-ink-muted">
            {focusCount} need care
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onStart}
        className="ligne-pill mt-4 w-full bg-brand text-cream"
      >
        Start quick review
      </button>

      <details className="mt-3 rounded-2xl bg-cream-sunken px-3 py-2">
        <summary className="cursor-pointer font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Review options
        </summary>
        <div className="mt-3 space-y-3">
          {phraseCount > 0 && (
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">Practice type</p>
              <PhraseModeSwitch mode="words" onChange={onModeChange} phraseCount={phraseCount} />
            </div>
          )}
          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">Direction</p>
            <ReviewDirectionToggle direction={direction} onChange={onDirectionChange} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-cream-dark bg-cream-card p-2 text-center">
                <p className="font-numeral text-xl leading-none text-ink">{item.value}</p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-ink-faint">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </details>
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
      <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">Vocabulary health</h2>
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

function ContextualArticleReview({ items }: { items: ContextualReviewArticle[] }) {
  return (
    <section className="mb-4 rounded-card border border-cream-dark bg-cream-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">Review in context</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Articles that contain words currently due for review.</p>
        </div>
        <Link href="/" className="shrink-0 text-xs font-semibold text-brand underline underline-offset-2">
          More
        </Link>
      </div>
      <div className="mt-3 space-y-2">
        {items.map(({ article, dueWords, fragileCount }) => (
          <Link
            key={article.id}
            href={`/reader/${article.id}`}
            className="block rounded-2xl bg-cream-sunken px-3 py-2 active:bg-cream-fill"
          >
            <p className="line-clamp-1 text-sm font-bold text-ink">{article.title}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {dueWords.length} due {dueWords.length === 1 ? "word" : "words"}
              {fragileCount > 0 ? ` - ${fragileCount} fragile` : ""}
            </p>
            <p className="mt-1 line-clamp-1 text-xs font-semibold text-brand">
              {dueWords.slice(0, 4).map((word) => word.lemma ?? word.word).join(" - ")}
            </p>
          </Link>
        ))}
      </div>
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
          className={`rounded-full px-2 py-2 text-xs font-bold transition-colors ${
            direction === option.value ? "bg-brand text-cream" : "text-ink-muted"
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
        className={`rounded-full py-2 text-sm font-semibold ${mode === "words" ? "bg-brand text-cream" : "text-ink-muted"}`}
      >
        Words
      </button>
      <button
        type="button"
        onClick={() => onChange("phrases")}
        className={`rounded-full py-2 text-sm font-semibold ${mode === "phrases" ? "bg-brand text-cream" : "text-ink-muted"}`}
      >
        Phrases {phraseCount > 0 ? `(${phraseCount})` : ""}
      </button>
    </div>
  );
}

function PhraseReviewCard({
  phrase,
  direction,
  typedAnswer,
  revealed,
  feedback,
  onAnswerChange,
  onCheck,
  onGrade,
}: {
  phrase: SavedPhrase | undefined;
  direction: ReviewDirection;
  typedAnswer: string;
  revealed: boolean;
  feedback: CardFeedback;
  onAnswerChange: (value: string) => void;
  onCheck: () => void;
  onGrade: (grade: ReviewGrade, typedCorrect: boolean) => void;
}) {
  if (!phrase) {
    return (
      <div className="mt-8 rounded-card border border-cream-dark bg-cream-card p-6 text-center">
        <p className="text-sm font-semibold text-ink">No phrase cards due.</p>
        <p className="mt-1 text-xs text-ink-muted">Saved phrases you are still learning will appear here.</p>
      </div>
    );
  }

  const typedCorrect = answerMatches(typedAnswer, phraseAnswerCandidates(phrase, direction));
  const prompt = direction === "en-fr" ? phrase.translation : phrase.phrase;
  return (
    <div className="flex flex-1 flex-col">
      <div className="review-card-stack relative z-0">
        <div
          className={`review-card-smooth relative z-10 rounded-card border border-cream-dark bg-cream-card p-5 ${
            feedback === "correct"
              ? "reward-card-lock-in bg-brand-light"
              : feedback === "repeat" || feedback === "missed"
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
        <p className="mt-3 rounded-2xl bg-cream px-3 py-3 text-lg font-semibold leading-relaxed text-ink">{prompt}</p>
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (typedAnswer.trim()) onCheck();
          }}
        >
          <label htmlFor="phrase-review-answer" className="sr-only">
            {direction === "en-fr" ? "Type the French phrase" : "Type the English meaning"}
          </label>
          <input
            id="phrase-review-answer"
            type="text"
            value={typedAnswer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder={direction === "en-fr" ? "Type the French phrase" : "Type the English meaning"}
            autoCapitalize="none"
            autoCorrect="off"
            disabled={feedback !== null}
            className="w-full rounded-2xl bg-cream px-4 py-3 text-center text-base font-semibold text-ink outline-none ring-1 ring-cream-dark transition-shadow focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!typedAnswer.trim() || feedback !== null}
            className="ligne-pill mt-3 w-full bg-brand text-cream disabled:opacity-40"
          >
            Check answer
          </button>
        </form>

        {revealed && (
          <div className="review-answer-reveal mt-4 space-y-3 border-t border-cream-dark pt-4">
            <p className={`text-sm font-semibold ${typedCorrect ? "text-emerald-700" : "text-amber-700"}`}>
              {typedCorrect ? "Looks right." : "Check it against the answer."}
            </p>
            <p className="text-sm font-semibold text-ink">
              {phrase.phrase} = {phrase.translation}
            </p>
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

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { grade: "knew" as const, label: "Knew it", className: "border-brand bg-brand-light text-brand", disabled: !revealed },
            { grade: "repeat" as const, label: "One more time", className: "border-cream-dark bg-cream-fill text-ink-muted", disabled: !revealed },
            { grade: "missed" as const, label: "No idea", className: "border-cream-dark bg-rose text-rose-ink", disabled: false },
          ].map((option) => (
            <button
              key={option.grade}
              type="button"
              onClick={() => onGrade(option.grade, typedCorrect)}
              disabled={option.disabled || feedback !== null}
              className={`rounded-2xl border px-1 py-3 text-xs font-semibold active:scale-95 disabled:opacity-40 ${option.className}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
