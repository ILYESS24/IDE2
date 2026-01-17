"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PromptInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void
  submitOnEnter?: boolean
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ className, onSubmit, submitOnEnter = true, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [value, setValue] = React.useState("")

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!)

    // Auto-resize textarea
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
      }
    }, [])

    // Adjust height on mount and when value changes
    React.useEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
      adjustHeight()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (submitOnEnter && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (value.trim() && onSubmit) {
          onSubmit(value)
          setValue("")
        }
      }
      props.onKeyDown?.(e)
    }

    const handleSubmit = () => {
      if (value.trim() && onSubmit) {
        onSubmit(value)
        setValue("")
      }
    }

    return (
      <div className={cn("relative flex items-end gap-2", className)}>
        <textarea
          {...props}
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={props.placeholder || "Type your message..."}
          className={cn(
            "flex min-h-[44px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "max-h-[200px] overflow-y-auto"
          )}
          rows={1}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "h-10 w-10 shrink-0",
            value.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground"
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    )
  }
)

PromptInput.displayName = "PromptInput"

export { PromptInput }
