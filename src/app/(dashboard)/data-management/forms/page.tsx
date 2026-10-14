import Link from 'next/link'
import { FileText } from 'lucide-react'
import { PageBanner } from '@/components/shared/page-banner'
import { getForms } from '@/lib/forms/getForms'
import { workflowLabel } from '@/lib/forms/types'
import { createForm, archiveForm, restoreForm, duplicateForm } from '@/lib/forms/actions'

const statusClass: Record<string, string> = {
  Draft: 'bg-yellow-100 text-yellow-800',
  Published: 'bg-green-100 text-green-800',
  Archived: 'bg-gray-200 text-gray-700',
}

export default async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const forms = await getForms()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20">
      <PageBanner
        title="Forms"
        description="Create and manage the forms used in the Confirmation and Appraisal workflows."
        icon={<FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
      />

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error.slice(0, 300)}
        </div>
      )}

      <form action={createForm} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Form name</label>
          <input id="name" name="name" required className="border rounded px-3 py-2 w-72" />
        </div>
        <div>
          <label htmlFor="workflow" className="block text-sm font-medium mb-1">Workflow</label>
          <select id="workflow" name="workflow" className="border rounded px-3 py-2">
            <option value="">Not linked</option>
            <option value="confirmation">Confirmation</option>
            <option value="appraisal">Appraisal</option>
          </select>
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded text-sm">
          Create form
        </button>
      </form>

      {forms.length === 0 ? (
        <p className="text-gray-500">No forms yet. Create the first one above.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Workflow</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Version</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Updated</th>
                <th className="text-left p-3">Submissions</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id} className="border-b">
                  <td className="p-3 font-medium">
                    <Link href={`/data-management/forms/${f.id}`} className="text-blue-600 hover:underline">
                      {f.name}
                    </Link>
                  </td>
                  <td className="p-3">{workflowLabel(f.workflow)}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-1 text-xs ${statusClass[f.status]}`}>{f.status}</span>
                  </td>
                  <td className="p-3">
                    v{f.version}
                    {f.hasPendingDraft && <span className="ml-1 text-xs text-gray-500">(draft in progress)</span>}
                  </td>
                  <td className="p-3">{f.createdAt.slice(0, 10)}</td>
                  <td className="p-3">{f.updatedAt.slice(0, 10)}</td>
                  <td className="p-3">{f.submissionCount}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/data-management/forms/${f.id}`} className="text-blue-600 hover:underline">
                        Open
                      </Link>
                      <form action={duplicateForm}>
                        <input type="hidden" name="formId" value={f.id} />
                        <button type="submit" className="text-blue-600 hover:underline">Duplicate</button>
                      </form>
                      {f.status === 'Archived' ? (
                        <form action={restoreForm}>
                          <input type="hidden" name="formId" value={f.id} />
                          <button type="submit" className="text-blue-600 hover:underline">Restore</button>
                        </form>
                      ) : (
                        <form action={archiveForm}>
                          <input type="hidden" name="formId" value={f.id} />
                          <button type="submit" className="text-red-600 hover:underline">Archive</button>
                        </form>
                      )}
                    </div>
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
