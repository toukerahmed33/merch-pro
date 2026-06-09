"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowLeft, ShieldCheck, CreditCard, Sparkles, AlertCircle, Building2, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDuration, setActiveDuration] = useState<"monthly" | "annually">("monthly");
  
  // Modal states
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cardNo, setCardNo] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("321");
  const [cardName, setCardName] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load authenticated user and their profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setCardName(firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Authorized User");
        
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserDoc(snap.data());
          } else {
            // Write standard profile if missing
            const initialUserData = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Authorized User",
              plan: "Free",
              role: "User",
              company: "Independent Sourcing Agent",
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, initialUserData);
            setUserDoc(initialUserData);
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
        }
      } else {
        setUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const plans = [
    {
      name: "Free",
      id: "Free",
      priceMonthly: 0,
      priceAnnually: 0,
      badge: "Sourcing Sandbox",
      color: "border-slate-200 text-slate-700 bg-white",
      btnClass: "bg-slate-800 hover:bg-slate-900 text-white",
      features: [
        "Max 5 files uploaded capacity",
        "Max 3 collaborative team members",
        "Basic Merchandiser & Buyer view",
        "Live bidding (view and log simple dummy bids)",
        "Standard layout without analytics telemetry"
      ]
    },
    {
      name: "Starter",
      id: "Starter",
      priceMonthly: 49,
      priceAnnually: 39,
      badge: "Active Merchandiser",
      color: "border-blue-200 text-slate-700 bg-white",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
      features: [
        "Max 20 documents capacity",
        "Max 10 team members in single workspace",
        "Automated RFQ broadcasts & batch email notifications",
        "Basic RFQ comparative bid weighting metrics",
        "Basic invoice logging of completed work orders"
      ]
    },
    {
      name: "Professional",
      id: "Professional",
      priceMonthly: 149,
      priceAnnually: 119,
      badge: "Production House",
      recommended: true,
      color: "border-blue-500 ring-2 ring-blue-500/20 text-slate-800 bg-white shadow-md",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-300",
      features: [
        "Max 100 high-resolution contract PDFs",
        "Max 50 team members workspace",
        "Multi-level digital signoffs (L1-L3) financial release",
        "Sourcing and bid matching analytics with custom metrics",
        "Digital contract drafting, NOA, and simulated e-signatures",
        "Priority 24/7 support from procurement engineering specialists"
      ]
    },
    {
      name: "Enterprise",
      id: "Enterprise",
      priceMonthly: 499,
      priceAnnually: 399,
      badge: "Global Apparel Chain",
      color: "border-slate-900 bg-slate-900 text-white shadow-xl",
      btnClass: "bg-white hover:bg-slate-100 text-slate-900",
      features: [
        "Unlimited documents & unlimited storage capacity",
        "Unlimited procurement team members workspace",
        "Mobile-optimized AQL inspector defect audit forms",
        "Direct photo upload to Google Cloud / Firebase Storage",
        "Administrative roles management & systemic logs",
        "Custom integration with existing ERP/SAP garment tools"
      ]
    }
  ];

  const handleSelectPlan = (plan: any) => {
    if (!user) {
      alert("Please ensure you are logged in to purchase or select a subscription plan.");
      router.push("/");
      return;
    }
    
    // Check if selecting their current plan
    if (userDoc?.plan === plan.id) {
      alert(`You are currently already subscribed to the ${plan.id} Plan!`);
      return;
    }

    if (plan.priceMonthly === 0) {
      // Direct update for free plan
      processSubscriptionUpdate(plan.id, "$0");
    } else {
      setSelectedPlan(plan);
      setPaymentModalOpen(true);
      setPaymentSuccess(false);
    }
  };

  const processSubscriptionUpdate = async (planName: string, amountPaid: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        plan: planName
      });

      // Log secure audit trail
      const auditId = "LOG-" + Date.now();
      await setDoc(doc(db, "auditlogs", auditId), {
        id: auditId,
        userEmail: user.email,
        action: "Subscription Upgrade",
        details: `Upgraded subscription plan to ${planName}. Billing matched amount: ${amountPaid}.`,
        timestamp: new Date().toISOString()
      });

      // Save billing invoice
      const billId = "INV-" + Math.floor(100000 + Math.random() * 900000);
      await setDoc(doc(db, "billing", billId), {
        id: billId,
        userId: user.uid,
        userEmail: user.email,
        plan: planName,
        amount: amountPaid,
        status: "Paid",
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
        invoiceNo: billId
      });

      // Update local state and show completion
      setUserDoc((prev: any) => ({ ...prev, plan: planName }));
      setPaymentSuccess(true);
    } catch (err) {
      console.error("Failed to commit subscription upgrade transaction in Firestore:", err);
      alert("A system error occurred. Please ensure your database rules permit standard client updates.");
    }
  };

  const handleConfirmMockPayment = () => {
    if (!cardName.trim() || !cardNo.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      alert("Please complete all credit card credentials to securely authenticate simulation.");
      return;
    }

    setProcessingPayment(true);
    
    // Simulate high-tier payment proxy delays
    setTimeout(async () => {
      const isAnnual = activeDuration === "annually";
      const planPrice = isAnnual ? selectedPlan.priceAnnually : selectedPlan.priceMonthly;
      const amtStr = `$${planPrice}/${isAnnual ? "yr" : "mo"}`;
      
      await processSubscriptionUpdate(selectedPlan.id, amtStr);
      setProcessingPayment(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Verifying license state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-y-auto pb-20">
      
      {/* Upper Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/")}
            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition flex items-center gap-1 font-bold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-black text-sm">M</div>
            <span className="font-bold text-sm text-slate-900">MerchProcure Licensing</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-800">{user.displayName || user.email}</span>
              <span className="inline-block text-[9px] bg-blue-100 border border-blue-200 text-blue-700 px-2 py-0.5 mt-0.5 rounded font-black uppercase tracking-wider">
                Current Plan: {userDoc?.plan || "Free"}
              </span>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/")}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Hero Visual Block */}
      <section className="max-w-4xl mx-auto px-6 pt-12 pb-6 text-center">
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3 h-3 text-blue-600" /> Transparent Garments Procurement System
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Scale Sourcing Capacity &amp; Quality Control
        </h1>
        <p className="text-xs text-slate-500 mt-2.5 max-w-xl mx-auto leading-relaxed">
          Upgrade your workspace tier to bypass standard local uploads restrictions, unlock automated mill bidding systems, multiple level financial signoffs, and high-density defect tracking forms.
        </p>

        {/* Toggle Duration Buttons */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="bg-slate-200/70 rounded-full p-1.5 flex shadow-inner">
            <button 
              onClick={() => setActiveDuration("monthly")}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                activeDuration === "monthly" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pay Monthly
            </button>
            <button 
              onClick={() => setActiveDuration("annually")}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 ${
                activeDuration === "annually" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pay Annually
              <span className="bg-green-100 text-green-700 px-1 text-[8px] font-black rounded-sm border border-green-200">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid Comparison Panels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isAnnual = activeDuration === "annually";
          const displayPrice = isAnnual ? p.priceAnnually : p.priceMonthly;
          const userHasThis = userDoc?.plan === p.id;

          return (
            <div 
              key={p.name} 
              id={`plan-card-${p.id}`}
              className={`border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${p.color}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">{p.name} Template</h3>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{p.badge}</span>
                  </div>
                  {p.recommended && (
                    <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-3xs">
                      Popular
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight">${displayPrice}</span>
                  <span className={`text-[10px] font-medium ${p.id === "Enterprise" ? "text-slate-300" : "text-slate-400"}`}>
                    / month {isAnnual && "(billed annually)"}
                  </span>
                </div>

                <ul className="space-y-2 border-t border-slate-100 pt-3">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-left items-start">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${p.id === "Enterprise" ? "text-blue-400" : "text-blue-600"} mt-0.5`} />
                      <span className="text-[10px] leading-tight font-medium opacity-90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100/50">
                <button 
                  onClick={() => handleSelectPlan(p)}
                  disabled={userHasThis}
                  className={`w-full py-2 rounded text-xs tracking-wider uppercase font-black transition cursor-pointer select-none ${p.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {userHasThis ? "Your Current Plan" : `Choose ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Feature Compare Matrix / FAQ Section */}
      <section className="max-w-4xl mx-auto mt-12 px-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" /> Sourcing Licensing &amp; Compliance Details
          </h3>
          
          <div className="space-y-4 text-xs select-none">
            <div className="group border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> How is my upload file gating updated?
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                When you activate the <strong>Starter</strong>, <strong>Professional</strong>, or <strong>Enterprise</strong> tiers, the system instantly recalculates your file capacity limits. Your team membership limits are also updated simultaneously, preventing blocks in shared sessions.
              </p>
            </div>

            <div className="group border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Can I change plans at any stage?
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Absolutely! Our licensing is elastic. Selecting a professional plan is matched against active credit queues. Changes appear synchronously across the primary workspace for both buying agents and textile vendors.
              </p>
            </div>

            <div className="group">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Is mock card payment secure for simulation?
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                We utilize a simulated credit-checking system inside sandboxed environments. Your credentials are only stored as locally authenticated profile events in protected Firebase logs, matching production audit capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Overlay Modal */}
      <AnimatePresence>
        {paymentModalOpen && selectedPlan && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-left"
            >
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold uppercase tracking-widest text-[9px]">Secure Payment Gateway</span>
                </div>
                <button 
                  onClick={() => setPaymentModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {!paymentSuccess ? (
                <div className="p-5 space-y-4">
                  {/* Upgrade summary banner */}
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    <span className="text-[8px] font-black uppercase text-blue-600 block tracking-widest">Activating Tier</span>
                    <p className="font-extrabold text-slate-800 text-sm mt-0.5">{selectedPlan.name} Procurement License</p>
                    <p className="font-mono text-xs font-bold text-slate-600 mt-1">
                      Amount Due: ${activeDuration === "annually" ? selectedPlan.priceAnnually : selectedPlan.priceMonthly} / month
                    </p>
                  </div>

                  {/* Card formulation form */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cardholder Legal Name</label>
                      <input 
                        type="text" 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Details (16-Digit)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition font-mono font-medium"
                        />
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVV / Security Code</label>
                        <input 
                          type="password" 
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-250 rounded p-2.5 flex gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-amber-700 leading-normal">
                        This initiates a fully simulated sandboxed payment and records invoice billing data immediately inside your private Firestore logs.
                      </p>
                    </div>

                    <button 
                      onClick={handleConfirmMockPayment}
                      disabled={processingPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wider py-2.5 rounded text-xs uppercase transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {processingPayment ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing Escrow Release...
                        </>
                      ) : (
                        "Verify and Pay Invoice"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-250">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-sm">Payment Approved Sourcing Ready</h4>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-[280px] mx-auto">
                      Your subscription of <strong>{selectedPlan.name}</strong> was provisioned and authorized. We logged billing ID records and compiled active audit events securely.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setPaymentModalOpen(false);
                      router.push("/");
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded text-xs font-bold transition tracking-wider uppercase"
                  >
                    Return to Sourcing Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
