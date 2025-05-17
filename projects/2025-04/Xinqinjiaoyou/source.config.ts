import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
      dir: 'content/docs',
    });

export const makeFriends = defineDocs({
      dir: 'content/make-friends',
    });

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
