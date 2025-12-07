import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, FileText, Languages } from 'lucide-react';
import { DEFAULT_PREAMBLE, DEFAULT_PRESERVED_TERMS } from '../constants';

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreamble: string;
  currentPreservedTerms: string;
  onSave: (newPreamble: string, newPreservedTerms: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  isOpen,
  onClose,
  currentPreamble,
  currentPreservedTerms,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'preamble' | 'translation'>('preamble');
  const [preambleValue, setPreambleValue] = useState(currentPreamble);
  const [termsValue, setTermsValue] = useState(currentPreservedTerms);

  // Sync state when prop changes or modal opens
  useEffect(() => {
    setPreambleValue(currentPreamble);
    setTermsValue(currentPreservedTerms);
  }, [currentPreamble, currentPreservedTerms, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (activeTab === 'preamble') {
      setPreambleValue(DEFAULT_PREAMBLE);
    } else {
      setTermsValue(DEFAULT_PRESERVED_TERMS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">设置 (Settings)</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('preamble')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'preamble' ? 'text-indigo-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <FileText size={16} />
            LaTeX 模板配置
            {activeTab === 'preamble' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
          </button>
          <button
            onClick={() => setActiveTab('translation')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'translation' ? 'text-indigo-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <Languages size={16} />
            翻译规则配置
            {activeTab === 'translation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'preamble' ? (
            <>
              <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                 在此处定义您的 LaTeX 环境、宏包和页面设置。AI 将生成的代码与此模板兼容。
              </div>
              <div className="flex-1 p-0 overflow-hidden">
                <textarea
                  value={preambleValue}
                  onChange={(e) => setPreambleValue(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 custom-scrollbar text-slate-800 bg-white"
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  保留原文的术语 (英文)
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  在翻译模式下，以下术语将严格保持英文原样，不进行翻译。请用英文逗号分隔。
                </p>
                <textarea
                  value={termsValue}
                  onChange={(e) => setTermsValue(e.target.value)}
                  className="w-full h-40 p-3 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例如: adeles, ideles, adelic"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">注意：</h4>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li><strong>外国人名</strong> (如 James Arthur) 会默认保留英文，无需在此处添加。</li>
                  <li><strong>标题</strong> 会默认生成“中文 (English)”的双语格式。</li>
                  <li>此处仅需添加那些没有通用中文译名、或您希望强制保留英文的特定数学名词。</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw size={16} />
            恢复{activeTab === 'preamble' ? '默认模板' : '默认术语'}
          </button>
          <div className="flex gap-3">
             <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                onSave(preambleValue, termsValue);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Save size={16} />
              保存全部设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;