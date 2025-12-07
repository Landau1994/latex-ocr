export interface ConversionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export interface ImageFile {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}
