import {
  getNotificationSettings,
  getEmailDeliveryLogs,
  getEmailTemplates,
  getEmailProviderConfig,
} from '@/lib/settings/service'
import { PageBanner } from '@/components/shared/page-banner'
import { Mail } from 'lucide-react'
import { EmailsView } from './emails-view'

export const metadata = {
  title: 'Emails & Notification Center | PNC ELC Platform',
  description: 'Manage automated lifecycle email templates, integrated cadence rules, delivery monitor outbox, and delivery provider infrastructure (Gmail, SES, SMTP).',
}

export default async function EmailsManagePage() {
  const [settings, deliveryLogs, emailTemplates, providerConfig] = await Promise.all([
    getNotificationSettings(),
    getEmailDeliveryLogs(),
    getEmailTemplates(),
    getEmailProviderConfig(),
  ])

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-16 animate-in fade-in duration-300">
      <PageBanner
        title="Email & Notification Center"
        description="Configure automated lifecycle email templates and reminder schedules, monitor platform-wide sent notifications, and manage email delivery provider infrastructure."
        icon={<Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
      />

      <EmailsView
        initialSettings={settings}
        initialDeliveryLogs={deliveryLogs}
        initialEmailTemplates={emailTemplates}
        initialProviderConfig={providerConfig}
      />
    </div>
  )
}
