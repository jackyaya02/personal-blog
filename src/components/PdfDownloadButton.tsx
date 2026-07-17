"use client";

import { Download } from "lucide-react";

export default function PdfDownloadButton() {
  const handleDownload = () => {
    window.print();
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg border border-warm-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600"
    >
      <Download size={16} />
      下载 PDF
    </button>
  );
}