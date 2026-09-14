import { businessInfo } from "@/data/shop";
import type { LookupMessages } from "./ko";

/** 日本語 — 모양은 lookup/ko.ts와 같아야 한다 */
export const lookupJa: LookupMessages = {
  pageTitle: "予約の確認",
  intro: "申込完了画面の受付番号と、予約者の電話番号を入力すると予約内容を確認できます。",
  receiptLabel: "受付番号",
  receiptPlaceholder: "例: 5D7BBC7E",
  phoneLabel: "予約者の電話番号",
  phonePlaceholder: "申込時に入力した電話番号",
  submit: "確認する",
  searching: "検索中…",
  backToReservation: "‹ 予約ページへ",
  lookupLink: "予約の確認・キャンセル",
  completeLookup: "予約の確認・キャンセル画面を開く",
  completeLookupNote: "受付番号と電話番号でいつでも確認できます。",
  otherReservation: "別の予約を確認",

  errors: {
    notFound: "受付番号と電話番号が一致する予約が見つかりませんでした。もう一度ご確認ください。",
    unavailable: `現在オンラインで確認できません。お電話（+82 ${businessInfo.phone.slice(1)}）でお問い合わせください。`,
    notCancelable: `現在の状態ではオンラインでキャンセルできません。お電話（+82 ${businessInfo.phone.slice(1)}）でお問い合わせください。`,
    invalidRefund: "返金先の銀行名・口座番号・口座名義をすべて正しく入力してください。",
    failed: `処理できませんでした。しばらくしてから再度お試しいただくか、お電話（+82 ${businessInfo.phone.slice(1)}）でお問い合わせください。`,
  },

  status: {
    received: "受付済み・入金(決済)確認前",
    confirmed: "入金・決済確認済み",
    made: "制作完了",
    delivered: "お渡し完了",
    canceled: "キャンセル済み",
  },
  cancelRequested: "キャンセル申請受付・店舗で確認中",

  sections: {
    schedule: "受け取り日時",
    items: "商品",
    total: (quantity) => `合計 ${quantity}点`,
    deliveries: "受取人・メッセージ",
    payment: "お支払い",
  },

  cancel: {
    title: "予約のキャンセル",
    open: "予約をキャンセルする",
    close: "キャンセルしない",
    /** 결제 방법별로 묻기 (입금 전 예약) */
    paidQuestion: { bank: "お振込みはお済みですか？", card: "カード決済はお済みですか？", paypal: "PayPal決済はお済みですか？" },
    notPaid: { bank: "まだ振込していません", card: "まだカード決済していません", paypal: "まだPayPal決済していません" },
    paid: { bank: "すでに振込しました", card: "すでにカード決済しました", paypal: "すでにPayPal決済しました" },
    notPaidHint: "すぐにキャンセルされます。",
    paidHint: "キャンセル申請として受け付け、店舗で確認後に返金いたします。",
    /** 입금·결제 확인된 예약 — 묻지 않고 안내만 */
    confirmedNote: { bank: "店舗で入金確認が済んだ予約のため、キャンセル申請として受け付けます。", card: "店舗でカード決済の確認が済んだ予約のため、キャンセル申請として受け付けます。", paypal: "店舗でPayPal決済の確認が済んだ予約のため、キャンセル申請として受け付けます。" },
    refundTitle: "返金先の口座",
    refundBank: "銀行名",
    refundBankPlaceholder: "例: 農協、国民銀行",
    refundAccount: "口座番号",
    refundAccountPlaceholder: "数字のみ、または - を含む",
    refundHolder: "口座名義",
    refundHolderPlaceholder: "通帳に記載のお名前",
    refundWarning: "実際に入金された方のお名前・口座と異なる場合、返金手続きが難しいことがあります。",
    refundPrivacy: "返金のために銀行名・口座番号・口座名義をお預かりし、個人情報処理方針に従って保管後に破棄します。",
    cardRefund: "カード決済は店舗で決済を取り消します。",
    paypalRefund: "PayPal決済はPayPalで返金します。",
    submitCancel: "予約をキャンセルする",
    submitRequest: "キャンセルを申請する",
    sending: "送信中…",
    canceledDone: "予約をキャンセルしました。",
    requestedDone: "キャンセル申請を送りました。店舗で確認後、返金いたします。",
    requestedInfo: "キャンセル申請を受け付けました。店舗で確認後、返金いたします。",
    callInfo: "お花の制作が始まっているため、オンラインではキャンセルできません。お電話でお問い合わせください。",
    call: `電話する +82 ${businessInfo.phone.slice(1)}`,
  },
};
