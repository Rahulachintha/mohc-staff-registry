// ==========================================================================
// Ministry Staff Information Management System (SIMS)
// Ministry of Housing, Construction and Water Supply, Sri Lanka
// Full-Stack Client Application (React 18 + Tailwind CSS + Lucide Icons)
// ==========================================================================

const { useState, useEffect, useMemo, useRef } = React;

// Ministry Official Divisions (නිල අමාත්‍යාංශ අංශ ලැයිස්තුව)
const DIVISION_OPTIONS = [
  "පාලන අංශය (Administration Division)",
  "ආයතන කටයුතු අංශය (Institutional Affairs Division)",
  "ඉඩම් හා ප්‍රතිපත්ති අංශය (Lands & Policy Division)",
  "ගිණුම් අංශය - නිවාස (Accounts Division - Housing)",
  "ගිණුම් අංශය - ජල සම්පාදන (Accounts Division - Water Supply)",
  "නිවාස අංශය (Housing Division)",
  "සැලසුම් අංශය - නිවාස (Planning Division - Housing)",
  "නිවාස කොමසාරිස් අංශය (Housing Commissioner Division)",
  "අභ්‍යන්තර විගණන අංශය - නිවාස (Internal Audit - Housing)",
  "අභ්‍යන්තර විගණන අංශය - ජල සම්පාදන (Internal Audit - Water Supply)",
  "නිවාස පදිංචි කිරීමේ අංශය (Housing Settlement Division)",
  "සැලසුම් අංශය - ජල සම්පාදන (Planning Division - Water Supply)",
  "ව්‍යාපෘති මෙහෙයුම් අංශය - ජල සම්පාදන (Project Operations - Water Supply)",
  "ප්‍රසම්පාදන අංශය - ජල සම්පාදන (Procurement Division - Water Supply)",
  "තාක්ෂණ අංශය - ජල සම්පාදන (Technical Division - Water Supply)",
  "වෙනත් / Other"
];

// Common Ministry Designations for Autocomplete / Quick Select
const COMMON_DESIGNATIONS = [
  "Development Officer - Grade I",
  "Development Officer - Grade II",
  "Development Officer - Grade III",
  "Chief Engineer (Water Supply & Drainage) - Grade I",
  "Civil Engineer - Grade II",
  "Assistant Director (Planning) - Grade I",
  "Assistant Director (Planning) - Grade II",
  "Senior Accountant - SLAcS Class I",
  "Accountant - SLAcS Class II",
  "Management Service Officer (MSO) - Grade I",
  "Management Service Officer (MSO) - Grade II",
  "Management Service Officer (MSO) - Grade III",
  "Technical Officer (Civil) - Grade I",
  "Technical Officer (Mechanical) - Grade II",
  "Architect - Grade I",
  "Quantity Surveyor - Grade II",
  "Administrative Officer (Special Grade) - Management Service",
  "Internal Auditor - Grade I",
  "Legal Officer",
  "Office Employees Service (OES) - Grade I"
];

// Transferred Location Presets
const TRANSFER_LOCATION_PRESETS = [
  "National Housing Development Authority (NHDA) - Head Office",
  "National Housing Development Authority (NHDA) - District Office",
  "National Water Supply and Drainage Board (NWSDB) - Head Office, Ratmalana",
  "National Water Supply and Drainage Board (NWSDB) - Regional Office",
  "Urban Settlement Development Authority (USDA)",
  "State Engineering Corporation (SEC)",
  "Department of Buildings - Head Office",
  "Centre for Housing Planning & Building (CHPB)",
  "Condominium Management Authority (CMA)",
  "Ministry of Public Administration & Home Affairs",
  "Department of Pensions - Superannuation Division",
  "Other Government Department / Board"
];

// Validation Helper Functions
const validateNic = (nic) => {
  const clean = (nic || '').trim();
  const oldRegex = /^[0-9]{9}[vVxX]$/;
  const newRegex = /^[0-9]{12}$/;
  if (oldRegex.test(clean)) return { valid: true, type: 'Old NIC (9 Digits + V/X)' };
  if (newRegex.test(clean)) return { valid: true, type: 'New NIC (12 Digits)' };
  return { valid: false, message: 'Invalid format. Use 9 digits + V/X (e.g. 851234567V) or 12 digits (e.g. 198512345678).' };
};

const validatePhone = (phone) => {
  const clean = (phone || '').replace(/[\s-]/g, '');
  const lkMobileRegex = /^07[01245678][0-9]{7}$/;
  if (lkMobileRegex.test(clean)) return { valid: true };
  return { valid: false, message: 'Must be a 10-digit Sri Lankan mobile number starting with 07 (e.g. 0771234567).' };
};

const validateEmergencyPhone = (phone) => {
  const clean = (phone || '').replace(/[\s-]/g, '');
  const lkGeneralRegex = /^0[1-9][0-9]{8}$/;
  if (lkGeneralRegex.test(clean)) return { valid: true };
  return { valid: false, message: 'Must be a valid 10-digit Sri Lankan phone number (e.g. 07XXXXXXXX or 011XXXXXXX).' };
};

// Calculate Age from Date of Birth
const calculateAge = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Calculate Retirement Date (60 years from birth in Sri Lankan Public Service)
const calculateRetirementDate = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const retirementYear = dob.getFullYear() + 60;
  const month = String(dob.getMonth() + 1).padStart(2, '0');
  const day = String(dob.getDate()).padStart(2, '0');
  return `${retirementYear}-${month}-${day}`;
};

// SVG Icon Component helper
function Icon({ name, className = "w-5 h-5", ...props }) {
  // Built-in SVG paths for zero dependency reliance
  const icons = {
    user: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    shield: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    building: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
      </svg>
    ),
    briefcase: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    checkCircle: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    alertCircle: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    ),
    calendar: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    phone: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    search: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
      </svg>
    ),
    filter: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    download: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
      </svg>
    ),
    printer: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
      </svg>
    ),
    edit: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
    trash: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    arrowRight: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="5" x2="19" y1="12" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    lock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    unlock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    ),
    refresh: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    x: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
      </svg>
    ),
    eye: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    info: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" />
      </svg>
    ),
    sparkles: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    )
  };

  return icons[name] || icons.info;
}

// ==========================================================================
// MAIN ROOT COMPONENT
// ==========================================================================
function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '') || window.location.pathname.replace('/', '');
    return hash === 'admin' ? 'admin' : 'submit';
  });

  // Employees List & Loading State
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Authentication State
  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const saved = sessionStorage.getItem('mohc_admin_session');
      return saved ? JSON.parse(saved) : { isAuthenticated: false, token: null, user: null };
    } catch (e) {
      return { isAuthenticated: false, token: null, user: null };
    }
  });

  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals
  const [submissionSuccessModal, setSubmissionSuccessModal] = useState({ isOpen: false, record: null });
  const [dossierModal, setDossierModal] = useState({ isOpen: false, record: null });
  const [adminEditModal, setAdminEditModal] = useState({ isOpen: false, record: null });
  const [adminTransferModal, setAdminTransferModal] = useState({ isOpen: false, record: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, record: null });

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const route = window.location.hash.replace('#', '');
      if (route === 'admin' || route === 'submit') {
        setActiveTab(route);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch employees on initial load
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const json = await res.json();
        setEmployees(json.data || []);
        localStorage.setItem('mohc_employees_cache', JSON.stringify(json.data || []));
      } else {
        // Fallback to cache if offline
        const cached = localStorage.getItem('mohc_employees_cache');
        if (cached) setEmployees(JSON.parse(cached));
      }
    } catch (err) {
      console.warn('API error, using local cache:', err);
      const cached = localStorage.getItem('mohc_employees_cache');
      if (cached) setEmployees(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Admin Login Handler
  const handleAdminLogin = async (pin) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const authData = { isAuthenticated: true, token: data.token, user: data.user };
        setAdminAuth(authData);
        sessionStorage.setItem('mohc_admin_session', JSON.stringify(authData));
        addToast('success', 'Access Granted', 'Welcome to the Ministry Administration Portal.');
        return { success: true };
      } else {
        addToast('error', 'Authentication Failed', data.message || 'Invalid PIN or Password.');
        return { success: false, message: data.message };
      }
    } catch (err) {
      // Local fallback for PIN evaluation
      if (['admin123', 'ministry@2026'].includes((pin || '').trim())) {
        const authData = {
          isAuthenticated: true,
          token: 'offline_token_' + Date.now(),
          user: { name: 'HR Administrative Officer', role: 'Admin' }
        };
        setAdminAuth(authData);
        sessionStorage.setItem('mohc_admin_session', JSON.stringify(authData));
        addToast('success', 'Access Granted (Offline)', 'Welcome to the Ministry Administration Portal.');
        return { success: true };
      }
      addToast('error', 'Error', 'Could not verify credentials.');
      return { success: false, message: 'Invalid credentials' };
    }
  };

  const handleAdminLogout = () => {
    setAdminAuth({ isAuthenticated: false, token: null, user: null });
    sessionStorage.removeItem('mohc_admin_session');
    addToast('info', 'Logged Out', 'You have signed out of the Administrator session.');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toast Alert System */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.type} flex items-start gap-3`}>
            <div className="mt-0.5">
              {t.type === 'success' && <Icon name="checkCircle" className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <Icon name="alertCircle" className="w-5 h-5 text-rose-600" />}
              {t.type === 'warning' && <Icon name="alertCircle" className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <Icon name="info" className="w-5 h-5 text-sky-600" />}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-sm font-bold text-slate-800">{t.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Official Government Top Header */}
      <header className="gov-header">
        <div className="sl-flag-ribbon">
          <div className="bar-orange"></div>
          <div className="bar-green"></div>
          <div className="bar-gold"></div>
          <div className="bar-maroon"></div>
        </div>

        <div className="gov-container py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Branding & Emblem */}
            <div className="flex items-center gap-3.5">
              {/* Sri Lankan Lion / Ministry Insignia Image */}
              <div className="w-14 h-14 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center p-1 shadow-md overflow-hidden shrink-0">
                <img
                  src="/ministry-logo.png?v=2.1"
                  alt="Ministry Emblem"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold tracking-wider text-amber-300 uppercase flex items-center gap-1.5">
                  <span>ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය</span>
                  <span className="text-white/40">|</span>
                  <span>Sri Lanka</span>
                </div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-snug">
                  Ministry of Housing, Construction and Water Supply
                </h1>
                <p className="text-xs text-slate-300 font-medium">
                  Staff Information Management System (SIMS)
                </p>
              </div>
            </div>

            {/* Portal Switcher & Admin State */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('submit')}
                className={`portal-nav-btn ${activeTab === 'submit' ? 'active' : ''}`}
              >
                <Icon name="user" className="w-4 h-4" />
                <span>Staff Self-Service</span>
              </button>

              <button
                onClick={() => navigateTo('admin')}
                className={`portal-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              >
                <Icon name="shield" className="w-4 h-4" />
                <span>Admin Portal</span>
                {adminAuth.isAuthenticated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Admin Active"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body View Switching */}
      <main className="flex-1 py-8">
        {activeTab === 'submit' ? (
          <PublicSubmissionPortal
            onSuccessSubmit={(newRecord) => {
              setEmployees((prev) => [newRecord, ...prev]);
              setSubmissionSuccessModal({ isOpen: true, record: newRecord });
              addToast('success', 'Submission Confirmed', `Record registered with Ref: ${newRecord.referenceNumber}`);
            }}
            addToast={addToast}
            navigateToAdmin={() => navigateTo('admin')}
          />
        ) : (
          <AdminPortal
            adminAuth={adminAuth}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            employees={employees}
            loading={loading}
            onRefresh={fetchEmployees}
            onOpenDossier={(record) => setDossierModal({ isOpen: true, record })}
            onOpenEdit={(record) => setAdminEditModal({ isOpen: true, record })}
            onOpenTransfer={(record) => setAdminTransferModal({ isOpen: true, record })}
            onOpenDelete={(record) => setDeleteConfirmModal({ isOpen: true, record })}
            addToast={addToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 mt-auto border-t border-slate-800 no-print">
        <div className="gov-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Ministry of Housing, Construction and Water Supply</span>
            <span>•</span>
            <span>Government of Sri Lanka</span>
          </div>
          <div className="text-center md:text-right text-slate-500">
            Internal HR & Staff Information Management Registry • Official Administrative Portal
          </div>
        </div>
      </footer>

      {/* Confirmation & Receipt Modal */}
      {submissionSuccessModal.isOpen && (
        <SubmissionSuccessModal
          record={submissionSuccessModal.record}
          onClose={() => setSubmissionSuccessModal({ isOpen: false, record: null })}
          onOpenDossier={(rec) => {
            setSubmissionSuccessModal({ isOpen: false, record: null });
            setDossierModal({ isOpen: true, record: rec });
          }}
          onGoToAdmin={() => {
            setSubmissionSuccessModal({ isOpen: false, record: null });
            navigateTo('admin');
          }}
        />
      )}

      {/* Admin Inline Edit / Transfer Modal */}
      {adminEditModal.isOpen && (
        <AdminEditModal
          record={adminEditModal.record}
          onClose={() => setAdminEditModal({ isOpen: false, record: null })}
          onSave={async (updatedRecord) => {
            try {
              const res = await fetch(`/api/employees/${updatedRecord.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRecord)
              });
              if (res.ok) {
                const data = await res.json();
                setEmployees((prev) =>
                  prev.map((e) => (e.id === updatedRecord.id ? data.data : e))
                );
                addToast('success', 'Update Saved', 'Employee details and transfer status updated successfully.');
                setAdminEditModal({ isOpen: false, record: null });
              } else {
                throw new Error('Update failed');
              }
            } catch (err) {
              // Local fallback update
              setEmployees((prev) =>
                prev.map((e) => (e.id === updatedRecord.id ? updatedRecord : e))
              );
              addToast('success', 'Updated Locally', 'Employee record updated in session.');
              setAdminEditModal({ isOpen: false, record: null });
            }
          }}
          addToast={addToast}
        />
      )}

      {/* Dedicated Admin-Only Staff Transfer Modal */}
      {adminTransferModal.isOpen && (
        <AdminTransferModal
          record={adminTransferModal.record}
          onClose={() => setAdminTransferModal({ isOpen: false, record: null })}
          onSave={async (updatedRecord) => {
            try {
              const res = await fetch(`/api/employees/${updatedRecord.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRecord)
              });
              if (res.ok) {
                const data = await res.json();
                setEmployees((prev) =>
                  prev.map((e) => (e.id === updatedRecord.id ? data.data : e))
                );
                addToast('success', 'Transfer Record Saved', `ස්ථාන මාරු විස්තර සාර්ථකව යාවත්කාලීන කරන ලදී.`);
                setAdminTransferModal({ isOpen: false, record: null });
              } else {
                throw new Error('Update failed');
              }
            } catch (err) {
              setEmployees((prev) =>
                prev.map((e) => (e.id === updatedRecord.id ? updatedRecord : e))
              );
              addToast('success', 'Updated Locally', 'Transfer details updated in current session.');
              setAdminTransferModal({ isOpen: false, record: null });
            }
          }}
          addToast={addToast}
        />
      )}

      {/* Print-Friendly Employee Dossier Modal */}
      {dossierModal.isOpen && (
        <EmployeeDossierModal
          record={dossierModal.record}
          onClose={() => setDossierModal({ isOpen: false, record: null })}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <DeleteConfirmModal
          record={deleteConfirmModal.record}
          onClose={() => setDeleteConfirmModal({ isOpen: false, record: null })}
          onConfirm={async () => {
            const targetId = deleteConfirmModal.record.id;
            try {
              const res = await fetch(`/api/employees/${targetId}`, { method: 'DELETE' });
              if (res.ok) {
                setEmployees((prev) => prev.filter((e) => e.id !== targetId));
                addToast('success', 'Record Deleted', `Record for ${deleteConfirmModal.record.fullName} removed.`);
              } else {
                throw new Error('Failed to delete');
              }
            } catch (err) {
              setEmployees((prev) => prev.filter((e) => e.id !== targetId));
              addToast('info', 'Deleted', 'Record removed from current database.');
            } finally {
              setDeleteConfirmModal({ isOpen: false, record: null });
            }
          }}
        />
      )}
    </div>
  );
}

// ==========================================================================
// 1. PUBLIC STAFF SUBMISSION FORM PORTAL
// ==========================================================================
function PublicSubmissionPortal({ onSuccessSubmit, addToast, navigateToAdmin }) {
  const initialForm = {
    fullName: '',
    designationGrade: '',
    nicNumber: '',
    dateOfBirth: '',
    dateOfAppointment: '',
    permanentAddress: '',
    contactNumber: '',
    dateOfRetirement: '',
    dateOfSalaryIncrement: '',
    dateReportedToMinistry: '',
    willingnessForInternalTransfer: 'No',
    preferredDivisions: [],
    emergencyContactNumber: '',
    agreeDeclaration: false
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-calculate Age and suggest Retirement Date on DOB change
  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  const handleDobChange = (e) => {
    const dob = e.target.value;
    const updates = { dateOfBirth: dob };
    if (dob && !form.dateOfRetirement) {
      updates.dateOfRetirement = calculateRetirementDate(dob);
    }
    setForm((prev) => ({ ...prev, ...updates }));
    if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: null }));
  };

  // Division checkbox selection (Strict limit of 2)
  const toggleDivision = (division) => {
    const current = [...form.preferredDivisions];
    const exists = current.includes(division);

    if (exists) {
      setForm((prev) => ({
        ...prev,
        preferredDivisions: current.filter((d) => d !== division)
      }));
    } else {
      if (current.length >= 2) {
        addToast('warning', 'Selection Limit Reached', 'You can select a maximum of 2 preferred divisions only.');
        return;
      }
      setForm((prev) => ({
        ...prev,
        preferredDivisions: [...current, division]
      }));
    }
  };

  // Pre-fill realistic Sri Lankan demo employee for quick testing
  const handlePrefillDemo = () => {
    const demoEmployees = [
      {
        fullName: 'Eng. Bandula S. Wickramasinghe',
        designationGrade: 'Civil Engineer - Grade II',
        nicNumber: '198421503456',
        dateOfBirth: '1984-06-18',
        dateOfAppointment: '2010-04-01',
        permanentAddress: 'No. 54/3, Dharmapala Mawatha, Colombo 07, Sri Lanka',
        contactNumber: '0772345678',
        dateOfRetirement: '2044-06-18',
        dateOfSalaryIncrement: '2026-04-01',
        dateReportedToMinistry: '2019-02-15',
        willingnessForInternalTransfer: 'Yes',
        preferredDivisions: [
          'තාක්ෂණ අංශය - ජල සම්පාදන (Technical Division - Water Supply)',
          'සැලසුම් අංශය - නිවාස (Planning Division - Housing)'
        ],
        emergencyContactNumber: '0714567891',
        agreeDeclaration: true
      },
      {
        fullName: 'Mrs. K. Malani Gunasekara',
        designationGrade: 'Development Officer - Grade II',
        nicNumber: '886741235V',
        dateOfBirth: '1988-03-24',
        dateOfAppointment: '2014-08-01',
        permanentAddress: '15/B, Station Road, Moratuwa, Colombo District',
        contactNumber: '0718901234',
        dateOfRetirement: '2048-03-24',
        dateOfSalaryIncrement: '2026-08-01',
        dateReportedToMinistry: '2021-05-10',
        willingnessForInternalTransfer: 'No',
        preferredDivisions: [],
        emergencyContactNumber: '0776543210',
        agreeDeclaration: true
      }
    ];

    const pick = demoEmployees[Math.floor(Math.random() * demoEmployees.length)];
    setForm(pick);
    setErrors({});
    addToast('info', 'Demo Data Populated', 'Sample Sri Lankan public servant information has been loaded into the form.');
  };

  // Reset form
  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate Full Name
    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required.';

    // Validate Designation
    if (!form.designationGrade.trim()) newErrors.designationGrade = 'Designation and Grade is required.';

    // Validate NIC
    const nicCheck = validateNic(form.nicNumber);
    if (!form.nicNumber.trim()) {
      newErrors.nicNumber = 'National Identity Card (NIC) is required.';
    } else if (!nicCheck.valid) {
      newErrors.nicNumber = nicCheck.message;
    }

    // Validate Dates
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required.';
    if (!form.dateOfAppointment) newErrors.dateOfAppointment = 'Public Service Appointment Date is required.';
    if (!form.permanentAddress.trim()) newErrors.permanentAddress = 'Permanent Residential Address is required.';

    // Validate Contact Number
    const phoneCheck = validatePhone(form.contactNumber);
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required.';
    } else if (!phoneCheck.valid) {
      newErrors.contactNumber = phoneCheck.message;
    }

    if (!form.dateOfRetirement) newErrors.dateOfRetirement = 'Retirement Date is required.';
    if (!form.dateOfSalaryIncrement) newErrors.dateOfSalaryIncrement = 'Annual Salary Increment Date is required.';
    if (!form.dateReportedToMinistry) newErrors.dateReportedToMinistry = 'Date Reported to this Ministry is required.';

    // Validate Transfer choices
    if (form.willingnessForInternalTransfer === 'Yes') {
      if (form.preferredDivisions.length === 0) {
        newErrors.preferredDivisions = 'Please select at least 1 preferred division (Maximum 2).';
      } else if (form.preferredDivisions.length > 2) {
        newErrors.preferredDivisions = 'Strict maximum 2 preferred divisions allowed.';
      }
    }

    // Validate Emergency Contact
    const emergCheck = validateEmergencyPhone(form.emergencyContactNumber);
    if (!form.emergencyContactNumber.trim()) {
      newErrors.emergencyContactNumber = 'Emergency Contact Number is required.';
    } else if (!emergCheck.valid) {
      newErrors.emergencyContactNumber = emergCheck.message;
    }

    // Validate Declaration Checkbox
    if (!form.agreeDeclaration) {
      newErrors.agreeDeclaration = 'You must confirm the truthfulness of the provided information.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('error', 'Form Incomplete', 'Please review the highlighted fields and correct errors.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        designationGrade: form.designationGrade.trim(),
        nicNumber: form.nicNumber.trim().toUpperCase(),
        dateOfBirth: form.dateOfBirth,
        dateOfAppointment: form.dateOfAppointment,
        permanentAddress: form.permanentAddress.trim(),
        contactNumber: form.contactNumber.replace(/[\s-]/g, ''),
        dateOfRetirement: form.dateOfRetirement,
        dateOfSalaryIncrement: form.dateOfSalaryIncrement,
        dateReportedToMinistry: form.dateReportedToMinistry,
        willingnessForInternalTransfer: form.willingnessForInternalTransfer,
        preferredDivisions: form.willingnessForInternalTransfer === 'Yes' ? form.preferredDivisions : [],
        emergencyContactNumber: form.emergencyContactNumber.replace(/[\s-]/g, '')
      };

      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccessSubmit(data.data);
        setForm(initialForm);
        setErrors({});
      } else if (res.status === 409) {
        setErrors({ nicNumber: data.errors?.nicNumber || 'This NIC is already registered in the system.' });
        addToast('error', 'Duplicate NIC Found', 'An employee record with this National Identity Card number already exists.');
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      // Local fallback in case server was disconnected
      console.warn('Backend error, creating locally:', err);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const fallbackRecord = {
        id: 'local_' + Date.now(),
        referenceNumber: `MOHC-WS-2026-${randomSuffix}`,
        ...form,
        submissionTimestamp: new Date().toISOString(),
        status: 'Active',
        dateOfTransfer: '',
        transferredLocation: ''
      };
      onSuccessSubmit(fallbackRecord);
      setForm(initialForm);
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  const nicValidation = useMemo(() => validateNic(form.nicNumber), [form.nicNumber]);
  const phoneValidation = useMemo(() => validatePhone(form.contactNumber), [form.contactNumber]);

  return (
    <div className="gov-container max-w-4xl">
      {/* Intro Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Icon name="building" className="w-3.5 h-3.5" />
              <span>Official Employee Registration</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Ministry Staff Information Registry
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Please enter your comprehensive service, personal, and transfer preference details accurately.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm text-slate-600 hover:text-slate-900"
              title="Clear all fields"
            >
              <Icon name="refresh" className="w-3.5 h-3.5" />
              <span>පෝරමය හිස් කරන්න (Clear Form)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Icon name="shield" className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure internal Sri Lankan government record registry</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="calendar" className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Auto-calculates age and 60-year statutory retirement</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="printer" className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Generates verified official submission receipt</span>
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="form-card p-6 md:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Official identity, residential address, and primary contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="fullName">
                Full Name (with Title) <span className="required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g. Mr. Bandula Priyantha Jayasuriya / Eng. Sanduni Senanayake"
                className={`form-input ${errors.fullName ? 'is-invalid' : ''}`}
                value={form.fullName}
                onChange={(e) => {
                  setForm({ ...form, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
              />
              {errors.fullName && <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.fullName}</p>}
              <p className="field-hint">Enter your full legal name as recognized by the Department of Public Administration.</p>
            </div>

            {/* NIC Number */}
            <div>
              <label className="form-label" htmlFor="nicNumber">
                National Identity Card (NIC) <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  id="nicNumber"
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 198512345678 or 851234567V"
                  className={`form-input uppercase ${errors.nicNumber ? 'is-invalid' : form.nicNumber && nicValidation.valid ? 'border-emerald-500' : ''}`}
                  value={form.nicNumber}
                  onChange={(e) => {
                    setForm({ ...form, nicNumber: e.target.value });
                    if (errors.nicNumber) setErrors({ ...errors, nicNumber: null });
                  }}
                />
                {form.nicNumber && (
                  <div className="absolute right-3 top-2.5">
                    {nicValidation.valid ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {nicValidation.type}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Invalid
                      </span>
                    )}
                  </div>
                )}
              </div>
              {errors.nicNumber ? (
                <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.nicNumber}</p>
              ) : (
                <p className="field-hint">Accepts both 9 digits + V/X (Old) or 12 digits (New format).</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="form-label" htmlFor="dateOfBirth">
                Date of Birth <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  id="dateOfBirth"
                  type="date"
                  className={`form-input ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                  value={form.dateOfBirth}
                  onChange={handleDobChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {age !== '' && (
                  <div className="absolute right-3 top-2.5 pointer-events-none">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Age: {age} yrs
                    </span>
                  </div>
                )}
              </div>
              {errors.dateOfBirth ? (
                <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.dateOfBirth}</p>
              ) : (
                <p className="field-hint">Automatically configures mandatory public retirement forecast.</p>
              )}
            </div>

            {/* Permanent Address */}
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="permanentAddress">
                Permanent Residential Address <span className="required">*</span>
              </label>
              <textarea
                id="permanentAddress"
                rows={3}
                placeholder="Street address, city, and electoral / district division"
                className={`form-textarea ${errors.permanentAddress ? 'is-invalid' : ''}`}
                value={form.permanentAddress}
                onChange={(e) => {
                  setForm({ ...form, permanentAddress: e.target.value });
                  if (errors.permanentAddress) setErrors({ ...errors, permanentAddress: null });
                }}
              />
              {errors.permanentAddress && <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.permanentAddress}</p>}
            </div>

            {/* Personal Contact Number */}
            <div>
              <label className="form-label" htmlFor="contactNumber">
                Personal Contact Number (Mobile) <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  id="contactNumber"
                  type="tel"
                  maxLength={10}
                  placeholder="07XXXXXXXX"
                  className={`form-input ${errors.contactNumber ? 'is-invalid' : form.contactNumber && phoneValidation.valid ? 'border-emerald-500' : ''}`}
                  value={form.contactNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setForm({ ...form, contactNumber: cleaned });
                    if (errors.contactNumber) setErrors({ ...errors, contactNumber: null });
                  }}
                />
                {form.contactNumber && (
                  <div className="absolute right-3 top-2.5">
                    {phoneValidation.valid ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Valid 07 Mobile
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                        10 Digits Required
                      </span>
                    )}
                  </div>
                )}
              </div>
              {errors.contactNumber ? (
                <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.contactNumber}</p>
              ) : (
                <p className="field-hint">10 digits starting with 07 (e.g., 0771234567, 071..., 076...).</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: SERVICE & APPOINTMENT DETAILS */}
        <div className="form-card p-6 md:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Service & Appointment Details</h3>
              <p className="text-xs text-slate-500">Designation grade, recruitment chronology, retirement, and salary increment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Designation & Grade */}
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="designationGrade">
                Designation & Grade <span className="required">*</span>
              </label>
              <div className="space-y-2">
                <input
                  id="designationGrade"
                  type="text"
                  list="designationsList"
                  placeholder="e.g. Development Officer - Grade II or Chief Engineer"
                  className={`form-input ${errors.designationGrade ? 'is-invalid' : ''}`}
                  value={form.designationGrade}
                  onChange={(e) => {
                    setForm({ ...form, designationGrade: e.target.value });
                    if (errors.designationGrade) setErrors({ ...errors, designationGrade: null });
                  }}
                />
                <datalist id="designationsList">
                  {COMMON_DESIGNATIONS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Quick options:</span>
                  {["Development Officer - Grade II", "Civil Engineer - Grade II", "Management Service Officer (MSO) - Grade II", "Senior Accountant"].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setForm({ ...form, designationGrade: quick })}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
              {errors.designationGrade && <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.designationGrade}</p>}
            </div>

            {/* Date of Public Service Appointment */}
            <div>
              <label className="form-label" htmlFor="dateOfAppointment">
                Date of Public Service Appointment <span className="required">*</span>
              </label>
              <input
                id="dateOfAppointment"
                type="date"
                className={`form-input ${errors.dateOfAppointment ? 'is-invalid' : ''}`}
                value={form.dateOfAppointment}
                onChange={(e) => {
                  setForm({ ...form, dateOfAppointment: e.target.value });
                  if (errors.dateOfAppointment) setErrors({ ...errors, dateOfAppointment: null });
                }}
              />
              {errors.dateOfAppointment && <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.dateOfAppointment}</p>}
              <p className="field-hint">First date of entry into Sri Lankan Public Service.</p>
            </div>

            {/* Date Reported to this Ministry */}
            <div>
              <label className="form-label" htmlFor="dateReportedToMinistry">
                Date Reported to Ministry <span className="required">*</span>
              </label>
              <input
                id="dateReportedToMinistry"
                type="date"
                className={`form-input ${errors.dateReportedToMinistry ? 'is-invalid' : ''}`}
                value={form.dateReportedToMinistry}
                onChange={(e) => {
                  setForm({ ...form, dateReportedToMinistry: e.target.value });
                  if (errors.dateReportedToMinistry) setErrors({ ...errors, dateReportedToMinistry: null });
                }}
              />
              {errors.dateReportedToMinistry && <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.dateReportedToMinistry}</p>}
              <p className="field-hint">Date assumed duties at Ministry of Housing, Construction & Water Supply.</p>
            </div>

            {/* Date of Statutory Retirement */}
            <div>
              <label className="form-label" htmlFor="dateOfRetirement">
                Date of Retirement <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  id="dateOfRetirement"
                  type="date"
                  className={`form-input ${errors.dateOfRetirement ? 'is-invalid' : ''}`}
                  value={form.dateOfRetirement}
                  onChange={(e) => {
                    setForm({ ...form, dateOfRetirement: e.target.value });
                    if (errors.dateOfRetirement) setErrors({ ...errors, dateOfRetirement: null });
                  }}
                />
              </div>
              {errors.dateOfRetirement ? (
                <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.dateOfRetirement}</p>
              ) : (
                <p className="field-hint">Standard age 60 retirement ceiling under public administration circulars.</p>
              )}
            </div>

            {/* Annual Salary Increment Date */}
            <div>
              <label className="form-label" htmlFor="dateOfSalaryIncrement">
                Annual Salary Increment Date <span className="required">*</span>
              </label>
              <input
                id="dateOfSalaryIncrement"
                type="date"
                className={`form-input ${errors.dateOfSalaryIncrement ? 'is-invalid' : ''}`}
                value={form.dateOfSalaryIncrement}
                onChange={(e) => {
                  setForm({ ...form, dateOfSalaryIncrement: e.target.value });
                  if (errors.dateOfSalaryIncrement) setErrors({ ...errors, dateOfSalaryIncrement: null });
                }}
              />
              {errors.dateOfSalaryIncrement && <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.dateOfSalaryIncrement}</p>}
              <p className="field-hint">Scheduled date for annual public sector salary increment endorsement.</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: TRANSFER PREFERENCES & EMERGENCY CONTACT */}
        <div className="form-card p-6 md:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Transfer Preferences & Emergency Contact</h3>
              <p className="text-xs text-slate-500">Internal ministry re-assignment choices and designated emergency contact</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Willingness for Internal Transfer */}
            <div>
              <label className="form-label">
                Willingness for Internal Transfer <span className="required">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4 max-w-md pt-1">
                <label
                  className={`flex items-center justify-center gap-2.5 p-3.5 rounded-lg border-2 cursor-pointer transition font-semibold text-sm ${form.willingnessForInternalTransfer === 'Yes'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="willingnessForInternalTransfer"
                    value="Yes"
                    checked={form.willingnessForInternalTransfer === 'Yes'}
                    onChange={() => {
                      setForm({ ...form, willingnessForInternalTransfer: 'Yes' });
                      if (errors.willingnessForInternalTransfer) {
                        setErrors({ ...errors, willingnessForInternalTransfer: null });
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Yes, I am Willing</span>
                </label>

                <label
                  className={`flex items-center justify-center gap-2.5 p-3.5 rounded-lg border-2 cursor-pointer transition font-semibold text-sm ${form.willingnessForInternalTransfer === 'No'
                    ? 'border-slate-600 bg-slate-100 text-slate-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="willingnessForInternalTransfer"
                    value="No"
                    checked={form.willingnessForInternalTransfer === 'No'}
                    onChange={() => {
                      setForm({
                        ...form,
                        willingnessForInternalTransfer: 'No',
                        preferredDivisions: []
                      });
                      if (errors.preferredDivisions) {
                        setErrors({ ...errors, preferredDivisions: null });
                      }
                    }}
                    className="w-4 h-4 text-slate-600"
                  />
                  <span>No, Retain in Current Post</span>
                </label>
              </div>
            </div>

            {/* CONDITIONAL RENDERING: PREFERRED DIVISIONS (ONLY IF YES) */}
            {form.willingnessForInternalTransfer === 'Yes' && (
              <div className="p-5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                      <Icon name="briefcase" className="w-4 h-4 text-blue-700" />
                      <span>Preferred Division(s) Selection</span>
                    </h4>
                    <p className="text-xs text-blue-800/80 mt-0.5">
                      Select your target internal division within the Ministry (Strict maximum of 2 choices allowed).
                    </p>
                  </div>

                  {/* Counter Badge */}
                  <div className="self-start sm:self-auto">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${form.preferredDivisions.length === 2
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                    >
                      <span>Selected: {form.preferredDivisions.length} / 2 Max</span>
                    </span>
                  </div>
                </div>

                {errors.preferredDivisions && (
                  <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.preferredDivisions}</p>
                )}

                {/* Division Checkbox Grid */}
                <div className="division-grid">
                  {DIVISION_OPTIONS.map((div) => {
                    const isSelected = form.preferredDivisions.includes(div);
                    const isMaxReached = form.preferredDivisions.length >= 2 && !isSelected;

                    return (
                      <div
                        key={div}
                        onClick={() => toggleDivision(div)}
                        className={`division-card ${isSelected ? 'selected' : ''} ${isMaxReached ? 'disabled' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isMaxReached}
                          readOnly
                          className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-950 font-bold' : 'text-slate-800'}`}>
                            {div.split(' (')[0]}
                          </div>
                          {div.includes('(') && (
                            <div className={`text-[11px] leading-snug mt-0.5 ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>
                              {'(' + div.split(' (')[1]}
                            </div>
                          )}
                          {isMaxReached && (
                            <div className="text-[10px] text-slate-400 mt-0.5 font-normal">උපරිම 2 සීමාව (Max reached)</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emergency Contact Number */}
            <div className="pt-2">
              <label className="form-label" htmlFor="emergencyContactNumber">
                Emergency Contact Number <span className="required">*</span>
              </label>
              <div className="max-w-md">
                <input
                  id="emergencyContactNumber"
                  type="tel"
                  maxLength={10}
                  placeholder="07XXXXXXXX or 011XXXXXXX"
                  className={`form-input ${errors.emergencyContactNumber ? 'is-invalid' : ''}`}
                  value={form.emergencyContactNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setForm({ ...form, emergencyContactNumber: cleaned });
                    if (errors.emergencyContactNumber) setErrors({ ...errors, emergencyContactNumber: null });
                  }}
                />
                {errors.emergencyContactNumber ? (
                  <p className="field-error"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.emergencyContactNumber}</p>
                ) : (
                  <p className="field-hint">Next of kin or emergency family phone number (10 digits).</p>
                )}
              </div>
            </div>

            {/* Official Employee Declaration Checkbox */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.agreeDeclaration}
                  onChange={(e) => {
                    setForm({ ...form, agreeDeclaration: e.target.checked });
                    if (errors.agreeDeclaration) setErrors({ ...errors, agreeDeclaration: null });
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I hereby officially declare that the information furnished by me in this registration form is accurate, authentic, and complete to the best of my knowledge, and matches my official civil service personal file maintained by the Ministry of Housing, Construction and Water Supply, Sri Lanka.
                </span>
              </label>
              {errors.agreeDeclaration && (
                <p className="field-error mt-2"><Icon name="alertCircle" className="w-3.5 h-3.5" />{errors.agreeDeclaration}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={navigateToAdmin}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
          >
            <Icon name="shield" className="w-4 h-4 text-slate-400" />
            <span>Are you an Administrator? Access Admin Portal</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary w-full sm:w-auto"
              disabled={submitting}
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full sm:w-auto px-8 shadow-md hover:shadow-lg"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Icon name="checkCircle" className="w-4 h-4" />
                  <span>Submit Employee Record</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==========================================================================
// 2. ADMIN DASHBOARD & MANAGEMENT PORTAL (PROTECTED)
// ==========================================================================
function AdminPortal({
  adminAuth,
  onLogin,
  onLogout,
  employees,
  loading,
  onRefresh,
  onOpenDossier,
  onOpenEdit,
  onOpenTransfer,
  onOpenDelete,
  addToast
}) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [transferFilter, setTransferFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [divisionFilter, setDivisionFilter] = useState('All');

  // Extract distinct designations present in employees
  const availableDesignations = useMemo(() => {
    const set = new Set();
    employees.forEach(e => {
      if (e.designationGrade) set.add(e.designationGrade.trim());
    });
    return Array.from(set).sort();
  }, [employees]);

  // Sorting State
  const [sortField, setSortField] = useState('dateReportedToMinistry');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Authenticate PIN
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('Please enter the Administrator PIN / Password.');
      return;
    }
    setAuthenticating(true);
    setPinError('');
    const res = await onLogin(pinInput);
    if (!res.success) {
      setPinError(res.message || 'Authentication failed. Please verify your PIN.');
    }
    setAuthenticating(false);
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = employees.length;
    const willingCount = employees.filter((e) => e.willingnessForInternalTransfer === 'Yes').length;
    const activeCount = employees.filter((e) => e.status === 'Active').length;
    const transferredCount = employees.filter((e) => e.status === 'Transferred').length;
    const retiredCount = employees.filter((e) => e.status === 'Retired').length;

    // Upcoming retirements in 2026 / near future
    const currentYear = new Date().getFullYear();
    const upcomingRetirements = employees.filter((e) => {
      if (!e.dateOfRetirement) return false;
      const retYear = new Date(e.dateOfRetirement).getFullYear();
      return retYear <= currentYear + 1 && e.status !== 'Retired';
    }).length;

    return {
      total,
      willingCount,
      willingPct: total > 0 ? Math.round((willingCount / total) * 100) : 0,
      activeCount,
      transferredCount,
      retiredCount,
      upcomingRetirements
    };
  }, [employees]);

  // Filtering & Search
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return employees.filter((emp) => {
      // Search by Name, NIC, or Designation
      const matchesSearch =
        !term ||
        (emp.fullName && emp.fullName.toLowerCase().includes(term)) ||
        (emp.nicNumber && emp.nicNumber.toLowerCase().includes(term)) ||
        (emp.designationGrade && emp.designationGrade.toLowerCase().includes(term)) ||
        (emp.referenceNumber && emp.referenceNumber.toLowerCase().includes(term));

      // Status Filter
      const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

      // Transfer Filter
      const matchesTransfer =
        transferFilter === 'All' || emp.willingnessForInternalTransfer === transferFilter;

      // Designation Filter
      const matchesDesignation =
        designationFilter === 'All' || emp.designationGrade === designationFilter;

      // Division Filter
      const matchesDivision =
        divisionFilter === 'All' ||
        (emp.preferredDivisions && emp.preferredDivisions.includes(divisionFilter));

      return matchesSearch && matchesStatus && matchesTransfer && matchesDesignation && matchesDivision;
    });
  }, [employees, searchTerm, statusFilter, transferFilter, designationFilter, divisionFilter]);

  // Sorting
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortDirection]);

  // Pagination
  const totalRecords = sortedEmployees.length;
  const totalPages = pageSize === 'All' ? 1 : Math.ceil(totalRecords / pageSize);
  const pagedEmployees = useMemo(() => {
    if (pageSize === 'All') return sortedEmployees;
    const start = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // CSV Export Action
  const handleExportCsv = () => {
    window.location.href = '/api/export/csv';
    addToast('success', 'Export Initiated', 'Full employee registry CSV has been prepared and downloaded.');
  };

  // JSON Export Backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(employees, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MOHC_WS_Registry_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('info', 'JSON Backup Created', 'Complete registry downloaded in JSON format.');
  };

  // Reset Sample Data
  const handleResetDemoData = async () => {
    if (confirm('Are you sure you want to restore standard Sri Lankan Ministry demonstration records? Custom entries will be reset.')) {
      try {
        const res = await fetch('/api/reset-data', { method: 'POST' });
        if (res.ok) {
          onRefresh();
          addToast('success', 'Reset Complete', 'Registry restored to default Sri Lankan civil service demonstration dataset.');
        }
      } catch (e) {
        addToast('error', 'Error', 'Failed to reset database.');
      }
    }
  };

  // --- SCREEN 1: PIN AUTHENTICATION BARRIER ---
  if (!adminAuth.isAuthenticated) {
    return (
      <div className="gov-container max-w-md py-12">
        <div className="form-card p-8 border-slate-300 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 p-2 shadow-md">
              <img src="/ministry-logo.png?v=2.1" alt="Ministry Emblem" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Ministry HR Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Restricted to authorized human resources officers and directorate administration.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="adminPin">
                Administrator PIN / Password
              </label>
              <div className="relative">
                <input
                  id="adminPin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter access PIN"
                  className={`form-input pr-10 text-center tracking-widest text-lg font-mono ${pinError ? 'is-invalid' : ''}`}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Toggle PIN visibility"
                >
                  <Icon name={showPin ? 'unlock' : 'lock'} className="w-5 h-5" />
                </button>
              </div>
              {pinError && <p className="field-error justify-center"><Icon name="alertCircle" className="w-3.5 h-3.5" />{pinError}</p>}
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="btn btn-primary w-full py-2.5"
            >
              {authenticating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Icon name="unlock" className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <div className="gov-container max-w-7xl space-y-6">
      {/* Top Admin Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-xs">
            <img src="/ministry-logo.png?v=2.1" alt="Ministry Emblem" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">HR Administration & Staff Registry</h2>
              <span className="badge badge-active text-[10px]">Session Active</span>
            </div>
            <p className="text-xs text-slate-500">
              Welcome, <span className="font-semibold text-slate-700">{adminAuth.user?.name || 'Administrative Officer'}</span> • Ministry Directorate Management
            </p>
          </div>
        </div>

        {/* Global Admin Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            title="Refresh database records"
          >
            <Icon name="refresh" className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="btn btn-secondary btn-sm bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900"
            title="Export all records to Excel-friendly CSV"
          >
            <Icon name="download" className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="btn btn-secondary btn-sm text-slate-600"
            title="Download JSON Database Backup"
          >
            <span>JSON Backup</span>
          </button>

          <button
            onClick={onLogout}
            className="btn btn-danger btn-sm"
            title="Sign out of Admin session"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Total Registered */}
        <div className="form-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registered</span>
            <Icon name="user" className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Official service records</p>
        </div>

        {/* Willing to Transfer */}
        <div className="form-card p-4 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Willing to Transfer</span>
            <Icon name="briefcase" className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">{metrics.willingCount}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="badge badge-transferred text-[10px] py-0 px-1.5">{metrics.willingPct}% of total</span>
          </div>
        </div>

        {/* Active Staff */}
        <div className="form-card p-4">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Staff</span>
            <Icon name="checkCircle" className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.activeCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">In ministry service</p>
        </div>

        {/* Transferred */}
        <div className="form-card p-4">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Transferred Out</span>
            <Icon name="arrowRight" className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{metrics.transferredCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Reassigned to boards/agencies</p>
        </div>

        {/* Retired */}
        <div className="form-card p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Retired</span>
            <Icon name="calendar" className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-700">{metrics.retiredCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Superannuated personnel</p>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Real-Time Search Bar */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Name, NIC, Designation, Ref..."
              className="form-input pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter by Status */}
          <div className="lg:col-span-2">
            <select
              className="form-select text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Transferred">Transferred</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          {/* Filter by Transfer Willingness */}
          <div className="lg:col-span-2">
            <select
              className="form-select text-sm"
              value={transferFilter}
              onChange={(e) => {
                setTransferFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">Transfer: All</option>
              <option value="Yes">Willing (Yes)</option>
              <option value="No">Not Willing (No)</option>
            </select>
          </div>

          {/* Filter by Designation */}
          <div className="lg:col-span-2">
            <select
              className="form-select text-sm"
              value={designationFilter}
              onChange={(e) => {
                setDesignationFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">Designation: All</option>
              {availableDesignations.map((des) => (
                <option key={des} value={des}>
                  {des}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Preferred Division */}
          <div className="lg:col-span-2">
            <select
              className="form-select text-sm"
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">Division: All</option>
              {DIVISION_OPTIONS.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Clear filters */}
        {(searchTerm || statusFilter !== 'All' || transferFilter !== 'All' || designationFilter !== 'All' || divisionFilter !== 'All') && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {filteredEmployees.length} of {employees.length} records matching current filters
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setTransferFilter('All');
                setDesignationFilter('All');
                setDivisionFilter('All');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="data-table-container shadow-sm">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('referenceNumber')}>
                <div className="flex items-center gap-1.5">
                  <span>Ref & Submission</span>
                  {sortField === 'referenceNumber' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('fullName')}>
                <div className="flex items-center gap-1.5">
                  <span>Employee Name & NIC</span>
                  {sortField === 'fullName' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('designationGrade')}>
                <div className="flex items-center gap-1.5">
                  <span>Designation & Grade</span>
                  {sortField === 'designationGrade' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th>Contact Details</th>
              <th className="sortable" onClick={() => handleSort('dateReportedToMinistry')}>
                <div className="flex items-center gap-1.5">
                  <span>Key Dates</span>
                  {sortField === 'dateReportedToMinistry' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th>Transfer Preference</th>
              <th className="sortable" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {sortField === 'status' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span>Loading official registry...</span>
                </td>
              </tr>
            ) : pagedEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  <Icon name="search" className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No matching employee records found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or clear the filters</p>
                </td>
              </tr>
            ) : (
              pagedEmployees.map((emp) => (
                <tr key={emp.id} className="transition">
                  {/* Reference & Submission Date */}
                  <td>
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {emp.referenceNumber || 'MOHC-WS-REG'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {emp.submissionTimestamp ? new Date(emp.submissionTimestamp).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>

                  {/* Employee Name & NIC */}
                  <td>
                    <div className="font-bold text-slate-900">{emp.fullName}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {emp.nicNumber}
                      </span>
                    </div>
                  </td>

                  {/* Designation */}
                  <td>
                    <div className="text-xs font-medium text-slate-800">{emp.designationGrade}</div>
                  </td>

                  {/* Contact Numbers */}
                  <td>
                    <div className="text-xs font-mono text-slate-700 flex items-center gap-1">
                      <Icon name="phone" className="w-3 h-3 text-slate-400" />
                      <span>{emp.contactNumber}</span>
                    </div>
                    {emp.emergencyContactNumber && (
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Emg: {emp.emergencyContactNumber}
                      </div>
                    )}
                  </td>

                  {/* Dates */}
                  <td>
                    <div className="text-xs text-slate-700">
                      <span className="text-slate-400 text-[10px] uppercase">Reported: </span>
                      {emp.dateReportedToMinistry || 'N/A'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span className="text-slate-400 text-[10px] uppercase">Retirement: </span>
                      {emp.dateOfRetirement || 'N/A'}
                    </div>
                  </td>

                  {/* Transfer Preferences */}
                  <td>
                    {emp.willingnessForInternalTransfer === 'Yes' ? (
                      <div>
                        <span className="badge badge-transferred text-[10px]">Willing (Yes)</span>
                        {emp.preferredDivisions && emp.preferredDivisions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                            {emp.preferredDivisions.map((p) => (
                              <span
                                key={p}
                                className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="badge badge-retired text-[10px]">Not Requested</span>
                    )}
                  </td>

                  {/* Status & Transfer Assignment (Admin Editable) */}
                  <td>
                    {emp.status === 'Active' && (
                      <div>
                        <span className="badge badge-active">Active</span>
                        <div className="mt-1.5">
                          <button
                            onClick={() => onOpenTransfer(emp)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition"
                            title="Admin Only: Record Employee Transfer (ස්ථාන මාරු කිරීම)"
                          >
                            <Icon name="arrowRight" className="w-3 h-3 text-blue-600" />
                            <span>+ ස්ථාන මාරුව</span>
                          </button>
                        </div>
                      </div>
                    )}
                    {emp.status === 'Transferred' && (
                      <div>
                        <span className="badge badge-transferred">Transferred</span>
                        <div className="mt-1 text-[11px] text-slate-700 space-y-0.5 bg-blue-50/80 p-1.5 rounded-md border border-blue-200/70 max-w-[210px]">
                          {emp.dateOfTransfer && (
                            <div className="font-mono text-slate-900 flex items-center gap-1">
                              <span className="text-[10px] text-slate-500 font-sans">මාරු දිනය:</span>
                              <strong>{emp.dateOfTransfer}</strong>
                            </div>
                          )}
                          {emp.transferredLocation && (
                            <div className="truncate text-slate-800" title={emp.transferredLocation}>
                              <span className="text-[10px] text-slate-500">ස්ථානය:</span> {emp.transferredLocation}
                            </div>
                          )}
                          <button
                            onClick={() => onOpenTransfer(emp)}
                            className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold underline block pt-0.5"
                          >
                            මාරුව සංශෝධනය (Edit Transfer)
                          </button>
                        </div>
                      </div>
                    )}
                    {emp.status === 'Retired' && <span className="badge badge-retired">Retired</span>}
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onOpenTransfer(emp)}
                        className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
                        title="Admin Exclusive: Record or Update Transfer (ස්ථාන මාරු කිරීම)"
                      >
                        <Icon name="arrowRight" className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDossier(emp)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
                        title="View & Print Official Service Summary Dossier"
                      >
                        <Icon name="printer" className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenEdit(emp)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
                        title="Full Record Edit"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDelete(emp)}
                        className="p-1.5 rounded hover:bg-rose-50 text-rose-500 transition"
                        title="Delete Record"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="text-xs text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {pageSize === 'All' ? totalRecords : Math.min((currentPage - 1) * pageSize + 1, totalRecords)}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {pageSize === 'All' ? totalRecords : Math.min(currentPage * pageSize, totalRecords)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{totalRecords}</span> employees
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="form-select py-1 px-2 text-xs w-auto"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value="All">All</option>
            </select>
          </div>

          {pageSize !== 'All' && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="btn btn-secondary btn-sm px-2.5 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs px-2 font-medium text-slate-700">
                {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-secondary btn-sm px-2.5 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 3. SUBMISSION CONFIRMATION MODAL & RECEIPT
// ==========================================================================
function SubmissionSuccessModal({ record, onClose, onOpenDossier, onGoToAdmin }) {
  if (!record) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 md:p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Icon name="checkCircle" className="w-8 h-8" />
          </div>
          <span className="badge badge-active text-[10px] mb-1">Registration Acknowledged</span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Record Successfully Lodged</h3>
          <p className="text-xs text-slate-500 mt-1">
            Ministry of Housing, Construction and Water Supply, Sri Lanka
          </p>
        </div>

        {/* Reference Number Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Official Registration Reference
          </div>
          <div className="text-2xl font-mono font-extrabold text-blue-900 tracking-wider my-1">
            {record.referenceNumber}
          </div>
          <div className="text-[11px] text-slate-400">
            Lodged: {new Date(record.submissionTimestamp || Date.now()).toLocaleString()}
          </div>
        </div>

        {/* Summary Info */}
        <div className="space-y-2 text-xs border-t border-b border-slate-100 py-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Employee Name:</span>
            <span className="font-semibold text-slate-800">{record.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">National Identity Card:</span>
            <span className="font-mono font-semibold text-slate-800">{record.nicNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Designation & Grade:</span>
            <span className="text-slate-800">{record.designationGrade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Internal Transfer:</span>
            <span className="font-semibold text-slate-800">
              {record.willingnessForInternalTransfer === 'Yes'
                ? `Willing (${record.preferredDivisions?.join(', ') || 'None'})`
                : 'Not Requested'}
            </span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onOpenDossier(record)}
            className="btn btn-primary w-full py-2.5"
          >
            <Icon name="printer" className="w-4 h-4" />
            <span>Print Official Acknowledgment Receipt</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="btn btn-secondary w-full text-xs"
            >
              Submit Another Record
            </button>
            <button
              onClick={onGoToAdmin}
              className="btn btn-secondary w-full text-xs"
            >
              Go to Admin Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 4. ADMIN INLINE EDIT / TRANSFER MODAL
// ==========================================================================
function AdminEditModal({ record, onClose, onSave, addToast }) {
  const [formData, setFormData] = useState({
    ...record,
    status: record.status || 'Active',
    dateOfTransfer: record.dateOfTransfer || '',
    transferredLocation: record.transferredLocation || '',
    preferredDivisions: record.preferredDivisions || []
  });

  const [saving, setSaving] = useState(false);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const updates = { status: newStatus };
    if (newStatus === 'Transferred' && !formData.dateOfTransfer) {
      updates.dateOfTransfer = new Date().toISOString().split('T')[0];
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.status === 'Transferred' && !formData.transferredLocation.trim()) {
      addToast('warning', 'Location Required', 'Please specify the transferred board or location when status is Transferred.');
      return;
    }

    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const toggleDivision = (div) => {
    const current = [...(formData.preferredDivisions || [])];
    if (current.includes(div)) {
      setFormData({ ...formData, preferredDivisions: current.filter((d) => d !== div) });
    } else {
      if (current.length >= 2) {
        addToast('warning', 'Maximum 2 Choices', 'A maximum of 2 preferred divisions is permitted.');
        return;
      }
      setFormData({ ...formData, preferredDivisions: [...current, div] });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="badge badge-active text-[10px] mb-1">Administrative Action</span>
            <h3 className="text-xl font-bold text-slate-900">Manage Employee Profile & Transfer</h3>
            <p className="text-xs text-slate-500">Ref: {record.referenceNumber} • NIC: {record.nicNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 pt-4">
          {/* Section: Status & Transfer Administration */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Employment Status & Transfer Assignment
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label" htmlFor="adminStatus">
                  Registry Status
                </label>
                <select
                  id="adminStatus"
                  className="form-select font-semibold"
                  value={formData.status}
                  onChange={handleStatusChange}
                >
                  <option value="Active">Active</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              {formData.status === 'Transferred' && (
                <>
                  <div>
                    <label className="form-label" htmlFor="dateOfTransfer">
                      Date of Transfer <span className="required">*</span>
                    </label>
                    <input
                      id="dateOfTransfer"
                      type="date"
                      className="form-input"
                      value={formData.dateOfTransfer}
                      onChange={(e) => setFormData({ ...formData, dateOfTransfer: e.target.value })}
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="form-label" htmlFor="transferredLocation">
                      Transferred Location / Department / Authority <span className="required">*</span>
                    </label>
                    <input
                      id="transferredLocation"
                      type="text"
                      list="locationsList"
                      placeholder="e.g. National Housing Development Authority (NHDA)"
                      className="form-input"
                      value={formData.transferredLocation}
                      onChange={(e) => setFormData({ ...formData, transferredLocation: e.target.value })}
                      required
                    />
                    <datalist id="locationsList">
                      {TRANSFER_LOCATION_PRESETS.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section: Field Corrections */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Personal & Service Details Correction
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Designation & Grade</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.designationGrade}
                  onChange={(e) => setFormData({ ...formData, designationGrade: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">NIC Number</label>
                <input
                  type="text"
                  className="form-input uppercase"
                  value={formData.nicNumber}
                  onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Emergency Contact Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.emergencyContactNumber}
                  onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Annual Salary Increment Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateOfSalaryIncrement}
                  onChange={(e) => setFormData({ ...formData, dateOfSalaryIncrement: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Date of Retirement</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateOfRetirement}
                  onChange={(e) => setFormData({ ...formData, dateOfRetirement: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Permanent Address</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Transfer Willingness toggle for Admin */}
          <div className="space-y-3 pt-2">
            <label className="form-label">Willingness for Internal Transfer</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="adminWillingness"
                  value="Yes"
                  checked={formData.willingnessForInternalTransfer === 'Yes'}
                  onChange={() => setFormData({ ...formData, willingnessForInternalTransfer: 'Yes' })}
                />
                <span>Yes, Willing</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="adminWillingness"
                  value="No"
                  checked={formData.willingnessForInternalTransfer === 'No'}
                  onChange={() => setFormData({ ...formData, willingnessForInternalTransfer: 'No', preferredDivisions: [] })}
                />
                <span>No</span>
              </label>
            </div>

            {formData.willingnessForInternalTransfer === 'Yes' && (
              <div className="pt-2">
                <span className="text-xs text-slate-500 block mb-1.5">
                  Preferred Divisions ({formData.preferredDivisions?.length || 0}/2):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DIVISION_OPTIONS.map((div) => {
                    const sel = (formData.preferredDivisions || []).includes(div);
                    return (
                      <button
                        key={div}
                        type="button"
                        onClick={() => toggleDivision(div)}
                        className={`text-xs px-2.5 py-1 rounded border transition ${sel
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          }`}
                      >
                        {div}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary px-6">
              {saving ? 'Saving Changes...' : 'Save Record Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 4B. DEDICATED ADMIN-ONLY STAFF TRANSFER MODAL (ස්ථාන මාරු නියෝගය)
// ==========================================================================
function AdminTransferModal({ record, onClose, onSave, addToast }) {
  if (!record) return null;

  const [dateOfTransfer, setDateOfTransfer] = useState(
    record.dateOfTransfer || new Date().toISOString().split('T')[0]
  );
  const [transferredLocation, setTransferredLocation] = useState(
    record.transferredLocation || ''
  );
  const [transferRefNo, setTransferRefNo] = useState(
    record.transferRefNo || ''
  );
  const [transferStatus, setTransferStatus] = useState(
    record.status === 'Transferred' ? 'Transferred' : 'Transferred'
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (transferStatus === 'Transferred') {
      if (!dateOfTransfer) {
        addToast('error', 'Date Required', 'ස්ථාන මාරු වූ දිනය (Date of Transfer) ඇතුළත් කිරීම අනිවාර්ය වේ.');
        return;
      }
      if (!transferredLocation.trim()) {
        addToast('error', 'Location Required', 'ස්ථාන මාරු වූ ස්ථානය / ආයතනය (Transferred Location) ඇතුළත් කිරීම අනිවාර්ය වේ.');
        return;
      }
    }

    setSaving(true);
    await onSave({
      ...record,
      status: transferStatus,
      dateOfTransfer: transferStatus === 'Transferred' ? dateOfTransfer : '',
      transferredLocation: transferStatus === 'Transferred' ? transferredLocation.trim() : '',
      transferRefNo: transferRefNo.trim()
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Icon name="shield" className="w-3.5 h-3.5 text-blue-700" />
              <span>Admin Only • ස්ථාන මාරු පාලක පුවරුව</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              සේවක ස්ථාන මාරුව සටහන් කිරීම (Staff Transfer)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ref: <span className="font-mono font-semibold text-slate-700">{record.referenceNumber}</span> • NIC: <span className="font-mono font-semibold text-slate-700">{record.nicNumber}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Target Employee Info Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">සේවකයාගේ නම (Full Name):</span>
            <span className="font-bold text-slate-900 text-sm">{record.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">වත්මන් තනතුර (Designation):</span>
            <span className="font-semibold text-slate-800">{record.designationGrade}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">අමාත්‍යාංශයට වාර්තා කළ දිනය:</span>
            <span className="text-slate-800">{record.dateReportedToMinistry || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">සේවකයා ඉල්ලා ඇති මාරුවීම්:</span>
            <span className="font-semibold text-blue-800">
              {record.willingnessForInternalTransfer === 'Yes'
                ? `කැමැත්ත පළකර ඇත (${(record.preferredDivisions || []).join(', ') || 'අංශයක් තෝරා නැත'})`
                : 'ඉල්ලීමක් කර නැත'}
            </span>
          </div>
        </div>

        {/* Admin Exclusive Transfer Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Action Choice: Transferred or Retain as Active */}
          <div>
            <label className="form-label">
              ස්ථාන මාරු තත්ත්වය (Transfer Status) <span className="required">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition text-xs font-semibold ${transferStatus === 'Transferred'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
              >
                <input
                  type="radio"
                  name="transferStatus"
                  value="Transferred"
                  checked={transferStatus === 'Transferred'}
                  onChange={() => setTransferStatus('Transferred')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>ස්ථාන මාරු කිරීම (Transferred)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition text-xs font-semibold ${transferStatus === 'Active'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
              >
                <input
                  type="radio"
                  name="transferStatus"
                  value="Active"
                  checked={transferStatus === 'Active'}
                  onChange={() => setTransferStatus('Active')}
                  className="w-4 h-4 text-emerald-600"
                />
                <span>අවලංගු කර Active තබාගන්න</span>
              </label>
            </div>
          </div>

          {transferStatus === 'Transferred' && (
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-4 animate-fade-in">
              {/* Field 1: Date of Transfer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0" htmlFor="adminDateOfTransfer">
                    ස්ථාන මාරු වූ දිනය (Date of Transfer) <span className="required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setDateOfTransfer(new Date().toISOString().split('T')[0])}
                    className="text-[11px] text-blue-700 hover:underline font-semibold"
                  >
                    අද දිනය යොදන්න (Today)
                  </button>
                </div>
                <input
                  id="adminDateOfTransfer"
                  type="date"
                  className="form-input"
                  value={dateOfTransfer}
                  onChange={(e) => setDateOfTransfer(e.target.value)}
                  required
                />
                <p className="field-hint">ස්ථාන මාරුව ක්‍රියාත්මක වන නිල දිනය (Effective Transfer Date).</p>
              </div>

              {/* Field 2: Transferred Location */}
              <div>
                <label className="form-label" htmlFor="adminTransferredLocation">
                  ස්ථාන මාරු වූ ස්ථානය / ආයතනය (Transferred Location / Board) <span className="required">*</span>
                </label>
                <input
                  id="adminTransferredLocation"
                  type="text"
                  list="adminTransferLocationsList"
                  placeholder="e.g. National Water Supply and Drainage Board (NWSDB) - Regional Office"
                  className="form-input"
                  value={transferredLocation}
                  onChange={(e) => setTransferredLocation(e.target.value)}
                  required
                />
                <datalist id="adminTransferLocationsList">
                  {TRANSFER_LOCATION_PRESETS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] text-slate-500">පොදු ස්ථාන:</span>
                  {["NHDA - Head Office", "NWSDB - Regional Office", "Department of Buildings", "State Engineering Corp (SEC)", "USDA"].map((quickLoc) => (
                    <button
                      key={quickLoc}
                      type="button"
                      onClick={() => setTransferredLocation(quickLoc)}
                      className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 transition"
                    >
                      {quickLoc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Transfer Ref / Circular Letter (Optional) */}
              <div>
                <label className="form-label" htmlFor="adminTransferRefNo">
                  ස්ථාන මාරු නියෝග ලිපි අංකය (Transfer Order / Ref No - Optional)
                </label>
                <input
                  id="adminTransferRefNo"
                  type="text"
                  placeholder="e.g. MOHC/ADMIN/TR/2026/104"
                  className="form-input text-xs"
                  value={transferRefNo}
                  onChange={(e) => setTransferRefNo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Admin Role Confirmation Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
            <Icon name="shield" className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Admin Only:</strong> මෙම විකල්පය අමාත්‍යාංශ පරිපාලන / HR අංශයට පමණක් සීමා වේ. සාමාන්‍ය සේවක Form එකේ මෙය සම්පූර්ණයෙන්ම සඟවා ඇත.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs"
              disabled={saving}
            >
              අවලංගු කරන්න (Cancel)
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary text-xs px-6"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon name="checkCircle" className="w-4 h-4" />
                  <span>ස්ථාන මාරුව සටහන් කරන්න (Save Transfer)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 5. OFFICIAL PRINT-FRIENDLY EMPLOYEE DOSSIER MODAL
// ==========================================================================
function EmployeeDossierModal({ record, onClose }) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl max-h-[92vh] overflow-y-auto p-6 md:p-10 print-dossier">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="badge badge-active text-[10px]">Official Record</span>
            <span className="text-xs text-slate-500">Government Intranet Record Sheet</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn btn-primary btn-sm print-include">
              <Icon name="printer" className="w-4 h-4" />
              <span>Print Official Sheet</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL DOSSIER CONTENT */}
        <div className="space-y-6 text-slate-900 bg-white">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="w-16 h-16 mx-auto mb-2">
              <img src="/ministry-logo.png" alt="Ministry Emblem" className="w-full h-full object-contain mx-auto" />
            </div>
            <div className="text-xs font-serif font-bold uppercase tracking-widest text-slate-600">
              Democratic Socialist Republic of Sri Lanka
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-black text-slate-950 uppercase tracking-tight mt-0.5">
              Ministry of Housing, Construction and Water Supply
            </h1>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mt-0.5">
              Official Staff Information & Service Registry Dossier
            </p>
          </div>

          {/* Reference Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-300 p-3 rounded-lg bg-slate-50 text-xs gap-2">
            <div>
              <span className="text-slate-500">Registration Ref:</span>{' '}
              <span className="font-mono font-bold text-slate-900 text-sm">{record.referenceNumber}</span>
            </div>
            <div>
              <span className="text-slate-500">Record Status:</span>{' '}
              <span className="font-bold text-slate-900 uppercase">{record.status}</span>
            </div>
            <div>
              <span className="text-slate-500">Registered On:</span>{' '}
              <span className="font-semibold text-slate-800">
                {record.submissionTimestamp ? new Date(record.submissionTimestamp).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Section: Personal Data Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3">
              1. Personal Information & Official Identification
            </h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name:</span>
                <span className="font-bold text-slate-900 text-sm">{record.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">National Identity Card (NIC):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{record.nicNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth:</span>
                <span className="font-medium text-slate-900">{record.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Primary Contact Number:</span>
                <span className="font-mono font-medium text-slate-900">{record.contactNumber}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Permanent Residential Address:</span>
                <span className="font-medium text-slate-900">{record.permanentAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Emergency Contact:</span>
                <span className="font-mono font-medium text-slate-900">{record.emergencyContactNumber}</span>
              </div>
            </div>
          </div>

          {/* Section: Service Chronology */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3">
              2. Civil Service Appointment & Ministry Placement
            </h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div className="col-span-2">
                <span className="text-slate-500 block">Designation and Grade:</span>
                <span className="font-bold text-slate-900 text-sm">{record.designationGrade}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Public Service Appointment Date:</span>
                <span className="font-medium text-slate-900">{record.dateOfAppointment}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date Reported to Ministry:</span>
                <span className="font-medium text-slate-900">{record.dateReportedToMinistry}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Statutory Retirement Date:</span>
                <span className="font-medium text-slate-900">{record.dateOfRetirement}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Annual Salary Increment Date:</span>
                <span className="font-medium text-slate-900">{record.dateOfSalaryIncrement}</span>
              </div>
            </div>
          </div>

          {/* Section: Transfer Preferences & Status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3">
              3. Internal Transfer Record & Reassignment
            </h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div>
                <span className="text-slate-500 block">Willing for Internal Transfer:</span>
                <span className="font-bold text-slate-900">{record.willingnessForInternalTransfer}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Preferred Divisions:</span>
                <span className="font-medium text-slate-900">
                  {record.preferredDivisions && record.preferredDivisions.length > 0
                    ? record.preferredDivisions.join(', ')
                    : 'None Specified'}
                </span>
              </div>
              {record.status === 'Transferred' && (
                <>
                  <div>
                    <span className="text-slate-500 block">Effective Transfer Date:</span>
                    <span className="font-medium text-slate-900">{record.dateOfTransfer || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transferred Location / Board:</span>
                    <span className="font-bold text-slate-900">{record.transferredLocation || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Official Verification Signatures */}
          <div className="pt-10 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="h-14 border-b border-dashed border-slate-400"></div>
              <p className="mt-2 font-semibold text-slate-800">Employee Signature</p>
              <p className="text-[10px] text-slate-400">Date: ........................</p>
            </div>

            <div>
              <div className="official-seal">
                Official<br />Ministry<br />Registry Seal
              </div>
            </div>

            <div>
              <div className="h-14 border-b border-dashed border-slate-400"></div>
              <p className="mt-2 font-semibold text-slate-800">Additional Secretary (Admin)</p>
              <p className="text-[10px] text-slate-400">For Director General / Secretary</p>
            </div>
          </div>

          {/* Bottom Barcode / Verification */}
          <div className="text-center pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>System Generated Record • Ministry of Housing, Construction & Water Supply</span>
            <div className="barcode-strip"></div>
            <span>Verification Hash: {record.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 6. DELETE CONFIRMATION MODAL
// ==========================================================================
function DeleteConfirmModal({ record, onClose, onConfirm }) {
  if (!record) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Icon name="trash" className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900">Delete Employee Record</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to permanently delete the registry record for{' '}
            <strong className="text-slate-800">{record.fullName}</strong> ({record.nicNumber})?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="btn btn-secondary w-full">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger w-full">
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}

// Render the application into #root using React 18 createRoot
const container = document.getElementById('root');
if (ReactDOM.createRoot) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  ReactDOM.render(<App />, container);
}
