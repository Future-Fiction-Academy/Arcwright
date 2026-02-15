import React, { useRef } from 'react';

export default function ExportImportControls({ data, onImport, exportFilename = 'export.json', label = 'Data' }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImport(parsed);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="text-sm bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-semibold"
      >
        Export {label}
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-sm bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded font-semibold"
      >
        Import {label}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
