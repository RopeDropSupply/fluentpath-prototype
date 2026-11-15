import type { Blank, CaseIdExercise, Exercise, FillInExercise, Misconception } from '../../domain/types';

/**
 * Core exercise dataset for Polish (track: "core").
 * REVIEW STATUS: every item is hand-authored from standard textbook patterns
 * and is marked needs-native-review until a qualified teacher signs it off.
 */

const m = (form: string, errorCategory: string, note: string): Misconception => ({ form, errorCategory, note });

const NOM_NOTE = 'This is the dictionary (nominative) form. The slot requires a different case.';

// ---------------------------------------------------------------------------
// A. Identify grammatical cases
// ---------------------------------------------------------------------------

const ci1: CaseIdExercise = {
  id: 'ci-1',
  type: 'case-id',
  track: 'core',
  title: 'Talking with someone about something',
  difficulty: 'A2',
  translation: 'I am talking with a Polish engineer about renewable energy.',
  ruleExplanation:
    'z ("with") governs the instrumental and o ("about") governs the locative. Each adjective takes the case, number and gender of its noun.',
  prerequisites: ['Prepositions z and o', 'Noun gender'],
  conceptIds: ['case-by-governor', 'instr-sg'],
  reviewStatus: 'needs-native-review',
  tokens: [
    {
      text: 'Rozmawiam', lemma: 'rozmawiać', pos: 'Verb', gloss: 'I talk, I am talking',
      why: 'First person singular, present tense of rozmawiać (imperfective). The ending -am marks "I", so no pronoun is needed.',
      relations: 'It is followed by two prepositional phrases: with whom (z + instrumental) and about what (o + locative).',
    },
    {
      text: 'z', lemma: 'z', pos: 'Preposition', gloss: 'with',
      why: 'Prepositions do not change form. When z means "with", it requires the instrumental case.',
      relations: 'It governs the noun inżynierem. (With the genitive, z means "from".)',
    },
    {
      text: 'polskim', lemma: 'polski', pos: 'Adjective', gloss: 'Polish',
      case: 'instrumental', number: 'singular', gender: 'masculine',
      governedBy: 'Agreement with the noun inżynierem, which is governed by z',
      why: 'Masculine instrumental adjectives end in -ym, spelled -im after k or g: polski → polskim.',
      relations: 'It describes inżynierem. The form polskim could also be locative, but its noun follows z, so it is instrumental.',
    },
    {
      text: 'inżynierem', lemma: 'inżynier', pos: 'Noun', gloss: 'engineer',
      case: 'instrumental', number: 'singular', gender: 'masculine (personal)',
      governedBy: 'The preposition z ("with")',
      why: 'Masculine nouns take -em in the instrumental singular: inżynier → inżynierem.',
      relations: 'It is the object of z and is described by polskim.',
    },
    {
      text: 'o', lemma: 'o', pos: 'Preposition', gloss: 'about',
      why: 'When o means "about", it requires the locative case.',
      relations: 'It governs the noun energii.',
    },
    {
      text: 'energii', lemma: 'energia', pos: 'Noun', gloss: 'energy',
      case: 'locative', number: 'singular', gender: 'feminine',
      governedBy: 'The preposition o ("about")',
      why: 'Nouns like energia have -ii in the genitive, dative and locative singular. The preposition o shows that this is the locative.',
      relations: 'It is the object of o and is described by odnawialnej.',
    },
    {
      text: 'odnawialnej', after: '.', lemma: 'odnawialny', pos: 'Adjective', gloss: 'renewable',
      case: 'locative', number: 'singular', gender: 'feminine',
      governedBy: 'Agreement with the noun energii, which is governed by o',
      why: 'Feminine adjectives end in -ej in the locative singular (and also in the genitive and dative).',
      relations: 'It describes energii and follows it, as classifying adjectives often do in Polish.',
    },
  ],
  tasks: [
    { id: 'ci-1-instr', targetCase: 'instrumental', targetTokenIndexes: [2, 3], competencies: ['instrumental'], errorCategory: 'case-by-governor' },
    { id: 'ci-1-loc', targetCase: 'locative', targetTokenIndexes: [5, 6], competencies: ['locative'], errorCategory: 'case-by-governor' },
  ],
  reasoning: {
    id: 'why-ci-1',
    question: 'The form "polskim" can be instrumental or locative. How do you know it is instrumental in this sentence?',
    options: [
      { id: 'a', text: 'It agrees with inżynierem, and inżynierem is governed by z ("with"), which requires the instrumental.', correct: true, feedback: 'Exactly. The adjective takes its case from its noun, and the noun takes its case from the preposition.' },
      { id: 'b', text: 'The ending -im is always instrumental.', correct: false, feedback: 'The ending -im (or -ym) is also the masculine and neuter locative: w polskim mieście. The ending alone cannot decide.' },
      { id: 'c', text: 'It comes directly after a preposition, and prepositions take the instrumental.', correct: false, feedback: 'Different prepositions require different cases. In this same sentence, o takes the locative.' },
      { id: 'd', text: 'The verb rozmawiam requires an instrumental object.', correct: false, feedback: 'The verb does not assign the case here. The preposition z does.' },
    ],
    modelExplanation:
      '"polskim" describes "inżynierem", so it must share its case. "inżynierem" follows z in the meaning "with", which requires the instrumental. So both words are instrumental singular masculine.',
    checklist: ['Names the governing word (z)', 'States which case that word requires', 'Links the adjective to its noun', 'Does not rely on the ending alone'],
    competencies: ['instrumental', 'adjective-agreement'],
  },
};

const ci2: CaseIdExercise = {
  id: 'ci-2',
  type: 'case-id',
  track: 'core',
  title: 'One ending, two cases',
  difficulty: 'A2+',
  translation: 'I am looking for a new job at a large energy company.',
  ruleExplanation:
    'szukać requires the genitive; w (location) requires the locative. Feminine adjectives end in -ej in both cases, so the governing word must decide.',
  prerequisites: ['Verbs that take the genitive', 'Preposition w'],
  conceptIds: ['case-by-governor', 'gen-triggers'],
  reviewStatus: 'needs-native-review',
  tokens: [
    {
      text: 'Szukam', lemma: 'szukać', pos: 'Verb', gloss: 'I am looking for',
      why: 'First person singular, present tense of szukać (imperfective).',
      relations: 'szukać is one of the verbs whose object is in the genitive, not the accusative.',
    },
    {
      text: 'nowej', lemma: 'nowy', pos: 'Adjective', gloss: 'new',
      case: 'genitive', number: 'singular', gender: 'feminine',
      governedBy: 'Agreement with the noun pracy, which is governed by the verb szukam',
      why: 'Feminine adjectives end in -ej in the genitive singular.',
      relations: 'It describes pracy. It has the same ending as dużej later in the sentence, but a different case.',
    },
    {
      text: 'pracy', lemma: 'praca', pos: 'Noun', gloss: 'job, work',
      case: 'genitive', number: 'singular', gender: 'feminine',
      governedBy: 'The verb szukać, which requires the genitive',
      why: 'Feminine nouns take -y in the genitive singular: praca → pracy.',
      relations: 'It is the object of szukam and is described by nowej.',
    },
    {
      text: 'w', lemma: 'w', pos: 'Preposition', gloss: 'in, at',
      why: 'When w expresses location, it requires the locative case.',
      relations: 'It governs the noun firmie.',
    },
    {
      text: 'dużej', lemma: 'duży', pos: 'Adjective', gloss: 'large',
      case: 'locative', number: 'singular', gender: 'feminine',
      governedBy: 'Agreement with the noun firmie, which is governed by w',
      why: 'Feminine adjectives end in -ej in the locative singular.',
      relations: 'It describes firmie.',
    },
    {
      text: 'firmie', lemma: 'firma', pos: 'Noun', gloss: 'company',
      case: 'locative', number: 'singular', gender: 'feminine',
      governedBy: 'The preposition w (location)',
      why: 'Feminine nouns in -a take -e in the locative singular, softening the stem: firma → firmie.',
      relations: 'It is the object of w and is described by dużej and energetycznej.',
    },
    {
      text: 'energetycznej', after: '.', lemma: 'energetyczny', pos: 'Adjective', gloss: 'energy (adj.)',
      case: 'locative', number: 'singular', gender: 'feminine',
      governedBy: 'Agreement with the noun firmie, which is governed by w',
      why: 'Feminine adjectives end in -ej in the locative singular.',
      relations: 'It classifies firmie (what kind of company) and so follows the noun.',
    },
  ],
  tasks: [
    { id: 'ci-2-gen', targetCase: 'genitive', targetTokenIndexes: [1, 2], competencies: ['genitive'], errorCategory: 'case-by-governor' },
    { id: 'ci-2-loc', targetCase: 'locative', targetTokenIndexes: [4, 5, 6], competencies: ['locative'], errorCategory: 'case-by-governor' },
  ],
};

const ci3: CaseIdExercise = {
  id: 'ci-3',
  type: 'case-id',
  track: 'core',
  title: 'Having and not having',
  difficulty: 'A2+',
  translation: 'My brother has a new dog, but he does not have a car.',
  ruleExplanation:
    'mieć takes an accusative object, and for masculine animate nouns the accusative looks like the genitive (nowego psa). When the verb is negated, the object is genuinely genitive (samochodu).',
  prerequisites: ['Accusative of masculine nouns', 'Negation'],
  conceptIds: ['acc-sg', 'gen-triggers'],
  reviewStatus: 'needs-native-review',
  tokens: [
    {
      text: 'Mój', lemma: 'mój', pos: 'Possessive pronoun', gloss: 'my',
      case: 'nominative', number: 'singular', gender: 'masculine',
      governedBy: 'Agreement with the noun brat',
      why: 'It agrees with the subject, so it is nominative.',
      relations: 'It describes brat.',
    },
    {
      text: 'brat', lemma: 'brat', pos: 'Noun', gloss: 'brother',
      case: 'nominative', number: 'singular', gender: 'masculine (personal)',
      governedBy: 'Subject of the sentence',
      why: 'The subject of a verb is in the nominative, the dictionary form.',
      relations: 'It is the subject of both ma and nie ma.',
    },
    {
      text: 'ma', lemma: 'mieć', pos: 'Verb', gloss: 'has',
      why: 'Third person singular, present tense of mieć.',
      relations: 'It takes an accusative direct object: nowego psa.',
    },
    {
      text: 'nowego', lemma: 'nowy', pos: 'Adjective', gloss: 'new',
      case: 'accusative', number: 'singular', gender: 'masculine (animate)',
      governedBy: 'Agreement with the noun psa, the direct object of ma',
      why: 'With a masculine animate noun, the accusative adjective takes the genitive-style ending -ego.',
      relations: 'It describes psa.',
    },
    {
      text: 'psa', after: ',', lemma: 'pies', pos: 'Noun', gloss: 'dog',
      case: 'accusative', number: 'singular', gender: 'masculine (animate)',
      governedBy: 'The verb ma, which takes an accusative direct object',
      why: 'Masculine animate nouns use the genitive form as their accusative: pies → psa (the e drops out).',
      relations: 'It is the direct object of the affirmative verb ma.',
    },
    {
      text: 'ale', lemma: 'ale', pos: 'Conjunction', gloss: 'but',
      why: 'Conjunctions do not change form.',
      relations: 'It joins the two clauses.',
    },
    {
      text: 'nie', lemma: 'nie', pos: 'Particle', gloss: 'not',
      why: 'The negative particle stands directly before the verb.',
      relations: 'It negates ma, which changes the case of the object to the genitive.',
    },
    {
      text: 'ma', lemma: 'mieć', pos: 'Verb', gloss: 'has',
      why: 'Third person singular, present tense of mieć.',
      relations: 'Because it is negated, its object samochodu is in the genitive.',
    },
    {
      text: 'samochodu', after: '.', lemma: 'samochód', pos: 'Noun', gloss: 'car',
      case: 'genitive', number: 'singular', gender: 'masculine (inanimate)',
      governedBy: 'Negation of the verb (nie ma)',
      why: 'The object of a negated verb is in the genitive. samochód takes -u, and ó changes to o: samochodu.',
      relations: 'It is the object of nie ma. Without negation it would be accusative: ma samochód.',
    },
  ],
  tasks: [
    { id: 'ci-3-acc', targetCase: 'accusative', targetTokenIndexes: [3, 4], competencies: ['accusative'], errorCategory: 'case-by-governor' },
    { id: 'ci-3-gen', targetCase: 'genitive', targetTokenIndexes: [8], competencies: ['genitive'], errorCategory: 'case-by-governor' },
  ],
  reasoning: {
    id: 'why-ci-3',
    question: '"psa" and "samochodu" are both objects of mieć. Why are they in different cases?',
    options: [
      { id: 'a', text: 'psa is the object of the affirmative verb, so it is accusative (animate, so it looks like the genitive). samochodu is the object of the negated verb, so it is genitive.', correct: true, feedback: 'Exactly. Affirmative mieć takes the accusative; negation turns the object into the genitive.' },
      { id: 'b', text: 'Both are genitive, because both have genitive endings.', correct: false, feedback: 'psa has a genitive-looking form, but its function is accusative: it is the object of an affirmative verb. Masculine animate nouns borrow the genitive form for the accusative.' },
      { id: 'c', text: 'Animate nouns always take the genitive after mieć.', correct: false, feedback: 'mieć takes the accusative. Animate masculine nouns simply use a form identical to the genitive.' },
      { id: 'd', text: 'samochodu is accusative, because inanimate nouns take -u in the accusative.', correct: false, feedback: 'The accusative of an inanimate masculine noun equals the nominative: ma samochód. The -u here is the genitive, caused by negation.' },
    ],
    modelExplanation:
      'mieć takes an accusative object. "psa" is accusative; because pies is masculine animate, the accusative has the same form as the genitive. In the second clause the verb is negated, and a negated verb puts its object in the genitive: "samochodu".',
    checklist: ['Identifies the case each verb form requires', 'Mentions the effect of negation', 'Explains why psa looks like a genitive (animacy)', 'Separates the form of a word from its function'],
    competencies: ['accusative', 'genitive'],
  },
};

const ci4: CaseIdExercise = {
  id: 'ci-4',
  type: 'case-id',
  track: 'core',
  title: 'Quantity and source',
  difficulty: 'A2+',
  translation: 'Poland produces more and more energy from wind and sun.',
  ruleExplanation:
    'Quantity words such as więcej require the genitive. The preposition z requires the genitive when it means "from" (and the instrumental when it means "with").',
  prerequisites: ['Genitive singular endings', 'Preposition z'],
  conceptIds: ['gen-triggers', 'case-by-governor'],
  reviewStatus: 'needs-native-review',
  tokens: [
    {
      text: 'Polska', lemma: 'Polska', pos: 'Noun (proper)', gloss: 'Poland',
      case: 'nominative', number: 'singular', gender: 'feminine',
      governedBy: 'Subject of the sentence',
      why: 'The subject is in the nominative.',
      relations: 'It is the subject of produkuje.',
    },
    {
      text: 'produkuje', lemma: 'produkować', pos: 'Verb', gloss: 'produces',
      why: 'Third person singular, present tense of produkować (imperfective).',
      relations: 'Its object is the quantity phrase coraz więcej energii.',
    },
    {
      text: 'coraz', lemma: 'coraz', pos: 'Adverb', gloss: 'increasingly',
      why: 'coraz + comparative means "more and more". It does not change form.',
      relations: 'It modifies więcej.',
    },
    {
      text: 'więcej', lemma: 'więcej', pos: 'Quantity word', gloss: 'more',
      why: 'The comparative of dużo. It does not change form here.',
      relations: 'Like dużo and mało, it requires the genitive of what is being counted or measured: energii.',
    },
    {
      text: 'energii', lemma: 'energia', pos: 'Noun', gloss: 'energy',
      case: 'genitive', number: 'singular', gender: 'feminine',
      governedBy: 'The quantity word więcej',
      why: 'Quantity words take the genitive. energia has -ii in the genitive singular.',
      relations: 'It depends on więcej. The same form energii can be locative after o.',
    },
    {
      text: 'z', lemma: 'z', pos: 'Preposition', gloss: 'from',
      why: 'When z means "from" or "out of", it requires the genitive.',
      relations: 'It governs both wiatru and słońca.',
    },
    {
      text: 'wiatru', lemma: 'wiatr', pos: 'Noun', gloss: 'wind',
      case: 'genitive', number: 'singular', gender: 'masculine (inanimate)',
      governedBy: 'The preposition z ("from")',
      why: 'wiatr is masculine inanimate and takes -u in the genitive singular.',
      relations: 'It is the first object of z, joined to słońca by i.',
    },
    {
      text: 'i', lemma: 'i', pos: 'Conjunction', gloss: 'and',
      why: 'Conjunctions do not change form.',
      relations: 'It joins wiatru and słońca, which share the same case.',
    },
    {
      text: 'słońca', after: '.', lemma: 'słońce', pos: 'Noun', gloss: 'sun',
      case: 'genitive', number: 'singular', gender: 'neuter',
      governedBy: 'The preposition z ("from")',
      why: 'Neuter nouns take -a in the genitive singular: słońce → słońca.',
      relations: 'It is the second object of z.',
    },
  ],
  tasks: [
    { id: 'ci-4-gen', targetCase: 'genitive', targetTokenIndexes: [4, 6, 8], competencies: ['genitive'], errorCategory: 'case-by-governor' },
  ],
  reasoning: {
    id: 'why-ci-4',
    question: 'In an earlier sentence, z was followed by the instrumental (z polskim inżynierem). Why is it followed by the genitive in "z wiatru i słońca"?',
    options: [
      { id: 'a', text: 'Here z means "from", and z in that meaning requires the genitive. z requires the instrumental only when it means "with".', correct: true, feedback: 'Exactly. The meaning of the preposition decides which case it governs.' },
      { id: 'b', text: 'Because wiatr and słońce are not people.', correct: false, feedback: 'Animacy does not change what a preposition governs. "With the wind" would still be instrumental: z wiatrem.' },
      { id: 'c', text: 'Because the genitive is required by the verb produkuje.', correct: false, feedback: 'produkować takes an accusative object. The genitive here comes from the preposition z.' },
      { id: 'd', text: 'Because the nouns come after a quantity word.', correct: false, feedback: 'więcej governs energii only. wiatru and słońca are governed by z.' },
    ],
    modelExplanation:
      'The preposition z has two meanings with two different cases. Meaning "with", it takes the instrumental (z inżynierem). Meaning "from" or "out of", it takes the genitive, so wiatr becomes wiatru and słońce becomes słońca.',
    checklist: ['Names the governing word (z)', 'Distinguishes its two meanings', 'States the case each meaning requires', 'Applies the rule to both nouns'],
    competencies: ['genitive', 'instrumental'],
  },
};

// ---------------------------------------------------------------------------
// B. Supply noun and adjective forms
// ---------------------------------------------------------------------------

const blank = (b: Blank): Blank => b;

const fi1: FillInExercise = {
  id: 'fi-1',
  type: 'fill-in',
  track: 'core',
  title: 'Instrumental, masculine singular',
  difficulty: 'A2',
  translation: 'I am talking with the new director.',
  ruleExplanation: 'z ("with") requires the instrumental. Masculine singular: adjective -ym, noun -em.',
  prerequisites: ['Preposition z', 'Masculine nouns'],
  conceptIds: ['instr-sg', 'instr-triggers'],
  reviewStatus: 'needs-native-review',
  segments: ['Rozmawiam z', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'nowy', hint: 'adjective', answer: 'nowym',
      misconceptions: [
        m('nowy', 'instr-trigger', NOM_NOTE),
        m('nowego', 'instr-trigger', 'nowego is the genitive or accusative form. After z ("with") the instrumental is required.'),
        m('nową', 'instr-adj-ending', 'The ending -ą is feminine. dyrektor is masculine.'),
        m('nowymi', 'instr-adj-ending', 'nowymi is the plural form. There is only one director.'),
      ],
      fallbackCategory: 'instr-adj-ending', competencies: ['instrumental', 'adjective-agreement'],
      explanation: 'Masculine instrumental adjective: nowy → nowym.',
    }),
    blank({
      id: 'noun', baseForm: 'dyrektor', hint: 'noun, masculine', answer: 'dyrektorem',
      misconceptions: [
        m('dyrektor', 'instr-trigger', NOM_NOTE),
        m('dyrektora', 'instr-trigger', 'dyrektora is the genitive or accusative form. After z ("with") the instrumental is required.'),
        m('dyrektorą', 'instr-noun-ending', 'The ending -ą belongs to feminine nouns. dyrektor is masculine.'),
        m('dyrektorom', 'instr-noun-ending', 'The ending -om is the dative plural.'),
        m('dyrektorym', 'instr-noun-ending', 'The ending -ym belongs to adjectives. Masculine nouns take -em.'),
      ],
      fallbackCategory: 'instr-noun-ending', competencies: ['instrumental'],
      explanation: 'Masculine instrumental noun: dyrektor → dyrektorem.',
    }),
  ],
};

const fi2: FillInExercise = {
  id: 'fi-2',
  type: 'fill-in',
  track: 'core',
  title: 'Instrumental, feminine singular',
  difficulty: 'A2',
  translation: 'I am interested in Polish culture.',
  ruleExplanation: 'interesować się requires the instrumental. Feminine singular: adjective -ą, noun -ą.',
  prerequisites: ['Reflexive verbs', 'Feminine nouns'],
  conceptIds: ['instr-sg', 'instr-triggers'],
  reviewStatus: 'needs-native-review',
  segments: ['Interesuję się', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'polska', hint: 'adjective', answer: 'polską',
      misconceptions: [
        m('polska', 'instr-trigger', 'polska is the nominative. The instrumental ending is -ą, with the tail (ogonek).'),
        m('polskiej', 'instr-trigger', 'polskiej is genitive, dative or locative. interesować się requires the instrumental.'),
        m('polskim', 'instr-adj-ending', 'The ending -im is masculine or neuter. kultura is feminine.'),
      ],
      fallbackCategory: 'instr-adj-ending', competencies: ['instrumental', 'adjective-agreement'],
      explanation: 'Feminine instrumental adjective: polska → polską.',
    }),
    blank({
      id: 'noun', baseForm: 'kultura', hint: 'noun, feminine', answer: 'kulturą',
      misconceptions: [
        m('kultura', 'instr-trigger', 'kultura is the nominative. The instrumental ending is -ą, with the tail (ogonek).'),
        m('kulturę', 'instr-trigger', 'kulturę is the accusative. interesować się requires the instrumental.'),
        m('kultury', 'instr-trigger', 'kultury is the genitive. interesować się requires the instrumental.'),
        m('kulturem', 'instr-noun-ending', 'The ending -em belongs to masculine and neuter nouns. kultura is feminine.'),
      ],
      fallbackCategory: 'instr-noun-ending', competencies: ['instrumental'],
      explanation: 'Feminine instrumental noun: kultura → kulturą.',
    }),
  ],
};

const fi3: FillInExercise = {
  id: 'fi-3',
  type: 'fill-in',
  track: 'core',
  title: 'Accusative, feminine singular',
  difficulty: 'A2',
  translation: 'I am reading an interesting book.',
  ruleExplanation: 'czytać takes an accusative direct object. Feminine singular: adjective -ą, noun -ę.',
  prerequisites: ['Direct objects', 'Feminine nouns'],
  conceptIds: ['acc-sg'],
  reviewStatus: 'needs-native-review',
  segments: ['Czytam', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'ciekawa', hint: 'adjective', answer: 'ciekawą',
      misconceptions: [
        m('ciekawa', 'acc-fem-ending', 'ciekawa is the nominative. A direct object needs the accusative.'),
        m('ciekawę', 'acc-fem-ending', 'Only the noun takes -ę. Feminine adjectives take -ą in the accusative.'),
        m('ciekawej', 'acc-fem-ending', 'ciekawej is genitive, dative or locative. czytać takes the accusative.'),
      ],
      fallbackCategory: 'acc-fem-ending', competencies: ['accusative', 'adjective-agreement'],
      explanation: 'Feminine accusative adjective: ciekawa → ciekawą.',
    }),
    blank({
      id: 'noun', baseForm: 'książka', hint: 'noun, feminine', answer: 'książkę',
      misconceptions: [
        m('książka', 'acc-fem-ending', 'książka is the nominative. A direct object needs the accusative.'),
        m('książką', 'acc-fem-ending', 'On a noun, -ą is the instrumental. The feminine accusative noun ending is -ę.'),
        m('książki', 'acc-fem-ending', 'książki is the genitive. czytać is not negated here, so its object is accusative.'),
      ],
      fallbackCategory: 'acc-fem-ending', competencies: ['accusative'],
      explanation: 'Feminine accusative noun: książka → książkę.',
    }),
  ],
  reasoning: {
    id: 'why-fi-3',
    question: 'In "ciekawą książkę" the adjective ends in -ą and the noun in -ę. How can they be said to agree?',
    options: [
      { id: 'a', text: 'Agreement means sharing case, number and gender, not sharing letters. Both are accusative singular feminine; adjectives and nouns simply have different ending sets.', correct: true, feedback: 'Exactly. Adjectives and nouns follow different declension patterns, so the same case can look different on each.' },
      { id: 'b', text: 'They do not agree: the adjective is instrumental and the noun is accusative.', correct: false, feedback: 'An adjective always takes the case of its noun. -ą is the feminine adjective ending for both accusative and instrumental; here it is accusative.' },
      { id: 'c', text: 'The adjective ends in -ą because it comes before the noun.', correct: false, feedback: 'Word order does not change endings. The ending comes from case, number and gender.' },
      { id: 'd', text: 'It is an exception that has to be memorised for this phrase.', correct: false, feedback: 'It is fully regular: every feminine accusative singular adjective takes -ą, and nouns in -a take -ę.' },
    ],
    modelExplanation:
      'czytać takes an accusative object. "książka" is feminine, so the noun takes -ę. The adjective agrees in case, number and gender, and the feminine accusative ending for adjectives is -ą. The endings differ because nouns and adjectives decline with different patterns.',
    checklist: ['Names the case and what requires it', 'States the gender and number of the noun', 'Defines agreement as shared case, number and gender', 'Gives the separate ending for noun and adjective'],
    competencies: ['accusative', 'adjective-agreement'],
  },
};

const fi4: FillInExercise = {
  id: 'fi-4',
  type: 'fill-in',
  track: 'core',
  title: 'Accusative, masculine animate',
  difficulty: 'A2+',
  translation: 'I know a good doctor.',
  ruleExplanation: 'znać takes the accusative. lekarz is masculine animate, so the accusative equals the genitive: adjective -ego, noun -a.',
  prerequisites: ['Direct objects', 'Animate and inanimate nouns'],
  conceptIds: ['acc-sg'],
  reviewStatus: 'needs-native-review',
  segments: ['Znam', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'dobry', hint: 'adjective', answer: 'dobrego',
      misconceptions: [
        m('dobry', 'acc-animacy', 'dobry would be right for a thing. lekarz is a person, so the adjective takes -ego.'),
        m('dobrym', 'acc-animacy', 'dobrym is instrumental or locative. znać takes the accusative.'),
      ],
      fallbackCategory: 'acc-animacy', competencies: ['accusative', 'adjective-agreement'],
      explanation: 'Masculine animate accusative adjective: dobry → dobrego.',
    }),
    blank({
      id: 'noun', baseForm: 'lekarz', hint: 'noun, masculine', answer: 'lekarza',
      misconceptions: [
        m('lekarz', 'acc-animacy', 'lekarz would be right if it were a thing. A person takes the genitive form in the accusative: -a.'),
        m('lekarzem', 'acc-animacy', 'lekarzem is the instrumental. znać takes the accusative.'),
        m('lekarzu', 'acc-animacy', 'lekarzu is locative or vocative. The animate accusative ending is -a.'),
      ],
      fallbackCategory: 'acc-animacy', competencies: ['accusative'],
      explanation: 'Masculine animate accusative noun: lekarz → lekarza.',
    }),
  ],
  reasoning: {
    id: 'why-fi-4',
    question: 'Why is it "Znam dobrego lekarza" and not "Znam dobry lekarz"?',
    options: [
      { id: 'a', text: 'znać takes the accusative, and lekarz is masculine animate, so its accusative has the same form as the genitive.', correct: true, feedback: 'Exactly: the case is accusative, and animacy decides which form the accusative takes.' },
      { id: 'b', text: 'znać requires the genitive.', correct: false, feedback: 'znać takes the accusative: Znam tę książkę. The form only looks genitive because lekarz is animate.' },
      { id: 'c', text: 'All masculine nouns take -a in the accusative.', correct: false, feedback: 'Inanimate masculine nouns do not change: Znam ten film.' },
      { id: 'd', text: 'The sentence is negated.', correct: false, feedback: 'There is no negation in this sentence.' },
    ],
    modelExplanation:
      'znać takes an accusative direct object. "lekarz" is masculine and animate (a person), and masculine animate nouns use the genitive form for the accusative. So the adjective takes -ego and the noun takes -a: dobrego lekarza.',
    checklist: ['Names the case the verb requires', 'Identifies the noun as masculine animate', 'States that animate accusative equals genitive in form', 'Applies the rule to both adjective and noun'],
    competencies: ['accusative'],
  },
};

const fi5: FillInExercise = {
  id: 'fi-5',
  type: 'fill-in',
  track: 'core',
  title: 'Accusative, masculine inanimate',
  difficulty: 'A2+',
  translation: 'I am buying a new car.',
  ruleExplanation: 'kupować takes the accusative. samochód is masculine inanimate, so the accusative equals the nominative: nothing changes.',
  prerequisites: ['Direct objects', 'Animate and inanimate nouns'],
  conceptIds: ['acc-sg'],
  reviewStatus: 'needs-native-review',
  segments: ['Kupuję', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'nowy', hint: 'adjective', answer: 'nowy',
      misconceptions: [
        m('nowego', 'acc-animacy', 'The ending -ego is used in the accusative only for people and animals. A car is a thing.'),
        m('nowym', 'acc-animacy', 'nowym is instrumental or locative. kupować takes the accusative.'),
      ],
      fallbackCategory: 'acc-animacy', competencies: ['accusative', 'adjective-agreement'],
      explanation: 'Masculine inanimate accusative adjective is the same as the nominative: nowy.',
    }),
    blank({
      id: 'noun', baseForm: 'samochód', hint: 'noun, masculine', answer: 'samochód',
      misconceptions: [
        m('samochodu', 'acc-animacy', 'samochodu is the genitive. An inanimate masculine noun does not change in the accusative.'),
        m('samochoda', 'acc-animacy', 'The ending -a is used in the accusative only for people and animals. A car is a thing.'),
        m('samochodem', 'acc-animacy', 'samochodem is the instrumental. kupować takes the accusative.'),
      ],
      fallbackCategory: 'acc-animacy', competencies: ['accusative'],
      explanation: 'Masculine inanimate accusative noun is the same as the nominative: samochód.',
    }),
  ],
};

const fi6: FillInExercise = {
  id: 'fi-6',
  type: 'fill-in',
  track: 'core',
  title: 'Genitive after negation',
  difficulty: 'A2+',
  translation: 'I do not have free time.',
  ruleExplanation: 'A negated verb puts its direct object in the genitive. Masculine singular: adjective -ego; czas takes -u.',
  prerequisites: ['Accusative direct objects', 'Negation'],
  conceptIds: ['gen-triggers', 'gen-sg'],
  reviewStatus: 'needs-native-review',
  segments: ['Nie mam', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'wolny', hint: 'adjective', answer: 'wolnego',
      misconceptions: [
        m('wolny', 'gen-negation', 'wolny would be right without negation (Mam wolny czas). After nie the object is genitive.'),
        m('wolnej', 'gen-ending', 'The ending -ej is feminine. czas is masculine.'),
        m('wolnym', 'gen-ending', 'wolnym is instrumental or locative. The masculine genitive adjective ending is -ego.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive', 'adjective-agreement'],
      explanation: 'Masculine genitive adjective: wolny → wolnego.',
    }),
    blank({
      id: 'noun', baseForm: 'czas', hint: 'noun, masculine', answer: 'czasu',
      misconceptions: [
        m('czas', 'gen-negation', 'czas would be right without negation (Mam czas). After nie the object is genitive.'),
        m('czasa', 'gen-ending', 'czas is one of the masculine inanimate nouns that take -u, not -a.'),
        m('czasem', 'gen-negation', 'czasem is the instrumental. A negated verb takes a genitive object.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive'],
      explanation: 'Masculine inanimate genitive noun: czas → czasu.',
    }),
  ],
  reasoning: {
    id: 'why-fi-6',
    question: 'Why is it "Nie mam wolnego czasu", when the affirmative sentence is "Mam wolny czas"?',
    options: [
      { id: 'a', text: 'mieć takes an accusative object, but when the verb is negated the object changes to the genitive.', correct: true, feedback: 'Exactly. This is the genitive of negation, and it applies to any verb that normally takes an accusative object.' },
      { id: 'b', text: 'mieć always takes the genitive.', correct: false, feedback: 'Affirmative mieć takes the accusative: Mam wolny czas.' },
      { id: 'c', text: 'czas is an animate noun.', correct: false, feedback: 'czas is inanimate. An animate noun would also not explain the -u ending.' },
      { id: 'd', text: 'nie is a preposition that requires the genitive.', correct: false, feedback: 'nie is a negative particle attached to the verb, not a preposition. It is the negated verb that takes a genitive object.' },
    ],
    modelExplanation:
      'mieć normally takes an accusative object: Mam wolny czas. When the verb is negated, the direct object goes into the genitive. "czas" is masculine inanimate and takes -u; the adjective agrees and takes -ego: wolnego czasu.',
    checklist: ['Names the case used without negation', 'States the effect of negation', 'Gives the gender of the noun', 'Gives the noun and adjective endings'],
    competencies: ['genitive'],
  },
};

const fi7: FillInExercise = {
  id: 'fi-7',
  type: 'fill-in',
  track: 'core',
  title: 'Genitive after a preposition, feminine',
  difficulty: 'A2',
  translation: 'This is a present for my sister.',
  ruleExplanation: 'dla ("for") requires the genitive. Feminine singular: adjective -ej, noun -y.',
  prerequisites: ['Preposition dla', 'Feminine nouns'],
  conceptIds: ['gen-triggers', 'gen-sg'],
  reviewStatus: 'needs-native-review',
  segments: ['To jest prezent dla', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'moja', hint: 'possessive', answer: 'mojej',
      misconceptions: [
        m('moja', 'gen-trigger', NOM_NOTE),
        m('moją', 'gen-trigger', 'moją is accusative or instrumental. dla requires the genitive.'),
        m('mojego', 'gen-ending', 'The ending -ego is masculine or neuter. siostra is feminine.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive', 'adjective-agreement'],
      explanation: 'Feminine genitive: moja → mojej.',
    }),
    blank({
      id: 'noun', baseForm: 'siostra', hint: 'noun, feminine', answer: 'siostry',
      misconceptions: [
        m('siostra', 'gen-trigger', NOM_NOTE),
        m('siostrę', 'gen-trigger', 'siostrę is the accusative. dla requires the genitive.'),
        m('siostrą', 'gen-trigger', 'siostrą is the instrumental. dla requires the genitive.'),
        m('siostrze', 'gen-ending', 'siostrze is dative or locative. The feminine genitive ending is -y.'),
        m('siostri', 'gen-ending', 'The ending -i is used after k, g and soft stems. After r the ending is -y.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive'],
      explanation: 'Feminine genitive noun: siostra → siostry.',
    }),
  ],
};

const fi8: FillInExercise = {
  id: 'fi-8',
  type: 'fill-in',
  track: 'core',
  title: 'Genitive after a verb, neuter',
  difficulty: 'A2+',
  translation: 'I am looking for a cheap flat.',
  ruleExplanation: 'szukać requires the genitive, not the accusative. Neuter singular: adjective -ego, noun -a.',
  prerequisites: ['Verbs that take the genitive', 'Neuter nouns'],
  conceptIds: ['gen-triggers', 'gen-sg'],
  reviewStatus: 'needs-native-review',
  segments: ['Szukam', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'tanie', hint: 'adjective', answer: 'taniego',
      misconceptions: [
        m('tanie', 'gen-trigger', 'tanie is nominative or accusative. szukać requires the genitive.'),
        m('taniej', 'gen-ending', 'The ending -ej is feminine. mieszkanie is neuter.'),
        m('tanego', 'gen-ending', 'The stem of tani is soft, so the i is kept: taniego.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive', 'adjective-agreement'],
      explanation: 'Neuter genitive adjective: tanie → taniego.',
    }),
    blank({
      id: 'noun', baseForm: 'mieszkanie', hint: 'noun, neuter', answer: 'mieszkania',
      misconceptions: [
        m('mieszkanie', 'gen-trigger', 'mieszkanie is nominative or accusative. szukać requires the genitive.'),
        m('mieszkaniu', 'gen-ending', 'mieszkaniu is dative or locative. The neuter genitive ending is -a.'),
        m('mieszkaniem', 'gen-trigger', 'mieszkaniem is the instrumental. szukać requires the genitive.'),
      ],
      fallbackCategory: 'gen-ending', competencies: ['genitive'],
      explanation: 'Neuter genitive noun: mieszkanie → mieszkania.',
    }),
  ],
};

const fi9: FillInExercise = {
  id: 'fi-9',
  type: 'fill-in',
  track: 'core',
  title: 'Instrumental plural',
  difficulty: 'B1',
  translation: 'I work with foreign clients.',
  ruleExplanation: 'z ("with") requires the instrumental. Plural, all genders: adjective -ymi, noun -ami.',
  prerequisites: ['Instrumental singular', 'Plural nouns'],
  conceptIds: ['instr-pl', 'instr-triggers'],
  reviewStatus: 'needs-native-review',
  segments: ['Pracuję z', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'zagraniczny', hint: 'adjective, plural', answer: 'zagranicznymi',
      misconceptions: [
        m('zagranicznym', 'plural-instr', 'zagranicznym is singular. The plural ending is -ymi.'),
        m('zagranicznych', 'plural-instr', 'zagranicznych is genitive or locative plural. After z ("with") the instrumental is required.'),
        m('zagraniczni', 'instr-trigger', 'zagraniczni is the nominative plural. After z ("with") the instrumental is required.'),
        m('zagraniczny', 'instr-trigger', NOM_NOTE),
      ],
      fallbackCategory: 'plural-instr', competencies: ['instrumental', 'adjective-agreement'],
      explanation: 'Instrumental plural adjective: zagraniczny → zagranicznymi.',
    }),
    blank({
      id: 'noun', baseForm: 'klient', hint: 'noun, plural', answer: 'klientami',
      misconceptions: [
        m('klientem', 'plural-instr', 'klientem is singular. The plural ending is -ami.'),
        m('klientów', 'plural-instr', 'klientów is genitive or accusative plural. After z ("with") the instrumental is required.'),
        m('klienci', 'instr-trigger', 'klienci is the nominative plural. After z ("with") the instrumental is required.'),
        m('klient', 'instr-trigger', NOM_NOTE),
      ],
      fallbackCategory: 'plural-instr', competencies: ['instrumental'],
      explanation: 'Instrumental plural noun: klient → klientami.',
    }),
  ],
};

const fi10: FillInExercise = {
  id: 'fi-10',
  type: 'fill-in',
  track: 'core',
  title: 'Genitive plural after a quantity',
  difficulty: 'B1',
  translation: 'The company has a lot of new projects.',
  ruleExplanation: 'dużo requires the genitive plural of countable nouns. Adjective -ych; hard-stem masculine noun -ów.',
  prerequisites: ['Genitive singular', 'Plural nouns'],
  conceptIds: ['gen-pl', 'gen-triggers'],
  reviewStatus: 'needs-native-review',
  segments: ['Firma ma dużo', { blank: 'adj' }, { blank: 'noun' }, '.'],
  blanks: [
    blank({
      id: 'adj', baseForm: 'nowy', hint: 'adjective, plural', answer: 'nowych',
      misconceptions: [
        m('nowe', 'gen-trigger', 'nowe is nominative or accusative plural. dużo requires the genitive.'),
        m('nowego', 'plural-gen', 'nowego is singular. The genitive plural ending is -ych.'),
        m('nowymi', 'plural-gen', 'nowymi is the instrumental plural. dużo requires the genitive.'),
        m('nowy', 'gen-trigger', NOM_NOTE),
      ],
      fallbackCategory: 'plural-gen', competencies: ['genitive', 'adjective-agreement'],
      explanation: 'Genitive plural adjective: nowy → nowych.',
    }),
    blank({
      id: 'noun', baseForm: 'projekt', hint: 'noun, plural', answer: 'projektów',
      misconceptions: [
        m('projekty', 'gen-trigger', 'projekty is nominative or accusative plural. dużo requires the genitive.'),
        m('projektu', 'plural-gen', 'projektu is the genitive singular. Here the noun is plural: -ów.'),
        m('projektami', 'plural-gen', 'projektami is the instrumental plural. dużo requires the genitive.'),
        m('projekt', 'gen-trigger', NOM_NOTE),
      ],
      fallbackCategory: 'plural-gen', competencies: ['genitive'],
      explanation: 'Genitive plural noun: projekt → projektów.',
    }),
  ],
};

export const coreExercises: Exercise[] = [ci1, ci2, ci3, ci4, fi1, fi2, fi3, fi4, fi5, fi6, fi7, fi8, fi9, fi10];
export { m as misconception, NOM_NOTE };
