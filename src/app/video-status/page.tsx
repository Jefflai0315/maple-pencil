"use client";

import React, { useState, useEffect } from "react";
import {
  IconRefresh,
  IconDownload,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  VideoGenerationTask,
  getUserVideoTasks,
  checkVideoGenerationStatus,
} from "../utils/videoGeneration";

export default function VideoStatusPage() {
  const [tasks, setTasks] = useState<VideoGenerationTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserInput, setShowUserInput] = useState(true);
  const [pollingTasks, setPollingTasks] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<null | {
    taskId: string;
    status: string;
  }>(null);

  useEffect(() => {
    // Check if user name is stored in localStorage
    const storedUserName = localStorage.getItem("mural-user-name");
    if (storedUserName) {
      setUserName(storedUserName);
      setShowUserInput(false);
      loadUserTasks(storedUserName);
    }
  }, []);

  const loadUserTasks = async (name: string) => {
    setIsLoading(true);
    try {
      const userTasks = await getUserVideoTasks(name);
      setTasks(userTasks);

      // Start polling for active tasks
      const activeTasks = userTasks.filter(
        (task) =>
          task.status === "queuing" ||
          task.status === "preparing" ||
          task.status === "processing"
      );

      if (activeTasks.length > 0) {
        setPollingTasks(new Set(activeTasks.map((task) => task.taskId)));
        startPolling(activeTasks.map((task) => task.taskId));
      }
    } catch (error) {
      console.error("Failed to load user tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (taskIds: string[]) => {
    const pollInterval = setInterval(async () => {
      let hasActiveTasks = false;

      for (const taskId of taskIds) {
        try {
          const statusResponse = await checkVideoGenerationStatus(taskId);
          if (statusResponse.success && statusResponse.task) {
            setTasks((prevTasks) => {
              // Detect transition from in-progress to completed
              const prevTask = prevTasks.find((t) => t.taskId === taskId);
              if (
                prevTask &&
                statusResponse.task &&
                ["queuing", "preparing", "processing"].includes(
                  prevTask.status
                ) &&
                ["success", "failed"].includes(statusResponse.task.status)
              ) {
                setNotification({ taskId, status: statusResponse.task.status });
                setTimeout(() => setNotification(null), 5000);
              }
              return prevTasks.map((task) =>
                task.taskId === taskId ? statusResponse.task! : task
              );
            });

            if (
              statusResponse.task.status === "queuing" ||
              statusResponse.task.status === "preparing" ||
              statusResponse.task.status === "processing"
            ) {
              hasActiveTasks = true;
            }
          }
        } catch (error) {
          console.error(`Failed to check status for task ${taskId}:`, error);
        }
      }

      if (!hasActiveTasks) {
        clearInterval(pollInterval);
        setPollingTasks(new Set());
      }
    }, 5000); // Poll every 5 seconds for faster updates
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    localStorage.setItem("mural-user-name", userName);
    setShowUserInput(false);
    await loadUserTasks(userName);
  };

  const handleRefresh = async () => {
    if (userName) {
      await loadUserTasks(userName);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <IconCheck className="h-5 w-5 text-green-500" />;
      case "failed":
        return <IconAlertCircle className="h-5 w-5 text-red-500" />;
      case "processing":
      case "preparing":
      case "queuing":
        return <IconLoader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <IconClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "queuing":
        return "In Queue";
      case "preparing":
        return "Preparing";
      case "processing":
        return "Generating Video";
      case "success":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "processing":
      case "preparing":
      case "queuing":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  if (showUserInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Video Generation Status
            </h1>
            <p className="text-lg text-gray-600">
              Track your video generation tasks and download completed videos.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleUserSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter your name to view your video tasks:
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Tasks
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${
            notification.status === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.status === "success"
            ? "A video generation job has completed!"
            : "A video generation job has failed."}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video Generation Status
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Welcome back, <span className="font-semibold">{userName}</span>
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <IconRefresh
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </button>
            <Link
              href="/upload"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create New Video
            </Link>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <IconClock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No video tasks found
              </h3>
              <p className="text-gray-600 mb-6">
                You haven&apos;t created any video generation tasks yet.
              </p>
              <Link
                href="/upload"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Video
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div
                  key={task.taskId || `task-${index}`}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(task.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {getStatusText(task.status)}
                        </span>
                        {pollingTasks.has(task.taskId) && (
                          <span className="text-xs text-blue-600">
                            Live updates
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Task Details
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {task.taskId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Created: {formatDate(task.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Updated: {formatDate(task.updatedAt)}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            User Details
                          </h3>
                          <p className="text-sm text-gray-600">
                            Name: {task.userDetails.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Description: {task.userDetails.description}
                          </p>
                        </div>
                      </div>

                      {task.prompt && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Prompt
                          </h3>
                          <p className="text-sm text-gray-600">{task.prompt}</p>
                        </div>
                      )}

                      {task.errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <h3 className="font-semibold text-red-900 mb-1">
                            Error
                          </h3>
                          <p className="text-sm text-red-700">
                            {task.errorMessage}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {task.status === "success" && task.downloadUrl && (
                        <a
                          href={task.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center justify-center"
                          download
                        >
                          <IconDownload className="h-4 w-4" />
                          <span>Download Video</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter((t) => t.status === "success").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {
                tasks.filter((t) =>
                  ["queuing", "preparing", "processing"].includes(t.status)
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter((t) => t.status === "failed").length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
