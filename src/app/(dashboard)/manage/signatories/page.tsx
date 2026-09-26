import { getSignatories } from '@/lib/signatories/service'
import { SignatoriesTable } from './signatories-table'

export const metadata = {
  title: 'Authorized Signatories | PNC ELC Platform',
  description: 'Manage official institutional signing authorities, designations, and digital signature stamps.',
}

export default async function SignatoriesPage() {
  const signatories = await getSignatories()
  return <SignatoriesTable initialSignatories={signatories} />
}
