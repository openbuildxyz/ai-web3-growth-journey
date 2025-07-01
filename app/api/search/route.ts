import { createTokenizer } from '@orama/tokenizers/mandarin';
import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '@/lib/source';

export const { GET } = createFromSource(source, undefined, {
  localeMap: {
    'zh': {
      tokenizer: createTokenizer(),
      search: {
        threshold: 1,
        tolerance: 1,
      },
    },

    // use the English tokenizer
    en: 'english',
  },
});
