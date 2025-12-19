import { useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EventTicket({ registration, user, onDownload, onReady }) {
  const ticketRef = useRef(null);

  const downloadTicket = useCallback(async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        padding: 20
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      
      // Calculate dimensions with proper margins
      const pageWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm
      const margin = 15; // 15mm margin on all sides
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image if it's smaller than content area
      const x = margin;
      const y = margin + (contentHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const fileName = `${registration.event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`;
      pdf.save(fileName);
      
      if (onDownload) onDownload();
    } catch {
      // Silently handle PDF generation errors
    }
  }, [onDownload, registration]);

  useEffect(() => {
    if (typeof onReady === 'function') onReady(downloadTicket);
  }, [onReady, downloadTicket]);

  const event = registration.event;
  const eventDate = new Date(event?.date);
  const registrationDate = new Date(registration.createdAt);

  return (
    <div className="relative">
      {/* Ticket Design */}
      <div
        ref={ticketRef}
        className="rounded-3xl overflow-hidden shadow-2xl mx-auto border-8 border-white dark:border-slate-800 transition-all duration-300 hover:shadow-3xl"
        style={{ width: '980px', padding: '20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #4f46e5)' }}
      >
        <div className="relative flex" style={{ minHeight: '360px' }}>
          {/* Left main area */}
          <div className="flex-1 p-8 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Top brand row */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm tracking-widest text-fuchsia-300 font-bold flex items-center">
                    <span className="mr-2">🎪</span>
                    EVENT MANAGER
                  </div>
                  <div className="text-xs text-indigo-200 mt-1 flex items-center">
                    <span className="mr-1">🎫</span>
                    Official Event Ticket
                  </div>
                </div>
                <div className="text-4xl relative">
                  🎟️
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Event title */}
              <div className="mb-6 relative">
                <div className="text-4xl font-extrabold tracking-wide drop-shadow-lg relative z-10">{event?.title}</div>
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-amber-400 to-fuchsia-500 rounded-full"></div>
                <div className="text-cyan-300 font-semibold mt-4 text-lg flex items-center">
                  <span className="mr-2 text-2xl">🎪</span>
                  {event?.category} EVENT
                </div>
              </div>

              {/* Big date/time row */}
              <div className="flex items-end gap-8 mb-6">
                <div className="text-3xl font-extrabold tracking-wide drop-shadow-lg relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <span className="text-amber-300">📅</span>
                  </div>
                  <div className="text-sm font-normal text-indigo-200 mb-1">DATE</div>
                  {eventDate.toLocaleDateString('en-GB')}
                </div>
                <div className="text-3xl font-extrabold tracking-wide drop-shadow-lg relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <span className="text-emerald-300">⏰</span>
                  </div>
                  <div className="text-sm font-normal text-indigo-200 mb-1">TIME</div>
                  {eventDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              <div className="uppercase tracking-widest text-cyan-300 mb-6 flex items-center relative">
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-cyan-300">📍</span>
                </div>
                <span className="ml-6 line-clamp-1">{event?.location}</span>
              </div>

              {/* Additional info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-xl p-3 border border-white/20 relative overflow-hidden">
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-indigo-300 text-xs">📅</span>
                  </div>
                  <div className="text-xs text-indigo-200">Registration Date</div>
                  <div className="font-medium">{registrationDate.toLocaleDateString()}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20 relative overflow-hidden">
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                    <span className="text-fuchsia-300 text-xs">#</span>
                  </div>
                  <div className="text-xs text-indigo-200">Ticket ID</div>
                  <div className="font-mono font-medium">{registration._id?.slice(-8).toUpperCase()}</div>
                </div>
              </div>

              {/* Barcode */}
              <div className="flex items-center mt-4 pt-4 border-t border-white/20 relative">
                <div className="absolute -top-3 left-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-t-lg font-semibold">
                  BARCODE
                </div>
                <div className="h-16 w-56 bg-[repeating-linear-gradient(90deg,_#fff_0,_#fff_2px,_transparent_2px,_transparent_4px)] rounded shadow-lg"></div>
                <div className="ml-4 text-sm text-indigo-200">
                  <div className="font-semibold flex items-center">
                    <span className="mr-1">🎫</span>
                    Ticket ID
                  </div>
                  <div className="font-mono">{registration._id?.slice(-8).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Perforation divider */}
          <div className="w-0.5 bg-white/40 relative">
            <div className="absolute inset-y-6 left-0 right-0 border-l-2 border-dashed border-white/70"></div>
          </div>

          {/* Right stub */}
          <div className="w-64 p-6 text-white flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #312e81, #1e3a8a)' }}>
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-300/30 rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-300/30 rounded-br-xl"></div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            
            {/* Vertical date/time */}
            <div className="text-cyan-300 text-base font-bold mb-5 tracking-widest text-center relative" style={{ textShadow: '0 0 10px rgba(103, 232, 249, 0.5)' }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-300 text-sm">⏰</span>
              </div>
              <div className="text-xs text-indigo-200 mb-1 pt-2">EVENT DATE & TIME</div>
              <div className="text-lg font-extrabold">
                {eventDate.getDate().toString().padStart(2, '0')} {(eventDate.getMonth() + 1).toString().padStart(2, '0')} {eventDate.getFullYear()}
              </div>
              <div className="text-lg font-extrabold mt-1">
                {eventDate.getHours().toString().padStart(2, '0')}:{eventDate.getMinutes().toString().padStart(2, '0')}
              </div>
            </div>

            {/* QR */}
            <div className="bg-white/10 rounded-xl p-4 mb-4 text-center flex-1 flex flex-col justify-center border border-white/20 relative overflow-hidden">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gradient-to-b from-indigo-700 to-indigo-900 flex items-center justify-center text-white text-xs font-bold rounded-b-lg">
                QR
              </div>
              <div className="text-indigo-100 text-sm mb-3 font-semibold flex items-center justify-center">
                <span className="mr-1">📱</span>
                ENTRY QR
              </div>
              {registration.qrCodeDataUrl ? (
                <img src={registration.qrCodeDataUrl} alt="QR" className="mx-auto w-40 h-40 rounded-md bg-white p-2 shadow-lg" />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-40 h-40 mx-auto flex items-center justify-center">
                  <span className="text-gray-500">No QR</span>
                </div>
              )}
              <div className="text-xs text-indigo-200 mt-3 flex items-center justify-center">
                <span className="mr-1">🔍</span>
                Scan at entry
              </div>
            </div>

            {/* User info */}
            <div className="text-center mb-4 p-3 bg-white/10 rounded-lg border border-white/20 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-indigo-700 text-white text-[10px] font-bold rounded-b flex items-center justify-center">
                👤
              </div>
              <div className="text-xs text-indigo-200 mt-1">Registered by</div>
              <div className="font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-indigo-200 truncate">{user?.email}</div>
            </div>

            {/* Footer small */}
            <div className="mt-auto text-center text-[10px] text-indigo-100/80 border-t border-white/20 pt-2">
              <div className="font-semibold flex items-center justify-center">
                <span className="mr-1">🎪</span>
                College Event Management System
              </div>
              <div className="opacity-70 flex items-center justify-center">
                <span className="mr-1">🌐</span>
                www.collegeevents.com
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ticket instructions */}
      <div className="mt-6 text-center text-gray-600 dark:text-slate-400 max-w-2xl mx-auto relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-slate-300 text-xs font-bold rounded-b-lg flex items-center justify-center">
          ℹ️
        </div>
        <div className="bg-indigo-50 dark:bg-slate-800/50 rounded-xl p-4 border border-indigo-100 dark:border-slate-700">
          <p className="mb-2 flex items-start">
            <span className="font-semibold mr-2">📋 Instructions:</span> 
            <span>Print this ticket or save it on your mobile device. Present it at the event entrance for check-in.</span>
          </p>
          <p className="flex items-start">
            <span className="font-semibold mr-2">⚠️ Note:</span> 
            <span>This ticket is non-transferable and may only be used by the registered attendee.</span>
          </p>
        </div>
      </div>
    </div>
  );
}