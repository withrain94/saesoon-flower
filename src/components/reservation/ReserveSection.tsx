import { CheckSquareIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { useT } from "@/hooks/useLocale";
import type { SelectionSummary } from "@/lib/selection";
import type { ResolvedUnit } from "@/lib/units";
import OrdererForm from "./OrdererForm";
import ReservationComplete from "./ReservationComplete";
import { SECTION, sectionScrollMargin } from "./sections";
import type { SubmittedReservation, UnitActions } from "./useReservation";

export default function ReserveSection({
  reservation,
  summary,
  units,
  unitActions,
  onSubmit,
}: {
  /** null = 아직 제출 전 */
  reservation: SubmittedReservation | null;
  summary: SelectionSummary;
  units: ResolvedUnit[];
  unitActions: UnitActions;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useT();

  return (
    <section id={SECTION.reserve} className={`${sectionScrollMargin} px-5 pb-8 pt-7`}>
      <SectionHeading icon={<CheckSquareIcon />}>{t.reserve.heading}</SectionHeading>

      {reservation ? (
        <ReservationComplete submitted={reservation} summary={summary} units={units} />
      ) : (
        <OrdererForm summary={summary} units={units} unitActions={unitActions} onSubmit={onSubmit} />
      )}
    </section>
  );
}
