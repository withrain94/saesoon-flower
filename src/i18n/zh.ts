import {
  BLACKBOARD_MAX_LENGTH,
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  RIBBON_MAX_LENGTH,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import type { Messages } from "./ko";

/** 中文(简体) — 모양은 ko.ts와 같아야 한다 */

const hour12 = (hour: number) => (hour > 12 ? hour - 12 : hour);
const period = (hour: number) => (hour < 12 ? "上午" : "下午");
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

export const zh: Messages = {
  htmlLang: "zh-CN",

  format: {
    price: (price) => `${price.toLocaleString("zh-CN")}韩元`,
    priceShort: (price) => `${price / 10000}万韩元`,
    weekdays,
    dateShort: (month, day, weekday) => `${month}月${day}日(周${weekdays[weekday]})`,
    dateLong: (month, day, weekday) => `${month}月${day}日 星期${weekdays[weekday]}`,
    time: (hour) => `${period(hour)}${hour12(hour)}:00`,
    slotShort: (hour) => `${hour12(hour)}:00`,
    morning: "上午",
    afternoon: "下午",
    deadline: (dateLong, hour, minute) =>
      `${dateLong} ${period(hour)}${hour % 12 === 0 ? 12 : hour % 12}点${minute ? `${minute}分` : ""}`,
    itemName: (categoryName, priceLabel) => `${categoryName} ${priceLabel}`,
    unitName: (itemName, unitNo, quantity) => `${itemName} (${unitNo}/${quantity})`,
    listSeparator: "、",
  },

  common: {
    optional: "选填",
    close: "收起",
  },

  shop: {
    name: "Saesoon 全州革新城市店",
    tagline: "可预约、定制、无人自取的24小时无人花店。",
  },

  header: {
    siteLink: "Saesoon 介绍网站 ›",
    language: "语言",
  },

  hero: {
    title: (categoryNames) => `预约${categoryNames}`,
    imageAlt: "Saesoon 花束",
  },

  categories: {
    bouquet: { name: "花束", tagline: "亲手递送的礼物" },
    basket: { name: "花篮", tagline: "可摆放、久久欣赏的礼物" },
    orchid: {
      name: "蝴蝶兰",
      tagline: "两家见面礼·韩式包袱布礼物",
      popularNote: "2盆1套 · 两家各送一盆",
      notice: {
        summary: [
          "无法指定品种，每季到货的品种都不同。",
          "统一准备白色蝴蝶兰。",
          "包袱布（韩式包装布）颜色由包袱布艺术一级专家根据兰花挑选，并亲手包装。",
        ],
        full: [
          "!无法指定品种，敬请谅解!",
          "蝴蝶兰\n每一季到货的品种都不同，",
          "即使是同一种颜色，\n叶片的排列、花苞的数量和色调也会略有差异。",
          "所以我们\n不追求像工业品一样一模一样的花，\n而是希望送出\n只属于你们两人的独特蝴蝶兰。",
          "不过！颜色可以固定为白色。",
          "如果您选择\n像新娘一样清新端庄的\n白色蝴蝶兰，\n我们会用心准备最高品质的兰花。",
          "在 Saesoon，\n由花艺师兼\n持有包袱布艺术一级资格证的专家\n亲手包装鲜花。",
          "包袱布颜色会综合考虑\n- 白色蝴蝶兰的色调\n- 花梗的长度\n- 叶片的舒展程度\n等因素，\n每次都准备最相配的\n感性色彩包袱布。",
        ],
      },
    },
  },

  products: {
    "bouquet-50000": {
      title: "TOP3) 小巧但漂亮",
      points: ["小一点没关系，希望主要用漂亮的主花。", "想送一个不会让人有负担的尺寸。", "希望方便携带。"],
    },
    "bouquet-60000": {
      title: "BEST) 最有花束感的花束",
      points: ["不用太大，但希望对方收到时会开心。", "想把纪念日美美地留在记忆里。", "请做成最畅销的尺寸。"],
    },
    "bouquet-70000": {
      title: "[品质优先] 品质比尺寸重要",
      points: ["在最畅销尺寸的基础上多加一些漂亮的花。", "比起尺寸，更看重品质。", "希望不要太小。"],
    },
    "bouquet-80000": {
      title: "TOP5) 再丰盈一点",
      points: ["想要丰盈饱满的感觉。", "希望对方收到时心情愉快。", "想比上次更用心。"],
    },
    "bouquet-90000": {
      title: "[纪念日] 漂亮又丰盈",
      points: ["想用漂亮的花做得丰盈一些。", "想多加一些主花。", "想送上满满一大束花。"],
    },
    "bouquet-100000": {
      title: "TOP2) 这是重要的日子",
      points: ["想在纪念日给对方感动。", "准备用来求婚。", "比起尺寸，请更注重品质。"],
    },
    "bouquet-150000": {
      title: "TOP4) 大型花束",
      points: ["希望是让人忍不住惊叹的尺寸。", "用漂亮的花，同时更有丰盈感。", "想尝试一次。"],
    },
    "bouquet-200000": {
      title: "[活动用] 超大型花束",
      points: ["请务必做得大大的。", "想要超大型花束。"],
    },
    "bouquet-300000": {
      title: "[高级] 满怀特别花束",
      points: [
        "用被誉为花中之最的婚礼用花制作的特别花束！（使用当季花材）",
        "当天可能因情况无法制作，建议提前预约。",
        "无论如何都想要又大又特别的花束。",
        "准备求婚。",
      ],
    },
    "basket-70000": {
      title: "[日常礼物] 基础款花篮",
      points: ["适合轻松送出的漂亮尺寸", "适合乔迁、小礼物和祝贺"],
    },
    "basket-80000": {
      title: "TOP2) 更丰盈的基础款花篮",
      points: ["把基础款花篮做得更丰盈，或换成特别的色调"],
    },
    "basket-100000": {
      title: "BEST) 活动款花篮",
      points: ["纪念日礼物、活动用的人气尺寸", "生日、恋人、父母礼物中最受欢迎的尺寸", "收到的人拍照也好看的比例"],
    },
    "basket-150000": {
      title: "TOP3) 更丰盈的活动款花篮",
      points: ["把活动款花篮做得更丰盈，或换成特别的色调", "最适合活动、展览、祝贺的丰盈度"],
    },
    "basket-200000": {
      title: "[活动用] 大型花篮",
      points: ["在活动现场、展览、开业典礼上很有存在感的尺寸", "远远就能吸引目光的风格"],
    },
    "basket-300000": {
      title: "[高级] 更丰盈的大型花篮",
      points: ["用本身就很大的篮子插得满满的", "花量明显比大型款更多", "拍照、活动用的震撼尺寸"],
    },
    "orchid-120000": {
      title: "两家见面礼 包袱布蝴蝶兰（2盆1套）",
      points: [
        "端庄的白色蝴蝶兰＋由设计师挑选象征新郎新娘的粉色、蓝色等包袱布颜色",
        "2盆1套，两家各送一盆",
        "免费配送至湖南阁、宫、古宫潭等全州见面餐厅",
        "双层包装，送出后也能保持包装并养护",
      ],
    },
  },

  events: {
    institutePromotion: {
      calendarLabel: "晋升式",
      shortTitle: (term) => `第${term}期晋升仪式`,
      title: (term) => `地方自治人才开发院 第${term}期晋升仪式`,
      highlights: [
        "来自全国各地的人员齐聚完州，很多人远道而来，因此花篮特别受欢迎。",
        "免费赠送晋升插牌（花束装饰牌）。",
        "取花时间请在上午8点、9点中选择。",
      ],
    },
  },

  eventBanner: {
    ariaLabel: "特别日子预约指南",
    book: (shortTitle, categoryName) => `预约${shortTitle}${categoryName}`,
    later: "之后的日程",
    bookShort: "预约",
    deadline: (deadline) => `请在${deadline}之前预约。`,
  },

  categoryEntry: {
    ariaLabel: "预约商品种类",
    title: "您想预约什么？",
    subtitle: "也可以把多种商品一起加入，一次预约。",
    photoAlt: (name) => `${name}示例照片`,
    count: (count) => `已加${count}个`,
    startingFrom: (price) => `${price}起`,
  },

  naverOnly: {
    plant: { title: "预约开业·晋升·祝贺盆栽", description: "仅通过 Naver 预约受理" },
  },

  naverBanner: {
    ariaLabel: "Naver 预约",
    title: "要用 Naver Pay 付款吗？",
    description: "无需填写申请表，直接在 Naver 预约下单。",
    linkAria: (name) => `${name} Naver 预约`,
  },

  sectionTabs: {
    items: "选花",
    dateTime: "日期·时间",
    reserve: "提交申请",
  },

  productSection: {
    heading: "请选择要预约的商品",
    subtitle: (categoryNames) => `${categoryNames}可以一起加入，一次预约。`,
    error: "请至少加入1件商品。",
    tabsAria: "商品种类",
    listAria: (name) => `${name}列表`,
    sortPrice: "按价格",
    sortRank: "按人气",
    popular: (labels) => `人气价位：${labels}`,
    photoNote: "* 无法与照片完全相同，请作为色调和大小的参考。",
    moreSite: (name) => `📷 查看更多${name}照片·介绍`,
    moreSiteSub: "可在 Saesoon 介绍网站查看实际作品",
    nextCategory: (name) => `也看看${name}`,
  },

  notice: {
    title: "请务必确认！",
    showFull: "查看完整说明",
    hideFull: "收起完整说明",
  },

  productOption: {
    photoToggle: (name, open) => `${open ? "收起" : "查看更多"}${name}照片`,
    coverAlt: (name) => `${name}主图`,
    photoCount: (count) => `照片 ${count}`,
    photoAlt: (name, index) => `${name}实际作品照片 ${index}`,
    morePhotos: "查看更多照片",
    morePhotosSub: "前往 Saesoon 介绍网站",
    quantity: (name) => `${name}数量`,
    decrease: (name) => `减少${name}`,
    increase: (name) => `增加${name}`,
  },

  dateTime: {
    headingDate: "日期",
    headingTime: "请选择时间",
    sameDayRule: `当天预约需在取花时间前${SAME_DAY_LEAD_HOURS}小时完成。`,
    closeRule: `下午${ORDER_CLOSE_HOUR - 12}点以后，无法预约次日上午${ORDER_OPEN_HOUR}点（含）之前的时间。`,
    errorDate: "请选择取花日期。",
    errorTime: "请选择取花时间。",
    eventQuick: "快速选择特别日子",
    pickDateFirst: "先选择日期，才能选择时间。",
    eventSlots: (shortTitle) => `${shortTitle}时间`,
    prevMonth: "上个月",
    nextMonth: "下个月",
    today: "今天",
    dayAria: (month, day, label, isToday) =>
      `${month}月${day}日${label ? ` ${label}` : ""}${isToday ? " 今天" : ""}`,
  },

  reserve: {
    heading: "请填写预约信息",
    ordererName: "预约人姓名",
    ordererNamePlaceholder: "请输入姓名",
    ordererPhone: "预约人电话",
    phonePlaceholder: "010-0000-0000 或 +86 000 0000 0000",
    phoneTitle: "请确认电话号码。（例：010-1234-5678 / +86 138 0000 0000）",
  },

  summary: {
    items: "已选商品",
    itemsEmpty: "请加入要预约的商品",
    schedule: "日期·时间",
    scheduleEmpty: "请选择日期和时间",
    total: (count) => `共${count}件`,
  },

  color: {
    label: "想要的色调",
    options: {
      auto: "交给花店",
      bright: "明亮艳丽",
      anniversary: "适合纪念日",
      pink: "粉色系",
      warm: "暖色系",
      soft: "淡雅色调",
      other: "其他",
    },
    otherAria: "直接输入想要的色调",
    otherPlaceholder: "请写下想要的色调",
  },

  orchidDelivery: {
    title: "蝴蝶兰取货方式",
    methods: {
      pickup: { label: "到店自取", description: "Saesoon 全州革新城市店" },
      restaurant: { label: "配送到见面餐厅", description: "全州市内免费配送" },
    },
    restaurant: "餐厅",
    restaurantOther: "其他（直接输入）",
    restaurantOtherPlaceholder: "请填写餐厅名称",
    reservationName: "餐厅预约人姓名",
    reservationNamePlaceholder: "在餐厅订位时使用的姓名",
    timeNote: "我们会按您选择的日期和时间送达餐厅。",
    describePickup: "到店自取",
    describeRestaurant: (restaurant, reservationName) => `配送至${restaurant} · 预约人 ${reservationName}`,
  },

  restaurants: {
    호남각: "湖南阁（호남각）",
    궁: "宫（궁）",
    고궁담: "古宫潭（고궁담）",
  },

  recipient: {
    title: "收花人·留言",
    guide: "花束附印刷留言卡，花篮可选缎带字或小黑板，蝴蝶兰使用小黑板。",
    empty: "加入商品后即可填写收花人和留言。",
    bulkAria: "一次修改收花人·留言",
    allSame: "全部相同",
    allSameDescription: "收花人·留言只填一次",
    allSeparate: "全部分开",
    allSeparateDescription: "每件商品分别填写",
    mixed: "部分商品正在分开填写。点击按钮会一次应用到所有商品。",
    recipientTitle: "收花人",
    sameRecipient: "与上一件相同",
    nameAria: "收花人姓名",
    namePlaceholder: "收花人姓名（取花人不同或需配送时）",
    phoneAria: "收花人电话",
    phonePlaceholder: "收花人电话 010-0000-0000",
    messageTitle: "留言",
    sameMessage: (categoryName) => `与上一个${categoryName}留言相同`,
    describeEmpty: "未填写（预约人自取）",
  },

  topper: {
    title: "🎓 晋升插牌（免费）",
    description: "请填写插牌上的姓名和职级。留空的话，店家会联系您。",
    nameAria: "插牌上的姓名",
    namePlaceholder: "姓名（例：홍길동）",
    rankAria: "插牌上的职级",
    rankPlaceholder: "职级（例：사무관）",
    describe: (name, rank) => `插牌 · ${[name, rank].filter(Boolean).join(" ") || "未填写（店家会联系您）"}`,
  },

  message: {
    typeAria: "留言方式",
    types: {
      none: "无",
      memo: "附印刷留言卡",
      ribbon: `缎带字（左右两条，每条约${RIBBON_MAX_LENGTH}字）`,
      blackboard: `小黑板（含空格${BLACKBOARD_MAX_LENGTH}字以内）`,
    },
    memoAria: "留言卡内容",
    memoPlaceholder: "请填写要印在留言卡上的内容",
    ribbonLeftAria: "缎带一侧内容",
    ribbonLeftPlaceholder: `一侧内容（约${RIBBON_MAX_LENGTH}字）`,
    ribbonRightAria: "缎带另一侧内容",
    ribbonRightPlaceholder: `另一侧内容（约${RIBBON_MAX_LENGTH}字）`,
    presetsAria: "小黑板内容",
    custom: "直接输入",
    customAria: "直接输入小黑板内容",
    customPlaceholder: `请自由填写小黑板内容（含空格${BLACKBOARD_MAX_LENGTH}字以内）`,
    writtenInKorean: "实际用韩文书写：",
    describeNone: "无",
    describeMemo: (text) => `留言卡 · ${text || "（未填写内容）"}`,
    describeRibbon: (left, right) => `缎带 · ${left || "-"} / ${right || "-"}`,
    describeBlackboard: (text) => `小黑板 · ${text || "（未填写内容）"}`,
  },

  blackboardPresets: {
    auto: "交给店家书写",
    thanks: "“感谢您把我们养育成人，今后我们会好好生活。”",
    luck: "“愿幸运如蝴蝶兰的花语般飞来，我们会幸福地生活。”",
  },

  payment: {
    legend: "付款方式",
    methods: {
      bank: {
        label: "银行转账",
        description: "确认到账后完成",
        complete: "确认到账后预约才算完成。",
      },
      card: {
        label: "刷卡付款",
        description: "电话告知卡号",
        complete: "店家联系您时，请告知卡号和有效期。付款完成后预约才算完成。",
      },
      paypal: {
        label: "PayPal",
        description: "海外付款 · 手续费10%",
        complete: "店家会通过邮件发送 PayPal 付款请求。付款完成后预约才算完成。",
      },
    },
    cardGuide: [
      "确认预约后，店家会联系您。",
      "通话时告知卡号和有效期，即可为您付款。",
      "请不要在本申请表中填写卡号。",
    ],
    cardPayerTitle: "刷卡付款人联系方式",
    cardPayerDescription: "如果刷卡付款人的电话与预约人不同，请在下方填写。",
    cardPayerOptions: { same: "与预约人相同", other: "与预约人不同" },
    cardPayerAria: "刷卡付款人姓名·电话",
    cardPayerPlaceholder: "付款人姓名和电话（例：김결제 010-1234-5678）",
    cashReceiptTitle: "现金收据（韩国）",
    cashReceiptOptions: { none: "不申请", income: "个人抵扣", expense: "企业凭证" },
    cashReceiptInputs: {
      income: { placeholder: "手机号 010-0000-0000", title: "请确认手机号码。（例：010-1234-5678）" },
      expense: { placeholder: "营业执照号 000-00-00000", title: "请确认10位营业执照号。（例：123-45-67890）" },
    },
    cashReceiptNumberAria: (label) => `${label}号码`,
    naverNote: "使用 Naver Pay 付款，请另外在 Naver 预约下单。",
    naverLink: "前往 Naver 预约 ›",
    overseasTitle: "从海外付款吗？",
    overseasBody: "可以使用 PayPal 付款。商品·配送金额需另加10%手续费。",
    paypalGuide: [
      "确认预约后，店家会向下方邮箱发送 PayPal 付款请求。",
      "商品·配送金额需另加10% PayPal 手续费。",
    ],
    paypalProducts: "商品金额",
    paypalFee: (percent) => `手续费 ${percent}%`,
    paypalTotal: "PayPal 付款金额",
    paypalEmail: "接收 PayPal 付款请求的邮箱",
    paypalEmailPlaceholder: "name@example.com",
  },

  bankCard: {
    title: "转账账户",
    bank: "农协银行（농협）",
    holderNote: (holder) => `${holder} · 转账后请告知汇款人姓名`,
    copy: "复制账号",
    copied: "已复制 ✓",
  },

  documents: {
    toggle: "需要报价单·交易明细单",
    description: "公司·机构活动等需要凭证时请勾选，提交后立即为您生成。",
    groupAria: "需要的文件",
    options: { quote: "报价单", statement: "交易明细单" },
    emailAria: "接收文件的邮箱",
    emailPlaceholder: "接收文件的邮箱（例：name@company.com）",
    companyAria: "公司·机构名称",
    companyPlaceholder: "公司·机构名称（收货方）",
    businessNumberAria: "营业执照号",
    businessNumberPlaceholder: "营业执照号（选填）000-00-00000",
    businessNumberTitle: "请确认10位营业执照号。（例：123-45-67890）",
    panelTitle: "申请的文件",
    print: "打印 / 保存 PDF",
    emailNote: (email) => `店家确认后会发送到 ${email}。如需立即使用，请在打印窗口选择“另存为 PDF”。`,
    tabsAria: "文件种类",
    koreanOnly: "文件以韩文开具。",
  },

  complete: {
    title: "申请已提交！🎉",
    orderer: (name, phone) => `预约人 ${name} · ${phone}`,
    paymentMethod: (label) => `付款方式 · ${label}`,
    cashReceipt: (label, number) => `现金收据 · ${label} ${number}`,
    cardPayer: (contact) => `付款人 · ${contact}`,
    cardPayerSame: "与预约人相同",
    paypal: (amount, email) => `PayPal 付款金额 ${amount} · 付款请求发送至 ${email}`,
    orchidDelivery: (text) => `蝴蝶兰取货 · ${text}`,
    recipient: (text) => `收花人 · ${text}`,
    message: (text) => `留言 · ${text}`,
  },

  submitBar: {
    empty: "请选择商品和日期·时间",
    submit: "预约",
  },

  validation: {
    unreadable: "无法读取预约信息。",
    privacy: "请同意收集和使用个人信息。",
    ordererName: "请输入预约人姓名。",
    ordererPhone: "请确认预约人电话。",
    unknownProduct: "包含不存在的商品，请刷新页面。",
    quantity: "请确认商品数量。",
    duplicateProduct: "商品信息重复。",
    noItems: "请至少加入1件商品。",
    schedule: "请选择日期和时间。",
    scheduleClosed: "所选时间现在无法预约，请重新选择日期·时间。",
    deliveries: "请确认收花人·留言信息。",
    recipientPhone: "请确认收花人电话。",
    orchidRestaurant: "请填写配送蝴蝶兰的餐厅名称。",
    orchidReservationName: "请填写餐厅预约人姓名。",
    cashReceiptPhone: "请确认现金收据的手机号码。",
    cashReceiptBusiness: "请确认现金收据的营业执照号。",
    cardPayer: "请填写刷卡付款人的联系方式。",
    paypalEmail: "请确认接收 PayPal 付款请求的邮箱。",
    documentEmail: "请确认接收文件的邮箱。",
    documentCompany: "请输入文件上的公司·机构名称。",
    documentBusinessNumber: "请确认文件用的营业执照号。",
  },
};
