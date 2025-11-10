import request from "@/api/request";
import type { Rank } from "../interface";

// 获取排行榜列表
export const getRankList = () => {
  return request.get<Rank[]>(`/rank/list`);
};
