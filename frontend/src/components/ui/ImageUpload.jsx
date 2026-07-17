import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ImageUpload({
  images = [],
  onChange,
  maxImages = 5,
  label = 'Upload Images',
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState('');

  const processFiles = useCallback(
    (files) => {
      setSizeError('');
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        setSizeError(`Maximum ${maxImages} images allowed.`);
        return;
      }

      const toProcess = fileArray.slice(0, remaining);
      const errors = [];
      const newImages = [];

      for (const file of toProcess) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          errors.push(`"${file.name}" is not a valid image type (JPEG, PNG, WebP only).`);
          continue;
        }
        if (file.size > MAX_SIZE_BYTES) {
          errors.push(`"${file.name}" exceeds the 5 MB size limit.`);
          continue;
        }
        newImages.push({
          preview: URL.createObjectURL(file),
          file,
          url: null,
        });
      }

      if (errors.length > 0) {
        setSizeError(errors[0]);
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onChange]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemove = (index) => {
    const img = images[index];
    if (img.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(img.preview);
    }
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    setSizeError('');
  };

  const isFull = images.length >= maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="input-label mb-0">{label}</span>
        <span className="text-xs text-surface-500 font-medium">
          {images.length}/{maxImages} images
        </span>
      </div>

      {!isFull && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'relative flex flex-col items-center justify-center gap-3',
            'border-2 border-dashed rounded-2xl px-6 py-12 cursor-pointer',
            'transition-all duration-200',
            isDragging
              ? 'border-primary-500 bg-primary-50 scale-[1.01]'
              : 'border-border bg-surface-50 hover:border-primary-300 hover:bg-white',
          ].join(' ')}
        >
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-1 shadow-sm">
            <Upload className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-sm font-medium text-surface-700">
            {isDragging ? 'Drop images here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-surface-400 text-center">
            JPEG, PNG, WebP · Max 5 MB per image · Up to {maxImages} images
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {sizeError && (
        <p className="text-xs font-medium text-danger-500 flex items-center gap-1.5 mt-2">
          <span>⚠</span> {sizeError}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group rounded-2xl overflow-hidden border border-border bg-surface-50 aspect-video shadow-sm"
            >
              {img.preview ? (
                <img
                  src={img.preview}
                  alt={`Upload preview ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-surface-300" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className={[
                  'absolute top-2 right-2 w-7 h-7 rounded-full',
                  'bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm',
                  'text-surface-500 hover:text-danger-500',
                  'transition-all duration-150',
                  'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100',
                ].join(' ')}
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-surface-900/60 backdrop-blur-md text-[10px] font-medium text-white">
                {index + 1}
              </div>
            </div>
          ))}

          {!isFull && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={[
                'flex flex-col items-center justify-center gap-2 aspect-video',
                'rounded-2xl border-2 border-dashed border-border',
                'bg-surface-50 hover:border-primary-300 hover:bg-white',
                'text-surface-500 hover:text-primary-500 transition-all duration-200 shadow-sm',
              ].join(' ')}
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs font-medium">Add more</span>
            </button>
          )}
        </div>
      )}

      {isFull && (
        <p className="text-xs text-surface-400 text-center font-medium mt-4">
          Maximum images reached. Remove one to add another.
        </p>
      )}
    </div>
  );
}
