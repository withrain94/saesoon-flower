import {
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  PAYPAL_FEE_RATE,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { storeContact } from "@/data/shop";
import type { StoreInfoMessages } from "./ko";

/** Tiếng Việt — 모양은 storeInfo/ko.ts와 같아야 한다 */
const { open, close } = storeContact.staffedHours;
const h12 = (hour: number) => (hour > 12 ? `${hour - 12} giờ chiều` : `${hour} giờ sáng`);

export const storeInfoVi: StoreInfoMessages = {
  hero: {
    eyebrow: "Hoa cho ngày quan trọng, gửi trọn cả tấm lòng",
    badges: ["Tiệm hoa tự phục vụ 24 giờ · Mở cả năm", "Thợ cắm hoa 12 năm kinh nghiệm", "Giao hoa Jeonju · Wanju"],
    book: "Đặt hoa",
    location: "Vị trí tiệm",
  },

  quick: {
    ariaLabel: "Vị trí tiệm",
    landmark: "Cạnh Lotte Fresh Jeonju Hyeoksin",
    hours: "Mở 24 giờ · Cả năm",
    call: "Gọi",
    map: "Bản đồ",
    kakao: "KakaoTalk",
  },

  steps: {
    title: "Đặt hoa chỉ với 3 bước",
    subtitle: "Không cần đăng ký. Chúng tôi sẽ hướng dẫn thanh toán sau khi bạn đặt.",
    items: {
      items: "Chọn hoa",
      dateTime: "Ngày · giờ",
      reserve: "Tên · SĐT",
    },
  },

  reviews: {
    title: "Đánh giá của khách",
    subtitle: "Lời nhắn khách gửi qua KakaoTalk sau khi nhận hoa (dịch từ tiếng Hàn).",
    items: [
      { tag: "Lan hồ điệp ra mắt gia đình", text: "Ôi! Đẹp quá. Cảm ơn ạ!" },
      { tag: "Giao đến Học viện", text: "Người nhận cũng nói hoa rất đẹp. Cảm ơn ạ." },
      { tag: "Hoa sự kiện công ty", text: "Wow, thật sự rất đẹp. Nhờ tiệm giao cẩn thận giúp nhé." },
      { tag: "Tự nhận hoa 24 giờ", text: "Bố mẹ chắc sẽ thích lắm! Chúc tiệm buôn bán phát đạt." },
    ],
  },

  store: {
    title: "Thông tin cửa hàng",
    name: "Tiệm hoa Saesoon, Jeonju Innovation City",
    addressLabel: "Địa chỉ",
    landmark: "Cạnh Lotte Fresh Jeonju Hyeoksin",
    copyAddress: "Sao chép địa chỉ",
    copied: "Đã sao chép",
    hoursLabel: "Giờ mở cửa",
    hours: "24 giờ · Mở cả năm (kể cả ngày lễ, Tết)",
    staffLabel: "Có nhân viên",
    staff: `Thứ 2–6, ${h12(open)} – ${h12(close)} (có thể thay đổi)`,
    buyLabel: "Tại tiệm",
    buy: "Mua ngay hoa trưng bày · Nhận hoa đã đặt bất cứ lúc nào, 24/7",
    payLabel: "Thanh toán",
    pay: "Tại kiosk: thẻ, KakaoPay, chuyển khoản, phiếu Onnuri (tích điểm)",
    phoneLabel: "Điện thoại",
    basketNote: "Giỏ hoa không phải lúc nào cũng trưng bày nên cần đặt trước.",
    naverMap: "Xem trên Naver Map",
    call: "Gọi điện",
    kakao: "Tư vấn KakaoTalk",
    instagram: "Instagram",
    blog: "Naver Blog",
    coupang: "Đặt trong ngày qua Coupang Eats",
    coupangNote: "Tùy hàng có sẵn",
  },

  delivery: {
    title: "Điều kiện miễn phí giao hàng",
    subtitle: "Chọn giao hàng ở mục 'Cách nhận hoa' trong đơn.",
    otherArea: "Wanju và khu vực ngoại ô vui lòng liên hệ riêng. Nếu có phí giao hàng, chúng tôi sẽ nhắn tin đến số của người đặt.",
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Hoa có giống hệt ảnh không?",
        a: "Ảnh chỉ để tham khảo. Hoa có thể khác một chút theo mùa và hoa nhập trong ngày, nhưng chúng tôi luôn làm cẩn thận theo mức giá và tông màu bạn chọn.",
      },
      {
        q: "Nên đặt trước bao lâu?",
        a: `Nên đặt trước 3 ngày. Đặt trong ngày được nhận đến ${SAME_DAY_LEAD_HOURS} tiếng trước giờ nhận. Sau ${h12(ORDER_CLOSE_HOUR)}, không thể đặt các giờ đến ${h12(ORDER_OPEN_HOUR)} hôm sau.`,
      },
      {
        q: "Làm sao để kiểm tra hoặc hủy đặt hoa?",
        a: "Bấm [Tra cứu đơn] ở trên cùng, nhập tên và số điện thoại người đặt để xem và hủy. Muốn thay đổi, vui lòng gọi hoặc nhắn KakaoTalk trước ngày nhận một ngày.",
      },
      {
        q: "Có giao hàng không?",
        a: "Có. Chọn giao hàng ở mục 'Cách nhận hoa' và nhập địa chỉ. Đủ điều kiện bên dưới thì được miễn phí.",
      },
      {
        q: "Có giao lan hồ điệp đến nhà hàng ra mắt gia đình không?",
        a: "Có, miễn phí giao đến các nhà hàng ở Jeonju như Honamgak, Gung, Gogungdam. Nhà hàng khác cũng được, chỉ cần ghi vào đơn.",
      },
      {
        q: "Có thể gửi kèm sô-cô-la không?",
        a: "Có. Chọn ở mục 'Thêm sô-cô-la' ngay dưới phần chọn hoa.",
      },
      {
        q: "Có thể thanh toán từ nước ngoài không?",
        a: `Có, qua PayPal. Cộng thêm ${Math.round(PAYPAL_FEE_RATE * 100)}% phí thanh toán.`,
      },
      {
        q: "Có thể mua không cần đặt trước không?",
        a: "Có, hoa trưng bày ở tiệm tự phục vụ 24 giờ có thể mua bất cứ lúc nào. Giao trong ngày cũng có thể đặt qua Coupang Eats (tùy hàng có sẵn).",
      },
    ],
  },

  bottomCta: {
    title: "Bạn đã tìm được hoa ưng ý chưa?",
    button: "Đi chọn hoa",
  },
};
