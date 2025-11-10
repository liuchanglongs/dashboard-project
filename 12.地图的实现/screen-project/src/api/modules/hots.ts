import request from "@/api/request";
import type { Hots } from "../interface";

// 获取热销列表
export const getHotsList = () => {
  return request.get<Hots[]>(`/hots/list`);
};
