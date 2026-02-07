import { useEffect } from "react";
import { motion } from "framer-motion";
import { Info, FileText } from "lucide-react";
import { useFormData, DocumentsData } from "@/contexts/FormContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/contexts/ProfileContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import DocumentUploadSection from "./DocumentUploadSection";
import SectionNavigation from './SectionNavigation';

const DocumentsForm = () => {
  const { formData, updateSection } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { activeProfileId } = useProfiles();
  const { handleBlur, resetSaveState } = useAutoSave({ section: "documents" });

  const data = formData.documents;

  // Reset save state when profile changes
  useEffect(() => {
    resetSaveState();
  }, [activeProfileId, resetSaveState]);

  const t = {
    de: {
      title: "Dokumenten-Übersicht",
      disclaimer:
        "Notiere hier, wo wichtige Dokumente aufbewahrt werden. Du kannst auch Kopien hochladen. Änderungen werden automatisch gespeichert.",
      documentNote: "Für Testament, Vorsorgevollmacht und Patientenverfügung wende Dich an einen Notar.",
      testament: "Testament",
      testamentPlaceholder: "Wo befindet sich das Testament? (z.B. Notar, Schließfach, zu Hause)",
      testamentUpload: "Testament-Kopie hochladen",
      powerOfAttorney: "Vorsorgevollmacht",
      powerPlaceholder: "Wo befindet sich die Vorsorgevollmacht?",
      powerUpload: "Vorsorgevollmacht-Kopie hochladen",
      livingWill: "Patientenverfügung",
      livingWillPlaceholder: "Wo befindet sich die Patientenverfügung?",
      livingWillUpload: "Patientenverfügung-Kopie hochladen",
      insuranceDocs: "Versicherungsunterlagen",
      insurancePlaceholder: "Wo befinden sich die Versicherungsunterlagen?",
      insuranceUpload: "Versicherungsunterlagen hochladen",
      propertyDocs: "Immobilienunterlagen",
      propertyPlaceholder: "Wo befinden sich Grundbuchauszüge, Kaufverträge etc.?",
      propertyUpload: "Immobilienunterlagen hochladen",
      otherDocs: "Sonstige wichtige Dokumente",
      otherPlaceholder: "Wo befinden sich weitere wichtige Dokumente?",
      otherUpload: "Sonstige Dokumente hochladen",
      notes: "Zusätzliche Hinweise",
    },
    en: {
      title: "Document Overview",
      disclaimer:
        "Note here where important documents are stored. You can also upload copies. Changes are saved automatically.",
      documentNote: "For wills, power of attorney, and living wills, please consult a notary.",
      testament: "Last Will & Testament",
      testamentPlaceholder: "Where is the will located? (e.g., notary, safe deposit box, at home)",
      testamentUpload: "Upload will copy",
      powerOfAttorney: "Power of Attorney",
      powerPlaceholder: "Where is the power of attorney located?",
      powerUpload: "Upload power of attorney copy",
      livingWill: "Living Will / Advance Directive",
      livingWillPlaceholder: "Where is the living will located?",
      livingWillUpload: "Upload living will copy",
      insuranceDocs: "Insurance Documents",
      insurancePlaceholder: "Where are the insurance documents located?",
      insuranceUpload: "Upload insurance documents",
      propertyDocs: "Property Documents",
      propertyPlaceholder: "Where are land registry extracts, purchase contracts, etc.?",
      propertyUpload: "Upload property documents",
      otherDocs: "Other Important Documents",
      otherPlaceholder: "Where are other important documents located?",
      otherUpload: "Upload other documents",
      notes: "Additional Notes",
    },
  };

  const texts = t[language];

  const handleChange = (field: keyof DocumentsData, value: string) => {
    updateSection("documents", { ...data, [field]: value });
  };

  const documentFields: Array<{
    key: keyof DocumentsData;
    label: string;
    placeholder: string;
    uploadLabel: string;
    uploadType: string;
  }> = [
    {
      key: "testamentLocation",
      label: texts.testament,
      placeholder: texts.testamentPlaceholder,
      uploadLabel: texts.testamentUpload,
      uploadType: "testament",
    },
    {
      key: "powerOfAttorneyLocation",
      label: texts.powerOfAttorney,
      placeholder: texts.powerPlaceholder,
      uploadLabel: texts.powerUpload,
      uploadType: "power-of-attorney",
    },
    {
      key: "livingWillLocation",
      label: texts.livingWill,
      placeholder: texts.livingWillPlaceholder,
      uploadLabel: texts.livingWillUpload,
      uploadType: "living-will",
    },
    {
      key: "insuranceDocsLocation",
      label: texts.insuranceDocs,
      placeholder: texts.insurancePlaceholder,
      uploadLabel: texts.insuranceUpload,
      uploadType: "insurance",
    },
    {
      key: "propertyDocsLocation",
      label: texts.propertyDocs,
      placeholder: texts.propertyPlaceholder,
      uploadLabel: texts.propertyUpload,
      uploadType: "property",
    },
    {
      key: "otherDocsLocation",
      label: texts.otherDocs,
      placeholder: texts.otherPlaceholder,
      uploadLabel: texts.otherUpload,
      uploadType: "other",
    },
  ];

  if (!profile?.has_paid) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      <div className="rounded-lg bg-amber-light/50 border border-amber/20 p-4 flex items-start gap-3">
        <FileText className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber">{texts.documentNote}</p>
      </div>

      <div className="space-y-8">
        {documentFields.map((field) => (
          <div key={field.key} className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
            <div className="space-y-2">
              <Label className="text-base font-semibold">{field.label}</Label>
              <Input
                value={data[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
              />
            </div>

            <DocumentUploadSection documentType={field.uploadType} label={field.uploadLabel} />
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-border pt-6">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          onBlur={handleBlur}
          placeholder={texts.notes}
          rows={3}
        />
      </div>

      <SectionNavigation currentSection="documents" />
    </motion.div>
  );
};

export default DocumentsForm;
