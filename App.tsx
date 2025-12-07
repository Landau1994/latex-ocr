import React, { useState } from 'react';
import { Settings, Wand2, Github, Languages, Cpu } from 'lucide-react';
import ImageInput from './components/ImageInput';
import LatexOutput from './components/LatexOutput';
import TemplateEditor from './components/TemplateEditor';
import { convertImagesToLatex } from './services/geminiService';
import { DEFAULT_PREAMBLE, DEFAULT_PRESERVED_TERMS } from './constants';
import { ImageFile, ConversionState } from './types';

function App() {
  const [preamble, setPreamble] = useState(DEFAULT_PREAMBLE);
  const [preservedTerms, setPreservedTerms] = useState(DEFAULT_PRESERVED_TERMS);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Default to true as per user request for auto translation
  const [translateToChinese, setTranslateToChinese] = useState(true);
  // Default to Gemini 3 Pro as requested
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [latexOutput, setLatexOutput] = useState('');
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: 'idle',
  });

  const handleConvert = async () => {
    if (imageFiles.length === 0) return;

    setConversionState({ status: 'loading' });
    setLatexOutput('');

    try {
      // Extract valid base64 strings
      const base64List = imageFiles
        .map(img => img.base64)
        .filter((b): b is string => b !== null);

      if (base64List.length === 0) {
         throw new Error("Invalid image data");
      }

      const result = await convertImagesToLatex(
        base64List, 
        preamble, 
        translateToChinese, 
        preservedTerms,
        selectedModel // Pass selected model
      );
      setLatexOutput(result);
      setConversionState({ status: 'success' });
    } catch (error: any) {
      setConversionState({ 
        status: 'error', 
        errorMessage: error.message || "Something went wrong." 
      });
    }
  };

  const handleSaveSettings = (newPreamble: string, newTerms: string) => {
    setPreamble(newPreamble);
    setPreservedTerms(newTerms);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <span className="font-mono font-bold text-lg">TeX</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">LaTeX OCR Pro</h1>
              <p className="text-xs text-slate-500 font-medium">
                Powered by {selectedModel.includes('3') ? 'Gemini 3' : 'Gemini 2.5'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">全局设置</span>
            </button>
            <a 
               href="#"
               className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
               title="View Source"
            >
               <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)] min-h-[500px]">
          
          {/* Left Column: Input */}
          <div className="flex flex-col gap-4">
            <ImageInput imageFiles={imageFiles} setImageFiles={setImageFiles} />
            
            {/* Controls Area */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                {/* Model Selector */}
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-slate-700">
                        <Cpu size={18} className="text-indigo-600" />
                        <span className="text-sm font-medium">模型选择</span>
                    </div>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <option value="gemini-3-pro-preview">Gemini 3 Pro (高精度)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (快速)</option>
                    </select>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Translation Mode */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Languages size={18} className="text-indigo-600" />
                        <span className="text-sm font-medium">翻译输出</span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <span className={`text-xs font-medium transition-colors ${!translateToChinese ? 'text-slate-900' : 'text-slate-400'}`}>
                            原文
                        </span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={translateToChinese}
                                onChange={(e) => setTranslateToChinese(e.target.checked)}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${translateToChinese ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${translateToChinese ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className={`text-xs font-medium transition-colors ${translateToChinese ? 'text-indigo-600' : 'text-slate-400'}`}>
                            译文
                        </span>
                    </label>
                </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={imageFiles.length === 0 || conversionState.status === 'loading'}
              className={`w-full py-3 px-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                imageFiles.length === 0 || conversionState.status === 'loading'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-300'
              }`}
            >
              {conversionState.status === 'loading' ? (
                <>正在处理...</>
              ) : (
                <>
                  <Wand2 size={20} />
                  开始识别 ({imageFiles.length} 张)
                </>
              )}
            </button>
            
            {/* Disclaimer */}
            <p className="text-xs text-center text-slate-400">
              提示：Gemini 3 Pro 处理复杂数学公式效果更佳，但速度稍慢。
            </p>
          </div>

          {/* Right Column: Output */}
          <div className="h-full">
            <LatexOutput 
              latex={latexOutput} 
              isLoading={conversionState.status === 'loading'} 
              error={conversionState.errorMessage}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <TemplateEditor
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentPreamble={preamble}
        currentPreservedTerms={preservedTerms}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;