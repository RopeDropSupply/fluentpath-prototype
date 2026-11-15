import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { LearnerState } from '../domain/types';
import { reduce, type Action, type NewAttempt } from '../learner/state';
import { browserStore, type LearnerStore } from '../learner/storage';

interface LearnerContextValue {
  state: LearnerState;
  dispatch: (action: Action) => void;
  record: (attempts: NewAttempt[]) => void;
}

const Ctx = createContext<LearnerContextValue | null>(null);

export function LearnerProvider({ children, store }: { children: ReactNode; store?: LearnerStore }) {
  const backing = useMemo(() => store ?? browserStore(), [store]);
  const [state, dispatch] = useReducer(reduce, undefined, () => backing.load());

  useEffect(() => {
    backing.save(state);
  }, [backing, state]);

  const record = useCallback((attempts: NewAttempt[]) => dispatch({ type: 'recordAttempts', attempts }), []);
  const value = useMemo(() => ({ state, dispatch, record }), [state, record]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLearner(): LearnerContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useLearner must be used inside LearnerProvider');
  return value;
}
