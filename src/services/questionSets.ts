import { collection, getDocs, query, where } from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import type { AccessLevel, QuestionSet, QuizBundle } from '../types';

const PRIORITY: Record<AccessLevel, number> = { public: 1, shared: 2, owned: 3 };

const resolveAccessPriority = (current: AccessLevel, candidate: AccessLevel): boolean =>
  PRIORITY[candidate] >= PRIORITY[current];

const normalizeSet = (docSnap: QueryDocumentSnapshot, access: AccessLevel): QuestionSet => {
  const data = docSnap.data();
  return {
    ...(data as Omit<QuestionSet, 'id' | 'access'>),
    id: docSnap.id,
    access,
    sharedWith: data.sharedWith || [],
  };
};

const normalizeBundle = (docSnap: QueryDocumentSnapshot, access: AccessLevel): QuizBundle => {
  const data = docSnap.data();
  return {
    ...(data as Omit<QuizBundle, 'id' | 'access'>),
    id: docSnap.id,
    access,
    sharedWith: data.sharedWith || [],
    setIds: data.setIds || [],
    setSummaries: data.setSummaries || [],
  };
};

const byUpdatedDesc = (
  a: { updatedAt?: { toMillis?: () => number } | null },
  b: { updatedAt?: { toMillis?: () => number } | null }
): number => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0);

export const fetchAccessibleQuestionSets = async (
  currentUser: User | null | undefined
): Promise<QuestionSet[]> => {
  if (!currentUser) return [];

  const setsRef = collection(db, 'questionSets');
  const setsMap = new Map<string, QuestionSet>();

  const upsert = (docSnap: QueryDocumentSnapshot, candidateAccess: AccessLevel = 'public') => {
    const data = docSnap.data();
    const access: AccessLevel = data.ownerId === currentUser.uid ? 'owned' : candidateAccess;
    const existing = setsMap.get(docSnap.id);
    if (!existing || resolveAccessPriority(existing.access, access)) {
      setsMap.set(docSnap.id, normalizeSet(docSnap, access));
    }
  };

  const ownedSnapshot = await getDocs(query(setsRef, where('ownerId', '==', currentUser.uid)));
  ownedSnapshot.forEach((docSnap) => upsert(docSnap, 'owned'));

  if (currentUser.email) {
    const sharedSnapshot = await getDocs(
      query(setsRef, where('sharedWith', 'array-contains', currentUser.email.toLowerCase()))
    );
    sharedSnapshot.forEach((docSnap) => upsert(docSnap, 'shared'));
  }

  const publicSnapshot = await getDocs(query(setsRef, where('visibility', '==', 'public')));
  publicSnapshot.forEach((docSnap) => upsert(docSnap, 'public'));

  return Array.from(setsMap.values()).sort(byUpdatedDesc);
};

export const fetchAccessibleQuizBundles = async (
  currentUser: User | null | undefined
): Promise<QuizBundle[]> => {
  if (!currentUser) return [];

  const bundlesRef = collection(db, 'quizBundles');
  const bundlesMap = new Map<string, QuizBundle>();

  const upsert = (docSnap: QueryDocumentSnapshot, candidateAccess: AccessLevel = 'public') => {
    const data = docSnap.data();
    const access: AccessLevel = data.ownerId === currentUser.uid ? 'owned' : candidateAccess;
    const existing = bundlesMap.get(docSnap.id);
    if (!existing || resolveAccessPriority(existing.access, access)) {
      bundlesMap.set(docSnap.id, normalizeBundle(docSnap, access));
    }
  };

  const ownedSnapshot = await getDocs(query(bundlesRef, where('ownerId', '==', currentUser.uid)));
  ownedSnapshot.forEach((docSnap) => upsert(docSnap, 'owned'));

  if (currentUser.email) {
    const sharedSnapshot = await getDocs(
      query(bundlesRef, where('sharedWith', 'array-contains', currentUser.email.toLowerCase()))
    );
    sharedSnapshot.forEach((docSnap) => upsert(docSnap, 'shared'));
  }

  const publicSnapshot = await getDocs(query(bundlesRef, where('visibility', '==', 'public')));
  publicSnapshot.forEach((docSnap) => upsert(docSnap, 'public'));

  return Array.from(bundlesMap.values()).sort(byUpdatedDesc);
};

export default fetchAccessibleQuestionSets;
