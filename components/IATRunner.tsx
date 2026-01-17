import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BlockConfig, Stimulus, TrialResult, CategoryType } from '../types';
import { STIMULI } from '../constants';
import { X } from 'lucide-react';

interface IATRunnerProps {
  blockConfig: BlockConfig;
  onBlockComplete: (results: TrialResult[]) => void;
}

const IATRunner: React.FC<IATRunnerProps> = ({ blockConfig, onBlockComplete }) => {
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [trials, setTrials] = useState<Stimulus[]>([]);
  
  // Refs for timing precision
  const startTimeRef = useRef<number>(0);
  const blockResultsRef = useRef<TrialResult[]>([]);

  // Initialize trial sequence for this block
  useEffect(() => {
    // Filter STIMULI to find items belonging to current block categories
    const relevantStimuli = STIMULI.filter(s => 
      blockConfig.leftCategories.includes(s.category) || 
      blockConfig.rightCategories.includes(s.category)
    );

    if (relevantStimuli.length === 0) {
      console.error("No stimuli found for block", blockConfig);
      return;
    }

    const generatedTrials: Stimulus[] = [];
    // Ensure we have enough stimuli to fill the trials, repeating if necessary
    for (let i = 0; i < blockConfig.trials; i++) {
      const random = relevantStimuli[Math.floor(Math.random() * relevantStimuli.length)];
      generatedTrials.push(random);
    }
    setTrials(generatedTrials);
    setHasStarted(false);
    setCurrentTrialIndex(0);
    blockResultsRef.current = [];
    setShowError(false);
  }, [blockConfig]);

  const handleStartBlock = () => {
    setHasStarted(true);
    // Focus the window to ensure keypresses are caught
    window.focus(); 
    setTimeout(() => {
      startTimeRef.current = performance.now();
    }, 500);
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!hasStarted) return;
    if (currentTrialIndex >= trials.length) return;

    // Use event.code for physical key location (Layout Independent)
    // KeyE is the 'E' key on QWERTY (same location as 'У' on standard Russian)
    // KeyI is the 'I' key on QWERTY (same location as 'Ш' on standard Russian)
    const code = event.code; 
    
    if (code !== 'KeyE' && code !== 'KeyI') return;

    const currentStimulus = trials[currentTrialIndex];
    if (!currentStimulus) return; 

    let correctSide: CategoryType = 'none';
    if (blockConfig.leftCategories.includes(currentStimulus.category)) {
      correctSide = 'left';
    } else if (blockConfig.rightCategories.includes(currentStimulus.category)) {
      correctSide = 'right';
    }

    const userSide = code === 'KeyE' ? 'left' : 'right';
    const isCorrect = userSide === correctSide;
    const endTime = performance.now();
    const reactionTime = endTime - startTimeRef.current;

    if (isCorrect) {
      setShowError(false);
      
      blockResultsRef.current.push({
        blockId: blockConfig.id,
        trialIndex: currentTrialIndex,
        stimulus: currentStimulus.text,
        stimulusCategory: currentStimulus.category,
        correctCategory: correctSide,
        userCategory: userSide,
        isCorrect: true, 
        reactionTime: reactionTime,
        timestamp: Date.now(),
        pairingType: blockConfig.pairingType
      });

      if (currentTrialIndex < trials.length - 1) {
        setCurrentTrialIndex(prev => prev + 1);
        startTimeRef.current = performance.now();
      } else {
        onBlockComplete(blockResultsRef.current);
      }
    } else {
      setShowError(true);
    }
  }, [hasStarted, currentTrialIndex, trials, blockConfig, onBlockComplete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center p-8 space-y-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800">{blockConfig.name}</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full">
          <p className="text-lg text-gray-600 mb-4 whitespace-pre-line">{blockConfig.instructions}</p>
          <div className="grid grid-cols-2 gap-8 text-sm font-semibold text-gray-500 mt-6">
            <div className="text-left border-l-4 border-blue-500 pl-4 bg-blue-50 py-4 rounded-r-lg">
              <span className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Нажмите 'E' (Слева)</span>
              {blockConfig.leftCategories.map(c => <div key={c} className="text-xl text-gray-900 font-bold">{c}</div>)}
            </div>
            <div className="text-right border-r-4 border-green-500 pr-4 bg-green-50 py-4 rounded-l-lg">
              <span className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Нажмите 'I' (Справа)</span>
              {blockConfig.rightCategories.map(c => <div key={c} className="text-xl text-gray-900 font-bold">{c}</div>)}
            </div>
          </div>
        </div>
        <button 
          onClick={handleStartBlock}
          className="px-8 py-4 bg-indigo-600 text-white text-xl font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
        >
          Начать блок
        </button>
      </div>
    );
  }

  const currentStimulus = trials[currentTrialIndex];

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-slate-50">
      {/* Header Categories */}
      <div className="flex justify-between p-8 text-2xl font-bold">
        <div className="text-left w-1/3">
           {blockConfig.leftCategories.map(c => (
             <div key={c} className="text-blue-700 mb-1">{c}</div>
           ))}
        </div>
        <div className="text-right w-1/3">
           {blockConfig.rightCategories.map(c => (
             <div key={c} className="text-green-700 mb-1">{c}</div>
           ))}
        </div>
      </div>

      {/* Main Stimulus Area */}
      <div className="flex-grow flex items-center justify-center relative">
        {currentStimulus && (
          <div className="transition-all duration-100 flex justify-center items-center">
             {currentStimulus.image ? (
               <div className="relative">
                 <img 
                   src={currentStimulus.image} 
                   alt={currentStimulus.text} 
                   className="max-h-80 max-w-md rounded-lg shadow-2xl object-cover"
                 />
               </div>
             ) : (
               <div className={`text-6xl font-extrabold ${
                 currentStimulus.category.includes('Башкиры') || currentStimulus.category.includes('Русские') 
                  ? 'text-gray-900' : 'text-indigo-600'
               }`}>
                 {currentStimulus.text}
               </div>
             )}
          </div>
        )}

        {/* Error Feedback */}
        {showError && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-48 z-10 bg-white/90 p-2 rounded-full shadow-lg">
            <X size={64} className="text-red-600 animate-pulse" />
          </div>
        )}
      </div>

      {/* Footer / Instructions hint */}
      <div className="absolute bottom-8 w-full text-center text-gray-400 text-sm">
         Нажмите <b>E</b> для Левой • Нажмите <b>I</b> для Правой
      </div>
    </div>
  );
};

export default IATRunner;
