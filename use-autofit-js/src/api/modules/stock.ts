import request from "@/api/request";
import type { Stock } from "../interface";

// 获取库存
export const getStockList = () => {
  return request.get<Stock[]>(`/stock/list`);
};
