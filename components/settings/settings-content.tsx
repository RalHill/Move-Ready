"use client";

import { useState, useEffect } from "react";
import { User, Globe, Bell as BellIcon, Palette, Save } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import toast from "react-hot-toast";
import type { UserRole } from "@/types/domain";

interface UserSettings {
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY";
  timeFormat: "12h" | "24h";
  notifications: {
    urgentJobs: boolean;
    crewDelays: boolean;
    jobCompletion: boolean;
    systemAnnouncements: boolean;
  };
}

interface SettingsContentProps {
  userEmail: string;
  userRole: UserRole;
}

export function SettingsContent({ userEmail, userRole }: SettingsContentProps) {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    timezone: "America/Toronto",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    notifications: {
      urgentJobs: true,
      crewDelays: true,
      jobCompletion: false,
      systemAnnouncements: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  function handleSaveSettings() {
    setIsSaving(true);
    localStorage.setItem("user_settings", JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully!");
    }, 500);
  }

  function getRoleDisplay(role: UserRole) {
    switch (role) {
      case "dispatcher":
        return "Senior Dispatcher";
      case "manager":
        return "Operations Manager";
      case "driver":
        return "Driver";
      default:
        return role;
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your account preferences and notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={getRoleDisplay(userRole)}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Regional Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings({ ...settings, timezone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="America/Toronto">Toronto (EST)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="America/Chicago">Chicago (CST)</option>
                <option value="America/Denver">Denver (MST)</option>
                <option value="America/Los_Angeles">Los Angeles (PST)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["MM/DD/YYYY", "DD/MM/YYYY"] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() =>
                      setSettings({ ...settings, dateFormat: format })
                    }
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      settings.dateFormat === format
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["12h", "24h"] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() =>
                      setSettings({ ...settings, timeFormat: format })
                    }
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      settings.timeFormat === format
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {format === "12h" ? "12-hour (AM/PM)" : "24-hour"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BellIcon size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "urgentJobs" as const,
                label: "Urgent Job Alerts",
                description: "Get notified when jobs are running late",
              },
              {
                key: "crewDelays" as const,
                label: "Crew Delays",
                description: "Alerts when crews report delays or issues",
              },
              {
                key: "jobCompletion" as const,
                label: "Job Completion",
                description: "Confirmation when jobs are completed",
              },
              {
                key: "systemAnnouncements" as const,
                label: "System Announcements",
                description: "Important updates and maintenance notices",
              },
            ].map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {description}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        [key]: !settings.notifications[key],
                      },
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications[key]
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications[key]
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Appearance
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Theme
            </label>
            <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium capitalize">
                {theme} Mode
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use the theme toggle in the header to switch between light and
                dark modes
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
