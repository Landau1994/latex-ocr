import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

interface LatexOutputProps {
  latex: string;
  isLoading: boolean;
  error?: string;
}

const LatexOutput: React.FC<LatexOutputProps> = ({ latex, isLoading, error }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">LaTeX 输出</h2>
        {latex && !isLoading && (
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制代码'}
          </button>
        )}
      </div>

      <div className="relative flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative w-12 h-12">
               <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">正在识别公式...</p>
          </div>
        ) : error ? (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-500">
             <p className="font-semibold mb-2">识别失败</p>
             <p className="text-sm opacity-80">{error}</p>
           </div>
        ) : latex ? (
          <textarea
            readOnly
            value={latex}
            className="w-full h-full p-4 font-mono text-sm text-slate-800 resize-none focus:outline-none custom-scrollbar bg-slate-50/30"
            spellCheck={false}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-300">
            <FileCode size={48} className="mb-3 opacity-50" />
            <p>等待图片输入...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatexOutput;
