import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Send, MessageCircle, Users, Search, Plus, Phone, Mail, CheckCircle2, Circle } from 'lucide-react'
import { parentService, useAuthStore } from '@/store/storeAndServices'
import toast from 'react-hot-toast'

export default function ParentCommunicationPage() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: childrenData } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => parentService.getChildren()
  })

  // Mock conversations (would come from backend)
  const [conversations] = useState([
    {
      id: 1,
      teacherName: 'Ms. Priya Singh',
      subject: 'English',
      lastMessage: 'Your child did great in the recent test!',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      avatar: 'P',
      isOnline: true,
      messages: [
        { id: 1, sender: 'Ms. Priya Singh', text: 'Hi! How is your child doing?', time: new Date(Date.now() - 2 * 60 * 60 * 1000), isReceived: true },
        { id: 2, sender: user?.fullName, text: 'He\'s doing well, thank you for asking!', time: new Date(Date.now() - 1.5 * 60 * 60 * 1000), isReceived: false },
        { id: 3, sender: 'Ms. Priya Singh', text: 'Your child did great in the recent test!', time: new Date(Date.now() - 1 * 60 * 60 * 1000), isReceived: true },
        { id: 4, sender: user?.fullName, text: 'That\'s wonderful to hear! We\'ll keep encouraging him.', time: new Date(Date.now() - 30 * 60 * 1000), isReceived: false },
      ]
    },
    {
      id: 2,
      teacherName: 'Mr. Rajesh Kumar',
      subject: 'Mathematics',
      lastMessage: 'Can we schedule a meeting to discuss...',
      lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      unreadCount: 2,
      avatar: 'R',
      isOnline: false,
      messages: [
        { id: 1, sender: 'Mr. Rajesh Kumar', text: 'Hello, I wanted to discuss some concepts...', time: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), isReceived: true },
        { id: 2, sender: 'Mr. Rajesh Kumar', text: 'Can we schedule a meeting to discuss...', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), isReceived: true },
      ]
    },
    {
      id: 3,
      teacherName: 'Mrs. Anita Sharma',
      subject: 'Science',
      lastMessage: 'Great project submission!',
      lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      unreadCount: 0,
      avatar: 'A',
      isOnline: true,
      messages: []
    }
  ])

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 500)
      })
    },
    onSuccess: () => {
      setNewMessage('')
      toast.success('Message sent!')
    }
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) {
      toast.error('Please select a conversation and type a message')
      return
    }
    sendMessageMutation.mutate(newMessage)
  }

  const filteredConversations = conversations.filter(conv =>
    !searchTerm ||
    conv.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentConversation = selectedConversation
    ? conversations.find(c => c.id === selectedConversation)
    : null

  return (
    <div className="space-y-6 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Direct Messages</h1>
            <p className="text-gray-500 text-sm mt-1">Communicate directly with your child's teachers</p>
          </div>
          <button className="p-3 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Start new conversation">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-4 transition-colors hover:bg-gray-50 border-l-4 ${
                    selectedConversation === conv.id
                      ? 'bg-indigo-50 border-l-indigo-600'
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                        {conv.avatar}
                      </div>
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{conv.teacherName}</h3>
                        <span className="text-xs text-gray-500">
                          {conv.lastMessageTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{conv.subject}</p>
                      <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {!selectedConversation ? (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Select a conversation to start messaging</p>
              <p className="text-sm mt-1">Choose a teacher from the list to view your conversation</p>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                      {currentConversation?.avatar}
                    </div>
                    {currentConversation?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{currentConversation?.teacherName}</h2>
                    <p className="text-xs text-gray-600">{currentConversation?.subject}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Call">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Email">
                    <Mail size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation?.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isReceived ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.isReceived
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.isReceived ? 'text-gray-600' : 'text-indigo-100'}`}>
                      {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || !newMessage.trim()}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
                >
                  {sendMessageMutation.isPending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

