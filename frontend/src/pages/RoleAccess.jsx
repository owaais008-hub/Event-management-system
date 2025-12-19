import { useAuth } from '../context/AuthContext.jsx';
import { roleAccess, getRoleInfo } from '../utils/roleAccess.js';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';

export default function RoleAccess() {
  const { user } = useAuth();
  const currentRole = user?.role || 'visitor';
  const currentRoleInfo = getRoleInfo(currentRole);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-lg border border-indigo-100 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Role-Based Access Control</h1>
            <p className="text-gray-600 dark:text-slate-300 text-lg">
              Understanding permissions and accessible pages for each user role
            </p>
          </div>
          {user && (
            <div className={`px-6 py-3 rounded-xl shadow-lg bg-gradient-to-r ${currentRoleInfo.color} text-white`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentRoleInfo.icon}</span>
                <div>
                  <div className="text-sm opacity-90">Current Role</div>
                  <div className="font-bold text-lg">{currentRoleInfo.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(roleAccess).map(([roleKey, roleInfo]) => {
          const isCurrentRole = roleKey === currentRole;
          
          return (
            <div
              key={roleKey}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                isCurrentRole
                  ? 'border-indigo-500 shadow-2xl scale-105'
                  : 'border-gray-200 dark:border-slate-700 hover:shadow-xl'
              }`}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${roleInfo.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{roleInfo.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold">{roleInfo.name}</h2>
                      <p className="text-white/90 text-sm mt-1">{roleInfo.description}</p>
                    </div>
                  </div>
                  {isCurrentRole && (
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      Your Role
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                {/* Accessible Pages */}
                <div>
                  <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Accessible Pages ({roleInfo.pages.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {roleInfo.pages.map((page, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{page.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold dark:text-white">{page.name}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                              {page.description}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-500 mt-1 font-mono">
                              {page.path}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-bold text-lg mb-3 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    Available Features
                  </h3>
                  <div className="space-y-2">
                    {roleInfo.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                {roleInfo.restrictions.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 dark:text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-500" />
                      Restrictions
                    </h3>
                    <div className="space-y-2">
                      {roleInfo.restrictions.map((restriction, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg px-3 py-2 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          {restriction}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!user && (
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <Link
                      to="/signup"
                      className={`block w-full text-center py-2 px-4 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r ${roleInfo.color} text-white hover:shadow-lg transform hover:scale-105`}
                    >
                      Sign Up as {roleInfo.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Quick Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left p-3 font-semibold dark:text-white">Feature</th>
                {Object.entries(roleAccess).map(([roleKey, roleInfo]) => (
                  <th key={roleKey} className="text-center p-3 font-semibold dark:text-white">
                    <div className="flex items-center justify-center gap-2">
                      <span>{roleInfo.icon}</span>
                      <span>{roleInfo.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <td className="p-3 font-medium dark:text-white">Browse Events</td>
                {Object.keys(roleAccess).map(roleKey => (
                  <td key={roleKey} className="text-center p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <td className="p-3 font-medium dark:text-white">Register for Events</td>
                {Object.keys(roleAccess).map(roleKey => (
                  <td key={roleKey} className="text-center p-3">
                    {['student', 'organizer', 'admin'].includes(roleKey) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <td className="p-3 font-medium dark:text-white">Create Events</td>
                {Object.keys(roleAccess).map(roleKey => (
                  <td key={roleKey} className="text-center p-3">
                    {['organizer', 'admin'].includes(roleKey) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <td className="p-3 font-medium dark:text-white">Approve Events</td>
                {Object.keys(roleAccess).map(roleKey => (
                  <td key={roleKey} className="text-center p-3">
                    {roleKey === 'admin' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <td className="p-3 font-medium dark:text-white">View Statistics</td>
                {Object.keys(roleAccess).map(roleKey => (
                  <td key={roleKey} className="text-center p-3">
                    {['student', 'organizer', 'admin'].includes(roleKey) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium dark:text-white">Dashboard Access</td>
                {Object.keys(roleAccess).map(roleKey => (
                  <td key={roleKey} className="text-center p-3">
                    {['organizer', 'admin'].includes(roleKey) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Understanding Roles</h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              Each role has specific permissions and access levels. Visitors can browse events without registering.
              Students can register and participate. Organizers can create and manage events (pending approval).
              Administrators have full system access including approving events and managing users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

