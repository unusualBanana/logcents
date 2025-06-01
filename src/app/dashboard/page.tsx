import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ActivityIcon,
  CalendarIcon,
  DollarSign,
  TrendingDown,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  CurrencySetting,
  SupportedCurrenciesMap,
} from "@/lib/models/currency-setting";

interface SpendingData {
  success: boolean;
  currentTotal?: number;
  previousTotal?: number;
  percentageChange?: number;
  error?: string;
  currencySetting?: CurrencySetting;
}

interface SpendingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  data: SpendingData;
  error?: string;
  comparisonText: string;
}

function SpendingCard({
  title,
  description,
  icon: Icon,
  data,
  error,
  comparisonText,
}: SpendingCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center justify-between">
          {title}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {error || data.error ? (
          <div className="text-red-500">Error: {error || data.error}</div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {data?.currencySetting
                ? formatCurrency(data?.currentTotal || 0, data.currencySetting)
                : (data?.currentTotal || 0).toFixed(2)}
            </div>
            <div className="flex items-center mt-1">
              {data &&
              data.percentageChange !== undefined &&
              data.percentageChange !== 0 ? (
                <>
                  {data.percentageChange > 0 ? (
                    <TrendingUp
                      className="h-4 w-4 text-destructive mr-1"
                      aria-hidden="true"
                    />
                  ) : (
                    <TrendingDown
                      className="h-4 w-4 text-green-500 mr-1"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={
                      data.percentageChange > 0
                        ? "text-destructive text-sm"
                        : "text-green-500 text-sm"
                    }
                  >
                    {data.percentageChange > 0 ? "+" : ""}
                    {data.percentageChange.toFixed(1)}% {comparisonText}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {data?.currentTotal === 0 && data?.previousTotal === 0
                    ? "No spending recorded yet"
                    : `No change ${comparisonText}`}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

async function DailySpendingCard() {
  const { getDailySpendingComparison } = await import("./actions");

  let spendingData: SpendingData = {
    success: true,
    currentTotal: 0,
    previousTotal: 0,
    percentageChange: 0,
    currencySetting: SupportedCurrenciesMap.USD,
  };
  let error: string | undefined;

  try {
    const result = await getDailySpendingComparison();
    spendingData = {
      ...result,
      currentTotal: result.todayTotal,
      previousTotal: result.yesterdayTotal,
    };
  } catch (err) {
    console.error("Failed to fetch daily data:", err);
    error = err instanceof Error ? err.message : "An unknown error occurred.";
    spendingData = {
      success: false,
      currentTotal: 0,
      previousTotal: 0,
      percentageChange: 0,
      error: error,
      currencySetting: SupportedCurrenciesMap.USD,
    };
  }

  return (
    <SpendingCard
      title="Today's Spending"
      description="Day over day comparison"
      icon={DollarSign}
      data={spendingData}
      error={error}
      comparisonText="vs yesterday"
    />
  );
}

async function WeeklySpendingCard() {
  const { getWeeklySpendingComparison } = await import("./actions");

  let spendingData: SpendingData = {
    success: true,
    currentTotal: 0,
    previousTotal: 0,
    percentageChange: 0,
    currencySetting: SupportedCurrenciesMap.USD,
  };
  let error: string | undefined;

  try {
    const result = await getWeeklySpendingComparison();
    spendingData = {
      ...result,
      currentTotal: result.currentWeekTotal,
      previousTotal: result.lastWeekTotal,
    };
  } catch (err) {
    console.error("Failed to fetch weekly data:", err);
    error = err instanceof Error ? err.message : "An unknown error occurred.";
    spendingData = {
      success: false,
      currentTotal: 0,
      previousTotal: 0,
      percentageChange: 0,
      error: error,
      currencySetting: SupportedCurrenciesMap.USD,
    };
  }

  return (
    <SpendingCard
      title="Weekly Spending"
      description="Week over week comparison"
      icon={ActivityIcon}
      data={spendingData}
      error={error}
      comparisonText="vs last week"
    />
  );
}

async function MonthlySpendingCard() {
  const { getMonthlySpendingComparison } = await import("./actions");

  let spendingData: SpendingData = {
    success: true,
    currentTotal: 0,
    previousTotal: 0,
    percentageChange: 0,
    currencySetting: SupportedCurrenciesMap.USD,
  };
  let error: string | undefined;

  try {
    const result = await getMonthlySpendingComparison();
    spendingData = {
      ...result,
      currentTotal: result.currentMonthTotal,
      previousTotal: result.lastMonthTotal,
    };
  } catch (err) {
    console.error("Failed to fetch monthly data:", err);
    error = err instanceof Error ? err.message : "An unknown error occurred.";
    spendingData = {
      success: false,
      currentTotal: 0,
      previousTotal: 0,
      percentageChange: 0,
      error: error,
      currencySetting: SupportedCurrenciesMap.USD,
    };
  }

  return (
    <SpendingCard
      title="Monthly Spending"
      description="Month over month comparison"
      icon={CalendarIcon}
      data={spendingData}
      error={error}
      comparisonText="vs last month"
    />
  );
}

export default async function DashboardPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6 transition-all duration-300 ease-in-out">
          <DailySpendingCard />
          <WeeklySpendingCard />
          <MonthlySpendingCard />
        </div>
      </div>
    </>
  );
}
