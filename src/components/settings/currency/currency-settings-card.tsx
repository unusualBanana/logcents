import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { SupportedCurrenciesMap } from "@/lib/models/currency-setting";

export const CurrencySettingsCard = () => {
  const { user } = useAuthStore();
  const { currencySetting, fetchCurrencySetting, updateCurrencySetting } = useCurrencyStore();
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currencySetting.currency);

  useEffect(() => {
    if (!user) return;
    fetchCurrencySetting(user.uid);
  }, [fetchCurrencySetting, user]);

  useEffect(() => {
    setSelectedCurrencyCode(currencySetting.currency);
  }, [currencySetting]);

  const handleCurrencyChange = (currencyCode: string) => {
    if (!user) return;
    const newCurrencySetting = SupportedCurrenciesMap[currencyCode];
    if (newCurrencySetting) {
      updateCurrencySetting(newCurrencySetting);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Setting</CardTitle>
        <CardDescription>Select your preferred currency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={selectedCurrencyCode} onValueChange={handleCurrencyChange}>
          <SelectTrigger id="currency" className="w-full">
            <SelectValue placeholder="Select a currency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SupportedCurrenciesMap).map(([code, setting]) => (
              <SelectItem key={code} value={code}>
                {`${code} - ${setting.name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default CurrencySettingsCard; 