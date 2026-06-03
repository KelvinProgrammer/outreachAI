import React, { useState } from 'react';
import { ShieldCheck, HardDrive, RefreshCw, Cpu } from 'lucide-react';

interface ProxyStatusCardProps {
  isScraping: boolean;
}

export const ProxyStatusCard: React.FC<ProxyStatusCardProps> = ({ isScraping }) => {
  const [selectedNode, setSelectedNode] = useState('Frankfurt-AWS-B3');
  const [ipAddress, setIpAddress] = useState('18.232.14.208');
  const [isRotating, setIsRotating] = useState(false);

  const nodes = [
    { name: 'Frankfurt-AWS-B3', ip: '18.232.14.208', status: 'OPTIMAL' },
    { name: 'NewYork-GCP-US4', ip: '34.74.88.192', status: 'OPTIMAL' },
    { name: 'Tokyo-Linode-JP', ip: '139.162.115.42', status: 'STABLE' },
    { name: 'Zurich-Azure-CH', ip: '51.107.45.15', status: 'LOW_LATENCY' },
  ];

  const handleRotateProxy = () => {
    setIsRotating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * nodes.length);
      const nextNode = nodes[randomIndex];
      setSelectedNode(nextNode.name);
      setIpAddress(nextNode.ip);
      setIsRotating(false);
    }, 800);
  };

  return (
    <div className="bg-[#171f33] rounded-xl border border-[#3b494c] overflow-hidden relative group flex flex-col h-full min-h-[350px]">
      {/* Background Graphic */}
      <div className="absolute inset-x-0 top-0 h-44 overflow-hidden">
        <img
          className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMfMnvx2Q8tzDlp1EtqMvilu95-1jTMbbqgJnvoVDCutkSkJbpX5Ot88I6J4bf11aUjK6h2zR_gP9tkHxLOZXokGV9U2MFFhwWriDCy9iiOQ4pyzrgjbLaGZ3dKlty4kai8oPMI1azp0y7pEBuq35i_-p61nQkSa2SR9lypqpLi9DwCfhuwyWqyn0s3_jVnY32udrr7E32jOFKhoVog1seBMISBIpfC7cPpOiv2JPwFmgM5OTNnNe3rfv8vG4dVCs4hlyK1NHZ_fo"
          alt="Secure Server Rack Graphic"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171f33] to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative p-6 flex flex-col flex-1 justify-between z-10">
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className="font-mono text-[10px] text-[#00daf3] bg-[#131b2e]/90 backdrop-blur border border-[#00daf3]/30 px-2 py-1 rounded inline-flex items-center gap-1">
              <Cpu size={10} className="animate-spin duration-3000" />
              SYSTEM STATUS: {isScraping ? 'ACTIVE_SCRAPING' : 'OPTIMAL'}
            </span>
            <button
              onClick={handleRotateProxy}
              disabled={isRotating}
              className="text-xs text-[#9cf0ff] hover:text-white bg-[#0b1326] px-2 py-1 rounded border border-[#3b494c] transition-colors flex items-center gap-1 hover:border-[#00daf3]/50 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={11} className={isRotating ? 'animate-spin' : ''} />
              Rotate IP
            </button>
          </div>

          <h4 className="font-display text-lg font-semibold text-white tracking-tight flex items-center gap-2 mt-40">
            <ShieldCheck size={18} className="text-[#4edea3]" />
            Active Node 0x7F
          </h4>
          <p className="font-sans text-xs text-[#bac9cc] mt-1 leading-relaxed">
            Global proxy rotation is continuously active. Your outbound scrape requests are safely masked behind our high-speed private enterprise proxy networks.
          </p>
        </div>

        {/* Technical Sub-details */}
        <div className="mt-6 pt-4 border-t border-[#3b494c]/60 space-y-2 font-mono text-[11px] text-[#bac9cc]">
          <div className="flex justify-between">
            <span className="text-slate-400">EGRESS LOCATION:</span>
            <span className="text-[#9cf0ff] font-semibold">{selectedNode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ACTIVE IP:</span>
            <span className="text-[#c0c1ff] font-semibold">{ipAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ROUTING TUNNEL:</span>
            <span className="text-[#4edea3] flex items-center gap-1 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
              SECURE_AES256
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
