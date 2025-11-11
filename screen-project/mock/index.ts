import { MockMethod } from "vite-plugin-mock"
import Mock from 'mockjs'
import util from './util'
export default [
  {
    url: '/api/sales/list',
    method: 'get',
    response: () => { 
      const json = util.getJsonFile('./data/salesInfo.json');
      return Mock.mock(json);
    }
  },
  {
    url: '/api/trends/list',
    method: 'get',
    response: () => { 
      const json = util.getJsonFile('./data/trendsInfo.json');
      return Mock.mock(json);
    }
  },
  {
    url: "/api/hots/list",
    method: "get",
    response: () => {
      const json = util.getJsonFile("./data/hotsInfo.json");
      return Mock.mock(json);
    }
  },
  {
    url: "/api/stock/list",
    method: "get",
    response: () => {
      const json = util.getJsonFile("./data/stockInfo.json");
      return Mock.mock(json);
    }
  },
  {
    url: "/api/rank/list",
    method: "get",
    response: () => {
      const json = util.getJsonFile("./data/rankInfo.json");
      return Mock.mock(json);
    }
  }
] as MockMethod[]