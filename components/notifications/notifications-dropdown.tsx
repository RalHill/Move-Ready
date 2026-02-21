"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: "urgent" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsDropdownProps {
  onClose: () => void;
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "urgent",
      title: "Job Running Late",
      message: "Smith residence move is 30 minutes behind schedule",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Job Completed",
      message: "Crew Alpha completed Johnson apartment move",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "New Job Assigned",
      message: "Crew Beta assigned to Garcia residence",
      timestamp: new Date(Date.now() - 120 * 60 * 1000),
      read: true,
    },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  function getIcon(type: Notification["type"]) {
    switch (type) {
      case "urgent":
        return <AlertTriangle size={18} className="text-red-600" />;
      case "success":
        return <CheckCircle size={18} className="text-green-600" />;
      case "info":
        return <Info size={18} className="text-blue-600" />;
    }
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Notifications
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No notifications
            </p>
          </div>
        ) : (
          mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {format(notification.timestamp, "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium w-full text-center">
          View All Notifications
        </button>
      </div>
    </div>
  );
}
