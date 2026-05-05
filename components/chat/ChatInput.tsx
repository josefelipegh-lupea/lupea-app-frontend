"use client";

import { useRef, useState, KeyboardEvent, ChangeEvent } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  onSend: (content: string, file?: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Escribir un mensaje...",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !disabled && (text.trim().length > 0 || selectedFile !== null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    e.target.value = "";
  }

  function handleSend() {
    if (!canSend) return;
    onSend(text.trim(), selectedFile ?? undefined);
    setText("");
    setSelectedFile(null);
    // reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <div className={styles.container}>
      {selectedFile && (
        <div className={styles.filePreview}>
          <span className={styles.filePreviewIcon}>
            <IconsApp.Document color="#f08100" />
          </span>
          <span className={styles.filePreviewName}>{selectedFile.name}</span>
          <button
            className={styles.filePreviewRemove}
            onClick={() => setSelectedFile(null)}
            aria-label="Quitar archivo"
            type="button"
          >
            <IconsApp.Close color="#9e9e9e" />
          </button>
        </div>
      )}
      <div className={styles.row}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Espera a que el teclado termine de animarse (~300ms) y luego
            // hace scroll para que el textarea quede visible sobre el teclado
            setTimeout(() => {
              textareaRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }, 300);
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />

        {/* Clip button */}
        <button
          className={styles.clipButton}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Adjuntar archivo"
          type="button"
        >
          {/* Paperclip SVG — not in IconsApp */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
          className={styles.hiddenFileInput}
          onChange={handleFileChange}
        />

        {/* Send button */}
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Enviar mensaje"
          type="button"
        >
          <IconsApp.Send />
        </button>
      </div>
    </div>
  );
}
