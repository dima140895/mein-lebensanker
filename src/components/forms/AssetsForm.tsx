import { useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Info, AlertTriangle } from "lucide-react";
import { useFormData, AssetsData } from "@/contexts/FormContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/contexts/ProfileContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import SectionNavigation from './SectionNavigation';

const AssetsForm = () => {
  const { formData, updateSection } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { activeProfileId } = useProfiles();
  const { handleBlur, resetSaveState } = useAutoSave({ section: "assets" });

  const data = formData.assets;

  // Reset save state when profile changes
  useEffect(() => {
    resetSaveState();
  }, [activeProfileId, resetSaveState]);

  const t = {
    de: {
      disclaimer:
        "Diese Übersicht dient nur der Orientierung. Beträge sind optional und haben keine rechtliche Verbindlichkeit. Änderungen werden automatisch gespeichert.",
      warning:
        "Diese Übersicht hilft, Konten zu finden - nicht, sie direkt zu nutzen. Bitte trage daher keine Passwörter, PINs oder TANs ein.",
      bankAccounts: "Bankkonten",
      institute: "Institut",
      purpose: "Verwendungszweck",
      balance: "Kontostand (optional)",
      properties: "Immobilien",
      address: "Adresse",
      type: "Art (z.B. Wohnung, Haus)",
      ownership: "Nutzungsart",
      ownershipSelfOccupied: "Eigennutzung",
      ownershipRentedOut: "Vermietung",
      ownershipOther: "Sonstiges",
      ownershipOtherPlaceholder: "Bitte beschreiben...",
      rentalIncome: "Mieteinnahmen kalt (optional)",
      financingStatus: "Finanzierungsstatus",
      financingPaidOff: "Abbezahlt",
      financingFinanced: "Finanziert",
      selectFinancing: "Finanzierungsstatus wählen",
      outstandingLoan: "Offener Kreditsaldo (optional)",
      insurances: "Versicherungen",
      insuranceType: "Versicherungsart",
      selectInsuranceType: "Versicherungsart wählen",
      searchInsuranceType: "Versicherungsart suchen...",
      insuranceTypeOtherPlaceholder: "Welche Versicherungsart?",
      insuranceTypes: {
        life: "Lebensversicherung",
        health: "Krankenversicherung",
        liability: "Haftpflichtversicherung",
        household: "Hausratversicherung",
        building: "Gebäudeversicherung",
        car: "KFZ-Versicherung",
        disability: "Berufsunfähigkeitsversicherung",
        accident: "Unfallversicherung",
        legal: "Rechtsschutzversicherung",
        pension: "Private Rentenversicherung",
        travel: "Reiseversicherung",
        other: "Sonstige",
      },
      company: "Versicherungsgesellschaft",
      selectCompany: "Gesellschaft wählen",
      searchCompany: "Gesellschaft suchen...",
      companyOtherPlaceholder: "Welche Gesellschaft?",
      companies: {
        allianz: "Allianz",
        axa: "AXA",
        ergo: "ERGO",
        generali: "Generali",
        huk: "HUK-COBURG",
        debeka: "Debeka",
        signal: "Signal Iduna",
        provinzial: "Provinzial",
        lvm: "LVM",
        vgh: "VGH",
        devk: "DEVK",
        zurich: "Zurich",
        swisslife: "Swiss Life",
        nuernberger: "Nürnberger",
        other: "Sonstige",
      },
      policyNumber: "Policennummer (optional)",
      surrenderValue: "Rückkaufswert (optional)",
      noResults: "Keine Ergebnisse gefunden.",
      valuables: "Wertgegenstände",
      description: "Beschreibung",
      location: "Aufbewahrungsort",
      addItem: "Hinzufügen",
      notes: "Zusätzliche Hinweise",
      selectOwnership: "Nutzungsart wählen",
    },
    en: {
      disclaimer:
        "This overview is for orientation only. Amounts are optional and have no legal validity. Changes are saved automatically.",
      warning: "Please do not enter account numbers, IBANs, or PINs! Only note the institution and purpose here.",
      bankAccounts: "Bank Accounts",
      institute: "Bank/Institute",
      purpose: "Purpose",
      balance: "Balance (optional)",
      properties: "Properties",
      address: "Address",
      type: "Type (e.g., apartment, house)",
      ownership: "Usage Type",
      ownershipSelfOccupied: "Self-occupied",
      ownershipRentedOut: "Rented out",
      ownershipOther: "Other",
      ownershipOtherPlaceholder: "Please describe...",
      rentalIncome: "Rental income cold (optional)",
      financingStatus: "Financing Status",
      financingPaidOff: "Paid off",
      financingFinanced: "Financed",
      selectFinancing: "Select financing status",
      outstandingLoan: "Outstanding loan balance (optional)",
      insurances: "Insurance Policies",
      insuranceType: "Insurance Type",
      selectInsuranceType: "Select insurance type",
      searchInsuranceType: "Search insurance type...",
      insuranceTypeOtherPlaceholder: "Which insurance type?",
      insuranceTypes: {
        life: "Life Insurance",
        health: "Health Insurance",
        liability: "Liability Insurance",
        household: "Household Insurance",
        building: "Building Insurance",
        car: "Car Insurance",
        disability: "Disability Insurance",
        accident: "Accident Insurance",
        legal: "Legal Protection",
        pension: "Private Pension",
        travel: "Travel Insurance",
        other: "Other",
      },
      company: "Insurance Company",
      selectCompany: "Select company",
      searchCompany: "Search company...",
      companyOtherPlaceholder: "Which company?",
      companies: {
        allianz: "Allianz",
        axa: "AXA",
        ergo: "ERGO",
        generali: "Generali",
        huk: "HUK-COBURG",
        debeka: "Debeka",
        signal: "Signal Iduna",
        provinzial: "Provinzial",
        lvm: "LVM",
        vgh: "VGH",
        devk: "DEVK",
        zurich: "Zurich",
        swisslife: "Swiss Life",
        nuernberger: "Nürnberger",
        other: "Other",
      },
      policyNumber: "Policy Number (optional)",
      surrenderValue: "Surrender Value (optional)",
      noResults: "No results found.",
      valuables: "Valuables",
      description: "Description",
      location: "Storage Location",
      addItem: "Add",
      notes: "Additional Notes",
      selectOwnership: "Select usage type",
    },
  };

  const texts = t[language];

  const addItem = (field: "bankAccounts" | "properties" | "insurances" | "valuables") => {
    const newItems = {
      bankAccounts: [...data.bankAccounts, { institute: "", purpose: "", balance: "" }],
      properties: [
        ...data.properties,
        {
          address: "",
          type: "",
          ownership: "",
          ownershipOther: "",
          rentalIncome: "",
          financingStatus: "",
          outstandingLoan: "",
        },
      ],
      insurances: [
        ...data.insurances,
        { type: "", typeOther: "", company: "", companyOther: "", policyNumber: "", surrenderValue: "" },
      ],
      valuables: [...data.valuables, { description: "", location: "" }],
    };
    updateSection("assets", { ...data, [field]: newItems[field] });
  };

  const insuranceTypeOptions = Object.entries(texts.insuranceTypes).map(([key, label]) => ({
    value: key,
    label: label as string,
  }));
  const companyOptions = Object.entries(texts.companies).map(([key, label]) => ({
    value: key,
    label: label as string,
  }));

  const removeItem = (field: "bankAccounts" | "properties" | "insurances" | "valuables", index: number) => {
    const newArray = [...data[field]];
    newArray.splice(index, 1);
    updateSection("assets", { ...data, [field]: newArray });
  };

  const updateItem = <T extends keyof AssetsData>(field: T, index: number, key: string, value: string) => {
    const newArray = [...(data[field] as Array<Record<string, string>>)];
    newArray[index] = { ...newArray[index], [key]: value };
    updateSection("assets", { ...data, [field]: newArray });
  };

  if (!profile?.has_paid) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm text-destructive font-medium">{texts.warning}</p>
      </div>

      {/* Bank Accounts */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.bankAccounts}</h3>
        {data.bankAccounts.map((account, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-3">
              <Input
                value={account.institute}
                onChange={(e) => updateItem("bankAccounts", i, "institute", e.target.value)}
                onBlur={handleBlur}
                placeholder={texts.institute}
              />
              <Input
                value={account.purpose}
                onChange={(e) => updateItem("bankAccounts", i, "purpose", e.target.value)}
                onBlur={handleBlur}
                placeholder={texts.purpose}
              />
              <Input
                value={account.balance || ""}
                onChange={(e) => updateItem("bankAccounts", i, "balance", e.target.value)}
                onBlur={handleBlur}
                placeholder={texts.balance}
              />
            </div>
            {data.bankAccounts.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeItem("bankAccounts", i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem("bankAccounts")}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Properties */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.properties}</h3>
        {data.properties.map((property, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={property.address}
                  onChange={(e) => updateItem("properties", i, "address", e.target.value)}
                  onBlur={handleBlur}
                  placeholder={texts.address}
                />
                <Input
                  value={property.type}
                  onChange={(e) => updateItem("properties", i, "type", e.target.value)}
                  onBlur={handleBlur}
                  placeholder={texts.type}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Select
                  value={property.ownership || ""}
                  onValueChange={(value) => {
                    const newArray = [...data.properties];
                    newArray[i] = {
                      ...newArray[i],
                      ownership: value,
                      ownershipOther: value === "other" ? newArray[i].ownershipOther : "",
                      rentalIncome: value === "rented-out" ? newArray[i].rentalIncome : "",
                      financingStatus:
                        value === "self-occupied" || value === "rented-out" ? newArray[i].financingStatus : "",
                      outstandingLoan:
                        value === "self-occupied" || value === "rented-out" ? newArray[i].outstandingLoan : "",
                    };
                    updateSection("assets", { ...data, properties: newArray });
                    handleBlur();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={texts.selectOwnership} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="self-occupied">{texts.ownershipSelfOccupied}</SelectItem>
                    <SelectItem value="rented-out">{texts.ownershipRentedOut}</SelectItem>
                    <SelectItem value="other">{texts.ownershipOther}</SelectItem>
                  </SelectContent>
                </Select>
                {property.ownership === "other" && (
                  <Input
                    value={property.ownershipOther || ""}
                    onChange={(e) => updateItem("properties", i, "ownershipOther", e.target.value)}
                    onBlur={handleBlur}
                    placeholder={texts.ownershipOtherPlaceholder}
                  />
                )}
              </div>
              {(property.ownership === "self-occupied" || property.ownership === "rented-out") && (
                <>
                  {property.ownership === "rented-out" && (
                    <Input
                      value={property.rentalIncome || ""}
                      onChange={(e) => updateItem("properties", i, "rentalIncome", e.target.value)}
                      onBlur={handleBlur}
                      placeholder={texts.rentalIncome}
                    />
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    <Select
                      value={property.financingStatus || ""}
                      onValueChange={(value) => {
                        const newArray = [...data.properties];
                        newArray[i] = {
                          ...newArray[i],
                          financingStatus: value,
                          outstandingLoan: value === "financed" ? newArray[i].outstandingLoan : "",
                        };
                        updateSection("assets", { ...data, properties: newArray });
                        handleBlur();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={texts.selectFinancing} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        <SelectItem value="paid-off">{texts.financingPaidOff}</SelectItem>
                        <SelectItem value="financed">{texts.financingFinanced}</SelectItem>
                      </SelectContent>
                    </Select>
                    {property.financingStatus === "financed" && (
                      <Input
                        value={property.outstandingLoan || ""}
                        onChange={(e) => updateItem("properties", i, "outstandingLoan", e.target.value)}
                        onBlur={handleBlur}
                        placeholder={texts.outstandingLoan}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem("properties", i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem("properties")}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Insurances */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.insurances}</h3>
        {data.insurances.map((ins, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Combobox
                  options={insuranceTypeOptions}
                  value={ins.type || ""}
                  onValueChange={(value) => {
                    const newArray = [...data.insurances];
                    newArray[i] = {
                      ...newArray[i],
                      type: value,
                      typeOther: value === "other" ? newArray[i].typeOther : "",
                    };
                    updateSection("assets", { ...data, insurances: newArray });
                    handleBlur();
                  }}
                  placeholder={texts.selectInsuranceType}
                  searchPlaceholder={texts.searchInsuranceType}
                  emptyText={texts.noResults}
                />
                <Combobox
                  options={companyOptions}
                  value={ins.company || ""}
                  onValueChange={(value) => {
                    const newArray = [...data.insurances];
                    newArray[i] = {
                      ...newArray[i],
                      company: value,
                      companyOther: value === "other" ? newArray[i].companyOther : "",
                    };
                    updateSection("assets", { ...data, insurances: newArray });
                    handleBlur();
                  }}
                  placeholder={texts.selectCompany}
                  searchPlaceholder={texts.searchCompany}
                  emptyText={texts.noResults}
                />
              </div>
              {(ins.type === "other" || ins.company === "other") && (
                <div className="grid gap-3 md:grid-cols-2">
                  {ins.type === "other" && (
                    <Input
                      value={ins.typeOther || ""}
                      onChange={(e) => updateItem("insurances", i, "typeOther", e.target.value)}
                      onBlur={handleBlur}
                      placeholder={texts.insuranceTypeOtherPlaceholder}
                    />
                  )}
                  {ins.company === "other" && (
                    <Input
                      value={ins.companyOther || ""}
                      onChange={(e) => updateItem("insurances", i, "companyOther", e.target.value)}
                      onBlur={handleBlur}
                      placeholder={texts.companyOtherPlaceholder}
                    />
                  )}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={ins.policyNumber || ""}
                  onChange={(e) => updateItem("insurances", i, "policyNumber", e.target.value)}
                  onBlur={handleBlur}
                  placeholder={texts.policyNumber}
                />
                <Input
                  value={ins.surrenderValue || ""}
                  onChange={(e) => updateItem("insurances", i, "surrenderValue", e.target.value)}
                  onBlur={handleBlur}
                  placeholder={texts.surrenderValue}
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem("insurances", i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem("insurances")}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Valuables */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.valuables}</h3>
        {data.valuables.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-2">
              <Input
                value={item.description}
                onChange={(e) => updateItem("valuables", i, "description", e.target.value)}
                onBlur={handleBlur}
                placeholder={texts.description}
              />
              <Input
                value={item.location}
                onChange={(e) => updateItem("valuables", i, "location", e.target.value)}
                onBlur={handleBlur}
                placeholder={texts.location}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem("valuables", i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem("valuables")}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      <div className="space-y-2 border-t border-border pt-6">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => updateSection("assets", { ...data, notes: e.target.value })}
          onBlur={handleBlur}
          placeholder={texts.notes}
          rows={3}
        />
      </div>

      <SectionNavigation currentSection="assets" />
    </motion.div>
  );
};

export default AssetsForm;
