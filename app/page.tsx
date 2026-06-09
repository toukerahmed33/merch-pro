'use client';

import { useState, useEffect } from "react";
import { useProcure, RFQ, Quotation, Approval, WorkOrder, Inspection, ProcurementPlan, Vendor, ToR, ConsultantEvaluation, MonthlyAllocation } from "@/hooks/use-procure";
import { auth, db, storage } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";
// Client-side mockup system initialized locally
import { 
  GitPullRequest, 
  Users, 
  Scale, 
  ClipboardCheck, 
  Layers, 
  Calendar, 
  LayoutDashboard, 
  Bell, 
  Plus, 
  Check, 
  X, 
  Search, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ThumbsUp,
  Send,
  Upload,
  Mail,
  RefreshCw,
  Folder,
  File,
  FolderPlus,
  FilePlus,
  Notebook,
  UserPlus,
  Trash2,
  Award,
  BarChart3,
  PieChart,
  Sliders,
  Eye,
  Menu,
  Sun,
  Moon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "motion/react";

export default function Page() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Dark mode toggle state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });
  // Mobile-first Sidebar toggle state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Filter harmless, automatic Firebase SDK stream cancellations and closed popups
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const msg = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message;
        try { return JSON.stringify(arg); } catch { return String(arg); }
      }).join(" ");

      if (
        msg.includes("Disconnecting idle stream") || 
        msg.includes("Timed out waiting for new targets") ||
        msg.includes("cancelled-popup-request") ||
        msg.includes("popup-closed-by-user") ||
        msg.includes("auth/cancelled-popup-request") ||
        msg.includes("auth/popup-closed-by-user")
      ) {
        console.warn("[Filtered Benign Log]", ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const niceName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Authorized User";
        setUser({
          displayName: niceName,
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL || "",
          role: "User",
          plan: "Free"
        });
        setVerificationEmail("");
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUser({
              displayName: data.displayName || niceName,
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              photoURL: firebaseUser.photoURL || "",
              role: data.role || "User",
              plan: data.plan || "Free"
            });
          }
        } catch (e) {
          console.warn("Could not load Firestore profile metadata under credentials:", e);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize darkMode state with html class
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("darkMode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("darkMode", "false");
      }
    }
  }, [darkMode]);

  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleSignInAs = (roleName: string, roleEmail: string) => {
    const mockUser = {
      displayName: roleName,
      email: roleEmail,
      photoURL: ""
    };
    setUser(mockUser);
    setShowRoleSelector(false);
  };

  const handleSignOutLocal = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const {
    vendors,
    rfqs,
    quotations,
    approvals,
    noas,
    contracts,
    workOrders,
    inspections,
    payments,
    procurementPlans,
    tors,
    evaluations,
    emailLogs,
    addVendor,
    uploadVendorDocument,
    addRfq,
    sendRfqToVendors,
    addQuotation,
    handleApprovalAction,
    addWorkOrder,
    triggerQCInspection,
    createProcurementPlan,
    updateRfqStatus,
    resetAllData,
    submitAwardToCommittee,
    handleSequentialApproval,
    acceptNoaAndPrepareContract,
    eSignContractBuyer,
    eSignContractVendor,
    addPayment,
    handlePaymentApproval,
    updatePlanForecast,
    createToR,
    publishToR,
    addConsultantEvaluation,
    updateConsultantEvaluationStatus
  } = useProcure(user);

  // ====================
  // 3 FULLY FUNCTIONAL SECTIONS STATE & HANDLERS
  // ====================
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const [foldersLoading, setFoldersLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [teamMembersLoading, setTeamMembersLoading] = useState(true);

  // Folder filtering
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>("all");

  // Auth synchronization listeners
  useEffect(() => {
    if (!user?.uid) {
      setFolders([]);
      setFiles([]);
      setNotes([]);
      setTeamMembers([]);
      setFoldersLoading(false);
      setFilesLoading(false);
      setNotesLoading(false);
      setTeamMembersLoading(false);
      return;
    }

    const uid = user.uid;

    // 1. Folders listener
    const foldersRef = collection(db, "users", uid, "folders");
    const qFolders = query(foldersRef, orderBy("createdAt", "desc"));
    const unsubFolders = onSnapshot(qFolders, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setFolders(items);
      setFoldersLoading(false);
    }, (error) => {
      setFoldersLoading(false);
      console.error("Firestore folders list failed:", error);
    });

    // 2. Files listener
    const filesRef = collection(db, "users", uid, "files");
    const qFiles = query(filesRef, orderBy("createdAt", "desc"));
    const unsubFiles = onSnapshot(qFiles, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setFiles(items);
      setFilesLoading(false);
    }, (error) => {
      setFilesLoading(false);
      console.error("Firestore files list failed:", error);
    });

    // 3. Notes listener
    const notesRef = collection(db, "users", uid, "notes");
    const qNotes = query(notesRef, orderBy("createdAt", "desc"));
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setNotes(items);
      setNotesLoading(false);
    }, (error) => {
      setNotesLoading(false);
      console.error("Firestore notes list failed:", error);
    });

    // 4. Team Members listener
    const teamRef = collection(db, "users", uid, "teamMembers");
    const qTeam = query(teamRef, orderBy("createdAt", "desc"));
    const unsubTeam = onSnapshot(qTeam, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setTeamMembers(items);
      setTeamMembersLoading(false);
    }, (error) => {
      setTeamMembersLoading(false);
      console.error("Firestore team members list failed:", error);
    });

    return () => {
      unsubFolders();
      unsubFiles();
      unsubNotes();
      unsubTeam();
    };
  }, [user?.uid]);

  // Modals state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Dynamic subscription limits check based on the active user's plan attributes
  const isUserLoggedIn = !!user?.uid;
  const userPlan = user?.plan || "Free";
  const maxAllowedFiles = userPlan === "Enterprise" ? 9999 : userPlan === "Professional" ? 100 : userPlan === "Starter" ? 20 : 5;
  const hasReachedLimit = isUserLoggedIn && files.length >= maxAllowedFiles;

  // Form states
  const [newFolderName, setNewFolderName] = useState("");
  const [folderSubmitting, setFolderSubmitting] = useState(false);
  const [folderError, setFolderError] = useState("");

  const [newFileName, setNewFileName] = useState("");
  const [newFileFolder, setNewFileFolder] = useState("");
  const [newFileSize, setNewFileSize] = useState("");
  const [fileSubmitting, setFileSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState("");

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setFolderError("Folder name is required");
      return;
    }
    setFolderError("");
    setFolderSubmitting(true);
    try {
      const uid = user.uid;
      const folderId = "fold-" + Date.now().toString();
      await setDoc(doc(db, "users", uid, "folders", folderId), {
        name: newFolderName.trim(),
        createdAt: new Date().toISOString()
      });
      setNewFolderName("");
      setIsFolderModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setFolderError(err.message || "Failed to create folder");
    } finally {
      setFolderSubmitting(false);
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasReachedLimit) {
      setFileError("You’ve reached the free plan limit.");
      return;
    }
    if (!newFileName.trim()) {
      setFileError("File name is required");
      return;
    }
    if (!newFileSize.trim()) {
      setFileError("File size is required (e.g. 4.2 MB)");
      return;
    }
    setFileError("");
    setFileSubmitting(true);
    try {
      const uid = user.uid;
      const fileId = "file-" + Date.now().toString();
      const fileData: any = {
        name: newFileName.trim(),
        size: newFileSize.trim(),
        createdAt: new Date().toISOString()
      };
      if (newFileFolder) {
        fileData.folderId = newFileFolder;
      }
      await setDoc(doc(db, "users", uid, "files", fileId), fileData);
      setNewFileName("");
      setNewFileFolder("");
      setNewFileSize("");
      setIsFileModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setFileError(err.message || "Failed to add file");
    } finally {
      setFileSubmitting(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) {
      setNoteError("Note title is required");
      return;
    }
    setNoteError("");
    setNoteSubmitting(true);
    try {
      const uid = user.uid;
      const noteId = "note-" + Date.now().toString();
      await setDoc(doc(db, "users", uid, "notes", noteId), {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        createdAt: new Date().toISOString()
      });
      setNewNoteTitle("");
      setNewNoteContent("");
      setIsNoteModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setNoteError(err.message || "Failed to create note");
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      setMemberError("Member name is required");
      return;
    }
    setMemberError("");
    setMemberSubmitting(true);
    try {
      const uid = user.uid;
      const memberId = "mem-" + Date.now().toString();
      const memberData: any = {
        name: newMemberName.trim(),
        createdAt: new Date().toISOString()
      };
      if (newMemberRole.trim()) {
        memberData.role = newMemberRole.trim();
      }
      await setDoc(doc(db, "users", uid, "teamMembers", memberId), memberData);
      setNewMemberName("");
      setNewMemberRole("");
      setIsMemberModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setMemberError(err.message || "Failed to add team member");
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleDeleteItem = async (sub: string, itemId: string) => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, sub, itemId));
    } catch (err: any) {
      console.error(`Error deleting item from ${sub}:`, err);
    }
  };

  // Dual Portal View Toggle System:
  // "Merchandiser" (Garments Buyer / Admin) OR "Vendor" (Tendering supplier)
  const [portal, setPortal] = useState<"Merchandiser" | "Vendor">("Merchandiser");
  const [selectedVendorPortalId, setSelectedVendorPortalId] = useState<string>("VND-MONDOL");

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  // Language Toggle State: "EN" or "BN"
  const [lang, setLang] = useState<"EN" | "BN">("EN");
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  // Selected RFQ for Detail/Matrix View
  const [selectedRfqId, setSelectedRfqId] = useState<string>("RFQ-501");

  // Dynamic weights for Quotation comparison auto-ranking
  const [weightPrice, setWeightPrice] = useState<number>(40);
  const [weightDelivery, setWeightDelivery] = useState<number>(30);
  const [weightCompliance, setWeightCompliance] = useState<number>(30);

  // Email simulation banner state
  const [lastEmailBroadcast, setLastEmailBroadcast] = useState<{ count: number; materials: string; timestamp: string } | null>(null);

  // Simple Notifications states and bell badge
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Mondol Fabrics: Submitted a bid for Tender RFQ-501", unread: true },
    { id: 2, text: "Standard Trims: BIN Certificate requires renewal!", unread: true },
    { id: 3, text: "Approval Request: Sourcing RFQ-503 launched", unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Forms Toggle State
  const [showAddRfq, setShowAddRfq] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showAddWO, setShowAddWO] = useState(false);
  const [showAddQC, setShowAddQC] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedWoForQc, setSelectedWoForQc] = useState<string>("");

  // Document Upload State
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [selectedDocVendorId, setSelectedDocVendorId] = useState<string>("");
  const [docTypeToUpload, setDocTypeToUpload] = useState<"Trade License" | "BIN" | "TIN" | "Solvency Certificate">("Trade License");
  const [docFileName, setDocFileName] = useState("");
  const [docExpiryDate, setDocExpiryDate] = useState("");

  // Send RFQ Invite State
  const [showSendRfqModal, setShowSendRfqModal] = useState(false);
  const [sendRfqTargetId, setSendRfqTargetId] = useState<string>("");
  const [selectedVendorsToSend, setSelectedVendorsToSend] = useState<string[]>([]);
  const [emailSimulationChannel, setEmailSimulationChannel] = useState(true);

  // New RFQ input states
  const [newRfqType, setNewRfqType] = useState<"Goods" | "Service" | "Works">("Goods");
  const [newRfqMaterial, setNewRfqMaterial] = useState("");
  const [newRfqQty, setNewRfqQty] = useState("");
  const [newRfqTargetDate, setNewRfqTargetDate] = useState("");
  const [newRfqUrgency, setNewRfqUrgency] = useState<"High" | "Medium" | "Low">("Medium");
  
  // Sourcing Specs states
  const [rfqGsm, setRfqGsm] = useState("");
  const [rfqFabricComposition, setRfqFabricComposition] = useState("");
  const [rfqYarnCount, setRfqYarnCount] = useState("");
  const [rfqServiceScope, setRfqServiceScope] = useState("");
  const [rfqConstructionSpecs, setRfqConstructionSpecs] = useState("");
  const [rfqTerms, setRfqTerms] = useState("");

  // New Vendor Form states
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorTier, setNewVendorTier] = useState<any>("Gold Tier");
  const [newVendorScope, setNewVendorScope] = useState("");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorEmail, setNewVendorEmail] = useState("");
  const [newVendorPhone, setNewVendorPhone] = useState("");

  // New Plan input states
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanQty, setNewPlanQty] = useState("");
  const [newPlanBudget, setNewPlanBudget] = useState("");
  const [newPlanDate, setNewPlanDate] = useState("");

  // Plan Monthly Forecasting states
  const [selectedPlanForForecast, setSelectedPlanForForecast] = useState<ProcurementPlan | null>(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [tempForecasts, setTempForecasts] = useState<MonthlyAllocation[]>([]);
  const [forecastViewMode, setForecastViewMode] = useState<"table" | "forecast">("table");

  // New ToR states
  const [newTorTitle, setNewTorTitle] = useState("");
  const [newTorDesc, setNewTorDesc] = useState("");
  const [newTorScope, setNewTorScope] = useState("");
  const [newTorExpert, setNewTorExpert] = useState("ESG & Sustainability Expert");
  const [newTorTechWeight, setNewTorTechWeight] = useState(70);
  const [newTorFinWeight, setNewTorFinWeight] = useState(30);
  const [newTorBudget, setNewTorBudget] = useState("");
  const [newTorDeadline, setNewTorDeadline] = useState("");
  const [showAddTorModal, setShowAddTorModal] = useState(false);
  const [selectedTorIdForEvaluation, setSelectedTorIdForEvaluation] = useState<string | null>("TOR-001");

  // New Evaluation states
  const [newEvalConsultant, setNewEvalConsultant] = useState("");
  const [newEvalExpScore, setNewEvalExpScore] = useState(85);
  const [newEvalMethodScore, setNewEvalMethodScore] = useState(85);
  const [newEvalTeamScore, setNewEvalTeamScore] = useState(80);
  const [newEvalProposal, setNewEvalProposal] = useState(20000);
  const [showAddEvalModal, setShowAddEvalModal] = useState(false);

  // Alert simulation triggers
  const [reminderFilter, setReminderFilter] = useState<"all" | "high" | "info">("all");
  const [systemAlerts, setSystemAlerts] = useState<Array<{
    id: string;
    title: string;
    titleBN: string;
    desc: string;
    descBN: string;
    type: "high" | "warning" | "info";
    date: string;
  }>>([
    {
      id: "al-1",
      title: "RFQ EXPIRATION ALERT",
      titleBN: "আরএফকিউ মেয়াদোত্তীর্ণ সতর্কতা",
      desc: "RFQ for 100% Cotton Fleece ending in 4 hours. No minimum pricing lock matched yet.",
      descBN: "১০০% কটন ফ্লিস-এর আরএফকিউ ৪ ঘণ্টার মধ্যে শেষ হচ্ছে। কোনো সর্বনিম্ন মূল্য লক মেলেনি।",
      type: "high",
      date: "Today"
    },
    {
      id: "al-2",
      title: "COMPLIANCE SUSPENSION RISK",
      titleBN: "কমপ্লায়েন্স সাসপেনশন ঝুঁকি",
      desc: "Vendor 'Mondol Fabrics' Trade License expiring in 12 days. Sourcing block scheduled.",
      descBN: "ভেন্ডর 'মন্ডল ফ্যাব্রিক্স'-এর ট্রেড লাইসেন্স ১২ দিনের মধ্যে শেষ হচ্ছে। পারচেজ স্থগিত করার পরিকল্পনা রয়েছে।",
      type: "warning",
      date: "12 days left"
    },
    {
      id: "al-3",
      title: "PENDING CFO RELEASE RELEASE",
      titleBN: "সিএফও রিলিজ অপেক্ষারত",
      desc: "Work order WO-9911 contains active payment release for $25,000 pending signoff.",
      descBN: "ওয়ার্ক অর্ডার WO-9911-এর অধীনে ২৫,০০০ ডলারের পেমেন্ট রিলিজ সিএফও স্বাক্ষরের অপেক্ষায় সচল রয়েছে।",
      type: "info",
      date: "2 days ago"
    }
  ]);

  // New Work-order input states
  const [newWoRfqId, setNewWoRfqId] = useState("");
  const [newWoVendor, setNewWoVendor] = useState("");
  const [newWoMaterial, setNewWoMaterial] = useState("");
  const [newWoQty, setNewWoQty] = useState("");
  const [newWoStart, setNewWoStart] = useState("");
  const [newWoEnd, setNewWoEnd] = useState("");

  // New QC input states
  const [newQcDefectRate, setNewQcDefectRate] = useState<number>(1.5);
  const [newQcFindings, setNewQcFindings] = useState("");
  const [newQcPass, setNewQcPass] = useState(true);

  // Multi-Level Approvals and Purchasing Contracts Workflow states:
  const [approvalsSubTab, setApprovalsSubTab] = useState<"queue" | "noas" | "contracts">("queue");
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [actingRole, setActingRole] = useState<string>("Procurement Manager");
  const [actingName, setActingName] = useState<string>("Imran Khan");
  const profile = actingRole === "Procurement Manager" ? "Merchandiser" : actingRole === "Director of Sourcing" ? "Manager" : "Finance";
  const [selectedNoaId, setSelectedNoaId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [esignSimName, setEsignSimName] = useState("");

  // New Quotation/Bid input states (Vendor Portal View)
  const [showAddBid, setShowAddBid] = useState(false);
  const [bidRfqId, setBidRfqId] = useState("RFQ-501");
  const [bidVendorName, setBidVendorName] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [bidLeadTime, setBidLeadTime] = useState("");
  const [bidScore, setBidScore] = useState("9.0");
  const [bidTerms, setBidTerms] = useState("30% Advance, 70% LC");
  const [bidNotes, setBidNotes] = useState("");

  // Extended mobile-optimized inspection form states
  const [newQcGsm, setNewQcGsm] = useState<number>(180);
  const [newQcColor, setNewQcColor] = useState<string>("Navy Blue");
  const [newQcSampleSize, setNewQcSampleSize] = useState<number>(80);
  const [newQcDefectsCount, setNewQcDefectsCount] = useState<number>(1);
  const [newQcAqlStandard, setNewQcAqlStandard] = useState<"1.5" | "2.5" | "4.0">("1.5");
  const [newQcPhotoUrl, setNewQcPhotoUrl] = useState<string>("");
  const [newQcStatus, setNewQcStatus] = useState<"Passed" | "Hold" | "Failed">("Passed");
  const [activeQcPhotoSrc, setActiveQcPhotoSrc] = useState<string | null>(null);
  const [qcPhotoUploading, setQcPhotoUploading] = useState(false);
  const [qcPhotoUploadProgress, setQcPhotoUploadProgress] = useState<number | null>(null);
  const [qcPhotoUploadError, setQcPhotoUploadError] = useState<string | null>(null);

  // Payment approval / invoice matching states
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string>("");
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string>("");
  const [paymentInvoiceAmount, setPaymentInvoiceAmount] = useState<string>("");
  const [paymentPoAmount, setPaymentPoAmount] = useState<string>("");
  const [paymentDueDate, setPaymentDueDate] = useState<string>("");
  const [paymentVendorName, setPaymentVendorName] = useState<string>("");
  const [paymentComment, setPaymentComment] = useState<string>("");

  // Helper calculation for industry standard 1.5, 2.5, 4.0 AQL metrics
  const getAqlLimits = (sampleSize: number, aql: "1.5" | "2.5" | "4.0") => {
    if (aql === "1.5") {
      if (sampleSize <= 20) return { ac: 0, re: 1 };
      if (sampleSize <= 32) return { ac: 1, re: 2 };
      if (sampleSize <= 50) return { ac: 1, re: 2 };
      if (sampleSize <= 80) return { ac: 2, re: 3 };
      if (sampleSize <= 125) return { ac: 3, re: 4 };
      if (sampleSize <= 200) return { ac: 5, re: 6 };
      return { ac: 7, re: 8 };
    }
    if (aql === "2.5") {
      if (sampleSize <= 20) return { ac: 1, re: 2 };
      if (sampleSize <= 32) return { ac: 1, re: 2 };
      if (sampleSize <= 50) return { ac: 2, re: 3 };
      if (sampleSize <= 80) return { ac: 3, re: 4 };
      if (sampleSize <= 125) return { ac: 5, re: 6 };
      if (sampleSize <= 200) return { ac: 7, re: 8 };
      return { ac: 10, re: 11 };
    }
    // AQL 4.0
    if (sampleSize <= 20) return { ac: 2, re: 3 };
    if (sampleSize <= 32) return { ac: 2, re: 3 };
    if (sampleSize <= 50) return { ac: 3, re: 4 };
    if (sampleSize <= 80) return { ac: 5, re: 6 };
    if (sampleSize <= 125) return { ac: 7, re: 8 };
    if (sampleSize <= 200) return { ac: 10, re: 11 };
    return { ac: 14, re: 15 };
  };

  // Simple Notification Handlers
  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Translations dictionary matching high density style
  const t = {
    EN: {
      dashboard: "Dashboard",
      rfqs: "RFQ Management",
      vendors: "Vendor Hub",
      comparison: "Comparison Matrix",
      approvals: "Multi-level Approvals",
      orders: "Work Orders",
      inspection: "QC & Inspection",
      payments: "Payments & Invoices",
      plan: "Procurement Plan",
      tenant: "Tenant: Standard Group Ltd.",
      tenantId: "ID: FAB-8829-2024",
      viewMode: "Merchandiser View",
      activeRfqs: "Active RFQs",
      endingToday: "3 Ending Today",
      pendingAssign: "Approval Pending",
      requiresAttention: "Requires Attention",
      totalSourcing: "Total Procurement (M-T-D)",
      growthRate: "↑ 12.5% vs Last Month",
      qcRate: "QC Pass Rate",
      qcVendors: "Across 12 Vendors",
      priorityRfq: "Priority RFQ Monitoring",
      viewAll: "View All",
      materialName: "Material / Good",
      quantity: "Quantity",
      targetDate: "Target Date",
      bids: "Bids",
      status: "Status",
      quotationScore: "Quotation Comparison Scoring",
      analyzeSelect: "Analyze Selection",
      healthStatus: "System Health: Operational | Next.js 15 Environment",
      isolation: "Row Level Security: Enabled | Standard-Org-101 Isolation Active",
      myFiles: "My Files",
      myNotes: "My Notes",
      teamMembers: "Team Members",
      torEvaluation: "ToR & Consultant",
      reportingCenter: "Reporting Centre",
      monthlyForecast: "Monthly Forecasting",
      budget: "Budget",
      draft: "Draft",
      published: "Published",
      evaluated: "Evaluated",
      awarded: "Awarded",
      technicalWeight: "Technical Weight",
      financialWeight: "Financial Weight",
      expertType: "Expert Type",
      evaluationScore: "Evaluation Score",
      markingSheet: "Marking Sheet",
      exportReport: "Export Report",
      remindersAlerts: "Auto-Reminders & Alerts"
    },
    BN: {
      dashboard: "ড্যাশবোর্ড",
      rfqs: "আরএফকিউ ব্যবস্থাপনা",
      vendors: "ভেন্ডর হাব",
      comparison: "তুলনামূলক মেট্রিক্স",
      approvals: "মাল্টি-লেভেল অনুমোদন",
      orders: "ওয়ার্ক অর্ডার",
      inspection: "কিউসি ও পরিদর্শন",
      payments: "পেমেন্ট এবং ইনভয়েস",
      plan: "ক্রয় পরিকল্পনা",
      tenant: "টিন্যান্ট: স্ট্যান্ডার্ড গ্রুপ লিমিটেড",
      tenantId: "আইডি: FAB-8829-2024",
      viewMode: "মার্চেন্ডাইজার ভিউ",
      activeRfqs: "সক্রিয় আরএফকিউ",
      endingToday: "৩টি আজ শেষ হচ্ছে",
      pendingAssign: "অনুমোদন অপেক্ষারত",
      requiresAttention: "বিশেষ মনোযোগ প্রয়োজন",
      totalSourcing: "মোট ক্রয় (মাসিক)",
      growthRate: "↑ ১২.৫% বিগত মাসের তুলনায়",
      qcRate: "কিউসি পাসের হার",
      qcVendors: "১২ ভেন্ডরের মধ্যে",
      priorityRfq: "অগ্রাধিকার আরএফকিউ পর্যবেক্ষণ",
      viewAll: "সব আরএফকিউ",
      materialName: "কাঁচামাল / মালামাল",
      quantity: "পরিমাণ",
      targetDate: "লক্ষ্য তারিখ",
      bids: "বিড সংখ্যা",
      status: "অবস্থা",
      quotationScore: "কোটেশন তুলনা ও স্কোরিং",
      analyzeSelect: "নির্বাচন বিশ্লেষণ করুন",
      healthStatus: "সিস্টেমের অবস্থা: সচল | নেক্সট.জেএস ১৫ পরিবেশ",
      isolation: "রো লেভেল সিকিউরিটি: সক্রিয় | স্ট্যান্ডার্ড-অর্গ-১০১ আইসোলেশন সচল",
      myFiles: "আমার ফাইল",
      myNotes: "আমার নোটস",
      teamMembers: "টিম মেম্বারস",
      torEvaluation: "টি ও আর এবং কনসালটেন্ট",
      reportingCenter: "রিপোর্টিং সেন্টার",
      monthlyForecast: "মাসিক পূর্বাভাস",
      budget: "বাজেট",
      draft: "খসড়া",
      published: "প্রকাশিত",
      evaluated: "মূল্যায়িত",
      awarded: "প্রদান করা হয়েছে",
      technicalWeight: "কারিগরি ওজন",
      financialWeight: "আর্থিক ওজন",
      expertType: "দক্ষতার ধরন",
      evaluationScore: "মূল্যায়ন স্কোর",
      markingSheet: "মার্কিং শীট",
      exportReport: "রিপোর্ট এক্সপোর্ট",
      remindersAlerts: "স্বয়ংক্রিয় অনুস্মারক এবং অ্যালার্ট"
    }
  };

  // Submission handles
  const submitRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfqMaterial || !newRfqQty || !newRfqTargetDate) return;
    addRfq({
      type: newRfqType,
      material: newRfqMaterial,
      quantity: newRfqQty,
      targetDate: newRfqTargetDate,
      urgency: newRfqUrgency,
      gsm: rfqGsm || undefined,
      fabricComposition: rfqFabricComposition || undefined,
      yarnCount: rfqYarnCount || undefined,
      serviceScope: rfqServiceScope || undefined,
      constructionSpecs: rfqConstructionSpecs || undefined,
      termsAndConditions: rfqTerms || undefined
    });

    // Reset fields
    setNewRfqMaterial("");
    setNewRfqQty("");
    setNewRfqTargetDate("");
    setNewRfqUrgency("Medium");
    setRfqGsm("");
    setRfqFabricComposition("");
    setRfqYarnCount("");
    setRfqServiceScope("");
    setRfqConstructionSpecs("");
    setRfqTerms("");
    setShowAddRfq(false);

    // Dynamic notifications
    setNotifications(prev => [
      { id: Date.now(), text: `Successfully launched ${newRfqType} RFQ for ${newRfqMaterial}`, unread: true },
      ...prev
    ]);
  };

  const submitVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newVendorScope || !newVendorContact || !newVendorEmail) return;
    addVendor({
      name: newVendorName,
      tier: newVendorTier,
      scope: newVendorScope,
      contact: newVendorContact,
      email: newVendorEmail,
      phone: newVendorPhone || "+880-1700-000000",
      logo: newVendorName.charAt(0).toUpperCase()
    });

    setNewVendorName("");
    setNewVendorScope("");
    setNewVendorContact("");
    setNewVendorEmail("");
    setNewVendorPhone("");
    setShowAddVendor(false);

    setNotifications(prev => [
      { id: Date.now(), text: `Registered approved vendor: ${newVendorName}`, unread: true },
      ...prev
    ]);
  };

  const submitDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocVendorId || !docFileName || !docExpiryDate) return;
    uploadVendorDocument(selectedDocVendorId, docTypeToUpload, docFileName, docExpiryDate);
    
    // Clear and hide
    setDocFileName("");
    setDocExpiryDate("");
    setShowDocUploadModal(false);

    const vendor = vendors.find(v => v.id === selectedDocVendorId);
    setNotifications(prev => [
      { id: Date.now(), text: `Uploaded ${docTypeToUpload} for ${vendor?.name || "Vendor"}`, unread: true },
      ...prev
    ]);
  };

  const executeSendRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendRfqTargetId || selectedVendorsToSend.length === 0) return;
    
    sendRfqToVendors(sendRfqTargetId, selectedVendorsToSend, emailSimulationChannel);
    
    const target = rfqs.find(r => r.id === sendRfqTargetId);
    
    setLastEmailBroadcast({
      count: selectedVendorsToSend.length,
      materials: target?.material || "Apparel Sourcing Goods",
      timestamp: new Date().toLocaleTimeString()
    });

    setShowSendRfqModal(false);
    setSelectedVendorsToSend([]);

    setNotifications(prev => [
      { id: Date.now(), text: `RFQ sent out to ${selectedVendorsToSend.length} vendors via email`, unread: true },
      ...prev
    ]);
  };

  const submitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !newPlanQty || !newPlanBudget || !newPlanDate) return;

    // Standardize budget and qty extraction for forecasts allocation
    const cleanBudgetStr = newPlanBudget.replace(/[^0-9.]/g, "");
    const numericBudget = parseFloat(cleanBudgetStr) || 50000;
    const cleanQtyStr = newPlanQty.replace(/[^0-9.]/g, "");
    const numericQty = parseFloat(cleanQtyStr) || 10000;

    const autoForecastList: MonthlyAllocation[] = [
      { month: "Jun 2026", qty: Math.round(numericQty * 0.2), budget: Math.round(numericBudget * 0.2) },
      { month: "Jul 2026", qty: Math.round(numericQty * 0.3), budget: Math.round(numericBudget * 0.3) },
      { month: "Aug 2026", qty: Math.round(numericQty * 0.35), budget: Math.round(numericBudget * 0.35) },
      { month: "Sep 2026", qty: Math.round(numericQty * 0.15), budget: Math.round(numericBudget * 0.15) }
    ];

    createProcurementPlan({
      itemName: newPlanName,
      quantity: newPlanQty,
      budget: newPlanBudget,
      targetDate: newPlanDate,
      monthlyForecast: autoForecastList
    } as any);

    setNewPlanName("");
    setNewPlanQty("");
    setNewPlanBudget("");
    setNewPlanDate("");
    setShowAddPlan(false);

    setNotifications(prev => [
      { id: Date.now(), text: `New Procurement Plan with monthly forecasting initialized for ${newPlanName}`, unread: true },
      ...prev
    ]);
  };

  const submitWO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWoRfqId || !newWoVendor || !newWoMaterial || !newWoQty || !newWoStart || !newWoEnd) return;
    addWorkOrder({
      rfqId: newWoRfqId,
      vendorName: newWoVendor,
      material: newWoMaterial,
      quantity: newWoQty,
      startDate: newWoStart,
      endDate: newWoEnd
    });
    setNewWoRfqId("");
    setNewWoVendor("");
    setNewWoMaterial("");
    setNewWoQty("");
    setNewWoStart("");
    setNewWoEnd("");
    setShowAddWO(false);
  };

  const submitQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWoForQc || !newQcFindings) return;

    // Pass detailed indicators to triggerQCInspection 
    triggerQCInspection(
      selectedWoForQc, 
      newQcDefectRate, 
      newQcFindings, 
      newQcStatus === "Passed",
      {
        status: newQcStatus,
        gsm: newQcGsm,
        color: newQcColor,
        sampleSize: newQcSampleSize,
        defectsCount: newQcDefectsCount,
        aqlStandard: newQcAqlStandard,
        photoUrl: newQcPhotoUrl
      }
    );

    setSelectedWoForQc("");
    setNewQcFindings("");
    setNewQcDefectRate(1.5);
    setNewQcGsm(180);
    setNewQcColor("Navy Blue");
    setNewQcSampleSize(80);
    setNewQcDefectsCount(1);
    setNewQcAqlStandard("1.5");
    setNewQcPhotoUrl("");
    setNewQcStatus("Passed");
    setShowAddQC(false);
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentOrderId || !paymentInvoiceId || !paymentInvoiceAmount || !paymentPoAmount || !paymentDueDate || !paymentVendorName) return;
    
    // Auto calculate invoice matching status
    const invAmountNum = parseFloat(paymentInvoiceAmount.replace(/[^0-9.]/g, ""));
    const poAmountNum = parseFloat(paymentPoAmount.replace(/[^0-9.]/g, ""));
    const variance = invAmountNum - poAmountNum;
    const isMatched = Math.abs(variance) < 1; // within $1 dollar variance tolerance
    const matchedStatus = isMatched ? "Fully Matched" : "Variance Detected";

    addPayment({
      orderId: paymentOrderId,
      vendorName: paymentVendorName,
      invoiceId: paymentInvoiceId,
      amount: paymentInvoiceAmount,
      invoiceAmount: paymentInvoiceAmount,
      poAmount: paymentPoAmount,
      matchedStatus: matchedStatus as any,
      dueDate: paymentDueDate,
      comment: paymentComment
    });

    setPaymentOrderId("");
    setPaymentInvoiceId("");
    setPaymentInvoiceAmount("");
    setPaymentPoAmount("");
    setPaymentDueDate("");
    setPaymentVendorName("");
    setPaymentComment("");
    setShowAddPayment(false);

    setNotifications(prev => [
      { id: Date.now(), text: `Logged invoice ${paymentInvoiceId} for ${paymentVendorName} - Matched: ${matchedStatus}`, unread: true },
      ...prev
    ]);
  };

  const submitForecast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForForecast) return;
    updatePlanForecast(selectedPlanForForecast.id, tempForecasts);
    setShowForecastModal(false);
    setSelectedPlanForForecast(null);
    setNotifications(prev => [
      { id: Date.now(), text: `Monthly allocations forecast updated for Plan #${selectedPlanForForecast.id}`, unread: true },
      ...prev
    ]);
  };

  const submitTor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTorTitle || !newTorDesc || !newTorScope || !newTorDeadline) return;
    createToR({
      title: newTorTitle,
      description: newTorDesc,
      scopeOfWork: newTorScope,
      expertType: newTorExpert,
      technicalWeight: Number(newTorTechWeight),
      financialWeight: Number(newTorFinWeight),
      budget: newTorBudget || "$35,000",
      deadline: newTorDeadline
    });
    setNewTorTitle("");
    setNewTorDesc("");
    setNewTorScope("");
    setNewTorExpert("ESG & Sustainability Expert");
    setNewTorTechWeight(70);
    setNewTorFinWeight(30);
    setNewTorBudget("");
    setNewTorDeadline("");
    setShowAddTorModal(false);
    setNotifications(prev => [
      { id: Date.now(), text: `New Terms of Reference drafted: ${newTorTitle}`, unread: true },
      ...prev
    ]);
  };

  const submitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTorIdForEvaluation || !newEvalConsultant || !newEvalProposal) return;
    const selectedTorInstance = tors.find(t => t.id === selectedTorIdForEvaluation);
    const avgTechPoint = (Number(newEvalExpScore) + Number(newEvalMethodScore) + Number(newEvalTeamScore)) / 3;
    const weightedTech = parseFloat(((avgTechPoint * (selectedTorInstance?.technicalWeight || 70)) / 100).toFixed(1));
    const weightedFin = parseFloat(((20000 / Math.max(1, Number(newEvalProposal))) * (selectedTorInstance?.financialWeight || 30)).toFixed(1));
    const calculatedTotal = parseFloat((weightedTech + weightedFin).toFixed(1));

    addConsultantEvaluation({
      torId: selectedTorIdForEvaluation,
      consultantName: newEvalConsultant,
      technicalScores: {
        experience: Number(newEvalExpScore),
        methodology: Number(newEvalMethodScore),
        teamStrength: Number(newEvalTeamScore)
      },
      financialProposal: Number(newEvalProposal),
      technicalScoreWeighted: weightedTech,
      financialScoreWeighted: weightedFin,
      totalScore: calculatedTotal,
      status: "Applied"
    });

    setNewEvalConsultant("");
    setNewEvalExpScore(85);
    setNewEvalMethodScore(85);
    setNewEvalTeamScore(80);
    setNewEvalProposal(20000);
    setShowAddEvalModal(false);
    setNotifications(prev => [
      { id: Date.now(), text: `Registered technical & financial bid from candidate '${newEvalConsultant}' under ToR #${selectedTorIdForEvaluation}`, unread: true },
      ...prev
    ]);
  };

  const submitBid = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedVendorName = portal === "Vendor" 
      ? (vendors.find(v => v.id === selectedVendorPortalId)?.name || "Mondol Fabrics Ltd.") 
      : bidVendorName;

    const resolvedVendorId = portal === "Vendor" ? selectedVendorPortalId : "VND-MONDOL";

    if (!resolvedVendorName || !bidPrice || !bidLeadTime) return;
    
    addQuotation({
      rfqId: bidRfqId,
      vendorId: resolvedVendorId,
      vendorName: resolvedVendorName,
      pricePerUnit: bidPrice,
      leadTimeDays: parseInt(bidLeadTime) || 15,
      complianceScore: parseFloat(bidScore) || 9.0,
      paymentTerms: bidTerms,
      specialNotes: bidNotes || "Direct Bid submission via secure vendor portal",
      isPreferred: false
    });

    setBidPrice("");
    setBidLeadTime("");
    setBidNotes("");
    setBidScore("9.0");
    setShowAddBid(false);

    setNotifications(prev => [
      { id: Date.now(), text: `Received quotation from ${resolvedVendorName} for RFQ ${bidRfqId}`, unread: true },
      ...prev
    ]);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    const email = authEmail.trim();
    const password = authPassword;

    if (!email || !password) {
      setAuthError("Email and password are required");
      setAuthSubmitting(false);
      return;
    }

    try {
      if (authMode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Write standard User profile metadata document users/{uid}
        const userDocRef = doc(db, "users", fbUser.uid);
        await setDoc(userDocRef, {
          email: fbUser.email || email,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Authorized User",
          plan: "Enterprise Sourcing Plan",
          createdAt: new Date().toISOString()
        });

        // Send verification email
        try {
          await sendEmailVerification(fbUser);
        } catch (emailErr) {
          console.warn("Could not send verification email (harmless in development):", emailErr);
        }
      }
    } catch (err: any) {
      console.error("Auth helper error:", err);
      if (authMode === "signup") {
        if (err.code === "auth/email-already-in-use") {
          setAuthError("User already exists. Please sign in");
        } else if (err.code === "auth/weak-password") {
          setAuthError("Password should be at least 6 characters");
        } else if (err.code === "auth/invalid-email") {
          setAuthError("Please provide a valid email address");
        } else {
          setAuthError(err.message || "An error occurred during sign up");
        }
      } else {
        setAuthError("Email or password is incorrect");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-50 font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Loading Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (verificationEmail) {
      return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-y-auto py-12 px-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-md p-6 sm:p-8 flex flex-col items-center relative transition text-center">
            {/* Branding */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>M</div>
              <div className="text-left">
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">MerchProcure</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Garments Manufacturing SaaS</p>
              </div>
            </div>

            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>

            <h2 className="text-sm font-bold text-slate-900 mb-2">Verify your email</h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              We have sent you a verification email to <strong className="font-bold text-slate-800">{verificationEmail}</strong>. Please verify it and log in.
            </p>

            <button
              onClick={async () => {
                setVerificationEmail("");
                setAuthEmail("");
                setAuthPassword("");
                setAuthError("");
                try {
                  await signOut(auth);
                } catch (e) {
                  console.error(e);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-y-auto py-12 px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-md p-6 sm:p-8 flex flex-col items-center relative transition">
          {/* Main App branding header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-sm">M</div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">MerchProcure</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Garments Manufacturing SaaS</p>
            </div>
          </div>

          <div className="w-full mb-6 border-b border-slate-100 flex gap-2">
            <button
              onClick={() => { setAuthMode("signin"); setAuthError(""); }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center select-none ${
                authMode === "signin" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode("signup"); setAuthError(""); }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center select-none ${
                authMode === "signup" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md leading-relaxed font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {authMode === "signin" ? "Signing In..." : "Signing Up..."}
                </>
              ) : (
                authMode === "signin" ? "Login to Dashboard" : "Register Credentials"
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 mt-6 text-center leading-normal max-w-[280px]">
            Enterprise Sourcing Portal for QC Bidding, multi-level approvals, and digital contracts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans text-xs antialiased transition-colors duration-200 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-200"
        />
      )}

      {/* Sidebar Section */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-transform duration-300 transform 
        md:relative md:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:flex
      `}>
        <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-black text-lg text-white">M</div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">MerchProcure</h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">Garments Manufacturing SaaS</p>
            </div>
          </div>
          {/* Close button for Mobile Sidebar */}
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white md:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menus with High Spacing Density */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: t[lang].dashboard, icon: LayoutDashboard },
            { id: "rfqs", label: t[lang].rfqs, icon: FileText },
            { id: "vendors", label: t[lang].vendors, icon: Users },
            { id: "comparison", label: t[lang].comparison, icon: Scale },
            { id: "approvals", label: t[lang].approvals, icon: ClipboardCheck },
            { id: "orders", label: t[lang].orders, icon: Layers },
            { id: "inspection", label: t[lang].inspection, icon: CheckCircle2 },
            { id: "payments", label: t[lang].payments, icon: DollarSign },
            { id: "plan", label: t[lang].plan, icon: Calendar },
            { id: "tor", label: t[lang].torEvaluation, icon: Award },
            { id: "reports", label: t[lang].reportingCenter, icon: BarChart3 },
            { id: "files", label: t[lang].myFiles, icon: Folder },
            { id: "notes", label: t[lang].myNotes, icon: Notebook },
            { id: "team", label: t[lang].teamMembers, icon: Users },
          ].map((item) => (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left font-medium transition-all ${
                activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 opacity-75 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Tenant Information in footer of sidebar */}
        <div className="p-3 md:p-4 border-t border-slate-800 text-[10px] text-slate-500">
          <p className="font-semibold text-slate-400">{t[lang].tenant}</p>
          <p className="mt-0.5 font-mono">{t[lang].tenantId}</p>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Top Header Panel with Integrated Secure Portal Access Toggle */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 md:gap-4 text-xs">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded md:hidden focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center bg-slate-100 dark:bg-slate-850 p-1.5 rounded-md border border-slate-200 dark:border-slate-700 gap-1 sm:gap-2">
              <span className="font-extrabold text-[9px] uppercase text-slate-500 dark:text-slate-400 tracking-wider hidden sm:inline">Portal Node:</span>
              <div className="flex bg-white/95 dark:bg-slate-950/95 rounded p-0.5 shadow-3xs border border-slate-150 dark:border-slate-800">
                <button 
                  onClick={() => { setPortal("Merchandiser"); setActiveTab("dashboard"); }}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 font-bold rounded-xs transition-all text-[9px] uppercase tracking-wider ${
                    portal === "Merchandiser" 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : "text-slate-500 dark:text-slate-405 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Buyer (Merch)
                </button>
                <button 
                  onClick={() => { setPortal("Vendor"); setActiveTab("rfqs"); }}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 font-bold rounded-xs transition-all text-[9px] uppercase tracking-wider flex items-center gap-1 ${
                    portal === "Vendor" 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "text-slate-500 dark:text-slate-405 hover:text-emerald-700 dark:hover:text-emerald-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Vendor
                </button>
              </div>
            </div>

            {portal === "Vendor" && (
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 font-bold px-2 py-1 rounded">
                  Representing Mill: <strong>Mondol Fabrics Ltd. (VND-MONDOL)</strong>
                </span>
              </div>
            )}

            <span className="text-slate-300 dark:text-slate-700 text-lg hidden md:inline">|</span>
            {/* Language Pill Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-0.5" id="language-selector">
              <button 
                onClick={() => setLang("EN")}
                className={`px-2 sm:px-3 py-1 text-[10px] font-bold rounded transition-all ${
                  lang === "EN" ? "bg-white dark:bg-slate-705 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang("BN")}
                className={`px-2 sm:px-3 py-1 text-[10px] font-bold rounded transition-all ${
                  lang === "BN" ? "bg-white dark:bg-slate-705 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                বাং
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-200 cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Search Input Bar */}
            <div className="relative max-w-48 hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input
                id="search-input"
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-slate-300 dark:focus:border-slate-750"
              />
            </div>

            {/* Notifications Dropdown Panel */}
            <div className="relative">
              <button 
                id="noti-bell-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) handleMarkNotificationsRead();
                }}
                className="relative p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
                <Bell className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded z-50 p-2"
                  >
                    <div className="flex justify-between items-center px-2 py-1 mb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-700 text-xs">Alert Notifications</span>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-400 py-6">No unread alerts</p>
                    ) : (
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-2 rounded text-left transition ${
                              n.unread ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <p className="text-slate-700 leading-normal">{n.text}</p>
                            <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">System Process</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile avatar block */}
            <div className="flex items-center gap-3 border-l pl-4 md:pl-6 border-slate-200">
              {authLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-blue-600 border-slate-200 animate-spin"></div>
              ) : user ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold leading-none text-slate-900">{user.displayName || "Authorized User"}</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider truncate max-w-36">{user.email}</p>
                  </div>
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border border-slate-200 text-sm">
                      {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : "US"}
                    </div>
                  )}
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowRoleSelector(!showRoleSelector)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded font-bold flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                      Switch Role
                    </button>
                    {showRoleSelector && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 z-50 text-left">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100 mb-1">Select Persona</p>
                        <button 
                          onClick={() => handleSignInAs("Tariqul Islam (Sourcing Lead)", "tariqul@buyer.com")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                        >
                          <p className="font-bold text-slate-800">Tariqul Islam</p>
                          <p className="text-[10px] text-slate-500">Sourcing Initiator (L1)</p>
                        </button>
                        <button 
                          onClick={() => handleSignInAs("Imran Khan (Procure Manager)", "imran@buyer.com")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                        >
                          <p className="font-bold text-slate-800">Imran Khan</p>
                          <p className="text-[10px] text-slate-500">Procurement Manager (L2)</p>
                        </button>
                        <button 
                          onClick={() => handleSignInAs("Sajid Chowdhury (Chief CFO)", "sajid@buyer.com")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                        >
                          <p className="font-bold text-slate-800">Sajid Chowdhury</p>
                          <p className="text-[10px] text-slate-500">Chief Financial Officer (L3)</p>
                        </button>
                        <button 
                          onClick={() => handleSignInAs("Aminul Islam (Supplier Rep)", "rep@mondol.com")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                        >
                          <p className="font-bold text-slate-800">Aminul Islam</p>
                          <p className="text-[10px] text-slate-500">Mondol Group Supplier</p>
                        </button>
                      </div>
                    )}
                  </div>

                  <a 
                    href="/pricing"
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border border-indigo-200 px-2.5 py-1 rounded font-bold transition"
                  >
                    Pricing
                  </a>

                  {(user?.email === "anikahmedcos@gmail.com" || user?.role === "Admin") && (
                    <a 
                      href="/admin"
                      className="text-[10px] bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-2.5 py-1 rounded font-bold transition"
                    >
                      Admin
                    </a>
                  )}

                  <button 
                    onClick={handleSignOutLocal}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-650 border border-slate-200 px-2 py-1 rounded font-bold transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowRoleSelector(!showRoleSelector)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[11px] rounded shadow-xs transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Select Sourcing Profile
                  </button>
                  {showRoleSelector && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 z-50 text-left">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100 mb-1">Select Persona</p>
                      <button 
                        onClick={() => handleSignInAs("Tariqul Islam (Sourcing Lead)", "tariqul@buyer.com")}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                      >
                        <p className="font-bold text-slate-800">Tariqul Islam</p>
                        <p className="text-[10px] text-slate-500">Sourcing Initiator (L1)</p>
                      </button>
                      <button 
                        onClick={() => handleSignInAs("Imran Khan (Procure Manager)", "imran@buyer.com")}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                      >
                        <p className="font-bold text-slate-800">Imran Khan</p>
                        <p className="text-[10px] text-slate-500">Procurement Manager (L2)</p>
                      </button>
                      <button 
                        onClick={() => handleSignInAs("Sajid Chowdhury (Chief CFO)", "sajid@buyer.com")}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                      >
                        <p className="font-bold text-slate-800">Sajid Chowdhury</p>
                        <p className="text-[10px] text-slate-500">Chief Financial Officer (L3)</p>
                      </button>
                      <button 
                        onClick={() => handleSignInAs("Aminul Islam (Supplier Rep)", "rep@mondol.com")}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-xs transition"
                      >
                        <p className="font-bold text-slate-800">Aminul Islam</p>
                        <p className="text-[10px] text-slate-500">Mondol Group Supplier</p>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Display Board View */}
        <section className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">

          {/* DYNAMIC VENDOR COMPLIANCE & EXPIRED DOCUMENT ALERTS BOARD */}
          {(() => {
            const documentAlerts = vendors.flatMap(v => 
              Object.entries(v.documents).map(([docType, doc]) => {
                const expiry = new Date(doc.expiryDate);
                const isExpired = expiry < new Date();
                const diffTime = expiry.getTime() - new Date().getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const expiringSoon = !isExpired && diffDays <= 30;
                
                if (isExpired || expiringSoon) {
                  return {
                    vendorId: v.id,
                    vendorName: v.name,
                    docType,
                    docName: doc.name,
                    expiryDate: doc.expiryDate,
                    isExpired,
                    expiringSoon,
                    daysLeft: diffDays
                  };
                }
                return null;
              })
            ).filter(Boolean) as Array<{
              vendorId: string;
              vendorName: string;
              docType: string;
              docName: string;
              expiryDate: string;
              isExpired: boolean;
              expiringSoon: boolean;
              daysLeft: number;
            }>;

            if (documentAlerts.length === 0) return null;

            return (
              <div className="bg-red-50/80 border-l-4 border-red-600 rounded-r p-3 text-xs shadow-3xs space-y-2">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-red-800 uppercase tracking-wider text-[10px]">Bangladesh Garments Compliance Watch:</span>
                      <p className="text-red-700 font-medium">We identified <strong className="font-bold">{documentAlerts.length} compliance warnings</strong> across approved suppliers list. Unresolved status hinders L/C issuance.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("vendors")}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold uppercase rounded text-[9px] whitespace-nowrap transition"
                  >
                    Resolve Status
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                  {documentAlerts.map((alert, i) => (
                    <div key={i} className="bg-white/80 p-2 rounded border border-red-100 flex items-center justify-between gap-3 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{alert.vendorName}</span>
                        <p className="text-slate-500 text-[10px] uppercase font-semibold mt-0.5">{alert.docType} ({alert.docName})</p>
                      </div>
                      <div className="text-right">
                        {alert.isExpired ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 font-black rounded text-[9px] uppercase tracking-wide">
                            Expired ({alert.expiryDate})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px] uppercase tracking-wide">
                            Expiring in {alert.daysLeft}d
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* EMAIL SIMULATION BANNER */}
          {lastEmailBroadcast && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs text-emerald-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 animate-bounce" />
                <div>
                  <p className="font-bold">Broadcasting Sourcing RFQ via Bangladesh Fiber Port Email Relay:</p>
                  <p className="text-[11px] text-emerald-700">Dispatched invitation letters to <strong className="font-extrabold">{lastEmailBroadcast.count} targeted suppliers</strong> for {lastEmailBroadcast.materials} at {lastEmailBroadcast.timestamp} (Simulated Live-SMTP 25).</p>
                </div>
              </div>
              <button 
                onClick={() => setLastEmailBroadcast(null)} 
                className="text-emerald-500 hover:text-emerald-800 font-bold text-sm"
              >
                &times;
              </button>
            </div>
          )}
          
          {/* DASHBOARD TAB VIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-5">
              {/* Responsive Bento-grid Stats Panel */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
                <div className="bg-white p-4 border border-slate-200 rounded shadow-xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t[lang].activeRfqs}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-900">{rfqs.length}</p>
                    <span className="text-xs text-blue-600 font-semibold">{t[lang].endingToday}</span>
                  </div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded shadow-xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t[lang].pendingAssign}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-900">
                      {approvals.filter(a => a.status === "Pending").length}
                    </p>
                    <span className="text-xs text-orange-600 font-semibold">{t[lang].requiresAttention}</span>
                  </div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded shadow-xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Deliveries</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-900">
                      {workOrders.filter(w => w.status !== "Completed").length} Orders
                    </p>
                    <span className="text-xs text-green-600 font-semibold">MTD Sourcing</span>
                  </div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded shadow-xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t[lang].qcRate}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-900 font-mono">
                      {(() => {
                        const passed = inspections.filter(i => i.status === "Passed").length;
                        const total = inspections.length;
                        return total > 0 ? `${((passed / total) * 100).toFixed(1)}%` : "100%";
                      })()}
                    </p>
                    <span className="text-xs text-slate-500 font-semibold">Across {vendors.length} Vendors</span>
                  </div>
                </div>
              </div>

              {/* Main Bento Column Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* RFQs Left Dashboard Panel */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded flex flex-col shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700">{t[lang].priorityRfq}</h2>
                    </div>
                    <button 
                      onClick={() => setActiveTab("rfqs")}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {t[lang].viewAll} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">RFQ ID</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t[lang].materialName}</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t[lang].quantity}</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t[lang].targetDate}</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t[lang].bids}</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t[lang].status}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rfqs.slice(0, 4).map((rfq) => (
                          <tr 
                            key={rfq.id} 
                            onClick={() => {
                              setSelectedRfqId(rfq.id);
                              setActiveTab("comparison");
                            }}
                            className="text-xs hover:bg-slate-50/80 cursor-pointer transition border-b border-slate-100"
                          >
                            <td className="p-3 font-mono font-bold text-blue-600">#{rfq.id}</td>
                            <td className="p-3 font-medium text-slate-800">{rfq.material}</td>
                            <td className="p-3 text-slate-600 font-mono">{rfq.quantity}</td>
                            <td className="p-3 text-slate-500 font-mono">{rfq.targetDate}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 px-2.5 py-0.5 rounded font-mono font-bold text-slate-700">
                                {rfq.bidsCount}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 font-semibold italic ${
                                rfq.status === "Bidding Open" ? "text-blue-600" :
                                rfq.status === "Reviewing" ? "text-orange-600" :
                                rfq.status === "Approving NOA" ? "text-purple-600" : "text-green-600"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  rfq.status === "Bidding Open" ? "bg-blue-600 animate-pulse" :
                                  rfq.status === "Reviewing" ? "bg-orange-600" :
                                  rfq.status === "Approving NOA" ? "bg-purple-600" : "bg-green-600"
                                }`}></span>
                                {rfq.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Quick RFQ Builder Section */}
                  <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-slate-500 italic">Configure tenders or invite custom vendor bids safely</p>
                    <button 
                      onClick={() => setShowAddRfq(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold uppercase tracking-wider text-[10px] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Launch Tender RFQ
                    </button>
                  </div>
                </div>

                {/* Score meters Right Dashboard Panel */}
                <div className="bg-white border border-slate-200 rounded flex flex-col shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-600" />
                    <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700">{t[lang].quotationScore}</h2>
                  </div>
                  
                  <div className="p-4 flex-1 space-y-4">
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded text-[11px] mb-2">
                      <span className="font-bold text-slate-600 uppercase text-[9px] tracking-wide block mb-1">Target Assessment RFQ:</span>
                      <div className="flex justify-between font-medium">
                        <span className="text-blue-600 font-mono font-bold">#FAB-992</span>
                        <span className="text-slate-600">Jersey Fabric 180GSM</span>
                      </div>
                    </div>

                    {quotations.filter(q => q.rfqId === "FAB-992").map((bid) => (
                      <div key={bid.id} className="space-y-1">
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="font-bold text-slate-800">{bid.vendorName}</span>
                          <span className={`font-bold italic ${
                            bid.complianceScore >= 9.0 ? "text-green-600" :
                            bid.complianceScore >= 8.0 ? "text-blue-600" : "text-orange-600"
                          }`}>
                            Score: {bid.complianceScore}/10
                          </span>
                        </div>
                        {/* Custom visual progress bars matching High Density exactly */}
                        <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              bid.complianceScore >= 9.0 ? "bg-green-500" :
                              bid.complianceScore >= 8.0 ? "bg-blue-500" : "bg-orange-500"
                            }`}
                            style={{ width: `${bid.complianceScore * 10}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>{bid.specialNotes}</span>
                          <span className="font-bold">{bid.pricePerUnit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        setSelectedRfqId("FAB-992");
                        setActiveTab("comparison");
                      }}
                      className="w-full py-2 bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                    >
                      {t[lang].analyzeSelect}
                    </button>
                  </div>
                </div>

              </div>

              {/* Dynamic Real-Time Deliveries Feed & Payment Approvals Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                
                {/* 1. Real-time Deliveries & Fabric QC Tracker */}
                <div className="bg-white border border-slate-200 rounded flex flex-col shadow-sm overflow-hidden text-left">
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Real-Time Deliveries &amp; QC Log</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab("inspection")}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Audit Portal <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 space-y-3">
                    {workOrders.map((wo) => {
                      const matchedInspection = inspections.find(i => i.orderId === wo.id);
                      return (
                        <div key={wo.id} className="p-3 border border-slate-100 bg-slate-50/35 rounded hover:bg-slate-50/80 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-blue-600">#{wo.id}</span>
                              <span className="text-xs font-bold text-slate-800">{wo.material}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Vendor: <strong className="font-semibold">{wo.vendorName}</strong> &bull; Qty: {wo.quantity}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-auto">
                            {matchedInspection ? (
                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider block text-center ${
                                  matchedInspection.status === "Passed" 
                                    ? "bg-green-600 text-white shadow-3xs" 
                                    : matchedInspection.status === "Hold" 
                                    ? "bg-amber-500 text-white shadow-3xs" 
                                    : "bg-red-600 text-white shadow-3xs"
                                }`}>
                                  {matchedInspection.status === "Passed" ? "Passed" : matchedInspection.status === "Hold" ? "Active Hold" : "Rejected"}
                                </span>
                                <span className="text-[8px] font-mono font-medium text-slate-400 block mt-0.5">Defect: {matchedInspection.defectRate || 1.2}%</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedWoForQc(wo.id);
                                  setNewQcStatus("Passed");
                                  setShowAddQC(true);
                                }}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase tracking-wider rounded transition"
                              >
                                Log Audit
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Active Payment Approvals Sequence Card */}
                <div className="bg-white border border-slate-200 rounded flex flex-col shadow-sm overflow-hidden text-left">
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Financial 3-Way Match &amp; Approval Flow</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab("payments")}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      General Ledger <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 space-y-3">
                    {payments.slice(0, 3).map((p) => {
                      const invoiceVal = parseFloat(p.invoiceAmount.replace(/[^0-9.]/g, "")) || 0;
                      const poVal = parseFloat(p.poAmount.replace(/[^0-9.]/g, "")) || 0;
                      const varianceAmt = invoiceVal - poVal;
                      const isMatched = Math.abs(varianceAmt) < 1;

                      return (
                        <div key={p.id} className="p-3 border border-slate-100 bg-slate-50/35 rounded flex flex-col gap-2 hover:bg-slate-50/80 transition">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono font-bold text-slate-400">Invoice #{p.invoiceId}</span>
                              <h4 className="font-extrabold text-slate-800 text-xs">{p.vendorName}</h4>
                              <p className="text-[9px] text-slate-500">Contract Order: #{p.orderId}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                isMatched 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {isMatched ? "PO Match Verified" : "Variance Flagged"}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-slate-800 block mt-1">{p.invoiceAmount}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100/80 pt-2 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 uppercase tracking-wider text-[8px]">Approval Gate Stage:</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              p.status === "Completed" 
                                ? "bg-green-600 text-white" 
                                : p.status === "Rejected"
                                ? "bg-red-600 text-white"
                                : "bg-amber-500 text-white"
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* RFQ TAB VIEW */}
          {activeTab === "rfqs" && (
            <div className="space-y-4">
              {portal === "Vendor" ? (
                // VENDOR PORTAL VIEW FOR ACTIVE RFQS
                <div className="bg-emerald-950 text-white rounded p-4 border border-emerald-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-700 text-white font-extrabold rounded text-[9px] uppercase tracking-wider">Secure Vendor Link</span>
                      <h1 className="text-sm font-extrabold text-white mt-1 uppercase tracking-wide">Mondol Fabrics Ltd. — Active Tender Portal</h1>
                      <p className="text-xs text-emerald-300">Authorized bidding node with encrypted connection to Standard Group Merchandising Systems.</p>
                    </div>
                    <button
                      onClick={() => {
                        setBidRfqId(rfqs[0]?.id || "RFQ-501");
                        const name = vendors.find(v => v.id === selectedVendorPortalId)?.name || "Mondol Fabrics Ltd.";
                        setBidVendorName(name);
                        setShowAddBid(true);
                      }}
                      className="px-3.5 py-1.5 bg-white text-emerald-900 border border-emerald-100 hover:bg-emerald-50 rounded font-black text-[10px] uppercase tracking-wide flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Submit Tender Bid
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-emerald-200 text-[11px] pt-1">
                    <div className="bg-emerald-900/40 p-2 rounded border border-emerald-800/60">
                      <span className="text-xs text-white block font-bold font-mono">Supplier Rating</span>
                      <span className="text-lg font-black text-emerald-300">9.4 / 10.0</span> (Gold Tier Card)
                    </div>
                    <div className="bg-emerald-900/40 p-2 rounded border border-emerald-800/60">
                      <span className="text-xs text-white block font-bold font-mono">Bidding Eligibility</span>
                      <span className="text-lg font-black text-emerald-300">FULLY ELIGIBLE</span> (BIN/TIN Valid)
                    </div>
                    <div className="bg-emerald-900/40 p-2 rounded border border-emerald-800/60">
                      <span className="text-xs text-white block font-bold font-mono">My Active Bids</span>
                      <span className="text-lg font-black text-emerald-300">
                        {quotations.filter(q => q.vendorId === selectedVendorPortalId).length} Submissions
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // MERCHANDISER BUYER VIEW FOR RFQS
                <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                  <div>
                    <h1 className="text-base font-bold text-slate-900">RFQ & Sourcing Tenders Command</h1>
                    <p className="text-xs text-slate-500">Manage apparel specifications (GSM, Composition), dispatch tenders to registered mills, and verify real-time incoming quotes.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowAddRfq(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold text-[10px] uppercase flex items-center gap-1 shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Launch Tender RFQ
                    </button>
                  </div>
                </div>
              )}

              {/* RFQ Interactive Panel View */}
              <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                  <span>Sourcing Requirements List ({rfqs.length} Active Tenders)</span>
                  <span className="text-slate-400 font-normal normal-case italic">Click row to view quotation matrix or award NOA</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-250">
                    <tr>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider">RFQ ID</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider">Type</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider">Material Good Specs</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider">Target Qty</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider">Delivery Deadline</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider">Urgency</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider">Sourcing Status</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[9px] uppercase tracking-wider text-right">Workflow Interactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {rfqs
                      .filter(rfq => rfq.material.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((rfq) => {
                        const hasMondolBid = quotations.some(q => q.rfqId === rfq.id && q.vendorId === selectedVendorPortalId);
                        
                        return (
                          <tr 
                            key={rfq.id} 
                            className={`hover:bg-slate-50 transition border-b border-slate-100 ${
                              selectedRfqId === rfq.id ? "bg-blue-50/20 font-semibold" : ""
                            }`}
                          >
                            <td 
                              onClick={() => {
                                setSelectedRfqId(rfq.id);
                                setActiveTab("comparison");
                              }}
                              className="p-2.5 font-mono font-bold text-blue-600 cursor-pointer"
                            >
                              #{rfq.id}
                            </td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-black ${
                                rfq.type === "Goods" ? "bg-blue-100 text-blue-800" :
                                rfq.type === "Service" ? "bg-amber-100 text-amber-800" :
                                "bg-purple-100 text-purple-800"
                              }`}>
                                {rfq.type}
                              </span>
                            </td>
                            <td className="p-2.5 max-w-sm">
                              <div>
                                <p className="font-bold text-slate-800">{rfq.material}</p>
                                {/* Dynamic Specs Line */}
                                <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[9px] text-slate-400">
                                  {rfq.gsm && (<span>GSM-<strong>{rfq.gsm}</strong></span>)}
                                  {rfq.fabricComposition && (<span>Composition-<strong>{rfq.fabricComposition}</strong></span>)}
                                  {rfq.yarnCount && (<span>Yarn-<strong>{rfq.yarnCount}</strong></span>)}
                                  {rfq.serviceScope && (<span>Scope-<strong>{rfq.serviceScope}</strong></span>)}
                                </div>
                              </div>
                            </td>
                            <td className="p-2.5 font-mono text-slate-700">{rfq.quantity}</td>
                            <td className="p-2.5 font-mono text-slate-600">{rfq.targetDate}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                                rfq.urgency === "High" ? "bg-red-100 text-red-700" :
                                rfq.urgency === "Medium" ? "bg-orange-100 text-orange-700" :
                                "bg-slate-100 text-slate-705"
                              }`}>
                                {rfq.urgency}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className={`inline-flex items-center gap-1 font-bold italic ${
                                rfq.status === "Bidding Open" ? "text-blue-600" :
                                rfq.status === "Reviewing" ? "text-orange-600" :
                                rfq.status === "Approving NOA" ? "text-purple-600" : "text-green-600"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  rfq.status === "Bidding Open" ? "bg-blue-600 animate-pulse" :
                                  rfq.status === "Reviewing" ? "bg-orange-600" :
                                  rfq.status === "Approving NOA" ? "bg-purple-600" : "bg-green-600"
                                }`}></span>
                                {rfq.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right space-x-1.5 whitespace-nowrap">
                              {portal === "Vendor" ? (
                                hasMondolBid ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded">
                                    ✓ Submitted Sourcing Quote
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setBidRfqId(rfq.id);
                                      const name = vendors.find(v => v.id === selectedVendorPortalId)?.name || "Mondol Fabrics Ltd.";
                                      setBidVendorName(name);
                                      setShowAddBid(true);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase rounded text-[9px]"
                                  >
                                    Submit Sourcing Quote
                                  </button>
                                )
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setSendRfqTargetId(rfq.id);
                                      // default invite the qualified ones
                                      setSelectedVendorsToSend(vendors.map(v => v.id));
                                      setShowSendRfqModal(true);
                                    }}
                                    className="px-2.5 py-1 py-1.5 bg-blue-150 text-blue-800 border border-blue-200 hover:bg-blue-200 font-bold uppercase rounded text-[9px] transition"
                                  >
                                    Send RFQ Invite
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setSelectedRfqId(rfq.id);
                                      setActiveTab("comparison");
                                    }}
                                    className="px-2.5 py-1 bg-slate-900 text-white font-bold uppercase rounded text-[9px]"
                                  >
                                    Compare Bids ({rfq.bidsCount})
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VENDOR HUB TAB VIEW */}
           {activeTab === "vendors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Vendor Compliance & Mill Directory</h1>
                  <p className="text-xs text-slate-500">Track GOTS/OEKO-TEX certificated spinning mills, manage official documents (Trade License, BIN, TIN, Solvency), and check automatic renewal alerts.</p>
                </div>
                <button
                  onClick={() => setShowAddVendor(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] uppercase flex items-center gap-1 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Register New Mill
                </button>
              </div>

              {/* Vendor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors
                  .filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((v) => {
                    const rating = 9.2 + (vendors.indexOf(v) * 0.1) % 0.8;
                    return (
                      <div key={v.id} className="bg-white border border-slate-200 rounded p-4 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {v.logo}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-extrabold text-slate-800 text-xs">{v.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                                  v.tier.includes("Gold") ? "bg-amber-100 text-amber-800" :
                                  v.tier.includes("Platinum") ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"
                                }`}>
                                  {v.tier}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">ID: {v.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-slate-500 text-[11px] mb-4">
                            <div className="flex justify-between border-b border-slate-50 py-1">
                              <span>Specialization:</span>
                              <span className="font-bold text-slate-705 text-right shrink-0">{v.scope}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 py-1">
                              <span>Contact Point:</span>
                              <span className="font-medium text-slate-700">{v.contact}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 py-1">
                              <span>Secure Email:</span>
                              <span className="font-mono text-slate-600 text-right">{v.email}</span>
                            </div>

                            {/* COMPLIANCE DOCUMENTS SUB-PANEL */}
                            <div className="pt-2">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Required Compliance Files:</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {["Trade License", "BIN", "TIN", "Solvency Certificate"].map((docType) => {
                                  // Find if uploaded
                                  const doc = v.documents[docType as keyof typeof v.documents];
                                  const isUploaded = !!doc;
                                  
                                  let docStatus: "Valid" | "Expiring Soon" | "Expired" | "Missing" = "Missing";
                                  let detailedLabel = docType.split(" ")[0];

                                  if (isUploaded && doc) {
                                    const expiry = new Date(doc.expiryDate);
                                    if (expiry < new Date()) {
                                      docStatus = "Expired";
                                    } else {
                                      const diffDays = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                      docStatus = diffDays <= 30 ? "Expiring Soon" : "Valid";
                                    }
                                  }

                                  return (
                                    <div 
                                      key={docType} 
                                      className={`p-1.5 rounded border text-[10px] flex flex-col justify-between min-h-12 transition ${
                                        docStatus === "Valid" ? "bg-emerald-50/55 border-emerald-100 text-emerald-800" :
                                        docStatus === "Expiring Soon" ? "bg-amber-50/55 border-amber-100 text-amber-800" :
                                        docStatus === "Expired" ? "bg-red-50/55 border-red-100 text-red-800 animate-pulse" :
                                        "bg-slate-50/65 border-slate-150 text-slate-400"
                                      }`}
                                    >
                                      <span className="font-bold uppercase text-[8px] tracking-wide block">{detailedLabel}</span>
                                      <div className="flex items-center justify-between gap-1 mt-1 shrink-0">
                                        <span className="text-[9px] font-mono leading-none truncate max-w-[50px]">
                                          {isUploaded && doc ? doc.name : "N/A"}
                                        </span>
                                        <span className={`px-1 rounded text-[7px] font-black uppercase ${
                                          docStatus === "Valid" ? "bg-emerald-200/60" :
                                          docStatus === "Expiring Soon" ? "bg-amber-200/60" :
                                          docStatus === "Expired" ? "bg-red-200/60" : "bg-slate-200/60"
                                        }`}>
                                          {docStatus}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                          <button 
                            onClick={() => {
                              setSelectedDocVendorId(v.id);
                              setDocTypeToUpload("Trade License");
                              setShowDocUploadModal(true);
                            }}
                            className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-800 font-extrabold uppercase text-[9px] transition flex items-center justify-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload Document
                          </button>
                          <button 
                            onClick={() => {
                              setBidRfqId("RFQ-501");
                              setBidVendorName(v.name);
                              setShowAddBid(true);
                            }}
                            className="py-1.5 px-3 bg-slate-900 border border-slate-950 text-white font-extrabold rounded text-[9px] hover:bg-slate-800 transition"
                          >
                            New Bid Record
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* COMPARISON MATRIX VIEW AND WEIGHT-BASED SCORING SYSTEM */}
          {activeTab === "comparison" && (() => {
            const activeBids = quotations.filter(q => q.rfqId === selectedRfqId);
            
            // Mathematical Sourcing Ranking Engine:
            const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
            const prices = activeBids.map(b => parsePrice(b.pricePerUnit)).filter(p => p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 1;
            
            const leadTimes = activeBids.map(b => b.leadTimeDays).filter(l => l > 0);
            const minLead = leadTimes.length > 0 ? Math.min(...leadTimes) : 1;

            // Map and calculate custom dynamic weighted score
            const scoredBids = activeBids.map(q => {
              const priceVal = parsePrice(q.pricePerUnit);
              const leadTimeVal = q.leadTimeDays;
              
              // Normalize metrics out of 10
              const priceScore = priceVal > 0 ? (minPrice / priceVal) * 10 : 0;
              const leadTimeScore = leadTimeVal > 0 ? (minLead / leadTimeVal) * 10 : 0;
              const complianceScoreVal = q.complianceScore; // already out of 10

              const totalWeight = weightPrice + weightDelivery + weightCompliance || 1;
              const finalWeightedScore = (
                (priceScore * weightPrice) + 
                (leadTimeScore * weightDelivery) + 
                (complianceScoreVal * weightCompliance)
              ) / totalWeight * 10;

              return {
                ...q,
                priceScore,
                leadTimeScore,
                finalWeightedScore: Math.round(finalWeightedScore * 10) / 10
              };
            }).sort((a, b) => b.finalWeightedScore - a.finalWeightedScore);

            return (
              <div className="space-y-4">
                {/* Header Selector bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 border-slate-200 gap-3">
                  <div>
                    <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">RFQ Comparison Matrix & Dynamic Scoring Engine</h1>
                    <p className="text-xs text-slate-500">Slide weight variables (Price, Lead-time, Compliance) dynamically to auto-rank active bids in real-time under Bangladesh ISO guidelines.</p>
                  </div>
                  {/* RFQ Select dropdown */}
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded border border-slate-200">
                    <span className="font-extrabold text-slate-500 text-[9px] uppercase tracking-wider">Target RFQ:</span>
                    <select 
                      value={selectedRfqId}
                      onChange={(e) => setSelectedRfqId(e.target.value)}
                      className="bg-white border border-slate-200 text-xs p-1 focus:outline-none rounded font-bold text-blue-600 font-mono focus:border-blue-500"
                    >
                      {rfqs.map(r => (
                        <option key={r.id} value={r.id}>#{r.id} - {r.material.slice(0, 20)}...</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Weighted Slider Controls Box */}
                <div className="bg-slate-900 text-white rounded p-4 border border-slate-950 shadow-sm col-span-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-slate-400" />
                      <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-200">Weight Sliders assessment metrics (Total: {weightPrice + weightDelivery + weightCompliance}%)</span>
                    </div>
                    <button 
                      onClick={() => {
                        setWeightPrice(40);
                        setWeightDelivery(30);
                        setWeightCompliance(30);
                      }}
                      className="text-[9px] text-blue-400 hover:text-blue-300 font-extrabold uppercase tracking-widest flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Weights
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Price Weight Slider */}
                    <div className="space-y-1.5 p-2.5 bg-slate-850 rounded border border-slate-800">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-blue-400">PRICE ECONOMY WEIGHT</span>
                        <span className="bg-blue-600/20 px-2 py-0.5 rounded text-blue-300 font-mono">{weightPrice}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={weightPrice}
                        onChange={(e) => setWeightPrice(parseInt(e.target.value) || 0)}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 block italic leading-tight">Prioritize lower quote cents per unit for high-volume margin savings.</span>
                    </div>

                    {/* Delivery Weight Slider */}
                    <div className="space-y-1.5 p-2.5 bg-slate-850 rounded border border-slate-800">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-amber-400">LEAD TIME SPEED WEIGHT</span>
                        <span className="bg-amber-600/20 px-2 py-0.5 rounded text-amber-300 font-mono">{weightDelivery}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={weightDelivery}
                        onChange={(e) => setWeightDelivery(parseInt(e.target.value) || 0)}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 block italic leading-tight">Prioritize rapid spinning & courier delivery to prevent shipping delay charges.</span>
                    </div>

                    {/* Terms / Compliance Weight Slider */}
                    <div className="space-y-1.5 p-2.5 bg-slate-850 rounded border border-slate-800">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-emerald-400">COMPLIANCE & TERMS WEIGHT</span>
                        <span className="bg-emerald-600/20 px-2 py-0.5 rounded text-emerald-300 font-mono">{weightCompliance}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={weightCompliance}
                        onChange={(e) => setWeightCompliance(parseInt(e.target.value) || 0)}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 block italic leading-tight">Prioritize suppliers with certified doc health credentials and sound credit line history.</span>
                    </div>
                  </div>
                </div>

                {/* Sourcing Comparison Grid View */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* scored bids section */}
                  <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Auto-Ranked Tender Submissions ({scoredBids.length} entries)</h3>
                    
                    {scoredBids.length === 0 ? (
                      <div className="bg-white border border-slate-200 p-8 rounded text-center shadow-3xs">
                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2 animate-bounce" />
                        <p className="font-bold text-slate-700 text-xs">No bids submitted yet for this RFQ</p>
                        <p className="text-slate-400 mt-1">Switch portal context or register dynamic quotes in real-time.</p>
                        <button
                          onClick={() => {
                            setBidRfqId(selectedRfqId);
                            setBidVendorName("Mondol Fabrics Ltd.");
                            setShowAddBid(true);
                          }}
                          className="mt-4 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded"
                        >
                          Submit Bid Sample
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Tabular Sourcing Matrix List */}
                        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
                          <div className="p-3 bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                            <span>Dynamic Tabular Evaluation Index ({scoredBids.length} entries)</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                              Ranked via dynamic weighted criteria
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                              <thead className="bg-slate-55 border-b border-slate-200 bg-slate-50">
                                <tr>
                                  <th className="p-2.5 text-[9px] font-black text-slate-500 uppercase">Rank</th>
                                  <th className="p-2.5 text-[9px] font-black text-slate-500 uppercase">Sourcing Vendor</th>
                                  <th className="p-2.5 text-[9px] font-black text-slate-500 uppercase font-mono">Quoted Cost</th>
                                  <th className="p-2.5 text-[9px] font-black text-slate-500 uppercase font-mono">Lead Time</th>
                                  <th className="p-2.5 text-[9px] font-black text-slate-500 uppercase">Compliance</th>
                                  <th className="p-2.5 text-[9px] font-black text-slate-500 uppercase">Payment Terms</th>
                                  <th className="p-2.5 text-[9px] font-black text-blue-600 uppercase text-right pr-4">Weighted Score</th>
                                  <th className="p-2.5 text-[9px] font-black text-slate-500 uppercase text-right">Tendering Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px] font-semibold">
                                {scoredBids.map((q, idx) => {
                                  const isWin = idx === 0;
                                  return (
                                    <tr 
                                      key={q.id} 
                                      className={`transition hover:bg-slate-50/70 border-b border-slate-100 ${isWin ? "bg-emerald-50/15" : ""}`}
                                    >
                                      <td className="p-2.5 font-bold font-mono">
                                        {isWin ? (
                                          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[8.5px] font-bold tracking-wider">
                                            🏆 WINNER
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 bg-slate-150 text-slate-700 rounded text-[9px] font-mono">
                                            #{idx + 1}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-2.5 text-slate-800 font-bold">{q.vendorName}</td>
                                      <td className="p-2.5 font-mono text-slate-700">{q.pricePerUnit}</td>
                                      <td className="p-2.5 font-mono text-slate-600">{q.leadTimeDays} days</td>
                                      <td className="p-2.5 font-mono text-slate-650">{q.complianceScore} / 10</td>
                                      <td className="p-2.5 font-medium text-slate-500 max-w-[120px] truncate">{q.paymentTerms || "Standard L/C"}</td>
                                      <td className="p-2.5 font-black text-right text-blue-700 font-mono italic pr-4">
                                        {q.finalWeightedScore}%
                                      </td>
                                      <td className="p-2.5 text-right whitespace-nowrap">
                                        <button 
                                          onClick={() => {
                                            const rfqVal = rfqs.find(r => r.id === selectedRfqId);
                                            const priceNum = parseFloat(q.pricePerUnit.replace(/[^0-9.]/g, "")) || 0;
                                            const qtyNum = parseFloat((rfqVal?.quantity || "0").replace(/[^0-9.]/g, "")) || 0;
                                            const calcAmount = priceNum && qtyNum ? `$${(priceNum * qtyNum).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : (q.pricePerUnit || "$0.00");
                                            
                                            submitAwardToCommittee(selectedRfqId, q.id, q.vendorName, calcAmount);
                                            
                                            setNotifications(prev => [
                                              { id: Date.now(), text: `Award nomination filed for RFQ-${selectedRfqId}! Sequential Committee Approval queue generated for ${q.vendorName}`, unread: true },
                                              ...prev
                                            ]);
                                            setApprovalsSubTab("queue");
                                            setActiveTab("approvals");
                                          }}
                                          className={`px-2.5 py-1 text-[9px] uppercase font-bold rounded transition ${
                                            isWin 
                                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs animate-pulse" 
                                              : "bg-slate-900 text-white hover:bg-slate-800"
                                          }`}
                                        >
                                          Award
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {scoredBids.map((q, index) => {
                            const isLeadRank = index === 0;
                            return (
                            <div 
                              key={q.id} 
                              className={`bg-white border rounded p-4 relative flex flex-col justify-between transition shadow-3xs ${
                                isLeadRank 
                                  ? "border-emerald-600 bg-emerald-50/15 ring-2 ring-emerald-500/20" 
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {/* Award Ranking Badge */}
                              <span className={`absolute top-2.5 right-2.5 text-[8.5px] font-black uppercase px-2 py-0.5 rounded shadow-3xs flex items-center gap-1 ${
                                isLeadRank 
                                  ? "bg-emerald-600 text-white animate-pulse" 
                                  : "bg-slate-200 text-slate-800"
                              }`}>
                                {isLeadRank && "🏆 Best Option | "}
                                Award Rank #{index + 1}
                              </span>

                              <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">{q.vendorName}</h4>
                                <span className="font-mono text-slate-400 text-[9px] block mt-0.5 mb-2.5">Bid ID: {q.id} | Credit: GOTS Certified</span>

                                {/* Comprehensive dynamic score meter */}
                                <div className="p-2.5 bg-slate-50 rounded border border-slate-105 flex items-center justify-between mb-3.5">
                                  <div>
                                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block">Scoring Engine:</span>
                                    <span className="text-[10px] text-slate-500 text-[9px]">Weighted evaluation</span>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-lg font-black ${isLeadRank ? "text-emerald-700" : "text-blue-700"}`}>
                                      {q.finalWeightedScore} %
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1.5 text-[11px] text-slate-600 mb-4 font-medium">
                                  <div className="flex justify-between border-b border-slate-50 pb-1">
                                    <span>Bid Unit Cost:</span>
                                    <span className="font-extrabold text-slate-800 font-mono">{q.pricePerUnit}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1">
                                    <span>Supplier Lead Time:</span>
                                    <span className="font-extrabold text-slate-850 font-mono">{q.leadTimeDays} days</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1">
                                    <span>Tendering Compliance:</span>
                                    <span className="font-extrabold text-green-600 font-mono">{q.complianceScore} / 10.0</span>
                                  </div>
                                  {q.paymentTerms && (
                                    <div className="flex justify-between border-b border-slate-50 pb-1">
                                      <span>Payment Terms:</span>
                                      <span className="text-[10px] text-slate-500 text-right">{q.paymentTerms}</span>
                                    </div>
                                  )}
                                  <div className="text-[10px] text-slate-400 bg-slate-50/50 p-1.5 rounded border border-slate-100 leading-normal mt-2">
                                    <span className="font-bold text-slate-500 uppercase text-[8px] block mb-0.5">MILL SPEC NOTES</span>
                                    "{q.specialNotes}"
                                  </div>
                                </div>
                              </div>

                              <button 
                                onClick={() => {
                                  const rfqVal = rfqs.find(r => r.id === selectedRfqId);
                                  const priceNum = parseFloat(q.pricePerUnit.replace(/[^0-9.]/g, "")) || 0;
                                  const qtyNum = parseFloat((rfqVal?.quantity || "0").replace(/[^0-9.]/g, "")) || 0;
                                  const calcAmount = priceNum && qtyNum ? `$${(priceNum * qtyNum).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : (q.pricePerUnit || "$0.00");
                                  
                                  submitAwardToCommittee(selectedRfqId, q.id, q.vendorName, calcAmount);
                                  
                                  setNotifications(prev => [
                                    { id: Date.now(), text: `Award nomination filed for RFQ-${selectedRfqId}! Sequential Committee Approval queue generated for ${q.vendorName}`, unread: true },
                                    ...prev
                                  ]);

                                  setApprovalsSubTab("queue");
                                  setActiveTab("approvals");
                                }}
                                className={`w-full py-2 rounded text-[10px] font-black uppercase tracking-wider transition ${
                                  isLeadRank 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" 
                                    : "bg-slate-900 hover:bg-slate-800 text-white"
                                }`}
                              >
                                Grant Order (Issue LOI)
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Technical Information panel */}
                  <div className="bg-white border border-slate-200 rounded p-4 shadow-3xs h-fit space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b pb-2 border-slate-100 mb-3 flex items-center justify-between">
                        <span>Original Specs File</span>
                        <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono font-bold">#{selectedRfqId}</span>
                      </h3>
                      
                      {(() => {
                        const target = rfqs.find(r => r.id === selectedRfqId);
                        if (!target) return <p className="text-slate-400 italic">No RFQ Selected</p>;
                        return (
                          <div className="space-y-3.5">
                            <div className="bg-slate-50/80 p-2.5 rounded border border-slate-100">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Requirement Line:</span>
                              <p className="font-extrabold text-slate-800 text-xs mt-0.5 leading-normal">{target.material}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                              <div className="bg-slate-50/50 p-2 rounded border border-slate-100">
                                <span className="text-[9px] text-slate-400 block font-bold uppercase">Volume Needed</span>
                                <span className="font-mono font-extrabold text-slate-800 text-xs">{target.quantity}</span>
                              </div>
                              <div className="bg-slate-50/50 p-2 rounded border border-slate-100">
                                <span className="text-[9px] text-slate-400 block font-bold uppercase">Target Date</span>
                                <span className="font-mono font-extrabold text-slate-800 text-xs">{target.targetDate}</span>
                              </div>
                            </div>

                            {/* Technical Specs display section */}
                            {(target.gsm || target.fabricComposition || target.yarnCount || target.serviceScope || target.constructionSpecs) && (
                              <div className="p-3 bg-slate-50 rounded border border-slate-150 space-y-2 text-[11px]">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Raw Spec Credentials:</span>
                                {target.gsm && (
                                  <div className="flex justify-between border-b border-slate-100 pb-1 mt-1">
                                    <span className="text-slate-400">Spec Weight (GSM):</span>
                                    <span className="font-bold text-slate-700">{target.gsm} GSM</span>
                                  </div>
                                )}
                                {target.fabricComposition && (
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-400">Composition:</span>
                                    <span className="font-bold text-slate-700">{target.fabricComposition}</span>
                                  </div>
                                )}
                                {target.yarnCount && (
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-400">Yarn Parameter:</span>
                                    <span className="font-bold text-slate-700">{target.yarnCount}</span>
                                  </div>
                                )}
                                {target.serviceScope && (
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-400">Service Scope:</span>
                                    <span className="font-bold text-slate-700">{target.serviceScope}</span>
                                  </div>
                                )}
                                {target.termsAndConditions && (
                                  <div className="text-[10px] text-slate-400 mt-2 border-t pt-2 border-slate-150 italic">
                                    <strong>Procuring Terms:</strong> {target.termsAndConditions}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="border-t border-slate-150 pt-3 text-[10px] text-slate-400 leading-normal italic">
                      Disclaimer: This auto-ranking calculation uses dynamic regression ratios normalized across live Bangladeshi textile bids.
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* APPROVALS TAB VIEW */}
          {activeTab === "approvals" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-slate-200 gap-3">
                <div>
                  <h1 className="text-base font-bold text-slate-900 font-sans">Apparel Sourcing & Supply Workflows</h1>
                  <p className="text-xs text-slate-500">Secure sequential approval queues, formal award letters, and digitally signed trade contracts.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded border border-slate-200 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => { setApprovalsSubTab("queue"); setSelectedApprovalId(null); }}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold font-sans uppercase tracking-wider text-center transition-all ${
                      approvalsSubTab === "queue" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    1. Committee Queue ({approvals.filter(a => a.status === "Pending").length})
                  </button>
                  <button
                    onClick={() => { setApprovalsSubTab("noas"); setSelectedNoaId(null); }}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold font-sans uppercase tracking-wider text-center transition-all ${
                      approvalsSubTab === "noas" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    2. Notices of Award ({noas.filter(n => n.status === "Pending Signature").length})
                  </button>
                  <button
                    onClick={() => { setApprovalsSubTab("contracts"); setSelectedContractId(null); }}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold font-sans uppercase tracking-wider text-center transition-all ${
                      approvalsSubTab === "contracts" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    3. PO Contracts ({contracts.filter(c => c.status === "Draft" || c.status === "Under Review").length})
                  </button>
                </div>
              </div>

              {/* 1. SOURCING APPROVALS QUEUE */}
              {approvalsSubTab === "queue" && (() => {
                const activeApproval = approvals.find(ap => ap.id === selectedApprovalId) || approvals[0];
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: Approvals list */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Active Sourcing Files Awaiting Sign-off</h3>
                        </div>
                        {approvals.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 italic">No approval requests currently active.</div>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                            {approvals.map((ap) => {
                              const isSelected = activeApproval?.id === ap.id;
                              return (
                                <div 
                                  key={ap.id}
                                  onClick={() => setSelectedApprovalId(ap.id)}
                                  className={`p-3 text-[11px] cursor-pointer transition border-l-2 ${
                                    isSelected 
                                      ? "bg-slate-50/80 border-l-blue-600" 
                                      : "hover:bg-slate-50/40 border-l-transparent"
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="font-mono font-bold text-slate-500">#{ap.id}</span>
                                    <span className={`px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-wider shrink-0 ${
                                      ap.type === "NOA" ? "bg-amber-100 text-amber-805" :
                                      ap.type === "Payment" ? "bg-emerald-100 text-emerald-805" :
                                      "bg-blue-105 text-blue-805"
                                    }`}>
                                      {ap.type}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 mt-1 leading-snug">{ap.title}</h4>
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                                    <span>Filed by: <strong className="text-slate-600">{ap.requestedBy.split(" ")[0]}</strong></span>
                                    <span className="font-mono font-bold text-slate-700">{ap.amount || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-150/50">
                                    <span className="text-[9px] text-slate-400 font-mono">{ap.date}</span>
                                    <span className={`px-1 rounded font-bold uppercase text-[8px] ${
                                      ap.status === "Pending" ? "bg-amber-50 text-amber-600 font-extrabold italic" :
                                      ap.status === "Approved" ? "bg-emerald-50 text-emerald-600" : 
                                      "bg-red-50 text-red-650"
                                    }`}>
                                      {ap.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Detailed Timeline Sourcing File */}
                    <div className="lg:col-span-7">
                      {activeApproval ? (
                        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
                          {/* Banner to Switch Demo Roles to Easily Test Sequential flow */}
                          <div className="bg-blue-50/70 p-3 border-b border-blue-100">
                            <span className="font-bold text-blue-800 text-[9px] uppercase tracking-wider block mb-1">Interactive Simulation Controls</span>
                            <p className="text-[10px] text-slate-600 leading-normal mb-2">
                              Sequential approvals require signing off level-by-level. Change your acting committee role here to test the sequential validation flow instantly:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { role: "Procurement Manager", name: "Imran Khan" },
                                { role: "Director of Sourcing", name: "Farhan Rahman" },
                                { role: "Chief Financial Officer (CFO)", name: "Sajid Chowdhury" }
                              ].map((roleChoice) => {
                                const isActiveSim = actingRole === roleChoice.role;
                                return (
                                  <button
                                    key={roleChoice.role}
                                    onClick={() => {
                                      setActingRole(roleChoice.role);
                                      setActingName(roleChoice.name);
                                    }}
                                    className={`p-1.5 rounded border text-[9px] font-bold text-center transition ${
                                      isActiveSim 
                                        ? "bg-blue-600 border-blue-600 text-white shadow-xs" 
                                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    {roleChoice.name}
                                    <span className="block text-[8px] opacity-75 font-normal">{roleChoice.role}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* File title */}
                            <div>
                              <div className="flex gap-1.5 items-center">
                                <span className="font-mono text-xs font-bold text-slate-500">Approvals Control #{activeApproval.id}</span>
                                <span className="text-slate-300">|</span>
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                  activeApproval.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                  activeApproval.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  Status: {activeApproval.status}
                                </span>
                              </div>
                              <h2 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{activeApproval.title}</h2>
                              <div className="flex gap-4 text-xs text-slate-500 mt-2 font-mono">
                                <span>Filer: <strong className="text-slate-700">{activeApproval.requestedBy}</strong></span>
                                <span>Volume Scope: <strong className="text-slate-700">{activeApproval.amount || "N/A"}</strong></span>
                              </div>
                            </div>

                            {/* Sequential Approval Roadmap Timeline */}
                            <div>
                              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Sequential Committee Sign-off Timeline</h3>
                              <div className="space-y-3 relative border-l-2 border-slate-100 pl-4 py-1 ml-2">
                                {activeApproval.committee?.map((step, idx) => {
                                  const isStepApproved = step.status === "Approved";
                                  const isStepRejected = step.status === "Rejected";
                                  const isCurrentActiveStep = activeApproval.status === "Pending" && idx === activeApproval.currentLevel;
                                  const isLocked = idx > activeApproval.currentLevel && activeApproval.status === "Pending";

                                  return (
                                    <div key={idx} className="relative">
                                      {/* Outer Node bullet */}
                                      <div className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border font-black text-[8px] ${
                                        isStepApproved ? "bg-green-600 border-green-600 text-white" :
                                        isStepRejected ? "bg-red-650 border-red-650 text-white" :
                                        isCurrentActiveStep ? "bg-amber-500 border-amber-500 text-white animate-pulse" :
                                        "bg-slate-100 border-slate-350 text-slate-400"
                                      }`}>
                                        {isStepApproved ? "✓" : isStepRejected ? "✗" : idx + 1}
                                      </div>

                                      <div className={`p-2.5 rounded border transition-all ${
                                        isCurrentActiveStep 
                                          ? "bg-amber-50/40 border-amber-205 shadow-2xs" 
                                          : isLocked 
                                          ? "bg-slate-50/50 border-slate-100 text-slate-400" 
                                          : "bg-white border-slate-150"
                                      }`}>
                                        <div className="flex justify-between items-start gap-2">
                                          <div>
                                            <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-400 block">COMMITTEE LEVEL {idx + 1}</span>
                                            <span className="font-bold text-slate-800 text-[11px]">{step.role}</span>
                                            <span className="text-slate-500 font-medium ml-1">({step.name})</span>
                                          </div>
                                          <div>
                                            <span className={`px-2 py-0.5 rounded font-black text-[8.5px] uppercase ${
                                              isStepApproved ? "bg-green-50 text-green-700" :
                                              isStepRejected ? "bg-red-50 text-red-700" :
                                              isCurrentActiveStep ? "bg-amber-100 text-amber-800 animate-pulse" :
                                              "bg-slate-100 text-slate-400"
                                            }`}>
                                              {step.status}
                                            </span>
                                          </div>
                                        </div>

                                        {step.comment && (
                                          <div className="mt-1.5 p-1.5 rounded bg-slate-50 border border-slate-100 italic text-[10px] text-slate-650 relative">
                                            "{step.comment}"
                                            {step.date && <span className="block text-right text-[8px] font-mono font-bold text-slate-400 not-italic mt-1">— Reviewed at {step.date}</span>}
                                          </div>
                                        )}

                                        {/* Current Active Step Interactive signature controls */}
                                        {isCurrentActiveStep && (
                                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                                            {actingRole === step.role ? (
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-[10px] text-slate-600 font-medium">Verify credentials & add comment annotation:</span>
                                                  <span className="font-mono font-black text-blue-600 uppercase text-[8.5px]">Simulation Active</span>
                                                </div>
                                                <textarea
                                                  value={reviewComment}
                                                  onChange={(e) => setReviewComment(e.target.value)}
                                                  placeholder={`E.g., Approved based on standard group LC terms. Tolerances acceptable.`}
                                                  className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                                                  rows={2}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                  <button
                                                    onClick={async () => {
                                                      await handleSequentialApproval(activeApproval.id, idx, "Approved", reviewComment, actingName);
                                                      setReviewComment("");
                                                      setNotifications(prev => [
                                                        { id: Date.now(), text: `Sequential Approval: Signed off level ${idx + 1} for APP-${activeApproval.id}`, unread: true },
                                                        ...prev
                                                      ]);
                                                    }}
                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-750 text-white text-[9.5px] font-black uppercase rounded shadow-2xs"
                                                  >
                                                    Digitally Approve Step
                                                  </button>
                                                  <button
                                                    onClick={async () => {
                                                      await handleSequentialApproval(activeApproval.id, idx, "Rejected", reviewComment, actingName);
                                                      setReviewComment("");
                                                      setNotifications(prev => [
                                                        { id: Date.now(), text: `Sequential Approval: File APP-${activeApproval.id} rejected at level ${idx + 1}`, unread: true },
                                                        ...prev
                                                      ]);
                                                    }}
                                                    className="px-3 py-1.5 bg-red-650 hover:bg-red-750 text-white text-[9.5px] font-black uppercase rounded shadow-2xs"
                                                  >
                                                    Deny File
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="bg-amber-50 border border-amber-205 p-2 rounded text-[10px] text-amber-805 leading-normal">
                                                🔒 Signed profile mismatch. Access control demands authorization of <strong>{step.name} ({step.role})</strong>. Under simulation switcher above, choose {step.name} to sign off!
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Chronological Sourcing Logs */}
                            <div>
                              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b pb-1 border-slate-100">Audit Sourcing Comments Trail</h3>
                              {activeApproval.comments && activeApproval.comments.length > 0 ? (
                                <div className="space-y-2">
                                  {activeApproval.comments.map((comm, cidx) => (
                                    <div key={cidx} className="p-2 rounded bg-slate-50 border border-slate-150 text-[10px]">
                                      <div className="flex justify-between font-bold text-slate-700">
                                        <span>{comm.author} <span className="font-normal text-slate-500">({comm.role})</span></span>
                                        <span className={`px-1 rounded text-[8px] font-black uppercase ${
                                          comm.action === "Approved" ? "bg-green-150 text-green-800" :
                                          comm.action === "Rejected" ? "bg-red-150 text-red-800" :
                                          "bg-slate-200 text-slate-700"
                                        }`}>
                                          {comm.action}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-slate-600 italic">"{comm.text}"</p>
                                      <span className="block text-[8px] text-right font-mono text-slate-400 mt-1">{comm.timestamp}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic">No historical comments archived.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded p-8 text-center text-slate-400 italic">
                          Click any request on the left grid panel to unpack structural workflow.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 2. NOTICES OF AWARD (NOA) */}
              {approvalsSubTab === "noas" && (() => {
                const activeNoa = noas.find(n => n.id === selectedNoaId) || noas[0];
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: List of issued Award Notices */}
                    <div className="lg:col-span-4 space-y-3">
                      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Issued Notices of Award (NOA)</h3>
                        </div>
                        {noas.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 italic">No award notices issued yet. Complete a multi-level committee approval to spawn one!</div>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                            {noas.map((noa) => {
                              const isSelected = activeNoa?.id === noa.id;
                              return (
                                <div 
                                  key={noa.id}
                                  onClick={() => setSelectedNoaId(noa.id)}
                                  className={`p-3 text-[11px] cursor-pointer transition border-l-2 ${
                                    isSelected 
                                      ? "bg-slate-50/80 border-l-blue-600" 
                                      : "hover:bg-slate-50/40 border-l-transparent"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-mono font-bold text-slate-500">#{noa.id}</span>
                                    <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] uppercase ${
                                      noa.status === "Signed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                                    }`}>
                                      {noa.status}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 mt-1 leading-snug">{noa.rfqMaterial}</h4>
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                                    <span>Awardee: <strong className="text-slate-600">{noa.vendorName.substring(0, 15)}...</strong></span>
                                    <span className="text-slate-700 font-bold">{noa.amount}</span>
                                  </div>
                                  <span className="block text-[8.5px] text-slate-400 font-mono mt-1.5 text-right">Dated: {noa.issueDate}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: PDF Simulator Notice Paper */}
                    <div className="lg:col-span-8">
                      {activeNoa ? (
                        <div className="space-y-4">
                          {/* Corporate Stamped Paper */}
                          <div className="bg-white border-2 border-slate-350 p-6 sm:p-10 rounded shadow-md relative overflow-hidden font-serif leading-relaxed text-slate-800 text-xs select-none">
                            {/* Watermark Diagonal stamp */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06] select-none text-[85px] font-black font-sans uppercase rotate-[30deg]">
                              {activeNoa.status === "Signed" ? "CONFIRMED CONTRACT" : "OFFICIAL AWARD"}
                            </div>

                            {/* Letterhead Header */}
                            <div className="text-center font-sans tracking-tight border-b-2 border-slate-900 pb-4 mb-6">
                              <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xl mx-auto mb-1">SG</div>
                              <h1 className="text-base font-extrabold tracking-widest text-slate-900 uppercase">Standard Group Bangladesh Ltd</h1>
                              <p className="text-[9px] uppercase tracking-widest text-slate-500">Corporate Apparel Sourcing Headquarters</p>
                              <p className="text-[8px] text-slate-400 mt-0.5">Civil Center & Merchandising Block, Gazipur, Dhaka, Bangladesh</p>
                            </div>

                            {/* Document details block */}
                            <div className="flex justify-between font-mono text-[9px] text-slate-500 mb-6 border-b border-dashed pb-2">
                              <div>
                                <span>REF NO: <strong className="text-slate-700">SG/Sourcing/NOA/{activeNoa.id}</strong></span>
                                <span className="block">RFQ REF: <strong className="text-slate-700">{activeNoa.rfqId}</strong></span>
                              </div>
                              <div className="text-right">
                                <span>DATE: <strong className="text-slate-705">{activeNoa.issueDate}</strong></span>
                                <span className="block">STATUS: <strong className="text-slate-705">{activeNoa.status.toUpperCase()}</strong></span>
                              </div>
                            </div>

                            {/* Subject & Body */}
                            <div className="space-y-4 font-serif text-[11px] leading-relaxed">
                              <p className="font-sans font-extrabold text-xs text-slate-900 uppercase tracking-tight text-center">SUBJECT: NOTICE OF AWARD (NOA)</p>
                              <p>To,</p>
                              <p className="pl-4 font-sans font-black text-slate-900">{activeNoa.vendorName}</p>
                              <p className="pl-4 text-slate-500 font-mono text-[9px] -mt-2">Authorized Manufacturing Unit & Supplier Hub</p>

                              <p className="indent-8 text-justify mt-4">
                                Pinpointed by standard competitive tendering and formal sequential evaluation by standard Standard Group Apparel Sourcing Commitee, we are pleased to inform you that your bid Proposal totaling <strong className="font-sans font-bold text-slate-900">{activeNoa.amount}</strong> has been officially approved. Standard Group hereby issues this <strong>NOTICE OF AWARD (NOA)</strong> for structural sourcing corresponding to procurement category of <strong className="font-serif italic text-slate-950">"{activeNoa.rfqMaterial}"</strong> with specified capacity bound of <strong>{activeNoa.rfqQty}</strong>.
                              </p>

                              <p className="indent-8 text-indent">
                                You are hereby requested to accept this Notice of Award to convert this nomination into a legally binding supply purchase agreement. Standard terms demand compliance validation, letter of credit execution, and strict adherence to structural QC guidelines specified by standard Standard Group Merchandising Blocks.
                              </p>

                              <p className="text-justify">
                                Failure to accept this notification within 7 bank days from receipt may result in tender cancellation and redistribution to secondary registered mills. Standard Group holds all proprietary discretion.
                              </p>

                              {/* Signatures */}
                              <div className="grid grid-cols-2 pt-10 gap-10">
                                <div>
                                  <span className="text-[9px] font-mono text-slate-400 block border-b border-slate-350 pb-1 uppercase">ISSUING REPRESENTATIVE</span>
                                  <div className="h-8 mt-2 flex items-end pl-2">
                                    <span className="font-sans font-bold text-blue-700 italic text-[11px] border-b-2 border-blue-600/30">Lutfor Rahman</span>
                                  </div>
                                  <span className="block text-[9px] font-sans font-bold text-slate-700 mt-1">Lutfor Rahman (Sourcing VP)</span>
                                  <span className="block text-[8px] text-slate-500 font-mono">Standard Group Sourcing Committee</span>
                                </div>

                                <div>
                                  <span className="text-[9px] font-mono text-slate-400 block border-b border-slate-350 pb-1 uppercase">ACCEPTED & SIGNED BY</span>
                                  <div className="h-8 mt-2 flex items-end pl-2">
                                    {activeNoa.status === "Signed" ? (
                                      <div className="text-[10px] text-green-700 italic font-bold">
                                        Signed Electronically ✓
                                        <span className="block text-[7px] font-mono font-normal text-slate-500">{activeNoa.esignatureSim?.timestamp}</span>
                                      </div>
                                    ) : (
                                      <span className="text-[9.5px] italic text-slate-400 italic">Pending Vendor Sign-off</span>
                                    )}
                                  </div>
                                  <span className="block text-[9px] font-sans font-bold text-slate-700 mt-1">
                                    {activeNoa.status === "Signed" ? activeNoa?.esignatureSim?.signedBy : "Mill Supply Partner"}
                                  </span>
                                  <span className="block text-[8px] text-slate-500 font-mono">Authorized Corporate Signatory</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Control Action buttons */}
                          <div className="flex justify-end gap-3 bg-white border border-slate-200 p-3 rounded shadow-2xs">
                            {activeNoa.status === "Pending Signature" ? (
                              <button
                                onClick={async () => {
                                  await acceptNoaAndPrepareContract(activeNoa.id);
                                  setNotifications(prev => [
                                    { id: Date.now(), text: `Officially converted NOA-${activeNoa.id} into a formal Purchase Agreement/Contract`, unread: true },
                                    ...prev
                                  ]);
                                  setApprovalsSubTab("contracts");
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-black uppercase text-[10px] tracking-wider rounded shadow-xs"
                              >
                                Accept & Convert to Purchase PO/Contract Agreement
                              </button>
                            ) : (
                              <div className="flex gap-2 items-center text-xs text-green-750 font-bold">
                                <span>This Notice of Award has been signed. Formal PO contract generated!</span>
                                <button
                                  onClick={() => { setApprovalsSubTab("contracts"); }}
                                  className="px-2.5 py-1 bg-slate-900 text-white font-mono uppercase text-[9px] rounded hover:bg-slate-800"
                                >
                                  Go to Trade Contracts →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded p-8 text-center text-slate-400 italic">
                          Click any Notice of Award on the left panel to display corporate stamped paper.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 3. PURCHASING CONTRACTS / POS */}
              {approvalsSubTab === "contracts" && (() => {
                const activeContract = contracts.find(c => c.id === selectedContractId) || contracts[0];
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: Contracts Grid */}
                    <div className="lg:col-span-4 space-y-3">
                      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Garments Sourcing Trade Agreements</h3>
                        </div>
                        {contracts.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 italic">No agreements drafted yet. Fully sign off an award notice to spawn a purchasing contract!</div>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                            {contracts.map((c) => {
                              const isSelected = activeContract?.id === c.id;
                              return (
                                <div 
                                  key={c.id}
                                  onClick={() => setSelectedContractId(c.id)}
                                  className={`p-3 text-[11px] cursor-pointer transition border-l-2 ${
                                    isSelected 
                                      ? "bg-slate-50/80 border-l-blue-600" 
                                      : "hover:bg-slate-50/40 border-l-transparent"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-mono font-bold text-slate-600">{c.contractNo}</span>
                                    <span className={`px-1.5 py-0.5 rounded font-black text-[7.5px] uppercase tracking-wide ${
                                      c.status === "Active" ? "bg-emerald-50 text-emerald-800" :
                                      c.status === "Draft" ? "bg-slate-100 text-slate-600 font-extrabold italic" :
                                      "bg-blue-50 text-blue-800"
                                    }`}>
                                      {c.status}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-slate-850 mt-1 leading-snug">{c.material}</h4>
                                  <p className="text-[10px] text-slate-500 mt-1">Vendor: <strong className="text-slate-700">{c.vendorName}</strong></p>
                                  <div className="flex justify-between items-center text-[10px] text-slate-600 mt-2 font-mono border-t border-slate-100 pt-1">
                                    <span>Date Drafted: {c.createdAt}</span>
                                    <span className="font-bold text-slate-800">{c.amount}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Formal Supply Contract & Sign Panel */}
                    <div className="lg:col-span-8">
                      {activeContract ? (
                        <div className="space-y-4">
                          <div className="p-6 bg-white border border-slate-200 rounded shadow-xs relative">
                            {/* Watermark */}
                            {activeContract.status === "Active" && (
                              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none text-[80px] font-black font-sans uppercase text-green-700 select-none rotate-12">
                                SIGNED ACTIVE
                              </div>
                            )}

                            <h3 className="font-sans font-black text-xs text-slate-900 border-b pb-2 uppercase tracking-tight">STANDARD APPAREL PROCUREMENT PURCHASE CONTRACT</h3>
                            
                            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500 my-3 bg-slate-50 p-2.5 rounded border border-slate-150/40">
                              <div>
                                <span className="block">CONTRACT REF: <strong className="text-slate-800">{activeContract.contractNo}</strong></span>
                                <span className="block">CATEGORY ITEM: <strong className="text-slate-800">{activeContract.material}</strong></span>
                              </div>
                              <div className="text-right">
                                <span className="block">TOTAL VOLUME: <strong className="text-slate-800">{activeContract.quantity}</strong></span>
                                <span className="block">TOTAL SUM: <strong className="text-slate-800">{activeContract.amount}</strong></span>
                              </div>
                            </div>

                            {/* Terms of Supply */}
                            <div className="space-y-3 mt-4 text-[11px] text-slate-705 leading-relaxed font-sans">
                              <p>
                                This Garment Manufacturing Sourcing Contract (referred into herein as <strong>PO-Agreement</strong>) is agreed and executed by the standard authorized parties:
                              </p>
                              
                              <p className="pl-3 py-1 bg-slate-50/50 border-l-2 border-slate-400 text-slate-700">
                                <strong>Buyer Representative:</strong> Standard Group Bangladesh Ltd, Dhaka Headquarters.<br />
                                <strong>Manufacturing Supplier:</strong> {activeContract.vendorName}.
                              </p>

                              <p className="font-bold text-slate-900 text-[10px] uppercase tracking-wide mt-3 border-b border-dashed pb-0.5">CONTRACT CLAUSES & BUSINESS TERMS</p>
                              
                              {/* Terms TextArea wrapper */}
                              <div className="whitespace-pre-wrap bg-slate-50/30 p-3 rounded border border-slate-205 font-mono text-[10px] leading-normal text-slate-650 max-h-[180px] overflow-y-auto font-sans">
                                {activeContract.terms}
                              </div>

                              <p className="mt-4">
                                Both signatory parties confirm absolute validation of standard Bangladesh Garments Manufacturing guidelines, letter of credits rules and chemical sustainability standards.
                              </p>
                            </div>

                            {/* E-Signature Interface Blocks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 pt-6 gap-4 border-t mt-5 border-slate-150">
                              {/* Buyer Signature Panel */}
                              <div className="p-3 bg-slate-50/50 border border-slate-200 rounded">
                                <span className="font-black text-[9px] uppercase tracking-wider text-slate-400 block mb-2">BUYER SIGNATORY (STANDARD GROUP)</span>
                                {activeContract.esignatureSim?.buyerSigned ? (
                                  <div className="text-xs text-green-750 space-y-1.5 font-sans">
                                    <div className="flex items-center gap-1.5 font-bold">
                                      <span className="w-4 h-4 rounded-full bg-green-150 flex items-center justify-center text-[10px]">✓</span>
                                      Signed digitally
                                    </div>
                                    <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded border leading-tight">
                                      Signee: <strong>{activeContract.esignatureSim.buyerSignName}</strong><br />
                                      IP Address: <span className="font-mono text-[9px]">{activeContract.esignatureSim.buyerSignIp}</span><br />
                                      Timestamp: <span className="font-mono text-[9px]">{activeContract.esignatureSim.buyerSignedAt}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <span className="text-[9.5px] text-slate-500 block">Type authorized Buyer name to e-Sign:</span>
                                    <input
                                      type="text"
                                      id="buyer-esign-name"
                                      placeholder="Lutfor Rahman (VP Sourcing)"
                                      className="w-full p-1.5 text-xs bg-white border rounded border-slate-350 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => {
                                        const nameEl = document.getElementById("buyer-esign-name") as HTMLInputElement;
                                        const val = nameEl?.value || "Lutfor Rahman (Sourcing VP)";
                                        eSignContractBuyer(activeContract.id, val);
                                        setNotifications(prev => [
                                          { id: Date.now(), text: `Standard Group Representative digitally signed Contract ${activeContract.contractNo}`, unread: true },
                                          ...prev
                                        ]);
                                      }}
                                      className="w-full py-1.5 bg-blue-600 text-white font-extrabold uppercase text-[9px] rounded hover:bg-blue-750 transition shadow-2xs"
                                    >
                                      Apply digital Buyer E-Sign
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Supplier Signature Panel */}
                              <div className="p-3 bg-slate-50/50 border border-slate-200 rounded">
                                <span className="font-black text-[9px] uppercase tracking-wider text-slate-400 block mb-2">SELLER SIGNATORY (SUPPLIER HUB)</span>
                                {activeContract.esignatureSim?.vendorSigned ? (
                                  <div className="text-xs text-green-750 space-y-1.5 font-sans">
                                    <div className="flex items-center gap-1.5 font-bold">
                                      <span className="w-4 h-4 rounded-full bg-green-150 flex items-center justify-center text-[10px]">✓</span>
                                      Signed digitally
                                    </div>
                                    <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded border leading-tight">
                                      Signee: <strong>{activeContract.esignatureSim.vendorSignName}</strong><br />
                                      IP Address: <span className="font-mono text-[9px]">{activeContract.esignatureSim.vendorSignIp}</span><br />
                                      Timestamp: <span className="font-mono text-[9px]">{activeContract.esignatureSim.vendorSignedAt}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <span className="text-[9.5px] text-slate-500 block">Type Supplier representative name to e-Sign:</span>
                                    <input
                                      type="text"
                                      id="vendor-esign-name"
                                      placeholder="Aminul Islam (Supplier Authorized)"
                                      className="w-full p-1.5 text-xs bg-white border rounded border-slate-350 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => {
                                        const nameEl = document.getElementById("vendor-esign-name") as HTMLInputElement;
                                        const val = nameEl?.value || "Aminul Islam (Supplier authorized rep)";
                                        eSignContractVendor(activeContract.id, val);
                                        setNotifications(prev => [
                                          { id: Date.now(), text: `Seller Rep signed trade contract agreement ${activeContract.contractNo}`, unread: true },
                                          ...prev
                                        ]);
                                      }}
                                      className="w-full py-1.5 bg-blue-600 text-white font-extrabold uppercase text-[9px] rounded hover:bg-blue-750 transition shadow-2xs"
                                    >
                                      Apply digital Seller E-Sign
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Active Banner */}
                          {activeContract.status === "Active" && (
                            <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded text-xs text-emerald-800 leading-normal font-sans shadow-2xs">
                              <h4 className="font-extrabold text-sm text-emerald-900 border-b pb-1 mb-1 uppercase tracking-tight">🎉 CONTRACT IS ACTIVE & LEGALLY BINDING</h4>
                              <p className="font-medium">
                                Standard Group's procurement system has automatically processed this active contract. The following downstream actions are complete:
                              </p>
                              <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-[10px]">
                                <li>Registered Supply Contract: <strong className="text-slate-800">{activeContract.contractNo}</strong></li>
                                <li>RFQ Category status successfully set to: <strong className="text-emerald-900 uppercase">Completed</strong></li>
                                <li>Automatically issued a production **Work Order** to local team in Gazipur!</li>
                              </ul>
                              <div className="mt-3">
                                <button
                                  onClick={() => setActiveTab("orders")}
                                  className="px-3 py-1 bg-emerald-700 text-white font-mono uppercase text-[9px] rounded hover:bg-emerald-600 transition"
                                >
                                  Go to Work Orders Panel →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded p-8 text-center text-slate-400 italic">
                          Click any Sourcing contract on the left list to review trade terms.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* WORK ORDERS TAB VIEW */}
          {activeTab === "orders" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Active Work Orders</h1>
                  <p className="text-xs text-slate-500">Track raw-material yarns, dyes, and trim production timelines at awarded mills.</p>
                </div>
                <button 
                  onClick={() => setShowAddWO(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold text-[10px] uppercase flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Issue Work Order
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="bg-white border border-slate-200 rounded p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-mono text-[9px] text-slate-400 block">WO ID: {wo.id}</span>
                          <h3 className="font-bold text-slate-800 text-xs mt-0.5">{wo.material}</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          wo.status === "In Production" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {wo.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-500 text-[11px] my-3">
                        <div className="flex justify-between border-b border-slate-50 py-1">
                          <span>Awarded Mill:</span>
                          <span className="font-medium text-slate-700">{wo.vendorName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1">
                          <span>Target Quantity:</span>
                          <span className="font-medium text-slate-700 font-mono">{wo.quantity}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 py-1">
                          <span>Timeline Span:</span>
                          <span className="font-medium text-slate-700 font-mono">{wo.startDate} to {wo.endDate}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>QC Inspection Status:</span>
                          <span className={`font-semibold ${
                            wo.qcStatus === "QC Passed" ? "text-green-600" :
                            wo.qcStatus === "QC Failed" ? "text-red-600" : "text-amber-600 animate-pulse"
                          }`}>
                            ○ {wo.qcStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-50 pt-3 mt-1">
                      {wo.qcStatus === "Pending" && (
                        <button 
                          onClick={() => {
                            setSelectedWoForQc(wo.id);
                            setShowAddQC(true);
                          }}
                          className="flex-1 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-[10px] font-bold uppercase tracking-wider"
                        >
                          Trigger QC Inspection
                        </button>
                      )}
                      <button 
                        onClick={() => alert(`Showing tracking log for Order ${wo.id} `)}
                        className="py-1.5 px-3 bg-slate-100 border border-slate-200 rounded text-slate-700 hover:bg-slate-200 font-bold uppercase text-[10px]"
                      >
                        Track Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INSPECTIONS TAB VIEW - Advanced Fabric Quality & Lot Auditing Portal */}
          {activeTab === "inspection" && (
            <div className="space-y-6">
              {/* Header block with statistics indicator */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 border-slate-200 gap-4">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Fabric Quality Inspections (AQL 4-Point System)</h1>
                  <p className="text-xs text-slate-500">Document fabric weight (GSM), color tones, shrinkage ratings, and yarn defect counts in real-time.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setShowAddQC(true)}
                    className="flex-1 md:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Log Physical Lot Audit
                  </button>
                </div>
              </div>

              {/* Quality KPIs Bento Box Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Lots Audited</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1 font-mono">{inspections.length} Lots</p>
                </div>
                <div className="bg-green-50/50 p-3 border border-green-200/60 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Passed Lots</p>
                  <p className="text-xl font-extrabold text-green-700 mt-1 font-mono">
                    {inspections.filter(i => i.status === "Passed").length} Lots
                  </p>
                </div>
                <div className="bg-amber-50/50 p-3 border border-amber-200/60 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Quarantine / Hold</p>
                  <p className="text-xl font-extrabold text-amber-700 mt-1 font-mono">
                    {inspections.filter(i => i.status === "Hold").length} Lots
                  </p>
                </div>
                <div className="bg-red-50/50 p-3 border border-red-200/60 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Rejected / Failed</p>
                  <p className="text-xl font-extrabold text-red-700 mt-1 font-mono">
                    {inspections.filter(i => i.status === "Failed").length} Lots
                  </p>
                </div>
              </div>

              {/* Advanced Auditing Card Grid with search and filter checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspections.map((insp) => {
                  const details = (insp as any).details || {
                    gsm: 180,
                    color: "Navy Blue Grade-A",
                    sampleSize: 80,
                    defectsCount: 1,
                    aqlStandard: "1.5",
                    photoUrl: ""
                  };

                  const limits = getAqlLimits(details.sampleSize || 80, details.aqlStandard || "1.5");

                  return (
                    <motion.div 
                      key={insp.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                    >
                      {/* Card Header Status Indicator */}
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Lot Audit ID #{insp.id}</span>
                          <h3 className="font-extrabold text-slate-800 text-xs mt-0.5 max-w-[150px] truncate">{insp.material}</h3>
                          <span className="text-[10px] font-medium text-slate-500 font-mono block mt-0.5">WO Reference: #{insp.orderId}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs ${
                          insp.status === "Passed" 
                            ? "bg-green-600 text-white" 
                            : insp.status === "Hold" 
                            ? "bg-amber-500 text-white" 
                            : "bg-red-600 text-white"
                        }`}>
                          {insp.status === "Passed" ? "Passed" : insp.status === "Hold" ? "Active Hold" : "Rejected"}
                        </span>
                      </div>

                      {/* Diagnostic Parameters Area */}
                      <div className="p-4 space-y-3 flex-1">
                        <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Inspected Weight</span>
                            <span className="font-bold text-slate-700 font-mono mt-0.5 block">{details.gsm || 180} GSM (g/m²)</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Fabric Shade Lot</span>
                            <span className="font-bold text-slate-700 mt-0.5 block truncate">{details.color || "Standard"}</span>
                          </div>
                        </div>

                        {/* Interactive AQL statistics logs */}
                        <div className="bg-slate-50 p-2.5 rounded text-[10px] space-y-1">
                          <p className="font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/50 pb-1 flex items-center justify-between">
                            <span>AQL Standard: {details.aqlStandard || "1.5"}%</span>
                            <span className="text-[9px] text-slate-400">Sample Size: {details.sampleSize || 80} pcs</span>
                          </p>
                          <div className="flex justify-between items-center text-[10px] pt-1">
                            <span>Defects: <strong className="font-bold text-red-600">{details.defectsCount || 0}</strong> pcs</span>
                            <span className="text-[9px] text-slate-500">Allowed: &le; {limits.ac} to Pass</span>
                          </div>
                        </div>

                        {/* Findings notes */}
                        <div className="text-[11px] leading-relaxed italic text-slate-500 border-l-2 border-slate-200 pl-2 py-0.5 bg-slate-50/20">
                          "{insp.findings}"
                        </div>
                      </div>

                      {/* Diagnostic Photo / Illustration Base64 Viewer */}
                      {details.photoUrl ? (
                        <div 
                          onClick={() => setActiveQcPhotoSrc(details.photoUrl)}
                          className="relative h-28 bg-slate-900 overflow-hidden cursor-crosshair group"
                        >
                          <img 
                            src={details.photoUrl} 
                            alt="Fabric anomaly preview" 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent flex items-end justify-between p-2">
                            <span className="text-[9px] font-mono text-slate-200 bg-slate-900/60 px-1.5 py-0.5 rounded">Click to Zoom Diagnostic</span>
                            <Upload className="w-3.5 h-3.5 text-white animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50/50 p-3.5 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[9px] uppercase tracking-wide">
                            <Check className="w-3.5 h-3.5 text-green-500" />
                            <span>Standard Checked &bull; No Anomaly</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-300">AQL System Auth</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Lightbox Diagnostic Popup modal */}
              {activeQcPhotoSrc && (
                <div 
                  className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 cursor-zoom-out"
                  onClick={() => setActiveQcPhotoSrc(null)}
                >
                  <div className="relative max-w-3xl w-full flex flex-col items-center gap-3">
                    <button 
                      onClick={() => setActiveQcPhotoSrc(null)}
                      className="absolute -top-10 right-0 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 shadow"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img 
                      src={activeQcPhotoSrc} 
                      alt="Zoomed Diagnostic" 
                      className="max-h-[80vh] w-auto rounded border-2 border-slate-800 shadow-2xl object-contain bg-slate-900" 
                    />
                    <p className="text-white text-[11px] font-mono bg-slate-900/80 px-3 py-1 rounded">
                      Apparel Fabric Thread Anomaly &bull; Standard Calibration 1:1
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS & INVOICES TAB VIEW - Financial 3-Way Match & Sequential Multi-Level Approvals */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              {/* Header with active role indicator */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 border-slate-200 gap-4">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Payments, Supplier Invoices & 3-Way Audits</h1>
                  <p className="text-xs text-slate-500">Initiate payouts, match invoice billing against PO contracts, and run Level 1 / 2 / 3 approvals.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Persona Authority:</span>
                  <div className="px-3 py-1 bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-wider rounded font-mono">
                    {profile === "Merchandiser" ? "Merchandiser (L1 Scout)" : profile === "Manager" ? "Sourcing Mgr: Imran Khan (L2 Auth)" : "CFO: Sajid Chowdhury (L3 Payer)"}
                  </div>
                  <button 
                    onClick={() => setShowAddPayment(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded shadow-md hover:shadow-lg transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Invoice
                  </button>
                </div>
              </div>

              {/* Payment KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Invoice Liability</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1 font-mono">
                    ${payments.reduce((acc, p) => acc + (parseFloat(p.invoiceAmount.replace(/[^0-9.]/g, "")) || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-amber-50/40 p-3 border border-amber-200/60 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-sans">Pending Sign-off</p>
                  <p className="text-xl font-extrabold text-amber-700 mt-1 font-mono">
                    {payments.filter(p => p.status.startsWith("Pending")).length} Invoices
                  </p>
                </div>
                <div className="bg-blue-50/40 p-3 border border-blue-200/60 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">3-Way Match Clearance</p>
                  <p className="text-xl font-extrabold text-blue-700 mt-1 font-mono">
                    {payments.filter(p => p.matchedStatus === "Fully Matched").length} Lots Matched
                  </p>
                </div>
                <div className="bg-green-50/40 p-3 border border-green-200/60 rounded-md shadow-2xs">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Approved &amp; Disbursed</p>
                  <p className="text-xl font-extrabold text-green-700 mt-1 font-mono">
                    ${payments.filter(p => p.status === "Completed").reduce((acc, p) => acc + (parseFloat(p.invoiceAmount.replace(/[^0-9.]/g, "")) || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Core Ledger Table / 3-Way Match Matrix */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider">Historical General Payments Registry & Multi-level Timelines</span>
                  <span className="text-[9px] font-bold text-slate-400">Strict Row-Level Security Isolan Active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/60 font-medium border-b border-slate-200">
                      <tr>
                        <th className="p-3 text-[10px] text-slate-400 uppercase tracking-wider">Invoice ID / Vendor</th>
                        <th className="p-3 text-[10px] text-slate-400 uppercase tracking-wider">Contract WO</th>
                        <th className="p-3 text-[10px] text-slate-400 uppercase tracking-wider">3-Way Alignment (PO vs Invoice)</th>
                        <th className="p-3 text-[10px] text-slate-400 uppercase tracking-wider">Delivery QC Quality Check</th>
                        <th className="p-3 text-[10px] text-slate-400 uppercase tracking-wider">Approval Process Sequencies</th>
                        <th className="p-3 text-[10px] text-slate-400 uppercase tracking-wider text-right">Status Action Portal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {payments.map((p) => {
                        // Find matching work order
                        const matchedWO = workOrders.find(w => w.id === p.orderId);
                        // Find quality check
                        const matchedInspection = inspections.find(i => i.orderId === p.orderId);

                        const invoiceVal = parseFloat(p.invoiceAmount.replace(/[^0-9.]/g, "")) || 0;
                        const poVal = parseFloat(p.poAmount.replace(/[^0-9.]/g, "")) || 0;
                        const varianceAmt = invoiceVal - poVal;

                        // Identify matching status
                        let rulesMatchClass = "bg-green-50 text-green-700 border-green-150";
                        let rulesMatchText = "3-Way Match Verified";

                        if (Math.abs(varianceAmt) > 1) {
                          rulesMatchClass = "bg-red-50 text-red-700 border-red-150";
                          rulesMatchText = `Pricing Variance: $${varianceAmt > 0 ? "+" : ""}${varianceAmt.toLocaleString()}`;
                        } else if (matchedInspection && matchedInspection.status !== "Passed") {
                          rulesMatchClass = "bg-amber-50 text-amber-700 border-amber-150";
                          rulesMatchText = `QC Clearance Lock: ${matchedInspection.status}`;
                        }

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/65 transition border-b border-slate-100">
                            {/* Invoice ID / Vendor */}
                            <td className="p-3">
                              <span className="font-mono font-bold text-slate-600 block">#{p.invoiceId}</span>
                              <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">{p.vendorName}</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Due: {p.dueDate}</span>
                            </td>

                            {/* WO Referral */}
                            <td className="p-3">
                              <span className="font-mono font-bold text-blue-600">#{p.orderId}</span>
                              <span className="text-[9px] text-slate-500 block mt-0.5 italic">"{matchedWO ? matchedWO.material.slice(0, 25) : "Apparel Goods"}..."</span>
                            </td>

                            {/* 3-Way Match Calculation */}
                            <td className="p-3 space-y-1">
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-slate-400 font-medium">Billed: <strong className="text-slate-700">{p.invoiceAmount}</strong></span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400 font-medium font-sans">PO Cap: <strong className="text-slate-700">{p.poAmount}</strong></span>
                              </div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] border font-black uppercase ${rulesMatchClass}`}>
                                {rulesMatchText}
                              </span>
                            </td>

                            {/* Fabric Delivery QC Validation */}
                            <td className="p-3">
                              {matchedInspection ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${
                                      matchedInspection.status === "Passed" 
                                        ? "bg-green-500 animate-pulse" 
                                        : matchedInspection.status === "Hold" 
                                        ? "bg-amber-500" 
                                        : "bg-red-500"
                                    }`} />
                                    <span className="font-bold text-slate-700">Lot QC: {matchedInspection.status}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 italic">Defect: {matchedInspection.defectRate || "1.2"}%</p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="text-[10px]">No Inspection Logged</span>
                                </div>
                              )}
                            </td>

                            {/* Sequential Approval timeline flow */}
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {/* L1 */}
                                <div className="flex flex-col text-center">
                                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">L1 Lead</span>
                                  <span className={`mt-1 text-[9px] px-1 py-0.5 rounded font-black font-mono border ${
                                    p.approvals.level1?.status === "Approved" 
                                      ? "bg-green-100 text-green-700 border-green-200" 
                                      : p.approvals.level1?.status === "Rejected"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                  }`}>
                                    {p.approvals.level1?.status || "Pending"}
                                  </span>
                                  {p.approvals.level1?.approvedAt && (
                                    <span className="text-[7px] text-slate-400 mt-0.5 font-mono">{p.approvals.level1.approvedAt.split(" ")[0]}</span>
                                  )}
                                </div>

                                <ChevronRight className="w-3 h-3 text-slate-300" />

                                {/* L2 */}
                                <div className="flex flex-col text-center">
                                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">L2 Manager</span>
                                  <span className={`mt-1 text-[9px] px-1 py-0.5 rounded font-black font-mono border ${
                                    p.approvals.level2?.status === "Approved" 
                                      ? "bg-green-100 text-green-700 border-green-200" 
                                      : p.approvals.level2?.status === "Rejected"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                  }`}>
                                    {p.approvals.level2?.status || "Pending"}
                                  </span>
                                  {p.approvals.level2?.approvedAt && (
                                    <span className="text-[7px] text-slate-400 mt-0.5 font-mono">{p.approvals.level2.approvedAt.split(" ")[0]}</span>
                                  )}
                                </div>

                                <ChevronRight className="w-3 h-3 text-slate-300" />

                                {/* L3 */}
                                <div className="flex flex-col text-center">
                                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">L3 CFO</span>
                                  <span className={`mt-1 text-[9px] px-1 py-0.5 rounded font-black font-mono border ${
                                    p.approvals.level3?.status === "Approved" 
                                      ? "bg-green-100 text-green-700 border-green-200" 
                                      : p.approvals.level3?.status === "Rejected"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                  }`}>
                                    {p.approvals.level3?.status || "Pending"}
                                  </span>
                                  {p.approvals.level3?.approvedAt && (
                                    <span className="text-[7px] text-slate-400 mt-0.5 font-mono">{p.approvals.level3.approvedAt.split(" ")[0]}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Active status & Actions buttons based on standard pipeline */}
                            <td className="p-3 text-right">
                              <div className="space-y-1.5 inline-block">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                  p.status === "Completed" 
                                    ? "bg-green-600 text-white shadow-xs" 
                                    : p.status === "Rejected"
                                    ? "bg-red-600 text-white shadow-xs"
                                    : "bg-amber-500 text-white shadow-xs"
                                }`}>
                                  {p.status}
                                </span>

                                {/* Sequential approval authorization controls */}
                                <div className="flex gap-1 justify-end">
                                  {/* Level 1 buttons */}
                                  {(p.approvals.level1?.status || "Pending") === "Pending" && profile === "Merchandiser" && (
                                    <>
                                      <button 
                                        onClick={() => handlePaymentApproval(p.id, 1, "Approved", "Merchandiser Approved L1")}
                                        className="px-1.5 py-0.5 bg-green-600 text-white font-mono uppercase text-[8px] rounded font-extrabold"
                                      >
                                        L1 Agree
                                      </button>
                                      <button 
                                        onClick={() => handlePaymentApproval(p.id, 1, "Rejected", "L1 Dispute Raise")}
                                        className="px-1.5 py-0.5 bg-red-600 text-white font-mono uppercase text-[8px] rounded font-extrabold"
                                      >
                                        L1 Flag
                                      </button>
                                    </>
                                  )}

                                  {/* Level 2 buttons (Only available if L1 approved) */}
                                  {p.approvals.level1?.status === "Approved" && (p.approvals.level2?.status || "Pending") === "Pending" && profile === "Manager" && (
                                    <>
                                      <button 
                                        onClick={() => handlePaymentApproval(p.id, 2, "Approved", "Manager Approved L2")}
                                        className="px-1.5 py-0.5 bg-green-600 text-white font-mono uppercase text-[8px] rounded font-extrabold"
                                      >
                                        L2 Approve
                                      </button>
                                      <button 
                                        onClick={() => handlePaymentApproval(p.id, 2, "Rejected", "L2 Manager Rejected")}
                                        className="px-1.5 py-0.5 bg-red-600 text-white font-mono uppercase text-[8px] rounded font-extrabold"
                                      >
                                        L2 Reject
                                      </button>
                                    </>
                                  )}

                                  {/* Level 3 buttons (Only available if L2 approved) */}
                                  {p.approvals.level2?.status === "Approved" && (p.approvals.level3?.status || "Pending") === "Pending" && profile === "Finance" && (
                                    <>
                                      <button 
                                        onClick={() => handlePaymentApproval(p.id, 3, "Approved", "CFO Disbursed Payout L3")}
                                        className="px-1.5 py-0.5 bg-green-600 text-white font-mono uppercase text-[8px] rounded font-extrabold animate-bounce"
                                      >
                                        Disburse funds
                                      </button>
                                      <button 
                                        onClick={() => handlePaymentApproval(p.id, 3, "Rejected", "CFO Hold payout")}
                                        className="px-1.5 py-0.5 bg-red-600 text-white font-mono uppercase text-[8px] rounded font-extrabold"
                                      >
                                        Hold funds
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROCUREMENT TIMELINE WEB PLAN VIEW */}
          {activeTab === "plan" && (
            <div className="space-y-6 text-left">
              {/* Header metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                  <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase tracking-wide">
                    <span>{lang === "BN" ? "সক্রিয় মৌসুম পরিকল্পনা" : "Active Season Plans"}</span>
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{procurementPlans.length}</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === "BN" ? "মৌসুমী উৎপাদন বাজেট এবং সরবরাহ" : "Seasonal manufacturing allocation grids"}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                  <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase tracking-wide">
                    <span>{lang === "BN" ? "মোট বরাদ্দকৃত বাজেট" : "Gross Allocated Budget"}</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ${procurementPlans.reduce((sum, p) => sum + (parseFloat(p.budget.replace(/[^0-9.]/g, "")) || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === "BN" ? "৪টি সক্রিয় অর্থায়িত প্রকল্পের সারসংক্ষেপ" : "Summary of active funded garment lines"}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                  <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase tracking-wide">
                    <span>{lang === "BN" ? "মোট পূর্বাভাসের পরিমাণ" : "Gross Forecasted Qty"}</span>
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {procurementPlans.reduce((sum, p) => sum + (parseFloat(p.quantity.replace(/[^0-9.]/g, "")) || 0), 0).toLocaleString()} Kg/Yds
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === "BN" ? "মাসিক চাহিদা বন্টন ও শিডিউল" : "Monthly demand splits & delivery triggers"}
                  </p>
                </div>
              </div>

              {/* Toggle Splicing Controls */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h1 className="text-base font-bold text-slate-900">
                    {lang === "BN" ? "মৌসুমী ক্রয় পরিকল্পনা ও প্রক্ষেপণ" : "Procurement Planning & Monthly Forecasting"}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lang === "BN" 
                      ? "উৎপাদন সুতা এবং অনুষঙ্গির মাসিক বাজেট ভাগ এবং প্রক্ষেপণ ম্যাট্রিক্স পরিচালনা করুন।" 
                      : "Schedule factory component needs, adjust monthly spending splits, and visualize forward pipelines."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-0.5 rounded flex text-[10px] font-bold border border-slate-200">
                    <button 
                      onClick={() => setForecastViewMode("table")}
                      className={`px-3 py-1 rounded transition ${forecastViewMode === "table" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500"}`}
                    >
                      {lang === "BN" ? "রৈখিক তালিকা" : "Timeline Grid"}
                    </button>
                    <button 
                      onClick={() => setForecastViewMode("forecast")}
                      className={`px-3 py-1 rounded transition ${forecastViewMode === "forecast" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500"}`}
                    >
                      {lang === "BN" ? "মাসিক প্রক্ষেপণ চার্ট" : "Monthly Spend Projection"}
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowAddPlan(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] uppercase flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> 
                    {lang === "BN" ? "মৌসুম পরিকল্পনা বুকিং" : "Book Season Plan"}
                  </button>
                </div>
              </div>

              {/* VIEW 1: TRADITIONAL GRID WITH FORECAST TRIGGERS */}
              {forecastViewMode === "table" && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-3xs overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Plan ID</th>
                        <th className="p-3">Raw Material / Component</th>
                        <th className="p-3">Bulk Target Qty</th>
                        <th className="p-3">Estimated Budget</th>
                        <th className="p-3">Monthly Forecast Spread</th>
                        <th className="p-3">Required Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {procurementPlans.map((pln) => {
                        const totalAllocated = pln.monthlyForecast?.reduce((sum, f) => sum + f.budget, 0) || 0;
                        const planBudgetNum = parseFloat(pln.budget.replace(/[^0-9.]/g, "")) || 0;
                        
                        return (
                          <tr key={pln.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 font-mono font-bold text-blue-600">#{pln.id}</td>
                            <td className="p-3 font-bold text-slate-800">{pln.itemName}</td>
                            <td className="p-3 font-mono font-bold">{pln.quantity}</td>
                            <td className="p-3 font-mono font-black text-slate-900">{pln.budget}</td>
                            <td className="p-3 select-none">
                              {pln.monthlyForecast && pln.monthlyForecast.length > 0 ? (
                                <div className="space-y-1">
                                  <div className="flex gap-1">
                                    {pln.monthlyForecast.map((f, idx) => (
                                      <span key={idx} className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[9px] font-medium font-mono text-slate-600">
                                        {f.month.split(" ")[0]}: ${f.budget >= 1000 ? `${(f.budget / 1000).toFixed(0)}k` : f.budget}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden relative">
                                    <div 
                                      className={`h-full ${totalAllocated >= planBudgetNum ? "bg-emerald-500" : "bg-amber-500"}`} 
                                      style={{ width: `${Math.min(100, (totalAllocated / Math.max(1, planBudgetNum)) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No forecast spread</span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-slate-500">{pln.targetDate}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wide ${
                                pln.status === "Plan Approved" ? "bg-green-100 text-green-700" :
                                pln.status === "RFQ Issued" ? "bg-blue-100 text-blue-700" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {lang === "BN" && pln.status === "Plan Approved" ? "পরিকল্পনা অনুমোদিত" : 
                                 lang === "BN" && pln.status === "Draft" ? "খসড়া" : pln.status}
                              </span>
                            </td>
                            <td className="p-3 text-right flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedPlanForForecast(pln);
                                  setTempForecasts(pln.monthlyForecast || [
                                    { month: "Jun 2026", qty: 0, budget: 0 },
                                    { month: "Jul 2026", qty: 0, budget: 0 },
                                    { month: "Aug 2026", qty: 0, budget: 0 },
                                    { month: "Sep 2026", qty: 0, budget: 0 }
                                  ]);
                                  setShowForecastModal(true);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase transition bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded flex items-center gap-1"
                              >
                                <Sliders className="w-3 h-3 text-slate-500" />
                                {lang === "BN" ? "পূর্বাভাস সম্পাদন" : "Forecast"}
                              </button>
                              <button 
                                onClick={() => {
                                  setNewRfqMaterial(pln.itemName);
                                  setNewRfqQty(pln.quantity);
                                  setActiveTab("rfqs");
                                  setShowAddRfq(true);
                                }}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase transition"
                              >
                                {lang === "BN" ? "আরএফকিউ ছাড়ুন" : "Launch RFQ"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VIEW 2: HIGH VISIBILITY FORECAST COMPARISON GRAPH USING STYLIZED PROGRESS BARS */}
              {forecastViewMode === "forecast" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Spend allocations comparison chart cards */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
                      {lang === "BN" ? "মাস ভিত্তিক ক্রয়ের বাজেট পর্যালোচনা" : "Monthly Forecast Spending Analysis"}
                    </h3>
                    
                    <div className="space-y-4 pt-2">
                      {["Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"].map(m => {
                        // Aggregate forecasted budget for that month
                        const monthTotal = procurementPlans.reduce((sum, p) => {
                          const allocation = p.monthlyForecast?.find(f => f.month === m);
                          return sum + (allocation?.budget || 0);
                        }, 0);
                        
                        // Maximum month cap for styling width percentages
                        const maxVal = Math.max(10000, ...["Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"].map(mon => {
                          return procurementPlans.reduce((sum, p) => sum + (p.monthlyForecast?.find(f => f.month === mon)?.budget || 0), 0);
                        }));

                        const percentageWidth = Math.round((monthTotal / Math.max(1, maxVal)) * 100);

                        return (
                          <div key={m} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                              <span className="font-semibold">{m}</span>
                              <span className="font-mono font-extrabold text-slate-900">${monthTotal.toLocaleString()} USD</span>
                            </div>
                            <div className="w-full bg-slate-100 h-6.5 rounded-md overflow-hidden relative flex items-center">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-r"
                                style={{ width: `${percentageWidth}%` }}
                              ></div>
                              <span className="absolute left-2.5 text-[10px] font-black text-slate-800 mix-blend-difference">
                                {percentageWidth}% of peak month load
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-slate-50 border border-slate-150 rounded p-3 text-[10px] text-slate-500 leading-normal">
                      💡 <strong>Sourcing Engine Alert:</strong> August peaks at the highest spend intensity due to Winter Season bulk fleece booking cycles. Ensure compliance buffers are verified before August 10.
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
                      {lang === "BN" ? "উপাদান ভিত্তিক মাসিক পূর্বাভাসের তথ্য" : "Material Volume Allocations Grid"}
                    </h3>

                    <div className="space-y-4 pt-1 divide-y divide-slate-100">
                      {procurementPlans.map(p => (
                        <div key={p.id} className="pt-2.5 first:pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{p.itemName}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{p.id}</span>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-center">
                            {["Jun", "Jul", "Aug", "Sep"].map((shortM, idx) => {
                              const longM = idx === 0 ? "Jun 2026" : idx === 1 ? "Jul 2026" : idx === 2 ? "Aug 2026" : "Sep 2026";
                              const alloc = p.monthlyForecast?.find(f => f.month === longM);
                              return (
                                <div key={shortM} className="bg-slate-55 border border-slate-200/60 p-2 rounded">
                                  <div className="text-[9px] font-bold text-slate-400 uppercase">{shortM}</div>
                                  <div className="text-xs font-extrabold text-slate-800 mt-1">
                                    {alloc ? `${alloc.qty.toLocaleString()}` : "0"}
                                  </div>
                                  <div className="text-[9px] font-bold font-mono text-emerald-600 mt-0.5">
                                    ${alloc ? `${(alloc.budget).toLocaleString()}` : "$0"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOR & CONSULTANT EVALUATION TAB */}
          {activeTab === "tor" && (
            <div className="space-y-6 text-left">
              {/* ToR tabs selection menu */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-blue-600" />
                    {lang === "BN" ? "টি ও আর এবং পরামর্শক মূল্যায়ন" : "Terms of Reference & Consultant Evaluation"}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lang === "BN" 
                      ? "পদ্ধতিগত স্কোরিং এবং মার্কিং শীট ব্যবহার করে বহিরাগত পরামর্শক আবেদনসমূহ মূল্যায়ন করুন।" 
                      : "Publish supply chain consultative ToR tasks, audit candidate qualification marks, and lock approvals."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setNewTorTitle("");
                      setNewTorDesc("");
                      setNewTorScope("");
                      setNewTorBudget("");
                      setNewTorDeadline("");
                      setShowAddTorModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {lang === "BN" ? "নতুন টিওআর খসড়া" : "Draft New ToR"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column: active ToR list */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    {lang === "BN" ? "সক্রিয় প্রস্তাবিত টিওআর তালিকা" : "Published Supply-Chain ToR Packages"}
                  </h3>

                  <div className="space-y-2.5">
                    {tors.map((item) => {
                      const isSelected = selectedTorIdForEvaluation === item.id;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedTorIdForEvaluation(item.id)}
                          className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                            isSelected 
                              ? "bg-blue-50/50 border-blue-200 shadow-3xs" 
                              : "bg-slate-50/20 border-slate-150 hover:bg-slate-50/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {item.id} • {item.expertType}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-black text-[8px] uppercase tracking-wide tracking-tight ${
                              item.status === "Published" ? "bg-blue-100 text-blue-700 font-bold" :
                              item.status === "Awarded" ? "bg-emerald-100 text-emerald-700 font-extrabold" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {lang === "BN" && item.status === "Draft" ? "খসড়া" :
                               lang === "BN" && item.status === "Published" ? "প্রকাশিত" :
                               lang === "BN" && item.status === "Awarded" ? "প্রদান করা হয়েছে" : item.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-xs mt-1.5 leading-snug">{item.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-normal">{item.description}</p>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2.5 text-[9px] text-slate-400 font-medium">
                            <span>{lang === "BN" ? "বাজেট:" : "Budget:"} <strong className="text-slate-800 font-bold font-mono">{item.budget}</strong></span>
                            <span>{lang === "BN" ? "শেষ তারিখ:" : "Deadline:"} <strong className="text-slate-800 font-bold font-mono">{item.deadline}</strong></span>
                          </div>

                          {item.status === "Draft" && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-right">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  publishToR(item.id);
                                  setNotifications(prev => [
                                    { id: Date.now(), text: `Terms of Reference '${item.title}' is now Published to open consultant bidding`, unread: true },
                                    ...prev
                                  ]);
                                }}
                                className="px-2.5 py-1 bg-slate-900 border border-slate-900 text-white font-bold text-[8px] rounded uppercase hover:bg-slate-800"
                              >
                                {lang === "BN" ? "বিজ্ঞপ্তি প্রকাশ করুন" : "Publish to Public"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right column: marking sheet evaluations */}
                <div className="lg:col-span-7 space-y-6">
                  {selectedTorIdForEvaluation ? (
                    (() => {
                      const selectedTorInstance = tors.find(t => t.id === selectedTorIdForEvaluation);
                      const relatedEvaluations = evaluations.filter(e => e.torId === selectedTorIdForEvaluation);
                      
                      return (
                        <div className="space-y-6">
                          {/* Selected ToR Details Card */}
                          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-3">
                            <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-1">
                              👑 {lang === "BN" ? "নির্বাচিত কাজের বিবরণী (ToR)" : "Selected ToR Specification"}
                            </h2>
                            <h3 className="font-bold text-slate-900 text-sm leading-snug">{selectedTorInstance?.title}</h3>
                            <p className="text-xs text-slate-600 leading-normal">{selectedTorInstance?.description}</p>
                            
                            <div className="bg-slate-50 border border-slate-100 rounded-md p-3.5 space-y-2 mt-2">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {lang === "BN" ? "কাজের পরিধি ও মূল্যায়নের নীতিমালা" : "Scope & Criteria Weights"}
                              </span>
                              <p className="text-xs text-slate-600 leading-normal font-medium">{selectedTorInstance?.scopeOfWork}</p>
                              
                              <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] border-t border-slate-200/60 mt-2.5">
                                <div className="flex justify-between font-mono">
                                  <span className="text-slate-500 font-bold uppercase">{lang === "BN" ? "কারিগরি ভরভাগ (Tech Weight):" : "Tech Weight:"}</span>
                                  <span className="font-extrabold text-blue-600">{selectedTorInstance?.technicalWeight}%</span>
                                </div>
                                <div className="flex justify-between font-mono">
                                  <span className="text-slate-500 font-bold uppercase">{lang === "BN" ? "আর্থিক ভরভাগ (Fin Weight):" : "Financial Weight:"}</span>
                                  <span className="font-extrabold text-emerald-600">{selectedTorInstance?.financialWeight}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Candidates comparison marking spreadsheet scorecard */}
                          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
                            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
                              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Users className="w-4 h-4 text-slate-400" />
                                {lang === "BN" ? "আবেদনকারী গবেষক/কনসালটেন্ট মার্কিং শীট" : "Candidate Scoring Ledger"}
                              </h3>
                              
                              {selectedTorInstance?.status === "Published" && (
                                <button 
                                  onClick={() => {
                                    setNewEvalConsultant("");
                                    setNewEvalProposal(20000);
                                    setShowAddEvalModal(true);
                                  }}
                                  className="px-2 md:px-2.5 py-1 bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 text-[9px] font-bold uppercase rounded flex items-center gap-1 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                  {lang === "BN" ? "নতুন বিড মার্কিং" : "Score Candidate Bid"}
                                </button>
                              )}
                            </div>

                            <div className="space-y-4 pt-1">
                              {relatedEvaluations.length > 0 ? (
                                relatedEvaluations.map((evl) => {
                                  const avgTechPoint = (evl.technicalScores.experience + evl.technicalScores.methodology + evl.technicalScores.teamStrength) / 3;
                                  // Formulas
                                  const isWinning = evl.status === "Approved";
                                  const weightedTech = parseFloat(((avgTechPoint * (selectedTorInstance?.technicalWeight || 70)) / 100).toFixed(1));
                                  const weightedFin = parseFloat(((20000 / Math.max(1, evl.financialProposal)) * (selectedTorInstance?.financialWeight || 30)).toFixed(1));
                                  const calculatedTotal = parseFloat((weightedTech + weightedFin).toFixed(1));

                                  return (
                                    <div 
                                      key={evl.id}
                                      className={`p-4 rounded-lg border transition ${
                                        isWinning 
                                          ? "bg-emerald-50/40 border-emerald-300" 
                                          : evl.status === "Shortlisted" ? "bg-slate-50/50 border-slate-200" : "bg-white border-slate-150"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h4 className="font-extrabold text-slate-800 text-xs">{evl.consultantName}</h4>
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mt-0.5 block">
                                            Candidate ID: {evl.id} • Bid: ${evl.financialProposal.toLocaleString()}
                                          </span>
                                        </div>

                                        <div className="text-right">
                                          <div className="text-sm font-black text-slate-900 font-mono">
                                            Score: {calculatedTotal} / 100
                                          </div>
                                          <span className={`inline-block px-2 py-0.5 rounded font-black text-[8px] uppercase tracking-wider mt-1 ${
                                            isWinning ? "bg-emerald-100 text-emerald-800" :
                                            evl.status === "Shortlisted" ? "bg-amber-100 text-amber-800" :
                                            "bg-slate-100 text-slate-600"
                                          }`}>
                                            {lang === "BN" && evl.status === "Applied" ? "আবেদনকারী" :
                                             lang === "BN" && evl.status === "Shortlisted" ? "শর্টলিস্ট করা হয়েছে" :
                                             lang === "BN" && evl.status === "Approved" ? "নির্বাচিত বিজয়ী" : evl.status}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Weighted sub-score details parameters */}
                                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-md mt-3 hover:bg-slate-100/50 transition">
                                        <div className="text-center">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase">{lang === "BN" ? "অভিজ্ঞতা" : "Exp Score"}</div>
                                          <div className="text-[11px] font-extrabold text-slate-700 mt-0.5">{evl.technicalScores.experience}%</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase">{lang === "BN" ? "পদ্ধতি" : "Methodology"}</div>
                                          <div className="text-[11px] font-extrabold text-slate-700 mt-0.5">{evl.technicalScores.methodology}%</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase">{lang === "BN" ? "টিম শক্তি" : "Team Qual"}</div>
                                          <div className="text-[11px] font-extrabold text-slate-700 mt-0.5">{evl.technicalScores.teamStrength}%</div>
                                        </div>
                                      </div>

                                      {/* Multi weighted marks indicators */}
                                      <div className="flex items-center justify-between text-[9px] font-bold font-mono text-slate-500 mt-2 border-t border-slate-100/60 pt-2">
                                        <span>Tech Weighted Point (x{selectedTorInstance?.technicalWeight}%): <strong className="text-blue-600 font-extrabold">{weightedTech}pt</strong></span>
                                        <span>Financial Weighted Point (x{selectedTorInstance?.financialWeight}%): <strong className="text-emerald-600 font-extrabold">{weightedFin}pt</strong></span>
                                      </div>

                                      {/* Evaluation submission locks */}
                                      {selectedTorInstance?.status === "Published" && (
                                        <div className="flex justify-end gap-2 mt-3 pt-2.5 border-t border-slate-100">
                                          {evl.status === "Applied" && (
                                            <button 
                                              onClick={() => updateConsultantEvaluationStatus(evl.id, "Shortlisted")}
                                              className="px-2.5 py-1 text-[9px] font-bold uppercase rounded border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
                                            >
                                              {lang === "BN" ? "শর্টলিস্ট করুন" : "Shortlist Candidate"}
                                            </button>
                                          )}
                                          <button 
                                            onClick={() => {
                                              updateConsultantEvaluationStatus(evl.id, "Approved");
                                              setNotifications(prev => [
                                                { id: Date.now(), text: `Consultat contract awarded to '${evl.consultantName}' with perfect score check: ${calculatedTotal}`, unread: true },
                                                ...prev
                                              ]);
                                            }}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase rounded transition"
                                          >
                                            {lang === "BN" ? "অনুমোদন ও চুক্তি স্বাক্ষর" : "Approve & Award Contract"}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-6 text-slate-400 italic">
                                  {lang === "BN" ? "এই টিওআর এর জন্য এখনো কোনো পরামর্শক স্কোর এন্ট্রি করা হয়নি।" : "No applicants scored on this Terms of Reference scorecard yet."}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 italic select-none shadow-3xs">
                      👈 {lang === "BN" ? "পরামর্শক মূল্যায়ন ও স্কোরিং শুরু করতে বাম পাশের তালিকা থেকে একটি ToR নির্বাচন করুন" : "Select a Terms of Reference task package from the left list to begin candidate comparison and grading."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* COMPREHENSIVE REPORTING CENTRE TAB */}
          {activeTab === "reports" && (
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
                    {lang === "BN" ? "সমন্বিত রিপোর্টিং অ্যান্ড নিরীক্ষা কেন্দ্র" : "Comprehensive Reporting and Audit Ledger"}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lang === "BN" 
                      ? "ক্রয় পরিকল্পনা, ভেন্ডর কমপ্লায়েন্স এবং পরামর্শক মূল্যায়নের কাস্টম এক্সেল ও পিডিএফ রিপোর্ট জেনারেট করুন।" 
                      : "Export active procurement plans, contract details, vendor certifications status, and ToR candidate bids ledger."}
                  </p>
                </div>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Parameters setting card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4 md:col-span-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    {lang === "BN" ? "রিপোর্ট প্যারামিটার" : "Export Configurations"}
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Subject</label>
                      <select 
                        id="report-subject-select"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800"
                        defaultValue="procurement"
                      >
                        <option value="procurement">{lang === "BN" ? "মৌসুমী ক্রয় পরিকল্পনা ও প্রক্ষেপণ" : "Sourcing Plans & Forecasts"}</option>
                        <option value="vendors">{lang === "BN" ? "ভেন্ডর কমপ্লায়েন্স নিরীক্ষা বিবরণ" : "Vendors Performance & Compliance"}</option>
                        <option value="tors">{lang === "BN" ? "পরামর্শক দরপত্র ও মার্কশীট" : "Consultants Evaluation Ledger"}</option>
                        <option value="rfqs">{lang === "BN" ? "আরএফকিউ (মূল্য উদ্ধৃতি আহ্বান)" : "Requests for Quotation (RFQs)"}</option>
                        <option value="quotations">{lang === "BN" ? "কোটেসন বিড লেজার" : "Quotations (Received Bids)"}</option>
                        <option value="approvals">{lang === "BN" ? "কমিটি ডিসিশন সাইনঅফ রিপোর্ট" : "Committee Sourcing Approvals"}</option>
                        <option value="noas">{lang === "BN" ? "নোটিস অফ অ্যাওয়ার্ড (NOAs)" : "Notices of Sourcing Award (NOAs)"}</option>
                        <option value="contracts">{lang === "BN" ? "সোর্সিং ক্রয় চুক্তি স্লেট" : "Sourcing Purchase Contracts"}</option>
                        <option value="workorders">{lang === "BN" ? "সক্রিয় উৎপাদন ওয়ার্ক অর্ডার" : "Production Work Orders"}</option>
                        <option value="inspections">{lang === "BN" ? "পরিদর্শন ও কিউসি অডিট ট্রেইল" : "QC Inspections Audit Trail"}</option>
                        <option value="payments">{lang === "BN" ? "ইনভয়েস থ্রি-ওয়ে ম্যাচিং ও পেমেন্ট" : "Invoice matching & Payments"}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Format</label>
                      <select 
                        id="report-format-select"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800"
                        defaultValue="excel"
                      >
                        <option value="excel">MS Excel Worksheet (.CSV)</option>
                        <option value="pdf">PDF Document Print Preview (.PDF)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language Format</label>
                      <select 
                        id="report-lang-select"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800"
                        defaultValue="EN"
                      >
                        <option value="EN">English Version Format</option>
                        <option value="BN">Bengali Version (বাংলা সংস্করণ)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          const subjSelect = document.getElementById("report-subject-select") as HTMLSelectElement;
                          const fmtSelect = document.getElementById("report-format-select") as HTMLSelectElement;
                          const langSelect = document.getElementById("report-lang-select") as HTMLSelectElement;
                          
                          const subj = subjSelect?.value || "procurement";
                          const fmt = fmtSelect?.value || "excel";
                          const reportLang = langSelect?.value || "EN";

                          if (fmt === "pdf") {
                            // Trigger native window print preview which serves as high standard design printer layout exports!
                            window.print();
                          } else {
                            // Excel XLS simulation triggered via downloading dynamically formatted text/csv!
                            let csvContent = "";
                            let filename = "";

                            if (subj === "procurement") {
                              filename = `Procurement_Plans_${Date.now()}.csv`;
                              csvContent = "Plan ID,itemName,targetDate,budget,quantity,status\n" + 
                                procurementPlans.map(p => `"${p.id}","${p.itemName}","${p.targetDate}","${p.budget}","${p.quantity}","${p.status}"`).join("\n");
                            } else if (subj === "vendors") {
                              filename = `Vendors_Compliance_Audit_${Date.now()}.csv`;
                              csvContent = "Vendor ID,Vendor Name,Tier,Rating,Contact,Email\n" + 
                                vendors.map(v => `"${v.id}","${v.name}","${v.tier}","${v.rating}","${v.contact}","${v.email}"`).join("\n");
                            } else if (subj === "tors") {
                              filename = `Consultant_Evaluations_Ledger_${Date.now()}.csv`;
                              csvContent = "ToR Title,Expert Category,Budget,Deadline,Consultant,Proposed Price,Weighted Score\n" + 
                                evaluations.map(e => {
                                  const torDetail = tors.find(t => t.id === e.torId);
                                  return `"${torDetail?.title || "Sustainability"}","${torDetail?.expertType || ""}","${torDetail?.budget || ""}","${torDetail?.deadline || ""}","${e.consultantName}","${e.financialProposal}","${e.totalScore}"`;
                                }).join("\n");
                            } else if (subj === "rfqs") {
                              filename = `RFQ_Documents_${Date.now()}.csv`;
                              csvContent = "RFQ ID,Type,Material,Quantity,Target Date,Urgency,Status\n" + 
                                rfqs.map(r => `"${r.id}","${r.type}","${r.material}","${r.quantity}","${r.targetDate}","${r.urgency}","${r.status}"`).join("\n");
                            } else if (subj === "quotations") {
                              filename = `Quotations_Bids_${Date.now()}.csv`;
                              csvContent = "Quotation ID,RFQ ID,Vendor ID,Vendor Name,Price Per Unit,Lead Time Days,Compliance Score,Preferred\n" + 
                                quotations.map(q => `"${q.id}","${q.rfqId}","${q.vendorId}","${q.vendorName}","${q.pricePerUnit}","${q.leadTimeDays}","${q.complianceScore}","${q.isPreferred ? "Yes" : "No"}"`).join("\n");
                            } else if (subj === "approvals") {
                              filename = `Committee_Approvals_${Date.now()}.csv`;
                              csvContent = "Approval ID,Type,Title,Requested By,Date,Amount,Status\n" + 
                                approvals.map(a => `"${a.id}","${a.type}","${a.title}","${a.requestedBy}","${a.date}","${a.amount || ""}","${a.status}"`).join("\n");
                            } else if (subj === "noas") {
                              filename = `Notices_Of_Award_${Date.now()}.csv`;
                              csvContent = "NOA ID,RFQ ID,Vendor Name,Amount,Issue Date,Status\n" + 
                                noas.map(n => `"${n.id}","${n.rfqId}","${n.vendorName}","${n.amount}","${n.issueDate}","${n.status}"`).join("\n");
                            } else if (subj === "contracts") {
                              filename = `Purchase_Contracts_${Date.now()}.csv`;
                              csvContent = "Contract ID,Contract No,RFQ ID,Vendor Name,Amount,Status,Created At\n" + 
                                contracts.map(c => `"${c.id}","${c.contractNo}","${c.rfqId}","${c.vendorName}","${c.amount}","${c.status}","${c.createdAt}"`).join("\n");
                            } else if (subj === "workorders") {
                              filename = `Production_Work_Orders_${Date.now()}.csv`;
                              csvContent = "Work Order ID,RFQ ID,Vendor Name,Material,Quantity,Start Date,End Date,Status,QC Status\n" + 
                                workOrders.map(w => `"${w.id}","${w.rfqId}","${w.vendorName}","${w.material}","${w.quantity}","${w.startDate}","${w.endDate}","${w.status}","${w.qcStatus}"`).join("\n");
                            } else if (subj === "inspections") {
                              filename = `QC_Inspections_${Date.now()}.csv`;
                              csvContent = "Inspection ID,Order ID,Material,Inspector,Defect Rate,Findings,Status\n" + 
                                inspections.map(i => `"${i.id}","${i.orderId}","${i.material}","${i.inspectorName}","${i.defectRate}%","${i.findings}","${i.status}"`).join("\n");
                            } else if (subj === "payments") {
                              filename = `Payments_Invoice_Ledger_${Date.now()}.csv`;
                              csvContent = "Payment ID,Order ID,Vendor Name,Invoice ID,Amount,Invoice Amount,PO Amount,Matched Status,Status\n" + 
                                payments.map(p => `"${p.id}","${p.orderId}","${p.vendorName}","${p.invoiceId}","${p.amount}","${p.invoiceAmount}","${p.poAmount}","${p.matchedStatus}","${p.status}"`).join("\n");
                            }

                            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.setAttribute("href", url);
                            link.setAttribute("download", filename);
                            link.style.visibility = "hidden";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            setNotifications(prev => [
                              { id: Date.now(), text: `Comprehensive report successfully generated and saved: ${filename}`, unread: true },
                              ...prev
                            ]);
                          }
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase rounded transition tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {lang === "BN" ? "রিপোর্ট রিলিজ জেনারেট" : "Generate Report File"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right col: interactive data preview ledger mockup */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs md:col-span-3 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                      📊 {lang === "BN" ? "রিপোর্ট ডাটা লাইভ প্রিভিউ" : "Active Ledger Live Audit Preview"}
                    </h3>
                    <span className="bg-slate-100 px-2.5 py-0.5 rounded text-[9px] font-bold text-slate-500 uppercase">
                      Live Streamed
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-150">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold border-b border-slate-150">
                        <tr>
                          <th className="p-2 border border-slate-200">Indicator</th>
                          <th className="p-2 border border-slate-200">System Source Context</th>
                          <th className="p-2 border border-slate-200">Value check</th>
                          <th className="p-2 border border-slate-200">Data health state</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                        <tr>
                          <td className="p-2 border font-bold text-slate-800">Seasonal Sourcing Target Range</td>
                          <td className="p-2 border">procurementplans / LocalStorage</td>
                          <td className="p-2 border font-mono font-bold text-blue-600">{procurementPlans.length} plans logged</td>
                          <td className="p-2 border text-[9px] text-emerald-600 font-bold uppercase select-none">100% Synced</td>
                        </tr>
                        <tr>
                          <td className="p-2 border font-bold text-slate-800">Vendor Certifications Compliance</td>
                          <td className="p-2 border">vendors / Certifications store</td>
                          <td className="p-2 border font-mono font-bold text-blue-600">{vendors.length} mills listed</td>
                          <td className="p-2 border text-[9px] text-emerald-600 font-bold uppercase select-none">9 Checks Verified</td>
                        </tr>
                        <tr>
                          <td className="p-2 border font-bold text-slate-800">Terms of Reference Open Submissions</td>
                          <td className="p-2 border">tors / Consultant bids</td>
                          <td className="p-2 border font-mono font-bold text-blue-600">{tors.length} active drafts</td>
                          <td className="p-2 border text-[9px] text-amber-600 font-bold uppercase select-none">Awaiting Bid Close</td>
                        </tr>
                        <tr>
                          <td className="p-2 border font-bold text-slate-800">System Wide Multi-Level Release Invoices</td>
                          <td className="p-2 border">payments / CFO hierarchy</td>
                          <td className="p-2 border font-mono font-bold text-blue-600">${payments.reduce((sum, p) => sum + (parseFloat(p.amount.replace(/[^0-9.]/g, "")) || 0), 0).toLocaleString()} lock</td>
                          <td className="p-2 border text-[9px] text-emerald-600 font-bold uppercase select-none">Locked</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-blue-50/40 border border-blue-150 p-3 rounded-lg text-[10px] text-slate-500 leading-normal">
                    💡 <strong>Excel Sheet Formatting Rule:</strong> Generated spreadsheet files use MS excel standards, fully supporting automated cell parsing of currency ($ USD) and raw quantity splits. Preview is optimized for desktop.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FILES SECTION */}
          {activeTab === "files" && (
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">My Secure Workspace Files</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Real-time collaborative cloud filesystem</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsFolderModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded uppercase transition cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> New Folder
                  </button>
                  <button 
                    disabled={hasReachedLimit}
                    onClick={() => setIsFileModalOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-[10px] rounded uppercase transition ${
                      hasReachedLimit 
                        ? "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    }`}
                  >
                    <FilePlus className="w-3.5 h-3.5" /> Add File Descriptor
                  </button>
                </div>
              </div>

              {hasReachedLimit && (
                <div id="free-plan-limit-banner" className="flex items-center justify-between gap-3 p-3.5 bg-amber-50 border border-amber-200/65 rounded text-amber-800 text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded uppercase tracking-wider">Free Tier Limit</span>
                    <span className="font-semibold text-amber-900">You’ve reached the free plan limit.</span>
                  </div>
                  <button
                    id="upgrade-plan-button"
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded uppercase tracking-wider transition cursor-pointer shadow-xs"
                  >
                    Upgrade
                  </button>
                </div>
              )}

              {/* Folders Bar */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Folder directories</h3>
                {foldersLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium col-span-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Scanning folder metadata...
                  </div>
                ) : folders.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center text-slate-400 text-xs">
                    No folders created. Add folders to organize files.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedFolderFilter("all")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition cursor-pointer ${
                        selectedFolderFilter === "all"
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      All Files ({files.length})
                    </button>
                    {folders.map(f => {
                      const count = files.filter(file => file.folderId === f.id).length;
                      return (
                        <div key={f.id} className="flex items-center">
                          <button
                            onClick={() => setSelectedFolderFilter(f.id)}
                            className={`px-3 py-1.5 rounded-l text-xs font-semibold border-y border-l transition cursor-pointer ${
                              selectedFolderFilter === f.id
                                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Folder className="w-3.5 h-3.5" /> {f.name} ({count})
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              if (selectedFolderFilter === f.id) {
                                setSelectedFolderFilter("all");
                              }
                              handleDeleteItem("folders", f.id);
                            }}
                            className={`px-2 py-2 rounded-r border-y border-r text-red-550 hover:text-red-750 transition cursor-pointer ${
                              selectedFolderFilter === f.id ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700" : "bg-white border-slate-200 hover:bg-red-50"
                            }`}
                            title="Delete Folder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Files Table Section */}
              <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden mt-4">
                <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500">
                    File list {selectedFolderFilter !== "all" ? `(Filtered: ${folders.find(fd => fd.id === selectedFolderFilter)?.name || "Folder"})` : "(All documents)"}
                  </span>
                </div>

                {filesLoading ? (
                  <div className="p-10 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Indexing user files...</span>
                  </div>
                ) : (() => {
                  const filteredFiles = selectedFolderFilter === "all" 
                    ? files 
                    : files.filter(f => f.folderId === selectedFolderFilter);

                  if (filteredFiles.length === 0) {
                    return (
                      <div className="p-12 text-center bg-white text-slate-400 flex flex-col items-center justify-center">
                        <File className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-xs font-bold uppercase text-slate-500 mb-1">Database empty</span>
                        <p className="text-[10px] max-w-[240px] leading-relaxed text-slate-400">
                          {selectedFolderFilter === "all" 
                            ? "No file records found. Register metadata items now." 
                            : "No files inside this folder yet. Click 'Add File Descriptor' to assign files here."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto overflow-y-hidden">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3 text-[10px] text-slate-500 uppercase">Document Name</th>
                            <th className="p-3 text-[10px] text-slate-500 uppercase">Organization Directory</th>
                            <th className="p-3 text-[10px] text-slate-500 uppercase">File Volume</th>
                            <th className="p-3 text-[10px] text-slate-500 uppercase">Uploaded Index</th>
                            <th className="p-3 text-[10px] text-slate-500 uppercase text-right w-24">Operations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredFiles.map((f) => {
                            const folderObj = folders.find(fd => fd.id === f.folderId);
                            return (
                              <tr key={f.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                                <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                                  <File className="w-4 h-4 text-blue-500 shrink-0" />
                                  {f.name}
                                </td>
                                <td className="p-3">
                                  {folderObj ? (
                                    <span className="p-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase flex items-center gap-1 w-fit">
                                      <Folder className="w-3 h-3" /> {folderObj.name}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 uppercase italic">Root Level</span>
                                  )}
                                </td>
                                <td className="p-3 font-mono text-slate-700 font-semibold">{f.size}</td>
                                <td className="p-3 font-mono text-slate-500">{new Date(f.createdAt).toLocaleString()}</td>
                                <td className="p-3 text-right">
                                  <button 
                                    onClick={() => handleDeleteItem("files", f.id)}
                                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-800 font-bold text-[9px] rounded uppercase transition cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* NOTES SECTION */}
          {activeTab === "notes" && (
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">My Private Sourcing Memos</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">SaaS organizer for trade remarks & specs</p>
                </div>
                <button 
                  onClick={() => setIsNoteModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Sourcing Memo
                </button>
              </div>

              {notesLoading ? (
                <div className="p-16 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Loading secure memos...</span>
                </div>
              ) : notes.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-slate-200 bg-white text-slate-400 flex flex-col items-center justify-center rounded-lg">
                  <Notebook className="w-10 h-10 text-slate-300 mb-2" />
                  <span className="text-xs font-bold uppercase text-slate-500 mb-1">Notebook is empty</span>
                  <p className="text-[10px] max-w-[280px] leading-relaxed text-slate-400">
                    Create notes and reminders about fabrics raw pricing, bidding discussions, and inspector reports.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white border border-slate-200 rounded p-4 shadow-xs flex flex-col justify-between relative hover:border-slate-350 transition hover:shadow-xs group">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-xs uppercase tracking-wide truncate pr-4">{note.title}</h4>
                          <button
                            onClick={() => handleDeleteItem("notes", note.id)}
                            className="text-slate-400 hover:text-red-650 opacity-10 sm:opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {note.content ? (
                          <p className="text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed mb-4">{note.content}</p>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic mb-4">No content provided.</p>
                        )}
                      </div>
                      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase">
                        <span>Private Note</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TEAM MEMBERS SECTION */}
          {activeTab === "team" && (
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">My Organization Workspace Team</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Configure workspace collaborators & roles</p>
                </div>
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Team Member
                </button>
              </div>

              {teamMembersLoading ? (
                <div className="p-16 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Loading team database...</span>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-slate-200 bg-white text-slate-400 flex flex-col items-center justify-center rounded-lg font-medium">
                  <Users className="w-10 h-10 text-slate-300 mb-2" />
                  <span className="text-xs font-bold uppercase text-slate-500 mb-1">No custom team members</span>
                  <p className="text-[10px] max-w-[280px] leading-relaxed text-slate-400 font-normal">
                    Add custom team members, workspace associates, or procurement managers to this account workspace.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-white border border-slate-200 rounded p-4 shadow-xs flex items-center justify-between hover:border-slate-300 transition hover:shadow-xs group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 border border-slate-205 rounded-full flex items-center justify-center font-bold text-slate-700 uppercase">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">{member.name}</h4>
                          <span className="text-[9px] bg-slate-100 text-slate-605 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                            {member.role || "Procurement Officer"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem("teamMembers", member.id)}
                        className="text-slate-400 hover:text-red-650 transition cursor-pointer"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>

        {/* Global Footer Area */}
        <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-medium italic shrink-0">
          <div>{t[lang].healthStatus}</div>
          <div>{t[lang].isolation}</div>
        </footer>
      </main>

      {/* OVERLAY DIALOGS & MODALS FOR DENSITY ACTIONS */}

      {/* 2. New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl overflow-hidden text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 animate-[fadeIn_0.15s_ease-out]">
              <div>
                <span className="text-[9px] bg-slate-100 text-slate-850 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  New Workspace Directory
                </span>
                <h3 className="font-bold text-slate-705 text-sm uppercase tracking-wide mt-1">Create Folder</h3>
              </div>
              <button onClick={() => { setIsFolderModalOpen(false); setNewFolderName(""); setFolderError(""); }} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Folder Name</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs"
                  placeholder="e.g. Cotton Fabrics 2026"
                  required
                />
              </div>

              {folderError && (
                <div className="p-2 bg-red-50 border border-red-100 text-red-605 rounded text-[10px] font-bold uppercase">
                  {folderError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsFolderModalOpen(false); setNewFolderName(""); setFolderError(""); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={folderSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {folderSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : "Create Folder"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Add File Modal */}
      {isFileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl overflow-hidden text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[9px] bg-blue-50 text-blue-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  New Cloud Attachment Record
                </span>
                <h3 className="font-bold text-slate-705 text-sm uppercase tracking-wide mt-1">Add File Metadata</h3>
              </div>
              <button onClick={() => { setIsFileModalOpen(false); setNewFileName(""); setNewFileSize(""); setNewFileFolder(""); setFileError(""); }} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddFile} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Document Name</label>
                <input 
                  type="text" 
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs"
                  placeholder="e.g. Sourcing_Contract_v4.pdf"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">File Volume / Size</label>
                <input 
                  type="text" 
                  value={newFileSize}
                  onChange={(e) => setNewFileSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs"
                  placeholder="e.g. 5.4 MB or 124 KB"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Associate with Directory Folder (Optional)</label>
                <select
                  value={newFileFolder}
                  onChange={(e) => setNewFileFolder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs cursor-pointer"
                >
                  <option value="">Root / Unassigned</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {fileError && (
                <div className="p-2 bg-red-50 border border-red-100 text-red-605 rounded text-[10px] font-bold uppercase">
                  {fileError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsFileModalOpen(false); setNewFileName(""); setNewFileSize(""); setNewFileFolder(""); setFileError(""); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={fileSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {fileSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : "Add File"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-6 rounded shadow-xl overflow-hidden text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  SaaS Plan Expansion
                </span>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mt-1">Upgrade your plan</h3>
              </div>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-left font-sans">
              <p className="text-xs text-slate-600 leading-relaxed">
                You have reached your free plan limit of <span className="font-bold text-slate-900">5 files</span>. 
                Unlock unlimited secure cloud attachments, expanded team workspaces, and priority ISO-certified 
                sourcing workflows with our Professional Plan.
              </p>
              
              <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase">Professional SaaS Sourcing</h4>
                  <p className="text-[10px] text-slate-500">Unlimited files, 24/7 dedicated support</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-amber-700">$29</span>
                  <span className="text-[9px] text-slate-400">/mo</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-[10px] rounded uppercase transition cursor-pointer"
                >
                  Close
                </button>
                <a 
                  href="/pricing"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase tracking-wider text-center transition cursor-pointer"
                >
                  Choose Sourcing Plan
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. New Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl overflow-hidden text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
              <div>
                <span className="text-[9px] bg-slate-105 text-slate-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Private Sourcing Memory Canvas
                </span>
                <h3 className="font-bold text-slate-705 text-sm uppercase tracking-wide mt-1">Create Sourcing Memo</h3>
              </div>
              <button onClick={() => { setIsNoteModalOpen(false); setNewNoteTitle(""); setNewNoteContent(""); setNoteError(""); }} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNote} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Memo Title</label>
                <input 
                  type="text" 
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs"
                  placeholder="e.g. Mondol Fabrics pricing discussion"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Content / Remarks</label>
                <textarea 
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs min-h-[100px] h-24"
                  placeholder="e.g. Sourcing agent quoted $1.25 per meter for 100% carded knit cotton canvas with a MOQ of 8000 meters..."
                />
              </div>

              {noteError && (
                <div className="p-2 bg-red-50 border border-red-100 text-red-605 rounded text-[10px] font-bold uppercase">
                  {noteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsNoteModalOpen(false); setNewNoteTitle(""); setNewNoteContent(""); setNoteError(""); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={noteSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {noteSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : "Create Memo"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. Add Team Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl overflow-hidden text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
              <div>
                <span className="text-[9px] bg-blue-50 text-blue-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  New Collaborator Profile
                </span>
                <h3 className="font-bold text-slate-750 text-sm uppercase tracking-wide mt-1">Add Team Member</h3>
              </div>
              <button onClick={() => { setIsMemberModalOpen(false); setNewMemberName(""); setNewMemberRole(""); setMemberError(""); }} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Collaborator Full Name</label>
                <input 
                  type="text" 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs"
                  placeholder="e.g. Tasnim Rahman"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Strategic Workspace Role</label>
                <input 
                  type="text" 
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 transition text-xs"
                  placeholder="e.g. Sourcing Director, Raw Cotton Expert"
                />
              </div>

              {memberError && (
                <div className="p-2 bg-red-50 border border-red-100 text-red-655 rounded text-[10px] font-bold uppercase">
                  {memberError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsMemberModalOpen(false); setNewMemberName(""); setNewMemberRole(""); setMemberError(""); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={memberSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded uppercase transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {memberSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : "Add Member"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 1. Add RFQ Modal */}
      {showAddRfq && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-xl p-5 rounded shadow-xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[9px] bg-blue-150 text-blue-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Auto RFQ Code Assignment: RFQ-{newRfqType === "Goods" ? "G" : newRfqType === "Service" ? "S" : "W"}-XXX
                </span>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mt-1">Launch Sourcing RFQ</h3>
              </div>
              <button onClick={() => setShowAddRfq(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitRfq} className="space-y-4 text-left font-medium">
              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">RFQ Sourcing Classification</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Goods", label: "Goods / Supplies", desc: "Raw fabrics, trims, yarns" },
                    { id: "Service", label: "Services / Process", desc: "Dyeing, prints, finishes" },
                    { id: "Works", label: "Works / Stitch", desc: "Contract stitching, cutting" }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setNewRfqType(t.id as any)}
                      className={`p-2.5 rounded border text-left flex flex-col justify-between h-20 transition ${
                        newRfqType === t.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                      style={{ backgroundColor: newRfqType === t.id ? '#2563eb' : undefined }}
                    >
                      <span className={`text-[10px] font-black uppercase ${newRfqType === t.id ? 'text-white' : 'text-slate-700'}`}>{t.label}</span>
                      <span className={`text-[9px] leading-tight ${newRfqType === t.id ? 'text-blue-100' : 'text-slate-400'}`}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Material or Service Descriptor</label>
                <input 
                  type="text" 
                  value={newRfqMaterial}
                  onChange={(e) => setNewRfqMaterial(e.target.value)}
                  placeholder={newRfqType === "Goods" ? "e.g. 100% Cotton Fleece Dyed 280GSM" : newRfqType === "Service" ? "e.g. High Temp Polyester yarn dyeing or finishes" : "e.g. Combed spinning mills and yarn twisting"}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Volume / Quantity</label>
                  <input 
                    type="text" 
                    value={newRfqQty}
                    onChange={(e) => setNewRfqQty(e.target.value)}
                    placeholder="e.g. 25,000 Kg"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target In-House Date</label>
                  <input 
                    type="date" 
                    value={newRfqTargetDate}
                    onChange={(e) => setNewRfqTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* TECHNICAL SPECIFICATIONS FORM SHEET */}
              <div className="border border-slate-100 bg-slate-50/50 p-3 rounded space-y-3">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block border-b pb-1">
                  Product Technical Specification Worksheet ({newRfqType})
                </span>
                
                {newRfqType === "Goods" && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">GSM (Fabric Weight)</label>
                      <input 
                        type="text" 
                        value={rfqGsm}
                        onChange={(e) => setRfqGsm(e.target.value)}
                        placeholder="e.g. 280"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Composition</label>
                      <input 
                        type="text" 
                        value={rfqFabricComposition}
                        onChange={(e) => setRfqFabricComposition(e.target.value)}
                        placeholder="e.g. 100% Cotton"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Yarn Count</label>
                      <input 
                        type="text" 
                        value={rfqYarnCount}
                        onChange={(e) => setRfqYarnCount(e.target.value)}
                        placeholder="e.g. 30s Combed"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {newRfqType === "Service" && (
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Service Scope Outline</label>
                    <input 
                      type="text" 
                      value={rfqServiceScope}
                      onChange={(e) => setRfqServiceScope(e.target.value)}
                      placeholder="e.g. Fabric piece heat-setting and dynamic chemical wash sizing"
                      className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:outline-none"
                    />
                  </div>
                )}

                {newRfqType === "Works" && (
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Construction Details / Pattern Specs</label>
                    <input 
                      type="text" 
                      value={rfqConstructionSpecs}
                      onChange={(e) => setRfqConstructionSpecs(e.target.value)}
                      placeholder="e.g. Double knit interlock stitch, 18 Gauge machine setup"
                      className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Sourcing terms & L/C Deliverables</label>
                  <textarea 
                    value={rfqTerms}
                    onChange={(e) => setRfqTerms(e.target.value)}
                    placeholder="e.g. 30% Advance, 70% LC at sight. Delivery at Gazipur warehouse location."
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs h-12 focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Buyer Urgency Level</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setNewRfqUrgency(u as any)}
                      className={`flex-1 py-1.5 rounded border text-[10px] font-bold uppercase transition ${
                        newRfqUrgency === u 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddRfq(false)} 
                  className="flex-1 py-2 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold uppercase text-[10px] hover:bg-blue-700"
                >
                  Launch Tender
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Add Plan Modal */}
      {showAddPlan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Book Seasonal Season Plan</h3>
              <button onClick={() => setShowAddPlan(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitPlan} className="space-y-3 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Yarn / Accessory Title</label>
                <input 
                  type="text" 
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g. Organic Cotton Thread or Zippers"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Allocated Budget ($ USD)</label>
                  <input 
                    type="text" 
                    value={newPlanBudget}
                    onChange={(e) => setNewPlanBudget(e.target.value)}
                    placeholder="e.g. $45,000"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bulk Target volume</label>
                  <input 
                    type="text" 
                    value={newPlanQty}
                    onChange={(e) => setNewPlanQty(e.target.value)}
                    placeholder="e.g. 50,050 Cones"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">In-house target Date</label>
                <input 
                  type="date" 
                  value={newPlanDate}
                  onChange={(e) => setNewPlanDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddPlan(false)} 
                  className="flex-1 py-2 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold uppercase text-[10px] hover:bg-blue-700"
                >
                  Confirm seasonal slot
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Add Work Order Modal */}
      {showAddWO && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Issue Letter of Intent & WO</h3>
              <button onClick={() => setShowAddWO(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitWO} className="space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Associated RFQ ID</label>
                  <select 
                    value={newWoRfqId}
                    onChange={(e) => {
                      setNewWoRfqId(e.target.value);
                      const target = rfqs.find(r => r.id === e.target.value);
                      if (target) {
                        setNewWoMaterial(target.material);
                        setNewWoQty(target.quantity);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                    required
                  >
                    <option value="">Choose RFQ...</option>
                    {rfqs.map(r => (
                      <option key={r.id} value={r.id}>#{r.id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Awarded Vendor / Mill</label>
                  <select 
                    value={newWoVendor}
                    onChange={(e) => setNewWoVendor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                    required
                  >
                    <option value="">Choose Supplier...</option>
                    <option value="Mondol Fabrics Ltd.">Mondol Fabrics Ltd.</option>
                    <option value="Standard Trims & Acc.">Standard Trims & Acc.</option>
                    <option value="Hameem Tex Pro">Hameem Tex Pro</option>
                    <option value="KDS Accessories">KDS Accessories</option>
                    <option value="Coats Bangladesh">Coats Bangladesh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Material / Good Specification</label>
                <input 
                  type="text" 
                  value={newWoMaterial}
                  onChange={(e) => setNewWoMaterial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Volume Quantity</label>
                <input 
                  type="text" 
                  value={newWoQty}
                  onChange={(e) => setNewWoQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Spinning Date</label>
                  <input 
                    type="date" 
                    value={newWoStart}
                    onChange={(e) => setNewWoStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target End Delivery Date</label>
                  <input 
                    type="date" 
                    value={newWoEnd}
                    onChange={(e) => setNewWoEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddWO(false)} 
                  className="flex-1 py-2 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold uppercase text-[10px] hover:bg-blue-700"
                >
                  Issue Work Order
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

         {/* 4. Trigger QC Inspection Modal - Mobile-Optimized Advanced Quality Control Portal */}
      {showAddQC && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 w-full max-w-lg p-5 rounded-lg shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Garment QC Audit Logging</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Mobile-optimized physical lot testing guidelines</p>
              </div>
              <button onClick={() => setShowAddQC(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitQC} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Target Active Work Order / Delivery</label>
                <select 
                  value={selectedWoForQc}
                  onChange={(e) => {
                    setSelectedWoForQc(e.target.value);
                    const matchedWO = workOrders.find(w => w.id === e.target.value);
                    if (matchedWO) {
                      setNewQcColor("Standard Navy");
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select active target WO...</option>
                  {workOrders.map(w => (
                    <option key={w.id} value={w.id}>#{w.id} - {w.vendorName.slice(0, 15)} (Qty: {w.quantity})</option>
                  ))}
                </select>
              </div>

              {/* Physical Fabric Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Measured GSM (Weight)</label>
                  <input 
                    type="number" 
                    value={newQcGsm}
                    onChange={(e) => setNewQcGsm(parseInt(e.target.value) || 180)}
                    placeholder="e.g. 180"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:outline-none focus:bg-white focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Color Shade Match Assessment</label>
                  <input 
                    type="text" 
                    value={newQcColor}
                    onChange={(e) => setNewQcColor(e.target.value)}
                    placeholder="e.g. Indigo Shade Grade-A"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Acceptable Quality Limit (AQL) Interactive rules engine */}
              <div className="bg-slate-50 border border-slate-150 rounded p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-extrabold text-slate-700 text-[10px] uppercase">AQL Standard Limit</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-100/60 text-blue-800 rounded font-bold uppercase tracking-wider">Interactive Matrix Calculator</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">AQL Level</label>
                    <select 
                      value={newQcAqlStandard}
                      onChange={(e) => setNewQcAqlStandard(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-bold"
                    >
                      <option value="1.5">1.5% Strict</option>
                      <option value="2.5">2.5% General</option>
                      <option value="4.0">4.0% Relaxed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Sample Size (Pcs)</label>
                    <select 
                      value={newQcSampleSize}
                      onChange={(e) => setNewQcSampleSize(parseInt(e.target.value) || 80)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-mono font-bold"
                    >
                      <option value="20">20 pcs</option>
                      <option value="32">32 pcs</option>
                      <option value="50">50 pcs</option>
                      <option value="80">80 pcs</option>
                      <option value="125">125 pcs</option>
                      <option value="200">200 pcs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Defects Found</label>
                    <input 
                      type="number"
                      min="0"
                      value={newQcDefectsCount}
                      onChange={(e) => {
                        const count = Math.max(0, parseInt(e.target.value) || 0);
                        setNewQcDefectsCount(count);
                        
                        // Recalculate defect rate for backward compatibility metrics
                        const rate = parseFloat(((count / newQcSampleSize) * 100).toFixed(1));
                        setNewQcDefectRate(rate);

                        const limits = getAqlLimits(newQcSampleSize, newQcAqlStandard);
                        if (count <= limits.ac) {
                          setNewQcStatus("Passed");
                        } else if (count >= limits.re) {
                          setNewQcStatus("Failed");
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-mono font-bold text-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calculate business rules live */}
                {(() => {
                  const limits = getAqlLimits(newQcSampleSize, newQcAqlStandard);
                  const isAqlPass = newQcDefectsCount <= limits.ac;
                  return (
                    <div className={`p-2 rounded text-[11px] font-sans flex items-center justify-between border ${
                      isAqlPass 
                        ? "bg-green-50 text-green-800 border-green-200" 
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}>
                      <div>
                        <p className="font-extrabold uppercase">AQL Standards Evaluator:</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Allowed defects to PASS: <strong className="font-bold text-slate-700">{limits.ac}</strong> or fewer. 
                          REJECT on {limits.re}+ defects.
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded font-black text-[10px] uppercase tracking-wider ${
                        isAqlPass ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}>
                        {isAqlPass ? "AQL Pass" : "AQL Reject"}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Photo Loading (Connects to Firebase Storage / base64 fallback) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Upload Defect Photo / Camera Verification</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition cursor-pointer relative text-center">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // 1. Immediate local base64 fallback so there is always a preview
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewQcPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);

                        // 2. Perform live Firebase Storage upload
                        setQcPhotoUploading(true);
                        setQcPhotoUploadProgress(0);
                        setQcPhotoUploadError(null);

                        try {
                          const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
                          const fileRef = ref(storage, `inspections/${Date.now()}_${file.name}`);
                          const uploadTask = uploadBytesResumable(fileRef, file);

                          uploadTask.on(
                            "state_changed",
                            (snapshot) => {
                              const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                              );
                              setQcPhotoUploadProgress(progress);
                            },
                            (error) => {
                              console.error("Firebase Storage upload failed, using offline file preview:", error);
                              setQcPhotoUploadError("Storage unavailable. Offline preview stored.");
                              setQcPhotoUploading(false);
                            },
                            async () => {
                              try {
                                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                                setNewQcPhotoUrl(downloadUrl);
                                setQcPhotoUploadError(null);
                              } catch (err) {
                                console.error("Failed to fetch download url:", err);
                              } finally {
                                setQcPhotoUploading(false);
                                setQcPhotoUploadProgress(null);
                              }
                            }
                          );
                        } catch (err) {
                          console.error("Storage module load failed:", err);
                          setQcPhotoUploadError("Offline local preview stored.");
                          setQcPhotoUploading(false);
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={qcPhotoUploading}
                  />
                  {qcPhotoUploading ? (
                    <div className="space-y-2 py-3">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
                      <p className="text-[10px] font-bold text-slate-600">Uploading to Firebase Storage...</p>
                      {qcPhotoUploadProgress !== null && (
                        <div className="w-32 bg-slate-200 h-1 rounded-full mx-auto overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full transition-all duration-150" 
                            style={{ width: `${qcPhotoUploadProgress}%` }}
                          />
                        </div>
                      )}
                      <p className="text-[9px] text-slate-400 font-mono">{qcPhotoUploadProgress || 0}%</p>
                    </div>
                  ) : newQcPhotoUrl ? (
                    <div className="relative inline-block mt-1">
                      <img 
                        src={newQcPhotoUrl} 
                        alt="Defect Preview" 
                        className="h-20 w-auto rounded border border-slate-300 shadow-2xs object-cover" 
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          setNewQcPhotoUrl("");
                          setQcPhotoUploadError(null);
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white p-0.5 rounded-full z-20 shadow-xs hover:bg-red-700 font-bold"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {qcPhotoUploadError ? (
                        <p className="text-[9px] text-amber-600 font-semibold mt-1">{qcPhotoUploadError}</p>
                      ) : (
                        <p className="text-[9px] text-green-600 font-semibold mt-1">✓ Uploaded to Secure Cloud Storage</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <Upload className="w-5 h-5 mx-auto text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-600">Select Image File or Use Device Camera</p>
                      <p className="text-[9px] text-slate-400">Loads local device image securely to state</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ultimate Action / Disposition Selection (Pass/Hold/Reject) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">Final Inspection Status Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Passed", label: "Accept / Pass", color: "border-green-300 text-green-700 bg-green-50/50 hover:bg-green-50", activeColor: "bg-green-600 border-green-600 text-white" },
                    { id: "Hold", label: "Quarantine / Hold", color: "border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-50", activeColor: "bg-amber-500 border-amber-500 text-white" },
                    { id: "Failed", label: "Reject Fabric", color: "border-red-300 text-red-700 bg-red-50/50 hover:bg-red-50", activeColor: "bg-red-600 border-red-600 text-white" }
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setNewQcStatus(act.id as any)}
                      className={`py-2 px-1 text-[10px] font-mono font-black border uppercase tracking-wider rounded-md text-center transition ${
                        newQcStatus === act.id ? act.activeColor : `${act.color}`
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Detailed Defect Log & Findings Notes</label>
                <textarea 
                  value={newQcFindings}
                  onChange={(e) => setNewQcFindings(e.target.value)}
                  placeholder="e.g. Horizontal spinning bar defects observed on batch. GSM tolerance checks valid, but quarantined for shade band verification."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs h-16 focus:outline-none focus:bg-white focus:border-blue-500 transition"
                  required
                ></textarea>
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddQC(false)} 
                  className="flex-1 py-2 border border-slate-200 rounded-md hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-1 bg-blue-600 text-white rounded-md font-bold uppercase text-[10px] hover:bg-blue-700 shadow-md hover:shadow-lg transition"
                >
                  Commit Lot Audit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. Submit Bid Modal */}
      {showAddBid && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Submit Sourcing Quotation Bid</h3>
              <button onClick={() => setShowAddBid(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitBid} className="space-y-2.5 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Associated RFP / RFQ ID</label>
                <select 
                  value={bidRfqId}
                  onChange={(e) => setBidRfqId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                  required
                >
                  {rfqs.map(r => (
                    <option key={r.id} value={r.id}>#{r.id} - {r.material.slice(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Spinning / Dyeing Mill Vendor</label>
                <input 
                  type="text" 
                  value={bidVendorName}
                  onChange={(e) => setBidVendorName(e.target.value)}
                  placeholder="e.g. Mondol Fabrics, Standard Acc"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price specification</label>
                  <input 
                    type="text" 
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="e.g. $3.25/Kg"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lead Time (Days)</label>
                  <input 
                    type="number" 
                    value={bidLeadTime}
                    onChange={(e) => setBidLeadTime(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Compliance Score Alignment (1.0 to 10.0)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="1"
                  max="10"
                  value={bidScore}
                  onChange={(e) => setBidScore(e.target.value)}
                  placeholder="e.g. 9.4"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white font-mono"
                  required
                />
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddBid(false)} 
                  className="flex-1 py-2 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold uppercase text-[10px] hover:bg-blue-700"
                >
                  Submit Official Bid
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. Document Upload Modal */}
      {showDocUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[9px] bg-amber-100 text-amber-850 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Compliance Credential Verification
                </span>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mt-1">
                  Upload Supplier Credentials
                </h3>
              </div>
              <button onClick={() => setShowDocUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitDocUpload} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Vendor / Mill</label>
                <div className="p-2.5 bg-slate-55 rounded border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50">
                  {vendors.find(v => v.id === selectedDocVendorId)?.name || "Vendor Mill Association"} ({selectedDocVendorId})
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Credential Document Class</label>
                <select 
                  value={docTypeToUpload}
                  onChange={(e: any) => setDocTypeToUpload(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500 font-bold"
                  required
                >
                  <option value="Trade License">Trade License (City Corp / Pouroshova)</option>
                  <option value="BIN">BIN (Business Identification Number - NBR)</option>
                  <option value="TIN">TIN (Tax Identification Number - NBR)</option>
                  <option value="Solvency Certificate">Solvency Certificate (Authorised Bank)</option>
                </select>
              </div>

              {/* Simulated Drag & Drop Upload Zone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">File Attachment Spec</label>
                <div className="border border-dashed border-slate-200 rounded-lg p-5 text-center hover:bg-slate-50/50 hover:border-blue-400 transition cursor-pointer relative bg-slate-50/20">
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-[10px] text-slate-600 font-bold">Drag & Drop certificate files or click to browse</p>
                    <p className="text-[8.5px] text-slate-450">Supports PDF scanner output and high-resolution JPEG captures</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Document File Name</label>
                <input 
                  type="text" 
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  placeholder="e.g. trade_lic_renewed_2026.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Validity Expiry Date</label>
                <input 
                  type="date" 
                  value={docExpiryDate}
                  onChange={(e) => setDocExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  required
                />
                <span className="text-[9px] text-slate-400 block mt-1.5 italic">Note: System fires automatic notifications and places status alert holds 30 days prior.</span>
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowDocUploadModal(false)} 
                  className="flex-1 py-2 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold uppercase text-[10px] hover:bg-blue-700"
                >
                  Verify compliance & upload
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 7. Send RFQ Invite Modal */}
      {showSendRfqModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded shadow-xl text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Outbound Supplier Dispatch
                </span>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mt-1">
                  Send RFQ to Approved Mills
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowSendRfqModal(false);
                  setSelectedVendorsToSend([]);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={executeSendRfq} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Active RFQ Target Specifications</label>
                <div className="p-2.5 bg-slate-50 border rounded text-xs space-y-1">
                  <div className="flex justify-between font-extrabold">
                    <span className="text-blue-600 font-mono">#{sendRfqTargetId}</span>
                    <span className="text-slate-800">
                      {rfqs.find(r => r.id === sendRfqTargetId)?.material || "Sourcing Good Specs"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Quantity: {rfqs.find(r => r.id === sendRfqTargetId)?.quantity}</span>
                    <span>Target Date: {rfqs.find(r => r.id === sendRfqTargetId)?.targetDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Target Mills / Suppliers</label>
                  <button 
                    type="button"
                    onClick={() => {
                      if (selectedVendorsToSend.length === vendors.length) {
                        setSelectedVendorsToSend([]);
                      } else {
                        setSelectedVendorsToSend(vendors.map(v => v.id));
                      }
                    }}
                    className="text-[9px] text-blue-600 hover:underline font-bold"
                  >
                    {selectedVendorsToSend.length === vendors.length ? "Deselect All" : "Select All Approved"}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 p-2 rounded bg-slate-50/50">
                  {vendors.map((v) => {
                    const isChecked = selectedVendorsToSend.includes(v.id);
                    return (
                      <label 
                        key={v.id} 
                        className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition ${
                          isChecked 
                            ? "bg-blue-50/40 border-blue-200" 
                            : "bg-white border-slate-150 hover:bg-slate-50"
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedVendorsToSend(prev => prev.filter(id => id !== v.id));
                            } else {
                              setSelectedVendorsToSend(prev => [...prev, v.id]);
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1 text-[11px]">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{v.name}</span>
                            <span className="text-[9px] bg-slate-150 text-slate-500 font-mono px-1 rounded">{v.id}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                            <span>Specialty: {v.scope}</span>
                            <span className="text-amber-600 font-semibold">{v.tier}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Channels Toggle */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Dispatch Delivery Channels</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-slate-50 border rounded flex items-center gap-2">
                    <Check className="text-emerald-500 w-3.5 h-3.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">In-App Portal</span>
                      <p className="text-[9px] text-slate-400">Instant notification to vendor node.</p>
                    </div>
                  </div>
                  
                  <label className={`p-2 border rounded flex items-center gap-2 cursor-pointer transition ${
                    emailSimulationChannel ? "bg-emerald-50/30 border-emerald-200" : "bg-slate-50"
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={emailSimulationChannel} 
                      onChange={(e) => setEmailSimulationChannel(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800">SMTP Email Simulation</span>
                      <p className="text-[9px] text-slate-400 font-medium">Secure fiber dispatch log.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Real-time Email SMTP simulation block */}
              {emailSimulationChannel && selectedVendorsToSend.length > 0 && (
                <div className="bg-slate-900 text-white rounded p-3 font-mono text-[10px] leading-relaxed space-y-1 border border-slate-950">
                  <span className="text-slate-400 border-b border-slate-800 pb-1 mb-1 block uppercase font-bold text-[8.5px]">SMTP Relay Log Envelope (Active Node):</span>
                  <p><span className="text-blue-400">HELO</span> smtp.bangladeshfiberportal.com.bd</p>
                  <p><span className="text-blue-400">MAIL FROM:</span> &lt;procure@standardgroup-bd.com&gt;</p>
                  <p><span className="text-blue-400">RCPT TO:</span> {selectedVendorsToSend.map(id => {
                    const emp = vendors.find(v => v.id === id)?.email;
                    return emp ? `<${emp}>` : null;
                  }).filter(Boolean).join(", ")}</p>
                  <p><span className="text-blue-400">DATA:</span> Subject: RFQ Invitation for {rfqs.find(r => r.id === sendRfqTargetId)?.material}</p>
                </div>
              )}

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowSendRfqModal(false);
                    setSelectedVendorsToSend([]);
                  }} 
                  className="flex-1 py-2 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={selectedVendorsToSend.length === 0}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white rounded font-bold uppercase text-[10px]"
                >
                  Confirm Sourcing Dispatch
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. Invoice Logging Dialog Modal - 3-Way Match Verification Center */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md p-5 rounded-lg shadow-2xl text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Audit & Register Supplier Invoice</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Enforces 3-Way Match Verification system</p>
              </div>
              <button onClick={() => setShowAddPayment(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitPayment} className="space-y-3.5">
              {/* Linked work order selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Target Work Order / Delivery Contract</label>
                <select 
                  value={paymentOrderId}
                  onChange={(e) => {
                    const orderId = e.target.value;
                    setPaymentOrderId(orderId);
                    const matchedWO = workOrders.find(w => w.id === orderId);
                    if (matchedWO) {
                      setPaymentVendorName(matchedWO.vendorName);
                      // Set default amounts using work order quantities as PO value
                      setPaymentPoAmount(`$${(parseInt(matchedWO.quantity.replace(/[^0-9]/g, "")) * 2.5).toLocaleString()}`);
                      setPaymentInvoiceAmount(`$${(parseInt(matchedWO.quantity.replace(/[^0-9]/g, "")) * 2.5).toLocaleString()}`);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select Delivery Contract...</option>
                  {workOrders.map(w => (
                    <option key={w.id} value={w.id}>#{w.id} - {w.material.slice(0, 20)}... ({w.vendorName})</option>
                  ))}
                </select>
              </div>

              {/* Supplier Info and Invoice ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Supplier / Vendor Name</label>
                  <input 
                    type="text" 
                    value={paymentVendorName}
                    readOnly
                    placeholder="Auto-derived"
                    className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-xs font-semibold text-slate-600 cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Supplier Invoice Number</label>
                  <input 
                    type="text" 
                    value={paymentInvoiceId}
                    onChange={(e) => setPaymentInvoiceId(e.target.value)}
                    placeholder="e.g. INV-2024-99P"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono uppercase focus:outline-none focus:bg-white focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Amount Matching and variance tracker */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded border border-slate-150 font-sans">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Contract PO Amount Cap ($)</label>
                  <input 
                    type="text" 
                    value={paymentPoAmount}
                    onChange={(e) => setPaymentPoAmount(e.target.value)}
                    placeholder="e.g. $15,000"
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-mono font-bold text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Supplier Billed Amount ($)</label>
                  <input 
                    type="text" 
                    value={paymentInvoiceAmount}
                    onChange={(e) => setPaymentInvoiceAmount(e.target.value)}
                    placeholder="e.g. $15,000"
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-mono font-bold text-blue-700"
                    required
                  />
                </div>
              </div>

              {/* Match Checker Notice */}
              {(() => {
                const pVal = parseFloat(paymentPoAmount.replace(/[^0-9.]/g, "")) || 0;
                const iVal = parseFloat(paymentInvoiceAmount.replace(/[^0-9.]/g, "")) || 0;
                const matches = Math.abs(pVal - iVal) < 1;
                return (
                  <div className={`p-2 rounded text-[11px] flex items-center justify-between border ${
                    matches 
                      ? "bg-green-50 text-green-800 border-green-200" 
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}>
                    <span>
                      Matching Checker: <strong>{matches ? "Fully Aligned Match" : "Variance Discrepancy Found"}</strong>
                    </span>
                    <span className="font-mono text-[10px]">Diff: ${(iVal - pVal).toLocaleString()}</span>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Invoice Payment Due Date</label>
                  <input 
                    type="date" 
                    value={paymentDueDate}
                    onChange={(e) => setPaymentDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Internal Review Comments & Term Checking</label>
                <textarea 
                  value={paymentComment}
                  onChange={(e) => setPaymentComment(e.target.value)}
                  placeholder="e.g. Matching 30% advance payout for denim spinning yarn delivery. QC lot passed AQL requirements."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs h-16 h-16 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2 border-b-0">
                <button 
                  type="button" 
                  onClick={() => setShowAddPayment(false)} 
                  className="flex-1 py-2 border border-slate-200 rounded-md hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600 text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md font-bold uppercase text-[10px] hover:bg-blue-700 shadow-md transition text-center"
                >
                  Register & Lock Invoice
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 8. ForeCast Modal */}
      {showForecastModal && selectedPlanForForecast && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-lg p-5 rounded-xl shadow-xl flex flex-col max-h-[95vh]"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                  {lang === "BN" ? "মাসিক চাহিদা প্রক্ষেপণ সম্পাদন" : "Edit Seasonal Monthly Forecasts"}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Plan: <span className="font-bold text-blue-600">#{selectedPlanForForecast.id}</span> • {selectedPlanForForecast.itemName}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowForecastModal(false);
                  setSelectedPlanForForecast(null);
                }} 
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitForecast} className="space-y-4 text-left overflow-y-auto pr-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">{lang === "BN" ? "বাজেট ক্যাপ" : "Total Plan Budget"}:</span>
                  <span className="font-black text-slate-900">{selectedPlanForForecast.budget}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">{lang === "BN" ? "পরিমাণ ক্যাপ" : "Total Plan Quantity"}:</span>
                  <span className="font-bold text-slate-800">{selectedPlanForForecast.quantity}</span>
                </div>
              </div>

              <div className="space-y-3.5 pt-1">
                {tempForecasts.map((forecast, idx) => (
                  <div key={forecast.month} className="grid grid-cols-12 gap-3 items-center bg-slate-50/30 border border-slate-150 p-3 rounded-lg">
                    <div className="col-span-4">
                      <span className="text-xs font-extrabold text-slate-800">{forecast.month}</span>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[8.5px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                      <input 
                        type="number"
                        value={forecast.qty === 0 ? "" : forecast.qty}
                        onChange={(e) => {
                          const updated = [...tempForecasts];
                          updated[idx] = { ...updated[idx], qty: parseInt(e.target.value) || 0 };
                          setTempForecasts(updated);
                        }}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[8.5px] font-bold text-slate-400 uppercase mb-1">Budget ($)</label>
                      <input 
                        type="number"
                        value={forecast.budget === 0 ? "" : forecast.budget}
                        onChange={(e) => {
                          const updated = [...tempForecasts];
                          updated[idx] = { ...updated[idx], budget: parseInt(e.target.value) || 0 };
                          setTempForecasts(updated);
                        }}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total checking */}
              {(() => {
                const totalCalculatedBudget = tempForecasts.reduce((sum, f) => sum + f.budget, 0);
                const planBudgetNum = parseFloat(selectedPlanForForecast.budget.replace(/[^0-9.]/g, "")) || 0;
                const matches = totalCalculatedBudget <= planBudgetNum;
                return (
                  <div className={`p-2.5 rounded text-[11px] flex items-center justify-between border ${
                    matches 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    <span>
                      {lang === "BN" ? "পূর্বাভাসকৃত মোট বাজেট" : "Sum of Forecast Budgets"}: <strong>${totalCalculatedBudget.toLocaleString()}</strong>
                    </span>
                    <span className="font-semibold text-[10px]">
                      {matches ? "Within Limits" : `Budget Overdraft by $${(totalCalculatedBudget - planBudgetNum).toLocaleString()}`}
                    </span>
                  </div>
                );
              })()}

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForecastModal(false);
                    setSelectedPlanForForecast(null);
                  }} 
                  className="flex-1 py-1.5 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600 text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded font-bold uppercase text-[10px] hover:from-blue-700 hover:to-blue-800 shadow-md transition text-center"
                >
                  Save Forecast Matrix
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 9. Add ToR Modal */}
      {showAddTorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-lg p-5 rounded-xl shadow-xl flex flex-col max-h-[95vh] text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 font-sans">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                  {lang === "BN" ? "নতুন কাজের বিবরণী (ToR) খসড়া করুন" : "Draft New Terms of Reference (ToR)"}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Publish consultative tasks to recruit strategic supply chain advisors
                </p>
              </div>
              <button onClick={() => setShowAddTorModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitTor} className="space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ToR Assignment Title</label>
                <input 
                  type="text" 
                  value={newTorTitle}
                  onChange={(e) => setNewTorTitle(e.target.value)}
                  placeholder="e.g. ESG Sustainability Framework Design & Audit Advisor"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Scope of Consulting Work</label>
                <textarea 
                  value={newTorScope}
                  onChange={(e) => setNewTorScope(e.target.value)}
                  placeholder="Detailed guidelines for sustainability certification audit roadmap, mill scoring standards..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs h-16 focus:outline-none focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Advisor Description / Objective</label>
                <input 
                  type="text" 
                  value={newTorDesc}
                  onChange={(e) => setNewTorDesc(e.target.value)}
                  placeholder="e.g. Formulate ESG assessment blueprints for tier-1 & tier-2 mill partners."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expert Domain / Role Category</label>
                  <select 
                    value={newTorExpert}
                    onChange={(e) => setNewTorExpert(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                    required
                  >
                    <option value="ESG & Sustainability Expert font-bold">ESG & Sustainability Expert</option>
                    <option value="Cotton Quality Inspector Consultant">Cotton Quality Inspector Consultant</option>
                    <option value="Customs & Export Trade Specialist">Customs & Export Specialist</option>
                    <option value="Advanced Spinning Tech Advisor">Advanced Spinning Tech Advisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Budget</label>
                  <input 
                    type="text" 
                    value={newTorBudget}
                    onChange={(e) => setNewTorBudget(e.target.value)}
                    placeholder="e.g. $35,000"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Technical Weight (%)</label>
                  <input 
                    type="number" 
                    value={newTorTechWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewTorTechWeight(val);
                      setNewTorFinWeight(Math.max(0, 100 - val));
                    }}
                    placeholder="70"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none text-center font-mono font-bold"
                    min="1"
                    max="99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Financial Weight (%)</label>
                  <input 
                    type="number" 
                    value={newTorFinWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewTorFinWeight(val);
                      setNewTorTechWeight(Math.max(0, 100 - val));
                    }}
                    placeholder="30"
                    className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-xs text-center cursor-not-allowed font-mono text-slate-500 font-bold"
                    min="1"
                    max="99"
                    readOnly
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Submit Deadline</label>
                  <input 
                    type="date" 
                    value={newTorDeadline}
                    onChange={(e) => setNewTorDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddTorModal(false)} 
                  className="flex-1 py-1.5 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600 text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded font-bold uppercase text-[10px] hover:bg-blue-700 shadow-md transition text-center"
                >
                  Confirm ToR Draft
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 10. Add Evaluation Scoresheet Modal */}
      {showAddEvalModal && selectedTorIdForEvaluation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-sm p-5 rounded-xl shadow-xl flex flex-col max-h-[95vh] text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                  {lang === "BN" ? "পরামর্শক দরপত্র মূল্যায়ন এন্ট্রি" : "Score Consultant Bid Proposal"}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Assessing bids for ToR: <span className="font-bold text-blue-600">#{selectedTorIdForEvaluation}</span>
                </p>
              </div>
              <button onClick={() => setShowAddEvalModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitEvaluation} className="space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Consulting Firm / Expert Name</label>
                <input 
                  type="text" 
                  value={newEvalConsultant}
                  onChange={(e) => setNewEvalConsultant(e.target.value)}
                  placeholder="e.g. Apex Sustainability Advisors Co."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-sans">Financial Proposal Price ($ USD)</label>
                <input 
                  type="number" 
                  value={newEvalProposal === 0 ? "" : newEvalProposal}
                  onChange={(e) => setNewEvalProposal(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 24000"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:bg-white font-mono"
                  required
                />
              </div>

              <div className="space-y-2 border border-slate-150 p-3 rounded bg-slate-50/40">
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Technical Criteria Scoring (0 - 100%)</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-400 uppercase mb-1">Prior Experience</label>
                    <input 
                      type="number" 
                      value={newEvalExpScore}
                      onChange={(e) => setNewEvalExpScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-center font-bold"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-400 uppercase mb-1">Methodology</label>
                    <input 
                      type="number" 
                      value={newEvalMethodScore}
                      onChange={(e) => setNewEvalMethodScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-center font-bold"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-400 uppercase mb-1">Team Strength</label>
                    <input 
                      type="number" 
                      value={newEvalTeamScore}
                      onChange={(e) => setNewEvalTeamScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-center font-bold"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3 mt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddEvalModal(false)} 
                  className="flex-1 py-1.5 border border-slate-200 rounded hover:bg-slate-100 font-bold uppercase text-[10px] text-slate-600 text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded font-bold uppercase text-[10px] hover:bg-blue-700 shadow-md transition text-center"
                >
                  Register Score Card
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
