import {
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  PAYPAL_FEE_RATE,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { storeContact } from "@/data/shop";
import type { StoreInfoMessages } from "./ko";

/** English — 모양은 storeInfo/ko.ts와 같아야 한다 */
const { open, close } = storeContact.staffedHours;
const h12 = (hour: number) => (hour > 12 ? `${hour - 12} PM` : `${hour} AM`);

export const storeInfoEn: StoreInfoMessages = {
  hero: {
    eyebrow: "Flowers for your important day, delivered with care",
    badges: ["24-hour self-service florist · Open every day", "Florist with 12 years' experience", "Delivery in Jeonju & Wanju"],
    book: "Book flowers",
    location: "Find us",
  },

  quick: {
    ariaLabel: "Shop location",
    landmark: "Next to Lotte Fresh Jeonju Hyeoksin",
    hours: "Open 24 hours · Every day",
    call: "Call",
    map: "Map",
    kakao: "KakaoTalk",
  },

  steps: {
    title: "Book in 3 easy steps",
    subtitle: "No sign-up needed. We'll tell you how to pay after you book.",
    items: {
      items: "Pick flowers",
      dateTime: "Date & time",
      reserve: "Name & phone",
    },
  },

  reviews: {
    title: "Customer reviews",
    subtitle: "Messages customers sent us on KakaoTalk (translated from Korean).",
    items: [
      { tag: "Family-meeting orchids", text: "Oh! They're so beautiful. Thank you!" },
      { tag: "Delivery to the Institute", text: "The recipient said they were lovely too. Thank you." },
      { tag: "Corporate event flowers", text: "Wow, they're truly beautiful. Please take good care with the delivery." },
      { tag: "24-hour self pickup", text: "My parents are going to love these! Wishing your shop every success." },
    ],
  },

  store: {
    title: "Visit our shop",
    name: "Saesoon Flower, Jeonju Innovation City",
    addressLabel: "Address",
    landmark: "Next to Lotte Fresh Jeonju Hyeoksin",
    copyAddress: "Copy address",
    copied: "Copied",
    hoursLabel: "Hours",
    hours: "Open 24 hours, every day (including public holidays)",
    staffLabel: "Staffed hours",
    staff: `Mon–Fri ${h12(open)} – ${h12(close)} (may vary)`,
    buyLabel: "In store",
    buy: "Buy displayed flowers right away · Pick up booked flowers any time, 24/7",
    payLabel: "Payment",
    pay: "Card, KakaoPay, bank transfer or Onnuri gift certificates at the kiosk (earn points)",
    phoneLabel: "Phone",
    basketNote: "Flower baskets aren't always on display, so please book ahead.",
    naverMap: "Open in Naver Map",
    call: "Call us",
    kakao: "Chat on KakaoTalk",
    instagram: "Instagram",
    blog: "Naver Blog",
    coupang: "Same-day order on Coupang Eats",
    coupangNote: "Subject to stock",
  },

  delivery: {
    title: "Free delivery",
    subtitle: "Choose delivery under 'How to receive' in the form.",
    otherArea: "For Wanju and outer areas, please ask us. If there's a delivery fee, we'll text the booker's phone number.",
  },

  faq: {
    title: "FAQ",
    items: [
      {
        q: "Will it look exactly like the photo?",
        a: "Photos are for reference. The flowers may vary a little with the season and what comes in that day, but we make it carefully to match your budget and colour choice.",
      },
      {
        q: "How far ahead should I book?",
        a: `We recommend booking 3 days ahead. Same-day orders are possible up to ${SAME_DAY_LEAD_HOURS} hours before pickup/delivery. After ${h12(ORDER_CLOSE_HOUR)}, times until ${h12(ORDER_OPEN_HOUR)} the next day can't be booked.`,
      },
      {
        q: "How do I check or cancel my booking?",
        a: "Tap [My booking] at the top and enter the name and phone number you booked with. For changes, please call or message us on KakaoTalk by the day before.",
      },
      {
        q: "Do you deliver?",
        a: "Yes. Choose delivery under 'How to receive' and enter the address. It's free if it meets the free-delivery rules below.",
      },
      {
        q: "Can you deliver orchids to a family-meeting restaurant?",
        a: "Yes, free delivery to Jeonju restaurants such as Honamgak, Gung and Gogungdam. Other restaurants are fine too — just write them in the form.",
      },
      {
        q: "Can I add chocolates?",
        a: "Yes. Add them in 'Add chocolates' right below the flowers.",
      },
      {
        q: "Can I pay from overseas?",
        a: `Yes, with PayPal. A ${Math.round(PAYPAL_FEE_RATE * 100)}% payment fee is added.`,
      },
      {
        q: "Can I buy without booking?",
        a: "Yes, displayed flowers can be bought any time at our 24-hour self-service shop. Same-day delivery is also available on Coupang Eats (subject to stock).",
      },
    ],
  },

  bottomCta: {
    title: "Found flowers you like?",
    button: "Choose flowers",
  },
};
