export interface Analyst {
  id: string;
  chineseName: string;
  englishName: string;
  introduction: string;
}

export const ANALYSTS: Analyst[] = [
  {
    id: "bill_ackman",
    chineseName: "比尔·阿克曼",
    englishName: "bill ackman",
    introduction: "\"激进投资者\"，采取大胆立场并推动变革"
  },
  {
    id: "charlie_munger",
    chineseName: "查理·芒格",
    englishName: "charlie munger",
    introduction: "\"巴菲特搭档\"，只以合理价格收购卓越企业"
  },
  {
    id: "phil_fisher",
    chineseName: "菲利普·费雪",
    englishName: "phil fisher",
    introduction: "\"严谨的成长股投资者\"，采用深度\"小道消息\"研究法"
  },
  {
    id: "stanley_druckenmi",
    chineseName: "斯坦利·德鲁肯米勒",
    englishName: "stanley druckenmi",
    introduction: "\"宏观传奇\"，寻找具有增长潜力的不对称机会"
  },
  {
    id: "warren_buffett",
    chineseName: "沃伦·巴菲特",
    englishName: "warren buffett",
    introduction: "\"奥马哈先知\"，以合理价格寻求卓越企业"
  }
]; 