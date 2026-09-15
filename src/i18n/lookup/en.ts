import { businessInfo } from "@/data/shop";
import type { LookupMessages } from "./ko";

/** English — 모양은 lookup/ko.ts와 같아야 한다 */
export const lookupEn: LookupMessages = {
  pageTitle: "Check your reservation",
  intro: "Enter the name and phone number you used when booking to see your reservation.",
  receiptLabel: "Reservation number",
  nameLabel: "Name",
  namePlaceholder: "The name you entered when booking",
  phoneLabel: "Phone number",
  phonePlaceholder: "The number you entered when booking",
  submit: "Check",
  searching: "Searching…",
  backToReservation: "‹ Back to booking",
  lookupLink: "Check or cancel a reservation",
  completeLookup: "Open reservation check & cancel",
  completeLookupNote: "You can check again any time with your name and phone number.",
  otherReservation: "Check another reservation",
  resultsTitle: (count) => `We found ${count} reservations`,
  resultsHint: "Tap a reservation to view or cancel it.",
  backToList: "‹ Back to the list",

  errors: {
    notFound: "We couldn't find a reservation matching that name and phone number. Please enter them exactly as you did when booking.",
    unavailable: `Online check is not available right now. Please call us (+82 ${businessInfo.phone.slice(1)}).`,
    notCancelable: `This reservation can't be canceled online at this stage. Please call us (+82 ${businessInfo.phone.slice(1)}).`,
    invalidRefund: "Please enter the bank name, account number and account holder for your refund.",
    failed: `Something went wrong. Please try again shortly or call us (+82 ${businessInfo.phone.slice(1)}).`,
  },

  status: {
    received: "Received · payment not yet confirmed",
    confirmed: "Payment confirmed",
    made: "Flowers ready",
    delivered: "Delivered",
    canceled: "Canceled",
  },
  cancelRequested: "Cancellation requested · the shop is reviewing",

  sections: {
    schedule: "Date & time",
    items: "Items",
    total: (quantity) => `Total ${quantity} item${quantity === 1 ? "" : "s"}`,
    deliveries: "Recipients & messages",
    payment: "Payment",
  },

  cancel: {
    title: "Cancel reservation",
    open: "Cancel this reservation",
    close: "Keep my reservation",
    /** 결제 방법별로 묻기 (입금 전 예약) */
    paidQuestion: { bank: "Have you made the bank transfer?", card: "Have you paid by card?", paypal: "Have you paid with PayPal?" },
    notPaid: { bank: "Not yet transferred", card: "Not yet paid by card", paypal: "Not yet paid with PayPal" },
    paid: { bank: "Yes, I have transferred", card: "Yes, I have paid by card", paypal: "Yes, I have paid with PayPal" },
    notPaidHint: "Your reservation will be canceled right away.",
    paidHint: "It will be sent as a cancellation request, and the shop will check it and refund you.",
    /** 입금·결제 확인된 예약 — 묻지 않고 안내만 */
    confirmedNote: { bank: "The shop has already confirmed your transfer, so this will be sent as a cancellation request.", card: "The shop has already confirmed your card payment, so this will be sent as a cancellation request.", paypal: "The shop has already confirmed your PayPal payment, so this will be sent as a cancellation request." },
    refundTitle: "Refund account",
    refundBank: "Bank name",
    refundBankPlaceholder: "e.g. NH Bank, KB Kookmin Bank",
    refundAccount: "Account number",
    refundAccountPlaceholder: "Numbers only or with -",
    refundHolder: "Account holder",
    refundHolderPlaceholder: "Name on the bank account",
    refundWarning: "If the name or account differs from the one you actually paid from, we may not be able to process the refund.",
    refundPrivacy: "We collect the bank name, account number and holder only to send your refund, and delete them according to our privacy policy.",
    cardRefund: "For card payments, the shop will cancel the charge.",
    paypalRefund: "For PayPal payments, we'll refund you through PayPal.",
    submitCancel: "Cancel reservation",
    submitRequest: "Send cancellation request",
    sending: "Sending…",
    canceledDone: "Your reservation has been canceled.",
    requestedDone: "Cancellation request sent. The shop will review it and refund you.",
    requestedInfo: "We've received your cancellation request. The shop will review it and refund you.",
    callInfo: "Your flowers are already being made, so it can't be canceled online. Please call us.",
    call: `Call +82 ${businessInfo.phone.slice(1)}`,
  },
};
