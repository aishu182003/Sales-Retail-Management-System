import React, { useState } from 'react';
import { phpProjectFiles } from '../data/phpProjectFiles';
import JSZip from 'jszip';
import {
  FolderArchive,
  Download,
  Copy,
  Check,
  FileCode,
  Database,
  FolderCheck,
  Server,
  Layers,
} from 'lucide-react';

export const PhpCodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const currentFile = phpProjectFiles[selectedFileIndex] || phpProjectFiles[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('smart_retail');

      phpProjectFiles.forEach((f) => {
        const relativePath = f.path.startsWith('/') ? f.path.slice(1) : f.path;
        folder?.file(relativePath, f.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smart_retail_xampp_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Could not generate ZIP file.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Deployment & Download Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  XAMPP PHP &amp; MySQL Project Source Code
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready for C:\xampp\htdocs\smart_retail
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Full standalone PHP, MySQL (PDO), and Chart.js code runnable without Node/npm directly in XAMPP.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Compressing Files...' : 'Download Project .ZIP (1-Click)'}</span>
          </button>
        </div>

        {/* Quick Setup 3-Step Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-emerald-700 flex items-center gap-1.5">
              <FolderCheck className="w-4 h-4" /> Step 1: Extract Files
            </div>
            <p className="text-slate-600 text-[11px]">
              Extract the downloaded ZIP directly into your XAMPP web directory:
              <br />
              <code className="text-slate-900 font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px] font-bold">
                C:\xampp\htdocs\smart_retail
              </code>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-blue-700 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Step 2: Import MySQL DB
            </div>
            <p className="text-slate-600 text-[11px]">
              In phpMyAdmin (<code>http://localhost/phpmyadmin</code>), create database{' '}
              <strong className="text-slate-900 font-mono">smart_retail</strong> and import{' '}
              <code className="text-slate-900 font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">
                sql/schema.sql
              </code>{' '}
              and{' '}
              <code className="text-slate-900 font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">
                sql/sample_data.sql
              </code>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-amber-700 flex items-center gap-1.5">
              <Server className="w-4 h-4" /> Step 3: Run in Browser
            </div>
            <p className="text-slate-600 text-[11px]">
              Open browser and visit{' '}
              <code className="text-slate-900 font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px] font-bold">
                http://localhost/smart_retail/
              </code>
              <br />
              Log in with: <strong>admin</strong> / <strong>admin123</strong> or <strong>owner</strong> / <strong>owner123</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Tree Left (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Project Files ({phpProjectFiles.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono font-medium">smart_retail/</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
            {phpProjectFiles.map((file, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left p-2.5 transition-colors flex items-start gap-2 text-xs ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 border-l-3 border-emerald-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <div className="overflow-hidden">
                    <div className="font-mono font-semibold truncate text-[11px]">{file.path}</div>
                    <div className="text-[10px] text-slate-500 truncate">{file.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Right (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* File Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-mono text-xs font-bold text-emerald-700 truncate">
                {currentFile.path}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-semibold">
                {currentFile.category.toUpperCase()}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Area with subtle dark code styling for high contrast readability */}
          <div className="p-4 overflow-x-auto max-h-[540px] text-xs font-mono bg-slate-900 text-slate-200 leading-relaxed select-text">
            <pre className="whitespace-pre">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
