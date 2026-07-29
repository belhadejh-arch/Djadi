/**
 * In-app PDF viewer — displays a PDF URL inside an iframe overlay
 * so the user never leaves the app or opens an external browser.
 */
import { ArrowRight, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="pdf-overlay"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0" dir="rtl">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <div className="flex items-center gap-2 flex-1 mx-3 min-w-0">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <p className="font-semibold text-sm truncate text-foreground">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
