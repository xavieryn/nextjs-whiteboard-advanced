'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: input }])

    try {
      const response = await fetch('https://hello-ai.xavier-nishikawa.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from the worker')
      }

      const data = await response.json()
      const botMessage = typeof data.response === 'string'
        ? data.response
        : JSON.stringify(data.response)

      let parsedBotMessage: string
      try {
        const parsed = JSON.parse(botMessage)
        parsedBotMessage = parsed.response || parsed
      } catch {
        parsedBotMessage = botMessage
      }

      const finalBotMessage = typeof parsedBotMessage === 'string'
        ? parsedBotMessage
        : JSON.stringify(parsedBotMessage)

      setMessages(prev => [...prev, { role: 'bot', content: finalBotMessage }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'bot',
        content: `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`
      }])
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 flex-col overflow-y-auto p-4">
        <div className="flex flex-col max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-2xl text-gray-500 font-light">How can I help you today?</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white shadow-sm border rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-full px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full p-3 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send className="h-5 w-5" />
              {/* <span className="sr-only">Send message</span> */}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}