import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FeedsService, OpmlService } from "../../client/sdk.gen"
import type { FeedCreate } from "../../client/types.gen"
import { Card, CardBody, CardHeader } from "../../components/ui/card"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Field } from "../../components/ui/field"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/feeds")({
  component: FeedsPage,
})

function FeedsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Query to fetch user's feeds
  const {
    data: userFeeds,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userFeeds"],
    queryFn: () => FeedsService.readUserFeeds(),
  })

  // Mutation to create a new feed
  const createFeedMutation = useMutation({
    mutationFn: (feedData: FeedCreate) =>
      FeedsService.createFeed({ requestBody: feedData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFeeds"] })
      showSuccessToast("The feed has been added successfully.")
      setIsOpen(false)
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Failed to add feed")
    },
  })

  // Mutation to unfollow a feed
  const unfollowFeedMutation = useMutation({
    mutationFn: (feedId: string) => FeedsService.unfollowFeed({ feedId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFeeds"] })
      showSuccessToast("You've unfollowed this feed.")
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Failed to unfollow feed")
    },
  })

  // Mutation to import OPML file
  const importMutation = useMutation({
    mutationFn: (file: File) => {
      // Create body for import in the format expected by the API
      const body: { file: File } = { file };

      // Pass it correctly to the OpmlService
      return OpmlService.importOpml({
        formData: body
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userFeeds"] })
      showSuccessToast(data.message)
      setIsImportOpen(false)
      setSelectedFile(null)
      setImportError(null)
    },
    onError: (error: any) => {
      console.error("OPML import error:", error)
      showErrorToast(error.message || "Failed to import OPML file")
      setImportError(error.message || "Failed to import OPML file")
    },
  })

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (file) {
      if (!file.name.endsWith('.opml') && !file.name.endsWith('.xml')) {
        setImportError("Please select a valid OPML file (.opml or .xml)")
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setImportError(null)
    } else {
      setSelectedFile(null)
    }
  }

  // Handle OPML import submission
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setImportError("Please select a file to import")
      return
    }

    // Just pass the file directly to the mutation
    // The mutation will create the proper body format
    importMutation.mutate(selectedFile)
  }

  // Form for adding a new feed
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedCreate>()

  const onSubmit = (data: FeedCreate) => {
    createFeedMutation.mutate(data)
    reset()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Feeds</h1>
        <div className="flex space-x-2">
          <DialogRoot open={isImportOpen} onOpenChange={({ open }) => setIsImportOpen(open)}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 shadow-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import OPML
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-auto p-0 overflow-hidden">
              <form onSubmit={handleImportSubmit} className="flex flex-col">
                <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200 relative">
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Import OPML File
                  </DialogTitle>
                  <DialogCloseTrigger />
                </DialogHeader>
                <DialogBody className="p-6">
                  <div className="flex flex-col gap-5">
                    <div className="space-y-1">
                      <label
                        htmlFor="opmlFile"
                        className="block text-sm font-medium text-gray-700"
                      >
                        OPML File <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="opmlFile"
                        type="file"
                        accept=".opml,.xml"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      />
                      {importError && (
                        <p className="text-sm text-red-600 mt-1">
                          {importError}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload an OPML file to import your RSS feeds. OPML is a standard format used by RSS readers to export and import feed subscriptions.
                    </p>
                  </div>
                </DialogBody>
                <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <DialogActionTrigger asChild>
                    <button
                      type="button"
                      className="border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 mr-3"
                    >
                      Cancel
                    </button>
                  </DialogActionTrigger>
                  <button
                    className={`bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 ${
                      importMutation.isPending
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    type="submit"
                    disabled={!selectedFile || importMutation.isPending}
                  >
                    {importMutation.isPending ? (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Importing...
                      </span>
                    ) : (
                      "Import"
                    )}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </DialogRoot>

          <DialogRoot open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 shadow-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New Feed
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-auto p-0 overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200 relative">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Add New Feed
                </DialogTitle>
                <DialogCloseTrigger />
              </DialogHeader>
              <DialogBody className="p-6">
                <div className="flex flex-col gap-5">
                  <div className="space-y-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Feed Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      {...register("name", {
                        required: "Feed name is required",
                      })}
                      placeholder="My Favorite Blog"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="url"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Feed URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="url"
                      type="url"
                      {...register("url", {
                        required: "Feed URL is required",
                        pattern: {
                          value:
                            /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                          message: "Please enter a valid URL",
                        },
                      })}
                      placeholder="https://example.com/feed.xml"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    />
                    {errors.url && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.url.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description{" "}
                      <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea
                      id="description"
                      {...register("description")}
                      placeholder="A brief description of this feed"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>
              </DialogBody>
              <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <DialogActionTrigger asChild>
                  <button
                    type="button"
                    className="border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 mr-3"
                  >
                    Cancel
                  </button>
                </DialogActionTrigger>
                <button
                  className={`bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 ${
                    createFeedMutation.isPending
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                  type="submit"
                  disabled={createFeedMutation.isPending}
                >
                  {createFeedMutation.isPending ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add Feed"
                  )}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogRoot>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" />
        </div>
      ) : isError ? (
        <div className="text-center py-10">
          <p className="text-red-600">
            Error loading feeds: {(error as Error).message}
          </p>
        </div>
      ) : userFeeds?.data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="text-center py-10">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No feeds yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't subscribed to any feeds yet.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userFeeds?.data.map((feed) => (
            <div
              key={feed.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 truncate max-w-[70%]">
                    {feed.name}
                  </h2>
                  <button
                    type="button"
                    className={`text-sm border border-red-600 text-red-600 hover:bg-red-50 font-medium py-1 px-3 rounded transition-colors duration-200 flex-shrink-0 ${
                      unfollowFeedMutation.isPending
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => unfollowFeedMutation.mutate(feed.id)}
                    disabled={unfollowFeedMutation.isPending}
                  >
                    {unfollowFeedMutation.isPending ? (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Unfollowing...
                      </span>
                    ) : (
                      "Unfollow"
                    )}
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <p className="mb-3 text-gray-600 line-clamp-3 flex-grow">
                  {feed.description || "No description available"}
                </p>
                <a
                  href={feed.url}
                  className="text-teal-600 hover:text-teal-800 text-sm inline-flex items-center w-full transition-colors duration-200 group mt-auto"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0 group-hover:text-teal-800 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span className="truncate">{feed.url}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
