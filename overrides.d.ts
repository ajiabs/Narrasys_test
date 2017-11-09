//http://stackoverflow.com/a/42035067
declare global {
  const angular: ng.IAngularStatic;
}
export {};

declare module '*.html' {
  const content: string;
  export default content;
}
