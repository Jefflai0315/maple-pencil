"use client";

import React, { useState, useEffect } from "react";
import {
  IconRefresh,
  IconDownload,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconLoader2,
  IconLogin,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  VideoGenerationTask,
  getUserVideoTasks,
  checkVideoGenerationStatus,
} from "../utils/videoGeneration";

interface MuralItem {
  _id?: string;
  imageUrl: string;
  videoUrl: string;
  fallbackVideoUrl?: string;
  gridPosition: number;
  timestamp: string;
  userDetails: {
    name: string;
    description: string;
    email: string;
    sessionId?: string;
    userId?: string;
    ipAddress?: string;
  };
  metadata?: {
    originalFileName: string;
    fileSize: number;
    uploadSource: "camera" | "file" | "drag-drop";
    browserInfo?: string;
    prompt?: string;
  };
}

export default function VideoStatusPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<VideoGenerationTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserInput, setShowUserInput] = useState(true);
  const [pollingTasks, setPollingTasks] = useState<Set<string>>(new Set());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notification, setNotification] = useState<null | {
    taskId: string;
    status: string;
  }>(null);

  useEffect(() => {
    // If user is signed in, use their email to fetch tasks
    if (session?.user?.email) {
      setUserName(session.user.name || session.user.email);
      setShowUserInput(false);
      loadUserTasksByEmail(session.user.email);
    } else if (status === "unauthenticated") {
      // Fallback to localStorage for non-authenticated users
      const storedUserName = localStorage.getItem("mural-user-name");
      if (storedUserName) {
        setUserName(storedUserName);
        setShowUserInput(false);
        loadUserTasks(storedUserName);
      }
    }
  }, [session, status]);

  const loadUserTasksByEmail = async (email: string) => {
    setIsLoading(true);
    try {
      // Fetch mural items by email from our new API
      const response = await fetch(
        `/api/user-mural-items?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user mural items");
      }

      const result = await response.json();
      if (result.success) {
        // Convert mural items to video generation tasks format
        const userTasks: VideoGenerationTask[] = result.data.map(
          (item: MuralItem) => ({
            taskId: item._id?.toString() || `task-${Date.now()}`,
            status: "success" as const, // Since these are completed uploads
            imageUrl: item.imageUrl,
            videoUrl: item.videoUrl,
            prompt: item.metadata?.prompt || "",
            model: "mural-upload",
            duration: 0,
            resolution: "auto",
            userDetails: {
              name: item.userDetails.name,
              description: item.userDetails.description,
            },
            createdAt: new Date(item.timestamp),
            updatedAt: new Date(item.timestamp),
          })
        );

        setTasks(userTasks);
      }
    } catch (error) {
      console.error("Failed to load user tasks by email:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            {status === "loading" && (
              <p className="text-sm text-blue-600 mt-2">
                Loading authentication...
              </p>
            )}
            {status === "unauthenticated" && (
              <p className="text-sm text-gray-600 mt-2">
                Sign in to automatically view your tasks, or enter your name
                below.
              </p>
            )}
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
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                View My Tasks
              </button>

              {status === "unauthenticated" && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">or</p>
                  <Link
                    href="/api/auth/signin"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <IconLogin className="h-4 w-4" />
                    <span>Sign in with Google</span>
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Simple User Profile Icon */}
      {session && (
        <div className="flex justify-end mr-4 pt-2">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              {session.user?.name?.[0]?.toUpperCase() ||
                session.user?.email?.[0]?.toUpperCase() ||
                "U"}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
            {session?.user?.email && (
              <span className="block text-sm text-gray-500">
                ({session.user.email})
              </span>
            )}
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
                          {session?.user?.email && (
                            <p className="text-sm text-gray-600">
                              Email: {session.user.email}
                            </p>
                          )}
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
