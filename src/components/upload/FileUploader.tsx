import React, { useMemo, useRef, useState } from 'react';

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
};

const ALLOWED_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'webp',
  'pdf',
  'xls', 'xlsx', 'csv',
  'txt', 'log'
];

function getExt(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return '';
  return name.slice(idx + 1).toLowerCase();
}

function isAllowed(file: File) {
  const ext = getExt(file.name);
  return ALLOWED_EXTENSIONS.includes(ext);
}

function formatBytes(bytes: number) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}

export function FileUploader({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = useMemo(() => {
    return ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',');
  }, []);

  const addFiles = (incoming: File[]) => {
    const rejected = incoming.filter((f) => !isAllowed(f));
    const accepted = incoming.filter((f) => isAllowed(f));

    if (rejected.length > 0) {
      const first = rejected[0];
      const ext = getExt(first.name);
      setError(ext === 'exe'
        ? '실행 파일(.exe)은 업로드할 수 없습니다.'
        : `허용되지 않는 파일 형식입니다: ${first.name}`
      );
    } else {
      setError(null);
    }

    if (accepted.length === 0) return;
    const next = [...files, ...accepted];
    onChange(next);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const incoming = Array.from(e.dataTransfer.files ?? []);
    addFiles(incoming);
  };

  return (
    <div className="uploader">
      <input
        ref={inputRef}
        className="uploader__input"
        type="file"
        multiple
        accept={accept}
        onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
      />

      <div
        className={`uploader__drop ${isDragging ? 'is-dragging' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={onDrop}
      >
        <div className="uploader__title">파일을 여기로 드래그&드롭</div>
        <div className="uploader__desc">
          또는{' '}
          <button type="button" className="uploader__btn" onClick={() => inputRef.current?.click()}>
            파일 선택
          </button>
        </div>
        <div className="uploader__help">
          허용: 이미지(png/jpg/webp), PDF, 엑셀(xls/xlsx/csv), 로그(txt/log) · 실행 파일(.exe 등)은 차단
        </div>
      </div>

      {error && <div className="write-error">{error}</div>}

      {files.length > 0 && (
        <ul className="write-filelist">
          {files.map((f) => (
            <li key={`${f.name}-${f.size}`} className="write-fileitem">
              <span className="write-fileitem__name">{f.name}</span>
              <span className="write-fileitem__meta">{formatBytes(f.size)}</span>
              <button
                type="button"
                className="uploader__remove"
                onClick={() => onChange(files.filter((x) => !(x.name === f.name && x.size === f.size)))}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


