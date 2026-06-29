function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 shadow-sm">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-8">
        We're currently building out this feature to help you manage your business even better. Check back soon!
      </p>
      <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
        Notify me when ready
      </button>
    </div>
  )
}

export const Tasks = () => <ComingSoon title="Tasks & Projects" />
export const Deals = () => <ComingSoon title="Sales Deals Pipeline" />
export const Invoices = () => <ComingSoon title="Invoicing & Billing" />
export const Analytics = () => <ComingSoon title="Advanced Analytics" />
export const Calendar = () => <ComingSoon title="Team Calendar" />
export const Messages = () => <ComingSoon title="Client Messages" />
