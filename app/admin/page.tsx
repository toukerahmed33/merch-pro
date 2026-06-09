"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  Users, 
  Building, 
  CreditCard, 
  Sliders, 
  FileText, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Check, 
  X, 
  Menu,
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  History,
  Activity,
  UserCheck
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserDoc, setCurrentUserDoc] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "companies" | "plans" | "billing" | "logs">("users");
  const [adminMobileSidebarOpen, setAdminMobileSidebarOpen] = useState(false);

  // Core database collections state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [billingList, setBillingList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({
    maintenanceMode: false,
    autoMatchRFQ: true,
    allowSimulation: true,
    supportEmail: "support@merchprocure.com"
  });

  const [loadingData, setLoadingData] = useState(false);

  // Modal / Editing states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("User");
  const [newCompany, setNewCompany] = useState("");
  const [newPlan, setNewPlan] = useState("Free");
  const [newDisplayName, setNewDisplayName] = useState("");

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [compName, setCompName] = useState("");
  const [compTier, setCompTier] = useState("Silver");
  const [compLoc, setCompLoc] = useState("");
  const [compStatus, setCompStatus] = useState("Active");

  // Plan customization state (stored in /settings/plans)
  const [planGates, setPlanGates] = useState<any>({
    Free: { maxFiles: 5, maxTeams: 3, enableAnalytics: false },
    Starter: { maxFiles: 20, maxTeams: 10, enableAnalytics: false },
    Professional: { maxFiles: 100, maxTeams: 50, enableAnalytics: true },
    Enterprise: { maxFiles: 9999, maxTeams: 9999, enableAnalytics: true }
  });

  // User search/filtering query
  const [searchQuery, setSearchQuery] = useState("");

  // Check auth privilege
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setCurrentUserDoc(data);
          } else {
            // Write default user
            const defaultDoc = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "Authorized User",
              plan: "Free",
              role: firebaseUser.email === "anikahmedcos@gmail.com" ? "Admin" : "User",
              company: "Independent Sourcing Agent",
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, defaultDoc);
            setCurrentUserDoc(defaultDoc);
          }
        } catch (err) {
          console.error("Failed to load root auth details from database:", err);
        }
      } else {
        setCurrentUser(null);
        setCurrentUserDoc(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch lists only if the current user is verified as an Admin
  const isAuthorizedAdmin = 
    currentUser?.email === "anikahmedcos@gmail.com" || 
    currentUserDoc?.role === "Admin";

  useEffect(() => {
    if (isAuthorizedAdmin) {
      loadAllAdminData();
    }
  }, [isAuthorizedAdmin]);

  const loadAllAdminData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Users List
      const usersSnap = await getDocs(collection(db, "users"));
      let items: any[] = [];
      usersSnap.forEach((d) => {
        items.push({ uid: d.id, ...d.data() });
      });

      // Seeding Initial Mock Users if empty
      if (items.length <= 1) {
        const seedUsers = [
          { uid: "seed-user-1", email: "imran@buyer.com", displayName: "Imran Khan", role: "Manager", plan: "Starter", company: "Standard Group", createdAt: new Date().toISOString() },
          { uid: "seed-user-2", email: "tariqul@buyer.com", displayName: "Tariqul Islam", role: "Merchandiser", plan: "Professional", company: "Simtex Mills Ltd.", createdAt: new Date().toISOString() },
          { uid: "seed-user-3", email: "supplier@mondol.com", displayName: "Aminul Islam", role: "Vendor", plan: "Free", company: "Mondol Fabrics Ltd.", createdAt: new Date().toISOString() }
        ];
        
        for (const u of seedUsers) {
          await setDoc(doc(db, "users", u.uid), u);
          items.push(u);
        }
      }
      setUsersList(items);

      // 2. Fetch Companies List
      const companiesSnap = await getDocs(collection(db, "companies"));
      let cItems: any[] = [];
      companiesSnap.forEach((d) => {
        cItems.push(d.data());
      });

      if (cItems.length === 0) {
        const seedComps = [
          { id: "comp-1", name: "Mondol Fabrics Ltd.", tier: "Platinum", location: "Gazipur", status: "Active", createdAt: new Date().toISOString() },
          { id: "comp-2", name: "Standard Group", tier: "Gold", location: "Dhaka HQ", status: "Active", createdAt: new Date().toISOString() },
          { id: "comp-3", name: "Simtex Spinning Mills Ltd.", tier: "Silver", location: "Chittagong Port", status: "Active", createdAt: new Date().toISOString() },
          { id: "comp-4", name: "Square Garments Fashions", tier: "Platinum", location: "Mymensingh", status: "Pending", createdAt: new Date().toISOString() }
        ];

        for (const c of seedComps) {
          await setDoc(doc(db, "companies", c.id), c);
          cItems.push(c);
        }
      }
      setCompaniesList(cItems);

      // 3. Fetch Billing Invoices List
      const billingSnap = await getDocs(collection(db, "billing"));
      let bItems: any[] = [];
      billingSnap.forEach((d) => {
        bItems.push(d.data());
      });

      if (bItems.length === 0) {
        const seedBills = [
          { id: "INV-99432", userId: "seed-user-1", userEmail: "imran@buyer.com", plan: "Starter", amount: "$49/mo", status: "Paid", date: "06/05/2026", invoiceNo: "INV-99432" },
          { id: "INV-18392", userId: "seed-user-2", userEmail: "tariqul@buyer.com", plan: "Professional", amount: "$149/mo", status: "Paid", date: "06/01/2026", invoiceNo: "INV-18392" },
          { id: "INV-66723", userId: currentUser?.uid || "admin-uid", userEmail: currentUser?.email || "anikahmedcos@gmail.com", plan: "Enterprise", amount: "$499/mo", status: "Paid", date: "06/08/2026", invoiceNo: "INV-66723" }
        ];

        for (const b of seedBills) {
          await setDoc(doc(db, "billing", b.id), b);
          bItems.push(b);
        }
      }
      setBillingList(bItems);

      // 4. Fetch Audit Logs
      const logsSnap = await getDocs(collection(db, "auditlogs"));
      let lItems: any[] = [];
      logsSnap.forEach((d) => {
        lItems.push(d.data());
      });

      if (lItems.length === 0) {
        const seedLogs = [
          { id: "log-1", userEmail: "anikahmedcos@gmail.com", action: "System Boot", details: "MerchProcure sandbox instance fully synchronized with relational schemas.", timestamp: new Date().toISOString() },
          { id: "log-2", userEmail: "imran@buyer.com", action: "Role Sync", details: "User assigned to Buyer Merchandiser (L2 Authority).", timestamp: new Date().toISOString() },
          { id: "log-3", userEmail: "supplier@mondol.com", action: "Compliance Upload", details: "Mondol Fabrics uploaded standard trade compliance PDF.", timestamp: new Date().toISOString() }
        ];

        for (const l of seedLogs) {
          await setDoc(doc(db, "auditlogs", l.id), l);
          lItems.push(l);
        }
      }
      // Sort logs by date descending
      lItems.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime());
      setAuditLogsList(lItems);

      // 5. Fetch Custom system settings if available
      const settingsSnap = await getDoc(doc(db, "settings", "system"));
      if (settingsSnap.exists()) {
        setSystemSettings(settingsSnap.data());
      } else {
        await setDoc(doc(db, "settings", "system"), systemSettings);
      }

      // 6. Fetch Plan Gates
      const plansRef = doc(db, "settings", "plans");
      const planGatesSnap = await getDoc(plansRef);
      if (planGatesSnap.exists()) {
        setPlanGates(planGatesSnap.data());
      } else {
        await setDoc(plansRef, planGates);
      }

    } catch (err) {
      console.error("Error reading Cloud Firestore document schemas:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Log action inside our security logs collection
  const triggerAuditLog = async (action: string, details: string) => {
    try {
      const logId = "LOG-" + Date.now();
      const newLog = {
        id: logId,
        userEmail: currentUser?.email || "System Admin",
        action,
        details,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, "auditlogs", logId), newLog);
      
      // Update local state feed
      setAuditLogsList((prev: any[]) => [newLog, ...prev]);
    } catch (e) {
      console.warn("Could not write system audit log:", e);
    }
  };

  // User Management actions
  const openEditUser = (userItem: any) => {
    setSelectedUser(userItem);
    setNewDisplayName(userItem.displayName || "");
    setNewRole(userItem.role || "User");
    setNewCompany(userItem.company || "Independent Sourcing Agent");
    setNewPlan(userItem.plan || "Free");
    setUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      const userRef = doc(db, "users", selectedUser.uid);
      const updateData = {
        displayName: newDisplayName,
        role: newRole,
        company: newCompany,
        plan: newPlan
      };
      await updateDoc(userRef, updateData);

      // Trigger audit
      await triggerAuditLog(
        "User Profile Modified",
        `Admin edited uid ${selectedUser.uid} profile. Retained fields: Role: ${newRole}, Plan: ${newPlan}, Company: ${newCompany}.`
      );

      // Update in-place local list
      setUsersList((prev) => 
        prev.map((u) => u.uid === selectedUser.uid ? { ...u, ...updateData } : u)
      );

      setUserModalOpen(false);
      setSelectedUser(null);
    } catch (e) {
      console.error("Profiles save error:", e);
      alert("Verification failed. Please review your Security rules.");
    }
  };

  // Company management actions
  const openCompanyEdit = (compItem?: any) => {
    if (compItem) {
      setSelectedCompany(compItem);
      setCompName(compItem.name);
      setCompTier(compItem.tier);
      setCompLoc(compItem.location);
      setCompStatus(compItem.status);
    } else {
      setSelectedCompany(null);
      setCompName("");
      setCompTier("Silver");
      setCompLoc("");
      setCompStatus("Active");
    }
    setCompanyModalOpen(true);
  };

  const handleSaveCompany = async () => {
    if (!compName.trim()) {
      alert("Company Name is required!");
      return;
    }

    try {
      const cid = selectedCompany ? selectedCompany.id : "comp-" + Date.now();
      const compData = {
        id: cid,
        name: compName,
        tier: compTier,
        location: compLoc,
        status: compStatus,
        createdAt: selectedCompany ? selectedCompany.createdAt : new Date().toISOString()
      };

      await setDoc(doc(db, "companies", cid), compData);

      await triggerAuditLog(
        selectedCompany ? "Company Edited" : "Company Registered",
        `Sourcing mill ${compName} has been configured in Gazipur directory.`
      );

       // Update local state
       if (selectedCompany) {
         setCompaniesList((prev: any[]) => prev.map(c => c.id === cid ? compData : c));
       } else {
         setCompaniesList((prev: any[]) => [...prev, compData]);
       }

      setCompanyModalOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      console.error("Company store failed:", err);
    }
  };

  // Settings updating
  const handleToggleGateFeature = async (planKey: string, gateKey: string, val: any) => {
    try {
      const updatedGates = {
        ...planGates,
        [planKey]: {
          ...planGates[planKey],
          [gateKey]: val
        }
      };

      await setDoc(doc(db, "settings", "plans"), updatedGates);
      setPlanGates(updatedGates);
      await triggerAuditLog(
        "Gating Settings Modified",
        `Tuned plan ${planKey} metric boundary limits: ${gateKey} set to ${val}.`
      );
    } catch (err) {
      console.error("Gating save failed:", err);
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "system"), systemSettings);
      await triggerAuditLog(
        "System Variables Flushed",
        `Admin committed site configurations. Auto Sourcing Bid Match: ${systemSettings.autoMatchRFQ}.`
      );
      alert("System configurations updated synchronously in Cloud storage!");
    } catch (e) {
      console.error("Failed to update system variables in database:", e);
    }
  };

  // Auth screen redirections
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Verifying authority credentials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAuthorizedAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans text-slate-800 p-4">
        <div className="w-full max-w-sm bg-white border-2 border-red-200 rounded-xl p-6 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Access Retained Gated Route</h1>
            <p className="text-[10px] text-slate-500 leading-normal max-w-[280px] mx-auto">
              Administrator authority required. Active credentials logged under <strong>{currentUser?.email || "anonymous-guest-node"}</strong> are unauthorized to decrypt admin variables.
            </p>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="w-full py-2 bg-slate-900 border border-slate-850 text-white hover:bg-slate-800 rounded font-bold text-xs uppercase tracking-wider transition"
          >
            Return to Standard Sourcing Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter users by search query
  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Mobile Admin Sidebar Overlay Backdrop */}
      {adminMobileSidebarOpen && (
        <div 
          onClick={() => setAdminMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-200"
        />
      )}

      {/* 1. Left Gated Navigation Rail */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 text-white flex flex-col shrink-0 select-none transition-transform duration-300 transform
        md:relative md:translate-x-0 ${adminMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:flex
      `}>
        
        {/* Branch Title header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center font-black text-white text-base">A</div>
            <div>
              <h2 className="text-xs font-black tracking-tight text-white">Admin Portal</h2>
              <p className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Control Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => router.push("/")}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Leave Admin Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setAdminMobileSidebarOpen(false)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white md:hidden transition"
              title="Close Menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action navigation pills list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: "users", label: "User Accounts", icon: Users },
            { id: "companies", label: "Mill Directory", icon: Building },
            { id: "plans", label: "Subscription Gating", icon: Sliders },
            { id: "billing", label: "Billing Registry", icon: CreditCard },
            { id: "logs", label: "Live System Logs", icon: History }
          ].map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setAdminMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left font-semibold transition-all text-xs ${
                activeTab === item.id 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 opacity-75 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Status diagnostic indicator footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-[9px] text-slate-500 font-mono space-y-1">
          <div className="flex justify-between items-center">
            <span>SaaS Version:</span>
            <span className="text-slate-400">0.1.0-Admin</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Database Node:</span>
            <span className="text-green-500 font-bold uppercase tracking-wider">● Online</span>
          </div>
          <p className="text-[8px] text-slate-600 mt-2 truncate max-w-[200px]" title={currentUserDoc?.email}>
            Payer: {currentUserDoc?.email}
          </p>
        </div>
      </aside>

      {/* 2. Main Content Board Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        
        {/* Top Header Panel controls */}
        <header className="h-14 bg-white border-b border-slate-200/85 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Hamburger helper toggler for mobile */}
            <button
              onClick={() => setAdminMobileSidebarOpen(!adminMobileSidebarOpen)}
              className="p-1.5 text-slate-650 hover:bg-slate-100 rounded md:hidden focus:outline-none focus:ring-1 focus:ring-slate-300"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] hidden sm:block">Scope: Global Apparel SaaS Node</span>
            {loadingData && (
              <span className="animate-pulse bg-amber-50 text-amber-700 border border-amber-250 px-2 py-0.5 rounded text-[9px] font-bold">
                Synchronizing Firestore...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[9px] text-slate-405 hidden sm:block font-bold uppercase">Authorized via Root Sourcing Credentials</span>
            <div className="w-7 h-7 bg-red-600 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-inner">
              {currentUserDoc?.displayName?.slice(0, 2).toUpperCase() || "AD"}
            </div>
          </div>
        </header>

        {/* Scrollable Tabs Wrapper Workspace */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">

          {/* TAB 1: USER ACCOUNTS DECK */}
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Apparel User Accounts Directory</h1>
                  <p className="text-[10px] text-slate-500">Configure roles, subscription plans, and mills tenancy across shared manufacturing organizations.</p>
                </div>

                <div className="relative max-w-48">
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Accounts listing Table Grid */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[8px]">
                      <th className="p-3">User Legal Name / Email</th>
                      <th className="p-3">Workspace Role</th>
                      <th className="p-3">Assigned Mill</th>
                      <th className="p-3">Subscription</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-600">
                    {filteredUsers.map((u: any) => (
                      <tr key={u.uid} className="hover:bg-slate-50/50 transition">
                        <td className="p-3">
                          <p className="font-extrabold text-slate-800 text-xs">{u.displayName || "Unverified User"}</p>
                          <p className="font-mono text-[9px] text-slate-400 mt-0.5">{u.email}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            u.role === "Admin" 
                              ? "bg-red-150 text-red-700 border border-red-200" 
                              : u.role === "Manager"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : u.role === "Merchandiser"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}>
                            {u.role || "User"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 truncate max-w-44">{u.company || "Independent Agent"}</td>
                        <td className="p-3">
                          <span className="font-black text-indigo-600 uppercase tracking-wider text-[9px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">
                            {u.plan || "Free"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => openEditUser(u)}
                            className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 2: MILL TENANCY DIRECTORY */}
          {activeTab === "companies" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Mill Tenancy Directory</h1>
                  <p className="text-[10px] text-slate-500">Add or edit garments mills, knit spinning yarn factories, and trims vendors.</p>
                </div>
                <button 
                  onClick={() => openCompanyEdit()}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" /> Check-in New Factory
                </button>
              </div>

              {/* Companies listing cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companiesList.map((c) => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-3xs flex flex-col justify-between hover:border-slate-350 transition">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">{c.name}</h4>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          c.status === "Active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-750"
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono py-1 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold font-sans">Territory Location</span>
                          <strong className="text-slate-700">{c.location || "Gazipur EPZ"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold font-sans">Production Tier</span>
                          <strong className="text-slate-700">{c.tier} Sourcing</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-mono">ID: #{c.id}</span>
                      <button 
                        onClick={() => openCompanyEdit(c)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Modify Factory Spec
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SUBSCRIPTION GATING SETTINGS */}
          {activeTab === "plans" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 text-left">
              <div>
                <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Workspace Gating Controls</h1>
                <p className="text-[10px] text-slate-500">Customize the resource limits for Free, Starter, Professional, and Enterprise subscription tiers in real-time.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.keys(planGates).map((planKey) => (
                  <div key={planKey} className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
                    <div className="pb-3 border-b border-indigo-50 flex justify-between items-center">
                      <span className="font-extrabold text-indigo-600 text-xs uppercase tracking-wider">{planKey} Subscription Gating</span>
                      <span className="font-mono text-[9px] text-slate-400">Elastic Properties</span>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Max Allowed Workspace File Capacity</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min={1} 
                            value={planGates[planKey].maxFiles}
                            onChange={(e) => handleToggleGateFeature(planKey, "maxFiles", parseInt(e.target.value) || 1)}
                            className="w-20 bg-slate-50 border border-slate-200 rounded text-center py-1 text-slate-800 font-bold font-mono focus:bg-white"
                          />
                          <span className="text-slate-400 text-[10px]">Files</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Max Collaborative Users / Project Team members</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min={1} 
                            value={planGates[planKey].maxTeams}
                            onChange={(e) => handleToggleGateFeature(planKey, "maxTeams", parseInt(e.target.value) || 1)}
                            className="w-20 bg-slate-50 border border-slate-200 rounded text-center py-1 text-slate-800 font-bold font-mono focus:bg-white"
                          />
                          <span className="text-slate-400 text-[10px]">Members</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Enable Sourcing Bid Match Analytics dashboard</span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleToggleGateFeature(planKey, "enableAnalytics", !planGates[planKey].enableAnalytics)}
                            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded select-none cursor-pointer border ${
                              planGates[planKey].enableAnalytics 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                                : "bg-red-50 text-red-600 border-red-150"
                            }`}
                          >
                            {planGates[planKey].enableAnalytics ? "Enabled" : "Disabled"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: BILLING INVOICES & CAPACITY CONSTRAINTS */}
          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              <div>
                <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Escrow &amp; Invoice Billing Ledger</h1>
                <p className="text-[10px] text-slate-500">Track paid user subscription invoices and real-time document storage consumption counts.</p>
              </div>

              {/* Billing list table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-extrabold text-[9px] uppercase text-slate-500 tracking-wider">Historical invoices queue</span>
                  <span className="text-[8px] font-mono text-slate-400">Live feed</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-extrabold text-[8px] bg-slate-50/25">
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Subscriber Email</th>
                      <th className="p-3">Purchased Tier</th>
                      <th className="p-3">Payer Amount</th>
                      <th className="p-3">Settlement Date</th>
                      <th className="p-3 text-right">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 font-mono text-[10px] text-slate-600">
                    {billingList.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/40 transition">
                        <td className="p-3 font-bold text-slate-800">{b.invoiceNo || b.id}</td>
                        <td className="p-3">{b.userEmail}</td>
                        <td className="p-3 uppercase font-black font-sans text-[9px] text-indigo-600">{b.plan}</td>
                        <td className="p-3 text-slate-900 font-bold">{b.amount}</td>
                        <td className="p-3 text-slate-500 font-sans">{b.date}</td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 text-[9px] font-sans font-extrabold">
                            ✓ {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Real-time Storage Limits Telemetry */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-slate-500" /> Active Tenant Storage Gating Telemetry
                </h3>
                
                <div className="space-y-4 text-xs select-none">
                  {usersList.map((u) => {
                    const activeLimit = planGates[u.plan]?.maxFiles || 5;
                    // Count of seeded or direct file mockups
                    const simulatedFilesUploaded = u.plan === "Starter" ? 4 : u.plan === "Professional" ? 12 : u.plan === "Enterprise" ? 95 : 1;
                    const percentUsed = Math.min(100, Math.round((simulatedFilesUploaded / activeLimit) * 100));

                    return (
                      <div key={u.uid} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-b-0">
                        <div className="flex justify-between items-center text-[11px]">
                          <div>
                            <strong className="text-slate-800 font-bold">{u.displayName}</strong>
                            <span className="text-[9px] text-slate-400 font-mono ml-2">({u.email})</span>
                          </div>
                          <span className="font-mono text-slate-500">
                            {simulatedFilesUploaded} / {activeLimit} files ({percentUsed}%)
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-150">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              percentUsed >= 90 
                                ? "bg-red-650" 
                                : percentUsed >= 70 
                                ? "bg-amber-500" 
                                : "bg-blue-600"
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SYSTEM SETTINGS & RUNTIME LOGS */}
          {activeTab === "logs" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              
              {/* System wide configurations block */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <Sliders className="w-4 h-4 text-red-600" /> Site Gated Configurations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Support Email Address</label>
                    <input 
                      type="email" 
                      value={systemSettings.supportEmail}
                      onChange={(e) => setSystemSettings((prev: any) => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:bg-white text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2.5 pt-4 md:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Maintenance mode simulation lockout</span>
                      <button 
                        onClick={() => setSystemSettings((prev: any) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                        className={`px-3 py-1.5 rounded font-black text-[9px] uppercase tracking-wider select-none ${
                          systemSettings.maintenanceMode 
                            ? "bg-red-100 text-red-700 border border-red-200" 
                            : "bg-slate-100 border border-slate-200 text-slate-600"
                        }`}
                      >
                        {systemSettings.maintenanceMode ? "Active" : "Off"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Automatic sourcing matching algorithm active</span>
                      <button 
                        onClick={() => setSystemSettings((prev: any) => ({ ...prev, autoMatchRFQ: !prev.autoMatchRFQ }))}
                        className={`px-3 py-1.5 rounded font-black text-[9px] uppercase tracking-wider select-none ${
                          systemSettings.autoMatchRFQ 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                            : "bg-slate-100 border border-slate-200 text-slate-600"
                        }`}
                      >
                        {systemSettings.autoMatchRFQ ? "Active" : "Off"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100/60 text-right">
                  <button 
                    onClick={handleSaveSystemSettings}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Apply System Settings Updates
                  </button>
                </div>
              </div>

              {/* PERSISTENT RUNTIME LOGS TIMELINE */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-150 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-emerald-600" /> Historic System Audit Trails
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">Total events: {auditLogsList.length}</span>
                </div>

                <div className="divide-y divide-slate-150 max-h-96 overflow-y-auto">
                  {auditLogsList.map((log) => (
                    <div key={log.id} className="p-4 flex flex-col md:flex-row gap-2 md:gap-6 hover:bg-slate-50/40 transition text-xs">
                      
                      {/* Left Block: Date */}
                      <div className="w-36 shrink-0 text-slate-400 font-mono text-[9px]">
                        {new Date(log.timestamp).toLocaleString("en-US")}
                      </div>

                      {/* Middle Block: Actor & Action */}
                      <div className="w-48 shrink-0">
                        <span className="font-black text-indigo-600 uppercase tracking-widest text-[8px] bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5 inline-block">
                          {log.action}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{log.userEmail}</p>
                      </div>

                      {/* Right Block: Details */}
                      <div className="flex-1 text-slate-700 leading-normal font-sans text-[11px]">
                        {log.details}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* ================= EDIT USER MODAL OVERLAY ================= */}
      <AnimatePresence>
        {userModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-left"
            >
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <span className="font-extrabold uppercase tracking-wider text-[10px]">Alter Tenant Profile</span>
                <button onClick={() => setUserModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-xs">Close</button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Full Legal Name</label>
                  <input 
                    type="text" 
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address (Read Only)</label>
                  <input 
                    type="text" 
                    disabled 
                    value={selectedUser.email}
                    className="w-full bg-slate-100 text-slate-400 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Sourcing Role</label>
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 font-bold"
                  >
                    <option value="Admin">Admin (Full Control Access)</option>
                    <option value="Manager">Manager (L2 Authority)</option>
                    <option value="Merchandiser">Merchandiser (L1 Scout)</option>
                    <option value="Vendor">Vendor (Textile Representative)</option>
                    <option value="User">Standard Enterprise User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Sourcing Company</label>
                  <select 
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    <option value="Independent Agent">Independent Sourcing Broker</option>
                    {companiesList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subscription Plan Level</label>
                  <select 
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 font-bold"
                  >
                    <option value="Free">Free Plan Gating</option>
                    <option value="Starter">Starter Plan</option>
                    <option value="Professional">Professional Plan</option>
                    <option value="Enterprise">Enterprise License</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveUser}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs uppercase tracking-wider shadow-sm select-none transition"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= EDIT COMPANY MODAL OVERLAY ================= */}
      <AnimatePresence>
        {companyModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-left"
            >
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <span className="font-extrabold uppercase tracking-wider text-[10px]">
                  {selectedCompany ? "Edit Mill Spec" : "Register Sourcing Mill"}
                </span>
                <button onClick={() => setCompanyModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-xs font-mono">Close</button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Legal Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mondol Spinning Mills"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:bg-white focus:outline-none focus:ring-1"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance Quality Tier</label>
                  <select 
                    value={compTier}
                    onChange={(e) => setCompTier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:bg-white font-bold focus:outline-none"
                  >
                    <option value="Platinum">Platinum Sourcing (High AQL compliance)</option>
                    <option value="Gold">Gold Partner</option>
                    <option value="Silver">Silver standard</option>
                    <option value="Bronze">Bronze (Uncertified / Pending)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">HQ / EPZ Location Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Gazipur Central"
                    value={compLoc}
                    onChange={(e) => setCompLoc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:bg-white focus:outline-none focus:ring-1"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trade Status</label>
                  <select 
                    value={compStatus}
                    onChange={(e) => setCompStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Active">Active verified trade channel</option>
                    <option value="Pending">Pending Audit verification</option>
                    <option value="Suspended">Suspended (QC Defect threshold exceeded)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveCompany}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs uppercase tracking-wider shadow-sm select-none transition"
                  >
                    {selectedCompany ? "Apply Changes" : "Register Company"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
