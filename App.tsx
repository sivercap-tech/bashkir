import React, { useState, useEffect } from 'react';
import { generateIATBlocks } from './constants';
import { AppState, IATSessionData, TrialResult, BlockConfig } from './types';
import IATRunner from './components/IATRunner';
import Results from './components/Results';
import { ArrowRight, Activity, User } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [sessionData, setSessionData] = useState<IATSessionData | null>(null);
  const [participantId, setParticipantId] = useState<string>('');
  
  // State to hold the dynamic block configuration for this specific session
  const [blocks, setBlocks] = useState<BlockConfig[]>([]);

  // Initialize blocks and User ID on component mount
  useEffect(() => {
    setBlocks(generateIATBlocks());

    // 1. Try to get ID from URL
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('uid') || params.get('id') || params.get('participant_id') || params.get('user');

    if (urlId) {
      setParticipantId(urlId);
    } else {
      // 2. If no URL ID, check localStorage or generate new
      const storedId = localStorage.getItem('iat_participant_id');
      if (storedId) {
        setParticipantId(storedId);
      } else {
        const newId = crypto.randomUUID();
        localStorage.setItem('iat_participant_id', newId);
        setParticipantId(newId);
      }
    }
  }, []);

  const startTest = () => {
    setAppState(AppState.RUNNING);
    setCurrentBlockIndex(0);
    setResults([]);
  };

  const handleBlockComplete = (blockResults: TrialResult[]) => {
    // Append new results
    const updatedResults = [...results, ...blockResults];
    setResults(updatedResults);

    // Check if there are more blocks
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      // Finished
      const finalData: IATSessionData = {
        sessionId: crypto.randomUUID(), // Unique ID for this specific run
        participantId: participantId,   // Persistent ID for the user
        timestamp: new Date().toISOString(),
        results: updatedResults
      };
      setSessionData(finalData);
      setAppState(AppState.FINISHED);
    }
  };

  const handleRestart = () => {
    setAppState(AppState.WELCOME);
    setResults([]);
    setSessionData(null);
    // Regenerate blocks for the new session
    setBlocks(generateIATBlocks());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2 text-indigo-600">
           <Activity />
           <h1 className="font-bold text-lg tracking-tight">React IAT Platform</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {appState === AppState.RUNNING && (
            <div className="text-sm font-medium text-gray-500">
              Блок {currentBlockIndex + 1} из {blocks.length}
            </div>
          )}
          {participantId && (
             <div className="hidden md:flex items-center text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
               <User size={12} className="mr-1"/> ID: {participantId.slice(0, 8)}...
             </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 h-screen flex flex-col">
        {appState === AppState.WELCOME && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Тест Имплицитных Ассоциаций (IAT)
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Этот инструмент измеряет силу ассоциаций между культурными группами (Русские, Башкиры) и атрибутами (Лошади, Коровы).
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left space-y-4 w-full">
              <h3 className="font-bold text-gray-800">Инструкции</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Вы увидите слова или изображения, появляющиеся по одному.</li>
                <li>Положите пальцы на клавиши <strong>E</strong> и <strong>I</strong>.</li>
                <li>Классифицируйте их как можно быстрее.</li>
                <li>Если вы ошибетесь, появится красный <span className="text-red-500 font-bold">X</span>. Исправьте ошибку.</li>
              </ul>
            </div>

            <button 
              onClick={startTest}
              className="group flex items-center px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
            >
              Начать эксперимент <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {appState === AppState.RUNNING && blocks.length > 0 && (
          <IATRunner 
            blockConfig={blocks[currentBlockIndex]} 
            onBlockComplete={handleBlockComplete} 
          />
        )}

        {appState === AppState.FINISHED && sessionData && (
          <Results 
            data={sessionData} 
            onRestart={handleRestart} 
          />
        )}
      </main>

    </div>
  );
};

export default App;