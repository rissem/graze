import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { FaPaperPlane, FaUser } from "react-icons/fa"
import { RiRobotFill } from "react-icons/ri"
import { OpenAPI } from "../../client/core/OpenAPI"

export const Route = createFileRoute("/_layout/dialog")({
  component: Dialog,
})

interface Message {
  role: "user" | "assistant" | "thinking" | "summary"
  content: string
  showFullThinking?: boolean
  fullThinking?: string
}

interface PongMessage {
  id: string
  content: string
  timestamp: string
}

function Dialog() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("Send a ping to the server")
  const [isEditing, setIsEditing] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [pongMessages, setPongMessages] = useState<PongMessage[]>([])
  const [showResponseInput, setShowResponseInput] = useState(false)
  const [responseInput, setResponseInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const responseTextareaRef = useRef<HTMLTextAreaElement>(null)
  const pongContainerRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  useEffect(() => {
    if (responseTextareaRef.current) {
      responseTextareaRef.current.style.height = "auto"
      responseTextareaRef.current.style.height = `${responseTextareaRef.current.scrollHeight}px`
    }
  }, [responseInput])

  // Maintain scroll position when pong messages are added to prevent jumping
  useEffect(() => {
    const currentScrollY = window.scrollY

    return () => {
      if (pongMessages.length > 0) {
        window.scrollTo(0, currentScrollY)
      }
    }
  }, [pongMessages])

  // Show the response input area after pong messages are received
  useEffect(() => {
    if (pongMessages.length > 0 && !isStreaming && !isEditing) {
      setShowResponseInput(true)
    } else {
      setShowResponseInput(false)
    }
  }, [pongMessages, isStreaming, isEditing])

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !isEditing) return

    // Add user message to the chat
    const userMessage: Message = { role: "user", content: input }
    setMessages([...messages, userMessage])
    setIsEditing(false)

    // Start streaming state
    setIsStreaming(true)
    setStreamingText("Connecting to server...")
    setPongMessages([])

    // Clean up any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Determine the full URL to the SSE endpoint
    const baseUrl = OpenAPI.BASE || ""
    const ssePingUrl = `${baseUrl}/api/v1/utils/sse-ping/`

    try {
      // Create an EventSource for proper SSE handling
      const eventSource = new EventSource(ssePingUrl, {
        withCredentials: OpenAPI.WITH_CREDENTIALS,
      })
      eventSourceRef.current = eventSource

      let buffer = ""

      // Handle connection open
      eventSource.onopen = () => {
        setStreamingText("Connected to server, waiting for pings...")
      }

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        buffer += `${event.data}\n`

        // Add to pong messages
        setPongMessages((prev) => [
          ...prev,
          {
            id: String(prev.length),
            content: event.data,
            timestamp: new Date().toISOString(),
          },
        ])
      }

      // Handle errors
      eventSource.onerror = (error) => {
        console.error("EventSource error:", error)
        eventSource.close()
        eventSourceRef.current = null

        // If we have pings, consider it a success with early termination
        if (pongMessages.length > 0) {
          setIsStreaming(false)
          setStreamingText("")

          // Add summary message
          setMessages((prev) => [
            ...prev,
            {
              role: "summary",
              content: "Server ping test completed.",
              showFullThinking: false,
              fullThinking: buffer,
            },
          ])
        } else {
          // Otherwise, it's an error
          setIsStreaming(false)
          setStreamingText("")
          setMessages((prev) => [
            ...prev,
            {
              role: "summary",
              content: "Error connecting to server",
              showFullThinking: false,
            },
          ])
        }
      }

      // Automatically close after 12 seconds (allowing for all pings to complete)
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null

          setIsStreaming(false)
          setStreamingText("")

          // Add summary message
          setMessages((prev) => [
            ...prev,
            {
              role: "summary",
              content: "Server ping test completed.",
              showFullThinking: false,
              fullThinking: buffer,
            },
          ])
        }
      }, 12000)
    } catch (error) {
      console.error("Error setting up EventSource:", error)
      setIsStreaming(false)
      setStreamingText("")
      setMessages((prev) => [
        ...prev,
        {
          role: "summary",
          content: `Error connecting to server: ${(error as Error).message}`,
          showFullThinking: false,
        },
      ])
    }
  }

  const toggleThinking = (index: number) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages]
      if (updatedMessages[index].role === "summary") {
        updatedMessages[index] = {
          ...updatedMessages[index],
          showFullThinking: !updatedMessages[index].showFullThinking,
        }
      }
      return updatedMessages
    })
  }

  const startNewChat = () => {
    // Clean up any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setMessages([])
    setPongMessages([])
    setShowResponseInput(false)
    setResponseInput("")
    setInput("Send a ping to the server")
    setIsEditing(true)
  }

  return (
    <div className="!container !max-w-4xl !mx-auto">
      <div className="!pt-6 !pb-32">
        <h1 className="!text-2xl !font-semibold !mb-8">
          Ping-Pong Server Test
        </h1>

        {/* Messages container */}
        <div className="!flex !flex-col !space-y-6 !mb-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className="!bg-white !rounded-lg !shadow-sm !overflow-hidden"
            >
              {message.role === "user" && (
                <div className="!p-4">
                  <div className="!flex !items-center !gap-3 !mb-3">
                    <div className="!bg-blue-100 !rounded-full !w-8 !h-8 !flex !items-center !justify-center">
                      <FaUser className="!text-blue-500" />
                    </div>
                    <div className="!font-medium">You</div>
                  </div>
                  <div className="!text-lg">{message.content}</div>
                </div>
              )}

              {message.role === "summary" && (
                <div className="!p-4">
                  <div className="!flex !items-center !gap-3 !mb-3">
                    <div className="!bg-purple-100 !rounded-full !w-8 !h-8 !flex !items-center !justify-center">
                      <RiRobotFill className="!text-purple-500" />
                    </div>
                    <div className="!font-medium">Server</div>
                  </div>
                  <div className="!text-lg !mb-2">
                    {message.showFullThinking && message.fullThinking
                      ? message.fullThinking
                      : message.content}
                  </div>

                  {message.fullThinking && (
                    <button
                      onClick={() => toggleThinking(index)}
                      className="!mt-2 !text-sm !text-blue-500 !hover:text-blue-700"
                    >
                      {message.showFullThinking
                        ? "Show summary"
                        : "Show raw response"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Streaming output */}
          {isStreaming && (
            <div className="!bg-white !rounded-lg !shadow-sm !overflow-hidden">
              <div className="!p-4">
                <div className="!flex !items-center !gap-3 !mb-3">
                  <div className="!bg-purple-100 !rounded-full !w-8 !h-8 !flex !items-center !justify-center">
                    <RiRobotFill className="!text-purple-500" />
                  </div>
                  <div className="!font-medium">Server</div>
                </div>
                <div className="!text-gray-600 !italic">{streamingText}</div>
              </div>
            </div>
          )}

          {/* Pong messages */}
          <div ref={pongContainerRef}>
            {pongMessages.length > 0 && (
              <div className="!mt-6 !space-y-6">
                {pongMessages.map((pong) => (
                  <div
                    key={pong.id}
                    className="!bg-white !rounded-lg !shadow-sm !overflow-hidden"
                  >
                    <div className="!p-4">
                      <div className="!flex !items-center !gap-3 !mb-3">
                        <div className="!bg-purple-100 !rounded-full !w-8 !h-8 !flex !items-center !justify-center">
                          <RiRobotFill className="!text-purple-500" />
                        </div>
                        <div className="!font-medium">Server Response</div>
                      </div>
                      <div className="!flex !justify-between !items-center">
                        <h3 className="!font-bold !text-xl !mb-2">
                          {pong.content}
                        </h3>
                        <span className="!text-xs !text-gray-500">
                          {new Date(pong.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response input area shown after pong messages */}
          {showResponseInput && (
            <div className="!mt-8">
              <textarea
                ref={responseTextareaRef}
                value={responseInput}
                onChange={(e) => setResponseInput(e.target.value)}
                placeholder="Any thoughts about the ping test?"
                className="!w-full !p-2 !text-lg !border-b !border-gray-200 !focus:outline-none !focus:border-blue-500 !min-h-[80px] !resize-none !bg-transparent"
              />
            </div>
          )}

          {/* New query input (only shown when no active query) */}
          {isEditing && (
            <div className="!rounded-lg">
              <form onSubmit={handleSubmit} className="!relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="!w-full !p-2 !text-lg !border-b !border-gray-200 !focus:outline-none !focus:border-blue-500 !min-h-[100px] !resize-none !bg-transparent"
                  disabled={!isEditing || isStreaming}
                />
                <button
                  type="submit"
                  className={`!absolute !bottom-4 !right-4 !w-10 !h-10 !rounded-full !flex !items-center !justify-center ${
                    isStreaming || !input.trim()
                      ? "!bg-gray-200 !text-gray-400 !cursor-not-allowed"
                      : "!bg-blue-500 !text-white !hover:bg-blue-600"
                  }`}
                  disabled={isStreaming || !input.trim()}
                >
                  <FaPaperPlane className="!text-sm" />
                </button>
              </form>
            </div>
          )}

          {/* Button to start a new query after completed */}
          {!isEditing && !isStreaming && !showResponseInput && (
            <div className="!flex !justify-center !mt-4">
              <button
                onClick={startNewChat}
                className="!h-10 !w-10 !bg-gray-100 !hover:bg-gray-200 !rounded-full !flex !items-center !justify-center"
              >
                <FaPaperPlane className="!text-gray-600 !text-sm" />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

export default Dialog
