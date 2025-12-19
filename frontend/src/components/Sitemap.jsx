import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sitemap() {
  const [activeSection, setActiveSection] = useState('student');

  const sitemapData = {
    student: {
      title: "Student User Flow",
      description: "Features available to students browsing and participating in events",
      roles: ["Student Visitor", "Student Participant"],
      steps: [
        {
          title: "Registration & Login",
          description: "Create an account and log in to access the platform",
          icon: "🔐",
          features: [
            "Sign up with email and password",
            "Select account type (Visitor/Participant)",
            "Email verification process"
          ]
        },
        {
          title: "Browse Events",
          description: "Discover events that match your interests",
          icon: "🔍",
          features: [
            "Search by category, date, department",
            "Filter by popularity or relevance",
            "View event details and descriptions"
          ]
        },
        {
          title: "Event Registration",
          description: "Register for events you're interested in attending",
          icon: "📝",
          features: [
            "One-click registration for approved events",
            "Receive confirmation notifications",
            "Manage your event registrations"
          ]
        },
        {
          title: "Event Participation",
          description: "Attend events and engage with organizers",
          icon: "🎪",
          features: [
            "Download digital tickets",
            "Check-in using QR codes",
            "Receive real-time event updates"
          ]
        },
        {
          title: "Feedback & Certificates",
          description: "Share your experience and receive recognition",
          icon: "📜",
          features: [
            "Submit feedback after events",
            "Rate events on multiple criteria",
            "Download participation certificates"
          ]
        }
      ]
    },
    organizer: {
      title: "Event Organizer Flow",
      description: "Tools for creating and managing events",
      roles: ["Staff Organizer"],
      steps: [
        {
          title: "Account Setup",
          description: "Get approved to create and manage events",
          icon: "📋",
          features: [
            "Register as staff member",
            "Wait for admin approval",
            "Access organizer dashboard"
          ]
        },
        {
          title: "Event Creation",
          description: "Create and configure new events",
          icon: "➕",
          features: [
            "Fill event details form",
            "Upload posters and documents",
            "Set capacity and registration limits"
          ]
        },
        {
          title: "Event Management",
          description: "Manage events throughout their lifecycle",
          icon: "⚙️",
          features: [
            "View participant lists",
            "Approve/deny registrations",
            "Send announcements to participants"
          ]
        },
        {
          title: "Event Execution",
          description: "Run events and track attendance",
          icon: "🏁",
          features: [
            "Real-time check-in tracking",
            "Monitor participant engagement",
            "Handle on-site registrations"
          ]
        },
        {
          title: "Post-Event Activities",
          description: "Wrap up events and engage with participants",
          icon: "✅",
          features: [
            "Upload event results",
            "Distribute certificates",
            "Export participant data to CSV"
          ]
        }
      ]
    },
    admin: {
      title: "System Administrator Flow",
      description: "Platform management and oversight",
      roles: ["Staff Administrator"],
      steps: [
        {
          title: "User Management",
          description: "Oversee all platform users",
          icon: "👥",
          features: [
            "Approve/reject staff accounts",
            "Manage user roles and permissions",
            "Block/unblock users if needed"
          ]
        },
        {
          title: "Event Oversight",
          description: "Ensure event quality and compliance",
          icon: "🔍",
          features: [
            "Review pending events",
            "Approve/reject event proposals",
            "Monitor event content"
          ]
        },
        {
          title: "System Monitoring",
          description: "Maintain platform health and performance",
          icon: "📊",
          features: [
            "View system analytics",
            "Monitor flagged content",
            "Generate platform reports"
          ]
        },
        {
          title: "Content Moderation",
          description: "Maintain content quality and standards",
          icon: "🛡️",
          features: [
            "Review feedback and ratings",
            "Moderate gallery uploads",
            "Handle user complaints"
          ]
        },
        {
          title: "Platform Configuration",
          description: "Manage system-wide settings",
          icon: "⚙️",
          features: [
            "Update platform policies",
            "Configure notification settings",
            "Manage department listings"
          ]
        }
      ]
    }
  };

  const currentMap = sitemapData[activeSection];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 dark:text-white">Platform Sitemap</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Understand how to navigate and use the FusionFiesta platform based on your role
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeSection === 'student'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
          onClick={() => setActiveSection('student')}
        >
          Student Flow
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeSection === 'organizer'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
          onClick={() => setActiveSection('organizer')}
        >
          Organizer Flow
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeSection === 'admin'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
          onClick={() => setActiveSection('admin')}
        >
          Admin Flow
        </button>
      </div>

      {/* Sitemap Content */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 dark:text-white">{currentMap.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentMap.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {currentMap.roles.map((role, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {currentMap.steps.map((step, index) => (
          <div 
            key={index} 
            className="flex flex-col md:flex-row gap-6 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600"
          >
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">
                {step.icon}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-2 dark:text-white">{step.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>
              <ul className="space-y-2">
                {step.features.map((feature, featIndex) => (
                  <li key={featIndex} className="flex items-start">
                    <span className="text-indigo-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Help */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
        <h4 className="text-lg font-bold mb-3 dark:text-white">Quick Navigation</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center text-sm transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/schedule" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center text-sm transition-colors"
          >
            Schedule
          </Link>
          <Link 
            to="/profile" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center text-sm transition-colors"
          >
            Profile
          </Link>
          <Link 
            to="/feedback" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center text-sm transition-colors"
          >
            Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}