import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Radio, 
  Send, 
  CheckSquare, 
  Square, 
  Wifi, 
  Zap, 
  RefreshCw,
  Users
} from 'lucide-react';
import { Device } from '../types';

interface DeviceRadarProps {
  devices: Device[];
  selectedDeviceIds: string[];
  onToggleSelectDevice: (deviceId: string) => void;
  onSelectAllDevices: () => void;
  onSendToDevice: (device: Device) => void;
  onRefreshDevices: () => void;
  isScanning: boolean;
}

export const DeviceRadar: React.FC<DeviceRadarProps> = ({
  devices,
  selectedDeviceIds,
  onToggleSelectDevice,
  onSelectAllDevices,
  onSendToDevice,
  onRefreshDevices,
  isScanning
}) => {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-indigo-500" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-purple-500" />;
      default:
        return <Laptop className="w-5 h-5 text-blue-500" />;
    }
  };

  const isAllSelected = devices.length > 0 && selectedDeviceIds.length === devices.length;

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Zero-Config LAN Radar</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Discovered Local Peers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Devices connected to your local Wi-Fi or subnet are automatically discovered without cloud servers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSelectAllDevices}
            disabled={devices.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
            <span>Select All for Broadcast</span>
          </button>

          <button
            onClick={onRefreshDevices}
            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
            title="Scan Again"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Discovered Device Grid */}
      {devices.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-200 shadow-xs relative overflow-hidden">
          {/* Subtle Radar Ring Animation */}
          <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-100 opacity-40 radar-ping"></div>
            <div className="absolute inset-4 rounded-full bg-blue-200 opacity-60 radar-ping" style={{ animationDelay: '0.8s' }}></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <h3 className="font-extrabold text-slate-800 text-base mb-1">Scanning Local Subnet...</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Open this web page on another laptop, phone, or tablet connected to the same Wi-Fi to begin instant peer-to-peer file transfers!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const isSelected = selectedDeviceIds.includes(device.id);
            return (
              <div
                key={device.id}
                className={`bg-white rounded-2xl p-5 border transition-all relative ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm'
                }`}
              >
                {/* Checkbox for multi-device broadcast */}
                <div
                  onClick={() => onToggleSelectDevice(device.id)}
                  className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-blue-600"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="min-w-0 pr-6">
                    <h3 className="font-bold text-sm text-slate-900 truncate" title={device.name}>
                      {device.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize">{device.os}</span>
                      <span>•</span>
                      <span>{device.browser}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-500 flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Direct WebRTC Ready
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {device.ip ? device.ip.replace('::ffff:', '') : 'Local IP'}
                  </span>
                </div>

                <button
                  onClick={() => onSendToDevice(device)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send File Direct</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
