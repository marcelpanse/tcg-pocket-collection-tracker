import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { Controller, type ControllerProps, type FieldPath, type FieldValues, FormProvider, useFormContext } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const Form = FormProvider

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

export const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  )
}

export function FormLabel({ className, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  const { error, formItemId } = useFormField()
  return <Label className={cn(error && 'text-red-500 dark:text-red-900', className)} htmlFor={formItemId} {...props} />
}

export function FormControl(props: React.HTMLAttributes<HTMLDivElement>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  return <Slot id={formItemId} aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField()
  return <p id={formDescriptionId} className={cn('text-[0.8rem] text-neutral-500 dark:text-neutral-400', className)} {...props} />
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p id={formMessageId} className={cn('text-[0.8rem] font-medium text-red-500 dark:text-red-900', className)} {...props}>
      {body}
    </p>
  )
}
