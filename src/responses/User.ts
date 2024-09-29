export interface User{
  name: string,
  age: number,
  times?: {
    created: number,
    lastUpdated: number,
  }
}
