import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  FileText, 
  Award, 
  Settings,
  BarChart
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* App Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
          <span className="font-bold text-xl">Hey You're Hired!</span>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          <li>
            <Link href="/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
              <LayoutDashboard className="h-5 w-5 mr-3" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/opportunities" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
              <Briefcase className="h-5 w-5 mr-3" />
              <span>Opportunities</span>
            </Link>
          </li>
          <li>
            <Link href="/resume" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
              <FileText className="h-5 w-5 mr-3" />
              <span>Master Resume</span>
            </Link>
          </li>
          <li>
            <Link href="/calendar" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
              <Calendar className="h-5 w-5 mr-3" />
              <span>Calendar</span>
            </Link>
          </li>
          <li>
            <Link href="/achievements" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
              <Award className="h-5 w-5 mr-3" />
              <span>Achievements</span>
            </Link>
          </li>
          <li>
            <Link href="/analytics" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
              <BarChart className="h-5 w-5 mr-3" />
              <span>Analytics</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Bottom Section with Notification Bell and Settings */}
      <div className="p-4 border-t border-gray-800 flex justify-between items-center">
        {/* Add NotificationBell with sidebar styling */}
        <NotificationBell variant="sidebar" />
        
        <Link href="/settings" className="p-2 rounded-md hover:bg-gray-800 transition-colors">
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
