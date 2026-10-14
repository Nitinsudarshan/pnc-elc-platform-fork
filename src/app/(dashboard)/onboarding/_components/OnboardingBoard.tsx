'use client'

import { AlertTriangle } from 'lucide-react'
import { useMemo, useState } from 'react'

import { JourneyDrawer } from '@/app/(dashboard)/onboarding/_components/JourneyDrawer'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EMPLOYEE_TYPE_LABELS } from '@/lib/onboarding/constants'
import { formatDisplayDate } from '@/lib/onboarding/dates'

import type {
  ChannelProgress,
  EmployeeType,
  OnboardingDashboardRow,
  OnboardingStage,
} from '@/types/onboarding'

const STAGE_LABELS: Record<OnboardingStage, string> = {
  pre_boarding: 'Pre-boarding',
  onboarding_in_progress: 'Onboarding In Progress',
  onboarded: 'Onboarded',
}

const STAGE_VARIANTS: Record<
  OnboardingStage,
  'default' | 'secondary' | 'outline'
> = {
  pre_boarding: 'outline',
  onboarding_in_progress: 'default',
  onboarded: 'secondary',
}

const ALL = 'all'

/** Compact progress bar + "n/m" counter for one channel. */
const ProgressCell = ({ progress }: { progress: ChannelProgress }) => {
  const percentage =
    progress.total === 0 ? 0 : (progress.completed / progress.total) * 100

  return (
    <div className="flex min-w-24 items-center gap-2">
      <Progress value={percentage} className="h-1.5" />
      <span className="text-muted-foreground text-xs tabular-nums">
        {progress.completed}/{progress.total}
      </span>
    </div>
  )
}

type OnboardingBoardProps = {
  rows: OnboardingDashboardRow[]
}

/**
 * Filterable onboarding pipeline table. Clicking a row opens the per-employee
 * drawer.
 */
export const OnboardingBoard = ({ rows }: OnboardingBoardProps) => {
  const [stage, setStage] = useState<string>(ALL)
  const [employeeType, setEmployeeType] = useState<string>(ALL)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<OnboardingDashboardRow | null>(null)

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (stage !== ALL && row.stage !== stage) return false
      if (employeeType !== ALL && row.employeeType !== employeeType) return false
      if (!term) return true

      return (
        row.employeeName.toLowerCase().includes(term) ||
        (row.email ?? '').toLowerCase().includes(term)
      )
    })
  }, [rows, stage, employeeType, search])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="onboarding-stage">Stage</Label>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger id="onboarding-stage" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="onboarding-type">Employee Type</Label>
          <Select value={employeeType} onValueChange={setEmployeeType}>
            <SelectTrigger id="onboarding-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              {Object.entries(EMPLOYEE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="onboarding-search">Search</Label>
          <Input
            id="onboarding-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>DOJ</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Emails</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Slack</TableHead>
              <TableHead>Tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow
                key={row.journeyId}
                tabIndex={0}
                role="button"
                aria-label={`Open onboarding details for ${row.employeeName}`}
                className="cursor-pointer"
                onClick={() => setSelected(row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelected(row)
                  }
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.needsAttention && (
                      <AlertTriangle
                        className="text-destructive h-4 w-4 shrink-0"
                        aria-label="Needs attention"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {row.employeeName}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        {row.email ?? 'No email on record'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDisplayDate(row.joiningDate)}
                </TableCell>
                <TableCell>
                  <Badge variant={STAGE_VARIANTS[row.stage]}>
                    {STAGE_LABELS[row.stage]}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {EMPLOYEE_TYPE_LABELS[row.employeeType as EmployeeType]}
                </TableCell>
                <TableCell>
                  <ProgressCell progress={row.emailProgress} />
                </TableCell>
                <TableCell>
                  <ProgressCell progress={row.calendarProgress} />
                </TableCell>
                <TableCell>
                  <ProgressCell progress={row.slackProgress} />
                </TableCell>
                <TableCell>
                  <ProgressCell progress={row.taskProgress} />
                </TableCell>
              </TableRow>
            ))}

            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground py-10 text-center"
                >
                  No onboarding journeys match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <JourneyDrawer
        row={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}
