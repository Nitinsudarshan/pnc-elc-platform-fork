import { getEmployees } from "@/lib/employees/getEmployees";
import { PageBanner } from "@/components/shared/page-banner";
import { Users } from "lucide-react";
import { EmployeesTable } from "./employees-table";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Banner */}
      <PageBanner
        title="Employee Directory"
        description="Comprehensive records, roles, employment types, and profiles across all teams."
        icon={<Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
      />

      {/* Main Table with Search & Pagination */}
      <EmployeesTable employees={employees} />
    </div>
  );
}