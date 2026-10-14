import { INDUCTION_TASKS } from '@/lib/onboarding/automation/constants'
import {
  canDispatch,
  getRunMode,
  resolveSlackChannel,
} from '@/lib/onboarding/automation/runMode'
import { SLACK_TEMPLATES } from '@/lib/onboarding/automation/templates/slackTemplates'

import type { DispatchInput, DispatchOutcome } from '@/lib/onboarding/automation/channels/types'
import type { JourneyContext } from '@/types/onboarding'

/**
 * Slack adapter.
 *
 * Every call degrades to `deferred` when SLACK_BOT_TOKEN is unset, so the rest
 * of the pipeline runs normally in an environment where Slack hasn't been wired
 * up yet and the steps are retried once it is.
 */

const SLACK_API = 'https://slack.com/api'

type SlackResponse = {
  ok: boolean
  error?: string
  ts?: string
  channel?: { id?: string }
  user?: { id?: string }
}

const callSlack = async (
  method: string,
  payload: Record<string, unknown>
): Promise<SlackResponse> => {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) return { ok: false, error: 'not_configured' }

  const response = await fetch(`${SLACK_API}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  return (await response.json()) as SlackResponse
}

/** Resolves a Slack member ID so messages can @-mention real people. */
const lookupUserId = async (
  email: string | null | undefined
): Promise<string | null> => {
  if (!email) return null

  const response = await fetch(
    `${SLACK_API}/users.lookupByEmail?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN ?? ''}` } }
  )

  const data = (await response.json()) as SlackResponse
  return data.ok ? data.user?.id ?? null : null
}

/** `<@U123>` when resolvable, else a readable `@Name` fallback. */
const toTag = (userId: string | null, fallbackName: string): string =>
  userId ? `<@${userId}>` : `@${fallbackName}`

const buildChannelName = (context: JourneyContext): string => {
  const slug = context.employeeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  return `onboarding-${slug}`
}

const createChannel = async (
  context: JourneyContext
): Promise<DispatchOutcome> => {
  const created = await callSlack('conversations.create', {
    name: buildChannelName(context),
    is_private: false,
  })

  if (!created.ok) {
    if (created.error === 'not_configured') {
      return { status: 'deferred', reason: 'Slack integration not configured' }
    }
    // An existing channel is a success for our purposes — the welcome message
    // still needs somewhere to land, so re-running must not hard-fail.
    if (created.error === 'name_taken') {
      return { status: 'skipped', reason: 'Slack channel already exists' }
    }
    return { status: 'failed', error: created.error ?? 'Unknown Slack error' }
  }

  const channelId = created.channel?.id ?? null

  // Pull the people who need to be in the room from day one.
  const inviteEmails = [
    context.officialEmail,
    context.personalEmail,
    context.managerEmail,
    context.buddyEmail,
  ]

  const userIds = (
    await Promise.all(inviteEmails.map((email) => lookupUserId(email)))
  ).filter((id): id is string => Boolean(id))

  if (channelId && userIds.length > 0) {
    await callSlack('conversations.invite', {
      channel: channelId,
      users: userIds.join(','),
    })
  }

  return { status: 'sent', externalRef: channelId }
}

export const dispatchSlackStep = async (
  input: DispatchInput
): Promise<DispatchOutcome> => {
  const { definition, context, tasks } = input
  const mode = getRunMode()

  if (!canDispatch(mode)) {
    return { status: 'deferred', reason: `Run mode "${mode}" does not post to Slack` }
  }

  if (!process.env.SLACK_BOT_TOKEN) {
    return { status: 'deferred', reason: 'Slack integration not configured' }
  }

  // Sandbox must not create real onboarding channels in the workspace.
  if (definition.key === 'slack_channel') {
    if (mode === 'sandbox') {
      return {
        status: 'skipped',
        reason: 'Sandbox mode does not create Slack channels',
      }
    }
    return createChannel(context)
  }

  if (!context.slackChannelId && mode !== 'sandbox') {
    return { status: 'deferred', reason: 'Slack channel not created yet' }
  }

  const channel = resolveSlackChannel(mode, context.slackChannelId ?? '')
  if (!channel) {
    return {
      status: 'deferred',
      reason: 'Sandbox mode is on but ONBOARDING_SANDBOX_SLACK_CHANNEL is not set',
    }
  }

  const completedTaskLabels = tasks
    .filter((task) => task.isCompleted)
    .map(
      (task) =>
        INDUCTION_TASKS.find((item) => item.key === task.taskKey)?.label ??
        task.taskKey
    )

  // The congratulations message is earned, not scheduled: it waits until every
  // induction task is done, however long that takes.
  if (
    definition.requiresAllTasks &&
    completedTaskLabels.length < INDUCTION_TASKS.length
  ) {
    return { status: 'deferred', reason: 'Induction tasks not yet complete' }
  }

  const template = SLACK_TEMPLATES[definition.key]
  if (!template) {
    return { status: 'skipped', reason: 'No Slack template for this step' }
  }

  const [employeeId, managerId, buddyId] = await Promise.all([
    lookupUserId(context.officialEmail ?? context.personalEmail),
    lookupUserId(context.managerEmail),
    lookupUserId(context.buddyEmail),
  ])

  const message = template({
    employeeName: context.employeeName,
    employeeTag: toTag(employeeId, context.employeeName),
    managerTag: toTag(managerId, 'manager'),
    buddyTag: toTag(buddyId, 'buddy'),
    buddyName: context.buddyEmail ? 'buddy' : null,
    designation: null,
    employeeTypeLabel: null,
    managerConnectTime: '11:00 AM',
    isPlaceholderSlot: false,
    completedTaskLabels,
  })

  const posted = await callSlack('chat.postMessage', {
    channel,
    text: message,
  })

  if (!posted.ok) {
    return { status: 'failed', error: posted.error ?? 'Unknown Slack error' }
  }

  return { status: 'sent', externalRef: posted.ts ?? null }
}
