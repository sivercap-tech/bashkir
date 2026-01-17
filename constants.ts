import { BlockConfig, Stimulus } from './types';

export const CATEGORIES = {
  TARGET_A: 'Русские',   // Russians
  TARGET_B: 'Башкиры',   // Bashkirs
  ATTRIBUTE_A: 'Лошади', // Horses
  ATTRIBUTE_B: 'Коровы', // Cows
};

// Image URLs
const IMAGES = {
  HORSES: [
    'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80',
    'https://images.unsplash.com/photo-1534251618169-bdaeb9063fdd?w=400&q=80',
    'https://images.unsplash.com/photo-1598819842185-1f6fdb3a152d?w=400&q=80',
    'https://images.unsplash.com/photo-1599049788099-0d32d03e913a?w=400&q=80'
  ],
  COWS: [
    'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400&q=80',
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80',
    'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&q=80',
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80'
  ]
};

export const STIMULI: Stimulus[] = [
  // Русские (Russians)
  { id: 'r1', text: 'Масленица', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r2', text: 'Пельмени', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r3', text: 'Илья Муромец', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r4', text: 'Волга', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r5', text: 'Кокошник', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r6', text: 'Балалайка', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r7', text: 'Изба', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r8', text: 'Квас', category: CATEGORIES.TARGET_A, type: 'target' },
  { id: 'r9', text: 'Шапка-ушанка', category: CATEGORIES.TARGET_A, type: 'target' },
  
  // Башкиры (Bashkirs)
  { id: 'b1', text: 'Сабантуй', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b2', text: 'Бешбармак', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b3', text: 'Урал-Батыр', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b4', text: 'Агидель', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b5', text: 'Бешмет', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b6', text: 'Курай', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b7', text: 'Юрта', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b8', text: 'Кумыс', category: CATEGORIES.TARGET_B, type: 'target' },
  { id: 'b9', text: 'Тюбитейка', category: CATEGORIES.TARGET_B, type: 'target' },

  // Лошади (Horses)
  { id: 'h1', text: 'Лошадь', image: IMAGES.HORSES[0], category: CATEGORIES.ATTRIBUTE_A, type: 'attribute' },
  { id: 'h2', text: 'Лошадь', image: IMAGES.HORSES[1], category: CATEGORIES.ATTRIBUTE_A, type: 'attribute' },
  { id: 'h3', text: 'Лошадь', image: IMAGES.HORSES[2], category: CATEGORIES.ATTRIBUTE_A, type: 'attribute' },
  { id: 'h4', text: 'Лошадь', image: IMAGES.HORSES[3], category: CATEGORIES.ATTRIBUTE_A, type: 'attribute' },

  // Коровы (Cows)
  { id: 'c1', text: 'Корова', image: IMAGES.COWS[0], category: CATEGORIES.ATTRIBUTE_B, type: 'attribute' },
  { id: 'c2', text: 'Корова', image: IMAGES.COWS[1], category: CATEGORIES.ATTRIBUTE_B, type: 'attribute' },
  { id: 'c3', text: 'Корова', image: IMAGES.COWS[2], category: CATEGORIES.ATTRIBUTE_B, type: 'attribute' },
  { id: 'c4', text: 'Корова', image: IMAGES.COWS[3], category: CATEGORIES.ATTRIBUTE_B, type: 'attribute' },
];

/**
 * Generates a randomized IAT block sequence.
 * 
 * Randomization factors:
 * 1. Start with Words vs Start with Images.
 * 2. Combined Block Order: (Russian+Horse) first vs (Russian+Cow) first.
 */
export const generateIATBlocks = (): BlockConfig[] => {
  const blocks: BlockConfig[] = [];
  
  // Random decisions
  const startWithWords = Math.random() < 0.5;
  const startWithRussianHorse = Math.random() < 0.5;

  // --- Mappings ---
  // We assume Target A (Russian) is LEFT initially.
  // We assume Target B (Bashkir) is RIGHT initially.
  
  // If startWithRussianHorse (Pairing 1):
  // We need Russian(L)+Horse(L) vs Bashkir(R)+Cow(R).
  // So Attribute A (Horse) is LEFT, Attribute B (Cow) is RIGHT.
  
  // If !startWithRussianHorse (Pairing 2 - Russian+Cow):
  // We need Russian(L)+Cow(L) vs Bashkir(R)+Horse(R).
  // So Attribute B (Cow) is LEFT, Attribute A (Horse) is RIGHT.

  const attrLeft = startWithRussianHorse ? [CATEGORIES.ATTRIBUTE_A] : [CATEGORIES.ATTRIBUTE_B]; // Horse or Cow
  const attrRight = startWithRussianHorse ? [CATEGORIES.ATTRIBUTE_B] : [CATEGORIES.ATTRIBUTE_A]; // Cow or Horse
  
  // Naming for instructions
  const leftAttrName = attrLeft[0];
  const rightAttrName = attrRight[0];

  // --- Phase 1: Single Task Blocks (Randomized Order) ---
  
  const blockWords: BlockConfig = {
    id: 0, // ID will be reassigned
    name: 'Обучение словам',
    leftCategories: [CATEGORIES.TARGET_A], // Russian
    rightCategories: [CATEGORIES.TARGET_B], // Bashkir
    trials: 18,
    isPractice: true,
    instructions: `Положите пальцы на E и I.\n\nE (слева): ${CATEGORIES.TARGET_A}\nI (справа): ${CATEGORIES.TARGET_B}`,
    pairingType: 'learning'
  };

  const blockImages: BlockConfig = {
    id: 0,
    name: 'Обучение изображениям',
    leftCategories: attrLeft,
    rightCategories: attrRight,
    trials: 12,
    isPractice: true,
    instructions: `Теперь изображения.\n\nE (слева): ${leftAttrName}\nI (справа): ${rightAttrName}`,
    pairingType: 'learning'
  };

  if (startWithWords) {
    blocks.push({ ...blockWords, id: 1, name: 'Блок 1: Слова' });
    blocks.push({ ...blockImages, id: 2, name: 'Блок 2: Изображения' });
  } else {
    blocks.push({ ...blockImages, id: 1, name: 'Блок 1: Изображения' });
    blocks.push({ ...blockWords, id: 2, name: 'Блок 2: Слова' });
  }

  // --- Phase 2: First Combined (Based on our attrLeft choice) ---
  
  // If startWithRussianHorse: Russian+Horse (L) vs Bashkir+Cow (R)
  // If !startWithRussianHorse: Russian+Cow (L) vs Bashkir+Horse (R)
  
  const pairing1Name = startWithRussianHorse ? 'Russian+Horse' : 'Russian+Cow';
  
  blocks.push({
    id: 3,
    name: 'Блок 3: Совмещенный тест',
    leftCategories: [CATEGORIES.TARGET_A, ...attrLeft],
    rightCategories: [CATEGORIES.TARGET_B, ...attrRight],
    trials: 20,
    isPractice: false,
    instructions: `Совмещаем.\n\nE (слева): ${CATEGORIES.TARGET_A} или ${leftAttrName}\nI (справа): ${CATEGORIES.TARGET_B} или ${rightAttrName}`,
    pairingType: pairing1Name as any
  });

  // --- Phase 3: Switch Targets ---
  // Now Bashkir Left, Russian Right.
  
  blocks.push({
    id: 4,
    name: 'Блок 4: Смена сторон',
    leftCategories: [CATEGORIES.TARGET_B], // Bashkir
    rightCategories: [CATEGORIES.TARGET_A], // Russian
    trials: 18,
    isPractice: true,
    instructions: `Внимание! Стороны для национальностей поменялись.\n\nE (слева): ${CATEGORIES.TARGET_B}\nI (справа): ${CATEGORIES.TARGET_A}`,
    pairingType: 'target_switch'
  });

  // --- Phase 4: Second Combined (Reversed) ---
  // Attributes stay same side (attrLeft is still left).
  // But Targets switched.
  // Left: Bashkir + attrLeft
  // Right: Russian + attrRight
  
  // If startWithRussianHorse (attrLeft=Horse): Bashkir+Horse (L) vs Russian+Cow (R). 
  // This is the "Russian+Cow" pairing condition (just sides swapped).
  
  // If !startWithRussianHorse (attrLeft=Cow): Bashkir+Cow (L) vs Russian+Horse (R).
  // This is the "Russian+Horse" pairing condition.

  const pairing2Name = startWithRussianHorse ? 'Russian+Cow' : 'Russian+Horse';

  const block56Config = {
    leftCategories: [CATEGORIES.TARGET_B, ...attrLeft],
    rightCategories: [CATEGORIES.TARGET_A, ...attrRight],
    instructions: `Снова совмещаем (новые стороны).\n\nE (слева): ${CATEGORIES.TARGET_B} или ${leftAttrName}\nI (справа): ${CATEGORIES.TARGET_A} или ${rightAttrName}`,
    pairingType: pairing2Name as any
  };

  blocks.push({
    id: 5,
    name: 'Блок 5: Совмещенный (Реверс)',
    ...block56Config,
    trials: 20,
    isPractice: false,
  });

  blocks.push({
    id: 6,
    name: 'Блок 6: Финальный тест',
    ...block56Config,
    trials: 20, // Usually 40
    isPractice: false,
  });

  return blocks;
};