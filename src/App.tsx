import { useState } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Viewport from './components/viewport/Viewport';
import Inspector from './components/layout/Inspector';
import Timeline from './components/layout/Timeline';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-rds-bg text-rds-text text-sm overflow-hidden">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <section className="flex-1 flex flex-col relative border-x border-rds-border">
          <Viewport />
          <Timeline />
        </section>

        <Inspector />
      </main>
    </div>
  );
}

export default App;
