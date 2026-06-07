'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from './billing.module.css';
import { useLanguage } from '../LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { AuthTokens } from '../../types/api';

interface ServiceItem {
  description: string;
  quantity?: string;
  rate?: string;
  amount: string;
}

interface Bill {
  id: string;
  type: 'labour' | 'other';
  clientName: string;
  amount: string;
  date: string;
  time?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  items?: ServiceItem[];
  isDraft?: boolean;
}

const WELDING_WORKS_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  'Tank U-clamp fitting': { en: 'Tank U-clamp fitting', ta: 'டேங்க் U-கிளாம்ப் பிட்டிங்' },
  'Six master valve open': { en: 'Six master valve open', ta: 'ஆறு மாஸ்டர் வால்வு திறப்பு' },
  'Six master valve fitting': { en: 'Six master valve fitting', ta: 'ஆறு மாஸ்டர் வால்வு பொருத்துதல்' },
  'Six master valve fitting work': { en: 'Six master valve fitting work', ta: 'ஆறு மாஸ்டர் வால்வு பொருத்தும் வேலை' },
  'Tank leakage': { en: 'Tank leakage', ta: 'டேங்க் கசிவு அடைத்தல்' },
  'Six compartment leakage': { en: 'Six compartment leakage', ta: 'ஆறு கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  '1st compartment leakage': { en: '1st compartment leakage', ta: '1வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  '2nd compartment leakage': { en: '2nd compartment leakage', ta: '2வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  '3rd compartment leakage': { en: '3rd compartment leakage', ta: '3வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  '4th compartment leakage': { en: '4th compartment leakage', ta: '4வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  '5th compartment leakage': { en: '5th compartment leakage', ta: '5வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  '6th compartment leakage': { en: '6th compartment leakage', ta: '6வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  'Reliance dome SS welding': { en: 'Reliance dome SS welding', ta: 'ரிலையன்ஸ் டோம் SS வெல்டிங்' },
  'Reliance dome MS welding': { en: 'Reliance dome MS welding', ta: 'ரிலையன்ஸ் டோம் MS வெல்டிங்' },
  'Tank side bottom welding': { en: 'Tank side bottom welding', ta: 'டேங்க் பக்கவாட்டு பாட்டம் வெல்டிங்' },
  'Tank side bottom bending': { en: 'Tank side bottom bending', ta: 'டேங்க் பக்கவாட்டு பாட்டம் பெண்டிங்' },
  'Tank side disc bending': { en: 'Tank side disc bending', ta: 'டேங்க் பக்கவாட்டு டிஸ்க் பெண்டிங்' },
  'Six gate valve rope': { en: 'Six gate valve rope', ta: 'ஆறு கேட் வால்வு ரோப்' },
  'Six master valve pipeline and master valve fitting': { en: 'Six master valve pipeline and master valve fitting', ta: 'ஆறு மாஸ்டர் வால்வு பைப்லைன் மற்றும் மாஸ்டர் வால்வு பொருத்துதல்' },
  'Six master valve rope and 5 fitting': { en: 'Six master valve rope and 5 fitting', ta: 'ஆறு மாஸ்டர் வால்வு ரோப் மற்றும் 5 பொருத்துதல்' },
  'Six master side rope': { en: 'Six master side rope', ta: 'ஆறு மாஸ்டர் பக்கவாட்டு ரோப்' },
  'Four side margard welding': { en: 'Four side margard welding', ta: 'நான்கு பக்க மட்கார்டு வெல்டிங்' },
  'Back side ladder fitting and welding': { en: 'Back side ladder fitting and welding', ta: 'பின்பக்க ஏணி பொருத்துதல் மற்றும் வெல்டிங்' },
  'Back bumper remove and fitting': { en: 'Back bumper remove and fitting', ta: 'பின்பக்க பம்பர் கழற்றி மாட்டுதல்' },
  'Back safety guard remove and fitting': { en: 'Back safety guard remove and fitting', ta: 'பின்பக்க சேஃப்டி கார்டு கழற்றி மாட்டுதல்' },
  'Back six compartment rope adjustment': { en: 'Back six compartment rope adjustment', ta: 'பின்பக்க ஆறு கம்பார்ட்மென்ட் ரோப் அட்ஜஸ்ட்மென்ட்' },
  'Back rope box welding': { en: 'Back rope box welding', ta: 'பின்பக்க ரோப் பாக்ஸ் வெல்டிங்' },
  'Mirrorless dome rack rail welding': { en: 'Mirrorless dome rack rail welding', ta: 'மிரர்லெஸ் டோம் ராக் ரெயில் வெல்டிங்' },
  'Reliance dome Madras steel welding': { en: 'Reliance dome Madras steel welding', ta: 'ரிலையன்ஸ் டோம் மெட்ராஸ் ஸ்டீல் வெல்டிங்' },
  'Side number plate welding': { en: 'Side number plate welding', ta: 'பக்கவாட்டு நம்பர் பிளேட் வெல்டிங்' },
  'Reliance hall ration SS': { en: 'Reliance hall ration SS', ta: 'ரிலையன்ஸ் ஹால் ரேஷன் SS' },
  'Right side ladder work': { en: 'Right side ladder work', ta: 'வலது பக்க ஏணி வேலை' },
  'Sun side pipe work': { en: 'Sun side pipe work', ta: 'சன் சைடு பைப் வேலை' },
  'Double side rope': { en: 'Double side rope', ta: 'இருபுறமும் ரோப்' },
  'New manhole packing': { en: 'New manhole packing', ta: 'புதிய மேன்ஹோல் பேக்கிங்' },
  '4 inch manhole wood cutting': { en: '4 inch manhole wood cutting', ta: '4 இன்ச் மேன்ஹோல் மரம் வெட்டுதல்' },
  'Manhole new building': { en: 'Manhole new building', ta: 'புதிய மேன்ஹோல் அமைத்தல்' },
  'Manhole top work': { en: 'Manhole top work', ta: 'மேன்ஹோல் டாப் வேலை' },
  'Gate valve box rope box': { en: 'Gate valve box rope box', ta: 'கேட் வால்வு பாக்ஸ் ரோப் பாக்ஸ்' },
  '1 inch bed labor and U-clamp': { en: '1 inch bed labor and U-clamp', ta: '1 இன்ச் பெட் லேபர் மற்றும் U-கிளாம்ப்' },
  'Seven inch allied packing and PVC packing': { en: 'Seven inch allied packing and PVC packing', ta: 'ஏழு இன்ச் அலைடு பேக்கிங் மற்றும் PVC பேக்கிங்' },
  '21 inch bit labor work fitting': { en: '21 inch bit labor work fitting', ta: '21 இன்ச் பிட் லேபர் வேலை பொருத்துதல்' },
  'Tank back SS lot bending and welding': { en: 'Tank back SS lot bending and welding', ta: 'டேங்க் பின்புற SS லாட் பெண்டிங் மற்றும் வெல்டிங்' },
  'New common valve': { en: 'New common valve', ta: 'புதிய காமன் வால்வு' },
  'H nipple new': { en: 'H nipple new', ta: 'புதிய H நிப்பிள்' },
  '3 inch aluminium cup': { en: '3 inch aluminium cup', ta: '3 இன்ச் அலுமினியம் கப்' },
  '4 inch aluminium cup': { en: '4 inch aluminium cup', ta: '4 இன்ச் அலுமினியம் கப்' },
  'Fire gun standard new': { en: 'Fire gun standard new', ta: 'புதிய ஃபயர் கன் ஸ்டாண்டர்ட்' },
  'P V valve': { en: 'P V valve', ta: 'P V வால்வு' },
  'Emergency vent': { en: 'Emergency vent', ta: 'எமர்ஜென்சி வென்ட்' },
  'Fusible link': { en: 'Fusible link', ta: 'பியூசிபில் லிங்க்' },
  'Ss gatevalve': { en: 'Ss gatevalve', ta: 'SS கேட் வால்வு' },
  'Ms mastervalve': { en: 'Ms mastervalve', ta: 'MS மாஸ்டர் வால்வு' }
};

const COMPANIES_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  'Raja Murugan Transport': { en: 'Raja Murugan Transport', ta: 'ராஜமுருகன் டிரான்ஸ்போர்ட்' },
  'Vijay Road Lines': { en: 'Vijay Road Lines', ta: 'விஜய் ரோடு லைன்ஸ்' },
  'NSS Transport': { en: 'NSS Transport', ta: 'என்.எஸ்.எஸ். டிரான்ஸ்போர்ட்' },
  'ENT': { en: 'ENT', ta: 'இ.என்.டி.' },
  'NE Transport': { en: 'NE Transport', ta: 'என்.இ. டிரான்ஸ்போர்ட்' },
  'MLS Transport': { en: 'MLS Transport', ta: 'எம்.எல்.எஸ். டிரான்ஸ்போர்ட்' },
  'Omega Transport': { en: 'Omega Transport', ta: 'ஒமேகா டிரான்ஸ்போர்ட்' },
  'Sri Sai Transport': { en: 'Sri Sai Transport', ta: 'ஸ்ரீ சாய் டிரான்ஸ்போர்ட்' },
  'Adithya Transport': { en: 'Adithya Transport', ta: 'ஆதித்யா டிரான்ஸ்போர்ட்' },
  'PCS Transport': { en: 'PCS Transport', ta: 'பி.சி.எஸ். டிரான்ஸ்போர்ட்' },
  'ASN Transport': { en: 'ASN Transport', ta: 'ஏ.எஸ்.என். டிரான்ஸ்போர்ட்' },
  'Eagle Transport': { en: 'Eagle Transport', ta: 'ஈகிள் டிரான்ஸ்போர்ட்' },
  'ATR Transport': { en: 'ATR Transport', ta: 'ஏ.டி.ஆர். டிரான்ஸ்போர்ட்' },
  'Siteshwar Transport': { en: 'Siteshwar Transport', ta: 'சித்தேஷ்வர் டிரான்ஸ்போர்ட்' },
  'VPS Logistics': { en: 'VPS Logistics', ta: 'வி.பி.எஸ். லாஜிஸ்டிக்ஸ்' },
  'Pulavar Transport': { en: 'Pulavar Transport', ta: 'புலவர் டிரான்ஸ்போர்ட்' },
  'SRTS Transport': { en: 'SRTS Transport', ta: 'எஸ்.ஆர்.டி.எஸ். டிரான்ஸ்போர்ட்' },
  'Anjaneyar Bunk': { en: 'Anjaneyar Bunk', ta: 'ஆஞ்சநேயர் பங்க்' },
  'SKP Tranport': { en: 'SKP Tranport', ta: 'எஸ்.கே.பி. டிரான்ஸ்போர்ட்' },
  'TPLS Transport': { en: 'TPLS Transport', ta: 'டி.பி.எல்.எஸ். டிரான்ஸ்போர்ட்' },
  'EverGreen Transport': { en: 'EverGreen Transport', ta: 'எவர்கிரீன் டிரான்ஸ்போர்ட்' },
  'Barrel Transport': { en: 'Barrel Transport', ta: 'பேரல் டிரான்ஸ்போர்ட்' },
  'Custom Company': { en: 'Custom Company', ta: 'விருப்ப நிறுவனம்' }
};

const translateWork = (work: string, lang: 'en' | 'ta') => {
  return WELDING_WORKS_TRANSLATIONS[work]?.[lang] || work;
};

const translateCompany = (comp: string, lang: 'en' | 'ta') => {
  return COMPANIES_TRANSLATIONS[comp]?.[lang] || comp;
};

const mapWorkToEnglishKey = (work: string) => {
  for (const [key, value] of Object.entries(WELDING_WORKS_TRANSLATIONS)) {
    if (value.ta === work || value.en === work) {
      return key;
    }
  }
  return work;
};

const mapCompanyToEnglishKey = (comp: string) => {
  for (const [key, value] of Object.entries(COMPANIES_TRANSLATIONS)) {
    if (value.ta === comp || value.en === comp) {
      return key;
    }
  }
  return comp;
};

const DEFAULT_LABOUR_SERVICES = Object.keys(WELDING_WORKS_TRANSLATIONS);
const DEFAULT_COMPANIES = Object.keys(COMPANIES_TRANSLATIONS);

const getInitialServiceItems = (): ServiceItem[] => [
  { description: '', quantity: '1', rate: '', amount: '' }
];

export default function Billing() {
  const { t, language } = useLanguage();
  
  // Auth state
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'pin' | 'otp'>('pin');
  const [inputOtp, setInputOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [showOtpNotification, setShowOtpNotification] = useState(false);
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  // Sidebar Layout Navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'wizard' | 'config' | 'analysis' | 'gallery' | 'settings' | 'customers' | 'payments'>('overview');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Billing registry state (Legacy localStorage to be removed)
  const [bills, setBills] = useState<Bill[]>([]);

  // Invoice Register API State
  const [invoicePage, setInvoicePage] = useState(0);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [invoiceStartDate, setInvoiceStartDate] = useState('');
  const [invoiceEndDate, setInvoiceEndDate] = useState('');

  const billsQuery = useQuery({
    queryKey: ['bills', invoicePage, invoiceSearch, invoiceStatusFilter, invoiceStartDate, invoiceEndDate],
    queryFn: () => {
      const params = new URLSearchParams({
        skip: (invoicePage * 20).toString(),
        take: '20'
      });
      if (invoiceSearch) params.append('search', invoiceSearch);
      if (invoiceStatusFilter) params.append('status', invoiceStatusFilter);
      if (invoiceStartDate) params.append('startDate', invoiceStartDate);
      if (invoiceEndDate) params.append('endDate', invoiceEndDate);
      return api.get(`/bills?${params.toString()}`).then(res => res.data);
    },
    enabled: isAuthenticated
  });

  // Print Modal overlay & selection state
  const [activeModal, setActiveModal] = useState<'invoice-preview' | null>(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<Bill | null>(null);
  const [selectedBillMode, setSelectedBillMode] = useState<'instant' | 'draft'>('instant');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<{ id: string; title: string; dataUrl: string }[]>([]);

  // Form temporary wizard states
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [customCompanyInput, setCustomCompanyInput] = useState('');
  const [generatedBillNumber, setGeneratedBillNumber] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [worksError, setWorksError] = useState('');
  const [worksSearchQuery, setWorksSearchQuery] = useState('');
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [customWorkInput, setCustomWorkInput] = useState('');
  const queryClient = useQueryClient();

  const { data: companiesList = [], isLoading: isLoadingCompanies } = useQuery<string[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers?take=100').then(res => {
      const names: string[] = res.data.data.map((c: { name: string }) => c.name);
      return Array.from(new Set([...names, 'Custom Company']));
    }),
    enabled: isAuthenticated
  });

  const { data: availableWorks = [], isLoading: isLoadingWorks } = useQuery<string[]>({
    queryKey: ['services'],
    queryFn: () => api.get('/services').then(res => {
      const names: string[] = res.data.data ? res.data.data.map((s: { name: string }) => s.name) : res.data.map((s: { name: string }) => s.name);
      return Array.from(new Set(names));
    }),
    enabled: isAuthenticated
  });
  const [newWorkName, setNewWorkName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');

  // Sprint 4G — Analytics queries
  const dashboardQuery = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data.data),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const fourMonthQuery = useQuery({
    queryKey: ['analytics-four-month'],
    queryFn: () => api.get('/analytics/four-month').then(r => r.data.data),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  // Sprint 4F — Payments query
  const [paymentsPage, setPaymentsPage] = useState(0);
  const paymentsQuery = useQuery({
    queryKey: ['payments', paymentsPage],
    queryFn: () => api.get(`/payments?skip=${paymentsPage * 20}&take=20`).then(r => r.data.data),
    enabled: isAuthenticated && activeTab === 'payments',
  });

  // Sprint 4F — PDF generation mutation
  const generateReceiptMutation = useMutation({
    mutationFn: (billId: string) => api.post(`/receipts/${billId}/generate`),
    onSuccess: (res) => {
      const url = res.data?.pdfUrl;
      if (url) window.open(url, '_blank');
      else alert('PDF generated but no URL returned. Check storage.');
    },
    onError: () => alert('Failed to generate PDF receipt.'),
  });

  // Sprint 4I — Customer management states
  const [customersPage, setCustomersPage] = useState(0);
  const [customersSearch, setCustomersSearch] = useState('');
  const customersQuery = useQuery({
    queryKey: ['customers-list', customersPage, customersSearch],
    queryFn: () => api.get(`/customers?skip=${customersPage * 20}&take=20${customersSearch ? `&search=${customersSearch}` : ''}`).then(r => r.data.data),
    enabled: isAuthenticated && activeTab === 'customers',
  });
  const [customerForm, setCustomerForm] = useState({ name: '', mobile: '', address: '', gstin: '' });
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => editingCustomerId
      ? api.put(`/customers/${editingCustomerId}`, data)
      : api.post('/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-list'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCustomerForm({ name: '', mobile: '', address: '', gstin: '' });
      setEditingCustomerId(null);
      setShowCustomerForm(false);
    },
  });
  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers-list'] }),
  });

  // Sprint 4H — Business Settings states
  const [bizName, setBizName] = useState('Sri Balamurugan Tank Service');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizGstin, setBizGstin] = useState('');
  const [bizDefaultLang, setBizDefaultLang] = useState<'EN' | 'TA'>('EN');
  const [bizSettingsSaved, setBizSettingsSaved] = useState(false);

  // Sprint 4J — Backup state
  const [backupList, setBackupList] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');

  const fetchBackupList = async () => {
    try {
      const res = await api.get('/backup/list');
      setBackupList(res.data || []);
    } catch {
      setBackupList([]);
    }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupStatus('Creating backup...');
    try {
      const res = await api.post('/backup/create');
      setBackupStatus(`✓ Backup created: ${res.data?.filename}`);
      fetchBackupList();
    } catch {
      setBackupStatus('✗ Backup failed. Check server logs.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleDownloadBackup = (filename: string) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/backup/download/${filename}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Service item ledger wizard state
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>(getInitialServiceItems());
  const [step2Error, setStep2Error] = useState('');

  const [invoiceLanguage, setInvoiceLanguage] = useState<'EN' | 'TA'>('EN');

  // Debounced Auto-Save Draft
  useEffect(() => {
    if (editingDraftId && serviceItems.length > 0 && selectedBillMode === 'draft') {
      const timer = setTimeout(() => {
        if (!updateDraftMutation.isPending) {
          updateDraftMutation.mutate({
            id: editingDraftId,
            payload: {
              clientName: selectedCompany === 'Custom Company' ? customCompanyInput : selectedCompany,
              vehicleNumber: vehicleNumber,
              language: invoiceLanguage,
              items: serviceItems.filter(item => item.description.trim()).map(item => ({
                description: item.description,
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.rate) || 0
              }))
            }
          });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [serviceItems, editingDraftId, selectedCompany, customCompanyInput, vehicleNumber, invoiceLanguage, selectedBillMode]);

  // Date auditor states
  const [analysisFromDate, setAnalysisFromDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}-01`;
  });

  const [analysisToDate, setAnalysisToDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const checkDateInInterval = (billDateStr: string, fromDateStr: string, toDateStr: string) => {
    const fromDateObj = new Date(fromDateStr);
    fromDateObj.setHours(0, 0, 0, 0);
    const toDateObj = new Date(toDateStr);
    toDateObj.setHours(23, 59, 59, 999);
    let billObj = new Date(billDateStr);
    if (isNaN(billObj.getTime())) {
      const parts = billDateStr.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const fullYear = y < 100 ? 2000 + y : y;
        billObj = new Date(fullYear, m, d);
      }
    }
    if (!isNaN(billObj.getTime())) {
      billObj.setHours(12, 0, 0, 0);
      return billObj >= fromDateObj && billObj <= toDateObj;
    }
    return false;
  };

  const getFourMonthPerformanceData = () => {
    const today = new Date();
    const baselines = [
      { revenue: 112000, bills: 11 },
      { revenue: 135000, bills: 15 },
      { revenue: 128200, bills: 14 },
      { revenue: 154500, bills: 18 }
    ];

    const data = Array.from({ length: 4 }).map((_, index) => {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - (3 - index), 1);
      const monthIndex = targetDate.getMonth();
      const year = targetDate.getFullYear();
      const monthName = targetDate.toLocaleString('default', { month: 'long' });
      const baseline = baselines[index];

      let revenue = baseline.revenue;
      let billsCount = baseline.bills;

      bills.forEach(bill => {
        let bMonth = -1;
        let bYear = -1;
        const billDate = new Date(bill.date);
        if (!isNaN(billDate.getTime())) {
          bMonth = billDate.getMonth();
          bYear = billDate.getFullYear();
        } else {
          const parts = bill.date.split('/');
          if (parts.length === 3) {
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            bMonth = m;
            bYear = y < 100 ? 2000 + y : y;
          }
        }
        if (bMonth === monthIndex && bYear === year) {
          revenue += parseFloat(bill.amount) || 0;
          billsCount += 1;
        }
      });

      return {
        monthName,
        monthShortName: monthName.substring(0, 3),
        revenue,
        billsCount,
        isCurrent: index === 3
      };
    });

    return data;
  };

  // Hotkey navigation focusing states
  const [focusTarget, setFocusTarget] = useState<{ index: number; field: 'description' | 'quantity' | 'rate' | 'amount' } | null>(null);

  useEffect(() => {
    if (focusTarget) {
      const { index, field } = focusTarget;
      let elementId = '';
      if (field === 'description') elementId = `desc-input-${index}`;
      else if (field === 'quantity') elementId = `qty-input-${index}`;
      else if (field === 'rate') elementId = `rate-input-${index}`;
      else if (field === 'amount') elementId = `amount-input-${index}`;
      
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
      }
      setTimeout(() => {
        setFocusTarget(null);
      }, 0);
    }
  }, [focusTarget]);

  // Key handlers to jump between fields
  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFocusTarget({ index, field: 'quantity' });
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFocusTarget({ index, field: 'rate' });
    }
  };

  const handleRateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFocusTarget({ index, field: 'amount' });
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === serviceItems.length - 1) {
        setServiceItems([...serviceItems, { description: '', amount: '' }]);
        setFocusTarget({ index: index + 1, field: 'description' });
      } else {
        setFocusTarget({ index: index + 1, field: 'description' });
      }
    }
  };

  const deleteServiceItem = (index: number) => {
    if (serviceItems.length > 1) {
      const updated = serviceItems.filter((_, i) => i !== index);
      setServiceItems(updated);
      const nextIndex = Math.max(0, index - 1);
      setFocusTarget({ index: nextIndex, field: 'description' });
    }
  };

  const addWorkMutation = useMutation({
    mutationFn: (name: string) => api.post('/services', { name, nameTA: name, isSystem: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setNewWorkName('');
    },
    onError: (err: any) => {
      alert(`Failed to add product: ${err.response?.data?.message || err.message}`);
    }
  });

  const handleAddWork = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWorkName.trim();
    if (trimmed && !availableWorks.includes(trimmed)) {
      addWorkMutation.mutate(trimmed);
    }
  };

  const handleDeleteWork = (workToDelete: string) => {
    alert('Deleting services is currently restricted to avoid breaking past invoices.');
  };

  const addCompanyMutation = useMutation({
    mutationFn: (name: string) => api.post('/customers', { name, nameTA: name, isPreset: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setNewCompanyName('');
    },
    onError: (err: any) => {
      alert(`Failed to add company: ${err.response?.data?.message || err.message}`);
    }
  });

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCompanyName.trim();
    if (trimmed && !companiesList.includes(trimmed)) {
      addCompanyMutation.mutate(trimmed);
    }
  };

  const draftBillMutation = useMutation({
    mutationFn: (data: any) => api.post('/bills/draft', data),
    onSuccess: (res) => {
      setEditingDraftId(res.data.id);
      setWizardStep(2);
    }
  });

  const updateDraftMutation = useMutation({
    mutationFn: (data: { id: string, payload: any }) => api.patch(`/bills/${data.id}`, data.payload)
  });

  const finalizeBillMutation = useMutation({
    mutationFn: (id: string) => api.post(`/bills/${id}/finalize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      // Reset Wizard
      setVehicleNumber('');
      setSelectedCompany('');
      setCustomCompanyInput('');
      setSelectedWorks([]);
      setServiceItems([{ description: '', quantity: '1', rate: '', amount: '' }]);
      setGeneratedBillNumber('');
      setEditingDraftId(null);
      setWizardStep(1);
      setActiveTab('overview');
    }
  });

  const cancelBillMutation = useMutation({
    mutationFn: (id: string) => api.post(`/bills/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    }
  });

  const handleDeleteCompany = (compToDelete: string) => {
    if (compToDelete === 'Custom Company') return;
    alert('Deleting companies is currently restricted to avoid breaking past invoices.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const newImage = {
          id: Date.now().toString(),
          title: file.name.split('.')[0] || 'Reference Image',
          dataUrl: dataUrl
        };
        setGalleryImages(prev => [newImage, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (id: string) => {
    if (confirm('Are you sure you want to delete this reference image?')) {
      setGalleryImages(prev => prev.filter(img => img.id !== id));
    }
  };

  // Sync state with local database mock
  useEffect(() => {
    setTimeout(() => {
      try {
        const token = sessionStorage.getItem('access_token');
        if (token) {
          setIsAuthenticated(true);
        }

        const savedPin = localStorage.getItem('sbt_admin_pin');
        if (savedPin && savedPin.length === 6) {
          setAdminPin(savedPin);
        }
        const savedBills = localStorage.getItem('sbt_bills');
        if (savedBills) {
          setBills(JSON.parse(savedBills));
        }
        const savedCompanies = localStorage.getItem('sbt_companies_list');
        if (savedCompanies && !localStorage.getItem('sbt_migrated_v3_companies')) {
          const companies = JSON.parse(savedCompanies);
          // Migrate old array of strings or objects to backend
          Promise.all(companies.map(async (c: any) => {
            try {
              const name = typeof c === 'string' ? mapCompanyToEnglishKey(c) : c.name;
              await api.post('/customers', { name });
            } catch (e: any) { 
              console.error('Migration error (companies):', e.response?.data || e.message); 
            }
          })).then(() => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            localStorage.setItem('sbt_migrated_v3_companies', 'true');
          });
        }

        const savedWorks = localStorage.getItem('sbt_available_works');
        if (savedWorks && !localStorage.getItem('sbt_migrated_v3_works')) {
          const works = JSON.parse(savedWorks);
          Promise.all(works.map(async (w: any) => {
            try {
              const name = typeof w === 'string' ? mapWorkToEnglishKey(w) : w.name;
              await api.post('/services', { name });
            } catch (e: any) { 
              console.error('Migration error (works):', e.response?.data || e.message); 
            }
          })).then(() => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            localStorage.setItem('sbt_migrated_v3_works', 'true');
          });
        }
        const savedImages = localStorage.getItem('sbt_gallery_images');
        if (savedImages) {
          setGalleryImages(JSON.parse(savedImages));
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sbt_bills', JSON.stringify(bills));
      localStorage.setItem('sbt_gallery_images', JSON.stringify(galleryImages));
    }
  }, [bills, galleryImages, isLoaded]);

  // Auth submits
  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.length !== 6 || isNaN(Number(inputPin))) {
      setError('PIN must be exactly 6 digits.');
      return;
    }
    // Set PIN temporarily via API or just local storage for now
    // Actually, setting PIN in backend requires an authenticated request, so we should skip setting PIN from login screen in production.
    localStorage.setItem('sbt_admin_pin', inputPin);
    setAdminPin(inputPin);
    setIsAuthenticated(true);
    setError('');
    setInputPin('');
  };

  const loginMutation = useMutation({
    mutationFn: (pin: string) => api.post('/auth/login', { pin }),
    onSuccess: (response) => {
      setSentOtp(response.data.data.otp); // DEV ONLY (Usually SMS sends it)
      setAuthStep('otp');
      setInputOtp('');
      setError('');
      setShowOtpNotification(true);
      setTimeout(() => setShowOtpNotification(false), 15000);
      setInputPin('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Incorrect PIN. Please try again.');
      setInputPin('');
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => api.post<AuthTokens>('/auth/verify-otp', { otp }),
    onSuccess: (response: any) => {
      const { accessToken, refreshToken } = response.data.data;
      sessionStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.removeItem('sbt_admin_pin'); // Remove plaintext PIN backdoor
      
      setIsAuthenticated(true);
      setError('');
      setShowOtpNotification(false);
      setActiveTab('overview');
      setInputOtp('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || t('otpError') || 'Incorrect OTP.');
      setInputOtp('');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(inputPin);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate(inputOtp);
  };

  const resendOtpMutation = useMutation({
    mutationFn: () => api.post('/auth/request-otp', {}),
    onSuccess: (response) => {
      setSentOtp(response.data.otp);
      setInputOtp('');
      setError('');
      setShowOtpNotification(true);
      setTimeout(() => setShowOtpNotification(false), 15000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  });

  const updateAdminMobileMutation = useMutation({
    mutationFn: (mobile: string) => api.put('/users/admin/mobile', { mobile }),
    onSuccess: () => {
      setBizSettingsSaved(true);
      setTimeout(() => setBizSettingsSaved(false), 3000);
    },
    onError: () => {
      alert(t('errorLabel') || 'Failed to update settings');
    }
  });

  const handleResendOtp = () => {
    resendOtpMutation.mutate();
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset the admin PIN and clear all billing data?')) {
      localStorage.clear();
      setAdminPin(null);
      setBills([]);
      setGalleryImages([]);
      setIsAuthenticated(false);
      setError('');
      setInputPin('');
      setShowPin(false);
      setActiveModal(null);
      setActiveTab('overview');
      setWizardStep(1);
    }
  };

  const generateNextBillNumber = (type: 'labour' | 'other'): string => {
    const prefix = type === 'labour' ? 'SBT-L' : 'SBT-O';
    const currentYear = new Date().getFullYear().toString().substring(2);
    const matchingBills = bills.filter(b => b.id.startsWith(`${prefix}-${currentYear}-`));
    
    let nextSeq = 1;
    if (matchingBills.length > 0) {
      const seqs = matchingBills.map(b => {
        const parts = b.id.split('-');
        const parsed = parseInt(parts[parts.length - 1], 10);
        return isNaN(parsed) ? 0 : parsed;
      });
      nextSeq = Math.max(...seqs) + 1;
    }
    return `${prefix}-${currentYear}-${nextSeq.toString().padStart(3, '0')}`;
  };

  const handleLabourStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error('');
    if (!vehicleNumber.trim()) {
      setStep1Error('Please enter a vehicle registration number.');
      return;
    }
    if (!selectedCompany) {
      setStep1Error('Please select a company name.');
      return;
    }
    if (selectedCompany === 'Custom Company' && !customCompanyInput.trim()) {
      setStep1Error('Please specify the custom company name.');
      return;
    }
    setWorksError('');
    
    // Call API to create draft immediately
    draftBillMutation.mutate({
      clientName: selectedCompany === 'Custom Company' ? customCompanyInput : selectedCompany,
      vehicleNumber: vehicleNumber,
      items: [],
      language: invoiceLanguage
    });
  };

  const handleLabourWorksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorksError('');
    if (selectedWorks.length === 0) {
      setWorksError('Please select at least one work performed.');
      return;
    }

    const prefilled = selectedWorks.map((work: string) => ({
      description: translateWork(work, language),
      quantity: '1',
      rate: '',
      amount: ''
    }));
    setServiceItems(prefilled);
    
    if (editingDraftId) {
      updateDraftMutation.mutate({
        id: editingDraftId,
        payload: {
          clientName: selectedCompany === 'Custom Company' ? customCompanyInput : selectedCompany,
          vehicleNumber: vehicleNumber,
          language: invoiceLanguage,
          items: prefilled.map(item => ({
            description: item.description,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.rate) || 0
          }))
        }
      });
    }

    setWorksSearchQuery('');
    setWizardStep(4);
  };

  const saveBill = (asDraft: boolean) => {
    setStep2Error('');
    const filledItems = serviceItems.filter(item => item.description.trim());
    if (filledItems.length === 0) {
      setStep2Error('Please enter at least one service item with a description.');
      return;
    }

    if (asDraft) {
      if (editingDraftId) {
        updateDraftMutation.mutate({
          id: editingDraftId,
          payload: {
            clientName: selectedCompany === 'Custom Company' ? customCompanyInput : selectedCompany,
            vehicleNumber: vehicleNumber,
            language: invoiceLanguage,
            items: filledItems.map(item => ({
              description: item.description,
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.rate) || 0
            }))
          }
        }, {
          onSuccess: () => {
             setVehicleNumber('');
             setSelectedCompany('');
             setCustomCompanyInput('');
             setSelectedWorks([]);
             setServiceItems([{ description: '', quantity: '1', rate: '', amount: '' }]);
             setGeneratedBillNumber('');
             setEditingDraftId(null);
             setWizardStep(1);
             setActiveTab('overview');
          }
        });
      }
    } else {
      if (editingDraftId) {
        // First update with final items, then finalize
        updateDraftMutation.mutate({
          id: editingDraftId,
          payload: {
            clientName: selectedCompany === 'Custom Company' ? customCompanyInput : selectedCompany,
            vehicleNumber: vehicleNumber,
            language: invoiceLanguage,
            items: filledItems.map(item => ({
              description: item.description,
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.rate) || 0
            }))
          }
        }, {
          onSuccess: () => {
            finalizeBillMutation.mutate(editingDraftId);
          }
        });
      }
    }
  };

  const handleLabourStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBill(false);
  };

  const handleEditDraft = (draftBill: Bill) => {
    setEditingDraftId(draftBill.id);
    setSelectedBillMode('draft');
    setVehicleNumber(draftBill.vehicleNumber || '');
    
    if (DEFAULT_COMPANIES.includes(draftBill.clientName)) {
      setSelectedCompany(draftBill.clientName);
      setCustomCompanyInput('');
    } else {
      setSelectedCompany('Custom Company');
      setCustomCompanyInput(draftBill.clientName);
    }
    
    if (draftBill.items && draftBill.items.length > 0) {
      setServiceItems(draftBill.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity?.toString() || '1',
        rate: item.unitPrice?.toString() || item.rate || '',
        amount: item.subtotal?.toString() || item.amount || ''
      })));
    } else {
      setServiceItems(getInitialServiceItems());
    }

    setActiveTab('wizard');
    setWizardStep(4);
  };

  const updateServiceItem = (index: number, field: 'description' | 'amount' | 'quantity' | 'rate', value: string) => {
    const updated = [...serviceItems];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const q = parseFloat(updated[index].quantity || '1') || 0;
      const r = parseFloat(updated[index].rate || '0') || 0;
      updated[index].amount = (q * r).toString();
    }
    setServiceItems(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to cancel/delete invoice ${id}?`)) {
      cancelBillMutation.mutate(id);
    }
  };

  const handlePrint = () => {
    if (selectedBillForInvoice?.id) {
      generateReceiptMutation.mutate(selectedBillForInvoice.id);
    } else {
      window.print();
    }
  };

  const checkDateInIntervalHelper = (billDateStr: string, fromDateStr: string, toDateStr: string) => {
    return checkDateInInterval(billDateStr, fromDateStr, toDateStr);
  };

  const filteredWorks = availableWorks.filter((work: string) => {
    const englishName = translateWork(work, 'en').toLowerCase();
    const tamilName = translateWork(work, 'ta').toLowerCase();
    const query = worksSearchQuery.toLowerCase();
    return englishName.includes(query) || tamilName.includes(query);
  });

  // ==========================================================================
  // Layout Sub-Render Components
  // ==========================================================================

  const renderOverview = () => {
    // We still show quick stats based on the API total if possible, but let's just use the current page data or a summary endpoint later.
    // For now, we'll keep the placeholder stats if they rely on full data, or use total from billsQuery.
    const apiBills = billsQuery.data?.data || [];
    const totalRecords = billsQuery.data?.total || 0;
    const totalPages = Math.ceil(totalRecords / 20);

    return (
      <div className={styles.overviewTab}>
        <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>
          <h1 className={styles.title}>{t('overview')}</h1>
        </div>

        {/* Quick Actions Grid */}
        <div className={styles.dashboardActionsGrid}>
          <div className={styles.dashboardActionCard} onClick={() => {
            setStep1Error('');
            setActiveTab('wizard');
            setWizardStep(1);
          }}>
            <div className={styles.dashboardActionIcon}>🛠️</div>
            <div className={styles.dashboardActionText}>{t('labourBill')}</div>
          </div>
          
          <div className={styles.dashboardActionCard} onClick={() => setActiveTab('config')}>
            <div className={styles.dashboardActionIcon}>⚙️</div>
            <div className={styles.dashboardActionText}>{t('manageInventory')}</div>
          </div>
          
          <div className={styles.dashboardActionCard} onClick={() => setActiveTab('analysis')}>
            <div className={styles.dashboardActionIcon}>📈</div>
            <div className={styles.dashboardActionText}>{t('performanceAnalysis')}</div>
          </div>
        </div>

        {/* Invoice Register History */}
        <div className={styles.historySection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 className={styles.historyTitle} style={{ marginBottom: 0 }}>{t('invoiceHistory')}</h3>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search Client, Vehicle or Bill ID..." 
                className={styles.input}
                style={{ padding: '0.5rem', width: '250px' }}
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
              />
              <input 
                type="date"
                className={styles.input}
                style={{ padding: '0.5rem', width: '130px' }}
                value={invoiceStartDate}
                onChange={e => setInvoiceStartDate(e.target.value)}
              />
              <input 
                type="date"
                className={styles.input}
                style={{ padding: '0.5rem', width: '130px' }}
                value={invoiceEndDate}
                onChange={e => setInvoiceEndDate(e.target.value)}
              />
              <select 
                className={styles.input} 
                style={{ padding: '0.5rem', width: '150px' }}
                value={invoiceStatusFilter}
                onChange={e => setInvoiceStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="FINALIZED">Finalized</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {billsQuery.isLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>Loading invoices...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('invoiceNo')}</th>
                    <th>{t('type')}</th>
                    <th>Status</th>
                    <th>{t('clientCompany')}</th>
                    <th>{t('date')}</th>
                    <th>{t('grandTotal')}</th>
                    <th>{t('actionsLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {apiBills.map((bill: any) => (
                    <tr key={bill.id}>
                      <td style={{ fontWeight: 'bold' }}>{bill.id}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${styles.badgeLabour}`}>
                          {t('labourLabel')}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.typeBadge} ${
                          bill.status === 'DRAFT' ? styles.badgeDraft :
                          bill.status === 'FINALIZED' ? styles.badgeLabour :
                          bill.status === 'PAID' ? styles.badgeOther :
                          ''
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td>
                        {bill.clientName}
                        {bill.vehicleNumber && <div className={styles.subtext}>{t('vehicleLabel')}: {bill.vehicleNumber}</div>}
                      </td>
                      <td>
                        {new Date(bill.createdAt).toLocaleDateString()} 
                        <span className={styles.subtext}> at {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style={{ fontWeight: '600' }}>₹ {Number(bill.grandTotal).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {bill.status === 'DRAFT' ? (
                            <button 
                              type="button"
                              onClick={() => handleEditDraft(bill)} 
                              className={styles.editBtn}
                            >
                              {t('editDraftLabel')}
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedBillForInvoice(bill); // Ensure this mapping works with API format!
                                setActiveModal('invoice-preview');
                              }} 
                              className={styles.viewBtn}
                            >
                              {t('viewLabel')}
                            </button>
                          )}
                          <button type="button" onClick={() => handleDelete(bill.id)} className={styles.deleteBtn}>
                            {t('deleteLabel')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apiBills.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>{t('noBillsText')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => setInvoicePage(p => Math.max(0, p - 1))}
                disabled={invoicePage === 0}
                className={styles.secondaryBtn}
                style={{ padding: '0.5rem 1rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Page {invoicePage + 1} of {totalPages}
              </span>
              <button 
                onClick={() => setInvoicePage(p => Math.min(totalPages - 1, p + 1))}
                disabled={invoicePage >= totalPages - 1}
                className={styles.secondaryBtn}
                style={{ padding: '0.5rem 1rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWizard = () => {
    let progressWidth = '0%';
    if (wizardStep === 2) progressWidth = '33%';
    if (wizardStep === 3) progressWidth = '66%';
    if (wizardStep === 4) progressWidth = '100%';

    return (
      <div className={styles.wizardTab}>
        <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>
          <h1 className={styles.title}>{t('billingWizard')}</h1>
        </div>

        {/* Stepper Node Indicators */}
        <div className={styles.stepperContainer}>
          <div className={styles.stepperLine}></div>
          <div className={styles.stepperLineActive} style={{ width: progressWidth }}></div>
          
          <div className={`${styles.stepNode} ${wizardStep === 1 ? styles.stepNodeActive : wizardStep > 1 ? styles.stepNodeCompleted : ''}`}>
            <div className={styles.stepCircle}>1</div>
            <span className={styles.stepLabel}>{t('labourStep1Title')}</span>
          </div>
          
          <div className={`${styles.stepNode} ${wizardStep === 2 ? styles.stepNodeActive : wizardStep > 2 ? styles.stepNodeCompleted : ''}`}>
            <div className={styles.stepCircle}>1.5</div>
            <span className={styles.stepLabel}>{t('selectBillModeTitle')}</span>
          </div>
          
          <div className={`${styles.stepNode} ${wizardStep === 3 ? styles.stepNodeActive : wizardStep > 3 ? styles.stepNodeCompleted : ''}`}>
            <div className={styles.stepCircle}>2</div>
            <span className={styles.stepLabel}>{t('selectWorksTitle')}</span>
          </div>
          
          <div className={`${styles.stepNode} ${wizardStep === 4 ? styles.stepNodeActive : ''}`}>
            <div className={styles.stepCircle}>3</div>
            <span className={styles.stepLabel}>{t('ledgerSetupTitle')}</span>
          </div>
        </div>

        {/* Step Forms */}
        <div className={styles.formCard}>
          {/* STEP 1: Core Details Form */}
          {wizardStep === 1 && (
            <form onSubmit={handleLabourStep1Submit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>{t('vehiclePlateLabel')}</label>
                <input 
                  type="text"
                  placeholder="TN 01 AB 1234"
                  className={styles.input}
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t('companyClientLabel')}</label>
                <select
                  className={styles.input}
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  required
                >
                  <option value="" disabled>{t('selectCompany')}</option>
                  {companiesList.map(comp => (
                    <option key={comp} value={comp}>{translateCompany(comp, language)}</option>
                  ))}
                </select>
              </div>

              {selectedCompany === 'Custom Company' && (
                <div className={styles.formGroup}>
                  <label>{t('customCompanyLabel')}</label>
                  <input 
                    type="text"
                    placeholder="Enter company / owner name"
                    className={styles.input}
                    value={customCompanyInput}
                    onChange={(e) => setCustomCompanyInput(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Invoice Language</label>
                <select
                  className={styles.input}
                  value={invoiceLanguage}
                  onChange={(e) => setInvoiceLanguage(e.target.value as 'EN' | 'TA')}
                  required
                >
                  <option value="EN">English</option>
                  <option value="TA">தமிழ்</option>
                </select>
              </div>

              {step1Error && <p className={styles.errorText}>{step1Error}</p>}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setActiveTab('overview')} className={styles.secondaryBtn}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{ flexGrow: 1 }}>
                  {t('nextSelectWorks')}
                </button>
              </div>
            </form>
          )}

          {/* STEP 1.5: Select Bill Mode */}
          {wizardStep === 2 && (
            <div className={styles.modalForm}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {t('vehicleLabel')}: <strong style={{ color: 'var(--primary-blue-darkest)' }}>{vehicleNumber}</strong> | {t('companyClientLabel')}: <strong style={{ color: 'var(--primary-blue-darkest)' }}>{selectedCompany === 'Custom Company' ? customCompanyInput : translateCompany(selectedCompany, language)}</strong>
                </p>
              </div>
              
              <div className={styles.billModeContainer}>
                <div 
                  className={`${styles.billModeCard} ${selectedBillMode === 'instant' ? styles.billModeCardActive : ''}`}
                  onClick={() => setSelectedBillMode('instant')}
                >
                  <div className={styles.billModeHeader}>
                    <span className={styles.billModeIcon}>⚡</span>
                    <h3>{t('instantBillLabel')}</h3>
                  </div>
                </div>

                <div 
                  className={`${styles.billModeCard} ${selectedBillMode === 'draft' ? styles.billModeCardActive : ''}`}
                  onClick={() => setSelectedBillMode('draft')}
                >
                  <div className={styles.billModeHeader}>
                    <span className={styles.billModeIcon}>💾</span>
                    <h3>{t('draftBillLabel')}</h3>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setWizardStep(1)} className={styles.secondaryBtn}>
                  &larr; {t('cancel')}
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ flexGrow: 1 }}
                  onClick={() => setWizardStep(3)}
                >
                  {t('nextSelectWorks')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Works Checklist */}
          {wizardStep === 3 && (
            <form onSubmit={handleLabourWorksSubmit} className={styles.modalForm}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {t('vehicleLabel')}: <strong style={{ color: 'var(--primary-blue-darkest)' }}>{vehicleNumber}</strong> | {t('companyClientLabel')}: <strong style={{ color: 'var(--primary-blue-darkest)' }}>{selectedCompany === 'Custom Company' ? customCompanyInput : translateCompany(selectedCompany, language)}</strong> | Mode: <strong style={{ color: 'var(--primary-blue-darkest)' }}>{selectedBillMode === 'instant' ? t('instantBillLabel') : t('draftBillLabel')}</strong>
                </p>
              </div>

              <div className={styles.formGroup}>
                <input 
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className={styles.input}
                  style={{ marginBottom: '0.75rem', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                  value={worksSearchQuery}
                  onChange={(e) => setWorksSearchQuery(e.target.value)}
                />
                <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>{t('checkServicesLabel')}</label>
                <div className={styles.checkboxList}>
                  {filteredWorks.map((work: string) => {
                    const isChecked = selectedWorks.includes(work);
                    return (
                      <label key={work} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          className={styles.checkboxInput}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWorks([...selectedWorks, work]);
                            } else {
                              setSelectedWorks(selectedWorks.filter(w => w !== work));
                            }
                          }}
                        />
                        <span className={styles.checkboxText}>{translateWork(work, language)}</span>
                      </label>
                    );
                  })}
                  {filteredWorks.length === 0 && (
                    <div style={{ padding: '2rem 1rem', opacity: 0.5, textAlign: 'center', fontSize: '0.9rem' }}>
                      {t('noWorksText')}
                    </div>
                  )}
                </div>
                
                {/* Add Custom Work Inline */}
                <div className={styles.addCustomWorkWrapper} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder={t('addCustomWork')}
                    className={styles.input}
                    style={{ flexGrow: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    value={customWorkInput}
                    onChange={(e) => setCustomWorkInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                    onClick={async () => {
                      const trimmed = customWorkInput.trim();
                      if (trimmed && !availableWorks.includes(trimmed)) {
                        try {
                          await api.post('/services', { name: trimmed });
                          queryClient.invalidateQueries({ queryKey: ['services'] });
                          setSelectedWorks([...selectedWorks, trimmed]);
                          setCustomWorkInput('');
                        } catch {
                          // fallback — just add locally if API fails
                          setSelectedWorks([...selectedWorks, trimmed]);
                          setCustomWorkInput('');
                        }
                      }
                    }}
                  >
                    {t('addWorkBtn')}
                  </button>
                </div>
              </div>

              {worksError && <p className={styles.errorText}>{worksError}</p>}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setWizardStep(2)} className={styles.secondaryBtn}>
                  &larr; {t('cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{ flexGrow: 1 }}>
                  {t('nextBuildLedger')}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Ledger Table */}
          {wizardStep === 4 && (
            <form onSubmit={handleLabourStep2Submit} className={styles.modalForm}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {t('invoiceNo')}: <strong style={{ color: 'var(--primary-blue-darkest)' }}>{editingDraftId || generatedBillNumber || 'NEW'}</strong> | {t('vehicleLabel')}: {vehicleNumber} | {t('clientCompany')}: {selectedCompany === 'Custom Company' ? customCompanyInput : translateCompany(selectedCompany, language)}
                </p>
              </div>

              <div className={styles.ledgerTableWrapper}>
                <table className={styles.ledgerTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>{t('sNo')}</th>
                      <th>{t('serviceDescription')}</th>
                      <th style={{ width: '90px' }}>{t('qty')}</th>
                      <th style={{ width: '140px' }}>{t('rateRupees')}</th>
                      <th style={{ width: '150px' }}>{t('amountRupees')}</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceItems.map((item, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                        <td>
                          <input 
                            id={`desc-input-${index}`}
                            type="text"
                            list="welding-services"
                            placeholder={t('describeWeldingPlaceholder')}
                            className={styles.tableInput}
                            value={item.description}
                            onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                            onKeyDown={(e) => handleDescKeyDown(e, index)}
                            autoComplete="off"
                          />
                        </td>
                        <td>
                          <div className={styles.qtyContainer}>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => {
                                const currentQty = parseInt(item.quantity || '1', 10) || 1;
                                if (currentQty > 1) {
                                  updateServiceItem(index, 'quantity', (currentQty - 1).toString());
                                }
                              }}
                            >
                              -
                            </button>
                            <input 
                              id={`qty-input-${index}`}
                              type="text"
                              placeholder="1"
                              className={styles.qtyInput}
                              value={item.quantity || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                updateServiceItem(index, 'quantity', val);
                              }}
                              onBlur={() => {
                                if (!item.quantity) {
                                  updateServiceItem(index, 'quantity', '1');
                                }
                              }}
                              onKeyDown={(e) => handleQtyKeyDown(e, index)}
                            />
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => {
                                const currentQty = parseInt(item.quantity || '1', 10) || 1;
                                updateServiceItem(index, 'quantity', (currentQty + 1).toString());
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          <input 
                            id={`rate-input-${index}`}
                            type="number"
                            placeholder="0.00"
                            className={styles.tableInput}
                            value={item.rate || ''}
                            onChange={(e) => updateServiceItem(index, 'rate', e.target.value)}
                            onKeyDown={(e) => handleRateKeyDown(e, index)}
                            min="0"
                            step="any"
                          />
                        </td>
                        <td>
                          <input 
                            id={`amount-input-${index}`}
                            type="number"
                            placeholder="0.00"
                            className={styles.tableInput}
                            value={item.amount}
                            readOnly
                            style={{ background: 'rgba(0,0,0,0.02)', opacity: 0.8, cursor: 'not-allowed' }}
                            onKeyDown={(e) => handleAmountKeyDown(e, index)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {serviceItems.length > 1 && (
                            <button 
                              type="button"
                              className={styles.removeRowBtn}
                              onClick={() => deleteServiceItem(index)}
                              title="Remove row"
                            >
                              &times;
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <datalist id="welding-services">
                {DEFAULT_LABOUR_SERVICES.map((service, idx) => (
                  <option key={idx} value={translateWork(service, language)} />
                ))}
              </datalist>

              <div className={styles.calculationPanel}>
                <div className={`${styles.calcRow} ${styles.calcRowTotal}`}>
                  <span>{t('grandTotal')}:</span>
                  <strong>₹ {serviceItems.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0).toFixed(2)}</strong>
                </div>
              </div>

              {step2Error && <p className={styles.errorText}>{step2Error}</p>}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={() => setWizardStep(3)} 
                  className={styles.secondaryBtn}
                >
                  {t('addWorkBtnLedger')}
                </button>

                {selectedBillMode === 'draft' && (
                  <button 
                    type="button" 
                    onClick={() => saveBill(true)} 
                    className={styles.secondaryBtn}
                    style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)' }}
                  >
                    {t('saveAsDraft')}
                  </button>
                )}

                <button type="submit" className="btn-primary" style={{ flexGrow: 1 }}>
                  {selectedBillMode === 'draft' ? t('finalizeSaveInvoice') : t('generateSaveInvoice')}
                </button>
                
                <div style={{ flexBasis: '100%', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {updateDraftMutation.isPending && <span>Saving...</span>}
                  {updateDraftMutation.isSuccess && !updateDraftMutation.isPending && <span style={{ color: 'var(--success-green)' }}>Saved</span>}
                  {updateDraftMutation.isError && <span style={{ color: 'var(--error-red)' }}>Failed to Save</span>}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderConfig = () => {
    return (
      <div className={styles.configTab}>
        <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>
          <h1 className={styles.title}>{t('configurations')}</h1>
        </div>

        <div className={styles.inventoryGrid}>
          <div className={styles.inventorySection}>
            <h3 className={styles.inventorySectionTitle}>{t('weldingWorksTitle')}</h3>
            
            <form onSubmit={handleAddWork} className={styles.addInlineForm}>
              <input 
                type="text" 
                placeholder="e.g. Tank Outer Shell Polishing"
                className={styles.input}
                style={{ flexGrow: 1 }}
                value={newWorkName}
                onChange={(e) => setNewWorkName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                {t('addProduct')}
              </button>
            </form>

            <div className={styles.inventoryScrollList}>
              {isLoadingWorks && <p style={{ padding: '1rem', opacity: 0.5, textAlign: 'center' }}>Loading works...</p>}
              {!isLoadingWorks && availableWorks.map((work: string) => (
                <div key={work} className={styles.inventoryItem}>
                  <span className={styles.inventoryItemText}>{translateWork(work, language)}</span>
                  <button 
                    type="button" 
                    className={styles.inventoryItemDeleteBtn}
                    onClick={() => handleDeleteWork(work)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              {!isLoadingWorks && availableWorks.length === 0 && (
                <p style={{ padding: '1rem', opacity: 0.5, textAlign: 'center', fontSize: '0.9rem' }}>
                  {t('noServicesText')}
                </p>
              )}
            </div>
          </div>

          <div className={styles.inventorySection}>
            <h3 className={styles.inventorySectionTitle}>🚛 {t('presetCompaniesTitle')}</h3>
            
            <form onSubmit={handleAddCompany} className={styles.addInlineForm}>
              <input 
                type="text" 
                placeholder="e.g. SRM Transports Namakkal"
                className={styles.input}
                style={{ flexGrow: 1 }}
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                {t('addCompany')}
              </button>
            </form>

            <div className={styles.inventoryScrollList}>
              {isLoadingCompanies && <p style={{ padding: '1rem', opacity: 0.5, textAlign: 'center' }}>Loading companies...</p>}
              {!isLoadingCompanies && companiesList.map(comp => (
                <div key={comp} className={styles.inventoryItem}>
                  <span className={styles.inventoryItemText}>{translateCompany(comp, language)}</span>
                  {comp !== 'Custom Company' ? (
                    <button 
                      type="button" 
                      className={styles.inventoryItemDeleteBtn}
                      onClick={() => handleDeleteCompany(comp)}
                    >
                      &times;
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', opacity: 0.4, padding: '0 0.5rem' }}>System</span>
                  )}
                </div>
              ))}
              {!isLoadingCompanies && companiesList.length === 0 && (
                <p style={{ padding: '1rem', opacity: 0.5, textAlign: 'center', fontSize: '0.9rem' }}>
                  No companies found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysis = () => {
    const dash = dashboardQuery.data;
    const fourMonthData: any[] = fourMonthQuery.data || [];
    const currentMonth = fourMonthData[3] || { revenue: 0, bills: 0, month: '' };
    const previousMonth = fourMonthData[2] || { revenue: 0, bills: 0, month: '' };
    const revDiff = (currentMonth.revenue || 0) - (previousMonth.revenue || 0);
    const revPct = (previousMonth.revenue || 0) > 0 ? (revDiff / previousMonth.revenue) * 100 : 0;
    const billsDiff = (currentMonth.bills || 0) - (previousMonth.bills || 0);
    const billsPct = (previousMonth.bills || 0) > 0 ? (billsDiff / previousMonth.bills) * 100 : 0;
    const maxRevenue = Math.max(...fourMonthData.map((d: any) => d.revenue || 0), 1) * 1.15;
    const maxBills = Math.max(...fourMonthData.map((d: any) => d.bills || 0), 1) * 1.15;

    return (
      <div className={styles.analysisTab}>
        <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>
          <h1 className={styles.title}>{t('performanceTitle')}</h1>
        </div>

        {/* Live Dashboard Stats */}
        {dashboardQuery.isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>Loading analytics...</div>
        ) : (
          <div className={styles.dashboardStats} style={{ marginBottom: '2rem' }}>
            <div className={styles.dashboardStatCard}>
              <div className={styles.dashboardStatHeader}><span className={styles.dashboardStatIcon}>🪙</span></div>
              <div className={styles.dashboardStatVal}>₹{Number(dash?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              <div className={styles.dashboardStatLabel}>Total Revenue (All Time)</div>
            </div>
            <div className={styles.dashboardStatCard}>
              <div className={styles.dashboardStatHeader}><span className={styles.dashboardStatIcon}>📅</span></div>
              <div className={styles.dashboardStatVal}>₹{Number(dash?.currentMonthRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              <div className={styles.dashboardStatLabel}>This Month Revenue</div>
            </div>
            <div className={styles.dashboardStatCard}>
              <div className={styles.dashboardStatHeader}><span className={styles.dashboardStatIcon}>📄</span></div>
              <div className={styles.dashboardStatVal}>{dash?.totalBills || 0}</div>
              <div className={styles.dashboardStatLabel}>{t('billsSubmitted')}</div>
            </div>
            <div className={styles.dashboardStatCard}>
              <div className={styles.dashboardStatHeader}><span className={styles.dashboardStatIcon}>💾</span></div>
              <div className={styles.dashboardStatVal}>{dash?.totalDrafts || 0}</div>
              <div className={styles.dashboardStatLabel}>{t('draftLabel')}</div>
            </div>
          </div>
        )}

        <div className={styles.analysisGrid}>
          {/* Date Auditor using Invoice Register filters */}
          <div className={styles.analysisSectionBlock}>
            <h3 className={styles.analysisSectionTitle}>{t('dateAuditorTitle')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
              <div className={styles.datePickerWrapper}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t('fromDate')}</label>
                <input 
                  type="date"
                  className={styles.dateInput}
                  value={invoiceStartDate}
                  onChange={(e) => { setInvoiceStartDate(e.target.value); setInvoicePage(0); }}
                />
              </div>
              <div className={styles.datePickerWrapper}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t('toDate')}</label>
                <input 
                  type="date"
                  className={styles.dateInput}
                  value={invoiceEndDate}
                  onChange={(e) => { setInvoiceEndDate(e.target.value); setInvoicePage(0); }}
                />
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>{t('billsSubmitted')}</div>
                <div className={`${styles.statVal} ${styles.statValOrange}`}>
                  {billsQuery.isLoading ? '...' : billsQuery.data?.total || 0}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>{t('totalRevenue')}</div>
                <div className={styles.statVal}>
                  {billsQuery.isLoading ? '...' : `₹${(billsQuery.data?.data || []).reduce((s: number, b: any) => s + Number(b.grandTotal || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                {t('auditRegisterTitle')}
              </label>
              <div className={styles.smallBillsList}>
                {(billsQuery.data?.data || []).map((bill: any) => (
                  <div key={bill.id} className={styles.smallBillItem}>
                    <div>
                      <span className={styles.smallBillId}>{bill.id}</span>
                      <span style={{ margin: '0 0.5rem', opacity: 0.4 }}>|</span>
                      <span className={styles.smallBillClient}>{bill.clientName}</span>
                    </div>
                    <div>
                      <span className={styles.smallBillAmt}>₹{Number(bill.grandTotal).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
                {!billsQuery.isLoading && (billsQuery.data?.data || []).length === 0 && (
                  <div style={{ textAlign: 'center', opacity: 0.5, padding: '2.5rem 1rem', fontSize: '0.85rem' }}>
                    {t('noLogsText')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-Month Chart */}
          <div className={styles.analysisSectionBlock}>
            <h3 className={styles.analysisSectionTitle}>{t('fourMonthPerformance')}</h3>

            {fourMonthQuery.isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>Loading charts...</div>
            ) : (
              <div className={styles.chartFlex}>
                <div className={styles.chartContainer} style={{ maxWidth: '270px' }}>
                  <span className={styles.chartTitle}>{t('revenueTrend')}</span>
                  <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
                    <line x1="20" y1="20" x2="190" y2="20" stroke="var(--border-color)" strokeDasharray="3,3" opacity="0.3" />
                    <line x1="20" y1="90" x2="190" y2="90" stroke="var(--border-color)" strokeDasharray="3,3" opacity="0.3" />
                    <line x1="20" y1="160" x2="190" y2="160" stroke="var(--border-color)" strokeWidth="1" />
                    <defs>
                      <linearGradient id="pastMonthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#718096" />
                        <stop offset="100%" stopColor="#4a5568" />
                      </linearGradient>
                      <linearGradient id="currMonthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-blue)" />
                        <stop offset="100%" stopColor="var(--primary-blue-dark)" />
                      </linearGradient>
                    </defs>
                    {fourMonthData.map((item: any, idx: number) => {
                      const barHeight = maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 135 : 0;
                      const xPos = 26 + idx * 42;
                      const isCurrent = idx === 3;
                      return (
                        <g key={idx}>
                          <rect x={xPos} y={160 - barHeight} width="24" height={barHeight} fill={isCurrent ? "url(#currMonthGrad)" : "url(#pastMonthGrad)"} rx="3" />
                          <text x={xPos + 12} y="175" textAnchor="middle" fill="var(--foreground)" fontSize="9" opacity={isCurrent ? 1 : 0.7} fontWeight={isCurrent ? "bold" : "normal"}>{item.month}</text>
                          <text x={xPos + 12} y={152 - barHeight} textAnchor="middle" fill={isCurrent ? "var(--primary-blue)" : "var(--foreground)"} fontSize="9" fontWeight="bold">₹{((item.revenue || 0) / 1000).toFixed(0)}k</text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className={`${styles.trendIndicator} ${revDiff >= 0 ? styles.trendUp : styles.trendDown}`} style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
                    {revDiff >= 0 ? '▲' : '▼'} {Math.abs(revPct).toFixed(1)}% {revDiff >= 0 ? 'increase' : 'dip'} (MoM)
                  </div>
                </div>

                <div className={styles.chartContainer} style={{ maxWidth: '270px' }}>
                  <span className={styles.chartTitle}>{t('billVolumeTrend')}</span>
                  <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
                    <line x1="20" y1="20" x2="190" y2="20" stroke="var(--border-color)" strokeDasharray="3,3" opacity="0.3" />
                    <line x1="20" y1="90" x2="190" y2="90" stroke="var(--border-color)" strokeDasharray="3,3" opacity="0.3" />
                    <line x1="20" y1="160" x2="190" y2="160" stroke="var(--border-color)" strokeWidth="1" />
                    {fourMonthData.map((item: any, idx: number) => {
                      const barHeight = maxBills > 0 ? ((item.bills || 0) / maxBills) * 135 : 0;
                      const xPos = 26 + idx * 42;
                      const isCurrent = idx === 3;
                      return (
                        <g key={idx}>
                          <rect x={xPos} y={160 - barHeight} width="24" height={barHeight} fill={isCurrent ? "url(#currMonthGrad)" : "url(#pastMonthGrad)"} rx="3" />
                          <text x={xPos + 12} y="175" textAnchor="middle" fill="var(--foreground)" fontSize="9" opacity={isCurrent ? 1 : 0.7} fontWeight={isCurrent ? "bold" : "normal"}>{item.month}</text>
                          <text x={xPos + 12} y={152 - barHeight} textAnchor="middle" fill={isCurrent ? "var(--primary-blue)" : "var(--foreground)"} fontSize="9" fontWeight="bold">{item.bills || 0}</text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className={`${styles.trendIndicator} ${billsDiff >= 0 ? styles.trendUp : styles.trendDown}`} style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
                    {billsDiff >= 0 ? '▲' : '▼'} {Math.abs(billsPct).toFixed(1)}% {billsDiff >= 0 ? 'rise' : 'dip'} (MoM)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };




  const renderGallery = () => {
    return (
      <div className={styles.galleryTab}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className={styles.title} style={{ margin: 0 }}>
            {t('referenceGalleryTitle')}
          </h1>
          <label className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {t('addWorkImage')}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
        
        <div className={styles.galleryGrid}>
          {galleryImages.map(img => (
            <div key={img.id} className={styles.galleryCard}>
              <img src={img.dataUrl} alt={img.title} className={styles.galleryImg} />
              <div className={styles.galleryMeta}>
                <span className={styles.galleryTitle}>{img.title}</span>
                <button 
                  type="button" 
                  className={styles.galleryDeleteBtn} 
                  onClick={() => handleDeleteImage(img.id)}
                  title="Delete image"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
          {galleryImages.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '5rem 1rem', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--border-color)', borderRadius: '12px', fontSize: '0.9rem' }}>
              {t('noImagesText')}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Sprint 4F: Payments Ledger ───────────────────────────────────────────
  const renderPayments = () => {
    const paymentsData: any[] = paymentsQuery.data?.data || [];
    const totalPayments = paymentsQuery.data?.total || 0;
    const totalPages = Math.ceil(totalPayments / 20);
    return (
      <div className={styles.overviewTab}>
        <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>
          <h1 className={styles.title}>Payments Ledger</h1>
        </div>
        <div className={styles.historySection}>
          <div className={styles.tableContainer}>
            {paymentsQuery.isLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>Loading payments...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Bill ID</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsData.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.id.substring(0, 8)}...</td>
                      <td style={{ fontWeight: 'bold' }}>{p.billId}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${styles.badgeLabour}`}>{p.method}</span>
                      </td>
                      <td>
                        <span className={`${styles.typeBadge} ${p.status === 'COMPLETED' ? styles.badgeLabour : styles.badgeDraft}`}>{p.status}</span>
                      </td>
                      <td style={{ fontWeight: '600' }}>₹ {Number(p.amount).toFixed(2)}</td>
                      <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td style={{ opacity: 0.7 }}>{p.reference || '—'}</td>
                    </tr>
                  ))}
                  {paymentsData.length === 0 && !paymentsQuery.isLoading && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No payments recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
              <button onClick={() => setPaymentsPage(p => Math.max(0, p - 1))} disabled={paymentsPage === 0} className={styles.secondaryBtn} style={{ padding: '0.5rem 1rem' }}>Previous</button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Page {paymentsPage + 1} of {totalPages}</span>
              <button onClick={() => setPaymentsPage(p => Math.min(totalPages - 1, p + 1))} disabled={paymentsPage >= totalPages - 1} className={styles.secondaryBtn} style={{ padding: '0.5rem 1rem' }}>Next</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Sprint 4I: Customer Management ──────────────────────────────────────
  const renderCustomers = () => {
    const custList: any[] = customersQuery.data?.data || [];
    const totalCustomers = customersQuery.data?.total || 0;
    const totalPages = Math.ceil(totalCustomers / 20);
    return (
      <div className={styles.overviewTab}>
        <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>
          <h1 className={styles.title}>Customer Management</h1>
        </div>

        {showCustomerForm && (
          <div className={styles.formCard} style={{ maxWidth: '500px', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontWeight: 700 }}>{editingCustomerId ? 'Edit Customer' : 'Add New Customer'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); createCustomerMutation.mutate(customerForm); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className={styles.formGroup}>
                <label>Company Name *</label>
                <input className={styles.input} required value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} placeholder="Transport company name" />
              </div>
              <div className={styles.formGroup}>
                <label>Mobile</label>
                <input className={styles.input} value={customerForm.mobile} onChange={e => setCustomerForm(f => ({ ...f, mobile: e.target.value }))} placeholder="+91 9876543210" />
              </div>
              <div className={styles.formGroup}>
                <label>Address</label>
                <input className={styles.input} value={customerForm.address} onChange={e => setCustomerForm(f => ({ ...f, address: e.target.value }))} placeholder="Business address" />
              </div>
              <div className={styles.formGroup}>
                <label>GSTIN</label>
                <input className={styles.input} value={customerForm.gstin} onChange={e => setCustomerForm(f => ({ ...f, gstin: e.target.value }))} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary" disabled={createCustomerMutation.isPending}>{createCustomerMutation.isPending ? 'Saving...' : (editingCustomerId ? 'Update' : 'Add Customer')}</button>
                <button type="button" className={styles.secondaryBtn} onClick={() => { setShowCustomerForm(false); setEditingCustomerId(null); setCustomerForm({ name: '', mobile: '', address: '', gstin: '' }); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search customers..." className={styles.input} style={{ padding: '0.5rem', width: '250px' }} value={customersSearch} onChange={e => { setCustomersSearch(e.target.value); setCustomersPage(0); }} />
          <button className="btn-primary" onClick={() => { setShowCustomerForm(true); setEditingCustomerId(null); setCustomerForm({ name: '', mobile: '', address: '', gstin: '' }); }}>+ Add Customer</button>
        </div>

        <div className={styles.tableContainer}>
          {customersQuery.isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>Loading customers...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Mobile</th>
                  <th>GSTIN</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {custList.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '600' }}>{c.name}</td>
                    <td>{c.mobile || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.gstin || '—'}</td>
                    <td>
                      <span className={`${styles.typeBadge} ${c.isActive ? styles.badgeLabour : styles.badgeDraft}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className={styles.editBtn} onClick={() => { setCustomerForm({ name: c.name, mobile: c.mobile || '', address: c.address || '', gstin: c.gstin || '' }); setEditingCustomerId(c.id); setShowCustomerForm(true); }}>Edit</button>
                        <button type="button" className={styles.deleteBtn} onClick={() => { if (confirm(`Deactivate ${c.name}?`)) deleteCustomerMutation.mutate(c.id); }}>Deactivate</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {custList.length === 0 && !customersQuery.isLoading && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No customers found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
            <button onClick={() => setCustomersPage(p => Math.max(0, p - 1))} disabled={customersPage === 0} className={styles.secondaryBtn} style={{ padding: '0.5rem 1rem' }}>Previous</button>
            <span style={{ fontSize: '0.9rem' }}>Page {customersPage + 1} of {totalPages}</span>
            <button onClick={() => setCustomersPage(p => Math.min(totalPages - 1, p + 1))} disabled={customersPage >= totalPages - 1} className={styles.secondaryBtn} style={{ padding: '0.5rem 1rem' }}>Next</button>
          </div>
        )}
      </div>
    );
  };

  // ── Sprint 4H: Settings (Business + PIN) ────────────────────────────────
  const renderSettings = () => {
    return (
      <div className={styles.settingsTab}>
        <div className={styles.header} style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>
          <h1 className={styles.title}>{t('settings')}</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '560px' }}>

          {/* Business Settings Card */}
          <div className={styles.formCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-blue-darkest)', fontSize: '1.2rem', fontWeight: 700 }}>
              🏢 Business Information
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
              These details appear on all generated invoices.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); updateAdminMobileMutation.mutate(bizPhone); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Business Name</label>
                <input className={styles.input} value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Sri Balamurugan Tank Service" />
              </div>
              <div className={styles.formGroup}>
                <label>GSTIN</label>
                <input className={styles.input} value={bizGstin} onChange={e => setBizGstin(e.target.value)} placeholder="33AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div className={styles.formGroup}>
                <label>Address</label>
                <input className={styles.input} value={bizAddress} onChange={e => setBizAddress(e.target.value)} placeholder="No. 1, Tamil Nadu — 600001" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input className={styles.input} value={bizPhone} onChange={e => setBizPhone(e.target.value)} placeholder="+91 9876543210" />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input className={styles.input} type="email" value={bizEmail} onChange={e => setBizEmail(e.target.value)} placeholder="info@example.com" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Default Invoice Language</label>
                <select className={styles.input} value={bizDefaultLang} onChange={e => setBizDefaultLang(e.target.value as 'EN' | 'TA')}>
                  <option value="EN">English</option>
                  <option value="TA">தமிழ்</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Business Settings</button>
                {bizSettingsSaved && <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Saved</span>}
              </div>
            </form>
          </div>

          {/* PIN Change Card */}
          <div className={styles.formCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-blue-darkest)', fontSize: '1.2rem', fontWeight: 700 }}>
              🔒 {t('enterPin')}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
              Change the 6-digit administrator PIN used to access billing and reporting.
            </p>
            <form onSubmit={handleSetPin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>New 6-Digit PIN</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type={showPin ? "text" : "password"} 
                    maxLength={6}
                    className={styles.input}
                    style={{ letterSpacing: '0.5rem', fontSize: '1.5rem', textAlign: 'center', width: '180px', padding: '0.5rem' }}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="******"
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.8, margin: 0 }}>
                    <input type="checkbox" checked={showPin} onChange={() => setShowPin(!showPin)} />
                    {t('showPin')}
                  </label>
                </div>
              </div>
              {error && <p className={styles.errorText} style={{ margin: 0 }}>{error}</p>}
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Change PIN
              </button>
            </form>
          </div>

          {/* Backup & Restore Card */}
          <div className={styles.formCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-blue-darkest)', fontSize: '1.2rem', fontWeight: 700 }}>
              💾 Backup & Restore
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
              Create a full JSON export of all bills, customers, vehicles, and payments. Download and store it securely.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                disabled={backupLoading}
                onClick={handleCreateBackup}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                {backupLoading ? 'Creating...' : '📥 Create Backup Now'}
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={fetchBackupList}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Refresh List
              </button>
            </div>
            {backupStatus && (
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: backupStatus.startsWith('✓') ? 'var(--success)' : 'var(--error)' }}>
                {backupStatus}
              </p>
            )}
            {backupList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {backupList.map((b: any) => (
                  <div key={b.filename} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontFamily: 'monospace' }}>{b.filename}</span>
                    <button
                      type="button"
                      className={styles.viewBtn}
                      onClick={() => handleDownloadBackup(b.filename)}
                    >
                      ⬇ Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className={styles.formCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ margin: 0, color: 'var(--error)', fontSize: '1.2rem', fontWeight: 700 }}>
              ⚠ Administrative System Reset
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
              Clear all invoices, preset companies, welding works configuration, reference gallery files, and reset the admin PIN. This action is irreversible.
            </p>
            <button 
              type="button" 
              className={styles.deleteBtn}
              style={{ alignSelf: 'flex-start', padding: '0.65rem 1.25rem' }}
              onClick={handleResetAll}
            >
              Reset All System Data
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoicePreview = () => {
    if (!selectedBillForInvoice) return null;
    return (
      <div className={`${styles.modalOverlay} ${styles.invoiceOverlay}`}>
        <div className={`${styles.modalContent} ${styles.invoiceModalContent}`}>
          <div className={styles.invoicePanelActions}>
            <button onClick={handlePrint} className="btn-primary">
              {t('printPdf')}
            </button>
            <button onClick={() => setActiveModal(null)} className={styles.secondaryBtn}>
              {t('closeRegister')}
            </button>
          </div>

          <div className={styles.invoiceBody}>
            <div className={styles.invoiceHeader}>
              <div>
                <h1 className={styles.corporateTitle}>{t('corporateTitle')}</h1>
                <p className={styles.corporateSub}>{t('corporateSub')}</p>
                <p className={styles.corporateDetails}>{t('corporateDetails')}</p>
                <p className={styles.corporateDetails}>Email: billing@sribalamurugan.com | Mob: +91 98765 43210</p>
              </div>
              <div className={styles.gstinBox}>
                <span className={styles.gstinLabel}>{t('invoiceRegisterTitle')}</span>
                <div className={styles.gstinValue}>GSTIN: 33AAAAA1111A1Z1</div>
              </div>
            </div>

            <hr className={styles.invoiceDivider} />

            <div className={styles.invoiceMetaGrid}>
              <div>
                <div className={styles.metaLabel}>{t('billedTo')}</div>
                <div className={styles.metaValCompany}>{selectedBillForInvoice.clientName}</div>
                {selectedBillForInvoice.vehicleNumber && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <strong>{t('vehicleLabel')}:</strong> {selectedBillForInvoice.vehicleNumber}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={styles.metaLabel}>{t('invoiceDetails')}</div>
                <div style={{ fontSize: '1.05rem', margin: '0.2rem 0' }}>
                  <strong>{t('invoiceNo')}:</strong> <span style={{ color: 'var(--primary-blue-darkest)', fontWeight: 'bold' }} className={styles.invoicePrintNo}>{selectedBillForInvoice.id}</span>
                </div>
                <div><strong>{t('date')}:</strong> {selectedBillForInvoice.date}</div>
                {selectedBillForInvoice.time && <div><strong>Time:</strong> {selectedBillForInvoice.time}</div>}
                <div><strong>{t('statusLabel')}</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{t('statusPaid')}</span></div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div className={styles.invoiceLedgerTableWrapper}>
                <table className={styles.invoiceLedgerTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>{t('sNo')}</th>
                      <th>{t('serviceDescription')}</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>{t('qty')}</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>{t('rateRupees')}</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>{t('amountRupees')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBillForInvoice.items && selectedBillForInvoice.items.map((item, idx) => {
                      const qty = item.quantity || '1';
                      const rate = item.rate || item.amount;
                      return (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center', fontWeight: '500' }}>{idx + 1}</td>
                          <td>{item.description}</td>
                          <td style={{ textAlign: 'center' }}>{qty}</td>
                          <td style={{ textAlign: 'right' }}>{parseFloat(rate ?? '0').toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>{parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.invoiceSummaryWrapper}>
              <div className={styles.invoiceSummaryBox}>
                <div className={`${styles.summaryRow} ${styles.summaryRowGrand}`} style={{ border: 'none' }}>
                  <span>{t('grandTotal')}:</span>
                  <span>₹ {selectedBillForInvoice.amount}</span>
                </div>
              </div>
            </div>

            <div className={styles.signatureSection}>
              <div className={styles.signatureBox}>
                <div className={styles.sigLine}></div>
                <div>{t('authorizedSignature')}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.2rem' }}>SRI BALAMURUGAN WELDING WORKS</div>
              </div>
            </div>

            <div className={styles.invoiceFooter}>
              <p>{t('footerTerms')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoaded) return null;

  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      {!isAuthenticated ? (
        <div className={styles.authContainer}>
          {showOtpNotification && (
            <div 
              style={{
                background: 'var(--panel-bg)',
                border: '1px solid var(--primary-blue)',
                color: 'var(--foreground)',
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                maxWidth: '420px',
                width: '90%',
                fontSize: '0.9rem',
                boxShadow: '0 8px 30px rgba(46, 125, 191, 0.08)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                animation: 'float 4s ease-in-out infinite'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                <strong style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💬 {t('smsNotification')}
                </strong>
                <button 
                  onClick={() => setShowOtpNotification(false)}
                  style={{ color: 'var(--foreground)', fontSize: '1.25rem', cursor: 'pointer', opacity: 0.5, lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>
              <div style={{ opacity: 0.9 }}>
                {t('smsNotificationBody')} <strong style={{ color: 'var(--primary-blue-dark)', fontSize: '1.05rem', letterSpacing: '1px' }}>{sentOtp}</strong>
              </div>
            </div>
          )}

          <div className={styles.authCard}>
            {authStep === 'pin' ? (
              <>
                <h2 className={styles.title}>
                  {adminPin ? t('enterPin') : t('setPinTitle')}
                </h2>
                <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                  {adminPin ? t('pinSubtitle') : t('pinSubtitleSet')}
                </p>
                <form onSubmit={adminPin ? handleLogin : handleSetPin}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input 
                      type={showPin ? "text" : "password"} 
                      maxLength={6}
                      className={styles.pinInput}
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value)}
                      placeholder="******"
                      autoFocus
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem', opacity: 0.8 }}>
                      <input 
                        type="checkbox" 
                        checked={showPin} 
                        onChange={() => setShowPin(!showPin)} 
                      />
                      {t('showPin')}
                    </label>
                  </div>
                  <button type="submit" className="btn-primary">
                    {adminPin ? t('unlock') : t('setPinBtn')}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className={styles.title}>
                  {t('enterOtpTitle')}
                </h2>
                <p style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {t('otpSubtitle')}
                </p>
                <form onSubmit={handleOtpVerify}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      maxLength={6}
                      className={styles.pinInput}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="******"
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                      <button 
                        type="button" 
                        onClick={handleResendOtp}
                        style={{ color: 'var(--primary-blue)', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        {t('resendOtp')}
                      </button>
                      <span style={{ opacity: 0.4 }}>|</span>
                      <button 
                        type="button" 
                        onClick={() => { setAuthStep('pin'); setError(''); setShowOtpNotification(false); }}
                        style={{ opacity: 0.7, textDecoration: 'underline', cursor: 'pointer', color: 'var(--foreground)' }}
                      >
                        {t('backToPin')}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                    {t('verifyAccess')}
                  </button>
                </form>
              </>
            )}
            {error && <p className={styles.errorText}>{error}</p>}
            
            {adminPin && authStep === 'pin' && (
              <button 
                type="button" 
                onClick={handleResetAll} 
                style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.6, textDecoration: 'underline', color: 'var(--foreground)', cursor: 'pointer' }}
              >
                {t('forgotPin')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.dashboardLayout}>
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarBrand}>{t('corporateTitle')}</span>
              <div className={styles.sidebarStatus}>
                <span className={styles.sidebarStatusDot}></span>
                {t('online')}
              </div>
            </div>
            
            <nav className={styles.sidebarMenu}>
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'overview' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className={styles.sidebarIcon}>📊</span>
                {t('overview')}
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'wizard' ? styles.sidebarBtnActive : ''}`}
                onClick={() => {
                  setActiveTab('wizard');
                  setWizardStep(1);
                }}
              >
                <span className={styles.sidebarIcon}>🧾</span>
                {t('billingWizard')}
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'config' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('config')}
              >
                <span className={styles.sidebarIcon}>⚙️</span>
                {t('configurations')}
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'analysis' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                <span className={styles.sidebarIcon}>📈</span>
                {t('performanceAudit')}
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'payments' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                <span className={styles.sidebarIcon}>💳</span>
                Payments
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'customers' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                <span className={styles.sidebarIcon}>🏭</span>
                Customers
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'gallery' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <span className={styles.sidebarIcon}>📸</span>
                {t('referenceGallery')}
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarBtn} ${activeTab === 'settings' ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className={styles.sidebarIcon}>🔒</span>
                {t('settings')}
              </button>
            </nav>
            
            <div className={styles.sidebarFooter}>
              <button 
                type="button"
                className={styles.secondaryBtn}
                style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}
                onClick={() => setIsAuthenticated(false)}
              >
                🚪 {t('signOut')}
              </button>
            </div>
          </aside>
          
          {/* RIGHT WORKSPACE AREA */}
          <main className={styles.mainWorkspace}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'wizard' && renderWizard()}
            {activeTab === 'config' && renderConfig()}
            {activeTab === 'analysis' && renderAnalysis()}
            {activeTab === 'payments' && renderPayments()}
            {activeTab === 'customers' && renderCustomers()}
            {activeTab === 'gallery' && renderGallery()}
            {activeTab === 'settings' && renderSettings()}
          </main>
          
          {/* Print preview modal overlay */}
          {activeModal === 'invoice-preview' && selectedBillForInvoice && renderInvoicePreview()}
        </div>
      )}
    </div>
  );
}
