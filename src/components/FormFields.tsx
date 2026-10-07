import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

/* ------------------------------------------------------------------ */
/* Shared field chrome                                                  */
/* ------------------------------------------------------------------ */

interface FieldWrapProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

function FieldWrap({ label, htmlFor, error, hint, children }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Text input                                                          */
/* ------------------------------------------------------------------ */

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

/** Labelled text input with validation messaging. */
export function FormField({ label, error, hint, className, ...inputProps }: FormFieldProps) {
  const autoId = useId()
  const id = inputProps.id ?? autoId
  return (
    <FieldWrap label={label} htmlFor={id} error={error} hint={hint}>
      <input id={id} className={cn('input', error && 'input-error', className)} aria-invalid={Boolean(error)} {...inputProps} />
    </FieldWrap>
  )
}

/* ------------------------------------------------------------------ */
/* Select                                                              */
/* ------------------------------------------------------------------ */

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: SelectOption[]
  error?: string
  hint?: string
}

/** Labelled <select> with consistent styling. */
export function SelectField({ label, options, error, hint, className, ...selectProps }: SelectFieldProps) {
  const autoId = useId()
  const id = selectProps.id ?? autoId
  return (
    <FieldWrap label={label} htmlFor={id} error={error} hint={hint}>
      <select id={id} className={cn('input appearance-none pr-8', error && 'input-error', className)} aria-invalid={Boolean(error)} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-zinc-900">
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

/** Labelled textarea with validation messaging. */
export function TextareaField({ label, error, hint, className, ...textareaProps }: TextareaFieldProps) {
  const autoId = useId()
  const id = textareaProps.id ?? autoId
  return (
    <FieldWrap label={label} htmlFor={id} error={error} hint={hint}>
      <textarea id={id} className={cn('input min-h-28 resize-y', error && 'input-error', className)} aria-invalid={Boolean(error)} {...textareaProps} />
    </FieldWrap>
  )
}