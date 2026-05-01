import Image from "next/image";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./MessageBubble.module.css";

export interface ChatMessageShape {
  id: number;
  documentId: string;
  sender: {
    id: number;
    username: string;
    role: "client" | "provider" | "system";
  };
  senderRole: "client" | "provider" | "system";
  messageType: "text" | "image" | "file" | "payment_proof" | "system";
  content: string;
  status: "sent" | "delivered" | "read";
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachment: {
    id: number;
    documentId: string;
    url: string;
    name: string;
    mime: string;
    size: number;
  } | null;
}

interface MessageBubbleProps {
  message: ChatMessageShape;
  isOwn: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function TickIcon({ status }: { status: "sent" | "delivered" | "read" }) {
  if (status === "sent") {
    return <span className={styles.tickSingle}>✓</span>;
  }
  if (status === "delivered") {
    return <span className={styles.tickDouble}>✓✓</span>;
  }
  return <span className={`${styles.tickDouble} ${styles.tickRead}`}>✓✓</span>;
}

function getAttachmentUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const base =
    process.env.NEXT_PUBLIC_STRAPI_API_URL?.replace("/api", "") ??
    "http://localhost:1337";
  return `${base}${url}`;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { messageType, content, status, createdAt, attachment } = message;

  // payment_proof is always a special centered bubble, regardless of sender
  if (messageType === "payment_proof") {
    const url = attachment ? getAttachmentUrl(attachment.url) : null;
    return (
      <div className={styles.wrapperProof}>
        <div className={styles.bubbleProof}>
          <IconsApp.Document color="#f08100" />
          <span className={styles.proofText}>Comprobante de pago enviado</span>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.proofLink}
            >
              Ver
            </a>
          )}
        </div>
        <div className={styles.metaCenter}>
          <span className={styles.time}>{formatTime(createdAt)}</span>
        </div>
      </div>
    );
  }

  const wrapperClass = isOwn
    ? `${styles.wrapper} ${styles.wrapperOwn}`
    : `${styles.wrapper} ${styles.wrapperOther}`;

  const bubbleClass = isOwn
    ? `${styles.bubble} ${styles.bubbleOwn}`
    : `${styles.bubble} ${styles.bubbleOther}`;

  const renderContent = () => {
    if (messageType === "image" && attachment) {
      const url = getAttachmentUrl(attachment.url);
      return (
        <div className={styles.imageWrapper}>
          <Image
            src={url}
            alt={attachment.name || "Imagen"}
            width={240}
            height={180}
            className={styles.inlineImage}
            unoptimized
          />
          {content && <p className={styles.imageCaption}>{content}</p>}
        </div>
      );
    }

    if (messageType === "file" && attachment) {
      const url = getAttachmentUrl(attachment.url);
      return (
        <div className={styles.fileAttachment}>
          <IconsApp.Document color={isOwn ? "#ffffff" : "#f08100"} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={isOwn ? styles.fileLinkOwn : styles.fileLink}
          >
            {attachment.name}
          </a>
        </div>
      );
    }

    return <p className={styles.text}>{content}</p>;
  };

  return (
    <div className={wrapperClass}>
      <div className={bubbleClass}>{renderContent()}</div>
      {/* Timestamp + ticks OUTSIDE the bubble */}
      <div className={isOwn ? styles.metaOwn : styles.metaOther}>
        <span className={styles.time}>{formatTime(createdAt)}</span>
        {isOwn && <TickIcon status={status} />}
      </div>
    </div>
  );
}
