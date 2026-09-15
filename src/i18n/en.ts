import {
  BLACKBOARD_MAX_LENGTH,
  ORDER_CLOSE_HOUR,
  ORDER_OPEN_HOUR,
  RIBBON_MAX_LENGTH,
  SAME_DAY_LEAD_HOURS,
} from "@/data/reservationOptions";
import { businessInfo } from "@/data/shop";
import type { Messages } from "./ko";

/** English — 모양은 ko.ts와 같아야 한다 */

const hour12 = (hour: number) => (hour % 12 === 0 ? 12 : hour % 12);
const ampm = (hour: number) => (hour < 12 ? "AM" : "PM");
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekdaysLong = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthsLong = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const en: Messages = {
  htmlLang: "en",

  format: {
    price: (price) => `₩${price.toLocaleString("en-US")}`,
    priceShort: (price) => `₩${price.toLocaleString("en-US")}`,
    weekdays,
    dateShort: (month, day, weekday) => `${weekdays[weekday]}, ${months[month - 1]} ${day}`,
    dateLong: (month, day, weekday) => `${weekdaysLong[weekday]}, ${monthsLong[month - 1]} ${day}`,
    time: (hour) => `${hour > 12 ? hour - 12 : hour}:00 ${ampm(hour)}`,
    slotShort: (hour) => `${hour > 12 ? hour - 12 : hour}:00`,
    morning: "Morning",
    afternoon: "Afternoon & evening",
    deadline: (dateLong, hour, minute) =>
      `${hour12(hour)}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${ampm(hour)} on ${dateLong}`,
    itemName: (categoryName, priceLabel) => `${categoryName} ${priceLabel}`,
    unitName: (itemName, unitNo, quantity) => `${itemName} (${unitNo}/${quantity})`,
    listSeparator: " · ",
  },

  common: {
    optional: "Optional",
    close: "Close",
  },

  shop: {
    name: "Saesoon Jeonju Innovation City",
    tagline: "A 24-hour self-service flower shop — reservations, custom orders and unattended pickup.",
  },

  header: {
    siteLink: "About Saesoon ›",
    language: "Language",
  },

  hero: {
    title: (categoryNames) => `Reserve ${categoryNames}`,
    imageAlt: "Saesoon flower bouquet",
  },

  categories: {
    bouquet: { name: "Bouquet", tagline: "A gift to hand over in person" },
    basket: { name: "Flower basket", tagline: "A gift to display and enjoy longer" },
    orchid: {
      name: "Phalaenopsis orchid",
      tagline: "Bojagi-wrapped gift for meeting the families",
      popularNote: "Set of 2 · one for each family",
      notice: {
        summary: [
          "The orchid variety can't be chosen — it changes every season.",
          "We prepare them in white.",
          "A certified bojagi (Korean wrapping cloth) artist picks the wrapping color to suit the orchids and wraps them by hand.",
        ],
        full: [
          "!We kindly ask for your understanding that the variety cannot be specified!",
          "Phalaenopsis orchids\narrive in different varieties every season,",
          "and even in the same color,\nthe leaves, the number of buds and the tone differ slightly.",
          "That's why we aim to send\nnot identical, factory-made flowers,\nbut orchids that are unique\nto you as a couple.",
          "However! The color can be fixed to white.",
          "If you request white orchids,\nwhich give a clear and graceful impression like a bride,\nwe will carefully prepare\nthe finest-quality orchids to match.",
          "At Saesoon,\na florist who is also\na certified 1st-grade bojagi art expert\nwraps the flowers by hand.",
          "The bojagi color is chosen\nconsidering\n- the tone of the white orchids\n- the length of the flower stalks\n- the spread of the leaves,\nso each time we prepare\nthe wrapping cloth color that suits them best.",
        ],
      },
    },
  },

  products: {
    "bouquet-50000": {
      title: "TOP 3) Small but pretty",
      points: [
        "Small is fine, as long as it's mostly pretty main flowers.",
        "I want to give a gift in a size that isn't overwhelming.",
        "I want something easy to carry.",
      ],
    },
    "bouquet-60000": {
      title: "BEST) A proper bouquet",
      points: [
        "It doesn't need to be huge, but I want a bouquet that makes them happy.",
        "I want to remember our anniversary beautifully.",
        "Please make it in the best-selling size.",
      ],
    },
    "bouquet-70000": {
      title: "[Quality first] Quality over size",
      points: [
        "The best-selling size with extra pretty flowers, please.",
        "Quality matters more than size.",
        "I'd rather it not be too small.",
      ],
    },
    "bouquet-80000": {
      title: "TOP 5) A little fuller",
      points: [
        "I'd like it to look full and lush.",
        "I want them to feel good when they receive it.",
        "I want to put in more thought than last time.",
      ],
    },
    "bouquet-90000": {
      title: "[Anniversary] Pretty and full",
      points: [
        "I want it full of pretty flowers.",
        "I'd like to add more main flowers.",
        "I want to give them an armful of flowers.",
      ],
    },
    "bouquet-100000": {
      title: "TOP 2) It's an important day",
      points: [
        "I want to truly move them on our anniversary.",
        "It's for a proposal.",
        "Please focus on quality rather than size.",
      ],
    },
    "bouquet-150000": {
      title: "TOP 4) Large bouquet",
      points: [
        "I want a size that makes people say “wow”.",
        "Pretty flowers, but with an even fuller feel.",
        "It's something I want to try at least once.",
      ],
    },
    "bouquet-200000": {
      title: "[For events] Extra-large bouquet",
      points: ["Make it as big as possible.", "I want an extra-large bouquet."],
    },
    "bouquet-300000": {
      title: "[Premium] Special armful bouquet",
      points: [
        "A special bouquet made with wedding flowers, the finest of all! (Seasonal flowers are used)",
        "It may be hard to make on short notice, so we recommend booking in advance.",
        "I want a big, special bouquet no matter what.",
        "I'm planning to propose.",
      ],
    },
    "basket-70000": {
      title: "[Everyday gift] Basic flower basket",
      points: ["A nice size for a pretty, casual gift", "Great for housewarmings, small gifts and congratulations"],
    },
    "basket-80000": {
      title: "TOP 2) Fuller basic basket",
      points: ["A basic basket made fuller, or in a special color palette"],
    },
    "basket-100000": {
      title: "BEST) Event flower basket",
      points: [
        "A popular size for anniversary gifts and events",
        "The most popular size for birthdays, partners and parents",
        "Proportions that look great in photos",
      ],
    },
    "basket-150000": {
      title: "TOP 3) Fuller event basket",
      points: [
        "An event basket made fuller, or in a special color palette",
        "The ideal fullness for events, exhibitions and celebrations",
      ],
    },
    "basket-200000": {
      title: "[For events] Large flower basket",
      points: ["A size that stands out at venues, exhibitions and openings", "A style that catches the eye from afar"],
    },
    "basket-300000": {
      title: "[Premium] Fuller large flower basket",
      points: [
        "A large basket, generously filled",
        "Noticeably more flowers than the large basket",
        "An impressive size for photos and events",
      ],
    },
    "orchid-120000": {
      title: "Bojagi-wrapped orchids for meeting the families (set of 2)",
      points: [
        "Graceful white phalaenopsis + bojagi colors (such as pink and blue for the bride and groom) chosen by our designer",
        "A set of 2, so each family receives one",
        "Free delivery to Jeonju family-meeting restaurants such as Honamgak, Gung and Gogungdam",
        "Double wrapping, so it can be kept wrapped and cared for after gifting",
      ],
    },
  },

  events: {
    institutePromotion: {
      calendarLabel: "Promo",
      shortTitle: (term) => `Class ${term} promotion ceremony`,
      title: (term) => `Local Government Officials Development Institute — Class ${term} Promotion Ceremony`,
      highlights: [
        "Officials gather in Wanju from all over the country and many travel far, so flower baskets are especially popular.",
        "A free promotion topper is included.",
        "Please choose a pickup time of 8 AM or 9 AM.",
      ],
    },
  },

  eventBanner: {
    ariaLabel: "Special day reservations",
    book: (categoryName) => `Reserve ${categoryName.toLowerCase()}`,
    later: "Upcoming",
    bookShort: "Reserve",
    deadline: (deadline) => `Please reserve by ${deadline}.`,
  },

  categoryEntry: {
    ariaLabel: "Product types",
    title: "What would you like to reserve?",
    subtitle: "You can add several items and reserve them all at once.",
    photoAlt: (name) => `${name} example photo`,
    count: (count) => `${count} added`,
    startingFrom: (price) => `From ${price}`,
  },

  naverOnly: {
    plant: { title: "Reserve opening · promotion · congratulations plants", description: "Available via Naver Booking only" },
  },

  naverBanner: {
    ariaLabel: "Naver Booking",
    title: "Paying with Naver Pay?",
    description: "Book directly on Naver Booking — no form needed.",
    linkAria: (name) => `${name} on Naver Booking`,
  },

  sectionTabs: {
    items: "Flowers",
    dateTime: "Date & time",
    reserve: "Request",
  },

  productSection: {
    heading: "Choose your flowers",
    subtitle: (categoryNames) => `Add ${categoryNames} together and reserve them all at once.`,
    error: "Please add at least one item.",
    tabsAria: "Product types",
    listAria: (name) => `${name} list`,
    sortPrice: "By price",
    sortRank: "Popular",
    popular: (labels) => `Most popular: ${labels}`,
    photoNote: "* We can't recreate the photos exactly. Please use them as a guide for color and size.",
    moreSite: (name) => `📷 More ${name.toLowerCase()} photos & details`,
    moreSiteSub: "See real examples on the Saesoon website",
    nextCategory: (name) => `See ${name.toLowerCase()}s too`,
  },

  notice: {
    title: "Please read before ordering!",
    showFull: "Read the full note",
    hideFull: "Hide the full note",
  },

  productOption: {
    photoToggle: (name, open) => `${open ? "Hide" : "Show"} ${name} photos`,
    coverAlt: (name) => `${name} main photo`,
    photoCount: (count) => `${count} photos`,
    photoAlt: (name, index) => `${name} real photo ${index}`,
    morePhotos: "More photos",
    morePhotosSub: "Go to the Saesoon website",
    quantity: (name) => `${name} quantity`,
    decrease: (name) => `Remove one ${name}`,
    increase: (name) => `Add one ${name}`,
  },

  dateTime: {
    headingDate: "Date",
    headingTime: "Choose a time",
    sameDayRule: `Same-day orders must be placed at least ${SAME_DAY_LEAD_HOURS} hours before pickup.`,
    closeRule: `After ${ORDER_CLOSE_HOUR - 12} PM, times up to ${ORDER_OPEN_HOUR} AM the next day can't be booked.`,
    errorDate: "Please choose a date.",
    errorTime: "Please choose a time.",
    eventQuick: "Special days",
    pickDateFirst: "Choose a date first to see available times.",
    eventSlots: (shortTitle) => `${shortTitle} times`,
    prevMonth: "Previous month",
    nextMonth: "Next month",
    today: "Today",
    dayAria: (month, day, label, isToday) =>
      `${monthsLong[month - 1]} ${day}${label ? `, ${label}` : ""}${isToday ? ", today" : ""}`,
  },

  reserve: {
    heading: "Enter your reservation details",
    ordererName: "Your name",
    ordererNamePlaceholder: "Please enter your name",
    ordererPhone: "Your phone number",
    phonePlaceholder: "010-0000-0000 or +1 000 000 0000",
    phoneTitle: "Please check the phone number. (e.g. 010-1234-5678 or +1 415 555 0100)",
  },

  summary: {
    items: "Items",
    itemsEmpty: "Please add items to reserve",
    schedule: "Date & time",
    scheduleEmpty: "Please choose a date and time",
    total: (count) => `${count} item${count === 1 ? "" : "s"} in total`,
  },

  color: {
    label: "Preferred colors",
    options: {
      auto: "Up to the florist",
      bright: "Bright and vivid",
      anniversary: "Suited to an anniversary",
      pink: "Pink tones",
      warm: "Warm tones",
      soft: "Soft, subtle tones",
      other: "Other",
    },
    otherAria: "Describe your preferred colors",
    otherPlaceholder: "Describe the colors you'd like",
  },

  orchidDelivery: {
    title: "How to receive the orchids",
    methods: {
      pickup: { label: "Pick up at the shop", description: "Saesoon Jeonju Innovation City" },
      restaurant: { label: "Deliver to the restaurant", description: "Free delivery in Jeonju" },
    },
    restaurant: "Restaurant",
    restaurantOther: "Other (type the name)",
    restaurantOtherPlaceholder: "Restaurant name",
    reservationName: "Name on the restaurant reservation",
    reservationNamePlaceholder: "Name the table is booked under",
    timeNote: "We'll deliver so the orchids arrive at the restaurant at the date and time you chose.",
    describePickup: "Pick up at the shop",
    describeRestaurant: (restaurant, reservationName) =>
      `Deliver to ${restaurant} · booked under ${reservationName}`,
  },

  restaurants: {
    호남각: "Honamgak (호남각)",
    궁: "Gung (궁)",
    고궁담: "Gogungdam (고궁담)",
  },

  recipient: {
    title: "Recipient & message",
    guide: "Bouquets come with a printed message card, baskets with ribbon lettering or a small blackboard, and orchids with a blackboard.",
    empty: "Add items to enter recipients and messages.",
    bulkAria: "Change all recipients and messages at once",
    allSame: "All the same",
    allSameDescription: "Enter recipient & message once",
    allSeparate: "Each separately",
    allSeparateDescription: "Enter them for each item",
    mixed: "Some items are set separately. Tap a button to apply to all items.",
    recipientTitle: "Recipient",
    sameRecipient: "Same as previous item",
    nameAria: "Recipient name",
    namePlaceholder: "Recipient name (if someone else picks up or for delivery)",
    phoneAria: "Recipient phone number",
    phonePlaceholder: "Recipient phone 010-0000-0000",
    messageTitle: "Message",
    sameMessage: (categoryName) => `Same message as previous ${categoryName.toLowerCase()}`,
    describeEmpty: "Not entered (you'll pick it up)",
  },

  topper: {
    title: "🎓 Promotion topper (free)",
    description: "Enter the name and job title for the topper. If left blank, the shop will contact you.",
    nameAria: "Name for the topper",
    namePlaceholder: "Name (e.g. Hong Gil-dong)",
    rankAria: "Job title for the topper",
    rankPlaceholder: "Title (e.g. 사무관)",
    describe: (name, rank) =>
      `Topper · ${[name, rank].filter(Boolean).join(" ") || "Not entered (the shop will contact you)"}`,
  },

  message: {
    typeAria: "Message type",
    types: {
      none: "None",
      memo: "Printed message card",
      ribbon: `Ribbon lettering (two sides, about ${RIBBON_MAX_LENGTH} characters each)`,
      blackboard: `Small blackboard (up to ${BLACKBOARD_MAX_LENGTH} characters incl. spaces)`,
    },
    memoAria: "Message card text",
    memoPlaceholder: "Text to print on the message card",
    ribbonLeftAria: "Ribbon text, one side",
    ribbonLeftPlaceholder: `One side (about ${RIBBON_MAX_LENGTH} characters)`,
    ribbonRightAria: "Ribbon text, other side",
    ribbonRightPlaceholder: `Other side (about ${RIBBON_MAX_LENGTH} characters)`,
    presetsAria: "Blackboard message",
    custom: "Write my own",
    customAria: "Write your own blackboard message",
    customPlaceholder: `Write your blackboard message (up to ${BLACKBOARD_MAX_LENGTH} characters incl. spaces)`,
    writtenInKorean: "Written in Korean:",
    describeNone: "None",
    describeMemo: (text) => `Message card · ${text || "(no text)"}`,
    describeRibbon: (left, right) => `Ribbon · ${left || "-"} / ${right || "-"}`,
    describeBlackboard: (text) => `Blackboard · ${text || "(no text)"}`,
  },

  blackboardPresets: {
    auto: "Leave it to the shop",
    thanks: "“Thank you for raising us. We will live well.”",
    luck: "“Like the orchid's flower language, may good fortune fly to you — we will live happily.”",
  },

  payment: {
    legend: "Payment method",
    methods: {
      bank: {
        label: "Bank transfer",
        description: "Confirmed after deposit",
        complete: "Your reservation is complete once the deposit is confirmed.",
      },
      card: {
        label: "Card",
        description: "Card number by phone",
        complete: "When the shop calls you, please tell us your card number and expiry date. Your reservation is complete once payment is made.",
      },
      paypal: {
        label: "PayPal",
        description: "Overseas · 10% fee",
        complete: "The shop will email you a PayPal payment request. Your reservation is complete once payment is made.",
      },
    },
    cardGuide: [
      "The shop will contact you after checking your reservation.",
      "Tell us your card number and expiry date over the phone and we'll process the payment.",
      "Please do not write your card number in this form.",
    ],
    cardPayerTitle: "Card payer's contact",
    cardPayerDescription: "If the person paying by card has a different number from yours, please enter it below.",
    cardPayerOptions: { same: "Same as the person reserving", other: "Someone else" },
    cardPayerAria: "Card payer's name and phone number",
    cardPayerPlaceholder: "Payer's name and phone (e.g. Kim 010-1234-5678)",
    cashReceiptTitle: "Cash receipt (Korea)",
    cashReceiptOptions: { none: "Not needed", income: "Personal", expense: "Business" },
    cashReceiptInputs: {
      income: { placeholder: "Mobile number 010-0000-0000", title: "Please check the mobile number. (e.g. 010-1234-5678)" },
      expense: { placeholder: "Business registration no. 000-00-00000", title: "Please check the 10-digit business registration number. (e.g. 123-45-67890)" },
    },
    cashReceiptNumberAria: (label) => `${label} cash receipt number`,
    naverNote: "To pay with Naver Pay, please book separately on Naver Booking.",
    naverLink: "Go to Naver Booking ›",
    overseasTitle: "Paying from overseas?",
    overseasBody: "You can pay with PayPal. A 10% fee is added to the product and delivery amount.",
    paypalGuide: [
      "After checking your reservation, the shop will send a PayPal payment request to the email below.",
      "A 10% PayPal fee is added to the product and delivery amount.",
    ],
    paypalProducts: "Products",
    paypalFee: (percent) => `${percent}% fee`,
    paypalTotal: "PayPal total",
    paypalEmail: "Email for the PayPal payment request",
    paypalEmailPlaceholder: "name@example.com",
  },

  bankCard: {
    title: "Bank account",
    bank: "NongHyup Bank (농협)",
    holderNote: (holder) => `${holder} · Please tell us the depositor's name after transferring`,
    copy: "Copy",
    copied: "Copied ✓",
  },

  documents: {
    toggle: "I need a quote / transaction statement",
    description: "Check this if your company or organization needs supporting documents. After submitting, you can download the PDF files right away on the completion screen.",
    groupAria: "Documents needed",
    options: { quote: "Quote", statement: "Transaction statement" },
    companyAria: "Company or organization name",
    companyPlaceholder: "Company / organization name (recipient)",
    businessNumberAria: "Business registration number",
    businessNumberPlaceholder: "Business registration no. (optional) 000-00-00000",
    businessNumberTitle: "Please check the 10-digit business registration number. (e.g. 123-45-67890)",
    panelTitle: "Requested documents",
    download: (title) => `⬇ Download ${title} (PDF)`,
    downloading: "Preparing file…",
    downloadNote: "Tap to save the PDF file. On a phone, look in your Downloads folder (Files app on iPhone). Please save it before closing this page.",
    downloadFailed: `The file could not be downloaded. Please try again; if you opened this inside an app such as KakaoTalk, try Safari or Chrome. If it still fails, please contact the shop (${businessInfo.phone}).`,
    tabsAria: "Document type",
    koreanOnly: "Documents are issued in Korean.",
  },

  complete: {
    title: "Your request has been submitted! 🎉",
    receiptNumber: (no) => `Request no. ${no}`,
    orderer: (name, phone) => `Reserved by ${name} · ${phone}`,
    reminder: "We will text a reminder to the contact number above before your reservation time.",
    paymentMethod: (label) => `Payment · ${label}`,
    cashReceipt: (label, number) => `Cash receipt · ${label} ${number}`,
    cardPayer: (contact) => `Card payer · ${contact}`,
    cardPayerSame: "Same as the person reserving",
    paypal: (amount, email) => `PayPal total ${amount} · request sent to ${email}`,
    orchidDelivery: (text) => `Orchids · ${text}`,
    recipient: (text) => `Recipient · ${text}`,
    message: (text) => `Message · ${text}`,
  },

  share: {
    kakao: "Send to myself on KakaoTalk",
    kakaoHint: "In the share window, choose 'Chat with myself' to keep it in your KakaoTalk.",
    other: "Copy details or share with another app",
    copied: "Reservation details copied. Paste them into a chat or note to keep them.",
    failed: "Couldn't share. Please take a screenshot of this screen.",
    title: (shopName) => `[${shopName}] Reservation received`,
    receipt: (no) => `Reservation no. ${no}`,
    items: (first, others) => (others > 0 ? `${first} and ${others} more` : first),
    total: (price) => `Total ${price}`,
    bank: (bank, number, holder) => `Bank transfer: ${bank} ${number} (${holder})`,
    payment: (label) => `Payment: ${label}`,
    lookupButton: "Check or cancel",
  },

  submitBar: {
    empty: "Please choose items, a date and a time",
    submit: "Reserve",
  },

  privacy: {
    consentLabel: "[Required] I agree to the collection and use of my personal information",
    showDetails: "Details",
    hideDetails: "Hide",
    items: [
      {
        title: "Information collected",
        body: "Your name and phone number (required); recipient names and phone numbers, message text, promotion topper names and titles, orchid delivery restaurant and booking name, cash receipt number, card payer's contact, PayPal request email, company name and business number for documents, and your refund bank name, account number and holder if you cancel after paying (where applicable)",
      },
      {
        title: "Purpose",
        body: "Receiving and confirming reservations, making and handing over or delivering products, confirming payment, issuing cash receipts, quotes and statements, and refunds for canceled reservations",
      },
      {
        title: "Retention",
        body: "Kept for 1 year after the products are handed over, then destroyed (information that must be kept by law is kept for the required period)",
      },
    ],
    refusal: "You may refuse, but then we can't take your reservation online. Please call us or use Naver Booking instead.",
    policyLink: "Read the full privacy policy (Korean) ›",
  },

  submit: {
    saving: "Saving your request…",
    unavailable: `We can't take online requests right now. Please call ${businessInfo.phone} or use Naver Booking.`,
    failed: `We couldn't save your request. Please try again in a moment or call ${businessInfo.phone}.`,
  },

  footer: {
    privacy: "Privacy policy",
  },

  validation: {
    unreadable: "We couldn't read the reservation details.",
    privacy: "Please agree to the collection and use of personal information.",
    ordererName: "Please enter your name.",
    ordererPhone: "Please check your phone number.",
    unknownProduct: "An item is no longer available. Please refresh the page.",
    quantity: "Please check the quantities.",
    duplicateProduct: "An item appears more than once.",
    noItems: "Please add at least one item.",
    schedule: "Please choose a date and time.",
    scheduleClosed: "The selected time can no longer be booked. Please choose another date or time.",
    deliveries: "Please check the recipient and message details.",
    recipientPhone: "Please check the recipient's phone number.",
    orchidRestaurant: "Please enter the restaurant name for the orchid delivery.",
    orchidReservationName: "Please enter the name on the restaurant reservation.",
    cashReceiptPhone: "Please check the mobile number for the cash receipt.",
    cashReceiptBusiness: "Please check the business registration number for the cash receipt.",
    cardPayer: "Please enter the card payer's contact.",
    paypalEmail: "Please check the email for the PayPal payment request.",
    documentCompany: "Please enter the company or organization name for the documents.",
    documentBusinessNumber: "Please check the business registration number for the documents.",
  },
};
