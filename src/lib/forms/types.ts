export const WORKFLOWS = ['confirmation', 'appraisal'] as const

export const FIELD_TYPES = [
  { value: 'short_text', label: 'Short text' },
  { value: 'long_text', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'single_select', label: 'Single select' },
  { value: 'multi_select', label: 'Multi select' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'rating_grid', label: 'Rating grid (1-5, several items)' },
  { value: 'employee_picker', label: 'Employee picker (all employees)' },
] as const

export function fieldTypeLabel(value: string): string {
  return FIELD_TYPES.find((t) => t.value === value)?.label ?? value
}

export function workflowLabel(value: string | null): string {
  if (value === 'confirmation') return 'Confirmation'
  if (value === 'appraisal') return 'Appraisal'
  return 'Not linked'
}
