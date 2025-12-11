declare module 'translate-google' {
  interface TranslateOptions {
    from?: string;
    to?: string;
    cache?: number;
    raw?: boolean;
  }

  function translate(
    text: string | string[],
    options?: TranslateOptions,
  ): Promise<string | string[]>;

  export = translate;
}
