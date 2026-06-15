// Shared domain types for ExamCrafter.

export type AccessLevel = 'owned' | 'shared' | 'public';
export type Visibility = 'private' | 'public';

export interface QuestionOption {
  id: string;
  text: string;
}

/** A question after normalization, ready to render in the quiz. */
export interface NormalizedQuestion {
  id?: string;
  intrebare: string;
  options: QuestionOption[];
  correctAnswers: string[];
  allowMultiple: boolean;
  raspuns_corect: string;
  varianta_corecta?: string;
  createdAt?: unknown;
  // Legacy flat fields such as `varianta_a`, `option_b`, etc.
  [key: string]: unknown;
}

/** Raw, untyped shape coming from Firestore or an imported file. */
export type RawQuestion = Record<string, unknown> & {
  intrebare?: unknown;
  question?: unknown;
  text?: unknown;
  options?: Array<{ id?: unknown; text?: unknown; value?: unknown }>;
  correctAnswers?: unknown[];
  raspuns_corect?: unknown;
  correct_answer?: unknown;
  allowMultiple?: unknown;
};

export interface QuestionSet {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  visibility: Visibility;
  sharedWith: string[];
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  questionCount?: number;
  access: AccessLevel;
  createdAt?: { toMillis?: () => number } | null;
  updatedAt?: { toMillis?: () => number } | null;
}

export interface BundleSetSummary {
  id: string;
  name: string;
  questionCount?: number;
}

export interface QuizBundle {
  id: string;
  name: string;
  description?: string;
  questionCount?: number;
  totalAvailableQuestions?: number;
  setIds: string[];
  setSummaries: BundleSetSummary[];
  visibility: Visibility;
  sharedWith: string[];
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  access: AccessLevel;
  createdAt?: { toMillis?: () => number } | null;
  updatedAt?: { toMillis?: () => number } | null;
}

/** Metadata about the source of an active quiz. */
export interface QuizSourceMeta {
  id: string;
  name: string;
  visibility?: Visibility;
  access?: AccessLevel;
}

export interface QuizResult {
  id?: string;
  user_id: string;
  quiz_type: string;
  question_set_id?: string | null;
  question_set_name?: string;
  question_set_visibility?: Visibility;
  question_set_access?: AccessLevel;
  question_bundle_id?: string | null;
  question_bundle_name?: string;
  question_bundle_visibility?: Visibility;
  question_bundle_access?: AccessLevel;
  correct_answers: number;
  total_questions?: number;
  question_count?: number;
  passed: boolean;
  timestamp?: string;
  created_at?: string;
}

/** A user record stored in the `users` collection / used for sharing. */
export interface SharedUser {
  id: string;
  email: string;
  emailLowercase: string;
  displayName: string;
  photoURL: string;
}
