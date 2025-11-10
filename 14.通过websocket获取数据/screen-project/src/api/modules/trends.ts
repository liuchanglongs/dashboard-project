import request from "@/api/request";
import type { Trends } from "../interface";

// 获取趋势列表
export const getTrendsList = () => {
  return request.get<Trends[]>(`/trends/list`);
};
