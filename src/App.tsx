/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, Monitor, Code2, Play, Info, Download, CheckCircle2, Layers, Cpu, Shield } from 'lucide-react';
import { TicTacToeGame } from './components/TicTacToeGame';
import { CodeViewer } from './components/CodeViewer';
import { soundEngine } from './components/AudioEngine';

type ActiveTab = 'GAME' | 'CODE' | 'ABOUT';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('GAME');
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    soundEngine.playClick();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header (Zone 1: Brand wordmark, Zone 2: Navigation, Zone 3: Actions) */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-black text-lg shadow-sm shadow-cyan-500/20">
              <span className="text-cyan-400">X</span>
              <span className="text-rose-500 text-sm ml-0.5">O</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Neon Tic-Tac-Toe
              </h1>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Hotseat Python & Android APK
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented Tabs */}
          <nav className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800/80 rounded-xl">
            <button
              onClick={() => handleTabChange('GAME')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'GAME'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Играть</span>
            </button>

            <button
              onClick={() => handleTabChange('CODE')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'CODE'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Код & APK</span>
            </button>

            <button
              onClick={() => handleTabChange('ABOUT')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'ABOUT'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Спецификация</span>
            </button>
          </nav>

          {/* Zone 3: Quick Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('CODE')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Скачать проект</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* TAB 1: GAMEPLAY */}
        {activeTab === 'GAME' && (
          <div className="flex flex-col items-center gap-6 my-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between w-full max-w-[480px] px-2 text-xs">
              <span className="text-slate-400 font-medium">
                Режим Hotseat: 2 игрока на одном устройстве
              </span>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setPhoneFrameMode(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    phoneFrameMode
                      ? 'bg-slate-800 text-cyan-300 font-medium shadow-xs'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Вид в корпусе смартфона"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Телефон</span>
                </button>
                <button
                  onClick={() => setPhoneFrameMode(false)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    !phoneFrameMode
                      ? 'bg-slate-800 text-cyan-300 font-medium shadow-xs'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Широкий адаптивный вид"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Планшет</span>
                </button>
              </div>
            </div>

            {/* Smartphone Case Frame (when enabled) */}
            {phoneFrameMode ? (
              <div className="relative p-3 sm:p-4 rounded-[42px] bg-slate-900 border-4 border-slate-800 shadow-2xl shadow-cyan-950/40">
                {/* Speaker & camera bezel */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-b-xl z-30 flex items-center justify-center gap-3">
                  <div className="w-8 h-1 rounded-full bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                </div>

                {/* Inner screen content */}
                <TicTacToeGame isPhoneFrame={true} />
              </div>
            ) : (
              <TicTacToeGame isPhoneFrame={false} />
            )}

            {/* Quick Helper Notes */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 text-center max-w-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Игрок 1 играет синими крестиками (X)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Игрок 2 играет розовыми ноликами (O)
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: CODE & APK STUDIO */}
        {activeTab === 'CODE' && <CodeViewer />}

        {/* TAB 3: SPECIFICATION & ARCHITECTURE */}
        {activeTab === 'ABOUT' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Архитектура приложения
              </span>
              <h2 className="text-xl font-bold text-white mt-1 mb-3">
                Полная автономность, Kivy 2.3 и компиляция через Buildozer
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Приложение написано на чистом Python с использованием библиотеки Kivy без сторонних бинарных зависимостей, что обеспечивает максимальную совместимость при компиляции в APK на виртуальных машинах GitHub Actions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Движок Kivy 2.3.0
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Использует аппаратное ускорение OpenGL ES 2/3. Каждая клетка — нативный интерактивный виджет с индивидуальной векторной графикой Canvas.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Режим Hotseat на двоих
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Не требует интернета и Bluetooth. Игроки передают телефон друг другу. Очередность первого хода автоматически чередуется в каждом раунде.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  GitHub Actions CI/CD
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Конфигурация buildozer.spec настроена на целевой Android API 34 и процессорные архитектуры ARM64-v8a и ARMv7 (охват 99%+ смартфонов).
                </p>
              </div>
            </div>

            {/* Checklist of features */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <h3 className="text-base font-bold text-white mb-4">
                Реализованные требования технического задания:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                {[
                  'Классическая сетка 3х3 с адаптивным масштабированием',
                  'Поочередный режим ходов (Игрок 1 - X, Игрок 2 - O)',
                  'Индикатор очереди и динамический счетчик побед/ничьих',
                  'Автоматическая проверка выигрышных линий (8 комбинаций)',
                  'Экран победы / ничьей с возможностью реванша в 1 клик',
                  'Кнопки «Новая игра» и «Сбросить счёт» без перезапуска',
                  'Современная тёмная неоновая палитра (Cyan #00F0FF & Coral #FF2E84)',
                  'Плавная анимация появления крестиков и ноликов',
                  'Готовый buildozer.spec под Android API 34 и портретную ориентацию',
                  'Автоматический скрипт сборки .github/workflows/build-apk.yml',
                ].map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Крестики-Нолики Hotseat · Python + Kivy · Готово для сборки APK</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>ARM64 / ARMv7</span>
            <span aria-hidden="true">·</span>
            <span>Android API 34</span>
            <span aria-hidden="true">·</span>
            <span>100% Автономно</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
