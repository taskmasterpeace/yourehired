"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FooterProps {
  isDarkMode: boolean;
  toggleDarkMode: (checked: boolean) => void; // Updated to match the actual function signature
}

const Footer = ({ isDarkMode, toggleDarkMode }: FooterProps) => {
  return (
    <footer
      className={`mt-8 py-4 border-t ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } mb-3 sm:mb-0`}
          >
            © 2025 Hey You're Hired!
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                id="footer-dark-mode"
              />
              <Label
                htmlFor="footer-dark-mode"
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </Label>
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <a
                href="#"
                className={`hover:text-blue-400 mr-3 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Privacy
              </a>
              <a
                href="#"
                className={`hover:text-blue-400 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
