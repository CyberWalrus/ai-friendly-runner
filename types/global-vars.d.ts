declare type ValueOf<T> = T extends Record<string, infer U> ? U : never;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Array<T> {
    includes<U>(this: T extends U ? this : never, searchElement: U, fromIndex?: number): boolean;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ReadonlyArray<T> {
    includes<U>(this: T extends U ? this : never, searchElement: U, fromIndex?: number): boolean;
}
