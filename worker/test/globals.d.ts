// Vite ?raw imports (used to inline schema/seed SQL in tests).
declare module '*?raw' {
  const content: string;
  export default content;
}
