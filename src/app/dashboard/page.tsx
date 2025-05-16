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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CurrencySetting } from "@/lib/models/currency-setting";

// Interface and component for Daily Spending Card
interface DailySpendingData {
  today: number;
  yesterday: number;
  percentageChange: number;
  error?: string;
  currencySetting?: CurrencySetting;
}

async function DailySpendingCard() {
  const { getDailySpendingComparison } = await import('./actions');

  let dailySpending: DailySpendingData = {
    today: 0,
    yesterday: 0,
    percentageChange: 0,
    currencySetting: { locale: "en-US", currency: "USD", name: "US Dollar" },
  };
  let error: string | undefined;

  try {
    dailySpending = await getDailySpendingComparison();
  } catch (err) {
    console.error("Failed to fetch daily data:", err);
    error = err instanceof Error ? err.message : "An unknown error occurred.";
    dailySpending = {
      today: 0,
      yesterday: 0,
      percentageChange: 0,
      error: error,
      currencySetting: { locale: "en-US", currency: "USD", name: "US Dollar" },
    };
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center justify-between">
          Today&apos;s Spending
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>Day over day comparison</CardDescription>
      </CardHeader>
      <CardContent>
        {error || dailySpending.error ? (
          <div className="text-red-500">Error: {error || dailySpending.error}</div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {dailySpending?.currencySetting
                ? formatCurrency(
                    dailySpending?.today || 0,
                    dailySpending.currencySetting
                  )
                : (dailySpending?.today || 0).toFixed(2)}
            </div>
            <div className="flex items-center mt-1">
              {dailySpending &&
              dailySpending.percentageChange !== undefined &&
              dailySpending.percentageChange !== 0 ? (
                <>
                  {dailySpending.percentageChange > 0 ? (
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
                      dailySpending.percentageChange > 0
                        ? "text-destructive text-sm"
                        : "text-green-500 text-sm"
                    }
                  >
                    {dailySpending.percentageChange > 0 ? "+" : ""}
                    {dailySpending.percentageChange.toFixed(1)}% vs yesterday
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {dailySpending?.today === 0 && dailySpending?.yesterday === 0
                    ? "No spending recorded yet"
                    : "No change vs yesterday"}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Interface and component for Weekly Spending Card
interface WeeklySpendingData {
  currentWeek: number;
  lastWeek: number;
  percentageChange: number;
  error?: string;
  currencySetting?: CurrencySetting;
}

async function WeeklySpendingCard() {
  const { getWeeklySpendingComparison } = await import('./actions');

  let weeklySpending: WeeklySpendingData = {
    currentWeek: 0,
    lastWeek: 0,
    percentageChange: 0,
    currencySetting: { locale: "en-US", currency: "USD", name: "US Dollar" },
  };
  let error: string | undefined;

  try {
    weeklySpending = await getWeeklySpendingComparison();
  } catch (err) {
    console.error("Failed to fetch weekly data:", err);
    error = err instanceof Error ? err.message : "An unknown error occurred.";
    weeklySpending = {
      currentWeek: 0,
      lastWeek: 0,
      percentageChange: 0,
      error: error,
      currencySetting: { locale: "en-US", currency: "USD", name: "US Dollar" },
    };
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center justify-between">
          Weekly Spending
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>Week over week comparison</CardDescription>
      </CardHeader>
      <CardContent>
        {error || weeklySpending.error ? (
          <div className="text-red-500">Error: {error || weeklySpending.error}</div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {weeklySpending?.currencySetting
                ? formatCurrency(
                    weeklySpending?.currentWeek || 0,
                    weeklySpending.currencySetting
                  )
                : (weeklySpending?.currentWeek || 0).toFixed(2)}
            </div>
            <div className="flex items-center mt-1">
              {weeklySpending &&
              weeklySpending.percentageChange !== undefined &&
              weeklySpending.percentageChange !== 0 ? (
                <>
                  {weeklySpending.percentageChange > 0 ? (
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
                      weeklySpending.percentageChange > 0
                        ? "text-destructive text-sm"
                        : "text-green-500 text-sm"
                    }
                  >
                    {weeklySpending.percentageChange > 0 ? "+" : ""}
                    {weeklySpending.percentageChange.toFixed(1)}% vs last week
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {weeklySpending?.currentWeek === 0 &&
                  weeklySpending?.lastWeek === 0
                    ? "No spending recorded yet"
                    : "No change vs last week"}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Interface and component for Monthly Spending Card
interface MonthlySpendingData {
  currentMonth: number;
  lastMonth: number;
  percentageChange: number;
  error?: string;
  currencySetting?: CurrencySetting;
}

async function MonthlySpendingCard() {
  const { getMonthlySpendingComparison } = await import('./actions');

  let monthlySpending: MonthlySpendingData = {
    currentMonth: 0,
    lastMonth: 0,
    percentageChange: 0,
    currencySetting: { locale: "en-US", currency: "USD", name: "US Dollar" },
  };
  let error: string | undefined;

  try {
    monthlySpending = await getMonthlySpendingComparison();
  } catch (err) {
    console.error("Failed to fetch monthly data:", err);
    error = err instanceof Error ? err.message : "An unknown error occurred.";
    monthlySpending = {
      currentMonth: 0,
      lastMonth: 0,
      percentageChange: 0,
      error: error,
      currencySetting: { locale: "en-US", currency: "USD", name: "US Dollar" },
    };
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center justify-between">
          Monthly Spending
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar-days h-4 w-4 text-muted-foreground"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> */}
        </CardTitle>
        <CardDescription>Month over month comparison</CardDescription>
      </CardHeader>
      <CardContent>
        {error || monthlySpending.error ? (
          <div className="text-red-500">Error: {error || monthlySpending.error}</div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {monthlySpending?.currencySetting
                ? formatCurrency(
                    monthlySpending?.currentMonth || 0,
                    monthlySpending.currencySetting
                  )
                : (monthlySpending?.currentMonth || 0).toFixed(2)}
            </div>
            <div className="flex items-center mt-1">
              {monthlySpending &&
              monthlySpending.percentageChange !== undefined &&
              monthlySpending.percentageChange !== 0 ? (
                <>
                  {monthlySpending.percentageChange > 0 ? (
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
                      monthlySpending.percentageChange > 0
                        ? "text-destructive text-sm"
                        : "text-green-500 text-sm"
                    }
                  >
                    {monthlySpending.percentageChange > 0 ? "+" : ""}
                    {monthlySpending.percentageChange.toFixed(1)}% vs last month
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {monthlySpending?.currentMonth === 0 &&
                  monthlySpending?.lastMonth === 0
                    ? "No spending recorded yet"
                    : "No change vs last month"}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6 transition-all duration-300 ease-in-out">
        <DailySpendingCard />
        <WeeklySpendingCard />
        <MonthlySpendingCard />
      </div>
    </div>
  );
}
