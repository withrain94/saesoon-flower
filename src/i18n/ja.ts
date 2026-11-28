import {
  BLACKBOARD_MAX_LENGTH,
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  RIBBON_MAX_LENGTH,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import type { Messages } from "./ko";

/** 日本語 — 모양은 ko.ts와 같아야 한다 */

const hour12 = (hour: number) => (hour > 12 ? hour - 12 : hour);
const period = (hour: number) => (hour < 12 ? "午前" : "午後");
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

export const ja: Messages = {
  htmlLang: "ja",

  format: {
    price: (price) => `${price.toLocaleString("ja-JP")}ウォン`,
    priceShort: (price) => `${price / 10000}万ウォン`,
    weekdays,
    dateShort: (month, day, weekday) => `${month}/${day}(${weekdays[weekday]})`,
    dateLong: (month, day, weekday) => `${month}月${day}日(${weekdays[weekday]})`,
    time: (hour) => `${period(hour)}${hour12(hour)}:00`,
    slotShort: (hour) => `${hour12(hour)}:00`,
    morning: "午前",
    afternoon: "午後",
    deadline: (dateLong, hour, minute) =>
      `${dateLong} ${period(hour)}${hour % 12 === 0 ? 12 : hour % 12}時${minute ? `${minute}分` : ""}`,
    itemName: (categoryName, priceLabel) => `${categoryName} ${priceLabel}`,
    unitName: (itemName, unitNo, quantity) => `${itemName} (${unitNo}/${quantity})`,
    listSeparator: "・",
  },

  common: {
    optional: "任意",
    close: "閉じる",
  },

  shop: {
    name: "セスン 全州革新都市店",
    tagline: "予約・オーダーメイド・無人受け取りもできる24時間無人の花屋。",
  },

  header: {
    siteLink: "紹介 ›",
    lookupLink: "予約確認",
    language: "言語",
  },

  hero: {
    title: (categoryNames) => `${categoryNames}の予約`,
    imageAlt: "セスンの花束",
  },

  categories: {
    bouquet: { name: "花束", tagline: "手渡しで贈るギフト" },
    basket: { name: "フラワーバスケット", tagline: "飾って長く楽しむギフト" },
    orchid: {
      name: "胡蝶蘭",
      tagline: "両家顔合わせのポジャギ包みギフト",
      popularNote: "2鉢1セット・両家にひとつずつご用意します",
      notice: {
        summary: [
          "品種はお選びいただけません。シーズンごとに入荷する品種が異なります。",
          "色は白でご用意します。",
          "ポジャギ（韓国の風呂敷）の色は、ポジャギアート1級の専門家が蘭に合わせて選び、手作業で包みます。",
        ],
        full: [
          "!品種のご指定はできませんので、ご了承ください!",
          "胡蝶蘭は\nシーズンごとに入荷する品種が異なり、",
          "同じ色でも\n葉の付き方、つぼみの数、色味が少しずつ違います。",
          "だからこそ私たちは\n工業製品のように同じ花ではなく\nおふたりだけの特別な胡蝶蘭を\nお届けすることを大切にしています。",
          "ただし! 色は白に指定できます。",
          "花嫁のように清らかで端正な印象の\n白い胡蝶蘭をご希望いただければ\nそれにふさわしい最高品質の蘭を\n心を込めてご用意します。",
          "セスンでは\nフローリストであり\nポジャギアート1級資格を持つ専門家が\n自らお花を包みます。",
          "ポジャギの色は\n- 白い胡蝶蘭の色味\n- 花茎の長さ\n- 葉の広がり\nなどを考慮し、\n毎回いちばん似合う\n感性あふれる色でご用意します。",
        ],
      },
    },
    doll: {
      name: "チョコ花束&ぬいぐるみ花束",
      tagline: "ちいかわのぬいぐるみ花束と、チョコたっぷりの花束パッケージ",
      popularNote: "ちいかわぬいぐるみ花束 · ハッピーヒポ・フェレロロシェのチョコ花束 · ぬいぐるみだけの追加もOK",
      notice: {
        summary: [
          "色合いを「おまかせ」にすると、キャラクターのおすすめカラー・写真の色で包みます。",
          "お花は季節や入荷状況により写真と少し異なる場合があります。",
          "ぬいぐるみやチョコを追加したい場合は、下の「チョコ・ぬいぐるみを追加」からどうぞ。",
        ],
        full: [
          "ちいかわ花束 — キャラクター別おすすめカラー",
          "ちいかわ — ピンク",
          "ハチワレ — 淡いピンクの花 + ブルーのラッピング",
          "うさぎ — イエロー",
          "チョコ花束 — 8万ウォンの花束に、商品名の数だけチョコを挿します。(シルバピンクはシルバピンクのバラ50本 + フェレロロシェ10個)",
          "ほかの色をご希望の場合は、申込書の「ご希望の色合い」で選ぶか「その他」にご記入ください。",
        ],
      },
    },
    xmastree: {
      name: "クリスマス植物ツリー",
      tagline: "12/28まで · 年末の植物ギフト",
      popularNote: "アラウカリア ミニツリー · ゴールドサイプレス ポーチ · ポインセチア",
      notice: {
        summary: [
          "12月28日までのお受け取りのみご予約いただけます。（12月29日からこのメニューはなくなります）",
          "生きた植物のため、形・大きさ・葉の色が写真と少し異なる場合があります。",
        ],
        full: [
          "小さなツリーひとつから始めるクリスマス！",
          "この冬、セスン花屋が特別なクリスマスの植物ギフトをご用意しました。",
          "真っ赤なクリスマス飾りと愛らしいミニツリー、サンタベルトのリボンを巻いた植物ポーチまで！",
          "小さな空間もクリスマスの雰囲気でいっぱいになるよう、植物の形から鉢、飾りまでひとつひとつ丁寧に準備しました。",
        ],
      },
    },
  },

  products: {
    "bouquet-50000": {
      title: "[気軽に] 小さくても可愛いお花で",
      points: [
        "小さくても大丈夫。きれいなメインのお花を中心にしてほしいです。",
        "負担にならないサイズで贈りたいです。",
        "気軽に持ち運びたいです。",
      ],
    },
    "bouquet-60000": {
      title: "TOP2) 花束らしい花束",
      points: [
        "大きすぎなくていいので、もらって嬉しくなる花束を贈りたいです。",
        "記念日をきれいに思い出に残したいです。",
        "一番無難なサイズでお願いします。",
      ],
    },
    "bouquet-70000": {
      title: "TOP5) サイズよりクオリティ",
      points: [
        "基本のサイズに、きれいなお花を追加してください。",
        "サイズよりクオリティが大事です。",
        "小さすぎないと嬉しいです。",
      ],
    },
    "bouquet-80000": {
      title: "BEST) もう少しボリュームを",
      points: [
        "ボリューム感のある雰囲気にしたいです。",
        "受け取ったときに嬉しい気持ちになってほしいです。",
        "いつもより気持ちを込めたいです。",
      ],
    },
    "bouquet-90000": {
      title: "[記念日] きれいでボリュームたっぷり",
      points: [
        "きれいなお花でボリュームたっぷりにしたいです。",
        "メインのお花をもっと増やしたいです。",
        "両手いっぱいのお花を贈りたいです。",
      ],
    },
    "bouquet-100000": {
      title: "TOP3) 大切な日です",
      points: [
        "記念日に感動を届けたいです。",
        "プロポーズに使う予定です。",
        "サイズよりクオリティを大切にしてください。",
      ],
    },
    "bouquet-150000": {
      title: "TOP4) 大きな花束",
      points: [
        "思わず声が出るようなサイズがいいです。",
        "きれいなお花を使いつつ、もっとボリューム感がほしいです。",
        "一度はやってみたいです。",
      ],
    },
    "bouquet-200000": {
      title: "[イベント用] 特大花束",
      points: ["とにかく大きくしてください。", "特大の花束にしたいです。"],
    },
    "bouquet-300000": {
      title: "[プレミアム] ひと抱えのスペシャル花束",
      points: [
        "花の中でも最高と言われるウェディングフラワーで作るスペシャル花束！（季節のお花を使います）",
        "当日の状況によっては制作が難しい場合があるため、事前のご予約をおすすめします。",
        "とにかく大きく、スペシャルな花束にしたいです。",
        "プロポーズをする予定です。",
      ],
    },
    "basket-70000": {
      title: "[日常ギフト] ベーシックフラワーバスケット",
      points: ["気軽にかわいく贈れるサイズ", "新居祝い、ちょっとした贈り物、お祝いにぴったり"],
    },
    "basket-80000": {
      title: "TOP3) ベーシックバスケットをボリュームアップ",
      points: ["ベーシックバスケットをボリュームたっぷりに、または特別な色合いで"],
    },
    "basket-100000": {
      title: "BEST) イベント向けフラワーバスケット",
      points: [
        "記念日のギフトやイベントで人気のサイズ",
        "誕生日・恋人・ご両親へのギフトで一番人気のサイズ",
        "受け取った方が写真を撮りやすいバランス",
      ],
    },
    "basket-150000": {
      title: "TOP2) イベント向けバスケットをボリュームアップ",
      points: [
        "イベント向けバスケットをボリュームたっぷりに、または特別な色合いで",
        "イベント・展示・お祝いに最適なボリューム",
      ],
    },
    "basket-200000": {
      title: "[式典用] 大型フラワーバスケット",
      points: ["会場・展示会・オープン式で存在感のあるサイズ", "遠くからでも目を引くスタイル"],
    },
    "basket-300000": {
      title: "[プレミアム] 大型バスケットをボリュームアップ",
      points: [
        "バスケット自体が大きい大型バスケットをたっぷりと",
        "大型よりお花の量がはっきり多いです",
        "写真・イベント向けの圧倒的なサイズ",
      ],
    },
    "orchid-120000": {
      title: "両家顔合わせ ポジャギ胡蝶蘭（2鉢1セット）",
      points: [
        "清楚な白い胡蝶蘭＋新郎新婦を象徴するピンク・ブルーなどのポジャギの色をデザイナーが選定",
        "両家にひとつずつお渡しできるよう2鉢1セットでご用意します",
        "ホナムガク・クン・コグンダムなど全州の顔合わせ会場へ無料配送",
        "贈った後もラッピングを保ったまま管理できる二重包装",
      ],
    },
    "doll-chiikawa": {
      title: "[ピンク] ちいかわのピンクの告白",
      name: "ちいかわ花束",
      points: [
        "見るだけで心がほっこりする、ちいかわのぬいぐるみがお花の間にちょこんと入ります。",
        "おすすめラッピング：ピンク — 恥ずかしがり屋のちいかわにぴったり。",
        "お花が枯れてもぬいぐるみは残るので、贈り物の思い出が長く続きます。",
      ],
    },
    "doll-hachiware": {
      title: "[淡ピンク・ブルー] ハチワレの空色エール",
      name: "ハチワレ花束",
      points: [
        "いつも前向きでやさしいハチワレが応援の気持ちを届けます。",
        "おすすめ：淡いピンクの花にブルーのラッピング — ハチワレの耳の色とぴったり。",
        "誕生日・合格・応援のプレゼントに。",
      ],
    },
    "doll-usagi": {
      title: "[イエロー] うさぎの黄色い「ウラ！」",
      name: "うさぎ花束",
      points: [
        "自由で楽しいうさぎが、受け取った瞬間に笑顔にします。",
        "おすすめラッピング：イエロー — 明るく元気な雰囲気で。",
        "卒業・お祝い・気分転換のプレゼントに。",
      ],
    },
    "doll-trio": {
      title: "[3人組] ちいかわ3人そろい踏み花束",
      name: "ちいかわ3人組花束",
      points: [
        "ちいかわ・ハチワレ・うさぎの3人がひとつの花束に大集合。",
        "ファンなら思わず声が出るビジュアル — 写真映えする花束です。",
        "誕生日や記念日に、推したちをまとめて贈りましょう。",
      ],
    },
    "doll-hachiware-snack": {
      title: "[ブルー] ハチワレ、おやつも持った？",
      name: "ハチワレおやつ花束",
      points: [
        "ハチワレと、ハッピーヒッポ・フェレロロシェのチョコをお花の間に一緒に挿してお届けします。",
        "おすすめ：ブルーのラッピングに淡ピンク・水色のお花 — ハチワレの色にぴったり。",
        "お花もおやつも一度に — 誕生日・応援・感謝の気持ちに。",
      ],
    },
    "doll-trio-celebrate": {
      title: "[クリーム・イエロー] お祝いに3人そろって来たよ！",
      name: "ちいかわ3人組お祝い花束",
      points: [
        "ちいかわ・ハチワレ・うさぎの3人が、イエローとクリーム色のお花の中で一緒にお祝いします。",
        "おすすめ：クリームのラッピングにイエロー・ホワイトのお花 — 明るく温かい雰囲気。",
        "卒業・誕生日・合格など、盛大にお祝いしたい日に。",
      ],
    },
    "doll-choco-hippo15": {
      title: "[ピンク] ハッピーヒポ15個、甘いピンクの花束",
      name: "ハッピーヒポ15個のチョコ花束",
      points: [
        "8万ウォンの花束にキンダー ハッピーヒポを15個挿しました。",
        "ピンクのラッピングで愛らしく甘い雰囲気です。",
        "誕生日・記念日・告白のプレゼントにおすすめ。",
      ],
    },
    "doll-choco-hippo20": {
      title: "[イエロー] ハッピーヒポ20個、陽だまりの花束",
      name: "ハッピーヒポ20個のチョコ花束",
      points: [
        "8万ウォンの花束にキンダー ハッピーヒポを20個たっぷり挿しました。",
        "イエロー・ピーチ系で明るく温かい雰囲気です。",
        "卒業・合格・応援のプレゼントにおすすめ。",
      ],
    },
    "doll-choco-ferrero10": {
      title: "[クリーム] フェレロロシェ10個、やわらかな金色の花束",
      name: "フェレロロシェ10個のチョコ花束",
      points: [
        "8万ウォンの花束にフェレロロシェを10個挿しました。",
        "クリームのラッピングに黄色・白の花で上品な仕上がり。",
        "初めてのチョコ花束のプレゼントにも気軽に。",
      ],
    },
    "doll-choco-ferrero15": {
      title: "[イエロー] フェレロロシェ15個、きらめく金色の花束",
      name: "フェレロロシェ15個のチョコ花束",
      points: [
        "8万ウォンの花束にフェレロロシェを15個挿し、金色がきらめきます。",
        "黄色の花と合わせて華やかでボリュームたっぷり。",
        "卒業・昇進・お祝いのプレゼントにおすすめ。",
      ],
    },
    "doll-choco-ferrero20": {
      title: "[ボリューム] フェレロロシェ20個、黄金色いっぱいの花束",
      name: "フェレロロシェ20個のチョコ花束",
      points: [
        "8万ウォンの花束にフェレロロシェを20個ぎっしり挿しました。",
        "受け取った瞬間に目を引くボリュームです。",
        "特別なお祝い・イベントのプレゼントにおすすめ。",
      ],
    },
    "doll-choco-silvapink": {
      title: "[プレミアム] シルバピンク50本 + フェレロロシェ10個",
      name: "シルバピンク50本とフェレロロシェの花束",
      points: [
        "ふんわりしたピンクのバラ、シルバピンク50本にフェレロロシェ10個を添えました。",
        "腕いっぱいのピンクで、いつまでも記憶に残る花束です。",
        "プロポーズ・記念日など特別な日に。",
      ],
    },
    "xmastree-araucaria": {
      title: "アラウカリア ミニツリー",
      name: "アラウカリア ミニツリー",
      points: [
        "段々に広がる緑の枝にクリスマス飾りを添えました。",
        "赤いストライプの白い鉢でクラシックなクリスマスの雰囲気に。",
      ],
    },
    "xmastree-cypress": {
      title: "ゴールドサイプレス ポーチ",
      name: "ゴールドサイプレス ポーチ",
      points: [
        "みずみずしい黄緑の葉とほのかなレモンの香り！",
        "サンタベルトのリボンでかわいく包んだクリスマスの植物ギフトです。",
      ],
    },
    "xmastree-poinsettia-mini": {
      title: "ポインセチア ミニ（10〜15cm）",
      name: "ポインセチア ミニ",
      points: [
        "クリスマスを代表する赤いポインセチアを、手のひらサイズのミニでご用意しました。",
        "グリーンの包装とメリークリスマスのピックで、気軽な贈り物にぴったりです。",
      ],
    },
    "xmastree-poinsettia-gift": {
      title: "ポインセチア ギフト用（15〜20cm）",
      name: "ポインセチア ギフト用",
      points: [
        "たっぷり広がる赤い葉が年末の雰囲気を満たしてくれます。",
        "グリーンの包装に赤いリボンとクリスマスピックを添えたギフトサイズです。",
      ],
    },
  },

  events: {
    institutePromotion: {
      calendarLabel: "昇進式",
      shortTitle: (term) => `第${term}期 昇進式`,
      title: (term) => `地方自治人材開発院 第${term}期 昇進式`,
      highlights: [
        "全国から完州に集まる式典で、遠方から来られる方が多く、フラワーバスケットが特に人気です。",
        "無料の昇進トッパーをお付けします。",
        "受け取り時間は午前8時です。",
      ],
      forEventYes: "はい、昇進式用です",
      forEventHint: "昇進式用のお花には、無料の昇進トッパーをお付けします。",
      topperTitle: "🎓 昇進トッパー（無料）",
      topperDescription:
        "トッパーに入れる贈り主（贈られる方ではありません）のお名前またはチーム名をご記入ください。空欄の場合はお店からご連絡します。",
    },
    instituteLongCourse: {
      calendarLabel: "修了式",
      shortTitle: () => "長期課程 修了式",
      title: () => "地方自治人材開発院 長期課程 修了式",
      highlights: [
        "無料の修了トッパーをお付けします。",
        "課程ごとにトッパーが異なるため、申込書に修了された課程を必ずご記入ください。",
        "受け取り時間は午前8時です。",
      ],
      forEventYes: "はい、修了式用です",
      forEventHint: "修了式用のお花には、無料の修了トッパーをお付けします。",
      topperTitle: "🎓 修了トッパー（無料）",
      topperDescription:
        "課程ごとにトッパーが異なるため修了課程を必ずご記入のうえ、トッパーに入れる贈り主（贈られる方ではありません）のお名前またはチーム名もご記入ください。",
    },
    pepero: {
      calendarLabel: "ペペロデー",
      shortTitle: () => "ペペロデー",
      title: () => "11月11日 ペペロデー",
      highlights: [
        "申込書でチョコレートを一緒にご注文いただけます。",
        "お花とチョコレートを一緒にラッピングしてお渡しします。",
        "人気の時間帯は早めに締め切る場合がありますので、お早めにご予約ください。",
      ],
    },
    christmasEve: {
      calendarLabel: "クリスマスイブ",
      shortTitle: () => "クリスマスイブ",
      title: () => "12月24日 クリスマスイブ",
      highlights: [
        "年末らしい雰囲気の花束・フラワーバスケットをご用意します。",
        "申込書でチョコレートを一緒にご注文いただけます。",
        "人気の時間帯は早めに締め切る場合がありますので、お早めにご予約ください。",
      ],
    },
    christmas: {
      calendarLabel: "クリスマス",
      shortTitle: () => "クリスマス",
      title: () => "12月25日 クリスマス",
      highlights: [
        "年末らしい雰囲気の花束・フラワーバスケットをご用意します。",
        "申込書でチョコレートを一緒にご注文いただけます。",
        "人気の時間帯は早めに締め切る場合がありますので、お早めにご予約ください。",
      ],
    },
  },

  eventBanner: {
    ariaLabel: "特別な日の予約案内",
    book: (categoryName) => `${categoryName}を予約`,
    later: "今後の予定",
    bookShort: "予約する",
    deadline: (deadline) => `${deadline}までにご予約ください。`,
  },

  categoryEntry: {
    ariaLabel: "予約する商品の種類",
    title: "何を予約しますか？",
    subtitle: "いくつかまとめて、一度に予約することもできます。",
    photoAlt: (name) => `${name}の例の写真`,
    count: (count) => `${count}点追加`,
    startingFrom: (price) => `${price}〜`,
  },

  naverOnly: {
    plant: { title: "開業・昇進・お祝いの鉢植えを予約", description: "NAVER予約のみで受け付けています" },
  },

  naverBanner: {
    ariaLabel: "NAVER予約",
    title: "NAVER Payでお支払いですか？",
    description: "申込書なしでNAVER予約から直接予約できます。",
    linkAria: (name) => `${name}のNAVER予約`,
  },

  sectionTabs: {
    items: "お花を選ぶ",
    dateTime: "日時",
    reserve: "申し込む",
  },

  productSection: {
    heading: "予約する商品をお選びください",
    subtitle: (categoryNames) => `${categoryNames}をまとめて一度に予約できます。`,
    error: "商品を1点以上追加してください。",
    tabsAria: "商品の種類",
    listAria: (name) => `${name}の一覧`,
    sortPrice: "価格順",
    sortRank: "人気順",
    popular: (labels) => `人気の価格: ${labels} の順`,
    photoNote: "* 写真と全く同じには制作できません。色合いとサイズの参考としてご覧ください。",
    moreSite: (name) => `📷 ${name}の写真・説明をもっと見る`,
    moreSiteSub: "セスン紹介サイトで実際の制作例をご覧いただけます",
    nextCategory: (name) => `${name}も見る`,
  },

  notice: {
    title: "必ずご確認ください！",
    showFull: "案内をすべて見る",
    hideFull: "案内を閉じる",
  },

  productOption: {
    photoToggle: (name, open) => `${name}の写真を${open ? "閉じる" : "もっと見る"}`,
    coverAlt: (name) => `${name}の代表写真`,
    photoCount: (count) => `写真 ${count}`,
    photoAlt: (name, index) => `${name}の実際の制作写真 ${index}`,
    morePhotos: "写真をもっと見る",
    morePhotosSub: "セスン紹介サイトへ",
    quantity: (name) => `${name}の数量`,
    decrease: (name) => `${name}を減らす`,
    increase: (name) => `${name}を増やす`,
  },

  dateTime: {
    headingDate: "日付",
    headingTime: "時間をお選びください",
    sameDayRule: `当日のご予約は、受け取り時間の${SAME_DAY_LEAD_HOURS}時間前まで可能です。`,
    closeRule: `午後${ORDER_CLOSE_HOUR - 12}時を過ぎると、翌日午前${ORDER_OPEN_HOUR}時までの時間は予約できません（土・日は正午12時まで）。`,
    errorDate: "受け取り日をお選びください。",
    errorTime: "受け取り時間をお選びください。",
    eventQuick: "特別な日をすぐ選ぶ",
    pickDateFirst: "先に日付を選ぶと時間を選べます。",
    eventSlots: (shortTitle) => `${shortTitle}の時間`,
    prevMonth: "前の月",
    nextMonth: "次の月",
    today: "今日",
    dayAria: (month, day, label, isToday) =>
      `${month}月${day}日${label ? ` ${label}` : ""}${isToday ? " 今日" : ""}`,
  },

  reserve: {
    heading: "予約情報をご入力ください",
    ordererName: "予約者のお名前",
    ordererNamePlaceholder: "お名前をご入力ください",
    ordererPhone: "予約者の電話番号",
    phonePlaceholder: "010-0000-0000 または +81 00 0000 0000",
    phoneTitle: "電話番号をご確認ください。（例: 010-1234-5678 / +81 90 1234 5678）",
  },

  chocolate: {
    title: "チョコ・ぬいぐるみを追加",
    description: "お花と一緒に贈る甘さとかわいさ — ご希望の数だけお選びください。",
    /** 초콜릿 칸 안 인형 단품 묶음 제목 (2026-11-17) */
    dollHeading: "ちいかわぬいぐるみ",
    /** "함께?" 창에서 인형 아래 초콜릿 묶음 제목 */
    chocolateHeading: "チョコレート",
    photoAlt: (name) => `${name}の写真`,
    prompt: {
      title: "チョコやぬいぐるみも一緒にいかがですか？",
      description: "チョコは1,500ウォンから、ちいかわぬいぐるみは8,000ウォンです。お花と一緒にラッピングしてお渡しします。",
      submitWithout: "このまま予約する",
      submitWith: (count) => `${count}個追加して予約`,
      close: "閉じる",
    },
    items: {
      "happyhippo-1": { name: "ハッピーヒポ 1個", note: "人気のキンダー ハッピーヒポです。" },
      "ferrero-1": { name: "フェレロロシェ 1個", note: "花束に挿せるスティック包装です。" },
      "kinderjoy-1": { name: "キンダージョイ 1個", note: "おもちゃ入りで、お子さまへの贈り物にも。" },
      "happyhippo-10": { name: "ハッピーヒポ 10個", note: "記念日におすすめ — 10個を一緒にお付けします。" },
      "ferrero-10": { name: "フェレロロシェ 10個", note: "記念日におすすめ — 10個を一緒にお付けします。" },
      shoppingbag: { name: "花束用ショッピングバッグ", note: "持ち運びや一時置きに便利です。" },
      "doll-chiikawa": { name: "ちいかわぬいぐるみ", note: "どの花束にもお花と一緒に挿してお届けします。" },
      "doll-hachiware": { name: "ハチワレぬいぐるみ", note: "どの花束にもお花と一緒に挿してお届けします。" },
      "doll-usagi": { name: "うさぎぬいぐるみ", note: "どの花束にもお花と一緒に挿してお届けします。" },
      "dollset-chiikawa": { name: "ちいかわぬいぐるみ + 編みハート2個", note: "赤い編み花のハート2個とぬいぐるみを一緒に挿します。" },
      "dollset-hachiware": { name: "ハチワレぬいぐるみ + 編みハート2個", note: "赤い編み花のハート2個とぬいぐるみを一緒に挿します。" },
      "dollset-usagi": { name: "うさぎぬいぐるみ + 編みハート2個", note: "赤い編み花のハート2個とぬいぐるみを一緒に挿します。" },
    },
    bag: {
      badge: "一緒に追加",
      points: [
        "花束がすっぽり入る透明バッグです",
        "持ち運び・保管に便利 — お花がつぶれません",
        "立てて置けるので、車内やレストランでも安心です",
      ],
    },
  },

  summary: {
    items: "追加した商品",
    itemsEmpty: "予約する商品を追加してください",
    schedule: "日時",
    scheduleEmpty: "日付と時間をお選びください",
    total: (count) => `合計${count}点`,
  },

  color: {
    label: "ご希望の色合い",
    options: {
      auto: "おまかせ",
      bright: "華やかに",
      anniversary: "記念日らしく",
      pink: "ピンク系",
      warm: "暖色系",
      soft: "やわらかな色合い",
      other: "その他",
    },
    otherAria: "ご希望の色合いを入力",
    otherPlaceholder: "ご希望の色合いをご記入ください",
  },

  receive: {
    title: "受け取り方法",
    methods: {
      pickup: { label: "店舗で受け取り", description: "セスン 全州革新都市店" },
      delivery: { label: "配送", description: "ご希望の場所へお届けします" },
    },
    feeTitle: "配送先によっては配送料が別途かかる場合があります。",
    freeRules: {
      institute: (price) => `イソ面・全州革新都市・マンソン洞内の機関行事用、革新大方（혁신대방）：${price}以上で配送無料`,
      nearby: (price) => `イソ面・全州革新都市・マンソン洞：${price}以上で配送無料`,
      jeonju: (price) => `全州市内全域：${price}以上で配送無料`,
    },
    feeContact: "配送料がかかる場合は、ご入力いただいた予約者の電話番号へSMSでご案内します。",
    addressGuide: "花束・フラワーバスケットの配送先は、下の「受取人」欄にご記入ください。",
  },

  orchidDelivery: {
    title: "胡蝶蘭の受け取り方法",
    restaurantTitle: "胡蝶蘭の配送先のお店",
    restaurantFree: "全州市内の顔合わせのお店は無料配送",
    restaurant: "お店",
    restaurantOther: "その他（直接入力）",
    restaurantOtherPlaceholder: "お店の名前または配送先の住所",
    reservationName: "お店の予約名",
    reservationNameOptional: "お店の予約名（お店の場合のみ）",
    reservationNamePlaceholder: "お店を予約したお名前",
    timeNote: "お選びいただいた日時にお店へ届くようにお送りします。",
    describePickup: "店舗で受け取り",
    describeRestaurant: (restaurant, reservationName) => `${restaurant}へ配送${reservationName ? `・予約名 ${reservationName}` : ""}`,
  },

  restaurants: {
    호남각: "ホナムガク（호남각）",
    궁: "クン（궁）",
    고궁담: "コグンダム（고궁담）",
  },

  recipient: {
    title: "受取人・メッセージ",
    guide: "花束は印刷したメッセージカード、フラワーバスケットはリボン文字またはミニ黒板、胡蝶蘭はミニ黒板でお入れします。",
    empty: "商品を追加すると、受取人とメッセージを入力できます。",
    bulkAria: "受取人・メッセージをまとめて変更",
    allSame: "すべて同じ",
    allSameDescription: "受取人・メッセージを1回だけ入力",
    allSeparate: "すべて別々",
    allSeparateDescription: "商品ごとに入力",
    mixed: "一部を別々に入力中です。ボタンを押すとすべての商品にまとめて適用されます。",
    recipientTitle: "受取人",
    sameRecipient: "前の商品と同じ",
    sameAsOrderer: "予約者と同じ",
    ordererEmpty: "先に上の予約者のお名前・電話番号をご記入ください",
    deliveryRequired: "配送の場合は受取人のお名前・電話番号・配送先を必ずご記入ください。",
    nameAria: "受取人のお名前",
    namePlaceholder: "受取人のお名前（受け取る方が違う場合）",
    namePlaceholderDelivery: "受取人のお名前",
    phoneAria: "受取人の電話番号",
    phonePlaceholder: "受取人の電話番号 010-0000-0000",
    addressAria: "配送先の住所",
    addressPlaceholder: "配送先の住所（建物名・部屋番号まで）",
    messageTitle: "メッセージ",
    sameMessage: (categoryName) => `前の${categoryName}と同じメッセージ`,
    describeEmpty: "未入力（予約者が受け取り）",
  },

  topper: {
    forEventQuestion: (title) => `${title}用のお花ですか？`,
    forEventNo: "いいえ、通常のご予約です",
    senderAria: "トッパーに入れる贈り主のお名前またはチーム名",
    senderPlaceholder: "贈り主のお名前またはチーム名（例: 총무과 일동）",
    senderWarning: "⚠️ 贈られる方のお名前・役職ではありません！",
    describe: (sender, course = "") => `トッパー・${[course, sender].filter(Boolean).join("・") || "未入力（お店からご連絡）"}`,
    courseAria: "トッパーに入れる修了課程",
    coursePlaceholder: "修了課程（必須、例: 고위정책과정）",
  },

  message: {
    typeAria: "メッセージの方法",
    types: {
      none: "なし",
      memo: "印刷したメッセージカード",
      ribbon: `リボン文字（左右の文言、片側${RIBBON_MAX_LENGTH}文字程度）`,
      blackboard: `ミニ黒板（スペース含め${BLACKBOARD_MAX_LENGTH}文字以内）`,
    },
    memoAria: "メッセージカードの文言",
    memoPlaceholder: "メッセージカードに印刷する文言をご記入ください",
    ribbonLeftAria: "リボンの片側の文言",
    ribbonLeftPlaceholder: `片側の文言（${RIBBON_MAX_LENGTH}文字程度）`,
    ribbonRightAria: "リボンのもう片側の文言",
    ribbonRightPlaceholder: `もう片側の文言（${RIBBON_MAX_LENGTH}文字程度）`,
    presetsAria: "黒板の文言",
    custom: "直接入力",
    customAria: "黒板の文言を直接入力",
    customPlaceholder: `黒板に書く文言を自由にご記入ください（スペース含め${BLACKBOARD_MAX_LENGTH}文字以内）`,
    writtenInKorean: "韓国語でこう書きます:",
    describeNone: "なし",
    describeMemo: (text) => `メッセージカード・${text || "（文言未入力）"}`,
    describeRibbon: (left, right) => `リボン・${left || "-"} / ${right || "-"}`,
    describeBlackboard: (text) => `黒板・${text || "（文言未入力）"}`,
  },

  blackboardPresets: {
    auto: "おまかせで書いてください",
    love: "「愛情を込めて育ててくださりありがとうございました。信頼と思いやりで幸せな家庭を築きます。」",
    devotion: "「これまでの愛情と献身に感謝いたします。お互いを思いやり、仲良く暮らします。」",
    happiness: "「胡蝶蘭の花言葉のように、いつも愛と幸せにあふれる家庭を築きます。」",
  },

  payment: {
    legend: "お支払い方法",
    methods: {
      bank: {
        label: "銀行振込",
        description: "入金確認後に完了",
        complete: "ご入金の確認をもって予約完了となります。",
      },
      card: {
        label: "カード決済",
        description: "電話でカード番号を伝える",
        complete: "お店からご連絡した際に、カード番号と有効期限をお伝えください。決済をもって予約完了となります。",
      },
      paypal: {
        label: "PayPal",
        description: "海外決済・手数料10%",
        complete: "お店からPayPalの支払いリクエストをメールでお送りします。決済をもって予約完了となります。",
      },
    },
    cardGuide: [
      "予約を確認後、お店からご連絡します。",
      "お電話でカード番号と有効期限をお伝えいただければ決済いたします。",
      "カード番号はこの申込書に書かないでください。",
    ],
    cardPayerTitle: "カード決済される方の連絡先",
    cardPayerDescription: "予約者とカード決済される方の電話番号が違う場合は、下にご記入ください。",
    cardPayerOptions: { same: "予約者と同じです", other: "予約者と違います" },
    cardPayerAria: "カード決済される方のお名前・電話番号",
    cardPayerPlaceholder: "決済される方のお名前と電話番号（例: 김결제 010-1234-5678）",
    cashReceiptTitle: "現金領収証（韓国）",
    cashReceiptOptions: { none: "申請しない", income: "所得控除", expense: "支出証憑" },
    cashReceiptInputs: {
      income: { placeholder: "携帯番号 010-0000-0000", title: "携帯番号をご確認ください。（例: 010-1234-5678）" },
      expense: { placeholder: "事業者登録番号 000-00-00000", title: "事業者登録番号10桁をご確認ください。（例: 123-45-67890）" },
    },
    cashReceiptNumberAria: (label) => `${label}の番号`,
    naverNote: "NAVER Payでのお支払いは、NAVER予約から別途ご予約ください。",
    naverLink: "NAVER予約へ ›",
    overseasTitle: "海外からお支払いですか？",
    overseasBody: "PayPalでお支払いいただけます。商品・配送金額に手数料10%が加算されます。",
    paypalGuide: [
      "予約を確認後、お店から下記のメールアドレスにPayPalの支払いリクエストをお送りします。",
      "商品・配送金額にPayPal手数料10%が加算されます。",
    ],
    paypalProducts: "商品金額",
    paypalFee: (percent) => `手数料 ${percent}%`,
    paypalTotal: "PayPal決済金額",
    paypalEmail: "PayPal支払いリクエストを受け取るメールアドレス",
    paypalEmailPlaceholder: "name@example.com",
  },

  bankCard: {
    title: "振込口座",
    bank: "農協銀行（농협）",
    holderNote: (holder) => `${holder}・お振込後、振込名義をお知らせください`,
    copy: "口座をコピー",
    copied: "コピーしました ✓",
  },

  documents: {
    toggle: "見積書・取引明細書が必要です",
    description: "会社・機関の行事などで証憑が必要な場合はチェックしてください。お申し込み後、完了画面ですぐにPDFファイルをダウンロードできます。",
    groupAria: "必要な書類",
    options: { quote: "見積書", statement: "取引明細書" },
    companyAria: "会社名・機関名",
    companyPlaceholder: "会社名・機関名（受領者）",
    businessNumberAria: "事業者登録番号",
    businessNumberPlaceholder: "事業者登録番号（任意） 000-00-00000",
    businessNumberTitle: "事業者登録番号10桁をご確認ください。（例: 123-45-67890）",
    panelTitle: "ご依頼の書類",
    download: (title) => `⬇ ${title} PDFダウンロード`,
    downloading: "ファイルを作成中…",
    downloadNote: "押すとPDFファイルがすぐに保存されます。スマートフォンでは「ダウンロード」フォルダ（iPhoneは「ファイル」アプリ）でご確認ください。この画面を閉じる前に保存してください。",
    downloadFailed: `ファイルを受け取れませんでした。もう一度お試しください。カカオトークなどのアプリ内で開いている場合は、SafariやChromeでお試しください。それでもできない場合はお店（${businessInfo.phone}）にご連絡ください。`,
    tabsAria: "書類の種類",
    koreanOnly: "書類は韓国語で作成されます。",
  },

  complete: {
    title: "お申し込みが完了しました！🎉",
    receiptNumber: (no) => `受付番号 ${no}`,
    receiptNote: "ご予約の確認・キャンセルに必要な番号です。下のボタンで保管してください。",
    orderer: (name, phone) => `予約者 ${name}・${phone}`,
    reminder: "ご予約時間の前に、予約者の連絡先へご案内のメッセージをお送りします。",
    paymentMethod: (label) => `お支払い方法・${label}`,
    cashReceipt: (label, number) => `現金領収証・${label} ${number}`,
    cardPayer: (contact) => `決済される方・${contact}`,
    cardPayerSame: "予約者と同じ",
    paypal: (amount, email) => `PayPal決済金額 ${amount}・リクエスト送付先 ${email}`,
    orchidDelivery: (text) => `胡蝶蘭の受け取り・${text}`,
    receiveMethod: (label) => `受け取り方法・${label}`,
    recipient: (text) => `受取人・${text}`,
    address: (text) => `配送先・${text}`,
    message: (text) => `メッセージ・${text}`,
  },

  share: {
    kakao: "カカオトークで自分に送る",
    kakaoHint: "共有画面で「自分とのチャット」を選ぶと、自分のカカオトークに保存されます。",
    other: "予約内容をコピー・他のアプリで送る",
    copied: "予約内容をコピーしました。チャットやメモに貼り付けて保管してください。",
    failed: "送れませんでした。この画面をスクリーンショットで保存してください。",
    title: (shopName) => `[${shopName}] 予約受付完了`,
    receipt: (no) => `受付番号 ${no}`,
    receiptNote: "※ ご予約の確認・キャンセルには受付番号が必要です。このメッセージを保管してください。",
    items: (first, others) => (others > 0 ? `${first} ほか${others}件` : first),
    total: (price) => `合計 ${price}`,
    bank: (bank, number, holder) => `振込先: ${bank} ${number}（${holder}）`,
    payment: (label) => `お支払い: ${label}`,
    lookupButton: "予約の確認・キャンセル",
    bookButton: "セスンで予約",
  },

  submitBar: {
    empty: "商品と日時をお選びください",
    submit: "予約する",
  },

  privacy: {
    consentLabel: "[必須] 個人情報の収集・利用に同意します",
    consentHint: "チェックするとご予約いただけます",
    consentError: "まだチェックされていません。ここにチェックして、予約ボタンをもう一度押してください。",
    showDetails: "内容を見る",
    hideDetails: "閉じる",
    items: [
      {
        title: "収集する項目",
        body: "予約者のお名前・電話番号（必須）、受取人のお名前・電話番号・配送先の住所、メッセージの文言、昇進・修了トッパーに入れる贈り主のお名前またはチーム名・修了課程、胡蝶蘭の配送先のお店・予約名、現金領収証の番号、カード決済される方の連絡先、PayPal支払いリクエスト用メールアドレス、書類に記載する会社名・事業者登録番号、入金後にキャンセルする場合の返金先の銀行名・口座番号・口座名義（該当する場合）",
      },
      {
        title: "利用目的",
        body: "予約の受付・確認のご連絡、商品の制作と受け取り・配送、決済の確認、現金領収証・見積書・取引明細書の発行、キャンセル時の返金",
      },
      {
        title: "保有期間",
        body: "商品のお渡し後1年間保管し、その後破棄します（法令により保存が必要な情報はその期間保管します）",
      },
    ],
    refusal: "同意を拒否することもできますが、その場合オンライン予約はできません。お電話またはNAVER予約をご利用ください。",
    policyLink: "個人情報処理方針をすべて見る（韓国語）›",
  },

  submit: {
    saving: "お申し込みを保存しています…",
    unavailable: `現在オンラインでのお申し込みを受け付けできません。お電話（${businessInfo.phone}）またはNAVER予約をご利用ください。`,
    failed: `お申し込みを保存できませんでした。しばらくしてから再度お試しいただくか、お電話（${businessInfo.phone}）でご連絡ください。`,
  },

  footer: {
    business: { tradeName: "商号", representative: "代表", businessNumber: "事業者登録番号", phone: "電話" },
    /** 배달 지역 한 줄 (구글 검색에도 쓰임) */
    area: "全州・完州の花配達 · 地方自治人材開発院（昇進式・修了式）への花配達 · 全州革新都市の24時間無人花屋",
    /** 상황별 꽃 한 줄 (구글 검색에도 쓰임) */
    occasions: "全州の花束・フラワーバスケット · 誕生日・記念日・プロポーズの花 · 父母の日・先生の日・卒業式・入学式の花 · 古希・傘寿・還暦のフラワーバスケット · 両家顔合わせの贈り物に胡蝶蘭 · 昇進・退任祝いの花 · 企業向け専門花屋 · 企業・公共機関イベントの装花・花配達",
    /** 기념일 꽃 한 줄 (구글 검색에도 쓰임) */
    seasons: "バレンタインデー・ホワイトデー・ローズデー・ペペロデー・クリスマスの花束・花配達",
    /** 주제별 소개 페이지 링크 (페이지 내용은 한국어 — data/guidePages) */
    guidesTitle: "花のご案内（韓国語）",
    guides: {
      occasions: "誕生日・父母の日・卒業式・古希の花",
      orchid: "両家顔合わせの贈り物 胡蝶蘭",
      institute: "地方自治人材開発院 昇進式・修了式の花",
      business: "企業・公共機関イベントの花",
    },
    privacy: "個人情報処理方針",
    refund: "キャンセル・返金ポリシー",
  },

  validation: {
    unreadable: "予約情報を読み取れませんでした。",
    privacy: "個人情報の収集・利用に同意してください。",
    ordererName: "予約者のお名前をご入力ください。",
    ordererPhone: "予約者の電話番号をご確認ください。",
    unknownProduct: "存在しない商品が含まれています。ページを再読み込みしてください。",
    quantity: "商品の数量をご確認ください。",
    duplicateProduct: "商品情報が重複しています。",
    noItems: "商品を1点以上追加してください。",
    schedule: "日付と時間をお選びください。",
    scheduleClosed: "選択した時間は現在予約できません。日時を選び直してください。",
    deliveries: "受取人・メッセージの情報をご確認ください。",
    recipientName: "配送先の受取人のお名前をご記入ください。",
    recipientPhone: "受取人の電話番号をご確認ください。",
    recipientAddress: "配送先の住所をご記入ください。",
    topperCourse: "修了トッパーに入れる修了課程をご記入ください。",
    orchidRestaurant: "胡蝶蘭を配送するお店の名前（または住所）をご記入ください。",
    orchidReservationName: "お店の予約名をご記入ください。",
    cashReceiptPhone: "現金領収証の携帯番号をご確認ください。",
    cashReceiptBusiness: "現金領収証の事業者登録番号をご確認ください。",
    cardPayer: "カード決済される方の連絡先をご記入ください。",
    paypalEmail: "PayPal支払いリクエストを受け取るメールアドレスをご確認ください。",
    documentCompany: "書類に記載する会社名・機関名をご入力ください。",
    documentBusinessNumber: "書類用の事業者登録番号をご確認ください。",
  },

  toss: {
    testNotice: "🧪 トスペイメンツ審査用のテスト決済画面です。実際には決済されず、店舗でも予約として扱いません。",
    bankDescription: "専用口座・自動確認",
    cardDescription: "個人カードは即時決済・法人カード",
    bankGuide: [
      "［予約する］を押すと、このご予約専用の入金口座が作られます。",
      "その口座にお振込みいただくと自動で確認されます。振込名義が違っても大丈夫です。",
      "現金領収証は入金口座を受け取る画面で申請できます。",
    ],
    cardKindTitle: "どのカードでお支払いですか？",
    cardKinds: {
      online: { label: "個人カード", description: "［予約する］を押すとカード決済画面がすぐに開きます" },
      keyin: { label: "法人カード（手入力決済）", description: "店からご連絡しますので、カード番号と有効期限をお知らせください" },
    },
    payNow: "カードで支払う",
    payNowBank: "入金口座を受け取る",
    opening: "決済画面を開いています…",
    pending: "まだ決済が完了していません。下のボタンから決済を完了してください。",
    pendingBank: "まだ入金口座を受け取っていません。下のボタンからこのご予約専用の入金口座を受け取ってください。",
    cardDone: "✅ カード決済が完了しました。",
    bankWaiting: "下記の口座にお振込みください。入金されると自動で確認されます。",
    bankDone: "✅ ご入金を確認しました。",
    accountLabel: "このご予約専用の入金口座",
    amount: (price: string) => `お振込み金額 ${price}`,
    dueDate: (text: string) => `${text}（韓国時間）までにお振込みください`,
    expired: `入金期限が過ぎました。店（${businessInfo.phone}）までご連絡ください。`,
    canceled: "決済はキャンセルされました。",
    receipt: "領収書を見る ›",
    successTitle: "予約と決済が完了しました！🎉",
    successTitleBank: "予約を受け付けました！あとはお振込みだけです",
    checking: "決済を確認しています…",
    failTitle: "決済が完了しませんでした",
    failBody: "予約申込は保存されています。下のボタンでもう一度決済するか、後で［予約確認］から決済できます。",
    failReason: (message: string) => `理由：${message}`,
    goLookup: "予約確認へ ›",
    goHome: "予約ページに戻る",
    errors: {
      unavailable: `現在オンライン決済はご利用いただけません。店（${businessInfo.phone}）までご連絡ください。`,
      notFound: "予約が見つかりませんでした。［予約確認］でご確認ください。",
      notPayable: "すでに決済済みか、今は決済できない予約です。［予約確認］でご確認ください。",
      amountMismatch: `決済金額が予約金額と異なります。店（${businessInfo.phone}）までご連絡ください。`,
      failed: `決済を処理できませんでした。もう一度お試しいただくか、店（${businessInfo.phone}）までご連絡ください。`,
    },
  },
  minPrice: {
    names: { graduation: "卒業シーズン" },
    period: (name: string, sm: number, sd: number, em: number, ed: number) => `${name}（${sm}/${sd}~${em}/${ed}）`,
    upcoming: (period: string, price: string) => `${period}にお受け取りのご予約は${price}からとなります。`,
    blocked: (period: string, price: string) => `選択された日付は${period}のため、${price}からご予約いただけます。`,
    conflict: (period: string, price: string, items: string) =>
      `${period}は${price}からのご予約となります。${items}を外すか、別の日付をお選びください。`,
    server: (period: string, price: string) => `${period}は${price}からのご予約となります。商品を選び直してください。`,
  },
  salePeriod: {
    blocked: (month: number, day: number) => `${month}月${day}日までのお受け取りのみご予約いただけます。`,
    conflict: (items: string, month: number, day: number) =>
      `${items}は${month}月${day}日までのお受け取りのみ可能です。外すか、それより前の日付をお選びください。`,
    server: (name: string, month: number, day: number) =>
      `${name}は${month}月${day}日までのお受け取りのみ可能です。日付または商品を選び直してください。`,
  },
};
