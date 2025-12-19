import { Link } from 'react-router-dom';

export default function PasswordReset() {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="font-bold text-xl mb-4">
        Password Reset
      </h1>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-yellow-800 dark:text-yellow-200 text-sm">
        Password reset functionality is currently disabled. Please contact the administrator for assistance.
      </div>
      
      <div className="text-center mt-6">
        <Link to="/login" className="btn-primary inline-block">
          Back to Login
        </Link>
      </div>
    </div>
  );
}