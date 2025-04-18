import { createFileRoute } from "@tanstack/react-router"
import { useState, useRef, useEffect } from "react"
import { FaPaperPlane, FaUser } from "react-icons/fa"
import { RiRobotFill } from "react-icons/ri"

export const Route = createFileRoute("/_layout/dialog")({
  component: Dialog,
})

interface Message {
  role: 'user' | 'assistant' | 'thinking' | 'summary';
  content: string;
  showFullThinking?: boolean;
  fullThinking?: string;
}

interface NewsCard {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
}

function Dialog() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('Tell me what\'s new in the world, but skip the minor updates on developing stories');
  const [isEditing, setIsEditing] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [newsCards, setNewsCards] = useState<NewsCard[]>([]);
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [responseInput, setResponseInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const responseTextareaRef = useRef<HTMLTextAreaElement>(null);
  const newsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (responseTextareaRef.current) {
      responseTextareaRef.current.style.height = 'auto';
      responseTextareaRef.current.style.height = responseTextareaRef.current.scrollHeight + 'px';
    }
  }, [responseInput]);

  // Maintain scroll position when news cards are added to prevent jumping
  useEffect(() => {
    const currentScrollY = window.scrollY;
    
    return () => {
      if (newsCards.length > 0) {
        window.scrollTo(0, currentScrollY);
      }
    };
  }, [newsCards]);

  // Show the response input area after news stories are fetched
  useEffect(() => {
    if (newsCards.length > 0 && !isStreaming && !isEditing) {
      setShowResponseInput(true);
    } else {
      setShowResponseInput(false);
    }
  }, [newsCards, isStreaming, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isEditing) return;
    
    // Add user message to the chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setIsEditing(false);
    
    // Simulate thinking/streaming (in a real app, this would be an API call)
    setIsStreaming(true);
    setStreamingText('');
    
    // Mock thinking stream
    const thinkingContent = "I'm analyzing recent news stories and filtering out minor updates on developing stories. Let me check various sources to identify significant news events that have occurred recently. I'll prioritize major headlines, breakthrough announcements, and important developments across different sectors including politics, technology, science, health, business, and global affairs. I'll organize these based on relevance and significance rather than simply chronological order. For each story, I'll provide enough context for understanding without requiring prior knowledge of the topic...";
    let i = 0;
    const streamInterval = setInterval(() => {
      if (i < thinkingContent.length) {
        setStreamingText(prev => prev + thinkingContent[i]);
        i++;
      } else {
        clearInterval(streamInterval);
        
        // After "thinking", add the summary response
        setTimeout(() => {
          setIsStreaming(false);
          setStreamingText('');
          
          // Add summary message
          setMessages(prev => [
            ...prev, 
            { 
              role: 'summary', 
              content: "Here are the major news stories, excluding minor updates on developing stories.", 
              showFullThinking: false,
              fullThinking: thinkingContent
            }
          ]);
          
          // Add mock news cards
          setNewsCards([
            {
              id: '1',
              title: 'Major Climate Agreement Reached by G20 Nations',
              summary: 'G20 nations have agreed to a landmark climate deal that sets ambitious carbon reduction targets for 2030, with binding commitments from all member states.',
              imageUrl: 'https://placehold.co/400x200',
              source: 'Global News Network'
            },
            {
              id: '2',
              title: 'Breakthrough in Quantum Computing Announced',
              summary: 'Researchers have achieved quantum supremacy in a new stable architecture that could bring practical quantum computers closer to reality.',
              imageUrl: 'https://placehold.co/400x200',
              source: 'Tech Insights Journal'
            },
            {
              id: '3',
              title: 'Medical Researchers Develop New Cancer Treatment Protocol',
              summary: 'A new treatment protocol combining immunotherapy and targeted drugs has shown 60% improvement in survival rates for advanced-stage patients.',
              imageUrl: 'https://placehold.co/400x200',
              source: 'Medical Science Today'
            }
          ]);
        }, 500);
      }
    }, 50);
  };

  const toggleThinking = (index: number) => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages];
      if (updatedMessages[index].role === 'summary') {
        updatedMessages[index] = {
          ...updatedMessages[index],
          showFullThinking: !updatedMessages[index].showFullThinking
        };
      }
      return updatedMessages;
    });
  };

  const startNewChat = () => {
    setMessages([]);
    setNewsCards([]);
    setShowResponseInput(false);
    setResponseInput('');
    setInput('Tell me what\'s new in the world, but skip the minor updates on developing stories');
    setIsEditing(true);
  };

  return (
    <div className="!container !max-w-4xl !mx-auto">
      <div className="!pt-6 !pb-32">
        <h1 className="!text-2xl !font-semibold !mb-8">News Summary</h1>
        
        {/* Messages container */}
        <div className="!flex !flex-col !space-y-6 !mb-6">
          {messages.map((message, index) => (
            <div key={index} className="!bg-white !rounded-lg !shadow-sm !overflow-hidden">
              {message.role === 'user' && (
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
              
              {message.role === 'summary' && (
                <div className="!p-4">
                  <div className="!flex !items-center !gap-3 !mb-3">
                    <div className="!bg-purple-100 !rounded-full !w-8 !h-8 !flex !items-center !justify-center">
                      <RiRobotFill className="!text-purple-500" />
                    </div>
                    <div className="!font-medium">AI</div>
                  </div>
                  <div className="!text-lg !mb-2">
                    {message.showFullThinking && message.fullThinking 
                      ? message.fullThinking 
                      : message.content}
                  </div>
                  
                  <button 
                    onClick={() => toggleThinking(index)}
                    className="!mt-2 !text-sm !text-blue-500 !hover:text-blue-700"
                  >
                    {message.showFullThinking ? 'Show summary' : 'Show thinking process'}
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {/* Streaming thinking output */}
          {isStreaming && (
            <div className="!bg-white !rounded-lg !shadow-sm !overflow-hidden">
              <div className="!p-4">
                <div className="!flex !items-center !gap-3 !mb-3">
                  <div className="!bg-purple-100 !rounded-full !w-8 !h-8 !flex !items-center !justify-center">
                    <RiRobotFill className="!text-purple-500" />
                  </div>
                  <div className="!font-medium">AI</div>
                </div>
                <div className="!text-gray-600 !italic">
                  {streamingText}
                </div>
              </div>
            </div>
          )}
          
          {/* News cards */}
          <div ref={newsContainerRef}>
            {newsCards.length > 0 && (
              <div className="!mt-6 !space-y-6">
                {newsCards.map(card => (
                  <div key={card.id} className="!bg-white !rounded-lg !shadow-sm !overflow-hidden">
                    <div className="!p-4">
                      <div className="!flex !items-center !gap-3 !mb-3">
                        <div className="!bg-purple-100 !rounded-full !w-8 !h-8 !flex !items-center !justify-center">
                          <RiRobotFill className="!text-purple-500" />
                        </div>
                        <div className="!font-medium">{card.source}</div>
                      </div>
                      <h3 className="!font-bold !text-xl !mb-2">{card.title}</h3>
                      <p className="!text-gray-700 !mb-4">{card.summary}</p>
                      <div className="!mt-2 !w-full">
                        <img src={card.imageUrl} alt={card.title} className="!w-full !h-48 !object-cover !rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Response input area shown after news stories */}
          {showResponseInput && (
            <div className="!mt-8">
              <textarea
                ref={responseTextareaRef}
                value={responseInput}
                onChange={(e) => setResponseInput(e.target.value)}
                placeholder="What would you like to know more about?"
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
                      ? '!bg-gray-200 !text-gray-400 !cursor-not-allowed' 
                      : '!bg-blue-500 !text-white !hover:bg-blue-600'
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
  );
}

export default Dialog; 