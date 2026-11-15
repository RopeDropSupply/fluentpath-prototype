import type { CaseIdExercise, Exercise, FillInExercise, Lesson } from '../../domain/types';
import { misconception as m, NOM_NOTE } from './exercises';

/**
 * Sample contextual lesson: renewable energy in Poland (A2/B1).
 * REVIEW STATUS: needs-native-review. The text makes only general statements
 * and should be fact-checked before being used as real teaching material.
 */

const vocab: FillInExercise = {
  id: 'l-vocab',
  type: 'fill-in',
  track: 'lesson',
  dimension: 'production',
  title: 'Recall the key terms',
  difficulty: 'A2',
  translation: 'Type the Polish word (nominative singular) for each English term.',
  ruleExplanation: 'Recalling a word from memory, with its exact spelling, is stronger evidence than recognising it in a list.',
  prerequisites: ['Lesson vocabulary list'],
  conceptIds: [],
  reviewStatus: 'needs-native-review',
  segments: [{ blank: 'wind' }, { blank: 'sun' }, { blank: 'price' }, { blank: 'meeting' }, { blank: 'source' }],
  blanks: [
    ['wind', 'wiatr'], ['sun', 'słońce'], ['price', 'cena'], ['meeting', 'spotkanie'], ['source', 'źródło'],
  ].map(([en, pl]) => ({
    id: en, baseForm: en, hint: 'Polish noun', answer: pl,
    fallbackCategory: 'vocab-recall', competencies: ['professional-vocabulary' as const],
    explanation: `${en} = ${pl}`,
  })),
};

const l1: FillInExercise = {
  id: 'l-1',
  type: 'fill-in',
  track: 'lesson',
  dimension: 'transfer',
  title: 'Say what interests you',
  difficulty: 'A2+',
  translation: 'I am interested in renewable energy.',
  ruleExplanation: 'interesować się requires the instrumental. Feminine singular: noun -ą, adjective -ą.',
  prerequisites: ['Instrumental singular'],
  conceptIds: ['instr-sg', 'instr-triggers'],
  reviewStatus: 'needs-native-review',
  segments: ['Interesuję się', { blank: 'noun' }, { blank: 'adj' }, '.'],
  blanks: [
    {
      id: 'noun', baseForm: 'energia', hint: 'noun, feminine', answer: 'energią',
      misconceptions: [
        m('energia', 'instr-trigger', 'energia is the nominative. The instrumental ending is -ą.'),
        m('energię', 'instr-trigger', 'energię is the accusative. interesować się requires the instrumental.'),
        m('energii', 'instr-trigger', 'energii is genitive, dative or locative. interesować się requires the instrumental.'),
      ],
      fallbackCategory: 'instr-noun-ending', competencies: ['instrumental', 'professional-vocabulary'],
      explanation: 'Feminine instrumental noun: energia → energią.',
    },
    {
      id: 'adj', baseForm: 'odnawialna', hint: 'adjective', answer: 'odnawialną',
      misconceptions: [
        m('odnawialna', 'instr-trigger', 'odnawialna is the nominative. The instrumental ending is -ą.'),
        m('odnawialnej', 'instr-trigger', 'odnawialnej is genitive, dative or locative. interesować się requires the instrumental.'),
        m('odnawialnym', 'instr-adj-ending', 'The ending -ym is masculine or neuter. energia is feminine.'),
      ],
      fallbackCategory: 'instr-adj-ending', competencies: ['instrumental', 'adjective-agreement'],
      explanation: 'Feminine instrumental adjective: odnawialna → odnawialną.',
    },
  ],
};

const l2: FillInExercise = {
  id: 'l-2',
  type: 'fill-in',
  track: 'lesson',
  dimension: 'transfer',
  title: 'Say what the country needs',
  difficulty: 'B1',
  translation: 'Poland needs cheap energy.',
  ruleExplanation: 'potrzebować requires the genitive. Feminine singular: adjective -ej; energia → energii.',
  prerequisites: ['Genitive singular', 'Verbs that take the genitive'],
  conceptIds: ['gen-triggers', 'gen-sg'],
  reviewStatus: 'needs-native-review',
  segments: ['Polska potrzebuje', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    {
      id: 'adj', baseForm: 'tania', hint: 'adjective', answer: 'taniej',
      misconceptions: [
        m('tania', 'gen-trigger', NOM_NOTE),
        m('tanią', 'gen-trigger', 'tanią is accusative or instrumental. potrzebować requires the genitive.'),
        m('taniego', 'gen-ending', 'The ending -ego is masculine or neuter. energia is feminine.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive', 'adjective-agreement'],
      explanation: 'Feminine genitive adjective: tania → taniej.',
    },
    {
      id: 'noun', baseForm: 'energia', hint: 'noun, feminine', answer: 'energii',
      misconceptions: [
        m('energia', 'gen-trigger', NOM_NOTE),
        m('energię', 'gen-trigger', 'energię is the accusative. potrzebować requires the genitive.'),
        m('energią', 'gen-trigger', 'energią is the instrumental. potrzebować requires the genitive.'),
        m('energi', 'gen-ending', 'Nouns like energia are written with a double i in the genitive: energii.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive', 'professional-vocabulary'],
      explanation: 'Feminine genitive noun: energia → energii.',
    },
  ],
};

const l3: CaseIdExercise = {
  id: 'l-3',
  type: 'case-id',
  track: 'lesson',
  title: 'An upcoming meeting',
  difficulty: 'B1',
  translation: 'Next week we have a meeting with a new client.',
  ruleExplanation:
    'z ("with") governs the instrumental. w in a time expression governs the locative, and masculine adjectives end in -ym in both cases.',
  prerequisites: ['Instrumental singular', 'Preposition w'],
  conceptIds: ['case-by-governor', 'instr-sg'],
  reviewStatus: 'needs-native-review',
  tokens: [
    {
      text: 'W', lemma: 'w', pos: 'Preposition', gloss: 'in',
      why: 'In time expressions such as "next week", w requires the locative.',
      relations: 'It governs tygodniu.',
    },
    {
      text: 'przyszłym', lemma: 'przyszły', pos: 'Adjective', gloss: 'next, coming',
      case: 'locative', number: 'singular', gender: 'masculine',
      governedBy: 'Agreement with the noun tygodniu, which is governed by w',
      why: 'Masculine adjectives end in -ym in the locative singular, the same ending as in the instrumental.',
      relations: 'It describes tygodniu. It looks like nowym, but its noun follows w, so it is locative.',
    },
    {
      text: 'tygodniu', lemma: 'tydzień', pos: 'Noun', gloss: 'week',
      case: 'locative', number: 'singular', gender: 'masculine (inanimate)',
      governedBy: 'The preposition w (time expression)',
      why: 'tydzień has an irregular stem, tygodni-, in every case except the nominative and accusative. The locative ending is -u.',
      relations: 'It is the object of w.',
    },
    {
      text: 'mamy', lemma: 'mieć', pos: 'Verb', gloss: 'we have',
      why: 'First person plural, present tense of mieć. The present tense is used here for a scheduled future event.',
      relations: 'Its direct object is spotkanie.',
    },
    {
      text: 'spotkanie', lemma: 'spotkanie', pos: 'Noun', gloss: 'meeting',
      case: 'accusative', number: 'singular', gender: 'neuter',
      governedBy: 'The verb mamy, which takes an accusative direct object',
      why: 'Neuter nouns have the same form in the accusative as in the nominative.',
      relations: 'It is the direct object of mamy.',
    },
    {
      text: 'z', lemma: 'z', pos: 'Preposition', gloss: 'with',
      why: 'When z means "with", it requires the instrumental.',
      relations: 'It governs klientem.',
    },
    {
      text: 'nowym', lemma: 'nowy', pos: 'Adjective', gloss: 'new',
      case: 'instrumental', number: 'singular', gender: 'masculine',
      governedBy: 'Agreement with the noun klientem, which is governed by z',
      why: 'Masculine instrumental adjectives end in -ym.',
      relations: 'It describes klientem.',
    },
    {
      text: 'klientem', after: '.', lemma: 'klient', pos: 'Noun', gloss: 'client',
      case: 'instrumental', number: 'singular', gender: 'masculine (personal)',
      governedBy: 'The preposition z ("with")',
      why: 'Masculine nouns take -em in the instrumental singular.',
      relations: 'It is the object of z and is described by nowym.',
    },
  ],
  tasks: [
    { id: 'l-3-instr', targetCase: 'instrumental', targetTokenIndexes: [6, 7], competencies: ['instrumental'], errorCategory: 'case-by-governor' },
  ],
};

const interview: FillInExercise = {
  id: 'l-interview',
  type: 'fill-in',
  track: 'lesson',
  dimension: 'transfer',
  title: 'Complete a model interview answer',
  difficulty: 'B1',
  translation: 'I am interested in energy policy. I am looking for an interesting job. I want to work with Polish clients.',
  ruleExplanation:
    'Three governing words, three patterns: interesować się + instrumental, szukać + genitive, z ("with") + instrumental plural.',
  prerequisites: ['Instrumental singular and plural', 'Genitive singular'],
  conceptIds: ['instr-triggers', 'gen-triggers', 'instr-pl'],
  reviewStatus: 'needs-native-review',
  segments: [
    'Interesuję się', { blank: 'n1' }, { blank: 'a1' }, '. Szukam', { blank: 'a2' }, { blank: 'n2' },
    '. Chcę pracować z', { blank: 'a3' }, { blank: 'n3' }, '.',
  ],
  blanks: [
    {
      id: 'n1', baseForm: 'polityka', hint: 'noun, feminine', answer: 'polityką',
      misconceptions: [m('polityka', 'instr-trigger', 'polityka is the nominative. The instrumental ending is -ą.'), m('politykę', 'instr-trigger', 'politykę is the accusative. interesować się requires the instrumental.')],
      fallbackCategory: 'instr-noun-ending', competencies: ['instrumental', 'professional-vocabulary'],
      explanation: 'interesować się + instrumental: polityka → polityką.',
    },
    {
      id: 'a1', baseForm: 'energetyczna', hint: 'adjective', answer: 'energetyczną',
      misconceptions: [m('energetyczna', 'instr-trigger', 'energetyczna is the nominative. The instrumental ending is -ą.'), m('energetycznej', 'instr-trigger', 'energetycznej is genitive, dative or locative. The instrumental is required.')],
      fallbackCategory: 'instr-adj-ending', competencies: ['instrumental', 'adjective-agreement'],
      explanation: 'The adjective agrees: energetyczna → energetyczną.',
    },
    {
      id: 'a2', baseForm: 'ciekawa', hint: 'adjective', answer: 'ciekawej',
      misconceptions: [m('ciekawa', 'gen-trigger', NOM_NOTE), m('ciekawą', 'gen-trigger', 'ciekawą is accusative or instrumental. szukać requires the genitive.')],
      fallbackCategory: 'gen-ending', competencies: ['genitive', 'adjective-agreement'],
      explanation: 'szukać + genitive: ciekawa → ciekawej.',
    },
    {
      id: 'n2', baseForm: 'praca', hint: 'noun, feminine', answer: 'pracy',
      misconceptions: [m('praca', 'gen-trigger', NOM_NOTE), m('pracę', 'gen-trigger', 'pracę is the accusative. szukać requires the genitive.')],
      fallbackCategory: 'gen-ending', competencies: ['genitive'],
      explanation: 'szukać + genitive: praca → pracy.',
    },
    {
      id: 'a3', baseForm: 'polski', hint: 'adjective, plural', answer: 'polskimi',
      misconceptions: [m('polskim', 'plural-instr', 'polskim is singular. The plural ending after k is -imi.'), m('polskich', 'plural-instr', 'polskich is genitive or locative plural. After z ("with") the instrumental is required.')],
      fallbackCategory: 'plural-instr', competencies: ['instrumental', 'adjective-agreement'],
      explanation: 'Instrumental plural after k: polski → polskimi.',
    },
    {
      id: 'n3', baseForm: 'klient', hint: 'noun, plural', answer: 'klientami',
      misconceptions: [m('klientem', 'plural-instr', 'klientem is singular. The plural ending is -ami.'), m('klientów', 'plural-instr', 'klientów is genitive or accusative plural. After z ("with") the instrumental is required.')],
      fallbackCategory: 'plural-instr', competencies: ['instrumental'],
      explanation: 'Instrumental plural: klient → klientami.',
    },
  ],
};

export const lessonExercises: Exercise[] = [vocab, l1, l2, l3, interview];

export const lesson: Lesson = {
  id: 'lesson-renewables',
  title: 'Energia odnawialna w Polsce',
  level: 'A2 / B1',
  intro:
    'A short reading about renewable energy in Poland, followed by vocabulary recall, grammar in context and a simple interview answer.',
  text: [
    { polish: 'Polska produkuje coraz więcej energii ze źródeł odnawialnych.', english: 'Poland produces more and more energy from renewable sources.' },
    { polish: 'Najważniejsze źródła to wiatr i słońce.', english: 'The most important sources are wind and sun.' },
    { polish: 'Farmy wiatrowe są na północy kraju, nad Bałtykiem.', english: 'Wind farms are in the north of the country, on the Baltic.' },
    { polish: 'Wiele rodzin ma panele słoneczne na dachu.', english: 'Many families have solar panels on the roof.' },
    { polish: 'Ceny energii są wysokie, dlatego firmy szukają tańszych rozwiązań.', english: 'Energy prices are high, so companies are looking for cheaper solutions.' },
    { polish: 'W przyszłym tygodniu mamy spotkanie z nowym klientem.', english: 'Next week we have a meeting with a new client.' },
  ],
  vocabulary: [
    { polish: 'energia odnawialna', english: 'renewable energy', gender: 'feminine' },
    { polish: 'źródło', english: 'source', gender: 'neuter' },
    { polish: 'wiatr', english: 'wind', gender: 'masculine' },
    { polish: 'słońce', english: 'sun', gender: 'neuter' },
    { polish: 'farma wiatrowa', english: 'wind farm', gender: 'feminine' },
    { polish: 'panel słoneczny', english: 'solar panel', gender: 'masculine' },
    { polish: 'cena', english: 'price', gender: 'feminine' },
    { polish: 'rozwiązanie', english: 'solution', gender: 'neuter' },
    { polish: 'spotkanie', english: 'meeting', gender: 'neuter' },
    { polish: 'klient', english: 'client', gender: 'masculine' },
    { polish: 'polityka energetyczna', english: 'energy policy', gender: 'feminine' },
  ],
  exerciseIds: ['l-vocab', 'l-1', 'l-2', 'l-3'],
  interview: {
    question: 'Dlaczego chce Pani / Pan pracować w sektorze energii odnawialnej?',
    questionTranslation: 'Why do you want to work in the renewable energy sector?',
    exerciseId: 'l-interview',
  },
};
