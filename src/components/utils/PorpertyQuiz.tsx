'use client';

import { useQuizStore } from '@/stores/quizStore';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React, { useState, ReactNode, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';

const stepTitles = [
  'Let’s find your ideal property.',
  'What’s your budget range?',
  'Which locations do you like?',
  'How many people will live with you?',
  'Pick your top 2 priorities.',
];

const locationOptions = [
  'Iskandar Puteri',
  'Skudai',
  'Johor Bahru',
  'Tebrau/Austin',
  'Masai/Pasir Gudang',
  'Kulai/Senai',
];

const MIN_PRICE = 50000;
const MAX_PRICE = 2000000;
const STEP = 10000;

const priorityOptions = ['Price', 'House Size', 'Location'];

const variants: Variants = {
  initial: (dir: number) => ({
    x: dir > 0 ? 100 : -100,
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] as any }
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as any }
  }),
};

interface QuizButtonProps {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const QuizButton: React.FC<QuizButtonProps> = ({ 
  children, 
  selected,
  onClick,
  className = '',
  disabled = false
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 px-6 rounded-xl border-2 text-lg transition-all
      ${selected 
        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
        : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className}`}
  >
    {children}
  </button>
);

export default function PropertyQuiz() {
  const {
    step,
    nextStep,
    prevStep,
    setData,
    purpose,
    budget,
    locations,
    peopleCount,
    priorities,
    reset,
  } = useQuizStore();

  const [direction, setDirection] = useState(1);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchesFound, setMatchesFound] = useState<boolean | null>(null);

  // Validate current step
  useEffect(() => {
    let valid = false;
    setError('');
    
    switch (step) {
      case 0:
        valid = purpose !== undefined;
        if (!valid) setError('Please select a purpose');
        break;
        
      case 1:
        valid = budget !== undefined && 
                budget[0] >= MIN_PRICE && 
                budget[1] <= MAX_PRICE &&
                budget[0] < budget[1];
        if (!valid) setError('Please set a valid budget range');
        break;
        
      case 2:
        valid = locations.length > 0 && locations.length <= 3;
        if (!valid) {
          if (locations.length === 0) {
            setError('Please select at least one location');
          } else {
            setError('Maximum 3 locations allowed');
          }
        }
        break;
        
      case 3:
        valid = peopleCount !== undefined;
        if (!valid) setError('Please select number of people');
        break;
        
      case 4:
        valid = priorities.length >= 1 && priorities.length <= 2;
        if (!valid) setError('Please select 1-2 priorities');
        break;
        
      default:
        valid = true;
    }
    
    setIsValid(valid);
  }, [step, purpose, budget, locations, peopleCount, priorities]);

  // Handle loading state
  useEffect(() => {
    if (step === stepTitles.length) {
      setIsLoading(true);
      setMatchesFound(null);
      
      // Simulate API call
      const timer = setTimeout(() => {
        // Replace with actual matching logic
        const hasMatches = Math.random() > 0.3; 
        setMatchesFound(hasMatches);
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    if (!isValid) return;
    setDirection(1);
    if (step <= stepTitles.length) nextStep();
  };

  const handleBack = () => {
    setDirection(-1);
    if (step > 0) prevStep();
  };

  const toggleItem = (list: string[], item: string, max = Infinity) => {
    if (list.includes(item)) return list.filter(i => i !== item);
    if (list.length < max) return [...list, item];
    return list;
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{stepTitles[step]}</h2>
            {['Investment', 'Own Stay', 'Both'].map(option => (
              <QuizButton
                key={option}
                selected={purpose === option}
                onClick={() => {
                  setData({ purpose: option as any });
                }}
              >
                {option}
              </QuizButton>
            ))}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{stepTitles[step]}</h2>

            <div className="text-center font-medium text-blue-600 py-2">
              RM{(budget[0] / 1000).toFixed(0)}k - RM{(budget[1] / 1000).toFixed(0)}k
            </div>

            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-6"
              value={budget}
              onValueChange={(val) => setData({ budget: val as [number, number] })}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={STEP}
              minStepsBetweenThumbs={1}
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb 
                className="block w-5 h-5 bg-blue-600 rounded-full shadow-md cursor-pointer"
                aria-label="Minimum price"
              />
              <Slider.Thumb 
                className="block w-5 h-5 bg-blue-600 rounded-full shadow-md cursor-pointer"
                aria-label="Maximum price"
              />
            </Slider.Root>

            <div className="flex gap-4 pt-2">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600">Min Price</label>
                <input
                  type="number"
                  className="w-full mt-1 p-3 border rounded-lg"
                  min={MIN_PRICE}
                  max={budget[1] - STEP}
                  value={budget[0]}
                  onChange={(e) => {
                    const newVal = Math.min(
                      Math.max(Number(e.target.value) || MIN_PRICE, MIN_PRICE),
                      budget[1] - STEP
                    );
                    setData({ budget: [newVal, budget[1]] });
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600">Max Price</label>
                <input
                  type="number"
                  className="w-full mt-1 p-3 border rounded-lg"
                  min={budget[0] + STEP}
                  max={MAX_PRICE}
                  value={budget[1]}
                  onChange={(e) => {
                    const newVal = Math.max(
                      Math.min(Number(e.target.value) || MAX_PRICE, MAX_PRICE),
                      budget[0] + STEP
                    );
                    setData({ budget: [budget[0], newVal] });
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold">{stepTitles[step]}</h2>
              <span className="text-sm text-gray-500">
                {locations.length}/3 selected
              </span>
            </div>
            {locationOptions.map(option => (
              <QuizButton
                key={option}
                selected={locations.includes(option)}
                onClick={() => setData({ 
                  locations: toggleItem(locations, option, 3) 
                })}
                className="py-3"
                disabled={locations.length >= 3 && !locations.includes(option)}
              >
                {option}
              </QuizButton>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{stepTitles[step]}</h2>
            {['1-2', '3-5', '5+'].map(option => (
              <QuizButton
                key={option}
                selected={peopleCount === option}
                onClick={() => {
                  setData({ peopleCount: option });
                }}
              >
                {option} People
              </QuizButton>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                {stepTitles[step]}
              </h2>
              <span className="text-sm font-normal text-gray-500">
                {priorities.length}/2 selected
              </span>
            </div>
            {priorityOptions.map(option => (
              <QuizButton
                key={option}
                selected={priorities.includes(option)}
                onClick={() => 
                  setData({ priorities: toggleItem(priorities, option, 2) })
                }
                disabled={priorities.length >= 2 && !priorities.includes(option)}
              >
                {option}
              </QuizButton>
            ))}
          </div>
        );

      case 5:
        if (isLoading) {
          return (
            <div className="text-center py-12">
              <div className="inline-block mb-6">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mt-4">Finding your perfect matches</h2>
              <p className="mt-2 text-gray-600">
                Analyzing your preferences...
              </p>
            </div>
          );
        }
        
        return matchesFound ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mt-4">We found your perfect matches!</h2>
            <button 
              onClick={reset}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mt-4">No Matches Found</h2>
            <p className="mt-2 text-gray-600">
              We couldn't find properties matching your criteria.
            </p>
            <button 
              onClick={() => {
                reset();
                nextStep();
              }}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate progress percentage
  const totalSteps = stepTitles.length + 1; // Include loading step
  const progress = Math.min(100, Math.max(0, (step / (totalSteps - 1)) * 100));
  

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
      <div className="w-full bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex justify-center pt-4 px-6">
          <span className="text-sm font-medium text-blue-600">
            {step <= stepTitles.length 
              ? `Step ${step + 1} of ${totalSteps}`
              : `Step ${totalSteps} of ${totalSteps}`}
          </span>
        </div>

        <div className="flex-1 p-6 pb-20">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={direction}
              className="w-full h-full"
              role="region"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Step ${step + 1} of ${totalSteps}`}
            >
              {renderStep()}
              
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < stepTitles.length && (
          <div className="sticky bottom-0 left-0 right-0 flex justify-between p-4 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleBack}
              className="text-sm px-4 py-2 rounded-md border disabled:opacity-30"
              disabled={step === 0}
            >
              Back
            </button>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-3">
                {step + 1}/{totalSteps}
              </span>
              <button
                onClick={handleNext}
                className={`text-sm px-4 py-2 rounded-md transition-all ${
                  isValid 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isValid}
              >
                {step === stepTitles.length - 1 ? 'Find Matches' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}