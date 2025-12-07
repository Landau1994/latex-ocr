import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Clipboard, X, Plus, Trash2 } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageInputProps {
  imageFiles: ImageFile[];
  setImageFiles: (imgs: ImageFile[]) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ imageFiles, setImageFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle global paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const newFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            newFiles.push(file);
          }
        }
      }
      if (newFiles.length > 0) {
        processFiles(newFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFiles]);

  const processFiles = (files: File[]) => {
    const newImageFiles: ImageFile[] = [];
    let processedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImageFiles.push({
          file: file,
          previewUrl: URL.createObjectURL(file),
          base64: reader.result as string,
        });
        processedCount++;
        
        // When all files are processed, update state by appending
        if (processedCount === files.length) {
          setImageFiles([...imageFiles, ...newImageFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFilesList = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (imageFilesList.length > 0) {
        processFiles(imageFilesList);
      }
    }
  };

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = [...imageFiles];
    // Revoke object URL to avoid memory leaks
    if (newFiles[index].previewUrl) {
      URL.revokeObjectURL(newFiles[index].previewUrl!);
    }
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    
    // Reset input value to allow re-uploading the same file if needed
    if (fileInputRef.current && newFiles.length === 0) {
       fileInputRef.current.value = '';
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    imageFiles.forEach(img => img.previewUrl && URL.revokeObjectURL(img.previewUrl));
    setImageFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          输入图片 ({imageFiles.length})
        </h2>
        {imageFiles.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} />
            清空所有
          </button>
        )}
      </div>

      <div
        className={`relative flex-1 rounded-xl border-2 transition-all duration-200 overflow-hidden flex flex-col ${
          imageFiles.length > 0
            ? 'border-slate-200 bg-slate-50'
            : isDragging
            ? 'border-indigo-500 bg-indigo-50 border-dashed'
            : 'border-slate-300 border-dashed hover:border-indigo-400 hover:bg-slate-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFiles(Array.from(e.target.files));
            }
          }}
        />

        {imageFiles.length > 0 ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imageFiles.map((img, index) => (
                <div key={index} className="group relative aspect-[3/4] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="absolute top-1 left-2 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    {index + 1}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl || ''}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => removeImage(index, e)}
                    className="absolute top-1 right-1 p-1.5 bg-white/90 text-slate-500 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {/* Add More Button inside grid */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
              >
                <Plus size={24} className="mb-1" />
                <span className="text-xs font-medium">添加更多</span>
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-100'}`}>
              <Upload size={32} />
            </div>
            <p className="font-medium text-slate-600 mb-1">
              {isDragging ? '释放以添加' : '点击或拖拽多张图片'}
            </p>
            <p className="text-sm text-slate-400">支持批量上传 • 按顺序合并</p>
            <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs text-slate-500">
                    <ImageIcon size={12} className="mr-1"/> .PNG / .JPG
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs text-slate-500">
                    <Clipboard size={12} className="mr-1"/> Ctrl+V
                </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageInput;