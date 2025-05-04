import Transactions from "@/components/transactions/transactions";

export default async function TransactionsPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl">
      <Transactions />
    </div>
  );
}
