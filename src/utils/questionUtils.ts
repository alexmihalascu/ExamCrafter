export const OPTION_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const toLetter = (value, fallbackIndex = 0) => {
  if (!value) return OPTION_KEYS[fallbackIndex] || `opt${fallbackIndex}`;
  return value.toString().trim().toLowerCase();
};

const buildOptionsFromLegacyFields = (raw) =>
  OPTION_KEYS.map((key) => {
    const variant =
      raw[`varianta_${key}`] ||
      raw[key] ||
      raw[`option_${key}`] ||
      null;
    if (!variant) return null;
    return {
      id: key,
      text: variant.toString().trim(),
    };
  }).filter(Boolean);

const resolveCorrectAnswers = (raw, options) => {
  if (Array.isArray(raw.correctAnswers) && raw.correctAnswers.length) {
    return raw.correctAnswers
      .map((ans) => ans && ans.toString().trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof raw.raspuns_corect === 'string') {
    return raw.raspuns_corect
      .split(',')
      .map((ans) => ans && ans.trim().toLowerCase())
      .filter(Boolean);
  }

  if (raw.raspuns_corect) {
    return [raw.raspuns_corect.toString().trim().toLowerCase()];
  }

  if (raw.correct_answer) {
    return [raw.correct_answer.toString().trim().toLowerCase()];
  }

  return options.length ? [options[0].id] : [];
};

export const normalizeRawQuestion = (raw) => {
  if (!raw) return null;

  const questionText = raw.intrebare || raw.question || raw.text;
  if (!questionText || !questionText.toString().trim()) {
    return null;
  }

  let options = [];
  if (Array.isArray(raw.options) && raw.options.length) {
    options = raw.options
      .map((opt, index) => {
        const text = (opt?.text ?? opt?.value ?? '').toString().trim();
        if (!text) return null;
        return {
          id: toLetter(opt?.id, index),
          text,
        };
      })
      .filter(Boolean);
  } else {
    options = buildOptionsFromLegacyFields(raw);
  }

  if (options.length < 2) {
    return null;
  }

  const correctAnswers = resolveCorrectAnswers(raw, options);
  const allowMultiple =
    typeof raw.allowMultiple === 'boolean'
      ? raw.allowMultiple
      : correctAnswers.length > 1;

  const validCorrect = [...new Set(correctAnswers)].filter((ans) =>
    options.find((opt) => opt.id === ans)
  );

  if (!validCorrect.length) {
    validCorrect.push(options[0].id);
  }

  const legacyVariantFields = options.reduce((acc, option) => {
    acc[`varianta_${option.id}`] = option.text;
    return acc;
  }, {});

  return {
    intrebare: questionText.toString().trim(),
    options,
    correctAnswers: validCorrect,
    allowMultiple,
    raspuns_corect: validCorrect.join(','),
    ...legacyVariantFields,
  };
};

export const normalizeStoredQuestion = (raw) => {
  if (!raw) return null;
  const normalized = normalizeRawQuestion(raw);
  return {
    ...raw,
    ...normalized,
  };
};

export const formatTemplateSample = () => ({
  intrebare: 'Care dintre urmatoarele doua optiuni sunt corecte pentru ... ?',
  allowMultiple: true,
  options: [
    { id: 'a', text: 'Varianta 1' },
    { id: 'b', text: 'Varianta 2' },
    { id: 'c', text: 'Varianta 3' },
    { id: 'd', text: 'Varianta 4' },
  ],
  correctAnswers: ['a', 'c'],
});
