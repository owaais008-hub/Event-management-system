import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, UserPlus, GraduationCap, Briefcase, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { toast } from 'react-toastify';

export default function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [signupMessage, setSignupMessage] = useState('');

  useEffect(() => {
    const message = localStorage.getItem('signupMessage');
    if (message) {
      setSignupMessage(message);
      localStorage.removeItem('signupMessage');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (role === 'student') {
      if (!enrollmentNumber) {
        newErrors.enrollmentNumber = 'Enrollment number is required';
      }
      if (!department) {
        newErrors.department = 'Department is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = { 
        name, 
        email, 
        password, 
        role,
        ...(role === 'student' && { enrollmentNumber, department })
      };
      
      const res = await axios.post('/api/auth/signup', userData);
      login(res.data);
      toast.success(`Welcome ${name}! Your account has been created.`);
      
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        nav(returnUrl);
      } else {
        nav('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const roleOptions = [
    { value: 'student', icon: GraduationCap, label: 'Student', description: 'Register for events', emoji: '🎓' },
    { value: 'organizer', icon: Briefcase, label: 'Organizer', description: 'Organize events', emoji: '🎪' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20 dark:opacity-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/3 left-2/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute top-2/3 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 40, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-2 border-white/20 dark:border-slate-700/20 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <UserPlus className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Join our community and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            {signupMessage && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">{signupMessage}</p>
              </motion.div>
            )}

            {errors.general && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
              </motion.div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* Account Type Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        role === option.value
                          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-lg'
                          : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          role === option.value
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <option.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className={`font-bold ${role === option.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      error={errors.name}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      error={errors.email}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      error={errors.password}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Student-specific fields */}
              <AnimatePresence>
                {role === 'student' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-gray-200 dark:border-slate-700"
                  >
                    <div className="space-y-2">
                      <label htmlFor="enrollmentNumber" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Enrollment Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="enrollmentNumber"
                        type="text"
                        placeholder="Enter enrollment number"
                        value={enrollmentNumber}
                        onChange={(e) => {
                          setEnrollmentNumber(e.target.value);
                          if (errors.enrollmentNumber) setErrors({ ...errors, enrollmentNumber: '' });
                        }}
                        error={errors.enrollmentNumber}
                        disabled={loading}
                      />
                      {errors.enrollmentNumber && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.enrollmentNumber}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="department" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="department"
                        type="text"
                        placeholder="Enter department"
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          if (errors.department) setErrors({ ...errors, department: '' });
                        }}
                        error={errors.department}
                        disabled={loading}
                      />
                      {errors.department && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.department}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Organizer Info */}
              {role === 'organizer' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1">
                        Organizer Account Approval Required
                      </h3>
                      <p className="text-amber-700 dark:text-amber-300 text-xs">
                        Your organizer account will need administrator approval before you can create and manage events.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center pt-6 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
