'use client';

import { useState, useEffect } from "react";

export interface VendorDocument {
  name: "Trade License" | "BIN" | "TIN" | "Solvency Certificate";
  fileName: string;
  uploadDate: string;
  expiryDate: string; // YYYY-MM-DD
  status: "Valid" | "Expiring Soon" | "Expired" | "Pending Upload";
}

export interface Vendor {
  id: string;
  name: string;
  tier: "Gold Tier" | "Platinum Tier" | "Silver Tier" | "Strategic Alliance";
  rating: string;
  scope: string;
  contact: string;
  email: string;
  phone: string;
  logo: string;
  documents: {
    tradeLicense?: VendorDocument;
    bin?: VendorDocument;
    tin?: VendorDocument;
    solvency?: VendorDocument;
  };
}

export interface RFQ {
  id: string;
  type: "Goods" | "Service" | "Works";
  material: string;
  quantity: string;
  targetDate: string;
  bidsCount: number;
  status: "Bidding Open" | "Reviewing" | "Approving NOA" | "Completed" | "Pending Draft";
  urgency: "High" | "Medium" | "Low";
  
  // High density specifications
  gsm?: string;
  fabricComposition?: string;
  yarnCount?: string;
  serviceScope?: string;
  constructionSpecs?: string;
  termsAndConditions?: string;

  // Real-time vendor communication log
  sentToVendors?: string[]; // IDs of vendors selected
  sentLogs?: Array<{
    vendorId: string;
    vendorName: string;
    timestamp: string;
    method: "In-App" | "Email";
    emailAddress: string;
  }>;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  pricePerUnit: string;
  leadTimeDays: number;
  complianceScore: number; // 0-10
  paymentTerms: string; // "30% Advance, 70% LC", "Net 30", etc.
  specialNotes: string;
  isPreferred: boolean;
}

export interface CommitteeStep {
  role: string;
  name: string;
  status: "Pending" | "Approved" | "Rejected";
  comment?: string;
  date?: string;
}

export interface ApprovalComment {
  author: string;
  role: string;
  text: string;
  timestamp: string;
  action: "Approved" | "Rejected" | "Commented";
}

export interface Approval {
  id: string;
  type: "RFQ" | "Quotation" | "NOA" | "Contract" | "Payment";
  title: string;
  requestedBy: string;
  date: string;
  amount?: string;
  status: "Pending" | "Approved" | "Rejected";
  rfqId?: string;
  quotationId?: string;
  currentLevel: number;
  committee: CommitteeStep[];
  comments?: ApprovalComment[];
}

export interface Noa {
  id: string;
  rfqId: string;
  vendorName: string;
  amount: string;
  issueDate: string;
  status: "Pending Signature" | "Signed" | "Declined";
  rfqMaterial?: string;
  rfqQty?: string;
  esignatureSim?: {
    signedBy?: string;
    ipAddress?: string;
    timestamp?: string;
  };
}

export interface Contract {
  id: string;
  rfqId: string;
  vendorName: string;
  terms: string;
  amount: string;
  status: "Draft" | "Under Review" | "Active" | "Terminated";
  contractNo: string;
  createdAt: string;
  material?: string;
  quantity?: string;
  esignatureSim?: {
    vendorSigned: boolean;
    buyerSigned: boolean;
    vendorSignedAt?: string;
    buyerSignedAt?: string;
    buyerSignIp?: string;
    vendorSignIp?: string;
    buyerSignName?: string;
    vendorSignName?: string;
  };
}

export interface WorkOrder {
  id: string;
  rfqId: string;
  vendorName: string;
  material: string;
  quantity: string;
  startDate: string;
  endDate: string;
  status: "Draft" | "Issued" | "In Production" | "Shipped" | "Completed";
  qcStatus: "Pending" | "QC Passed" | "QC Failed";
}

export interface Inspection {
  id: string;
  orderId: string;
  material: string;
  inspectorName: string;
  defectRate: number; // e.g. 1.2
  findings: string;
  status: "Scheduled" | "Passed" | "Hold" | "Failed";
  gsm?: number;
  color?: string;
  sampleSize?: number;
  defectsCount?: number;
  aqlStandard?: "1.5" | "2.5" | "4.0";
  photoUrl?: string; // Base64 image data or placeholder
  checkedAt?: string;
}

export interface ApprovalDetail {
  approver: string;
  approvedAt: string;
  status: "Approved" | "Rejected";
  comment?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  vendorName: string;
  invoiceId: string;
  amount: string;
  invoiceAmount: string;
  poAmount: string;
  matchedStatus: "Fully Matched" | "Variance Detected" | "Unverified";
  dueDate: string;
  createdAt: string;
  comment?: string;
  status: "Pending Sourcing Approver" | "Pending Manager Approver" | "Pending CFO Approver" | "Completed" | "Rejected";
  approvals: {
    level1?: ApprovalDetail;
    level2?: ApprovalDetail;
    level3?: ApprovalDetail;
  };
}

export interface MonthlyAllocation {
  month: string;
  qty: number;
  budget: number;
}

export interface ProcurementPlan {
  id: string;
  itemName: string;
  targetDate: string;
  status: "Draft" | "Plan Approved" | "RFQ Issued" | "On-going";
  quantity: string;
  budget: string;
  monthlyForecast?: MonthlyAllocation[];
}

export interface ToR {
  id: string;
  title: string;
  description: string;
  scopeOfWork: string;
  expertType: string;
  technicalWeight: number; // e.g. 70
  financialWeight: number; // e.g. 30
  budget: string;
  deadline: string;
  status: "Draft" | "Published" | "Evaluated" | "Awarded";
}

export interface ConsultantEvaluation {
  id: string;
  torId: string;
  consultantName: string;
  technicalScores: {
    experience: number;
    methodology: number;
    teamStrength: number;
  };
  financialProposal: number;
  technicalScoreWeighted: number;
  financialScoreWeighted: number;
  totalScore: number;
  status: "Applied" | "Shortlisted" | "Approved" | "Rejected";
}

// Generate dynamic expiry dates for testing/mock alerts relative to today
const getRelativeDateString = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
};

const initialVendors: Vendor[] = [
  {
    id: "VND-MONDOL",
    name: "Mondol Fabrics Ltd.",
    tier: "Gold Tier",
    rating: "9.6/10",
    scope: "Knit & Dyeing Fabrics",
    contact: "Aminul Islam",
    email: "aminul@mondolfabrics.com",
    phone: "+880-1711-234567",
    logo: "M",
    documents: {
      tradeLicense: { name: "Trade License", fileName: "trade_license_mondol_2024.pdf", uploadDate: "2024-01-10", expiryDate: getRelativeDateString(12), status: "Expiring Soon" },
      bin: { name: "BIN", fileName: "bin_cert_mondol.pdf", uploadDate: "2024-01-12", expiryDate: getRelativeDateString(365), status: "Valid" },
      tin: { name: "TIN", fileName: "tin_cert_mondol.pdf", uploadDate: "2024-01-12", expiryDate: getRelativeDateString(365), status: "Valid" },
      solvency: { name: "Solvency Certificate", fileName: "bank_solvency_mondol.pdf", uploadDate: "2024-02-15", expiryDate: getRelativeDateString(180), status: "Valid" }
    }
  },
  {
    id: "VND-STANDARD",
    name: "Standard Trims & Acc.",
    tier: "Platinum Tier",
    rating: "9.2/10",
    scope: "Buttons, Pullers, Elastic",
    contact: "Zahid Ahmed",
    email: "zahid@standardtrims.com",
    phone: "+880-1819-987654",
    logo: "S",
    documents: {
      tradeLicense: { name: "Trade License", fileName: "trade_lic_std_2024.pdf", uploadDate: "2024-01-05", expiryDate: getRelativeDateString(200), status: "Valid" },
      bin: { name: "BIN", fileName: "bin_std_expired.pdf", uploadDate: "2023-01-05", expiryDate: getRelativeDateString(-5), status: "Expired" },
      tin: { name: "TIN", fileName: "tin_std_2024.pdf", uploadDate: "2024-01-05", expiryDate: getRelativeDateString(250), status: "Valid" },
      solvency: { name: "Solvency Certificate", fileName: "bank_solvency_std.pdf", uploadDate: "2024-03-01", expiryDate: getRelativeDateString(120), status: "Valid" }
    }
  },
  {
    id: "VND-HAMEEM",
    name: "Hameem Tex Pro",
    tier: "Silver Tier",
    rating: "8.5/10",
    scope: "Woven & Denim Denim",
    contact: "Mofizur Rahman",
    email: "mofizur@hameemgroup.com",
    phone: "+880-1912-334455",
    logo: "H",
    documents: {
      tradeLicense: { name: "Trade License", fileName: "tl_hameem_24.pdf", uploadDate: "2024-01-15", expiryDate: getRelativeDateString(28), status: "Expiring Soon" },
      bin: { name: "BIN", fileName: "bin_hameem.pdf", uploadDate: "2024-01-15", expiryDate: getRelativeDateString(110), status: "Valid" },
      tin: { name: "TIN", fileName: "tin_hameem.pdf", uploadDate: "2024-01-15", expiryDate: getRelativeDateString(110), status: "Valid" }
    }
  }
];

const initialRfqs: RFQ[] = [
  { 
    id: "RFQ-501", 
    type: "Goods",
    material: "100% Cotton Single Jersey Fabric", 
    quantity: "25,000 Kg", 
    targetDate: getRelativeDateString(15), 
    bidsCount: 3, 
    status: "Bidding Open", 
    urgency: "High",
    gsm: "180",
    fabricComposition: "100% Cotton",
    yarnCount: "30s Combed",
    termsAndConditions: "30% Advance, 70% LC at Sight. Deliver to Gazipur site.",
    sentToVendors: ["VND-MONDOL", "VND-STANDARD", "VND-HAMEEM"],
    sentLogs: [
      { vendorId: "VND-MONDOL", vendorName: "Mondol Fabrics Ltd.", timestamp: new Date().toLocaleString(), method: "Email", emailAddress: "aminul@mondolfabrics.com" },
      { vendorId: "VND-STANDARD", vendorName: "Standard Trims & Acc.", timestamp: new Date().toLocaleString(), method: "In-App", emailAddress: "zahid@standardtrims.com" },
      { vendorId: "VND-HAMEEM", vendorName: "Hameem Tex Pro", timestamp: new Date().toLocaleString(), method: "Email", emailAddress: "mofizur@hameemgroup.com" }
    ]
  },
  { 
    id: "RFQ-502", 
    type: "Goods",
    material: "YKK Invisible Zippers Nylon #3 Black", 
    quantity: "120,000 Pcs", 
    targetDate: getRelativeDateString(10), 
    bidsCount: 1, 
    status: "Reviewing", 
    urgency: "High",
    constructionSpecs: "Nylon teeth, woven polyester tape, lock slider puller",
    termsAndConditions: "Local CAD dispatch. 10 days delivery.",
    sentToVendors: ["VND-KDS", "VND-STANDARD"],
    sentLogs: [
      { vendorId: "VND-KDS", vendorName: "KDS Accessories", timestamp: new Date().toLocaleString(), method: "Email", emailAddress: "tanvir@kdsaccessories.com" },
      { vendorId: "VND-STANDARD", vendorName: "Standard Trims & Acc.", timestamp: new Date().toLocaleString(), method: "In-App", emailAddress: "zahid@standardtrims.com" }
    ]
  }
];

const initialQuotations: Quotation[] = [
  { 
    id: "QTN-99201", 
    rfqId: "RFQ-501", 
    vendorId: "VND-MONDOL",
    vendorName: "Mondol Fabrics Ltd.", 
    pricePerUnit: "$3.20/Kg", 
    leadTimeDays: 14, 
    complianceScore: 9.5, 
    paymentTerms: "30% Advance, 70% LC at sight",
    specialNotes: "Premium ring-spun combed yarn. Delivery in 2 batches.", 
    isPreferred: true 
  },
  { 
    id: "QTN-99202", 
    rfqId: "RFQ-501", 
    vendorId: "VND-STANDARD",
    vendorName: "Standard Trims & Acc.", 
    pricePerUnit: "$3.45/Kg", 
    leadTimeDays: 10, 
    complianceScore: 8.8, 
    paymentTerms: "100% LC at sight",
    specialNotes: "Super fast manufacturing, spinning capability limited but high quality.", 
    isPreferred: false 
  }
];

const initialApprovals: Approval[] = [
  { 
    id: "APP-101", 
    type: "NOA", 
    title: "Award Sourcing RFQ-501 to Mondol Fabrics Ltd.", 
    requestedBy: "Tariqul Islam (Sourcing Lead)", 
    date: getRelativeDateString(-2), 
    amount: "$80,000", 
    status: "Pending",
    rfqId: "RFQ-501",
    currentLevel: 0,
    committee: [
      { role: "Procurement Manager", name: "Imran Khan", status: "Pending" },
      { role: "Director of Sourcing", name: "Farhan Rahman", status: "Pending" },
      { role: "Chief Financial Officer (CFO)", name: "Sajid Chowdhury", status: "Pending" }
    ],
    comments: [
      { author: "Tariqul Islam", role: "Sourcing Lead", text: "Best bid selected based on price ($3.20/kg) and highest compliance rating.", timestamp: getRelativeDateString(-2) + ", 10:15 AM", action: "Commented" }
    ]
  },
  { 
    id: "APP-102", 
    type: "Payment", 
    title: "Approve 30% advance for KDS Accessories Zippers", 
    requestedBy: "Syed Al-Amin", 
    date: getRelativeDateString(-1), 
    amount: "$4,320", 
    status: "Pending",
    currentLevel: 1,
    committee: [
      { role: "Accounts Controller", name: "Rana Tayeb", status: "Approved", comment: "Verified invoice and bank details.", date: getRelativeDateString(-1) },
      { role: "Sourcing Director", name: "Farhan Rahman", status: "Pending" },
      { role: "Executive VP", name: "Sajid Chowdhury", status: "Pending" }
    ],
    comments: [
      { author: "Rana Tayeb", role: "Accounts Controller", text: "Verified packing invoice matches structural layout. Standard 30% release checked.", timestamp: getRelativeDateString(-1) + ", 11:30 AM", action: "Approved" }
    ]
  }
];

const initialNoas: Noa[] = [
  {
    id: "NOA-301",
    rfqId: "RFQ-501",
    vendorName: "Mondol Fabrics Ltd.",
    amount: "$80,000",
    issueDate: getRelativeDateString(-5),
    status: "Signed",
    rfqMaterial: "100% Cotton Single Jersey Fabric",
    rfqQty: "25,000 Kg",
    esignatureSim: {
      signedBy: "Aminul Islam (Supplier Rep)",
      ipAddress: "203.4.177.12",
      timestamp: getRelativeDateString(-4) + ", 03:45 PM"
    }
  }
];

const initialContracts: Contract[] = [
  {
    id: "CON-401",
    rfqId: "RFQ-501",
    vendorName: "Mondol Fabrics Ltd.",
    terms: "Core Standard Garment Purchasing Clauses:\n\n1. Payment terms: Sight Letter of Credit (L/C) 100% issued within 7 bank days from contract signing.\n2. Quantity tolerance: Quantity variations up to +/- 1.5% in knitted garments are allowed.\n3. QC Standards: Standard Group internal QC inspection is final. Defect rate must not exceed 2.0%.\n4. Delivery terms: Carriage Paid To (CPT) Gazipur Central Warehouse.",
    amount: "$80,000",
    status: "Active",
    contractNo: "SG-CON-2026-8801",
    createdAt: getRelativeDateString(-4),
    material: "100% Cotton Single Jersey Fabric",
    quantity: "25,000 Kg",
    esignatureSim: {
      vendorSigned: true,
      buyerSigned: true,
      vendorSignedAt: getRelativeDateString(-4) + ", 04:30 PM",
      buyerSignedAt: getRelativeDateString(-4) + ", 02:15 PM",
      buyerSignIp: "192.168.1.100",
      vendorSignIp: "203.4.177.12",
      buyerSignName: "Tariqul Islam",
      vendorSignName: "Aminul Islam"
    }
  }
];

const initialWorkOrders: WorkOrder[] = [
  { id: "WO-9911", rfqId: "RFQ-501", vendorName: "Mondol Fabrics Ltd.", material: "100% Cotton Single Jersey Fabric", quantity: "25,000 Kg", startDate: getRelativeDateString(2), endDate: getRelativeDateString(16), status: "In Production", qcStatus: "Pending" }
];

const initialInspections: Inspection[] = [
  { 
    id: "INSP-501", 
    orderId: "WO-9911", 
    material: "100% Cotton Single Jersey Fabric", 
    inspectorName: "Masud Rana (Deputy QC)", 
    defectRate: 1.1, 
    findings: "Stretching values, shrinkage bounds fully within 2.5% tolerance. Pass.", 
    status: "Passed",
    gsm: 178,
    color: "Navy Blue Grade A",
    sampleSize: 80,
    defectsCount: 1,
    aqlStandard: "1.5",
    checkedAt: getRelativeDateString(-2)
  }
];

const initialPayments: Payment[] = [
  {
    id: "PAY-201",
    orderId: "WO-9911",
    vendorName: "Mondol Fabrics Ltd.",
    invoiceId: "INV-2026-9011",
    amount: "$50,000",
    invoiceAmount: "$50,000",
    poAmount: "$50,000",
    matchedStatus: "Fully Matched",
    dueDate: getRelativeDateString(10),
    createdAt: getRelativeDateString(-5),
    status: "Pending Manager Approver",
    approvals: {
      level1: { approver: "Tariqul Islam (Sourcing Lead)", approvedAt: getRelativeDateString(-4) + ", 11:30 AM", status: "Approved" }
    }
  },
  {
    id: "PAY-202",
    orderId: "WO-9911",
    vendorName: "Mondol Fabrics Ltd.",
    invoiceId: "INV-2026-9012",
    amount: "$25,000",
    invoiceAmount: "$26,250",
    poAmount: "$25,000",
    matchedStatus: "Variance Detected",
    dueDate: getRelativeDateString(5),
    createdAt: getRelativeDateString(-2),
    status: "Pending Sourcing Approver",
    approvals: {}
  }
];

const initialProcurementPlans: ProcurementPlan[] = [
  { 
    id: "PLN-501", 
    itemName: "100% Cotton Fleece Fab 280GSM", 
    targetDate: getRelativeDateString(30), 
    status: "Plan Approved", 
    quantity: "15,000 Kg", 
    budget: "$60,000",
    monthlyForecast: [
      { month: "Jun 2026", qty: 3000, budget: 12000 },
      { month: "Jul 2026", qty: 4000, budget: 16000 },
      { month: "Aug 2026", qty: 5000, budget: 20000 },
      { month: "Sep 2026", qty: 3000, budget: 12000 }
    ]
  },
  { 
    id: "PLN-502", 
    itemName: "Polyester Mesh Fabric 150GSM", 
    targetDate: getRelativeDateString(45), 
    status: "Plan Approved", 
    quantity: "20,000 Yds", 
    budget: "$40,000",
    monthlyForecast: [
      { month: "Jun 2026", qty: 5000, budget: 10000 },
      { month: "Jul 2026", qty: 5000, budget: 10000 },
      { month: "Aug 2026", qty: 5000, budget: 10000 },
      { month: "Sep 2026", qty: 5000, budget: 10000 }
    ]
  },
  { 
    id: "PLN-503", 
    itemName: "Nylon Taffeta Fab for Windbreakers", 
    targetDate: getRelativeDateString(60), 
    status: "Draft", 
    quantity: "40,000 Yds", 
    budget: "$80,000",
    monthlyForecast: [
      { month: "Jun 2026", qty: 10000, budget: 20000 },
      { month: "Jul 2026", qty: 10000, budget: 20000 },
      { month: "Aug 2026", qty: 10000, budget: 20000 },
      { month: "Sep 2026", qty: 10000, budget: 20000 }
    ]
  }
];

const initialTors: ToR[] = [
  {
    id: "TOR-001",
    title: "Apparel Supply Chain Sustainability Consultant",
    description: "Develop a carbon footprint tracking tool and ESG compliance roadmap for Gazipur mills.",
    scopeOfWork: "Audit 5 dyeing mills, design sustainability scorecard, and deliver compliance gap report.",
    expertType: "ESG & Sustainability Expert",
    technicalWeight: 70,
    financialWeight: 30,
    budget: "$25,000",
    deadline: getRelativeDateString(10),
    status: "Published"
  },
  {
    id: "TOR-002",
    title: "Merchandising Automation Integration Architect",
    description: "Design automated RFQ matching soft to streamline fabric booking workflows across merchandising.",
    scopeOfWork: "Review server architecture, integrate OpenAI and Gemini APIs, and optimize Postgres schemas.",
    expertType: "SaaS Enterprise Architect",
    technicalWeight: 80,
    financialWeight: 20,
    budget: "$40,000",
    deadline: getRelativeDateString(20),
    status: "Draft"
  }
];

const initialEvaluations: ConsultantEvaluation[] = [
  {
    id: "EVL-101",
    torId: "TOR-001",
    consultantName: "Dr. Mashrafe Bin Mortaza (SustainTex Solutions)",
    technicalScores: { experience: 90, methodology: 85, teamStrength: 80 },
    financialProposal: 22000,
    technicalScoreWeighted: 59.5, // (85 average score * 0.70 technical weight)
    financialScoreWeighted: 26.6, // (min_proposal 19500 / 22000) * 30 points
    totalScore: 86.1,
    status: "Shortlisted"
  },
  {
    id: "EVL-102",
    torId: "TOR-001",
    consultantName: "Prof. Tasnim Rahman (GreenEngineers Ltd)",
    technicalScores: { experience: 80, methodology: 80, teamStrength: 75 },
    financialProposal: 19500,
    technicalScoreWeighted: 54.8,
    financialScoreWeighted: 30.0,
    totalScore: 84.8,
    status: "Applied"
  }
];

export function useProcure(passedUser?: any) {
  const firebaseUser = passedUser || null;
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [rfqs, setRfqs] = useState<RFQ[]>(initialRfqs);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
  const [noas, setNoas] = useState<Noa[]>(initialNoas);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [procurementPlans, setProcurementPlans] = useState<ProcurementPlan[]>(initialProcurementPlans);
  const [tors, setTors] = useState<ToR[]>(initialTors);
  const [evaluations, setEvaluations] = useState<ConsultantEvaluation[]>(initialEvaluations);

  // Outbound RFQ emailed lists
  const [emailLogs, setEmailLogs] = useState<Array<{
    id: string;
    rfqId: string;
    rfqMaterial: string;
    vendorName: string;
    email: string;
    timestamp: string;
    status: "Sent" | "Failed";
  }>>([]);

  // Load local mock configs on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedVendors = localStorage.getItem("procure_vendors");
      const storedRfqs = localStorage.getItem("procure_rfqs");
      const storedQuotations = localStorage.getItem("procure_quotations");
      const storedApprovals = localStorage.getItem("procure_approvals");
      const storedNoas = localStorage.getItem("procure_noas");
      const storedContracts = localStorage.getItem("procure_contracts");
      const storedWorkOrders = localStorage.getItem("procure_work_orders");
      const storedInspections = localStorage.getItem("procure_inspections");
      const storedPayments = localStorage.getItem("procure_payments");
      const storedProcurementPlans = localStorage.getItem("procure_plans");
      const storedEmailLogs = localStorage.getItem("procure_email_logs");
      const storedTors = localStorage.getItem("procure_tors");
      const storedEvaluations = localStorage.getItem("procure_evaluations");

      if (storedVendors) setVendors(JSON.parse(storedVendors));
      if (storedRfqs) setRfqs(JSON.parse(storedRfqs));
      if (storedQuotations) setQuotations(JSON.parse(storedQuotations));
      if (storedApprovals) setApprovals(JSON.parse(storedApprovals));
      if (storedNoas) setNoas(JSON.parse(storedNoas));
      if (storedContracts) setContracts(JSON.parse(storedContracts));
      if (storedWorkOrders) setWorkOrders(JSON.parse(storedWorkOrders));
      if (storedInspections) setInspections(JSON.parse(storedInspections));
      if (storedPayments) setPayments(JSON.parse(storedPayments));
      if (storedProcurementPlans) setProcurementPlans(JSON.parse(storedProcurementPlans));
      if (storedEmailLogs) setEmailLogs(JSON.parse(storedEmailLogs));
      if (storedTors) setTors(JSON.parse(storedTors));
      if (storedEvaluations) setEvaluations(JSON.parse(storedEvaluations));
    }
  }, []);

  // Save changes wrapper (pure local fallback)
  const commitDoc = async (col: string, docId: string, data: any) => {
    if (typeof window !== "undefined") {
      if (col === "vendors") localStorage.setItem("procure_vendors", JSON.stringify([data, ...vendors].map(x => x.id === data.id ? data : x).filter((v, idx, self) => self.findIndex(t => t.id === v.id) === idx)));
      else if (col === "rfqs") localStorage.setItem("procure_rfqs", JSON.stringify([data, ...rfqs].map(x => x.id === data.id ? data : x).filter((r, idx, self) => self.findIndex(t => t.id === r.id) === idx)));
      else if (col === "quotations") localStorage.setItem("procure_quotations", JSON.stringify([data, ...quotations].map(x => x.id === data.id ? data : x).filter((q, idx, self) => self.findIndex(t => t.id === q.id) === idx)));
      else if (col === "approvals") localStorage.setItem("procure_approvals", JSON.stringify([data, ...approvals].map(x => x.id === data.id ? data : x).filter((a, idx, self) => self.findIndex(t => t.id === a.id) === idx)));
      else if (col === "noas") localStorage.setItem("procure_noas", JSON.stringify([data, ...noas].map(x => x.id === data.id ? data : x).filter((n, idx, self) => self.findIndex(t => t.id === n.id) === idx)));
      else if (col === "contracts") localStorage.setItem("procure_contracts", JSON.stringify([data, ...contracts].map(x => x.id === data.id ? data : x).filter((c, idx, self) => self.findIndex(t => t.id === c.id) === idx)));
      else if (col === "workorders") localStorage.setItem("procure_workorders", JSON.stringify([data, ...workOrders].map(x => x.id === data.id ? data : x).filter((w, idx, self) => self.findIndex(t => t.id === w.id) === idx)));
      else if (col === "inspections") localStorage.setItem("procure_inspections", JSON.stringify([data, ...inspections].map(x => x.id === data.id ? data : x).filter((i, idx, self) => self.findIndex(t => t.id === i.id) === idx)));
      else if (col === "payments") localStorage.setItem("procure_payments", JSON.stringify([data, ...payments].map(x => x.id === data.id ? data : x).filter((p, idx, self) => self.findIndex(t => t.id === p.id) === idx)));
      else if (col === "procurementplans") localStorage.setItem("procure_plans", JSON.stringify([data, ...procurementPlans].map(x => x.id === data.id ? data : x).filter((p, idx, self) => self.findIndex(t => t.id === p.id) === idx)));
      else if (col === "emaillogs") localStorage.setItem("procure_email_logs", JSON.stringify([data, ...emailLogs].map(x => x.id === data.id ? data : x).filter((l, idx, self) => self.findIndex(t => t.id === l.id) === idx)));
      else if (col === "tors") localStorage.setItem("procure_tors", JSON.stringify([data, ...tors].map(x => x.id === data.id ? data : x).filter((t, idx, self) => self.findIndex(i => i.id === t.id) === idx)));
      else if (col === "evaluations") localStorage.setItem("procure_evaluations", JSON.stringify([data, ...evaluations].map(x => x.id === data.id ? data : x).filter((e, idx, self) => self.findIndex(i => i.id === e.id) === idx)));
    }
  };

  const addVendor = async (vendor: Omit<Vendor, "id" | "rating" | "documents">) => {
    const newId = `VND-${vendor.name.split(" ")[0].toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`;
    const newVendor: Vendor = {
      ...vendor,
      id: newId,
      rating: "9.0/10",
      documents: {}
    };
    if (firebaseUser) {
      await commitDoc("vendors", newId, newVendor);
    } else {
      const updated = [newVendor, ...vendors];
      setVendors(updated);
      localStorage.setItem("procure_vendors", JSON.stringify(updated));
    }
  };

  const uploadVendorDocument = async (
    vendorId: string, 
    documentName: "Trade License" | "BIN" | "TIN" | "Solvency Certificate", 
    fileName: string, 
    expiryDate: string
  ) => {
    const today = new Date();
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status: VendorDocument["status"] = "Valid";
    if (diffDays < 0) {
      status = "Expired";
    } else if (diffDays <= 30) {
      status = "Expiring Soon";
    }

    const docObj: VendorDocument = {
      name: documentName,
      fileName,
      uploadDate: new Date().toISOString().split("T")[0],
      expiryDate,
      status
    };

    const targetVendor = vendors.find(v => v.id === vendorId);
    if (!targetVendor) return;

    let key: keyof Vendor["documents"] = "tradeLicense";
    if (documentName === "Trade License") key = "tradeLicense";
    else if (documentName === "BIN") key = "bin";
    else if (documentName === "TIN") key = "tin";
    else if (documentName === "Solvency Certificate") key = "solvency";

    const updatedVendor = {
      ...targetVendor,
      documents: {
        ...targetVendor.documents,
        [key]: docObj
      }
    };

    if (firebaseUser) {
      await commitDoc("vendors", vendorId, updatedVendor);
    } else {
      const updated = vendors.map(v => v.id === vendorId ? updatedVendor : v);
      setVendors(updated);
      localStorage.setItem("procure_vendors", JSON.stringify(updated));
    }
  };

  const addRfq = async (rfq: Omit<RFQ, "id" | "bidsCount" | "status" | "sentToVendors" | "sentLogs">) => {
    const serial = Math.floor(Math.random() * 900) + 100;
    const prefix = rfq.type === "Goods" ? "G" : rfq.type === "Service" ? "S" : "W";
    const newId = `RFQ-${prefix}-${serial}`;
    
    const newRfq: RFQ = {
      ...rfq,
      id: newId,
      bidsCount: 0,
      status: "Bidding Open",
      sentToVendors: [],
      sentLogs: []
    };

    const appRequest: Approval = {
      id: `APP-${Math.floor(Math.random() * 900) + 100}`,
      type: "RFQ",
      title: `Approve launched ${rfq.type} RFQ ${newId} for ${rfq.material}`,
      requestedBy: passedUser?.email || "Tariqul Islam",
      date: new Date().toISOString().split('T')[0],
      status: "Pending",
      currentLevel: 0,
      committee: [
        { role: "Procurement Manager", name: "Imran Khan", status: "Pending", comment: "" },
        { role: "Director of Sourcing", name: "Farhan Rahman", status: "Pending", comment: "" },
        { role: "Chief Financial Officer (CFO)", name: "Sajid Chowdhury", status: "Pending", comment: "" }
      ],
      comments: [
        { author: passedUser?.email || "Tariqul Islam", role: "Sourcing Initiator", action: "Commented", text: `Launched RFQ-${newId} requirements for verification.`, timestamp: new Date().toISOString() }
      ]
    };

    if (firebaseUser) {
      await commitDoc("rfqs", newId, newRfq);
      await commitDoc("approvals", appRequest.id, appRequest);
    } else {
      const updatedRfqs = [newRfq, ...rfqs];
      setRfqs(updatedRfqs);
      localStorage.setItem("procure_rfqs", JSON.stringify(updatedRfqs));

      const updatedApprovals = [appRequest, ...approvals];
      setApprovals(updatedApprovals);
      localStorage.setItem("procure_approvals", JSON.stringify(updatedApprovals));
    }
  };

  const sendRfqToVendors = async (rfqId: string, selectedVendorIds: string[], notifyEmail = true) => {
    const targetRfq = rfqs.find(r => r.id === rfqId);
    if (!targetRfq) return;

    const sentLogs: RFQ["sentLogs"] = targetRfq.sentLogs ? [...targetRfq.sentLogs] : [];

    for (const vendorId of selectedVendorIds) {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) continue;

      const logNode = {
        vendorId,
        vendorName: vendor.name,
        timestamp: new Date().toLocaleString(),
        method: (notifyEmail ? "Email" : "In-App") as any,
        emailAddress: vendor.email
      };

      sentLogs.push(logNode);

      if (notifyEmail) {
        const mailLog = {
          id: `EML-${Math.floor(Math.random() * 9000) + 1000}`,
          rfqId,
          rfqMaterial: targetRfq.material,
          vendorName: vendor.name,
          email: vendor.email,
          timestamp: new Date().toLocaleString(),
          status: "Sent" as any
        };
        await commitDoc("emaillogs", mailLog.id, mailLog);
      }
    }

    const mergedSent = Array.from(new Set([...(targetRfq.sentToVendors || []), ...selectedVendorIds]));
    const updatedRfq: RFQ = {
      ...targetRfq,
      sentToVendors: mergedSent,
      sentLogs
    };

    if (firebaseUser) {
      await commitDoc("rfqs", rfqId, updatedRfq);
    } else {
      const updatedRfqs = rfqs.map(r => r.id === rfqId ? updatedRfq : r);
      setRfqs(updatedRfqs);
      localStorage.setItem("procure_rfqs", JSON.stringify(updatedRfqs));
    }
  };

  const addQuotation = async (quotation: Omit<Quotation, "id">) => {
    const qId = `QTN-${Math.floor(Math.random() * 90000) + 10000}`;
    const newQuotation: Quotation = {
      ...quotation,
      id: qId
    };

    if (firebaseUser) {
      await commitDoc("quotations", qId, newQuotation);
      const targetRfq = rfqs.find(r => r.id === quotation.rfqId);
      if (targetRfq) {
        const updatedRfq = { ...targetRfq, bidsCount: (targetRfq.bidsCount || 0) + 1 };
        await commitDoc("rfqs", quotation.rfqId, updatedRfq);
      }
    } else {
      const updatedQuotes = [...quotations, newQuotation];
      setQuotations(updatedQuotes);
      localStorage.setItem("procure_quotations", JSON.stringify(updatedQuotes));

      const updatedRfqs = rfqs.map((r) =>
        r.id === quotation.rfqId ? { ...r, bidsCount: (r.bidsCount || 0) + 1 } : r
      );
      setRfqs(updatedRfqs);
      localStorage.setItem("procure_rfqs", JSON.stringify(updatedRfqs));
    }
  };

  const handleApprovalAction = async (id: string, action: "Approved" | "Rejected") => {
    const targetApproval = approvals.find(ap => ap.id === id);
    if (!targetApproval) return;
    const updatedApproval: Approval = { ...targetApproval, status: action };

    if (firebaseUser) {
      await commitDoc("approvals", id, updatedApproval);
    } else {
      const updated = approvals.map((ap) => (ap.id === id ? updatedApproval : ap));
      setApprovals(updated);
      localStorage.setItem("procure_approvals", JSON.stringify(updated));
    }
  };

  // Submit quotation award to Multi-level Sequential Sourcing Committee
  const submitAwardToCommittee = async (rfqId: string, quotationId: string, vendorName: string, amount: string) => {
    const appApprovalId = `APP-${Math.floor(Math.random() * 90) + 10}0`;
    const targetRfq = rfqs.find(r => r.id === rfqId);
    
    const newApproval: Approval = {
      id: appApprovalId,
      type: "NOA",
      title: `Award Sourcing RFQ-${rfqId} to ${vendorName}`,
      requestedBy: passedUser?.email || "Tariqul Islam (Sourcing Lead)",
      date: new Date().toISOString().split('T')[0],
      amount,
      status: "Pending",
      rfqId,
      quotationId,
      currentLevel: 0,
      committee: [
        { role: "Procurement Manager", name: "Imran Khan", status: "Pending" },
        { role: "Director of Sourcing", name: "Farhan Rahman", status: "Pending" },
        { role: "Chief Financial Officer (CFO)", name: "Sajid Chowdhury", status: "Pending" }
      ],
      comments: [
        {
          author: passedUser?.displayName || "Tariqul Islam",
          role: "Sourcing Initiator",
          text: `Selected vendor quotation award proposal of total amount ${amount}. File submitted for multi-level sequential validation.`,
          timestamp: new Date().toLocaleString(),
          action: "Commented"
        }
      ]
    };

    if (targetRfq) {
      const updatedRfq = { ...targetRfq, status: "Approving NOA" as any };
      if (firebaseUser) {
        await commitDoc("rfqs", rfqId, updatedRfq);
      } else {
        const updated = rfqs.map(r => r.id === rfqId ? updatedRfq : r);
        setRfqs(updated);
        localStorage.setItem("procure_rfqs", JSON.stringify(updated));
      }
    }

    if (firebaseUser) {
      await commitDoc("approvals", appApprovalId, newApproval);
    } else {
      const updated = [newApproval, ...approvals];
      setApprovals(updated);
      localStorage.setItem("procure_approvals", JSON.stringify(updated));
    }

    return appApprovalId;
  };

  // Perform sequential comment + approval signoff
  const handleSequentialApproval = async (
    approvalId: string, 
    stepIndex: number, 
    action: "Approved" | "Rejected", 
    commentText: string, 
    signerName: string
  ) => {
    const targetApproval = approvals.find(ap => ap.id === approvalId);
    if (!targetApproval) return;

    const committee = [...targetApproval.committee];
    const step = committee[stepIndex];
    if (!step) return;

    step.status = action;
    step.comment = commentText;
    step.date = new Date().toISOString().split('T')[0];

    // Add comment
    const newComment: ApprovalComment = {
      author: signerName,
      role: step.role,
      text: commentText || `${action} without additional annotations.`,
      timestamp: new Date().toLocaleString(),
      action: action === "Approved" ? "Approved" : "Rejected"
    };

    const currentComments = targetApproval.comments ? [...targetApproval.comments] : [];
    currentComments.push(newComment);

    let nextStatus: Approval["status"] = "Pending";
    let nextLevel = targetApproval.currentLevel;

    if (action === "Rejected") {
      nextStatus = "Rejected";
      // Update RFQ back to Reviewing
      if (targetApproval.rfqId) {
        const targetRfq = rfqs.find(r => r.id === targetApproval.rfqId);
        if (targetRfq) {
          const updatedRfq = { ...targetRfq, status: "Reviewing" as any };
          if (firebaseUser) await commitDoc("rfqs", targetApproval.rfqId, updatedRfq);
          else {
            const updated = rfqs.map(r => r.id === targetApproval.rfqId ? updatedRfq : r);
            setRfqs(updated);
            localStorage.setItem("procure_rfqs", JSON.stringify(updated));
          }
        }
      }
    } else if (action === "Approved") {
      if (stepIndex === committee.length - 1) {
        // Full approval reached!
        nextStatus = "Approved";
        
        // Auto-generate Notice of Award (NOA)
        if (targetApproval.type === "NOA" && targetApproval.rfqId) {
          const rfq = rfqs.find(r => r.id === targetApproval.rfqId);
          const noaId = `NOA-${Math.floor(Math.random() * 900) + 100}`;
          const titleParts = targetApproval.title.split(" to ");
          const winningVendor = titleParts[titleParts.length - 1] || "Winning Vendor";
          
          const newNoa: Noa = {
            id: noaId,
            rfqId: targetApproval.rfqId,
            vendorName: winningVendor,
            amount: targetApproval.amount || "$0.00",
            issueDate: new Date().toISOString().split('T')[0],
            status: "Pending Signature",
            rfqMaterial: rfq?.material || "Selected Textile Goods",
            rfqQty: rfq?.quantity || "Sourcing Volume"
          };

          if (firebaseUser) {
            await commitDoc("noas", noaId, newNoa);
          } else {
            const updatedNoas = [newNoa, ...noas];
            setNoas(updatedNoas);
            localStorage.setItem("procure_noas", JSON.stringify(updatedNoas));
          }
        }
      } else {
        // Move to next sequential level
        nextLevel = stepIndex + 1;
      }
    }

    const updatedApproval: Approval = {
      ...targetApproval,
      status: nextStatus,
      currentLevel: nextLevel,
      committee,
      comments: currentComments
    };

    if (firebaseUser) {
      await commitDoc("approvals", approvalId, updatedApproval);
    } else {
      const updated = approvals.map(ap => ap.id === approvalId ? updatedApproval : ap);
      setApprovals(updated);
      localStorage.setItem("procure_approvals", JSON.stringify(updated));
    }
  };

  // Convert approved NOA to Purchase Contract Agreement
  const acceptNoaAndPrepareContract = async (noaId: string) => {
    const targetNoa = noas.find(n => n.id === noaId);
    if (!targetNoa) return;

    const contractId = `CON-${Math.floor(Math.random() * 9000) + 1000}`;
    const newContract: Contract = {
      id: contractId,
      rfqId: targetNoa.rfqId,
      vendorName: targetNoa.vendorName,
      terms: `Core standard apparel purchasing clauses:\n\n1. Payment terms: Sight Letter of Credit (L/C) 100% issued within 7 bank days from contract signing.\n2. Quantity tolerance: Quantity variations up to +/- 1.5% in knitted garments are allowed.\n3. QC Standards: Standard Group internal QC inspection is final. Defect rate must not exceed 2.0%.\n4. Delivery terms: Carriage Paid To (CPT) Gazipur Central Warehouse.`,
      amount: targetNoa.amount,
      status: "Draft",
      contractNo: `SG-CON-2026-${Math.floor(Math.random() * 8999) + 1000}`,
      createdAt: new Date().toISOString().split('T')[0],
      material: targetNoa.rfqMaterial,
      quantity: targetNoa.rfqQty,
      esignatureSim: {
        vendorSigned: false,
        buyerSigned: false
      }
    };

    const updatedNoa: Noa = {
      ...targetNoa,
      status: "Signed",
      esignatureSim: {
        signedBy: "Aminul Islam (Supplier Rep)",
        ipAddress: "203.112.42.155",
        timestamp: new Date().toLocaleString()
      }
    };

    if (firebaseUser) {
      await commitDoc("noas", noaId, updatedNoa);
      await commitDoc("contracts", contractId, newContract);
    } else {
      const updatedNoas = noas.map(n => n.id === noaId ? updatedNoa : n);
      setNoas(updatedNoas);
      localStorage.setItem("procure_noas", JSON.stringify(updatedNoas));

      const updatedContracts = [newContract, ...contracts];
      setContracts(updatedContracts);
      localStorage.setItem("procure_contracts", JSON.stringify(updatedContracts));
    }
  };

  // Sourcing Lead Signs Contract
  const eSignContractBuyer = async (contractId: string, signerName: string) => {
    const targetContract = contracts.find(c => c.id === contractId);
    if (!targetContract) return;

    const esig = { ...(targetContract.esignatureSim || { vendorSigned: false, buyerSigned: false }) };
    esig.buyerSigned = true;
    esig.buyerSignedAt = new Date().toLocaleString();
    esig.buyerSignIp = "192.168.10.45";
    esig.buyerSignName = signerName;

    const bothSigned = esig.vendorSigned && esig.buyerSigned;
    const nextStatus: Contract["status"] = bothSigned ? "Active" : "Under Review";

    const updatedContract: Contract = {
      ...targetContract,
      status: nextStatus,
      esignatureSim: esig
    };

    if (firebaseUser) {
      await commitDoc("contracts", contractId, updatedContract);
    } else {
      const updated = contracts.map(c => c.id === contractId ? updatedContract : c);
      setContracts(updated);
      localStorage.setItem("procure_contracts", JSON.stringify(updated));
    }

    if (bothSigned) {
      await triggerActivationFlow(updatedContract);
    }
  };

  // Vendor Signs Contract
  const eSignContractVendor = async (contractId: string, signerName: string) => {
    const targetContract = contracts.find(c => c.id === contractId);
    if (!targetContract) return;

    const esig = { ...(targetContract.esignatureSim || { vendorSigned: false, buyerSigned: false }) };
    esig.vendorSigned = true;
    esig.vendorSignedAt = new Date().toLocaleString();
    esig.vendorSignIp = "202.4.155.88";
    esig.vendorSignName = signerName;

    const bothSigned = esig.vendorSigned && esig.buyerSigned;
    const nextStatus: Contract["status"] = bothSigned ? "Active" : "Under Review";

    const updatedContract: Contract = {
      ...targetContract,
      status: nextStatus,
      esignatureSim: esig
    };

    if (firebaseUser) {
      await commitDoc("contracts", contractId, updatedContract);
    } else {
      const updated = contracts.map(c => c.id === contractId ? updatedContract : c);
      setContracts(updated);
      localStorage.setItem("procure_contracts", JSON.stringify(updated));
    }

    if (bothSigned) {
      await triggerActivationFlow(updatedContract);
    }
  };

  // Trigger auto Production Work Order + RFQ completion
  const triggerActivationFlow = async (contract: Contract) => {
    await addWorkOrder({
      rfqId: contract.rfqId,
      vendorName: contract.vendorName,
      material: contract.material || "Textile Raw Materials",
      quantity: contract.quantity || "10,000 Pcs",
      startDate: new Date().toISOString().split('T')[0],
      endDate: getRelativeDateString(18)
    });

    await updateRfqStatus(contract.rfqId, "Completed");
  };

  const addWorkOrder = async (wo: Omit<WorkOrder, "id" | "status" | "qcStatus">) => {
    const newWoId = `WO-${Math.floor(Math.random() * 9000) + 1000}`;
    const newWo: WorkOrder = {
      ...wo,
      id: newWoId,
      status: "Issued",
      qcStatus: "Pending"
    };

    if (firebaseUser) {
      await commitDoc("workorders", newWoId, newWo);
    } else {
      const updated = [newWo, ...workOrders];
      setWorkOrders(updated);
      localStorage.setItem("procure_work_orders", JSON.stringify(updated));
    }
  };

  const triggerQCInspection = async (
    orderId: string, 
    defectRate: number, 
    findings: string, 
    isPass: boolean,
    details?: {
      status?: "Passed" | "Hold" | "Failed";
      gsm?: number;
      color?: string;
      sampleSize?: number;
      defectsCount?: number;
      aqlStandard?: "1.5" | "2.5" | "4.0";
      photoUrl?: string;
    }
  ) => {
    const inspId = `INSP-${Math.floor(Math.random() * 900) + 100}`;
    const targetOrder = workOrders.find(w => w.id === orderId);
    
    // Explicit final status mapping based on form selection (Pass/Hold/Reject)
    let finalStatus: "Passed" | "Hold" | "Failed" = isPass ? "Passed" : "Failed";
    if (details?.status) {
      finalStatus = details.status;
    }

    const newInsp: Inspection = {
      id: inspId,
      orderId,
      material: targetOrder?.material || "Unknown Textile Material",
      inspectorName: passedUser?.displayName || "Tariqul Islam (Sourcing QC Lead)",
      defectRate,
      findings,
      status: finalStatus,
      gsm: details?.gsm,
      color: details?.color,
      sampleSize: details?.sampleSize,
      defectsCount: details?.defectsCount,
      aqlStandard: details?.aqlStandard,
      photoUrl: details?.photoUrl,
      checkedAt: new Date().toISOString().split("T")[0]
    };

    const targetOrderQcStatus = finalStatus === "Passed" ? "QC Passed" : finalStatus === "Failed" ? "QC Failed" : "Pending";

    if (firebaseUser) {
      await commitDoc("inspections", inspId, newInsp);
      if (targetOrder) {
        const updatedOrder = { ...targetOrder, qcStatus: targetOrderQcStatus as any };
        await commitDoc("workorders", orderId, updatedOrder);
      }
    } else {
      const updatedInsps = [newInsp, ...inspections];
      setInspections(updatedInsps);
      localStorage.setItem("procure_inspections", JSON.stringify(updatedInsps));

      const updatedOrders = workOrders.map((w) =>
        w.id === orderId ? { ...w, qcStatus: targetOrderQcStatus as any } : w
      );
      setWorkOrders(updatedOrders);
      localStorage.setItem("procure_work_orders", JSON.stringify(updatedOrders));
    }
  };

  const addPayment = async (payment: Omit<Payment, "id" | "createdAt" | "status" | "approvals">) => {
    const newId = `PAY-${Math.floor(Math.random() * 900) + 100}`;
    const newPayment: Payment = {
      ...payment,
      id: newId,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Pending Sourcing Approver",
      approvals: {}
    };

    const updated = [newPayment, ...payments];
    setPayments(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("procure_payments", JSON.stringify(updated));
    }
  };

  const handlePaymentApproval = async (paymentId: string, level: 1 | 2 | 3, action: "Approved" | "Rejected", comment?: string) => {
    const target = payments.find(p => p.id === paymentId);
    if (!target) return;

    const updatedApprovals = { ...target.approvals };
    const approverName = passedUser?.displayName || "System Official";
    const approvedAt = new Date().toLocaleString();

    const approvalDetail: ApprovalDetail = {
      approver: approverName,
      approvedAt,
      status: action,
      comment
    };

    let newStatus = target.status;

    if (level === 1) {
      updatedApprovals.level1 = approvalDetail;
      newStatus = action === "Approved" ? "Pending Manager Approver" : "Rejected";
    } else if (level === 2) {
      updatedApprovals.level2 = approvalDetail;
      newStatus = action === "Approved" ? "Pending CFO Approver" : "Rejected";
    } else if (level === 3) {
      updatedApprovals.level3 = approvalDetail;
      newStatus = action === "Approved" ? "Completed" : "Rejected";
    }

    const updatedPayment: Payment = {
      ...target,
      status: newStatus,
      approvals: updatedApprovals
    };

    const updatedList = payments.map(p => p.id === paymentId ? updatedPayment : p);
    setPayments(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("procure_payments", JSON.stringify(updatedList));
    }
  };

  const createProcurementPlan = async (plan: Omit<ProcurementPlan, "id" | "status">) => {
    const newPlanId = `PLN-${Math.floor(Math.random() * 900) + 100}`;
    const newPlan: ProcurementPlan = {
      ...plan,
      id: newPlanId,
      status: "Draft"
    };

    if (firebaseUser) {
      await commitDoc("procurementplans", newPlanId, newPlan);
    } else {
      const updated = [...procurementPlans, newPlan];
      setProcurementPlans(updated);
      localStorage.setItem("procure_plans", JSON.stringify(updated));
    }
  };

  const updateRfqStatus = async (rfqId: string, status: RFQ["status"]) => {
    const targetRfq = rfqs.find(r => r.id === rfqId);
    if (!targetRfq) return;
    const updatedRfq = { ...targetRfq, status };

    if (firebaseUser) {
      await commitDoc("rfqs", rfqId, updatedRfq);
    } else {
      const updated = rfqs.map(r => r.id === rfqId ? updatedRfq : r);
      setRfqs(updated);
      localStorage.setItem("procure_rfqs", JSON.stringify(updated));
    }
  };

  const resetAllData = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("procure_vendors");
      localStorage.removeItem("procure_rfqs");
      localStorage.removeItem("procure_quotations");
      localStorage.removeItem("procure_approvals");
      localStorage.removeItem("procure_noas");
      localStorage.removeItem("procure_contracts");
      localStorage.removeItem("procure_work_orders");
      localStorage.removeItem("procure_inspections");
      localStorage.removeItem("procure_payments");
      localStorage.removeItem("procure_plans");
      localStorage.removeItem("procure_email_logs");
      localStorage.removeItem("procure_tors");
      localStorage.removeItem("procure_evaluations");
    }
    setVendors(initialVendors);
    setRfqs(initialRfqs);
    setQuotations(initialQuotations);
    setApprovals(initialApprovals);
    setNoas([]);
    setContracts([]);
    setWorkOrders(initialWorkOrders);
    setInspections(initialInspections);
    setPayments(initialPayments);
    setProcurementPlans(initialProcurementPlans);
    setTors(initialTors);
    setEvaluations(initialEvaluations);
    setEmailLogs([]);
  };

  const updatePlanForecast = async (planId: string, forecast: MonthlyAllocation[]) => {
    const targetPlan = procurementPlans.find(p => p.id === planId);
    if (!targetPlan) return;
    const updatedPlan = { ...targetPlan, monthlyForecast: forecast };

    if (firebaseUser) {
      await commitDoc("procurementplans", planId, updatedPlan);
    } else {
      const updated = procurementPlans.map(p => p.id === planId ? updatedPlan : p);
      setProcurementPlans(updated);
      localStorage.setItem("procure_plans", JSON.stringify(updated));
    }
  };

  const createToR = async (torData: Omit<ToR, "id" | "status">) => {
    const torId = `TOR-${Math.floor(Math.random() * 900) + 100}`;
    const newTor: ToR = {
      ...torData,
      id: torId,
      status: "Draft"
    };

    if (firebaseUser) {
      await commitDoc("tors", torId, newTor);
    } else {
      const updated = [...tors, newTor];
      setTors(updated);
      localStorage.setItem("procure_tors", JSON.stringify(updated));
    }
    return newTor;
  };

  const publishToR = async (torId: string) => {
    const tor = tors.find(t => t.id === torId);
    if (!tor) return;
    const updatedToR = { ...tor, status: "Published" as const };

    if (firebaseUser) {
      await commitDoc("tors", torId, updatedToR);
    } else {
      const updated = tors.map(t => t.id === torId ? updatedToR : t);
      setTors(updated);
      localStorage.setItem("procure_tors", JSON.stringify(updated));
    }
  };

  const addConsultantEvaluation = async (evalData: Omit<ConsultantEvaluation, "id">) => {
    const evlId = `EVL-${Math.floor(Math.random() * 900) + 100}`;
    const newEvl: ConsultantEvaluation = {
      ...evalData,
      id: evlId
    };

    if (firebaseUser) {
      await commitDoc("evaluations", evlId, newEvl);
    } else {
      const updated = [...evaluations, newEvl];
      setEvaluations(updated);
      localStorage.setItem("procure_evaluations", JSON.stringify(updated));
    }
    return newEvl;
  };

  const updateConsultantEvaluationStatus = async (evlId: string, status: ConsultantEvaluation["status"]) => {
    const evaluation = evaluations.find(e => e.id === evlId);
    if (!evaluation) return;
    const updatedEvl = { ...evaluation, status };

    if (firebaseUser) {
      await commitDoc("evaluations", evlId, updatedEvl);
    } else {
      const updated = evaluations.map(e => e.id === evlId ? updatedEvl : e);
      setEvaluations(updated);
      localStorage.setItem("procure_evaluations", JSON.stringify(updated));
    }

    if (status === "Approved") {
      const tId = evaluation.torId;
      const t = tors.find(item => item.id === tId);
      if (t) {
        const updatedToR = { ...t, status: "Awarded" as const };
        if (firebaseUser) {
          await commitDoc("tors", tId, updatedToR);
        } else {
          const updatedT = tors.map(item => item.id === tId ? updatedToR : item);
          setTors(updatedT);
          localStorage.setItem("procure_tors", JSON.stringify(updatedT));
        }
      }
    }
  };

  return {
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
    addPayment,
    handlePaymentApproval,
    createProcurementPlan,
    updateRfqStatus,
    resetAllData,
    submitAwardToCommittee,
    handleSequentialApproval,
    acceptNoaAndPrepareContract,
    eSignContractBuyer,
    eSignContractVendor,
    updatePlanForecast,
    createToR,
    publishToR,
    addConsultantEvaluation,
    updateConsultantEvaluationStatus
  };
}
