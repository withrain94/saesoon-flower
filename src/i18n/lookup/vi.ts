import { businessInfo } from "@/data/shop";
import type { LookupMessages } from "./ko";

/** Tiếng Việt — 모양은 lookup/ko.ts와 같아야 한다 */
export const lookupVi: LookupMessages = {
  pageTitle: "Tra cứu đặt hàng",
  intro: "Nhập tên và số điện thoại người đặt đã điền khi đặt hàng để xem nội dung đặt hàng.",
  receiptLabel: "Mã tiếp nhận",
  nameLabel: "Tên người đặt",
  namePlaceholder: "Tên đã nhập khi đặt",
  phoneLabel: "Số điện thoại người đặt",
  phonePlaceholder: "Số điện thoại đã nhập khi đặt",
  submit: "Tra cứu",
  searching: "Đang tìm…",
  backToReservation: "‹ Về trang đặt hàng",
  lookupLink: "Tra cứu · hủy đặt hàng",
  completeLookup: "Mở trang tra cứu · hủy đặt hàng",
  completeLookupNote: "Bạn có thể kiểm tra lại bất cứ lúc nào bằng tên và số điện thoại.",
  otherReservation: "Tra cứu đơn khác",
  resultsTitle: (count) => `Tìm thấy ${count} đơn đặt hàng`,
  resultsHint: "Chạm vào đơn muốn xem hoặc hủy.",
  backToList: "‹ Quay lại danh sách",

  errors: {
    notFound: "Không tìm thấy đơn khớp với tên và số điện thoại. Vui lòng nhập đúng như khi đặt hàng.",
    unavailable: `Hiện không thể tra cứu trực tuyến. Vui lòng gọi điện (+82 ${businessInfo.phone.slice(1)}).`,
    notCancelable: `Ở trạng thái hiện tại không thể hủy trực tuyến. Vui lòng gọi điện (+82 ${businessInfo.phone.slice(1)}).`,
    invalidRefund: "Vui lòng nhập đầy đủ và chính xác tên ngân hàng, số tài khoản và chủ tài khoản nhận hoàn tiền.",
    failed: `Không xử lý được. Vui lòng thử lại sau hoặc gọi điện (+82 ${businessInfo.phone.slice(1)}).`,
  },

  status: {
    received: "Đã tiếp nhận · chưa xác nhận thanh toán",
    confirmed: "Đã xác nhận thanh toán",
    made: "Đã làm xong",
    delivered: "Đã giao",
    canceled: "Đã hủy",
  },
  cancelRequested: "Đã nhận yêu cầu hủy · cửa hàng đang kiểm tra",

  sections: {
    schedule: "Ngày · giờ nhận",
    items: "Sản phẩm",
    total: (quantity) => `Tổng ${quantity} sản phẩm`,
    deliveries: "Người nhận · lời nhắn",
    payment: "Thanh toán",
  },

  cancel: {
    title: "Hủy đặt hàng",
    open: "Hủy đơn này",
    close: "Không hủy",
    /** 결제 방법별로 묻기 (입금 전 예약) */
    paidQuestion: { bank: "Bạn đã chuyển khoản chưa?", card: "Bạn đã thanh toán bằng thẻ chưa?", paypal: "Bạn đã thanh toán bằng PayPal chưa?" },
    notPaid: { bank: "Chưa chuyển khoản", card: "Chưa thanh toán bằng thẻ", paypal: "Chưa thanh toán bằng PayPal" },
    paid: { bank: "Đã chuyển khoản rồi", card: "Đã thanh toán bằng thẻ rồi", paypal: "Đã thanh toán bằng PayPal rồi" },
    notPaidHint: "Đơn sẽ được hủy ngay.",
    paidHint: "Yêu cầu hủy sẽ được tiếp nhận, cửa hàng kiểm tra rồi hoàn tiền cho bạn.",
    /** 입금·결제 확인된 예약 — 묻지 않고 안내만 */
    confirmedNote: { bank: "Cửa hàng đã xác nhận chuyển khoản của bạn, nên sẽ được tiếp nhận là yêu cầu hủy.", card: "Cửa hàng đã xác nhận thanh toán thẻ của bạn, nên sẽ được tiếp nhận là yêu cầu hủy.", paypal: "Cửa hàng đã xác nhận thanh toán PayPal của bạn, nên sẽ được tiếp nhận là yêu cầu hủy." },
    refundTitle: "Tài khoản nhận hoàn tiền",
    refundBank: "Tên ngân hàng",
    refundBankPlaceholder: "Ví dụ: NH, KB Kookmin",
    refundAccount: "Số tài khoản",
    refundAccountPlaceholder: "Chỉ số hoặc có dấu -",
    refundHolder: "Chủ tài khoản",
    refundHolderPlaceholder: "Tên ghi trên sổ tài khoản",
    refundWarning: "Nếu tên hoặc tài khoản khác với người đã thực sự chuyển khoản, việc hoàn tiền có thể gặp khó khăn.",
    refundPrivacy: "Chúng tôi thu thập tên ngân hàng, số tài khoản và chủ tài khoản chỉ để hoàn tiền, và hủy theo chính sách bảo mật.",
    cardRefund: "Với thanh toán thẻ, cửa hàng sẽ hủy giao dịch cho bạn.",
    paypalRefund: "Với thanh toán PayPal, chúng tôi sẽ hoàn tiền qua PayPal.",
    submitCancel: "Hủy đặt hàng",
    submitRequest: "Gửi yêu cầu hủy",
    sending: "Đang gửi…",
    canceledDone: "Đơn đặt hàng đã được hủy.",
    requestedDone: "Đã gửi yêu cầu hủy. Cửa hàng sẽ kiểm tra và hoàn tiền cho bạn.",
    requestedInfo: "Chúng tôi đã nhận yêu cầu hủy. Cửa hàng sẽ kiểm tra và hoàn tiền cho bạn.",
    callInfo: "Hoa đã bắt đầu được làm nên không thể hủy trực tuyến. Vui lòng gọi điện.",
    call: `Gọi +82 ${businessInfo.phone.slice(1)}`,
  },
};
