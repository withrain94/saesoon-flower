import { CheckSquareIcon } from "@/components/ui/icons";
import type { SpecialEvent } from "@/data/events";
import SectionHeading from "@/components/ui/SectionHeading";
import { useT } from "@/hooks/useLocale";
import type { SelectionSummary } from "@/lib/selection";
import type { OrdererContact, ResolvedUnit } from "@/lib/units";
import type { ReceiveMethod } from "@/types/reservation";
import OrdererForm from "./OrdererForm";
import ReservationComplete from "./ReservationComplete";
import { SECTION, sectionScrollMargin } from "./sections";
import type { SubmittedReservation, UnitActions } from "./useReservation";

export default function ReserveSection({
  reservation,
  summary,
  units,
  unitActions,
  orderer,
  onOrdererChange,
  receiveMethod,
  onReceiveMethodChange,
  event,
  forEvent,
  onForEventChange,
  onSubmit,
}: {
  /** null = 아직 제출 전 */
  reservation: SubmittedReservation | null;
  summary: SelectionSummary;
  units: ResolvedUnit[];
  unitActions: UnitActions;
  orderer: OrdererContact;
  onOrdererChange: (patch: Partial<OrdererContact>) => void;
  receiveMethod: ReceiveMethod;
  onReceiveMethodChange: (value: ReceiveMethod) => void;
  event: SpecialEvent | null;
  forEvent: boolean | null;
  onForEventChange: (value: boolean) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useT();

  return (
    <section id={SECTION.reserve} className={`${sectionScrollMargin} px-5 pb-8 pt-7`}>
      <SectionHeading icon={<CheckSquareIcon />}>{t.reserve.heading}</SectionHeading>

      {reservation ? (
        <ReservationComplete submitted={reservation} summary={summary} units={units} />
      ) : (
        <OrdererForm
          summary={summary}
          units={units}
          unitActions={unitActions}
          orderer={orderer}
          onOrdererChange={onOrdererChange}
          receiveMethod={receiveMethod}
          onReceiveMethodChange={onReceiveMethodChange}
          event={event}
          forEvent={forEvent}
          onForEventChange={onForEventChange}
          onSubmit={onSubmit}
        />
      )}
    </section>
  );
}
