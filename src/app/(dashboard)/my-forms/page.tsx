import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Inbox } from 'lucide-react'
import { PageBanner } from '@/components/shared/page-banner'
import { getMyForms } from '@/lib/forms/getMyForms'

const statusClass: Record<string, string> = {
  'Not started': 'bg-yellow-100 text-yellow-800',
  'In progress': 'bg-blue-100 text-blue-800',
  Submitted: 'bg-green-100 text-green-800',
  Expired: 'bg-gray-200 text-gray-700',
  Cancelled: 'bg-gray-200 text-gray-700',
  Closed: 'bg-gray-200 text-gray-700',
}

export default async function MyFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const { signedIn, employee, items } = await getMyForms()
  if (!signedIn) redirect('/login')

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-20">
      <PageBanner
        title="My Forms"
        description="Forms you have been asked to fill in."
        icon={<Inbox className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
      />

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error.slice(0, 300)}
        </div>
      )}

      {!employee ? (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          Your login email is not linked to an employee record yet, so no forms can be shown. Please
          ask PnC to add your email to your employee profile.
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">You have no forms to fill in right now.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Form</th>
                <th className="text-left p-3">About</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Sent</th>
                <th className="text-left p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.requestId} className="border-b">
                  <td className="p-3 font-medium">{item.formName}</td>
                  <td className="p-3">{item.aboutName ?? '—'}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-1 text-xs ${statusClass[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="p-3">{item.assignedAt.slice(0, 10)}</td>
                  <td className="p-3">
                    {item.canOpen ? (
                      <Link href={`/my-forms/${item.requestId}`} className="text-blue-600 hover:underline">
                        {item.status === 'Submitted' ? 'View' : item.status === 'In progress' ? 'Continue' : 'Open'}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
