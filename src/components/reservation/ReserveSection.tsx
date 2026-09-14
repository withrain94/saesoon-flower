import { CheckSquareIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { useT } from "@/hooks/useLocale";
import type { SelectionSummary } from "@/lib/selection";
import type { ResolvedUnit } from "@/lib/units";
import type { ReservationRequest } from "@/types/reservation";
import OrdererForm from "./OrdererForm";
import ReservationComplete from "./ReservationComplete";
import { SECTION, sectionScrollMargin } from "./sections";
import type { UnitActions } from "./useReservation";

export default function ReserveSection({
  reservation,
  summary,
  units,
  unitActions,
  onSubmit,
}: {
  /** null = 아직 제출 전 */
  reservation: ReservationRequest | null;
  summary: SelectionSummary;
  units: ResolvedUnit[];
  unitActions: UnitActions;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useT();

  return (
    <section id={SECTION.reserve} className={`${sectionScrollMargin} px-5 pb-32 pt-7`}>
      <SectionHeading icon={<CheckSquareIcon />}>{t.reserve.heading}</SectionHeading>

      {reservation ? (
        <ReservationComplete reservation={reservation} summary={summary} units={units} />
      ) : (
        <OrdererForm summary={summary} units={units} unitActions={unitActions} onSubmit={onSubmit} />
      )}
    </section>
  );
}
