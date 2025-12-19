export default function CommunicationCard({ contact, unreadCount, onSelect, isSelected }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 ${
        isSelected ? 'bg-indigo-50 dark:bg-slate-700' : ''
      }`}
      onClick={() => onSelect(contact)}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <span className="text-indigo-800 dark:text-indigo-200 font-medium">
            {getInitials(contact.name)}
          </span>
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {contact.name}
            </p>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
            {contact.email}
          </p>
        </div>
      </div>
    </div>
  );
}