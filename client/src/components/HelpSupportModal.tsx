import React, { useState } from 'react';
import { X, Shield, Phone, Mail, ExternalLink, HelpCircle, FileText, CheckCircle, Github, Laptop } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'help' | 'privacy' | 'terms' | 'contact';
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'help'
}) => {
  const [activeTab, setActiveTab] = useState<'help' | 'privacy' | 'terms' | 'contact'>(defaultTab);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Drive P2P Support & Documentation</h3>
              <p className="text-xs text-slate-500">Offline-First Peer-to-Peer Knowledge Base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('help')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'help'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            How P2P Works
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Contact & Support
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-950">
                <h4 className="font-bold text-sm text-blue-900 mb-1">True Offline Direct Transfer</h4>
                <p>
                  Drive P2P streams files directly between devices over WebRTC RTCDataChannel. Data never passes through cloud servers, ensuring maximum transfer speed (up to full Wi-Fi throughput) and zero latency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-600" /> LAN Device Discovery
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Devices on the same local Wi-Fi or subnet discover each other automatically using UDP multicast beacons without requiring internet access.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" /> AES-256-GCM Encryption
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    All file chunks can be encrypted client-side using Web Crypto API. Encryption keys are generated per-transfer and verified with SHA-256 checksums.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h5 className="font-bold text-slate-800 mb-2">Source Code & Community:</h5>
                <a
                  href="https://github.com/satyamshh967/Offline-P2P-File-Sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View Project on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <p>
                Need assistance with offline network pairing, browser WebRTC permissions, or configuring subnet beacons? Reach out to our technical team:
              </p>

              <div className="space-y-3 pt-2">
                {/* Clickable Phone Number */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Toll-Free Phone Support</div>
                      <a 
                        href="tel:+18005553748" 
                        className="text-sm font-bold text-blue-600 hover:underline"
                      >
                        +1 (800) 555-DRIVE
                      </a>
                    </div>
                  </div>
                  <a
                    href="tel:+18005553748"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Call Now
                  </a>
                </div>

                {/* Clickable Email */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Inquiry & Bug Reports</div>
                      <a 
                        href="mailto:support@drivep2p.local" 
                        className="text-sm font-bold text-emerald-600 hover:underline"
                      >
                        support@drivep2p.local
                      </a>
                    </div>
                  </div>
                  <a
                    href="mailto:support@drivep2p.local"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800">Privacy Policy (Zero Cloud Storage)</h4>
              <p>
                <strong>1. Zero Data Collection:</strong> Drive P2P does not upload, log, or store your files on external cloud servers. All payloads travel point-to-point directly between peer memory caches.
              </p>
              <p>
                <strong>2. Offline Identity:</strong> User profiles and credentials created in Drive P2P are stored locally in your browser's IndexedDB and authenticated through local microservices on your private network.
              </p>
              <p>
                <strong>3. Cryptographic Secrecy:</strong> Transfers using AES-256-GCM encryption maintain end-to-end secrecy. The signaling server handles connection coordination and cannot decrypt transfer contents.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800">Terms of Service</h4>
              <p>
                <strong>1. Open Source License:</strong> Drive P2P is provided free for students, offices, and developers under standard open source licensing.
              </p>
              <p>
                <strong>2. Permitted Use:</strong> You agree to transfer only files you possess the right to distribute. Local network transfers are governed by your organizational or home network policies.
              </p>
              <p>
                <strong>3. Warranty Disclaimer:</strong> Provided "as-is" without warranty of any kind. Drive P2P is not liable for data loss during interrupted wireless connections.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Dynamic Copyright Year */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            &copy; {currentYear} Drive P2P. All rights reserved.
          </span>
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/satyamshh967/Offline-P2P-File-Sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('privacy')} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('terms')} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
