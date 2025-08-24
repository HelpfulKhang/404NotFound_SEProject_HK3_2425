"use client"

import { useEffect, useRef } from "react"

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    // Trigger change after command
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const onInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 border rounded-md p-2 bg-background">
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("bold")}>B</button>
        <button type="button" className="px-2 py-1 text-sm border rounded italic" onClick={() => exec("italic")}>I</button>
        <button type="button" className="px-2 py-1 text-sm border rounded underline" onClick={() => exec("underline")}>
          U
        </button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("strikeThrough")}>
          S
        </button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("insertUnorderedList")}>
          • List
        </button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("insertOrderedList")}>
          1. List
        </button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("formatBlock", "H1")}>
          H1
        </button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("formatBlock", "H2")}>
          H2
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm border rounded"
          onClick={() => {
            const url = prompt("Liên kết URL:") || ""
            if (url) exec("createLink", url)
          }}
        >
          Link
        </button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("removeFormat")}>
          Clear
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[280px] w-full border rounded-md p-3 bg-background focus:outline-none prose max-w-none"
        data-placeholder={placeholder}
        onInput={onInput}
      />
    </div>
  )
}



