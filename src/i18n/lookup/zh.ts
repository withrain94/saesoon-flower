import { businessInfo } from "@/data/shop";
import type { LookupMessages } from "./ko";

/** 中文(简体) — 모양은 lookup/ko.ts와 같아야 한다 */
export const lookupZh: LookupMessages = {
  pageTitle: "查询预约",
  intro: "输入预约时填写的预约人姓名和电话号码，即可查看预约内容。",
  receiptLabel: "受理编号",
  nameLabel: "预约人姓名",
  namePlaceholder: "预约时填写的姓名",
  phoneLabel: "预约人电话",
  phonePlaceholder: "预约时填写的电话号码",
  submit: "查询",
  searching: "查询中…",
  backToReservation: "‹ 返回预约页面",
  lookupLink: "查询·取消预约",
  completeLookup: "打开预约查询·取消页面",
  completeLookupNote: "随时可以用姓名和电话号码再次查询。",
  otherReservation: "查询其他预约",
  resultsTitle: (count) => `找到 ${count} 个预约`,
  resultsHint: "请点击要查看或取消的预约。",
  backToList: "‹ 返回预约列表",

  errors: {
    notFound: "没有找到姓名和电话号码一致的预约，请按预约时填写的内容输入。",
    unavailable: `目前无法在线查询，请致电（+82 ${businessInfo.phone.slice(1)}）咨询。`,
    notCancelable: `当前状态无法在线取消，请致电（+82 ${businessInfo.phone.slice(1)}）咨询。`,
    invalidRefund: "请准确填写退款银行名称、账号和户名。",
    failed: `处理失败。请稍后再试，或致电（+82 ${businessInfo.phone.slice(1)}）咨询。`,
  },

  status: {
    received: "已受理 · 尚未确认付款",
    confirmed: "已确认付款",
    made: "已制作完成",
    delivered: "已交付",
    canceled: "已取消",
  },
  cancelRequested: "已收到取消申请 · 店铺确认中",

  sections: {
    schedule: "取花日期·时间",
    items: "商品",
    total: (quantity) => `共 ${quantity} 件`,
    deliveries: "收花人·留言",
    payment: "付款",
  },

  cancel: {
    title: "取消预约",
    open: "取消预约",
    close: "不取消",
    /** 결제 방법별로 묻기 (입금 전 예약) */
    paidQuestion: { bank: "您已经转账了吗？", card: "您已经刷卡付款了吗？", paypal: "您已经用 PayPal 付款了吗？" },
    notPaid: { bank: "还没有转账", card: "还没有刷卡付款", paypal: "还没有用 PayPal 付款" },
    paid: { bank: "已经转账了", card: "已经刷卡付款了", paypal: "已经用 PayPal 付款了" },
    notPaidHint: "预约会立即取消。",
    paidHint: "将作为取消申请受理，店铺确认后为您退款。",
    /** 입금·결제 확인된 예약 — 묻지 않고 안내만 */
    confirmedNote: { bank: "店铺已确认您的转账，将作为取消申请受理。", card: "店铺已确认您的刷卡付款，将作为取消申请受理。", paypal: "店铺已确认您的 PayPal 付款，将作为取消申请受理。" },
    refundTitle: "退款账户",
    refundBank: "银行名称",
    refundBankPlaceholder: "例：农协、国民银行",
    refundAccount: "账号",
    refundAccountPlaceholder: "仅数字或包含 -",
    refundHolder: "户名",
    refundHolderPlaceholder: "存折上的姓名",
    refundWarning: "如果与实际汇款人的姓名·账户不同，可能难以办理退款。",
    refundPrivacy: "为办理退款收集银行名称、账号和户名，并按照个人信息处理方针保管后销毁。",
    cardRefund: "刷卡付款将由店铺为您取消交易。",
    paypalRefund: "PayPal 付款将通过 PayPal 退款。",
    submitCancel: "取消预约",
    submitRequest: "提交取消申请",
    sending: "发送中…",
    canceledDone: "预约已取消。",
    requestedDone: "已提交取消申请。店铺确认后会为您退款。",
    requestedInfo: "已收到您的取消申请。店铺确认后会为您退款。",
    callInfo: "鲜花已开始制作，无法在线取消。请致电咨询。",
    call: `致电 +82 ${businessInfo.phone.slice(1)}`,
  },
};
