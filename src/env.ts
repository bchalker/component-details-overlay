declare const process: { env: { NODE_ENV?: string } };

/**
 * True when the host app was built for production.
 *
 * Bundlers (Vite, webpack, Next.js, Parcel) replace `process.env.NODE_ENV` with a string
 * at build time, so this check costs nothing at runtime. If nothing replaced it and there
 * is no `process` global, we can't tell, so we treat it as production and stay off.
 */
export function isProductionBuild(): boolean {
  try {
    return process.env.NODE_ENV === 'production';
  } catch {
    return true;
  }
}
