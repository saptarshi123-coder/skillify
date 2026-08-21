import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function CertificateModal() {
  const { selectedCertModal, viewingCertificate, setIsCertModalOpen, setViewingCertificate, userProfile, showToast } = useApp();
  const certRef = useRef(null);

  const cert = selectedCertModal || viewingCertificate;
  if (!cert) return null;

  const handleClose = () => {
    if (setIsCertModalOpen) setIsCertModalOpen(false);
    if (setViewingCertificate) setViewingCertificate(null);
  };

  const handlePrintDownload = () => {
    window.print();
    showToast("📄 Opening print dialog for high-resolution certificate!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-outline-variant/30 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-surface-variant pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
            <h3 className="font-headline-md text-headline-md font-bold text-on-background dark:text-inverse-on-surface">
              Certificate of Achievement
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Printable High-Fidelity Certificate Card */}
        <div
          ref={certRef}
          className="relative bg-gradient-to-br from-[#fffdfa] to-[#fff4ec] dark:from-[#2e2a25] dark:to-[#1f1b16] border-8 border-double border-primary/40 rounded-2xl p-6 md:p-10 text-center shadow-lg flex flex-col items-center gap-4 overflow-hidden"
        >
          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[300px] text-primary">workspace_premium</span>
          </div>

          {/* Top Logo & Title */}
          <div className="flex items-center gap-2 text-primary font-headline-md text-2xl font-black tracking-widest uppercase">
            <span className="material-symbols-outlined text-3xl">school</span>
            Skillify AI
          </div>

          <div className="font-label-sm uppercase tracking-[0.25em] text-on-surface-variant font-bold text-[11px] mt-1">
            Certificate of Professional Competency
          </div>

          <div className="w-16 h-0.5 bg-primary/30 my-1"></div>

          <p className="font-body-md text-on-surface-variant italic">
            This is to proudly certify that
          </p>

          <h2 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-primary my-1 font-serif underline decoration-primary/30 underline-offset-8">
            {cert.recipient || userProfile.name}
          </h2>

          <p className="font-body-md text-on-surface max-w-md">
            has demonstrated verifiable proficiency and successfully passed the examination for
          </p>

          <div className="bg-primary/5 dark:bg-primary-container/30 border border-primary/20 rounded-xl px-6 py-3 my-1">
            <h4 className="font-headline-md text-lg md:text-xl font-bold text-primary">
              {cert.title}
            </h4>
            <span className="font-label-sm text-xs font-semibold text-secondary dark:text-secondary-fixed-dim">
              Score: {cert.score} • Difficulty: Standard
            </span>
          </div>

          {/* Certificate Footer Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 w-full pt-6 border-t border-primary/20 mt-4 gap-4 text-left">
            <div>
              <p className="font-label-sm text-[10px] uppercase text-on-surface-variant font-semibold">Issue Date</p>
              <p className="font-label-md text-sm font-bold text-on-surface">{cert.issueDate}</p>
            </div>
            <div>
              <p className="font-label-sm text-[10px] uppercase text-on-surface-variant font-semibold">Credential ID</p>
              <p className="font-mono text-xs font-bold text-primary truncate">{cert.credentialId}</p>
            </div>
            <div className="col-span-2 md:col-span-1 flex items-center justify-end md:justify-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/5">
                <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
              </div>
              <div className="text-[9px] font-mono text-on-surface-variant leading-tight">
                VERIFIED<br/>BY SKILLIFY
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-outline-variant font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrintDownload}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download / Print Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
