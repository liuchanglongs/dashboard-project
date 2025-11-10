export interface Result { 
  code: number;
  msg: string;
  success: boolean;
}

export interface ResultData<T = any> extends Result { 
  data?: T;
}

export interface Sales{
  _id: string;
  name: string;
  value: number;
}

export interface Trends { 
  _id: string;
  name: string;
  data: number[];
}

export interface Hots {
  name: string;
  value?: number;
  children?: Hots[];
}

export interface Stock {
  name: string;
  stock: number;
  sales: number;
}

export interface Rank {
  _id: string;
  name: string;
  value: number;
}