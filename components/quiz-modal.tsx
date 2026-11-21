'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw, X, HelpCircle } from 'lucide-react';
import api from '@/lib/api';

interface Question {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  questions: Question[];
  sessionId?: string;
  onQuizCompleted?: (score: number, total: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  topic,
  questions,
  onQuizCompleted
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQ.correctOptionIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setWeakAreas(prev => [...prev, currentQ.questionText.slice(0, 45) + '...']);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      try {
        await api.post('/quiz/attempt', {
          topic,
          score,
          totalQuestions: questions.length,
          weakAreas
        });
        if (onQuizCompleted) onQuizCompleted(score, questions.length);
      } catch (e) {
        console.error('Failed to record attempt:', e);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setWeakAreas([]);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-neutral-900 text-base">Practice Quiz: {topic}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div className="p-6 flex flex-col">
            <div className="flex justify-between items-center text-xs text-neutral-500 mb-2 font-medium">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="font-bold text-emerald-700">Score: {score}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mb-6 border border-neutral-200">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h4 className="text-lg font-bold text-neutral-900 mb-6 leading-relaxed">
              {currentQ.questionText}
            </h4>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300';
                if (isAnswerSubmitted) {
                  if (idx === currentQ.correctOptionIndex) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                  } else {
                    btnStyle = 'border-neutral-200 bg-neutral-50 text-neutral-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 shadow-sm ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border border-neutral-300 text-xs flex items-center justify-center font-bold text-neutral-600 shadow-xs">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </div>
                    {isAnswerSubmitted && idx === currentQ.correctOptionIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && idx === selectedOption && idx !== currentQ.correctOptionIndex && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {isAnswerSubmitted && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs text-neutral-700 mb-6 animate-in fade-in duration-200">
                <p className="font-bold text-emerald-700 mb-1">Concept Explanation:</p>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Footer action */}
            {isAnswerSubmitted && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-emerald-700/20"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Summary'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished State */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-2xl font-extrabold text-neutral-900 mb-2">Quiz Completed!</h4>
            <p className="text-neutral-600 text-sm mb-6">
              You scored <span className="font-bold text-neutral-900 text-lg">{score}</span> out of{' '}
              <span className="font-bold text-neutral-900 text-lg">{questions.length}</span> ({Math.round((score / questions.length) * 100)}%)
            </p>

            {score === questions.length ? (
              <p className="text-emerald-800 text-sm mb-6 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 font-medium">
                Outstanding! You demonstrated complete conceptual mastery of {topic}!
              </p>
            ) : (
              <p className="text-amber-800 text-sm mb-6 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200 font-medium">
                Practice recorded in your Learning Profile. Review the topic explanations to strengthen concepts!
              </p>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-sm font-bold transition-colors border border-neutral-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-emerald-700/20"
              >
                Continue Discussion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
