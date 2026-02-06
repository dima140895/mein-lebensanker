import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const currencies = [
  { value: "EUR", label: "EUR €" },
  { value: "USD", label: "USD $" },
  { value: "GBP", label: "GBP £" },
  { value: "CHF", label: "CHF" },
  { value: "JPY", label: "JPY ¥" },
  { value: "TRY", label: "TRY ₺" },
  { value: "PLN", label: "PLN zł" },
  { value: "CZK", label: "CZK Kč" },
  { value: "SEK", label: "SEK kr" },
  { value: "NOK", label: "NOK kr" },
  { value: "DKK", label: "DKK kr" },
  { value: "CAD", label: "CAD $" },
  { value: "AUD", label: "AUD $" },
];

const CurrencySelect = ({ value, onValueChange }: CurrencySelectProps) => (
  <Select value={value || "EUR"} onValueChange={onValueChange}>
    <SelectTrigger className="w-[90px] shrink-0">
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="bg-background border border-border shadow-lg z-50">
      {currencies.map((c) => (
        <SelectItem key={c.value} value={c.value}>
          {c.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default CurrencySelect;
