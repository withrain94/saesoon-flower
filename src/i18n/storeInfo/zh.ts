import {
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  PAYPAL_FEE_RATE,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { storeContact } from "@/data/shop";
import type { StoreInfoMessages } from "./ko";

/** 中文(简体) — 모양은 storeInfo/ko.ts와 같아야 한다 */
const { open, close } = storeContact.staffedHours;
const h12 = (hour: number) => (hour > 12 ? `下午${hour - 12}点` : `上午${hour}点`);

export const storeInfoZh: StoreInfoMessages = {
  hero: {
    eyebrow: "重要日子的花,连同心意一起送达",
    badges: ["24小时无人花店 · 全年无休", "12年经验花艺师", "全州·完州送花"],
    book: "预约鲜花",
    location: "店铺位置",
  },

  quick: {
    ariaLabel: "店铺位置",
    landmark: "乐天Fresh全州革新店旁边",
    hours: "24小时 · 全年无休",
    call: "电话",
    map: "地图",
    kakao: "KakaoTalk",
  },

  steps: {
    title: "3步轻松预约",
    subtitle: "无需注册。提交后我们会告诉您付款方式。",
    items: {
      items: "选花",
      dateTime: "日期·时间",
      reserve: "姓名·电话",
    },
  },

  reviews: {
    title: "顾客评价",
    subtitle: "顾客收到花后通过KakaoTalk发给我们的话(译自韩语)。",
    items: [
      { tag: "见家长蝴蝶兰", text: "哇!太漂亮了。谢谢!" },
      { tag: "送到研修院", text: "收花的人也说很漂亮。谢谢。" },
      { tag: "企业活动用花", text: "哇,真的太漂亮了。配送也拜托了。" },
      { tag: "24小时无人取花", text: "父母一定会很喜欢!祝生意兴隆!" },
    ],
  },

  store: {
    title: "店铺信息",
    name: "新笋花店 全州革新都市店",
    addressLabel: "地址",
    landmark: "乐天Fresh全州革新店旁边",
    copyAddress: "复制地址",
    copied: "已复制",
    hoursLabel: "营业时间",
    hours: "24小时 · 全年无休(节假日也营业)",
    staffLabel: "店员在店",
    staff: `周一至周五 ${h12(open)}~${h12(close)}(视情况可能变动)`,
    buyLabel: "在店内",
    buy: "陈列的花可直接购买 · 预约的花24小时随时无人自取",
    payLabel: "付款",
    pay: "自助机可用银行卡·KakaoPay·转账·温暖商品券(可积分)",
    phoneLabel: "电话",
    basketNote: "花篮不常陈列,需要预约。",
    naverMap: "在NAVER地图查看",
    call: "打电话",
    kakao: "KakaoTalk咨询",
    instagram: "Instagram",
    blog: "NAVER博客",
    coupang: "Coupang Eats当日下单",
    coupangNote: "视店内库存",
  },

  delivery: {
    title: "免费配送标准",
    subtitle: "在申请表“取花方式”中选择配送即可。",
    otherArea: "完州及郊区请另行咨询。如有配送费,会发短信到预约人电话。",
  },

  faq: {
    title: "常见问题",
    items: [
      {
        q: "会和照片完全一样吗?",
        a: "照片仅供参考。根据季节和当天到货的花,搭配可能略有不同,但我们会按您选的价格和色调用心制作。",
      },
      {
        q: "需要提前多久预约?",
        a: `建议提前3天预约。当天预约需在取花时间${SAME_DAY_LEAD_HOURS}小时前完成。${h12(ORDER_CLOSE_HOUR)}以后,无法预约次日${h12(ORDER_OPEN_HOUR)}之前的时间。`,
      },
      {
        q: "怎么查询或取消预约?",
        a: "点击页面顶部[查询预约],输入预约人姓名和电话即可查询和取消。如需修改,请在取花前一天之前打电话或通过KakaoTalk告诉我们。",
      },
      {
        q: "可以配送吗?",
        a: "可以。在申请表“取花方式”中选择配送并填写地址。符合下方免费配送标准即免费。",
      },
      {
        q: "可以把蝴蝶兰送到见家长的餐厅吗?",
        a: "可以,免费配送到湖南阁·宫·古宫潭等全州见家长餐厅。列表中没有的餐厅也请写在申请表里。",
      },
      {
        q: "可以一起送巧克力吗?",
        a: "可以。在选花下方的“加购巧克力”里一起选择。",
      },
      {
        q: "可以从海外付款吗?",
        a: `可以使用PayPal付款,另加${Math.round(PAYPAL_FEE_RATE * 100)}%手续费。`,
      },
      {
        q: "不预约可以直接买吗?",
        a: "可以在24小时无人店随时购买陈列的花。当日配送也可以通过Coupang Eats下单(视店内库存)。",
      },
    ],
  },

  bottomCta: {
    title: "找到喜欢的花了吗?",
    button: "去选花",
  },
};
