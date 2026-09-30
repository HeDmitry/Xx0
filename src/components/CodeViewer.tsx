import React, { useState } from 'react';
import JSZip from 'jszip';
import { Copy, Check, Download, FileCode, Terminal, HelpCircle, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { PROJECT_FILES, ProjectFile } from '../data/projectFiles';
import { soundEngine } from './AudioEngine';

export const CodeViewer: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const activeFile: ProjectFile = PROJECT_FILES[activeFileIndex];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      soundEngine.playClick();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    soundEngine.playClick();

    try {
      const zip = new JSZip();

      // Add files with their paths
      PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'TicTacToe-Hotseat-Python-APK.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner: Quick Summary & 1-Click ZIP Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
              Готово к компиляции
            </span>
            <span className="text-xs text-slate-400">Python 3.9+ · Kivy 2.3.0 · Buildozer</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Комплект файлов для сборки Android APK через GitHub Actions
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-0.5">
            Все файлы автономны и готовы для загрузки в ваш репозиторий GitHub. Облачный раннер GitHub Actions автоматически соберёт .apk файл.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Упаковка ZIP...' : 'Скачать проект (.zip)'}</span>
        </button>
      </div>

      {/* Main Code Studio: Left/Top File Selector, Main Code Editor view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: File Tabs & GitHub Actions Guide */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Файлы проекта
            </span>

            <div className="flex flex-col gap-1.5">
              {PROJECT_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    soundEngine.playClick();
                  }}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                    activeFileIndex === idx
                      ? 'bg-slate-800 border border-cyan-500/40 text-white shadow-sm'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${activeFileIndex === idx ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate flex items-center gap-2">
                      <span>{file.name}</span>
                      {file.name === 'main.py' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          UI + игра
                        </span>
                      )}
                      {file.name === 'build-apk.yml' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          CI/CD
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 line-clamp-1 block mt-0.5">
                      {file.path}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step-by-Step GitHub Actions Guide */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Инструкция по сборке APK
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Бесплатно
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {[
                {
                  step: 1,
                  title: 'Создайте репозиторий',
                  desc: 'На github.com нажмите «New repository» (назовите tictactoe).',
                },
                {
                  step: 2,
                  title: 'Загрузите файлы',
                  desc: 'Распакуйте скачанный .zip или скопируйте файлы в корень репозитория.',
                },
                {
                  step: 3,
                  title: 'Запустите GitHub Action',
                  desc: 'Во вкладке «Actions» запустите «Сборка Android APK (Buildozer)».',
                },
                {
                  step: 4,
                  title: 'Заберите готовый .apk',
                  desc: 'Через 10–12 минут скачайте готовый APK из раздела «Artifacts» и установите на телефон!',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  onClick={() => setActiveStep(item.step)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    activeStep === item.step
                      ? 'bg-slate-800/90 border-cyan-500/40 text-slate-200'
                      : 'bg-slate-950/50 border-slate-800/60 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px]">
                      {item.step}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400 pl-7">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Без установки Linux и NDK
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Code Viewer with syntax formatting and line numbers */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
          {/* File Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm font-semibold text-slate-200">
                {activeFile.path}
              </span>
              <span className="text-xs text-slate-500">
                ({activeFile.content.split('\n').length} строк)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Description banner */}
          <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{activeFile.description}</span>
          </div>

          {/* Code Body */}
          <div className="relative overflow-x-auto max-h-[620px] p-4 text-xs font-mono bg-slate-950 text-slate-300 leading-relaxed">
            <pre className="flex">
              {/* Line numbers */}
              <span className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 shrink-0">
                {activeFile.content.split('\n').map((_, i) => (
                  <span key={i} className="block leading-relaxed">
                    {i + 1}
                  </span>
                ))}
              </span>

              {/* Code lines */}
              <code className="pl-4 block whitespace-pre">
                {activeFile.content}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
