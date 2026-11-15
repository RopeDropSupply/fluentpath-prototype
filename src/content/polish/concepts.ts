import type { Concept, ErrorCategory } from '../../domain/types';

/**
 * Grammar reference for the prototype. Tables are deliberately limited to the
 * regular patterns the exercises use; simplifications are stated in the notes.
 * REVIEW STATUS: hand-authored, awaiting review by a qualified teacher of Polish.
 */
export const concepts: Record<string, Concept> = {
  'instr-sg': {
    id: 'instr-sg',
    title: 'Instrumental singular endings',
    summary:
      'Masculine and neuter nouns take -em; feminine nouns take -ą. Adjectives take -ym (masculine, neuter) or -ą (feminine).',
    tables: [
      {
        caption: 'Instrumental singular',
        headers: ['', 'Masculine', 'Neuter', 'Feminine'],
        rows: [
          ['Noun', '-em · dyrektor → dyrektorem', '-em · okno → oknem', '-ą · kultura → kulturą'],
          ['Noun after k, g', '-iem · Polak → Polakiem', '-iem · mleko → mlekiem', '-ą · książka → książką'],
          ['Adjective', '-ym · nowy → nowym', '-ym · nowe → nowym', '-ą · nowa → nową'],
          ['Adjective after k, g, soft stem', '-im · polski → polskim', '-im · tanie → tanim', '-ą · polska → polską'],
        ],
      },
    ],
    notes: [
      'Masculine nouns that end in -a (kolega, mężczyzna) decline like feminine nouns: z kolegą. Their adjective stays masculine: z dobrym kolegą.',
      'The masculine/neuter adjective ending -ym/-im is shared with the locative singular, so the governing word decides which case it is.',
    ],
  },
  'instr-pl': {
    id: 'instr-pl',
    title: 'Instrumental plural endings',
    summary: 'In the plural, gender no longer matters: nouns take -ami and adjectives take -ymi (or -imi).',
    tables: [
      {
        caption: 'Instrumental plural (all genders)',
        headers: ['', 'Ending', 'Examples'],
        rows: [
          ['Noun', '-ami', 'klient → klientami · koleżanka → koleżankami · okno → oknami'],
          ['Adjective', '-ymi', 'nowy → nowymi · zagraniczny → zagranicznymi'],
          ['Adjective after k, g, soft stem', '-imi', 'polski → polskimi · tani → tanimi'],
        ],
      },
    ],
    notes: ['A few common nouns are irregular (ludzie → ludźmi, dzieci → dziećmi). They are not practised here.'],
  },
  'instr-triggers': {
    id: 'instr-triggers',
    title: 'What requires the instrumental',
    summary: 'The instrumental is required by certain prepositions and verbs, and it expresses the means by which something is done.',
    tables: [
      {
        caption: 'Common instrumental triggers',
        headers: ['Trigger', 'Example'],
        rows: [
          ['z = "with" (accompaniment)', 'Rozmawiam z klientem.'],
          ['interesować się, zajmować się', 'Interesuję się kulturą.'],
          ['być / zostać + noun (profession, role)', 'Jestem inżynierem.'],
          ['Means or instrument, no preposition', 'Jadę autobusem.'],
          ['nad, pod, przed, za, między (location)', 'nad Bałtykiem'],
        ],
      },
    ],
    notes: ['z + genitive is a different construction meaning "from, out of": Wracam z pracy.'],
  },
  'acc-sg': {
    id: 'acc-sg',
    title: 'Accusative singular: gender and animacy',
    summary:
      'The accusative marks the direct object. Only feminine nouns and masculine animate nouns change their form in the singular.',
    tables: [
      {
        caption: 'Accusative singular',
        headers: ['Noun type', 'Rule', 'Example'],
        rows: [
          ['Masculine animate (people, animals)', 'same as genitive: noun -a, adjective -ego', 'Znam dobrego lekarza.'],
          ['Masculine inanimate (things)', 'same as nominative', 'Kupuję nowy samochód.'],
          ['Neuter', 'same as nominative', 'Mam nowe mieszkanie.'],
          ['Feminine in -a', 'noun -ę, adjective -ą', 'Czytam ciekawą książkę.'],
        ],
      },
    ],
    notes: [
      'The feminine adjective ends in -ą, not -ę. Only the noun takes -ę.',
      'Feminine nouns ending in a consonant (noc, rzecz) do not change in the accusative.',
      'In the plural, masculine personal nouns use the genitive form; all other nouns use the nominative plural form.',
    ],
  },
  'gen-sg': {
    id: 'gen-sg',
    title: 'Genitive singular endings',
    summary: 'Masculine and neuter adjectives take -ego, feminine adjectives -ej. Noun endings depend on gender and, for masculine nouns, on animacy.',
    tables: [
      {
        caption: 'Genitive singular',
        headers: ['Noun type', 'Noun ending', 'Adjective', 'Example'],
        rows: [
          ['Masculine animate', '-a', '-ego', 'dobrego lekarza, nowego psa'],
          ['Masculine inanimate', '-u or -a (learn with each noun)', '-ego', 'wolnego czasu, nowego samochodu; but: chleba'],
          ['Neuter', '-a', '-ego', 'taniego mieszkania, okna'],
          ['Feminine', '-y; -i after k, g and soft stems', '-ej', 'mojej siostry, nowej pracy, książki, energii'],
        ],
      },
    ],
    notes: [
      'For masculine inanimate nouns there is no fully reliable rule for -u versus -a. Abstract nouns, substances and many loanwords usually take -u (czasu, cukru, problemu).',
    ],
  },
  'gen-pl': {
    id: 'gen-pl',
    title: 'Genitive plural endings (simplified)',
    summary: 'Adjectives take -ych (or -ich). Hard-stem masculine nouns take -ów; most feminine and neuter nouns lose their ending.',
    tables: [
      {
        caption: 'Genitive plural, regular patterns',
        headers: ['Noun type', 'Ending', 'Examples'],
        rows: [
          ['Masculine, hard stem', '-ów', 'projekt → projektów · problem → problemów'],
          ['Feminine in -a, neuter in -o', 'no ending', 'kobieta → kobiet · turbina → turbin · okno → okien'],
          ['Adjective', '-ych; -ich after k, g, soft stem', 'nowych · polskich'],
        ],
      },
    ],
    notes: [
      'This table is simplified. Soft-stem nouns often take -i or -y (lekarzy, elektrowni), and a vowel may be inserted when the ending is dropped (książka → książek).',
    ],
  },
  'gen-triggers': {
    id: 'gen-triggers',
    title: 'What requires the genitive',
    summary: 'The genitive is required by negation of a direct object, by certain verbs and prepositions, and after expressions of quantity.',
    tables: [
      {
        caption: 'Common genitive triggers',
        headers: ['Trigger', 'Example'],
        rows: [
          ['Negated direct object (accusative → genitive)', 'Mam czas. → Nie mam czasu.'],
          ['Verbs: szukać, potrzebować, używać, uczyć się', 'Szukam pracy.'],
          ['Prepositions: do, od, z ("from"), bez, dla, u', 'prezent dla siostry'],
          ['Quantity: dużo, mało, więcej, wiele, kilka', 'dużo projektów'],
          ['Possession or "of"', 'ceny energii'],
        ],
      },
    ],
    notes: ['For masculine animate nouns the genitive and accusative look identical (brata), so negation changes the case but not the visible form.'],
  },
  'case-by-governor': {
    id: 'case-by-governor',
    title: 'Identify the case from the governing word',
    summary:
      'Many Polish endings are shared between cases. To identify a case reliably, find what governs the word: a preposition, a verb, negation or a quantity word. Adjectives take the case of their noun.',
    tables: [
      {
        caption: 'Endings that look alike',
        headers: ['Ending', 'Could be', 'Decided by'],
        rows: [
          ['-ej (nowej)', 'feminine genitive, dative or locative', 'szukam nowej pracy (genitive) · w nowej pracy (locative)'],
          ['-ym / -im (nowym)', 'masculine or neuter instrumental or locative', 'z nowym klientem (instrumental) · w nowym biurze (locative)'],
          ['-a (brata)', 'masculine animate genitive or accusative', 'mam brata (accusative) · nie mam brata (genitive)'],
          ['-ii (energii)', 'genitive, dative or locative', 'więcej energii (genitive) · o energii (locative)'],
        ],
      },
    ],
    notes: ['The preposition z takes the instrumental when it means "with" and the genitive when it means "from".'],
  },
};

const ACC = ['accusative'] as const;
const GEN = ['genitive'] as const;
const INS = ['instrumental'] as const;

export const errorCategories: Record<string, ErrorCategory> = {
  'instr-noun-ending': {
    id: 'instr-noun-ending',
    label: 'Instrumental noun ending',
    conceptId: 'instr-sg',
    diagnosis:
      'You chose the right case but the noun ending does not match its gender. In the instrumental singular, masculine and neuter nouns take -em (-iem after k or g) and feminine nouns take -ą.',
    competencies: [...INS],
    remediation: [
      {
        id: 'rem-instr-noun-1', type: 'fill', focus: 'Same rule, feminine noun',
        before: 'Rozmawiam z', after: '.', baseForm: 'koleżanka', hint: 'noun, feminine',
        answer: 'koleżanką', translation: 'I am talking with a (female) colleague.',
        explanation: 'Feminine nouns in -a take -ą in the instrumental: koleżanka → koleżanką.',
        competencies: [...INS],
      },
      {
        id: 'rem-instr-noun-2', type: 'fill', focus: 'Same rule, neuter noun after k',
        before: 'Piję kawę z', after: '.', baseForm: 'mleko', hint: 'noun, neuter',
        answer: 'mlekiem', translation: 'I drink coffee with milk.',
        explanation: 'Neuter nouns take -em like masculine nouns. After k or g an -i- is inserted: mleko → mlekiem.',
        competencies: [...INS],
      },
      {
        id: 'rem-instr-noun-3', type: 'fill', focus: 'New situation: no preposition',
        before: 'Jadę do pracy', after: '.', baseForm: 'autobus', hint: 'noun, masculine',
        answer: 'autobusem', translation: 'I go to work by bus.',
        explanation: 'The instrumental also expresses the means of doing something, without any preposition: autobus → autobusem.',
        competencies: [...INS],
      },
    ],
  },
  'instr-adj-ending': {
    id: 'instr-adj-ending',
    label: 'Instrumental adjective ending',
    conceptId: 'instr-sg',
    diagnosis:
      'The adjective must agree with its noun in the instrumental. Masculine and neuter adjectives take -ym (-im after k, g or a soft stem); feminine adjectives take -ą.',
    competencies: ['instrumental', 'adjective-agreement'],
    remediation: [
      {
        id: 'rem-instr-adj-1', type: 'fill', focus: 'Same rule, neuter noun',
        before: 'Idę na spacer z', after: 'dzieckiem.', baseForm: 'mały', hint: 'adjective',
        answer: 'małym', translation: 'I am going for a walk with a small child.',
        explanation: 'Neuter adjectives share the masculine ending in the instrumental: mały → małym.',
        competencies: ['instrumental', 'adjective-agreement'],
      },
      {
        id: 'rem-instr-adj-2', type: 'fill', focus: 'Same rule, feminine noun',
        before: 'Rozmawiam z', after: 'koleżanką.', baseForm: 'nowy', hint: 'adjective',
        answer: 'nową', translation: 'I am talking with a new (female) colleague.',
        explanation: 'With a feminine noun the adjective takes -ą, matching the noun: nową koleżanką.',
        competencies: ['instrumental', 'adjective-agreement'],
      },
      {
        id: 'rem-instr-adj-3', type: 'fill', focus: 'Stem ending in k',
        before: 'Pracuję z', after: 'inżynierem.', baseForm: 'polski', hint: 'adjective',
        answer: 'polskim', translation: 'I work with a Polish engineer.',
        explanation: 'After k or g the ending is spelled -im, not -ym: polski → polskim.',
        competencies: ['instrumental', 'adjective-agreement'],
      },
    ],
  },
  'instr-trigger': {
    id: 'instr-trigger',
    label: 'Recognising when the instrumental is required',
    conceptId: 'instr-triggers',
    diagnosis:
      'This slot requires the instrumental case. The preposition z meaning "with", and verbs such as interesować się and zajmować się, always take the instrumental, whatever the gender of the noun.',
    competencies: [...INS],
    remediation: [
      {
        id: 'rem-instr-trig-1', type: 'fill', focus: 'A verb that requires the instrumental',
        before: 'Interesuję się', after: '.', baseForm: 'muzyka', hint: 'noun, feminine',
        answer: 'muzyką', translation: 'I am interested in music.',
        explanation: 'interesować się requires the instrumental: muzyka → muzyką.',
        competencies: [...INS],
      },
      {
        id: 'rem-instr-trig-2', type: 'fill', focus: 'być + profession',
        before: 'Jestem', after: '.', baseForm: 'student', hint: 'noun, masculine',
        answer: 'studentem', translation: 'I am a student.',
        explanation: 'A noun that says what someone is, after być, goes in the instrumental: student → studentem.',
        competencies: [...INS],
      },
      {
        id: 'rem-instr-trig-3', type: 'choice', focus: 'Telling the two meanings of z apart',
        sentence: 'Wracam z pracy.', translation: 'I am coming back from work.',
        question: 'Which case is "pracy", and why?',
        options: [
          { id: 'a', text: 'Genitive: here z means "from"', correct: true, feedback: 'Correct. z meaning "from, out of" takes the genitive: praca → pracy.' },
          { id: 'b', text: 'Instrumental: z always takes the instrumental', correct: false, feedback: 'z takes the instrumental only when it means "with". The instrumental of praca would be pracą.' },
          { id: 'c', text: 'Locative: it describes a place', correct: false, feedback: 'The locative follows w, na, o, po and przy. The preposition z never takes it.' },
        ],
        explanation: 'z + instrumental means "with" (z klientem); z + genitive means "from" (z pracy).',
        competencies: ['instrumental', 'genitive'],
      },
    ],
  },
  'acc-animacy': {
    id: 'acc-animacy',
    label: 'Masculine animacy in the accusative',
    conceptId: 'acc-sg',
    diagnosis:
      'Masculine nouns split in the accusative singular. Animate nouns (people and animals) take the genitive form: noun -a, adjective -ego. Inanimate nouns keep the nominative form.',
    competencies: [...ACC],
    remediation: [
      {
        id: 'rem-anim-1', type: 'fill', focus: 'Animate: a person',
        before: 'Mam', after: '.', baseForm: 'brat', hint: 'noun, masculine',
        answer: 'brata', translation: 'I have a brother.',
        explanation: 'brat is a person, so the accusative equals the genitive: brata.',
        competencies: [...ACC],
      },
      {
        id: 'rem-anim-2', type: 'fill', focus: 'Inanimate: a thing',
        before: 'Widzę', after: '.', baseForm: 'stary dom', hint: 'adjective + noun',
        answer: 'stary dom', translation: 'I see an old house.',
        explanation: 'dom is a thing, so the accusative equals the nominative: stary dom. Nothing changes.',
        competencies: ['accusative', 'adjective-agreement'],
      },
      {
        id: 'rem-anim-3', type: 'fill', focus: 'Animate: an animal, with an adjective',
        before: 'Widzę', after: '.', baseForm: 'duży pies', hint: 'adjective + noun',
        answer: 'dużego psa', translation: 'I see a big dog.',
        explanation: 'Animals count as animate: the adjective takes -ego and the noun -a. The e in pies drops out: psa.',
        competencies: ['accusative', 'adjective-agreement'],
      },
    ],
  },
  'acc-fem-ending': {
    id: 'acc-fem-ending',
    label: 'Feminine accusative endings (-ą and -ę)',
    conceptId: 'acc-sg',
    diagnosis:
      'In the feminine accusative singular the noun takes -ę but the adjective takes -ą: ciekawą książkę. The ending -ą on a noun belongs to the instrumental.',
    competencies: ['accusative', 'adjective-agreement'],
    remediation: [
      {
        id: 'rem-accf-1', type: 'fill', focus: 'Same rule, new words',
        before: 'Piję', after: '.', baseForm: 'zimna woda', hint: 'adjective + noun',
        answer: 'zimną wodę', translation: 'I am drinking cold water.',
        explanation: 'Adjective -ą, noun -ę: zimną wodę.',
        competencies: ['accusative', 'adjective-agreement'],
      },
      {
        id: 'rem-accf-2', type: 'fill', focus: 'Same rule, new words',
        before: 'Mam', after: '.', baseForm: 'dobra praca', hint: 'adjective + noun',
        answer: 'dobrą pracę', translation: 'I have a good job.',
        explanation: 'Adjective -ą, noun -ę: dobrą pracę.',
        competencies: ['accusative', 'adjective-agreement'],
      },
      {
        id: 'rem-accf-3', type: 'fill', focus: 'Contrast: the instrumental of a feminine noun',
        before: 'Piję herbatę z', after: '.', baseForm: 'cytryna', hint: 'noun, feminine',
        answer: 'cytryną', translation: 'I drink tea with lemon.',
        explanation: 'herbatę is the direct object (accusative, -ę). After z ("with") the noun is instrumental, and there the noun does take -ą: cytryną.',
        competencies: ['instrumental'],
      },
    ],
  },
  'gen-negation': {
    id: 'gen-negation',
    label: 'Genitive after negation',
    conceptId: 'gen-triggers',
    diagnosis:
      'When a verb that takes an accusative object is negated, the object changes to the genitive: Mam czas → Nie mam czasu.',
    competencies: [...GEN],
    remediation: [
      {
        id: 'rem-neg-1', type: 'fill', focus: 'Same rule, feminine noun',
        before: 'Nie piję', after: '.', baseForm: 'kawa', hint: 'noun, feminine',
        answer: 'kawy', translation: 'I do not drink coffee.',
        explanation: 'Piję kawę (accusative) becomes Nie piję kawy (genitive).',
        competencies: [...GEN],
      },
      {
        id: 'rem-neg-2', type: 'fill', focus: 'Same rule, neuter noun with an adjective',
        before: 'Nie lubię', after: '.', baseForm: 'zimne mleko', hint: 'adjective + noun',
        answer: 'zimnego mleka', translation: 'I do not like cold milk.',
        explanation: 'Neuter genitive: adjective -ego, noun -a: zimnego mleka.',
        competencies: ['genitive', 'adjective-agreement'],
      },
      {
        id: 'rem-neg-3', type: 'choice', focus: 'When the form does not change',
        sentence: 'Nie mam brata.', translation: 'I do not have a brother.',
        question: 'Which case is "brata" here?',
        options: [
          { id: 'a', text: 'Genitive, because the verb is negated', correct: true, feedback: 'Correct. The form is the same as in "Mam brata", but negation makes it genitive.' },
          { id: 'b', text: 'Accusative, because it is the object of mieć', correct: false, feedback: 'It would be accusative in "Mam brata". Once the verb is negated the object is genitive, even though the form brata looks identical.' },
          { id: 'c', text: 'Nominative, because it is the subject', correct: false, feedback: 'The subject is the unexpressed "I". brata is the object, and the nominative would be brat.' },
        ],
        explanation: 'For masculine animate nouns the accusative and genitive forms coincide, so the case must be read from the sentence structure.',
        competencies: [...GEN],
      },
    ],
  },
  'gen-trigger': {
    id: 'gen-trigger',
    label: 'Verbs, prepositions and quantities that require the genitive',
    conceptId: 'gen-triggers',
    diagnosis:
      'This slot requires the genitive. Some verbs (szukać, potrzebować), prepositions (dla, do, bez, od) and quantity words (dużo, więcej) always take the genitive rather than the accusative.',
    competencies: [...GEN],
    remediation: [
      {
        id: 'rem-gentrig-1', type: 'fill', focus: 'Another genitive verb',
        before: 'Potrzebuję', after: '.', baseForm: 'pomoc', hint: 'noun, feminine',
        answer: 'pomocy', translation: 'I need help.',
        explanation: 'potrzebować takes the genitive: pomoc → pomocy.',
        competencies: [...GEN],
      },
      {
        id: 'rem-gentrig-2', type: 'fill', focus: 'A genitive preposition, masculine noun',
        before: 'Idę do', after: '.', baseForm: 'sklep', hint: 'noun, masculine',
        answer: 'sklepu', translation: 'I am going to the shop.',
        explanation: 'do takes the genitive: sklep → sklepu.',
        competencies: [...GEN],
      },
      {
        id: 'rem-gentrig-3', type: 'fill', focus: 'A genitive preposition, new noun',
        before: 'Piję kawę bez', after: '.', baseForm: 'cukier', hint: 'noun, masculine',
        answer: 'cukru', translation: 'I drink coffee without sugar.',
        explanation: 'bez takes the genitive. The e in cukier drops out: cukru.',
        competencies: [...GEN],
      },
    ],
  },
  'gen-ending': {
    id: 'gen-ending',
    label: 'Genitive singular endings',
    conceptId: 'gen-sg',
    diagnosis:
      'You chose the genitive, but the ending does not fit this noun or adjective. Masculine and neuter adjectives take -ego, feminine adjectives -ej. Feminine nouns take -y or -i, neuter nouns -a, and masculine inanimate nouns -u or -a.',
    competencies: ['genitive', 'adjective-agreement'],
    remediation: [
      {
        id: 'rem-genend-1', type: 'fill', focus: 'Masculine inanimate noun',
        before: 'Nie mam', after: '.', baseForm: 'problem', hint: 'noun, masculine',
        answer: 'problemu', translation: 'I do not have a problem.',
        explanation: 'problem is masculine inanimate and takes -u: problemu.',
        competencies: [...GEN],
      },
      {
        id: 'rem-genend-2', type: 'fill', focus: 'Feminine noun after k',
        before: 'Nie mam', after: '.', baseForm: 'książka', hint: 'noun, feminine',
        answer: 'książki', translation: 'I do not have a book.',
        explanation: 'Feminine nouns take -y, but after k or g the ending is -i: książki.',
        competencies: [...GEN],
      },
      {
        id: 'rem-genend-3', type: 'fill', focus: 'Feminine adjective and noun',
        before: 'Szukam', after: '.', baseForm: 'dobra szkoła', hint: 'adjective + noun',
        answer: 'dobrej szkoły', translation: 'I am looking for a good school.',
        explanation: 'Feminine genitive: adjective -ej, noun -y: dobrej szkoły.',
        competencies: ['genitive', 'adjective-agreement'],
      },
    ],
  },
  'plural-instr': {
    id: 'plural-instr',
    label: 'Instrumental plural endings',
    conceptId: 'instr-pl',
    diagnosis:
      'In the instrumental plural all genders share one pattern: nouns take -ami and adjectives take -ymi (or -imi after k, g or a soft stem).',
    competencies: ['instrumental', 'adjective-agreement'],
    remediation: [
      {
        id: 'rem-plinstr-1', type: 'fill', focus: 'Masculine noun, plural',
        before: 'Rozmawiam ze', after: '.', baseForm: 'student (plural)', hint: 'noun, plural',
        answer: 'studentami', translation: 'I am talking with students.',
        explanation: 'Plural instrumental nouns take -ami: studentami.',
        competencies: [...INS],
      },
      {
        id: 'rem-plinstr-2', type: 'fill', focus: 'Feminine noun with an adjective, plural',
        before: 'Pracuję z', after: '.', baseForm: 'nowa koleżanka (plural)', hint: 'adjective + noun, plural',
        answer: 'nowymi koleżankami', translation: 'I work with new (female) colleagues.',
        explanation: 'Gender makes no difference in the plural: nowymi koleżankami.',
        competencies: ['instrumental', 'adjective-agreement'],
      },
    ],
  },
  'plural-gen': {
    id: 'plural-gen',
    label: 'Genitive plural endings',
    conceptId: 'gen-pl',
    diagnosis:
      'Quantity words such as dużo take the genitive plural. Adjectives take -ych (or -ich); hard-stem masculine nouns take -ów; most feminine nouns in -a simply drop the ending.',
    competencies: ['genitive', 'adjective-agreement'],
    remediation: [
      {
        id: 'rem-plgen-1', type: 'fill', focus: 'Masculine noun, plural',
        before: 'Mamy dużo', after: '.', baseForm: 'problem (plural)', hint: 'noun, plural',
        answer: 'problemów', translation: 'We have a lot of problems.',
        explanation: 'Hard-stem masculine nouns take -ów: problemów.',
        competencies: [...GEN],
      },
      {
        id: 'rem-plgen-2', type: 'fill', focus: 'Feminine noun, plural',
        before: 'W firmie pracuje dużo', after: '.', baseForm: 'kobieta (plural)', hint: 'noun, plural',
        answer: 'kobiet', translation: 'A lot of women work at the company.',
        explanation: 'Feminine nouns in -a drop the ending in the genitive plural: kobieta → kobiet.',
        competencies: [...GEN],
      },
    ],
  },
  'case-by-governor': {
    id: 'case-by-governor',
    label: 'Identifying a case from what governs it',
    conceptId: 'case-by-governor',
    diagnosis:
      'Several endings are shared between cases, so the ending alone is not enough. Find the governing word first (a preposition, a verb, negation or a quantity word), then let adjectives follow their noun.',
    competencies: [],
    remediation: [
      {
        id: 'rem-gov-1', type: 'choice', focus: 'One preposition, two cases',
        sentence: 'Wracam z pracy.', translation: 'I am coming back from work.',
        question: 'Which case is "pracy"?',
        options: [
          { id: 'a', text: 'Genitive: z means "from" here', correct: true, feedback: 'Correct. z + genitive means "from".' },
          { id: 'b', text: 'Instrumental: z means "with"', correct: false, feedback: 'With the meaning "with", the form would be z pracą. Here the meaning is "from", which takes the genitive.' },
          { id: 'c', text: 'Locative', correct: false, feedback: 'z never takes the locative.' },
        ],
        explanation: 'The same preposition can govern different cases with different meanings. Read the meaning, then the case.',
        competencies: ['genitive'],
      },
      {
        id: 'rem-gov-2', type: 'choice', focus: 'One ending, several cases',
        sentence: 'Mówię o nowej pracy.', translation: 'I am talking about a new job.',
        question: 'Which case is "nowej"?',
        options: [
          { id: 'a', text: 'Locative: it agrees with pracy, which follows o', correct: true, feedback: 'Correct. o ("about") takes the locative, and the adjective copies the case of its noun.' },
          { id: 'b', text: 'Genitive: the ending is -ej', correct: false, feedback: '-ej is also the feminine genitive ending, but nothing here requires the genitive. The preposition o requires the locative.' },
          { id: 'c', text: 'Instrumental', correct: false, feedback: 'The feminine instrumental ending is -ą (nową pracą).' },
        ],
        explanation: 'The ending -ej is shared by the feminine genitive, dative and locative. The governing word decides.',
        competencies: ['locative'],
      },
      {
        id: 'rem-gov-3', type: 'choice', focus: 'Negation',
        sentence: 'Nie znam tego pana.', translation: 'I do not know this man.',
        question: 'Which case is "tego pana"?',
        options: [
          { id: 'a', text: 'Genitive: the verb is negated', correct: true, feedback: 'Correct. Without negation (Znam tego pana) the identical form would be accusative.' },
          { id: 'b', text: 'Accusative: it is the direct object', correct: false, feedback: 'It is the object, but a negated verb puts its object in the genitive. The form happens to look the same for masculine animate nouns.' },
          { id: 'c', text: 'Instrumental', correct: false, feedback: 'The instrumental would be tym panem.' },
        ],
        explanation: 'For masculine animate nouns the genitive and accusative forms coincide. Only the sentence structure tells them apart.',
        competencies: ['genitive'],
      },
    ],
  },
  'vocab-recall': {
    id: 'vocab-recall',
    label: 'Recalling professional vocabulary',
    conceptId: '',
    diagnosis: 'This word was not recalled correctly. Review the vocabulary list in the lesson, paying attention to spelling and Polish letters.',
    competencies: ['professional-vocabulary'],
    remediation: [],
  },
};
