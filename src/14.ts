export type PerfReview<F extends AsyncGenerator> = F extends AsyncGenerator<infer T> ? T : never;
