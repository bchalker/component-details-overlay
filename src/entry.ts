// Build entry. Pulls the stylesheet into the build (it ships as dist/styles.css) and
// re-exports the public API. Types come from index.ts so they don't reference the .scss file.
import './styles.scss';

export * from './index';
