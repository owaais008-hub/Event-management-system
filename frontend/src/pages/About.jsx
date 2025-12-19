import { useState } from 'react';

export default function About() {
  const [activeTab, setActiveTab] = useState('mission');

  const features = [
    {
      title: 'Event Discovery',
      description: 'Browse and discover events that match your interests with our powerful search and filtering system.',
      icon: '🔍'
    },
    {
      title: 'Easy Registration',
      description: 'Register for events with just a few clicks and receive instant confirmation.',
      icon: '📝'
    },
    {
      title: 'Digital Tickets',
      description: 'Download and store your event tickets digitally for easy access at the venue.',
      icon: '🎟️'
    },
    {
      title: 'Real-time Updates',
      description: 'Stay informed with real-time notifications about event changes and announcements.',
      icon: '🔔'
    },
    {
      title: 'Certificate Management',
      description: 'Easily download and manage your participation certificates after events.',
      icon: '📜'
    },
    {
      title: 'Community Feedback',
      description: 'Share your experience and help improve future events through our feedback system.',
      icon: '💬'
    },
    {
      title: 'Exhibitor Portal',
      description: 'Discover and connect with exhibitors. Companies can register and showcase their products/services.',
      icon: '🏢'
    },
    {
      title: 'Booth Management',
      description: 'Organizers can create and manage event booths. Exhibitors can reserve and customize their booth spaces.',
      icon: '🎪'
    },
    {
      title: 'Image Gallery',
      description: 'Browse event photos and media. Organizers can upload images to showcase event moments.',
      icon: '📸'
    },
    {
      title: 'Communication Hub',
      description: 'Send and receive messages with organizers and other participants through our integrated messaging system.',
      icon: '📨'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Access detailed statistics and insights about events, participation, and platform usage.',
      icon: '📊'
    },
    {
      title: 'Role-based Access',
      description: 'Tailored experiences for Visitors, Students, Organizers, and Administrators with appropriate permissions.',
      icon: '🔐'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          About Fusion Fiesta
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Empowering campus communities through innovative event management and seamless participation experiences.
        </p>
      </div>

      {/* Mission & Vision Tabs */}
      <div className="mb-12">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'mission' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('mission')}
          >
            Our Mission
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'vision' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('vision')}
          >
            Our Vision
          </button>
        </div>

        {activeTab === 'mission' ? (
          <div className="py-8">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our mission is to create a seamless, inclusive, and engaging platform that connects students, organizers, 
              and administrators in the vibrant world of campus events. We strive to eliminate barriers to participation 
              and provide tools that enhance the overall event experience for everyone involved.
            </p>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-r-lg">
              <p className="text-indigo-800 dark:text-indigo-200 italic">
                "Empowering students to explore, connect, and grow through meaningful event experiences."
              </p>
            </div>
          </div>
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our vision is to become the leading platform for campus event management, recognized for our innovative approach to connecting students with opportunities that enhance their academic and social experiences.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We envision a future where technology eliminates barriers to participation, where every student can easily find events that align with their interests, and where organizers have the tools they need to create memorable experiences.
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Expand to universities across the globe</li>
              <li>Integrate with academic calendars and course management systems</li>
              <li>Develop AI-powered event recommendations</li>
              <li>Create virtual and hybrid event experiences</li>
              <li>Foster partnerships with industry professionals</li>
            </ul>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 border border-white/30 dark:border-slate-700/30 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-bold mb-2">Inclusivity</h3>
            <p>Creating opportunities for all students to participate regardless of their background or experience level.</p>
          </div>
          <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Innovation</h3>
            <p>Continuously improving our platform with cutting-edge technology and user-centered design.</p>
          </div>
          <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p>Building connections between students, organizers, and the broader campus community.</p>
          </div>
        </div>
      </div>
    </div>
  );
}