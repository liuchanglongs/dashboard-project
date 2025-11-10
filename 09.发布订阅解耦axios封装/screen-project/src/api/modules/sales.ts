import type { Sales } from "../interface";
import request from "../request";

export const getSalesList = () => { 
  return request.get<Sales[]>('/api/sales/list');
}