/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubKegiatanView } from './components/SubKegiatanView';
import { PDView } from './components/PDView';
import { MMView } from './components/MMView';
import { DPAView } from './components/DPAView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'subkegiatan' && <SubKegiatanView />}
            {activeTab === 'pd' && <PDView />}
            {activeTab === 'mm' && <MMView />}
            {activeTab === 'dpa' && <DPAView />}
          </div>
        </main>
      </div>
    </div>
  );
}
