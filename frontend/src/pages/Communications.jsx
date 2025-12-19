import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Communications() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await axios.get('/api/communications/contacts');
      setContacts(response.data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (contactId) => {
    if (!contactId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/communications/messages/${contactId}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('/api/communications/messages/unread/count');
      setUnreadCount(response.data.count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchContacts();
      fetchUnreadCount();
    }
  }, [user, fetchContacts, fetchUnreadCount]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    } else {
      setMessages([]);
    }
  }, [selectedContact, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const response = await axios.post('/api/communications/messages', {
        recipient: selectedContact._id,
        content: newMessage
      });
      
      // Add the new message to the messages list
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      
      // Refresh unread count
      fetchUnreadCount();
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Please log in to access communications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Chat with other users in the system
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              {unreadCount} unread messages
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden border border-white/30 dark:border-slate-700/30">
        <div className="flex flex-col md:flex-row h-[calc(100vh-200px)]">
          {/* Contacts sidebar */}
          <div className="md:w-1/3 border-r border-gray-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                  {contacts.map(contact => (
                    <li 
                      key={contact._id} 
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 ${
                        selectedContact?._id === contact._id ? 'bg-indigo-50 dark:bg-slate-700' : ''
                      }`}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-800 dark:text-indigo-200 font-medium">
                            {contact.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {contact.name}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-gray-500 dark:text-slate-400">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-medium mb-1">No contacts found</h3>
                    <p>Start a conversation by messaging someone.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="md:w-2/3 flex flex-col">
            {selectedContact ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-indigo-800 dark:text-indigo-200 font-medium">
                        {selectedContact.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedContact.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {selectedContact.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const showDate = index === 0 || 
                          new Date(message.createdAt).toDateString() !== 
                          new Date(messages[index - 1]?.createdAt).toDateString();
                        
                        return (
                          <div key={message._id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                                message.sender._id === user.id 
                                  ? 'bg-indigo-500 text-white' 
                                  : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                              }`}>
                                <p>{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.sender._id === user.id 
                                    ? 'text-indigo-200' 
                                    : 'text-gray-500 dark:text-slate-400'
                                }`}>
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Select a contact to start messaging
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400">
                    Choose a contact from the list to begin a conversation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}