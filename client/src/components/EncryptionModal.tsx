import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, X, Eye, EyeOff, Check } from 'lucide-react';
import { cryptoService } from '../services/crypto';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEncrypted: boolean;
  setIsEncrypted: (val: boolean) => void;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  isOpen,
  onClose,
  isEncrypted,
  setIsEncrypted
}) => {
  const [passphrase, setPassphrase] = useState<string>(cryptoService.getPassphrase());
  const [showPass, setShowPass] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (passphrase.trim().length < 6) return;
    await cryptoService.setPassphrase(passphrase.trim());
    setIsEncrypted(true);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let key = '';
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassphrase(key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">End-to-End Encryption</h3>
              <p className="text-[11px] text-slate-400">Zero-Trust Web Crypto AES-GCM 256-Bit</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
            All chunks are ciphered locally on your device with an ephemeral 96-bit IV before transmission over WebRTC Data Channels. Remote peers must share the same passphrase to decrypt.
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Shared Encryption Passphrase</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter secret passphrase (min 6 chars)..."
                className="w-full h-11 pl-10 pr-20 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={generateRandomKey}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Generate Random Key
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEncrypted(false);
                onClose();
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              Disable Encryption
            </button>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={passphrase.trim().length < 6}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved!
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Enable Encryption
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
