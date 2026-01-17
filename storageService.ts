import { IATSessionData, TrialResult } from '../types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// We use the URL provided.
export const supabaseUrl = 'https://gqulzoctsltwxmzvofwv.supabase.co';

// We need a key to initialize the client without crashing. 
// Using the provided key as fallback.
const defaultKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_alcHOMdoEOvJmuSvwEeeoQ_HnbodgT3';

// createClient requires both arguments to be non-empty strings.
// We initialize a default client, but might create a temporary one if a manual key is passed.
const supabase = defaultKey ? createClient(supabaseUrl, defaultKey) : null;

export interface StorageResult {
  success: boolean;
  message?: string;
  needsKey?: boolean;
}

export const saveResultsToStorage = async (data: IATSessionData, manualKey?: string): Promise<StorageResult> => {
  console.log('Отправка данных в Supabase...', data);
  
  let client = supabase;
  
  // If a manual key is provided (user entered it in UI), use it to create a temporary client
  if (manualKey) {
    client = createClient(supabaseUrl, manualKey);
  }

  // Check if we have a valid client
  if (!client || (!defaultKey && !manualKey)) {
    console.warn('Supabase ANON KEY is missing.');
    return { 
      success: false, 
      message: 'API Key не найден. Пожалуйста, введите ключ.',
      needsKey: true
    }; 
  }

  try {
    // We assume a table named 'iat_results' exists with columns:
    // session_id (text), participant_id (text), d_score (numeric), full_data (jsonb)
    const { error } = await client
      .from('iat_results')
      .insert([
        { 
          session_id: data.sessionId,
          participant_id: data.participantId,
          d_score: data.dScore,
          full_data: data // Storing the complete session object
        }
      ]);

    if (error) {
      // Use console.log with arguments to avoid [object Object] string concatenation issues
      console.error('Supabase error object:', error);
      
      // Helpful messages for common errors
      if (error.code === '42P01') {
        return { success: false, message: 'Таблица "iat_results" не найдена в базе данных.' };
      }
      if (error.code === '42501') {
        return { success: false, message: 'Ошибка доступа (RLS). База данных блокирует запись. См. инструкцию ниже.' };
      }
      
      // Attempt to extract the message safely
      const msg = error.message || error.details || JSON.stringify(error);
      return { success: false, message: `Ошибка Supabase: ${msg}` };
    }
    
    console.log('Данные успешно сохранены в Supabase.');
    return { success: true };
  } catch (e: any) {
    console.error('Ошибка при сохранении в Supabase:', e);
    // Ensure we handle non-Error objects gracefully
    const errorMessage = e instanceof Error ? e.message : (typeof e === 'object' ? JSON.stringify(e) : String(e));
    return { success: false, message: errorMessage || 'Неизвестная ошибка сети.' }; 
  }
};

export const downloadResultsAsJSON = (data: IATSessionData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `iat-results-${data.participantId}-${data.sessionId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const calculateDScore = (results: TrialResult[]): number => {
    // Filter for valid reaction times
    const validResults = results.filter(r => r.isCorrect && r.reactionTime < 10000 && r.reactionTime > 300);

    // Group by Pairing Type
    // Condition 1: Russian + Horse (and Bashkir + Cow)
    // Condition 2: Russian + Cow (and Bashkir + Horse)
    const cond1 = validResults.filter(r => r.pairingType === 'Russian+Horse');
    const cond2 = validResults.filter(r => r.pairingType === 'Russian+Cow');

    if (cond1.length === 0 || cond2.length === 0) return 0;

    const mean1 = cond1.reduce((acc, r) => acc + r.reactionTime, 0) / cond1.length;
    const mean2 = cond2.reduce((acc, r) => acc + r.reactionTime, 0) / cond2.length;

    // Pooled standard deviation across both combined test blocks
    const allRelevant = [...cond1, ...cond2];
    const overallMean = allRelevant.reduce((acc, r) => acc + r.reactionTime, 0) / allRelevant.length;
    const variance = allRelevant.reduce((acc, r) => acc + Math.pow(r.reactionTime - overallMean, 2), 0) / (allRelevant.length - 1);
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    return (mean1 - mean2) / stdDev;
};