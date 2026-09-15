import {
  BLACKBOARD_MAX_LENGTH,
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  RIBBON_MAX_LENGTH,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import type { Messages } from "./ko";

/** Tiếng Việt — 모양은 ko.ts와 같아야 한다 (시각은 24시간제) */

const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const weekdaysLong = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export const vi: Messages = {
  htmlLang: "vi",

  format: {
    price: (price) => `${price.toLocaleString("vi-VN")} ₩`,
    priceShort: (price) => `${price.toLocaleString("vi-VN")} ₩`,
    weekdays,
    dateShort: (month, day, weekday) => `${weekdays[weekday]}, ${day}/${month}`,
    dateLong: (month, day, weekday) => `${weekdaysLong[weekday]}, ngày ${day}/${month}`,
    time: (hour) => `${hour}:00`,
    slotShort: (hour) => `${hour}:00`,
    morning: "Buổi sáng",
    afternoon: "Buổi chiều & tối",
    deadline: (dateLong, hour, minute) => `${hour}:${String(minute).padStart(2, "0")} ${dateLong}`,
    itemName: (categoryName, priceLabel) => `${categoryName} ${priceLabel}`,
    unitName: (itemName, unitNo, quantity) => `${itemName} (${unitNo}/${quantity})`,
    listSeparator: " · ",
  },

  common: {
    optional: "Không bắt buộc",
    close: "Thu gọn",
  },

  shop: {
    name: "Saesoon chi nhánh Jeonju Innovation City",
    tagline: "Tiệm hoa tự phục vụ 24 giờ — đặt trước, làm theo yêu cầu và nhận hoa không cần nhân viên.",
  },

  header: {
    siteLink: "Giới thiệu Saesoon ›",
    language: "Ngôn ngữ",
  },

  hero: {
    title: (categoryNames) => `Đặt ${categoryNames}`,
    imageAlt: "Bó hoa của Saesoon",
  },

  categories: {
    bouquet: { name: "Bó hoa", tagline: "Món quà trao tận tay" },
    basket: { name: "Giỏ hoa", tagline: "Món quà trưng bày, ngắm được lâu" },
    orchid: {
      name: "Lan hồ điệp",
      tagline: "Quà gói vải bojagi cho buổi ra mắt hai gia đình",
      popularNote: "Bộ 2 chậu · mỗi bên gia đình một chậu",
      notice: {
        summary: [
          "Không thể chọn giống lan — mỗi mùa giống lan về tiệm lại khác nhau.",
          "Chúng tôi chuẩn bị lan màu trắng.",
          "Nghệ nhân bojagi (vải gói truyền thống Hàn Quốc) hạng 1 chọn màu vải hợp với lan và tự tay gói.",
        ],
        full: [
          "!Mong quý khách thông cảm vì không thể chỉ định giống lan!",
          "Lan hồ điệp\nmỗi mùa lại về những giống khác nhau,",
          "và dù cùng một màu,\ncách xếp lá, số nụ hoa và sắc độ cũng hơi khác nhau.",
          "Vì vậy chúng tôi\nkhông gửi những bông hoa giống hệt nhau như hàng công nghiệp,\nmà hướng đến những chậu lan\nđộc nhất chỉ dành cho hai bạn.",
          "Tuy nhiên! Màu sắc có thể cố định là màu trắng.",
          "Nếu quý khách chọn\nlan hồ điệp trắng mang vẻ trong trẻo, thanh lịch như cô dâu,\nchúng tôi sẽ tận tâm chuẩn bị\nnhững chậu lan chất lượng tốt nhất.",
          "Tại Saesoon,\nmột chuyên gia vừa là florist\nvừa có chứng chỉ nghệ thuật bojagi hạng 1\ntự tay gói hoa.",
          "Màu vải bojagi được chọn\ndựa trên\n- sắc độ của lan trắng\n- độ dài cành hoa\n- độ xòe của lá\nđể mỗi lần đều chuẩn bị\nmàu vải hợp nhất và giàu cảm xúc nhất.",
        ],
      },
    },
  },

  products: {
    "bouquet-50000": {
      title: "TOP3) Nhỏ nhưng xinh",
      points: [
        "Nhỏ cũng được, miễn là chủ yếu dùng hoa chính thật đẹp.",
        "Tôi muốn tặng bó hoa kích thước vừa phải, không gây áp lực.",
        "Tôi muốn dễ mang theo.",
      ],
    },
    "bouquet-60000": {
      title: "BEST) Bó hoa đúng chất bó hoa",
      points: [
        "Không cần quá to, nhưng muốn người nhận thấy vui khi cầm.",
        "Tôi muốn lưu giữ ngày kỷ niệm thật đẹp.",
        "Hãy làm theo kích thước bán chạy nhất.",
      ],
    },
    "bouquet-70000": {
      title: "[Chất lượng] Chất lượng hơn kích thước",
      points: [
        "Kích thước bán chạy nhất, thêm nhiều hoa đẹp hơn.",
        "Chất lượng quan trọng hơn kích thước.",
        "Mong là không quá nhỏ.",
      ],
    },
    "bouquet-80000": {
      title: "TOP5) Đầy đặn hơn một chút",
      points: [
        "Tôi muốn bó hoa trông đầy đặn.",
        "Tôi muốn người nhận thấy vui khi nhận.",
        "Tôi muốn chu đáo hơn lần trước.",
      ],
    },
    "bouquet-90000": {
      title: "[Kỷ niệm] Đẹp và đầy đặn",
      points: [
        "Tôi muốn dùng hoa đẹp và thật đầy đặn.",
        "Tôi muốn thêm nhiều hoa chính hơn.",
        "Tôi muốn trao một ôm hoa thật lớn.",
      ],
    },
    "bouquet-100000": {
      title: "TOP2) Đây là ngày quan trọng",
      points: [
        "Tôi muốn khiến người ấy xúc động vào ngày kỷ niệm.",
        "Tôi định dùng để cầu hôn.",
        "Hãy chú trọng chất lượng hơn kích thước.",
      ],
    },
    "bouquet-150000": {
      title: "TOP4) Bó hoa lớn",
      points: [
        "Tôi muốn kích thước khiến người nhận phải thốt lên.",
        "Dùng hoa đẹp nhưng trông đầy đặn hơn nữa.",
        "Tôi muốn thử một lần.",
      ],
    },
    "bouquet-200000": {
      title: "[Sự kiện] Bó hoa siêu lớn",
      points: ["Hãy làm thật to.", "Tôi muốn một bó hoa siêu lớn."],
    },
    "bouquet-300000": {
      title: "[Cao cấp] Bó hoa đặc biệt ôm trọn vòng tay",
      points: [
        "Bó hoa đặc biệt làm từ hoa cưới – loại hoa đẹp nhất! (Dùng hoa theo mùa)",
        "Tùy tình hình trong ngày có thể khó làm kịp, nên chúng tôi khuyên quý khách đặt trước.",
        "Tôi muốn một bó hoa thật to và đặc biệt.",
        "Tôi định cầu hôn.",
      ],
    },
    "basket-70000": {
      title: "[Quà thường ngày] Giỏ hoa cơ bản",
      points: ["Kích thước vừa phải, đẹp để tặng không áp lực", "Hợp cho tân gia, quà nhỏ và lời chúc mừng"],
    },
    "basket-80000": {
      title: "TOP2) Giỏ hoa cơ bản đầy đặn hơn",
      points: ["Giỏ hoa cơ bản làm đầy đặn hơn hoặc với tông màu đặc biệt"],
    },
    "basket-100000": {
      title: "BEST) Giỏ hoa sự kiện",
      points: [
        "Kích thước được ưa chuộng cho quà kỷ niệm và sự kiện",
        "Kích thước phổ biến nhất để tặng sinh nhật, người yêu, bố mẹ",
        "Tỷ lệ đẹp để người nhận chụp ảnh",
      ],
    },
    "basket-150000": {
      title: "TOP3) Giỏ hoa sự kiện đầy đặn hơn",
      points: [
        "Giỏ hoa sự kiện làm đầy đặn hơn hoặc với tông màu đặc biệt",
        "Độ đầy đặn phù hợp nhất cho sự kiện, triển lãm, chúc mừng",
      ],
    },
    "basket-200000": {
      title: "[Sự kiện] Giỏ hoa lớn",
      points: ["Kích thước nổi bật tại hội trường, triển lãm, lễ khai trương", "Phong cách thu hút ánh nhìn từ xa"],
    },
    "basket-300000": {
      title: "[Cao cấp] Giỏ hoa lớn đầy đặn",
      points: [
        "Giỏ cỡ lớn được cắm thật đầy đặn",
        "Lượng hoa nhiều hơn hẳn loại lớn",
        "Kích thước ấn tượng cho chụp ảnh và sự kiện",
      ],
    },
    "orchid-120000": {
      title: "Lan hồ điệp gói bojagi cho buổi ra mắt (bộ 2 chậu)",
      points: [
        "Lan hồ điệp trắng thanh lịch + màu vải bojagi (như hồng, xanh tượng trưng cô dâu chú rể) do nhà thiết kế chọn",
        "Bộ 2 chậu để tặng mỗi bên gia đình một chậu",
        "Miễn phí giao đến các nhà hàng ra mắt ở Jeonju như Honamgak, Gung, Gogungdam",
        "Gói hai lớp, có thể giữ nguyên lớp gói và chăm sóc sau khi tặng",
      ],
    },
  },

  events: {
    institutePromotion: {
      calendarLabel: "Lễ TC",
      shortTitle: (term) => `Lễ thăng chức khóa ${term}`,
      title: (term) => `Lễ thăng chức khóa ${term} – Viện Phát triển Nhân lực Chính quyền Địa phương`,
      highlights: [
        "Cán bộ từ khắp cả nước tập trung về Wanju, nhiều người đến từ xa nên giỏ hoa đặc biệt được ưa chuộng.",
        "Tặng kèm miễn phí thẻ cắm (topper) chúc mừng thăng chức.",
        "Vui lòng chọn giờ nhận hoa lúc 8:00 hoặc 9:00 sáng.",
      ],
    },
  },

  eventBanner: {
    ariaLabel: "Đặt hoa cho ngày đặc biệt",
    book: (categoryName) => `Đặt ${categoryName.toLowerCase()}`,
    later: "Lịch tiếp theo",
    bookShort: "Đặt",
    deadline: (deadline) => `Vui lòng đặt trước ${deadline}.`,
  },

  categoryEntry: {
    ariaLabel: "Loại sản phẩm",
    title: "Quý khách muốn đặt gì?",
    subtitle: "Có thể chọn nhiều loại và đặt cùng một lúc.",
    photoAlt: (name) => `Ảnh mẫu ${name.toLowerCase()}`,
    count: (count) => `Đã chọn ${count}`,
    startingFrom: (price) => `Từ ${price}`,
  },

  naverOnly: {
    plant: { title: "Đặt chậu cây khai trương · thăng chức · chúc mừng", description: "Chỉ nhận qua Naver Booking" },
  },

  naverBanner: {
    ariaLabel: "Naver Booking",
    title: "Thanh toán bằng Naver Pay?",
    description: "Đặt trực tiếp trên Naver Booking, không cần điền đơn.",
    linkAria: (name) => `${name} trên Naver Booking`,
  },

  sectionTabs: {
    items: "Chọn hoa",
    dateTime: "Ngày giờ",
    reserve: "Gửi đơn",
  },

  productSection: {
    heading: "Chọn sản phẩm muốn đặt",
    subtitle: (categoryNames) => `Có thể chọn ${categoryNames} và đặt cùng một lúc.`,
    error: "Vui lòng chọn ít nhất 1 sản phẩm.",
    tabsAria: "Loại sản phẩm",
    listAria: (name) => `Danh sách ${name.toLowerCase()}`,
    sortPrice: "Theo giá",
    sortRank: "Phổ biến",
    popular: (labels) => `Giá được chọn nhiều: ${labels}`,
    photoNote: "* Không thể làm giống hệt ảnh. Vui lòng xem ảnh để tham khảo màu sắc và kích thước.",
    moreSite: (name) => `📷 Xem thêm ảnh · mô tả ${name.toLowerCase()}`,
    moreSiteSub: "Xem sản phẩm thực tế trên trang giới thiệu Saesoon",
    nextCategory: (name) => `Xem cả ${name.toLowerCase()}`,
  },

  notice: {
    title: "Vui lòng đọc kỹ!",
    showFull: "Xem toàn bộ lưu ý",
    hideFull: "Thu gọn lưu ý",
  },

  productOption: {
    photoToggle: (name, open) => `${open ? "Thu gọn" : "Xem thêm"} ảnh ${name}`,
    coverAlt: (name) => `Ảnh chính ${name}`,
    photoCount: (count) => `${count} ảnh`,
    photoAlt: (name, index) => `Ảnh thực tế ${name} ${index}`,
    morePhotos: "Xem thêm ảnh",
    morePhotosSub: "Đến trang giới thiệu Saesoon",
    quantity: (name) => `Số lượng ${name}`,
    decrease: (name) => `Bớt ${name}`,
    increase: (name) => `Thêm ${name}`,
  },

  dateTime: {
    headingDate: "Ngày",
    headingTime: "Chọn giờ",
    sameDayRule: `Đặt trong ngày cần đặt trước giờ nhận ít nhất ${SAME_DAY_LEAD_HOURS} tiếng.`,
    closeRule: `Sau ${ORDER_CLOSE_HOUR}:00, không thể đặt các khung giờ đến ${ORDER_OPEN_HOUR}:00 sáng hôm sau.`,
    errorDate: "Vui lòng chọn ngày nhận.",
    errorTime: "Vui lòng chọn giờ nhận.",
    eventQuick: "Chọn nhanh ngày đặc biệt",
    pickDateFirst: "Chọn ngày trước để xem các giờ còn trống.",
    eventSlots: (shortTitle) => `Giờ ${shortTitle}`,
    prevMonth: "Tháng trước",
    nextMonth: "Tháng sau",
    today: "Hôm nay",
    dayAria: (month, day, label, isToday) =>
      `Ngày ${day} tháng ${month}${label ? `, ${label}` : ""}${isToday ? ", hôm nay" : ""}`,
  },

  reserve: {
    heading: "Nhập thông tin đặt hoa",
    ordererName: "Tên người đặt",
    ordererNamePlaceholder: "Vui lòng nhập tên",
    ordererPhone: "Số điện thoại người đặt",
    phonePlaceholder: "010-0000-0000 hoặc +84 00 000 0000",
    phoneTitle: "Vui lòng kiểm tra số điện thoại. (VD: 010-1234-5678 / +84 90 123 4567)",
  },

  summary: {
    items: "Sản phẩm đã chọn",
    itemsEmpty: "Vui lòng chọn sản phẩm",
    schedule: "Ngày giờ",
    scheduleEmpty: "Vui lòng chọn ngày và giờ",
    total: (count) => `Tổng ${count} sản phẩm`,
  },

  color: {
    label: "Tông màu mong muốn",
    options: {
      auto: "Để tiệm chọn",
      bright: "Tươi sáng",
      anniversary: "Hợp ngày kỷ niệm",
      pink: "Tông hồng",
      warm: "Tông ấm",
      soft: "Tông nhẹ nhàng",
      other: "Khác",
    },
    otherAria: "Nhập tông màu mong muốn",
    otherPlaceholder: "Mô tả tông màu quý khách muốn",
  },

  orchidDelivery: {
    title: "Cách nhận lan hồ điệp",
    methods: {
      pickup: { label: "Nhận tại tiệm", description: "Saesoon Jeonju Innovation City" },
      restaurant: { label: "Giao đến nhà hàng", description: "Miễn phí trong Jeonju" },
    },
    restaurant: "Nhà hàng",
    restaurantOther: "Khác (tự nhập)",
    restaurantOtherPlaceholder: "Tên nhà hàng",
    reservationName: "Tên đặt bàn tại nhà hàng",
    reservationNamePlaceholder: "Tên dùng khi đặt bàn",
    timeNote: "Chúng tôi sẽ giao để lan đến nhà hàng đúng ngày giờ quý khách đã chọn.",
    describePickup: "Nhận tại tiệm",
    describeRestaurant: (restaurant, reservationName) => `Giao đến ${restaurant} · tên đặt bàn ${reservationName}`,
  },

  restaurants: {
    호남각: "Honamgak (호남각)",
    궁: "Gung (궁)",
    고궁담: "Gogungdam (고궁담)",
  },

  recipient: {
    title: "Người nhận · lời nhắn",
    guide: "Bó hoa kèm thẻ lời nhắn in sẵn, giỏ hoa có chữ trên ruy băng hoặc bảng đen nhỏ, lan hồ điệp dùng bảng đen nhỏ.",
    empty: "Chọn sản phẩm để nhập người nhận và lời nhắn.",
    bulkAria: "Đổi người nhận · lời nhắn cho tất cả",
    allSame: "Tất cả giống nhau",
    allSameDescription: "Chỉ nhập một lần",
    allSeparate: "Nhập riêng từng cái",
    allSeparateDescription: "Nhập cho mỗi sản phẩm",
    mixed: "Một số sản phẩm đang được nhập riêng. Nhấn nút để áp dụng cho tất cả.",
    recipientTitle: "Người nhận",
    sameRecipient: "Giống sản phẩm trước",
    nameAria: "Tên người nhận",
    namePlaceholder: "Tên người nhận (nếu người khác nhận hoặc cần giao)",
    phoneAria: "Số điện thoại người nhận",
    phonePlaceholder: "SĐT người nhận 010-0000-0000",
    messageTitle: "Lời nhắn",
    sameMessage: (categoryName) => `Giống lời nhắn ${categoryName.toLowerCase()} trước`,
    describeEmpty: "Chưa nhập (người đặt tự nhận)",
  },

  topper: {
    title: "🎓 Thẻ cắm thăng chức (miễn phí)",
    description: "Nhập tên và chức vụ để in lên thẻ cắm. Nếu để trống, tiệm sẽ liên hệ với quý khách.",
    nameAria: "Tên trên thẻ cắm",
    namePlaceholder: "Tên (VD: 홍길동)",
    rankAria: "Chức vụ trên thẻ cắm",
    rankPlaceholder: "Chức vụ (VD: 사무관)",
    describe: (name, rank) =>
      `Thẻ cắm · ${[name, rank].filter(Boolean).join(" ") || "Chưa nhập (tiệm sẽ liên hệ)"}`,
  },

  message: {
    typeAria: "Hình thức lời nhắn",
    types: {
      none: "Không có",
      memo: "Thẻ lời nhắn in sẵn",
      ribbon: `Chữ trên ruy băng (hai bên, mỗi bên khoảng ${RIBBON_MAX_LENGTH} ký tự)`,
      blackboard: `Bảng đen nhỏ (tối đa ${BLACKBOARD_MAX_LENGTH} ký tự kể cả khoảng trắng)`,
    },
    memoAria: "Nội dung thẻ lời nhắn",
    memoPlaceholder: "Nội dung in trên thẻ lời nhắn",
    ribbonLeftAria: "Chữ ruy băng một bên",
    ribbonLeftPlaceholder: `Một bên (khoảng ${RIBBON_MAX_LENGTH} ký tự)`,
    ribbonRightAria: "Chữ ruy băng bên còn lại",
    ribbonRightPlaceholder: `Bên còn lại (khoảng ${RIBBON_MAX_LENGTH} ký tự)`,
    presetsAria: "Nội dung bảng đen",
    custom: "Tự viết",
    customAria: "Tự viết nội dung bảng đen",
    customPlaceholder: `Viết nội dung bảng đen (tối đa ${BLACKBOARD_MAX_LENGTH} ký tự kể cả khoảng trắng)`,
    writtenInKorean: "Sẽ viết bằng tiếng Hàn:",
    describeNone: "Không có",
    describeMemo: (text) => `Thẻ lời nhắn · ${text || "(chưa nhập)"}`,
    describeRibbon: (left, right) => `Ruy băng · ${left || "-"} / ${right || "-"}`,
    describeBlackboard: (text) => `Bảng đen · ${text || "(chưa nhập)"}`,
  },

  blackboardPresets: {
    auto: "Để tiệm viết giúp",
    thanks: "“Cảm ơn bố mẹ đã nuôi dạy chúng con. Chúng con sẽ sống thật tốt.”",
    luck: "“Như ý nghĩa của hoa lan hồ điệp, mong may mắn bay đến — chúng con sẽ sống thật hạnh phúc.”",
  },

  payment: {
    legend: "Phương thức thanh toán",
    methods: {
      bank: {
        label: "Chuyển khoản",
        description: "Hoàn tất sau khi nhận tiền",
        complete: "Đơn đặt hoàn tất khi tiệm xác nhận đã nhận tiền.",
      },
      card: {
        label: "Thẻ",
        description: "Báo số thẻ qua điện thoại",
        complete: "Khi tiệm gọi điện, vui lòng cho biết số thẻ và ngày hết hạn. Đơn đặt hoàn tất sau khi thanh toán.",
      },
      paypal: {
        label: "PayPal",
        description: "Nước ngoài · phí 10%",
        complete: "Tiệm sẽ gửi yêu cầu thanh toán PayPal qua email. Đơn đặt hoàn tất sau khi thanh toán.",
      },
    },
    cardGuide: [
      "Sau khi kiểm tra đơn, tiệm sẽ liên hệ với quý khách.",
      "Cho biết số thẻ và ngày hết hạn qua điện thoại, tiệm sẽ thanh toán giúp.",
      "Vui lòng không ghi số thẻ vào đơn này.",
    ],
    cardPayerTitle: "Liên hệ người thanh toán thẻ",
    cardPayerDescription: "Nếu người thanh toán thẻ có số điện thoại khác người đặt, vui lòng nhập bên dưới.",
    cardPayerOptions: { same: "Giống người đặt", other: "Khác người đặt" },
    cardPayerAria: "Tên và số điện thoại người thanh toán thẻ",
    cardPayerPlaceholder: "Tên và SĐT người thanh toán (VD: Kim 010-1234-5678)",
    cashReceiptTitle: "Hóa đơn tiền mặt (Hàn Quốc)",
    cashReceiptOptions: { none: "Không cần", income: "Cá nhân", expense: "Doanh nghiệp" },
    cashReceiptInputs: {
      income: { placeholder: "Số di động 010-0000-0000", title: "Vui lòng kiểm tra số di động. (VD: 010-1234-5678)" },
      expense: { placeholder: "Mã số kinh doanh 000-00-00000", title: "Vui lòng kiểm tra mã số kinh doanh 10 chữ số. (VD: 123-45-67890)" },
    },
    cashReceiptNumberAria: (label) => `Số cho hóa đơn ${label.toLowerCase()}`,
    naverNote: "Nếu thanh toán bằng Naver Pay, vui lòng đặt riêng trên Naver Booking.",
    naverLink: "Đến Naver Booking ›",
    overseasTitle: "Thanh toán từ nước ngoài?",
    overseasBody: "Có thể thanh toán bằng PayPal. Phí 10% được cộng thêm vào tiền sản phẩm và giao hàng.",
    paypalGuide: [
      "Sau khi kiểm tra đơn, tiệm sẽ gửi yêu cầu thanh toán PayPal đến email bên dưới.",
      "Phí PayPal 10% được cộng thêm vào tiền sản phẩm và giao hàng.",
    ],
    paypalProducts: "Tiền sản phẩm",
    paypalFee: (percent) => `Phí ${percent}%`,
    paypalTotal: "Tổng thanh toán PayPal",
    paypalEmail: "Email nhận yêu cầu thanh toán PayPal",
    paypalEmailPlaceholder: "name@example.com",
  },

  bankCard: {
    title: "Tài khoản nhận tiền",
    bank: "Ngân hàng NongHyup (농협)",
    holderNote: (holder) => `${holder} · Sau khi chuyển khoản, vui lòng báo tên người chuyển`,
    copy: "Sao chép",
    copied: "Đã chép ✓",
  },

  documents: {
    toggle: "Tôi cần báo giá · phiếu giao dịch",
    description: "Đánh dấu nếu công ty hoặc cơ quan cần chứng từ. Sau khi gửi đơn, bạn có thể tải ngay tệp PDF ở màn hình hoàn tất.",
    groupAria: "Chứng từ cần",
    options: { quote: "Báo giá", statement: "Phiếu giao dịch" },
    companyAria: "Tên công ty · cơ quan",
    companyPlaceholder: "Tên công ty · cơ quan (bên nhận)",
    businessNumberAria: "Mã số kinh doanh",
    businessNumberPlaceholder: "Mã số kinh doanh (không bắt buộc) 000-00-00000",
    businessNumberTitle: "Vui lòng kiểm tra mã số kinh doanh 10 chữ số. (VD: 123-45-67890)",
    panelTitle: "Chứng từ đã yêu cầu",
    download: (title) => `⬇ Tải ${title} (PDF)`,
    downloading: "Đang tạo tệp…",
    downloadNote: "Nhấn để lưu ngay tệp PDF. Trên điện thoại, hãy tìm trong thư mục Tải xuống (iPhone: ứng dụng Tệp). Vui lòng lưu trước khi đóng trang này.",
    downloadFailed: `Không tải được tệp. Vui lòng thử lại; nếu bạn đang mở trong ứng dụng như KakaoTalk, hãy thử bằng Safari hoặc Chrome. Nếu vẫn không được, vui lòng liên hệ tiệm (${businessInfo.phone}).`,
    tabsAria: "Loại chứng từ",
    koreanOnly: "Chứng từ được lập bằng tiếng Hàn.",
  },

  complete: {
    title: "Đã gửi đơn thành công! 🎉",
    receiptNumber: (no) => `Mã đơn ${no}`,
    orderer: (name, phone) => `Người đặt ${name} · ${phone}`,
    reminder: "Trước giờ hẹn, chúng tôi sẽ gửi tin nhắn nhắc lịch đến số điện thoại của người đặt.",
    paymentMethod: (label) => `Thanh toán · ${label}`,
    cashReceipt: (label, number) => `Hóa đơn tiền mặt · ${label} ${number}`,
    cardPayer: (contact) => `Người thanh toán · ${contact}`,
    cardPayerSame: "Giống người đặt",
    paypal: (amount, email) => `Tổng PayPal ${amount} · gửi yêu cầu đến ${email}`,
    orchidDelivery: (text) => `Lan hồ điệp · ${text}`,
    recipient: (text) => `Người nhận · ${text}`,
    message: (text) => `Lời nhắn · ${text}`,
  },

  share: {
    kakao: "Gửi cho chính mình qua KakaoTalk",
    kakaoHint: "Trong cửa sổ chia sẻ, chọn 'Trò chuyện với chính mình' để lưu vào KakaoTalk của bạn.",
    other: "Sao chép nội dung · gửi bằng ứng dụng khác",
    copied: "Đã sao chép nội dung đặt hàng. Hãy dán vào tin nhắn hoặc ghi chú để lưu lại.",
    failed: "Không gửi được. Vui lòng chụp màn hình trang này.",
    title: (shopName) => `[${shopName}] Đã tiếp nhận đặt hàng`,
    receipt: (no) => `Mã tiếp nhận ${no}`,
    items: (first, others) => (others > 0 ? `${first} và ${others} sản phẩm khác` : first),
    total: (price) => `Tổng ${price}`,
    bank: (bank, number, holder) => `Chuyển khoản: ${bank} ${number} (${holder})`,
    payment: (label) => `Thanh toán: ${label}`,
    lookupButton: "Tra cứu · hủy đặt hàng",
  },

  submitBar: {
    empty: "Vui lòng chọn sản phẩm và ngày giờ",
    submit: "Đặt hoa",
  },

  privacy: {
    consentLabel: "[Bắt buộc] Tôi đồng ý cho thu thập và sử dụng thông tin cá nhân",
    showDetails: "Xem nội dung",
    hideDetails: "Thu gọn",
    items: [
      {
        title: "Thông tin thu thập",
        body: "Tên và số điện thoại người đặt (bắt buộc); tên và số điện thoại người nhận, nội dung lời nhắn, tên và chức vụ trên thẻ cắm thăng chức, nhà hàng giao lan và tên đặt bàn, số hóa đơn tiền mặt, liên hệ người thanh toán thẻ, email nhận yêu cầu PayPal, tên công ty và mã số kinh doanh, tên ngân hàng, số tài khoản và chủ tài khoản nhận hoàn tiền khi hủy sau khi đã thanh toán (nếu có)",
      },
      {
        title: "Mục đích sử dụng",
        body: "Tiếp nhận và liên hệ xác nhận đơn, làm hoa và giao nhận, xác nhận thanh toán, xuất hóa đơn tiền mặt, báo giá và phiếu giao dịch, hoàn tiền khi hủy đơn",
      },
      {
        title: "Thời gian lưu",
        body: "Lưu 1 năm sau khi giao hoa rồi hủy (thông tin cần lưu theo luật sẽ được lưu trong thời gian quy định)",
      },
    ],
    refusal: "Quý khách có thể từ chối, nhưng khi đó không thể đặt hoa trực tuyến. Vui lòng gọi điện hoặc dùng Naver Booking.",
    policyLink: "Xem toàn bộ chính sách bảo mật (tiếng Hàn) ›",
  },

  submit: {
    saving: "Đang lưu đơn…",
    unavailable: `Hiện chưa thể nhận đơn trực tuyến. Vui lòng gọi ${businessInfo.phone} hoặc dùng Naver Booking.`,
    failed: `Không lưu được đơn. Vui lòng thử lại sau hoặc gọi ${businessInfo.phone}.`,
  },

  footer: {
    privacy: "Chính sách bảo mật",
  },

  validation: {
    unreadable: "Không đọc được thông tin đặt hoa.",
    privacy: "Vui lòng đồng ý thu thập và sử dụng thông tin cá nhân.",
    ordererName: "Vui lòng nhập tên người đặt.",
    ordererPhone: "Vui lòng kiểm tra số điện thoại người đặt.",
    unknownProduct: "Có sản phẩm không còn tồn tại. Vui lòng tải lại trang.",
    quantity: "Vui lòng kiểm tra số lượng sản phẩm.",
    duplicateProduct: "Thông tin sản phẩm bị trùng.",
    noItems: "Vui lòng chọn ít nhất 1 sản phẩm.",
    schedule: "Vui lòng chọn ngày và giờ.",
    scheduleClosed: "Không thể đặt giờ đã chọn nữa. Vui lòng chọn lại ngày giờ.",
    deliveries: "Vui lòng kiểm tra thông tin người nhận · lời nhắn.",
    recipientPhone: "Vui lòng kiểm tra số điện thoại người nhận.",
    orchidRestaurant: "Vui lòng nhập tên nhà hàng để giao lan.",
    orchidReservationName: "Vui lòng nhập tên đặt bàn tại nhà hàng.",
    cashReceiptPhone: "Vui lòng kiểm tra số di động cho hóa đơn tiền mặt.",
    cashReceiptBusiness: "Vui lòng kiểm tra mã số kinh doanh cho hóa đơn tiền mặt.",
    cardPayer: "Vui lòng nhập liên hệ người thanh toán thẻ.",
    paypalEmail: "Vui lòng kiểm tra email nhận yêu cầu thanh toán PayPal.",
    documentCompany: "Vui lòng nhập tên công ty · cơ quan cho chứng từ.",
    documentBusinessNumber: "Vui lòng kiểm tra mã số kinh doanh cho chứng từ.",
  },
};
