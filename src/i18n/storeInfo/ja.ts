import {
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  PAYPAL_FEE_RATE,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { storeContact } from "@/data/shop";
import type { StoreInfoMessages } from "./ko";

/** 日本語 — 모양은 storeInfo/ko.ts와 같아야 한다 */
const { open, close } = storeContact.staffedHours;
const h12 = (hour: number) => (hour > 12 ? `午後${hour - 12}時` : `午前${hour}時`);

export const storeInfoJa: StoreInfoMessages = {
  hero: {
    eyebrow: "大切な日の花を、気持ちまできちんと届けます",
    badges: ["24時間無人花屋・年中無休", "経験12年のフローリスト", "全州・完州へお届け"],
    book: "花を予約する",
    location: "店舗の場所",
  },

  quick: {
    ariaLabel: "店舗の場所",
    landmark: "ロッテフレッシュ全州革新店の隣",
    hours: "24時間・年中無休",
    call: "電話",
    map: "地図",
    kakao: "カカオトーク",
  },

  steps: {
    title: "予約はかんたん3ステップ",
    subtitle: "会員登録は不要です。お支払い方法は申し込み後にご案内します。",
    items: {
      items: "花を選ぶ",
      dateTime: "日付・時間",
      reserve: "お名前・連絡先",
    },
  },

  reviews: {
    title: "お客様の声",
    subtitle: "お花を受け取ったお客様からカカオトークでいただいた言葉です(韓国語から翻訳)。",
    items: [
      { tag: "顔合わせの胡蝶蘭", text: "わあ!とてもきれいです。ありがとうございます!" },
      { tag: "研修院へのお届け", text: "受け取った方もきれいだと言っていました。ありがとうございます。" },
      { tag: "企業イベントの花", text: "わあ、本当にきれいです。配送もよろしくお願いします。" },
      { tag: "24時間無人受け取り", text: "両親がとても喜びそうです!お店のご繁盛をお祈りします。" },
    ],
  },

  store: {
    title: "店舗のご案内",
    name: "セスン花屋 全州革新都市店",
    addressLabel: "住所",
    landmark: "ロッテフレッシュ全州革新店の隣",
    copyAddress: "住所をコピー",
    copied: "コピーしました",
    hoursLabel: "営業時間",
    hours: "24時間・年中無休(祝日・連休も営業)",
    staffLabel: "スタッフ在店",
    staff: `月〜金 ${h12(open)}〜${h12(close)}(状況により変わることがあります)`,
    buyLabel: "店頭で",
    buy: "陳列中の花はその場で購入・予約した花は24時間いつでも無人受け取り",
    payLabel: "お支払い",
    pay: "キオスクでカード・カカオペイ・振込・オンヌリ商品券(ポイント付与)",
    phoneLabel: "電話",
    basketNote: "フラワーバスケットは常に陳列していないため、ご予約が必要です。",
    naverMap: "NAVER地図で見る",
    call: "電話する",
    kakao: "カカオトークで相談",
    instagram: "Instagram",
    blog: "NAVERブログ",
    coupang: "クーパンイーツで当日注文",
    coupangNote: "店舗在庫による",
  },

  delivery: {
    title: "無料配送の基準",
    subtitle: "申込書の「受け取り方法」で配送を選んでください。",
    otherArea: "完州・郊外はご相談ください。配送料がかかる場合は予約者の連絡先にメッセージでお知らせします。",
  },

  faq: {
    title: "よくある質問",
    items: [
      {
        q: "写真と同じに作ってもらえますか?",
        a: "写真は参考用です。季節やその日の入荷状況で構成が少し変わることがありますが、選んだ金額・色合いに合わせて心を込めてお作りします。",
      },
      {
        q: "いつまでに予約すればいいですか?",
        a: `3日前までのご予約をおすすめします。当日予約は受け取り時間の${SAME_DAY_LEAD_HOURS}時間前まで可能です。${h12(ORDER_CLOSE_HOUR)}を過ぎると翌日${h12(ORDER_OPEN_HOUR)}までの時間は予約できません。`,
      },
      {
        q: "予約の確認・キャンセルはどうすればいいですか?",
        a: "画面上の[予約確認]で予約者のお名前と連絡先を入れると確認・キャンセルできます。変更は受け取り日の前日までにお電話かカカオトークでお知らせください。",
      },
      {
        q: "配送はできますか?",
        a: "はい。申込書の「受け取り方法」で配送を選び、配送先を入力してください。下の無料配送の基準を満たせば無料です。",
      },
      {
        q: "顔合わせのレストランに胡蝶蘭を届けてもらえますか?",
        a: "はい、ホナムガク・グン・ゴグンダムなど全州の顔合わせレストランへ無料でお届けします。一覧にないレストランも申込書にご記入ください。",
      },
      {
        q: "チョコレートも一緒に送れますか?",
        a: "はい。花を選んだすぐ下の「チョコレートを追加」で一緒に選べます。",
      },
      {
        q: "海外から支払えますか?",
        a: `PayPalでお支払いいただけます。決済手数料${Math.round(PAYPAL_FEE_RATE * 100)}%が加算されます。`,
      },
      {
        q: "予約なしで買えますか?",
        a: "24時間無人店舗で陳列中の花をいつでも購入できます。当日配達はクーパンイーツ(店舗在庫による)でも注文できます。",
      },
    ],
  },

  bottomCta: {
    title: "気に入った花は見つかりましたか?",
    button: "花を選びに行く",
  },
};
