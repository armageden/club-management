'use client';

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';

export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile Sidebar Overlay */}
      <MobileSidebar />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          'lg:ml-64'
        )}
      >
        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}