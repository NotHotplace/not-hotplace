import type {NextConfig} from 'next';

const config: NextConfig = {
  // Our metadata comes from the local catalog. Render it in the initial head
  // for browsers and crawlers, rather than deferring it into the streamed body.
  htmlLimitedBots: /.*/,
};

export default config;
