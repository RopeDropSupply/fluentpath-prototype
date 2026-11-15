import type { ErrorCategory, Exercise, LanguagePack } from '../domain/types';
import { concepts, errorCategories } from './polish/concepts';
import { coreExercises } from './polish/exercises';
import { lesson, lessonExercises } from './polish/lesson';

/** Polish is the only functional language pack. Others would be added here. */
export const polish: LanguagePack = {
  code: 'pl',
  name: 'Polish',
  exercises: [...coreExercises, ...lessonExercises],
  errorCategories,
  concepts,
  lesson,
};

export const pack = polish;

export const PLANNED_LANGUAGES = ['Spanish', 'German', 'French', 'Italian'];

export function getExercise(id: string): Exercise | undefined {
  return pack.exercises.find((e) => e.id === id);
}

export function getCategory(id: string): ErrorCategory | undefined {
  return pack.errorCategories[id];
}

export const coreExerciseList = pack.exercises.filter((e) => e.track === 'core');
