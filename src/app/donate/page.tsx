"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Copy,
  Check,
  Upload,
  Send,
  QrCode,
  CreditCard,
  Building2,
  Wallet,
  Heart,
  X,
  ChevronRight,
  Sparkles,
  Smartphone,
  Bitcoin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const PAYMENT_LOGOS: Record<string, string> = {
  // Indonesian Banks
  bca: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
  bni: "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg",
  bri: "https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg",
  mandiri: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
  cimb: "https://upload.wikimedia.org/wikipedia/commons/a/a8/CIMB_Niaga_logo.svg",
  danamon: "https://upload.wikimedia.org/wikipedia/id/b/bc/Logo_Bank_Danamon.svg",
  permata: "https://upload.wikimedia.org/wikipedia/commons/f/f7/PermataBank_logo.svg",
  btn: "https://upload.wikimedia.org/wikipedia/commons/8/87/BTN_Logo.svg",
  maybank: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Maybank_logo.svg",
  ocbc: "https://upload.wikimedia.org/wikipedia/commons/c/cc/OCBC_Bank_logo.svg",
  panin: "https://upload.wikimedia.org/wikipedia/id/f/fe/Logo_Panin_Bank.svg",
  mega: "https://upload.wikimedia.org/wikipedia/commons/9/95/Bank_Mega.svg",
  bsi: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg",
  btpn: "https://upload.wikimedia.org/wikipedia/commons/2/25/BTPN_Logo.svg",
  jenius: "https://upload.wikimedia.org/wikipedia/commons/1/14/Jenius_logo.svg",
  jago: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Bank_Jago.svg",
  seabank: "https://upload.wikimedia.org/wikipedia/commons/0/0e/SeaBank_logo.svg",
  blu: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Blu_by_BCA_Digital.svg",
  
  // E-Wallets
  gopay: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
  ovo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg",
  dana: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
  shopeepay: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg",
  linkaja: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg",
  isaku: "https://upload.wikimedia.org/wikipedia/commons/8/83/ISaku_logo.png",
  sakuku: "https://upload.wikimedia.org/wikipedia/commons/6/68/Logo_Sakuku.png",
  
  // International Banks
  paypal: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
  wise: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Wise_Logo.svg",
  revolut: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Revolut_Logo.svg",
  n26: "https://upload.wikimedia.org/wikipedia/commons/9/9a/N26_logo.svg",
  stripe: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
  
  // Crypto
  bitcoin: "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg",
  btc: "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg",
  ethereum: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg",
  eth: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg",
  usdt: "https://upload.wikimedia.org/wikipedia/commons/4/46/Tether_Logo.svg",
  
  // Mobile Credit / Pulsa
  telkomsel: "https://upload.wikimedia.org/wikipedia/commons/9/95/Telkomsel_2021_icon.svg",
  indosat: "https://upload.wikimedia.org/wikipedia/commons/1/19/Indosat_Ooredoo_Hutchison_logo.svg",
  xl: "https://upload.wikimedia.org/wikipedia/commons/7/7c/XL_logo_2016.svg",
  axis: "https://upload.wikimedia.org/wikipedia/id/8/84/Axis_logo_2015.svg",
  tri: "https://upload.wikimedia.org/wikipedia/id/d/d7/3_Indonesia_Logo.svg",
  smartfren: "https://upload.wikimedia.org/wikipedia/id/8/8c/Smartfren_logo.svg",
  
  // QRIS / Others
  qris: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg",
  visa: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
  mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  
  // International Payment Methods
  skrill: "https://upload.wikimedia.org/wikipedia/commons/0/09/Skrill_logo.svg",
  neteller: "https://upload.wikimedia.org/wikipedia/commons/4/47/Neteller_logo.svg",
  applepay: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg",
  googlepay: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
  samsungpay: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Samsung_Pay_Logo.svg",
  alipay: "https://upload.wikimedia.org/wikipedia/commons/5/52/Alipay_logo_%282020%29.svg",
  wechatpay: "https://upload.wikimedia.org/wikipedia/commons/c/c6/WeChat_Pay_logo.svg",
  venmo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Venmo_Logo.svg",
  cashapp: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Square_Cash_app_logo.svg",
  zelle: "https://upload.wikimedia.org/wikipedia/commons/8/89/Zelle_logo.svg",
  
  // More International Banks
  chase: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Chase_logo_2007.svg",
  hsbc: "https://upload.wikimedia.org/wikipedia/commons/a/aa/HSBC_logo_%282018%29.svg",
  citibank: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Citi.svg",
  barclays: "https://upload.wikimedia.org/wikipedia/commons/8/89/Barclays_logo.svg",
  bnp: "https://upload.wikimedia.org/wikipedia/commons/4/4a/BNP_Paribas.svg",
  ing: "https://upload.wikimedia.org/wikipedia/commons/4/49/ING_Group_N.V._Logo.svg",
  santander: "https://upload.wikimedia.org/wikipedia/commons/4/44/Banco_Santander_logo.svg",
  ubs: "https://upload.wikimedia.org/wikipedia/commons/4/4a/UBS_Logo.svg",
  deutschebank: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Deutsche_Bank_logo_without_wordmark.svg",
  commerzbank: "https://upload.wikimedia.org/wikipedia/de/0/0d/Commerzbank-Logo.svg",
  standardchartered: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Standard_Chartered.svg",
  
  // Asian Banks
  dbs: "https://upload.wikimedia.org/wikipedia/commons/2/2f/DBS_Bank_logo.svg",
  uob: "https://upload.wikimedia.org/wikipedia/commons/3/35/UOB_Logo.svg",
  bankofchina: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bank_of_China_logo.svg",
  icbc: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Industrial_and_Commercial_Bank_of_China_logo.svg",
  ccb: "https://upload.wikimedia.org/wikipedia/commons/2/27/China_Construction_Bank_logo.svg",
  abc: "https://upload.wikimedia.org/wikipedia/commons/3/37/Agricultural_Bank_of_China_logo.svg",
  
  // Australian Banks
  anz: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ANZ-brand.svg",
  nab: "https://upload.wikimedia.org/wikipedia/commons/7/7d/NAB_logo.svg",
  westpac: "https://upload.wikimedia.org/wikipedia/en/a/a0/Westpac_logo.svg",
  commonwealth: "https://upload.wikimedia.org/wikipedia/en/2/28/Commonwealth_Bank_logo.svg",
  
  // Money Transfer
  westernunion: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Western_Union_Logo.svg",
  moneygram: "https://upload.wikimedia.org/wikipedia/commons/9/9e/MoneyGram_logo.svg",
  remitly: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Remitly_logo.svg",
};

const getPaymentLogo = (name: string): string | null => {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const [key, url] of Object.entries(PAYMENT_LOGOS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return url;
    }
  }
  return null;
};

interface PaymentMethod {
  _id: string;
  type: string;
  name: string;
  value: string;
  accountName: string;
  qrisImage: string;
  enabled: boolean;
}

interface DonationSettings {
  paymentMethods: PaymentMethod[];
  thankYouMessage: string;
}

export default function DonatePage() {
  const [settings, setSettings] = useState<DonationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("qris");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    paymentMethod: "",
    nominal: "",
    screenshot: "",
    message: "",
  });

  const typewriterEffect = (lines: string[], delay = 50) => {
    lines.forEach((line, index) => {
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, line]);
      }, index * delay);
    });
  };

  useEffect(() => {
    const initLines = [
      "$ ssh donate@wanyzx.tech",
      "[+] Connecting to donation server...",
      "[+] Connection established",
      "[+] Loading payment methods...",
    ];
    typewriterEffect(initLines, 100);

    fetch("/api/donation")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
          const enabledMethods = data.data.paymentMethods?.filter((m: PaymentMethod) => m.enabled) || [];
          if (enabledMethods.length > 0) {
            setActiveTab(enabledMethods[0].type);
          }
          setTimeout(() => {
            setTerminalLines((prev) => [
              ...prev,
              "[+] Payment methods loaded successfully",
              `[+] Found ${enabledMethods.length} payment methods`,
              "$ _",
            ]);
          }, 500);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setTerminalLines((prev) => [
          ...prev,
          "[-] Error loading payment methods",
        ]);
      });
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTerminalLines((prev) => [...prev, `$ echo "${text}" | pbcopy`, "[+] Copied to clipboard"]);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, screenshot: reader.result as string });
        setTerminalLines((prev) => [...prev, `$ upload ${file.name}`, "[+] Screenshot uploaded"]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTerminalLines((prev) => [...prev, "$ submit donation --verify", "[+] Submitting donation proof..."]);

    try {
      const res = await fetch("/api/donation/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nominal: parseFloat(formData.nominal),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTerminalLines((prev) => [
          ...prev,
          "[+] Donation submitted successfully!",
          `[+] ${settings?.thankYouMessage || "Terima kasih!"}`,
        ]);
      } else {
        setTerminalLines((prev) => [...prev, "[-] Failed to submit donation"]);
      }
    } catch {
      setTerminalLines((prev) => [...prev, "[-] Network error"]);
    }
    setSubmitting(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "qris":
        return <QrCode className="w-4 h-4" />;
      case "bank":
        return <Building2 className="w-4 h-4" />;
      case "ewallet":
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const filteredMethods = settings?.paymentMethods?.filter(
    (m) => m.enabled && m.type === activeTab
  ) || [];

  const paymentTypes = [
    { id: "qris", label: "QRIS", icon: QrCode },
    { id: "bank", label: "Bank", icon: Building2 },
    { id: "ewallet", label: "E-Wallet", icon: Wallet },
    { id: "pulsa", label: "Pulsa", icon: Smartphone },
    { id: "crypto", label: "Crypto", icon: Bitcoin },
    { id: "international", label: "International", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--theme-primary)/0.15)] via-transparent to-transparent" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--theme-primary)/0.05) 2px, hsl(var(--theme-primary)/0.05) 4px)`,
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--theme-primary)/0.1)] border border-[hsl(var(--theme-primary)/0.3)] mb-4">
            <Heart className="w-4 h-4 text-[hsl(var(--theme-primary))]" />
            <span className="text-sm text-[hsl(var(--theme-primary))]">Support Development</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            <span className="text-foreground">Donate</span>{" "}
            <span className="text-[hsl(var(--theme-primary))]">_</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your support keeps the servers running and APIs free
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl overflow-hidden border border-[hsl(var(--theme-primary)/0.3)] bg-card/80 backdrop-blur-sm shadow-[0_0_50px_hsl(var(--theme-primary)/0.1)]"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-card to-muted border-b border-[hsl(var(--theme-primary)/0.2)]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">donate@wanyzx — bash</span>
            </div>

            <div
              ref={terminalRef}
              className="p-4 h-[300px] overflow-y-auto text-sm space-y-1 scrollbar-thin scrollbar-thumb-[hsl(var(--theme-primary)/0.3)] font-mono"
            >
              {terminalLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${
                    line.startsWith("$")
                      ? "text-[hsl(var(--theme-primary))]"
                      : line.startsWith("[+]")
                      ? "text-[hsl(var(--theme-accent))]"
                      : line.startsWith("[-]")
                      ? "text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {line}
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[hsl(var(--theme-primary))]">
                  <span className="animate-pulse">█</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex gap-2 p-1 rounded-lg bg-card/50 border border-[hsl(var(--theme-primary)/0.2)]">
              {paymentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setActiveTab(type.id);
                    setTerminalLines((prev) => [...prev, `$ filter --type=${type.id}`]);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm transition-all ${
                    activeTab === type.id
                      ? "bg-[hsl(var(--theme-primary)/0.2)] text-[hsl(var(--theme-primary))] border border-[hsl(var(--theme-primary)/0.5)]"
                      : "text-muted-foreground hover:text-[hsl(var(--theme-primary))]"
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-[hsl(var(--theme-primary)/0.2)] bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="p-4 border-b border-[hsl(var(--theme-primary)/0.2)]">
                <h3 className="text-[hsl(var(--theme-primary))] font-semibold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Payment Methods
                </h3>
              </div>

              <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
                {filteredMethods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No payment methods available</p>
                  </div>
                ) : (
                    filteredMethods.map((method) => {
                      const logo = getPaymentLogo(method.name);
                      return (
                        <motion.div
                          key={method._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-[hsl(var(--theme-primary)/0.05)] border border-[hsl(var(--theme-primary)/0.2)] hover:border-[hsl(var(--theme-primary)/0.4)] transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {logo ? (
                                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                                    <img
                                      src={logo}
                                      alt={method.name}
                                      className="w-6 h-6 object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  getIcon(method.type)
                                )}
                                <span className="font-semibold text-foreground">
                                  {method.name}
                                </span>
                              </div>
                              {method.type === "qris" && method.qrisImage ? (
                                <div className="mt-3">
                                  <img
                                    src={method.qrisImage}
                                    alt="QRIS"
                                    className="max-w-[200px] rounded-lg border border-[hsl(var(--theme-primary)/0.3)]"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <code className="px-3 py-1.5 rounded bg-background/50 text-[hsl(var(--theme-primary))] text-sm border border-[hsl(var(--theme-primary)/0.2)]">
                                      {method.value}
                                    </code>
                                    <button
                                      onClick={() => copyToClipboard(method.value, method._id)}
                                      className="p-2 rounded-lg hover:bg-[hsl(var(--theme-primary)/0.2)] transition-colors"
                                    >
                                      {copiedId === method._id ? (
                                        <Check className="w-4 h-4 text-[hsl(var(--theme-primary))]" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(var(--theme-primary))]" />
                                      )}
                                    </button>
                                  </div>
                                  {method.accountName && (
                                    <p className="text-sm text-muted-foreground">
                                      A/n: {method.accountName}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                setShowForm(true);
                setTerminalLines((prev) => [...prev, "$ open donation-form"]);
              }}
              className="w-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] hover:opacity-90 text-white font-bold py-6 rounded-xl border border-[hsl(var(--theme-primary)/0.5)] shadow-[0_0_20px_hsl(var(--theme-primary)/0.2)]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Submit Donation Proof
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-xl border border-[hsl(var(--theme-primary)/0.3)] bg-card overflow-hidden shadow-[0_0_50px_hsl(var(--theme-primary)/0.15)]"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-card to-muted border-b border-[hsl(var(--theme-primary)/0.2)]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">donation-form.sh</span>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 rounded hover:bg-accent transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {submitted ? (
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-[hsl(var(--theme-primary)/0.2)] border border-[hsl(var(--theme-primary)/0.5)] flex items-center justify-center"
                    >
                      <Check className="w-10 h-10 text-[hsl(var(--theme-primary))]" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-[hsl(var(--theme-primary))] mb-2">
                      Thank You!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {settings?.thankYouMessage || "Terima kasih atas dukungannya!"}
                    </p>
                    <Button
                      onClick={() => {
                        setShowForm(false);
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          paymentMethod: "",
                          nominal: "",
                          screenshot: "",
                          message: "",
                        });
                      }}
                      variant="outline"
                      className="border-[hsl(var(--theme-primary)/0.5)] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary)/0.1)]"
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm text-[hsl(var(--theme-primary))] mb-2 font-mono">
                        <span className="text-muted-foreground">$</span> name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-[hsl(var(--theme-primary)/0.3)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--theme-primary)/0.6)]"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[hsl(var(--theme-primary))] mb-2 font-mono">
                        <span className="text-muted-foreground">$</span> payment_method
                      </label>
                      <select
                        required
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-[hsl(var(--theme-primary)/0.3)] text-foreground focus:outline-none focus:border-[hsl(var(--theme-primary)/0.6)]"
                      >
                        <option value="">Select payment method</option>
                        {settings?.paymentMethods?.filter(m => m.enabled).map((m) => (
                          <option key={m._id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-[hsl(var(--theme-primary))] mb-2 font-mono">
                        <span className="text-muted-foreground">$</span> nominal (Rp)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.nominal}
                        onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-[hsl(var(--theme-primary)/0.3)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--theme-primary)/0.6)]"
                        placeholder="10000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[hsl(var(--theme-primary))] mb-2 font-mono">
                        <span className="text-muted-foreground">$</span> screenshot
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="screenshot-upload"
                          required={!formData.screenshot}
                        />
                        <label
                          htmlFor="screenshot-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-background/50 border border-dashed border-[hsl(var(--theme-primary)/0.3)] text-muted-foreground hover:text-[hsl(var(--theme-primary))] hover:border-[hsl(var(--theme-primary)/0.5)] cursor-pointer transition-colors"
                        >
                          {formData.screenshot ? (
                            <>
                              <Check className="w-4 h-4 text-[hsl(var(--theme-primary))]" />
                              <span className="text-[hsl(var(--theme-primary))]">Screenshot uploaded</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Upload payment screenshot</span>
                            </>
                          )}
                        </label>
                      </div>
                      {formData.screenshot && (
                        <img
                          src={formData.screenshot}
                          alt="Preview"
                          className="mt-2 max-h-32 rounded-lg border border-[hsl(var(--theme-primary)/0.3)]"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[hsl(var(--theme-primary))] mb-2 font-mono">
                        <span className="text-muted-foreground">$</span> message (optional)
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-[hsl(var(--theme-primary)/0.3)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--theme-primary)/0.6)] resize-none"
                        placeholder="Leave a message..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] hover:opacity-90 text-white font-bold py-3 rounded-lg"
                    >
                      {submitting ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
