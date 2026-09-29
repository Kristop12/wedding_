import { CoupleForm } from "@/components/wedding/couple-form";
import { WizardFrame } from "@/components/wedding/wizard-frame";

export default function NewWeddingPage() {
  return (
    <WizardFrame step="couple">
      <CoupleForm
        defaults={{ partnerOneName: "", partnerTwoName: "", slug: "" }}
        submitLabel="Continue"
      />
    </WizardFrame>
  );
}
