import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Download, 
  Share2, 
  Plus, 
  Search, 
  History, 
  User, 
  AlertOctagon, 
  CheckCircle2, 
  X, 
  Eye, 
  Edit3,
  Trash2
} from 'lucide-react';

// ==========================================
// 1. డెమో యూజర్లు (3 రకాల రోల్స్)
// ==========================================
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCUMENT_OWNER' | 'VIEWER';
}

const SYSTEM_USERS: UserProfile[] = [
  { id: 'u1', name: 'Kondameedi Anupriya (Owner)', email: 'anupriya@company.com', role: 'DOCUMENT_OWNER' },
  { id: 'u2', name: 'Security Administrator', email: 'admin@company.com', role: 'ADMIN' },
  { id: 'u3', name: 'Junior Associate (Viewer)', email: 'viewer@company.com', role: 'VIEWER' }
];

// ==========================================
// 2. డాక్యుమెంట్ల డేటా మోడల్
// ==========================================
interface DocumentPermission {
  userId: string;
  userEmail: string;
  level: 'READ' | 'EDIT';
}

interface VaultDocument {
  id: string;
  title: string;
  category: 'HR' | 'Finance' | 'Contracts' | 'Technical';
  sizeKB: number;
  ownerId: string;
  ownerName: string;
  uploadDate: string;
  permissions: DocumentPermission[];
}

const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-101',
    title: 'Executive_Salary_Scale_2026.pdf',
    category: 'Finance',
    sizeKB: 1420,
    ownerId: 'u1',
    ownerName: 'Kondameedi Anupriya',
    uploadDate: '2026-10-20',
    permissions: [
      { userId: 'u3', userEmail: 'viewer@company.com', level: 'READ' }
    ]
  },
  {
    id: 'doc-102',
    title: 'Master_Service_Agreement_Snovasys.docx',
    category: 'Contracts',
    sizeKB: 2840,
    ownerId: 'u1',
    ownerName: 'Kondameedi Anupriya',
    uploadDate: '2026-10-22',
    permissions: [] // కేవలం యజమానికి మాత్రమే యాక్సెస్ ఉంది
  }
];

// ==========================================
// 3. ఆడిట్ లాగ్ మోడల్ (చరిత్ర రికార్డులు)
// ==========================================
interface AuditRecord {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  docTitle: string;
  status: 'SUCCESS' | 'DENIED';
  notes: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(SYSTEM_USERS[0]);
  const [documents, setDocuments] = useState<VaultDocument[]>(INITIAL_DOCUMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentTab, setCurrentTab] = useState<'documents' | 'audit'>('documents');
  
  // నోటిఫికేషన్ మెసేజ్
  const [alertBanner, setAlertBanner] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // ఆడిట్ లాగ్స్ లిస్ట్
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    {
      id: 'log-1',
      timestamp: '2026-10-24 10:15:02',
      actorEmail: 'anupriya@company.com',
      action: 'DOCUMENT_UPLOAD',
      docTitle: 'Executive_Salary_Scale_2026.pdf',
      status: 'SUCCESS',
      notes: 'Initial confidential upload'
    }
  ]);

  // మోడల్స్ (Pop-up బాక్సులు)
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'HR' | 'Finance' | 'Contracts' | 'Technical'>('HR');

  const [shareDoc, setShareDoc] = useState<VaultDocument | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLevel, setShareLevel] = useState<'READ' | 'EDIT'>('READ');

  // ఆడిట్ లాగ్ రికార్డ్ చేసే ఫంక్షన్
  const logEvent = (action: string, docTitle: string, status: 'SUCCESS' | 'DENIED', notes: string) => {
    const newLog: AuditRecord = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actorEmail: currentUser.email,
      action,
      docTitle,
      status,
      notes
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // నోటిఫికేషన్ చూపించే ఫంక్షన్
  const showAlert = (message: string, type: 'success' | 'danger') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 4500);
  };

  // పర్మిషన్ చెక్ చేసే లాజిక్ (Zero-Trust Security)
  const getUserAccess = (doc: VaultDocument): 'OWNER' | 'EDIT' | 'READ' | 'NONE' => {
    if (doc.ownerId === currentUser.id) return 'OWNER';
    const found = doc.permissions.find(p => p.userEmail.toLowerCase() === currentUser.email.toLowerCase());
    if (found) return found.level;
    return 'NONE';
  };

  // ఫైల్ డౌన్‌లోడ్ చేయడం
  const handleDownload = (doc: VaultDocument) => {
    const access = getUserAccess(doc);
    
    // అనుమతి లేకపోతే రిజెక్ట్ చేయాలి
    if (access === 'NONE') {
      logEvent('UNAUTHORIZED_DOWNLOAD_ATTEMPT', doc.title, 'DENIED', `User ${currentUser.email} tried to access without permission`);
      showAlert(`భద్రతా హెచ్చరిక (Security Alert): "${doc.title}" ఫైల్ చూసే అనుమతి మీకు లేదు! ఆడిట్ లాగ్‌లో రికార్డ్ చేయబడింది.`, 'danger');
      return;
    }

    // అనుమతి ఉంటే డౌన్‌లోడ్
    logEvent('DOCUMENT_DOWNLOAD', doc.title, 'SUCCESS', `Downloaded by ${currentUser.email} with ${access} access`);
    showAlert(`"${doc.title}" విజయవంతంగా డౌన్‌లోడ్ చేయబడింది.`, 'success');
  };

  // కొత్త ఫైల్ అప్‌లోడ్ చేయడం
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (currentUser.role === 'VIEWER') {
      showAlert('వ్యూయర్స్ ఫైల్స్ అప్‌లోడ్ చేయలేరు.', 'danger');
      return;
    }

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.endsWith('.pdf') ? newTitle : `${newTitle}.pdf`,
      category: newCategory,
      sizeKB: Math.floor(Math.random() * 3000) + 500,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      uploadDate: new Date().toISOString().split('T')[0],
      permissions: []
    };

    setDocuments([newDoc, ...documents]);
    logEvent('DOCUMENT_UPLOAD', newDoc.title, 'SUCCESS', `Uploaded under ${newCategory} category`);
    showAlert(`"${newDoc.title}" సురక్షితంగా వాల్ట్‌లో భద్రపరచబడింది.`, 'success');
    
    setNewTitle('');
    setIsUploadOpen(false);
  };

  // పర్మిషన్ ఇవ్వడం (Grant Access)
  const handleGrantPermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareDoc || !shareEmail) return;

    if (shareEmail.toLowerCase() === shareDoc.ownerName.toLowerCase()) {
      showAlert('యజమానికి ఇప్పటికే పూర్తి అనుమతులు ఉన్నాయి.', 'danger');
      return;
    }

    setDocuments(prev => prev.map(doc => {
      if (doc.id !== shareDoc.id) return doc;
      
      const filtered = doc.permissions.filter(p => p.userEmail !== shareEmail);
      return {
        ...doc,
        permissions: [...filtered, { userId: `temp-${Date.now()}`, userEmail: shareEmail, level: shareLevel }]
      };
    }));

    logEvent('PERMISSION_GRANTED', shareDoc.title, 'SUCCESS', `Granted ${shareLevel} permission to ${shareEmail}`);
    showAlert(`"${shareEmail}" కు ${shareLevel} అనుమతి ఇవ్వబడింది.`, 'success');
    setShareEmail('');
    setShareDoc(null);
  };

  // పర్మిషన్ రద్దు చేయడం (Revoke Access)
  const handleRevoke = (docId: string, emailToRevoke: string, docTitle: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        permissions: doc.permissions.filter(p => p.userEmail !== emailToRevoke)
      };
    }));

    logEvent('PERMISSION_REVOKED', docTitle, 'SUCCESS', `Revoked access from ${emailToRevoke}`);
    showAlert(`"${emailToRevoke}" నుండి అనుమతి విజయవంతంగా రద్దు చేయబడింది.`, 'success');
    setShareDoc(null);
  };

  // ఫిల్టర్ చేయబడిన ఫైల్స్
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. టాప్ హెడర్ మరియు యూజర్ రోల్ స్విచ్చర్ */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                TrustVault
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Zero-Trust
                </span>
              </span>
              <p className="text-xs text-slate-400">Secure Document Sharing with Audit Trail</p>
            </div>
          </div>

          {/* రోల్ స్విచ్చర్ (టెస్ట్ చేయడానికి చాలా ఉపయోగపడుతుంది) */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
            <User className="w-4 h-4 text-sky-400 ml-1" />
            <span className="text-xs text-slate-400 font-medium">Active Role:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = SYSTEM_USERS.find(u => u.id === e.target.value);
                if (found) {
                  setCurrentUser(found);
                  logEvent('LOGIN_SWITCH', 'System', 'SUCCESS', `Switched active role to ${found.role}`);
                  showAlert(`రోల్ మార్చబడింది: ${found.name} (${found.role})`, 'success');
                }
              }}
              className="bg-slate-800 border border-slate-700 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {SYSTEM_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name} — [{u.role}]</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* 2. అలర్ట్ బ్యానర్ (నోటిఫికేషన్లు) */}
      {alertBanner && (
        <div className={`p-4 border-b flex items-center justify-center gap-3 text-sm font-medium transition-all ${
          alertBanner.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          {alertBanner.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{alertBanner.message}</span>
        </div>
      )}

      {/* 3. మెయిన్ కంటెంట్ ఏరియా */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 flex-1 space-y-6">
        
        {/* ట్యాబ్‌లు: డాక్యుమెంట్లు లేదా ఆడిట్ లాగ్ */}
        <div className="flex border-b border-slate-800 justify-between items-center pb-2">
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentTab('documents')}
              className={`pb-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                currentTab === 'documents' 
                  ? 'border-sky-400 text-sky-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Documents ({filteredDocuments.length})
            </button>
            <button 
              onClick={() => setCurrentTab('audit')}
              className={`pb-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                currentTab === 'audit' 
                  ? 'border-sky-400 text-sky-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Security Audit Trail ({auditLogs.length})
            </button>
          </div>

          {currentTab === 'documents' && currentUser.role !== 'VIEWER' && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload Document
            </button>
          )}
        </div>

        {/* =============== VIEW 1: డాక్యుమెంట్ల లిస్ట్ =============== */}
        {currentTab === 'documents' && (
          <div className="space-y-6">
            {/* సెర్చ్ & ఫిల్టర్ బార్ */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="text"
                  placeholder="Search confidential files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'Finance', 'Contracts', 'HR', 'Technical'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40' 
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* డాక్యుమెంట్ కార్డులు */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map(doc => {
                const userAccess = getUserAccess(doc);
                const hasPermission = userAccess !== 'NONE';

                return (
                  <div 
                    key={doc.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-sky-400">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          userAccess === 'OWNER' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : userAccess === 'EDIT' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : userAccess === 'READ'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          Access: {userAccess}
                        </span>
                      </div>

                      <h3 className="mt-4 font-bold text-white text-base tracking-tight truncate" title={doc.title}>
                        {doc.title}
                      </h3>
                      
                      <div className="mt-2 text-xs text-slate-400 space-y-1">
                        <p>Category: <span className="text-slate-300 font-medium">{doc.category}</span></p>
                        <p>Owner: <span className="text-slate-300 font-medium">{doc.ownerName}</span></p>
                        <p>Size: <span className="text-slate-300 font-medium">{doc.sizeKB} KB</span></p>
                      </div>

                      {/* పర్మిషన్ వివరాలు */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Granted Users ({doc.permissions.length}):
                        </span>
                        {doc.permissions.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">No external users granted</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {doc.permissions.map(p => (
                              <span key={p.userEmail} className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                                {p.userEmail} ({p.level})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* యాక్షన్ బటన్లు */}
                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition cursor-pointer ${
                          hasPermission 
                            ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {hasPermission ? 'Download' : 'No Access (Test)'}
                      </button>

                      {(userAccess === 'OWNER' || currentUser.role === 'ADMIN') && (
                        <button
                          onClick={() => setShareDoc(doc)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition cursor-pointer"
                          title="Manage Permissions"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============== VIEW 2: ఆడిట్ లాగ్ టేబుల్ =============== */}
        {currentTab === 'audit' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Append-Only Immutable Audit Trail
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Every view, download, permission change, and unauthorized breach is recorded.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor (User)</th>
                    <th className="p-3.5">Security Event</th>
                    <th className="p-3.5">Target Document</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3.5 font-mono text-slate-400">{log.timestamp}</td>
                      <td className="p-3.5 font-medium text-white">{log.actorEmail}</td>
                      <td className="p-3.5">
                        <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] text-sky-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 truncate max-w-xs">{log.docTitle}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === 'SUCCESS' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* =============== MODAL 1: ఫైల్ అప్‌లోడ్ పాప్-అప్ =============== */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Upload to TrustVault</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Employee_Appraisal_Report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Confidentiality Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="HR">HR (Salaries, Appraisals)</option>
                  <option value="Finance">Finance (Audits, Balance Sheets)</option>
                  <option value="Contracts">Contracts (Client NDA, Legal)</option>
                  <option value="Technical">Technical (Source code, Keys)</option>
                </select>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-400/20 rounded-xl text-xs text-sky-300">
                🔒 Uploaded files are private by default. Only the uploader holds immediate access.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-400 rounded-xl text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition"
                >
                  Confirm & Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============== MODAL 2: పర్మిషన్ షేరింగ్ పాప్-అప్ =============== */}
      {shareDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Grant Access Permissions</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{shareDoc.title}</p>
              </div>
              <button onClick={() => setShareDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ఇప్పటికే పర్మిషన్ ఉన్నవాళ్ళ లిస్ట్ & Revoke బటన్ */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Existing User Permissions:</span>
              {shareDoc.permissions.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  No other user currently holds access.
                </p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {shareDoc.permissions.map(p => (
                    <div key={p.userEmail} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-xs font-semibold text-white block">{p.userEmail}</span>
                        <span className="text-[10px] text-sky-400 font-mono">Level: {p.level}</span>
                      </div>
                      <button
                        onClick={() => handleRevoke(shareDoc.id, p.userEmail, shareDoc.title)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30 text-xs flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* కొత్త యూజర్‌కు పర్మిషన్ ఇచ్చే ఫారం */}
            <form onSubmit={handleGrantPermission} className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">Grant New Access:</span>
              <div className="flex gap-2">
                <input 
                  type="email"
                  required
                  placeholder="user@company.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <select
                  value={shareLevel}
                  onChange={(e: any) => setShareLevel(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="READ">READ</option>
                  <option value="EDIT">EDIT</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShareDoc(null)}
                  className="px-4 py-2 bg-slate-900 text-slate-400 rounded-xl text-xs font-semibold hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ఫుటర్ */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        TrustVault — Confidential Document Management System • Snovasys Hiring Challenge 2026
      </footer>
    </div>
  );
}