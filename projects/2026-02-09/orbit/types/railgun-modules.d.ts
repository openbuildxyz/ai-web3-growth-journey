declare module 'abstract-leveldown' {
  export interface AbstractLevelDOWN {
    get(key: string, cb: (err: Error | undefined, value: unknown) => void): void;
    put(key: string, value: unknown, cb: (err?: Error) => void): void;
    del(key: string, cb: (err?: Error) => void): void;
    batch(ops: unknown[], cb: (err?: Error) => void): void;
    close(cb: (err?: Error) => void): void;
  }
}

declare module 'memdown' {
  const memdown: () => import('abstract-leveldown').AbstractLevelDOWN;
  export default memdown;
}

declare module 'leveldown' {
  const leveldown: (path: string) => import('abstract-leveldown').AbstractLevelDOWN;
  export default leveldown;
}

declare module 'snarkjs' {
  export const groth16: {
    fullProve(
      input: unknown,
      wasm: unknown,
      zkey: unknown,
      logger: unknown
    ): Promise<{ proof: unknown; publicSignals: string[] }>;
    verify(vkey: unknown, publicSignals: string[], proof: unknown): Promise<boolean>;
  };
}
