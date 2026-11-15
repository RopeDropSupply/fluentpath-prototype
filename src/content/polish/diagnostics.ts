import type { DiagnosticPathway, DiagnosticProbe, RemediationItem } from '../../domain/types';
import { errorCategories } from './concepts';

/**
 * Diagnostic probes and pathways.
 *
 * A wrong form only shows WHAT went wrong. A probe asks the learner which rule
 * they believed applied; their answer selects one prepared pathway. The mapping
 * is a fixed lookup (option -> pathway): nothing is inferred beyond it.
 *
 * Implemented for two suspected issues so the experience can be compared:
 *   1. the wrong case after z ("with")            -> probe-z-case
 *   2. masculine animacy in the accusative, in both directions
 *                                                 -> probe-animate-unchanged, probe-inanimate-changed
 *
 * REVIEW STATUS: needs-native-review, like the rest of the Polish content.
 */

const practiceOf = (categoryId: string): RemediationItem[] => errorCategories[categoryId].remediation.map((i) => ({ ...i, transfer: false }));

export const pathways: Record<string, DiagnosticPathway> = {
  // ----- Wrong case after z -----
  'z-object-role': {
    id: 'z-object-role',
    belief: 'Treated the noun after z as the object of the verb',
    explanation:
      'The form you used is the one a direct object takes, and it would be right in "Znam nowego dyrektora". But a noun that follows a preposition takes its case from the preposition, not from the verb. Here the preposition is z ("with"), and z in that meaning requires the instrumental.',
    conceptId: 'instr-triggers',
    items: [
      {
        id: 'pw-zobj-1', type: 'choice', focus: 'Who assigns the case?',
        sentence: 'Znam nowego dyrektora.', translation: 'I know the new director.',
        question: 'What gives "dyrektora" its case in this sentence?',
        options: [
          { id: 'a', text: 'The verb znam: it is the direct object, so it is accusative', correct: true, feedback: 'Correct. There is no preposition, so the verb decides.' },
          { id: 'b', text: 'A preposition', correct: false, feedback: 'There is no preposition in this sentence. The noun is the direct object of znam.' },
          { id: 'c', text: 'Nothing: it is the subject', correct: false, feedback: 'The subject is "I", shown by the verb ending. dyrektora is the object.' },
        ],
        explanation: 'Without a preposition, the verb governs its object. With a preposition, the preposition governs.',
        competencies: ['accusative'],
      },
      {
        id: 'pw-zobj-2', type: 'fill', focus: 'Now with a preposition',
        before: 'Idę do kina z', after: '.', baseForm: 'brat', hint: 'noun, masculine',
        answer: 'bratem', translation: 'I am going to the cinema with my brother.',
        explanation: 'brat follows z ("with"), so it is instrumental: bratem. The verb idę plays no part in its case.',
        competencies: ['instrumental'],
      },
      {
        id: 'pw-zobj-3', type: 'fill', transfer: true, focus: 'A direct object and a z-phrase in one sentence',
        before: 'Widzę dyrektora z', after: '.', baseForm: 'nowy klient', hint: 'adjective + noun',
        answer: 'nowym klientem', translation: 'I see the director with a new client.',
        explanation: 'dyrektora is the direct object of widzę (accusative). nowym klientem follows z, so it is instrumental, even though both are people in the same sentence.',
        competencies: ['instrumental', 'adjective-agreement'],
      },
    ],
  },
  'z-two-meanings': {
    id: 'z-two-meanings',
    belief: 'Believed that z takes the genitive',
    explanation:
      'You are right that z can take the genitive, but only when it means "from" or "out of": z Polski, z pracy. When z means "with", it takes the instrumental. So the first step is always to decide which meaning z has.',
    conceptId: 'instr-triggers',
    items: [
      {
        id: 'pw-ztwo-1', type: 'choice', focus: 'Which meaning of z?',
        sentence: 'Jestem z Polski.', translation: 'I am from Poland.',
        question: 'Why is "Polski" in the genitive here?',
        options: [
          { id: 'a', text: 'z means "from", and z in that meaning takes the genitive', correct: true, feedback: 'Correct. This is the z you had in mind.' },
          { id: 'b', text: 'z always takes the genitive', correct: false, feedback: 'Not always: "with Poland" would be z Polską, in the instrumental.' },
          { id: 'c', text: 'Country names are always in the genitive', correct: false, feedback: 'Country names decline like other nouns: Polska, Polski, Polską…' },
        ],
        explanation: 'z + genitive = from, out of. z + instrumental = with.',
        competencies: ['genitive'],
      },
      {
        id: 'pw-ztwo-2', type: 'fill', focus: 'z meaning "with"',
        before: 'Piję herbatę z', after: '.', baseForm: 'cytryna', hint: 'noun, feminine',
        answer: 'cytryną', translation: 'I drink tea with lemon.',
        explanation: 'Here z means "with", so the noun is instrumental: cytryna → cytryną.',
        competencies: ['instrumental'],
      },
      {
        id: 'pw-ztwo-3', type: 'fill', transfer: true, focus: 'Both meanings of z in one sentence',
        before: 'Wracam z pracy z', after: '.', baseForm: 'koleżanka', hint: 'noun, feminine',
        answer: 'koleżanką', translation: 'I am coming back from work with a (female) colleague.',
        explanation: 'The first z means "from" (z pracy, genitive). The second means "with", so koleżanka becomes koleżanką (instrumental).',
        competencies: ['instrumental'],
      },
    ],
  },
  'z-endings-unknown': {
    id: 'z-endings-unknown',
    belief: 'Knew the instrumental was needed but did not know its endings',
    explanation:
      'Then your reasoning about the case was sound, and what is missing is the form. Instrumental singular: masculine and neuter nouns take -em (-iem after k or g), feminine nouns take -ą. Adjectives take -ym or -im (masculine, neuter) and -ą (feminine).',
    conceptId: 'instr-sg',
    items: [
      ...practiceOf('instr-noun-ending').slice(0, 2),
      {
        id: 'pw-zend-3', type: 'fill', transfer: true, focus: 'New words, adjective and noun together',
        before: 'Rozmawiam z', after: '.', baseForm: 'dobry lekarz', hint: 'adjective + noun',
        answer: 'dobrym lekarzem', translation: 'I am talking with a good doctor.',
        explanation: 'Masculine instrumental: adjective -ym, noun -em: dobrym lekarzem.',
        competencies: ['instrumental', 'adjective-agreement'],
      },
    ],
  },
  'z-unsure': {
    id: 'z-unsure',
    belief: 'Was not sure which case to use and guessed',
    explanation:
      'A reliable routine: before choosing an ending, find the word that governs the noun. If the noun follows a preposition, the preposition decides. z meaning "with" requires the instrumental, whatever the verb is.',
    conceptId: 'instr-triggers',
    items: [
      ...practiceOf('instr-trigger'),
      {
        id: 'pw-zuns-4', type: 'fill', transfer: true, focus: 'A new sentence with the same governing word',
        before: 'Idę na spotkanie z', after: '.', baseForm: 'ważny klient', hint: 'adjective + noun',
        answer: 'ważnym klientem', translation: 'I am going to a meeting with an important client.',
        explanation: 'z ("with") governs the phrase, so it is instrumental: ważnym klientem.',
        competencies: ['instrumental', 'adjective-agreement'],
      },
    ],
  },

  // ----- Animate noun left unchanged (fi-4) -----
  'anim-thought-unchanged': {
    id: 'anim-thought-unchanged',
    belief: 'Believed masculine nouns keep the dictionary form as direct objects',
    explanation:
      'That rule is true for things: Mam samochód. It does not hold for masculine nouns that name people or animals. Those take the genitive form when they are direct objects: adjective -ego, noun -a.',
    conceptId: 'acc-sg',
    items: [
      { ...errorCategories['acc-animacy'].remediation[0], transfer: false },
      { ...errorCategories['acc-animacy'].remediation[1], transfer: false },
      {
        id: 'pw-anim-unch-3', type: 'fill', transfer: true, focus: 'An animal, new words',
        before: 'Mam', after: '.', baseForm: 'czarny kot', hint: 'adjective + noun',
        answer: 'czarnego kota', translation: 'I have a black cat.',
        explanation: 'Animals count as animate, like people: czarnego kota.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },
  'object-not-noticed': {
    id: 'object-not-noticed',
    belief: 'Did not notice that the word was a direct object needing a case',
    explanation:
      'Verbs such as znać, mieć, lubić and widzieć act on something: ask "whom?" or "what?" after the verb. The answer is the direct object, and it goes in the accusative. For a masculine person that means the genitive-looking form: dobrego lekarza.',
    conceptId: 'acc-sg',
    items: [
      {
        id: 'pw-obj-1', type: 'choice', focus: 'Find the direct object',
        sentence: 'Moja siostra lubi kawę.', translation: 'My sister likes coffee.',
        question: 'Which word is the direct object, and how can you tell?',
        options: [
          { id: 'a', text: 'kawę: it answers "likes what?" and has the accusative ending -ę', correct: true, feedback: 'Correct. The subject is siostra (nominative); the thing liked is the object.' },
          { id: 'b', text: 'siostra: it comes first', correct: false, feedback: 'siostra is the subject: she does the liking. Position does not decide the role in Polish.' },
          { id: 'c', text: 'Moja: it describes the sister', correct: false, feedback: 'Moja is a possessive that agrees with the subject siostra.' },
        ],
        explanation: 'The direct object answers "whom?" or "what?" after the verb and is in the accusative.',
        competencies: ['accusative'],
      },
      {
        id: 'pw-obj-2', type: 'fill', focus: 'A feminine direct object',
        before: 'Lubię', after: '.', baseForm: 'kawa', hint: 'noun, feminine',
        answer: 'kawę', translation: 'I like coffee.',
        explanation: 'kawa is what is liked, so it is accusative: kawę.',
        competencies: ['accusative'],
      },
      {
        id: 'pw-obj-3', type: 'fill', transfer: true, focus: 'A new verb, a masculine person',
        before: 'Odwiedzam', after: '.', baseForm: 'stary profesor', hint: 'adjective + noun',
        answer: 'starego profesora', translation: 'I am visiting an old professor.',
        explanation: 'odwiedzać takes a direct object ("visit whom?"). profesor is a masculine person, so: starego profesora.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },
  'anim-endings-unknown': {
    id: 'anim-endings-unknown',
    belief: 'Knew a person needs a different form but did not know the endings',
    explanation:
      'Your reasoning was right; only the forms were missing. For a masculine person or animal as direct object, the adjective takes -ego and the noun takes -a, exactly as in the genitive.',
    conceptId: 'acc-sg',
    items: [
      {
        id: 'pw-anend-1', type: 'fill', focus: 'Noun only',
        before: 'Znam', after: '.', baseForm: 'student', hint: 'noun, masculine',
        answer: 'studenta', translation: 'I know a student.',
        explanation: 'Masculine person as direct object: student → studenta.',
        competencies: ['accusative'],
      },
      {
        id: 'pw-anend-2', type: 'fill', focus: 'Adjective and noun',
        before: 'Mam', after: '.', baseForm: 'starszy brat', hint: 'adjective + noun',
        answer: 'starszego brata', translation: 'I have an older brother.',
        explanation: 'Adjective -ego, noun -a: starszego brata.',
        competencies: ['accusative', 'adjective-agreement'],
      },
      {
        id: 'pw-anend-3', type: 'fill', transfer: true, focus: 'A new verb and new words',
        before: 'Lubię', after: '.', baseForm: 'nowy nauczyciel', hint: 'adjective + noun',
        answer: 'nowego nauczyciela', translation: 'I like the new teacher.',
        explanation: 'nauczyciel is a masculine person: nowego nauczyciela.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },
  'anim-slip': {
    id: 'anim-slip',
    belief: 'Said it was a slip: knows that people take -ego and -a',
    explanation:
      'That happens. Rather than repeat an explanation you do not need, here is one new sentence to confirm it. If it goes wrong, the fuller practice stays available from your progress page.',
    conceptId: 'acc-sg',
    items: [
      {
        id: 'pw-slip-1', type: 'fill', transfer: true, focus: 'One new sentence to confirm',
        before: 'Mam', after: '.', baseForm: 'dobry szef', hint: 'adjective + noun',
        answer: 'dobrego szefa', translation: 'I have a good boss.',
        explanation: 'szef is a masculine person: dobrego szefa.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },

  // ----- Inanimate noun changed (fi-5) -----
  'inanim-thought-changed': {
    id: 'inanim-thought-changed',
    belief: 'Believed masculine direct objects always take -ego and -a',
    explanation:
      'The endings -ego and -a are right for masculine people and animals: Znam dobrego lekarza. A masculine noun that names a thing normally keeps its dictionary form as a direct object: Kupuję nowy samochód.',
    conceptId: 'acc-sg',
    items: [
      { ...errorCategories['acc-animacy'].remediation[1], transfer: false },
      { ...errorCategories['acc-animacy'].remediation[2], transfer: false },
      {
        id: 'pw-inan-3', type: 'fill', transfer: true, focus: 'A new verb and a thing',
        before: 'Oglądam', after: '.', baseForm: 'polski film', hint: 'adjective + noun',
        answer: 'polski film', translation: 'I am watching a Polish film.',
        explanation: 'film is a thing, so nothing changes: polski film.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },
  'verb-takes-genitive': {
    id: 'verb-takes-genitive',
    belief: 'Believed that kupować takes the genitive',
    explanation:
      'kupować takes an ordinary accusative object. The genitive form you wrote would be right in two other situations: after negation (Nie kupuję nowego samochodu) and after the small group of verbs that always take the genitive, such as szukać and potrzebować.',
    conceptId: 'gen-triggers',
    items: [
      {
        id: 'pw-vgen-1', type: 'choice', focus: 'When your form is correct',
        sentence: 'Nie kupuję nowego samochodu.', translation: 'I am not buying a new car.',
        question: 'Why is "nowego samochodu" correct here?',
        options: [
          { id: 'a', text: 'The verb is negated, so its object changes from accusative to genitive', correct: true, feedback: 'Correct. Without nie, the object returns to the accusative: nowy samochód.' },
          { id: 'b', text: 'kupować always takes the genitive', correct: false, feedback: 'Affirmative kupować takes the accusative: Kupuję nowy samochód.' },
          { id: 'c', text: 'samochód is animate', correct: false, feedback: 'A car is a thing. The genitive here is caused by negation.' },
        ],
        explanation: 'Negation turns an accusative object into a genitive one. The verb itself has not changed what it governs.',
        competencies: ['genitive'],
      },
      {
        id: 'pw-vgen-2', type: 'fill', focus: 'Affirmative kupować',
        before: 'Kupuję', after: '.', baseForm: 'bilet', hint: 'noun, masculine',
        answer: 'bilet', translation: 'I am buying a ticket.',
        explanation: 'Accusative of a masculine thing equals the nominative: bilet.',
        competencies: ['accusative'],
      },
      {
        id: 'pw-vgen-3', type: 'fill', transfer: true, focus: 'A new verb',
        before: 'Sprzedaję', after: '.', baseForm: 'stary samochód', hint: 'adjective + noun',
        answer: 'stary samochód', translation: 'I am selling an old car.',
        explanation: 'sprzedawać also takes an accusative object, and samochód is a thing: stary samochód.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },
  'animacy-unsure': {
    id: 'animacy-unsure',
    belief: 'Was not sure of the rule and guessed',
    explanation:
      'Two questions settle it. First: is the word a direct object ("whom?" or "what?" after the verb)? Second: does this masculine noun name a person or animal, or a thing? People and animals take adjective -ego and noun -a; things do not change.',
    conceptId: 'acc-sg',
    items: [
      ...practiceOf('acc-animacy'),
      {
        id: 'pw-anuns-4', type: 'fill', transfer: true, focus: 'A new verb: decide for yourself',
        before: 'Oglądam', after: '.', baseForm: 'polski film', hint: 'adjective + noun',
        answer: 'polski film', translation: 'I am watching a Polish film.',
        explanation: 'film is a thing, so nothing changes: polski film.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },
};

export const probes: DiagnosticProbe[] = [
  {
    id: 'probe-z-case',
    suspectedCategory: 'instr-trigger',
    exerciseIds: ['fi-1', 'fi-9'],
    question: 'What made you choose that form after z?',
    options: [
      { id: 'object', text: 'The person is who I am talking or working with, so I used the form for an object (as in “Znam dyrektora”).', pathwayId: 'z-object-role' },
      { id: 'genitive', text: 'I thought z takes the genitive (as in “z Polski”).', pathwayId: 'z-two-meanings' },
      { id: 'endings', text: 'I knew z needs the instrumental here, but I did not know the endings.', pathwayId: 'z-endings-unknown' },
      { id: 'unsure', text: 'I was not sure which case to use, so I guessed or left the word unchanged.', pathwayId: 'z-unsure' },
    ],
  },
  {
    id: 'probe-animate-unchanged',
    suspectedCategory: 'acc-animacy',
    exerciseIds: ['fi-4'],
    question: 'What made you choose that form?',
    options: [
      { id: 'unchanged', text: 'I thought masculine nouns do not change when they are the object (as in “Mam samochód”).', pathwayId: 'anim-thought-unchanged' },
      { id: 'no-object', text: 'I did not think about case here: I did not see that the word needs a special form.', pathwayId: 'object-not-noticed' },
      { id: 'endings', text: 'I knew a person needs a different form, but I did not know the endings.', pathwayId: 'anim-endings-unknown' },
      { id: 'slip', text: 'It was a slip. I know people take -ego and -a.', pathwayId: 'anim-slip' },
    ],
  },
  {
    id: 'probe-inanimate-changed',
    suspectedCategory: 'acc-animacy',
    exerciseIds: ['fi-5'],
    question: 'What made you choose that form?',
    options: [
      { id: 'always', text: 'I thought masculine objects always take -ego and -a (as in “Znam dobrego lekarza”).', pathwayId: 'inanim-thought-changed' },
      { id: 'genitive', text: 'I thought kupować takes the genitive.', pathwayId: 'verb-takes-genitive' },
      { id: 'unsure', text: 'I was not sure of the rule, so I guessed.', pathwayId: 'animacy-unsure' },
    ],
  },
];
