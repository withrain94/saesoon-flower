import { getEventOn } from "@/data/events";
import { businessInfo } from "@/data/shop";
import { addDaysToKey } from "@/lib/date";
import { toSmsPhoneNumber } from "@/lib/ordererSms";
import { getSlotHour, toNowInTimeZone } from "@/lib/time";
import type { ReservationStatus, StoredReservation } from "@/types/reservation";

/**
 * 정해진 시간에 자동으로 보내는 문자 (2026-11-18 사용자 요청) — 무엇을·언제·누구에게.
 * 10분마다 app/cron/auto-sms → server/autoSms 가 이 함수로 "지금 보낼 문자"를 고르고, 보낸 기록(auto_sms_log)으로 두 번 안 보냄.
 * 매장 안드로이드 폰(SMS Gate)이 보냄. 한국 휴대폰 번호에만 보냄.
 */

export type AutoSmsKind =
  /** 1. 픽업 — 완성 사진과 함께 예약 2시간 전(오전 11시 전 예약은 전날 오후 5시), 예약자에게 */
  | "pickupPhoto"
  /** 2-1. 인재개발원 — 전날 오후 8시, 완성 사진과 함께 예약자에게 */
  | "instituteOrdererPhoto"
  /** 2-2. 인재개발원 — 전날 오후 7시, 받는 분에게 */
  | "instituteRecipientEve"
  /** 2-3. 인재개발원 — 당일 오전 8시, 받는 분에게 한 번 더 */
  | "instituteRecipientDay"
  /** 2-4. 인재개발원 — 당일 오전 10시, 예약자에게 배송 완료 */
  | "instituteOrdererDone"
  /** 3. 일반 배송 — 받는 시간 1시간 전, 받는 분에게 */
  | "deliveryRecipient"
  /** 배송인데 받는 분(예약자 본인 아님) 연락처가 없을 때 — 예약자에게 매장 번호로 남겨 달라고 */
  | "recipientPhoneMissing"
  /** 예약 취소 — 예약자에게 */
  | "canceled";

export type AutoSms = {
  kind: AutoSmsKind;
  /** 받는 번호 (+8210…) */
  phoneNumber: string;
  text: string;
  /** 완성 사진을 붙이는 문자 — 사진이 없으면 보내지 않고 매장에 알림 */
  withPhoto: boolean;
};

/** 입금·결제가 확인된 예약만 미리 안내 문자를 보냄 */
const PAID_STATUSES: ReservationStatus[] = ["confirmed", "made", "delivered"];

/** 밤에는 자동 문자를 보내지 않음 (한국 시각 21시 ~ 다음날 7시) */
export const QUIET_START_HOUR = 21;
export const QUIET_END_HOUR = 7;

/** 이 시각 전에 접수된 예약은 취소 문자를 보내지 않음 (기능이 생기기 전 예약) */
export const AUTO_SMS_START = "2026-11-18T00:00:00+09:00";

/** 취소 문자는 취소된 지 이 시간 안에만 (밤이면 아침에 보냄) */
export const CANCEL_NOTICE_HOURS = 24;

export type AutoSmsReservation = Pick<StoredReservation, "id" | "createdAt" | "status" | "request" | "reminderSentAt"> & {
  /** 마지막으로 바뀐 시각 — 취소 문자용 */
  updatedAt: string;
};

/** 한국 시각 "YYYY-MM-DD" + 시·분 → Date */
function kst(dateKey: string, hour: number, minute = 0) {
  return new Date(`${dateKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+09:00`);
}

const HOUR = 60 * 60 * 1000;

export function isQuietHour(now: Date) {
  const hour = toNowInTimeZone(now).hour;
  return hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR;
}

/** 한국 휴대폰 번호만 (+8210…) — 해외 번호는 국제 문자 요금이 들어 자동으로 안 보냄 */
export function toKoreanMobile(phone: string) {
  const number = toSmsPhoneNumber(phone);
  return number && /^\+8210[0-9]{7,8}$/.test(number) ? number : null;
}

/** 인재개발원 승진식·수료식 날 + "행사 꽃이에요"를 고른 예약 */
export function getInstituteEvent(request: StoredReservation["request"]) {
  const event = getEventOn(request.date);
  if (!event || event.topperCategories.length === 0 || request.forEvent !== true) return null;
  return event;
}

function hourLabel(time: string) {
  const hour = getSlotHour(time);
  if (hour < 12) return `아침 ${hour}시`;
  return `오후 ${hour === 12 ? 12 : hour - 12}시`;
}

/** 금·토·일이면 "주말", 아니면 "하루" */
function restWord(dateKey: string) {
  const day = new Date(`${dateKey}T12:00:00+09:00`).getUTCDay();
  return day === 5 || day === 6 || day === 0 ? "주말" : "하루";
}

/** 받는 분 한 명 (같은 번호는 한 번만) */
type Recipient = { name: string; phone: string | null };

function recipientsOf(reservation: AutoSmsReservation): Recipient[] {
  const seen = new Set<string>();
  const list: Recipient[] = [];
  for (const delivery of reservation.request.deliveries) {
    // 호접난은 식당으로 가서 받는 분 연락처가 없음
    if (delivery.category === "orchid") continue;
    const phone = delivery.recipientPhone.trim() ? toKoreanMobile(delivery.recipientPhone) : null;
    const key = phone ?? `name:${delivery.recipientName.trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ name: delivery.recipientName.trim(), phone });
  }
  return list;
}

export const autoSmsText = {
  pickupPhoto: () => "안녕하세요 새순입니다. 사진 보내드립니다. 무인픽업 장소에서 시간 구애없이 편하게 찾아가세요.",
  instituteOrdererPhoto: () => "안녕하세요 새순입니다. 사진 보내드립니다. 내일 잘 배송하겠습니다.",
  instituteRecipient: (congrats: string, day: "내일" | "오늘", time: string) =>
    `안녕하세요. 새순 꽃집입니다. ${congrats}을 축하드립니다. ${day} ${hourLabel(time)} 인재개발원 수료식장 앞으로 꽃배달 예정입니다. 오전 9시까지 수령해가시면 감사하겠습니다.`,
  instituteOrdererDone: (dateKey: string) =>
    `안녕하세요. 새순입니다. 배송완료되었습니다. 즐거운 ${restWord(dateKey)} 보내세요^^`,
  deliveryRecipient: (ordererName: string) =>
    `안녕하세요. 새순꽃집 꽃배달입니다. ${ordererName}님 앞으로 꽃배달이 예정되어있습니다. 감사합니다.`,
  recipientPhoneMissing: (recipientName: string) =>
    `안녕하세요 새순입니다. 받는 분${recipientName ? `(${recipientName}님)` : ""} 연락처가 입력되지 않았어요. 배송 안내를 위해 ${businessInfo.phone}으로 받는 분 연락처를 문자로 남겨 주세요.`,
  canceled: (ordererName: string, dateKey: string, time: string, receipt: string) => {
    const [, month, day] = dateKey.split("-").map(Number);
    return `안녕하세요 새순입니다. ${ordererName}님의 ${month}/${day} ${hourLabel(time)} 예약(접수번호 ${receipt})이 취소되었습니다. 문의: ${businessInfo.phone}`;
  },
};

/** 언제부터 언제까지 보낼 수 있는지 — 시작 전이거나 마감이 지나면 안 보냄 */
type Window = { from: Date; until: Date };

function inWindow(now: Date, window: Window) {
  return now >= window.from && now < window.until;
}

/** 문자 하나 + 보낼 수 있는 때 */
type Planned = AutoSms & { window: Window };

/**
 * 이 예약에 보낼 수 있는 자동 문자 전부 (때가 아닌 것도 포함) — 화면·시험용.
 * 지금 보낼 것만 고르려면 getDueAutoSms
 */
export function planAutoSms(reservation: AutoSmsReservation): Planned[] {
  const { request } = reservation;
  const orderer = toKoreanMobile(request.ordererPhone);
  const at = kst(request.date, getSlotHour(request.time));
  const prevDay = addDaysToKey(request.date, -1);
  const plans: Planned[] = [];

  if (reservation.status === "canceled") {
    const canceledAt = new Date(reservation.updatedAt);
    if (orderer && new Date(reservation.createdAt) >= new Date(AUTO_SMS_START)) {
      plans.push({
        kind: "canceled",
        phoneNumber: orderer,
        text: autoSmsText.canceled(request.ordererName, request.date, request.time, reservation.id.slice(0, 8).toUpperCase()),
        withPhoto: false,
        window: { from: canceledAt, until: new Date(canceledAt.getTime() + CANCEL_NOTICE_HOURS * HOUR) },
      });
    }
    return plans;
  }
  if (!PAID_STATUSES.includes(reservation.status)) return plans;

  const institute = getInstituteEvent(request);
  const delivery = request.receiveMethod === "delivery";
  // 수동으로 [지금 문자 보내기]를 눌렀으면(안내 문자 보냄 표시) 사진 문자는 자동으로 다시 안 보냄
  const manualSent = reservation.reminderSentAt !== null;

  if (institute) {
    const congrats = institute.kind === "instituteLongCourse" ? "수료" : "승진";
    if (orderer && !manualSent) {
      plans.push({
        kind: "instituteOrdererPhoto",
        phoneNumber: orderer,
        text: autoSmsText.instituteOrdererPhoto(),
        withPhoto: true,
        window: { from: kst(prevDay, 20), until: at },
      });
    }
    for (const recipient of recipientsOf(reservation)) {
      if (!recipient.phone) continue;
      plans.push(
        {
          kind: "instituteRecipientEve",
          phoneNumber: recipient.phone,
          text: autoSmsText.instituteRecipient(congrats, "내일", request.time),
          withPhoto: false,
          window: { from: kst(prevDay, 19), until: kst(prevDay, QUIET_START_HOUR) },
        },
        {
          kind: "instituteRecipientDay",
          phoneNumber: recipient.phone,
          text: autoSmsText.instituteRecipient(congrats, "오늘", request.time),
          withPhoto: false,
          window: { from: at, until: new Date(at.getTime() + HOUR) },
        },
      );
    }
    if (orderer) {
      plans.push({
        kind: "instituteOrdererDone",
        phoneNumber: orderer,
        text: autoSmsText.instituteOrdererDone(request.date),
        withPhoto: false,
        window: { from: kst(request.date, 10), until: kst(request.date, 13) },
      });
    }
  } else if (delivery) {
    for (const recipient of recipientsOf(reservation)) {
      if (!recipient.phone || recipient.phone === orderer) continue;
      plans.push({
        kind: "deliveryRecipient",
        phoneNumber: recipient.phone,
        text: autoSmsText.deliveryRecipient(request.ordererName),
        withPhoto: false,
        window: { from: new Date(at.getTime() - HOUR), until: at },
      });
    }
  } else if (orderer && !manualSent) {
    const from = getSlotHour(request.time) < 11 ? kst(prevDay, 17) : new Date(at.getTime() - 2 * HOUR);
    plans.push({
      kind: "pickupPhoto",
      phoneNumber: orderer,
      text: autoSmsText.pickupPhoto(),
      withPhoto: true,
      window: { from, until: at },
    });
  }

  // 받는 분께 안내 문자를 보내는 예약(인재개발원·배송)인데 받는 분 연락처가 없음 → 예약자에게 남겨 달라고
  if ((institute || delivery) && orderer) {
    const missing = recipientsOf(reservation).filter(
      (recipient) => !recipient.phone && recipient.name !== request.ordererName.trim(),
    );
    if (missing.length > 0) {
      plans.push({
        kind: "recipientPhoneMissing",
        phoneNumber: orderer,
        text: autoSmsText.recipientPhoneMissing(missing.map((recipient) => recipient.name).filter(Boolean).join(", ")),
        withPhoto: false,
        window: { from: new Date(reservation.createdAt), until: at },
      });
    }
  }
  return plans;
}

/** 지금(밤이 아니고, 보낼 때가 된) 보낼 자동 문자 */
export function getDueAutoSms(reservation: AutoSmsReservation, now: Date): AutoSms[] {
  if (isQuietHour(now)) return [];
  return planAutoSms(reservation)
    .filter((plan) => inWindow(now, plan.window))
    .map(({ window: _window, ...sms }) => sms);
}

/** 자동 문자를 살펴볼 받는 날짜 — 오늘·내일 (전날 저녁 문자 때문에 내일까지) */
export function autoSmsDates(now: Date) {
  const today = toNowInTimeZone(now).dateKey;
  return [today, addDaysToKey(today, 1)];
}

/** 매장 텔레그램에 쓰는 이름 */
export const autoSmsKindLabel: Record<AutoSmsKind, string> = {
  pickupPhoto: "픽업 사진 문자",
  instituteOrdererPhoto: "인재개발원 사진 문자(예약자)",
  instituteRecipientEve: "인재개발원 전날 안내(받는 분)",
  instituteRecipientDay: "인재개발원 당일 안내(받는 분)",
  instituteOrdererDone: "인재개발원 배송 완료(예약자)",
  deliveryRecipient: "배송 안내(받는 분)",
  recipientPhoneMissing: "받는 분 연락처 요청(예약자)",
  canceled: "취소 안내(예약자)",
};
