import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const resolveAccessPriority = (current, candidate) => {
  const priority = { public: 1, shared: 2, owned: 3 };
  return priority[candidate] >= priority[current];
};

const normalizeSet = (docSnap, access) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    access,
    sharedWith: data.sharedWith || [],
  };
};

export const fetchAccessibleQuestionSets = async (currentUser) => {
  if (!currentUser) return [];

  const setsRef = collection(db, 'questionSets');
  const setsMap = new Map();

  const upsert = (docSnap, candidateAccess = 'public') => {
    const data = docSnap.data();
    const access = data.ownerId === currentUser.uid ? 'owned' : candidateAccess;
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

  return Array.from(setsMap.values()).sort((a, b) => {
    const left = a.updatedAt?.toMillis?.() ?? 0;
    const right = b.updatedAt?.toMillis?.() ?? 0;
    return right - left;
  });
};

const normalizeBundle = (docSnap, access) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    access,
    sharedWith: data.sharedWith || [],
    setIds: data.setIds || [],
    setSummaries: data.setSummaries || [],
  };
};

export const fetchAccessibleQuizBundles = async (currentUser) => {
  if (!currentUser) return [];

  const bundlesRef = collection(db, 'quizBundles');
  const bundlesMap = new Map();

  const upsert = (docSnap, candidateAccess = 'public') => {
    const data = docSnap.data();
    const access = data.ownerId === currentUser.uid ? 'owned' : candidateAccess;
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

  return Array.from(bundlesMap.values()).sort((a, b) => {
    const left = a.updatedAt?.toMillis?.() ?? 0;
    const right = b.updatedAt?.toMillis?.() ?? 0;
    return right - left;
  });
};

export default fetchAccessibleQuestionSets;
