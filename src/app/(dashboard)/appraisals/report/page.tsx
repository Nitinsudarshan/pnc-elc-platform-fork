import { redirect } from 'next/navigation'

export default function AppraisalReportRedirectPage() {
  redirect('/reports?tab=appraisals')
}
