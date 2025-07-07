// This file allows importing PNG, JPG, JPEG, and WEBP images in TypeScript/TSX files
// so you can use: import logo from '../images/logo-constru.png';
declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '*.jpeg' {
  const value: string;
  export default value;
}
declare module '*.webp' {
  const value: string;
  export default value;
}
