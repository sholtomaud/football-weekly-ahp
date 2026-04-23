/// <reference types="vite/client" />

declare module 'virtual:component-manifest' {
  // Using Promise<unknown> is safer than Promise<any> as it forces consumers to type-check.
  // Ideally, this would be Promise<{ default: CustomElementConstructor }> or similar
  // if all component modules export a default class, but unknown is a good general fix.
  export const COMPONENT_PATHS: Record<string, () => Promise<unknown>>;
}

// If you have other global type definitions or augmentations, they can go here.
// For example, if you import CSS modules:
// declare module '*.module.css' {
//   const classes: { readonly [key: string]: string };
//   export default classes;
// }
