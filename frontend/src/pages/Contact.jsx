import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // In a real implementation, this would send the form data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate API call
      // await axios.post('/api/contact', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      title: 'General Inquiries',
      email: 'info@fusionfiesta.com',
      icon: '📧'
    },
    {
      title: 'Technical Support',
      email: 'support@fusionfiesta.com',
      icon: '⚙️'
    },
    {
      title: 'Event Organizers',
      email: 'organizers@fusionfiesta.com',
      icon: '🎪'
    },
    {
      title: 'Partnerships',
      email: 'partnerships@fusionfiesta.com',
      icon: '🤝'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Contact Us
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Have questions or feedback? We'd love to hear from you. Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Send us a message</h2>
          
          {submitStatus === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Thank you for your message! We'll get back to you soon.
                </p>
              </div>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-800 dark:text-red-200 font-medium">
                  There was an error sending your message. Please try again.
                </p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.subject ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="What is this regarding?"
                disabled={isSubmitting}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.message ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Your message here..."
                disabled={isSubmitting}
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all duration-300 ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
        
        {/* Contact Information */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700 mb-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Contact Information</h2>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start">
                  <div className="text-2xl mr-4 mt-1">{info.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg dark:text-white">{info.title}</h3>
                    <a 
                      href={`mailto:${info.email}`} 
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                      {info.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Office Location */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Our Location</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 dark:text-white">Event Management System</h3>
              <p className="text-gray-600 dark:text-gray-400">
                123 University Avenue<br />
                College Town, State 12345<br />
                Country
              </p>
            </div>
            
            {/* Google Maps Integration */}
            <div className="h-64 rounded-lg overflow-hidden mb-6">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890123!2d-74.0059413!3d40.7127753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjAiTiA3NMKwMDAnMjEuNCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event Management System Location"
              ></iframe>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2 dark:text-white">Office Hours</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                <li>Saturday: 10:00 AM - 4:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 dark:text-white">How do I register for events?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You need to create an account and upgrade to a Student Participant role. Once approved, 
              you can browse events and register with a single click.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3 dark:text-white">How long does staff approval take?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Staff approvals are typically processed within 24-48 hours. You'll receive an email 
              notification once your account is approved.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3 dark:text-white">Can I cancel my event registration?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, you can cancel your registration before the event deadline. Cancellations after 
              the deadline may be subject to fees.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3 dark:text-white">How do I download my certificate?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              After an event, organizers will upload certificates. You can download them from your 
              dashboard in the certificates section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}