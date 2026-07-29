import { useState, useEffect } from "react";
import type { ThirdLanguage } from "./branch-data";

export interface BranchState {
  branchId: string | null;
  thirdLanguage: ThirdLanguage | null;
}

function storageKey(userId: string | number, grade: string) {
  return `djadi_branch_${userId}_${grade}`;
}

function readStorage(userId: string | number, grade: string): BranchState {
  try {
    const raw = localStorage.getItem(storageKey(userId, grade));
    if (raw) return JSON.parse(raw) as BranchState;
  } catch {
    // ignore
  }
  return { branchId: null, thirdLanguage: null };
}

function writeStorage(
  userId: string | number,
  grade: string,
  state: BranchState
) {
  try {
    localStorage.setItem(storageKey(userId, grade), JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** Read branchId without needing a React hook (for redirect logic) */
export function getBranchIdSync(
  userId: string | number | undefined,
  grade: string | undefined | null
): string | null {
  if (!userId || !grade) return null;
  return readStorage(userId, grade).branchId;
}

export function useBranch(
  userId: string | number | undefined,
  grade: string | undefined | null
) {
  const [state, setState] = useState<BranchState>(() => {
    if (!userId || !grade) return { branchId: null, thirdLanguage: null };
    return readStorage(userId, grade);
  });

  // Re-sync if userId/grade change (e.g. after grade selection)
  useEffect(() => {
    if (!userId || !grade) {
      setState({ branchId: null, thirdLanguage: null });
      return;
    }
    setState(readStorage(userId, grade));
  }, [userId, grade]);

  const setBranch = (branchId: string) => {
    if (!userId || !grade) return;
    const next: BranchState = { ...state, branchId };
    writeStorage(userId, grade, next);
    setState(next);
  };

  const setThirdLanguage = (lang: ThirdLanguage) => {
    if (!userId || !grade) return;
    const next: BranchState = { ...state, thirdLanguage: lang };
    writeStorage(userId, grade, next);
    setState(next);
  };

  const clearBranch = () => {
    if (!userId || !grade) return;
    const next: BranchState = { branchId: null, thirdLanguage: null };
    writeStorage(userId, grade, next);
    setState(next);
  };

  return { ...state, setBranch, setThirdLanguage, clearBranch };
}
