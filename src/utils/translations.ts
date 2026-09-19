export type Language = 'en' | 'hi';

export interface Translations {
  // App Bar & Modes
  appName: string;
  appSubtitle: string;
  selfMode: string;
  factoryHrMode: string;
  modeLabel: string;
  langToggle: string;
  
  // Navigation & Stats
  thisMonth: string;
  changeYear: string;
  workDays: string;
  halfDays: string;
  overtimeHours: string;
  totalEarnings: string;
  dailyWage: string;
  viewSalaryDetails: string;
  
  // Action Buttons
  facePunch: string;
  notesDiary: string;
  salarySlip: string;
  settings: string;
  guide: string;
  punchInDone: string;
  
  // Tools Bar
  toolWork: string;
  toolHalfDuty: string;
  toolOvertime: string;
  toolHoliday: string;
  toolAbsent: string;
  toolClear: string;
  toolNote: string;
  toolsInstruction: string;

  // HR Section
  hrTitle: string;
  workerList: string;
  addWorker: string;
  payrollRegister: string;
  companySettings: string;
  workerName: string;
  phoneNumber: string;
  roleDesignation: string;
  monthlyGross: string;
  monthlyBasic: string;
  hraAmount: string;
  presentDays: string;
  otRate: string;
  advanceTaken: string;
  pfPercent: string;
  esiPercent: string;
  saveWorker: string;
  facePunchWorker: string;
  printSlip: string;
  printFullPayroll: string;
  netPayout: string;
  totalCompanyPayout: string;
  basicHraNote: string;
  
  // Daily Muster
  dailyMuster: string;
  markAllPresent: string;
  markAllHalfDay: string;
  markAllAbsent: string;
  printDaySheet: string;
  todayDuty: string;
  syncPayroll: string;
  
  // Footer
  referFriend: string;
  privacyPolicy: string;
  howToUse: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Attendance Pro',
    appSubtitle: 'Duty • Salary • Diary',
    selfMode: '👤 Self Attendance',
    factoryHrMode: '🏭 Factory HR Mode',
    modeLabel: 'Mode:',
    langToggle: 'हिंदी',
    
    thisMonth: 'Current Month',
    changeYear: 'Change Year',
    workDays: 'Full Work',
    halfDays: 'Half Duty',
    overtimeHours: 'Overtime',
    totalEarnings: 'Total Net Salary',
    dailyWage: 'Daily Wage',
    viewSalaryDetails: 'View Details',
    
    facePunch: 'Face Punch',
    notesDiary: 'Notes Diary',
    salarySlip: 'Salary Slip',
    settings: 'Settings',
    guide: 'Guide',
    punchInDone: 'Punched In',
    
    toolWork: 'Work (P)',
    toolHalfDuty: 'Half Duty',
    toolOvertime: 'Overtime',
    toolHoliday: 'Holiday',
    toolAbsent: 'Absent (A)',
    toolClear: 'Clear',
    toolNote: 'Note',
    toolsInstruction: 'Select tool below, then tap date to mark attendance',

    hrTitle: 'Factory HR & Staff Attendance',
    workerList: 'Staff List',
    addWorker: 'Add Worker',
    payrollRegister: 'Monthly Payroll',
    companySettings: 'Company Info',
    workerName: 'Worker Full Name',
    phoneNumber: 'Mobile / Phone No',
    roleDesignation: 'Designation / Role',
    monthlyGross: 'Monthly Gross Salary (₹)',
    monthlyBasic: 'Monthly Basic Salary (₹)',
    hraAmount: 'House Rent Allowance / HRA (₹)',
    presentDays: 'Present Days (Duty)',
    otRate: 'Hourly OT Rate (₹/hr)',
    advanceTaken: 'Advance / Loan Taken (₹)',
    pfPercent: 'PF Deduction (%)',
    esiPercent: 'ESI Deduction (%)',
    saveWorker: 'Add Worker to Register',
    facePunchWorker: 'Face Punch (Photo)',
    printSlip: 'Print Salary Slip',
    printFullPayroll: 'Print Full Master Roll',
    netPayout: 'Net Payout',
    totalCompanyPayout: 'Total Company Payout',
    basicHraNote: 'PF & ESI are deducted on Basic Salary. Balance is added as HRA.',
    
    dailyMuster: 'Daily Muster',
    markAllPresent: 'Mark All Present (P)',
    markAllHalfDay: 'Mark All Half Day (HD)',
    markAllAbsent: 'Mark All Absent (A)',
    printDaySheet: 'Print Daily Sheet',
    todayDuty: 'Daily Duty',
    syncPayroll: 'Sync with Payroll',
    
    referFriend: 'Refer to Friend',
    privacyPolicy: 'Privacy Policy',
    howToUse: 'How to Use',
  },
  hi: {
    appName: 'हाजिरी नोटबुक प्रो',
    appSubtitle: 'हाजिरी • सैलरी • डायरी',
    selfMode: '👤 खुद की हाजिरी',
    factoryHrMode: '🏭 फैक्ट्री HR मोड',
    modeLabel: 'मोड:',
    langToggle: 'English',
    
    thisMonth: 'चालू महीना',
    changeYear: 'साल बदलें',
    workDays: 'पूरी ड्यूटी (P)',
    halfDays: 'हाफ ड्यूटी (HD)',
    overtimeHours: 'ओवरटाइम (OT)',
    totalEarnings: 'कुल नेट सैलरी',
    dailyWage: 'रोजाना मजदूरी',
    viewSalaryDetails: 'विस्तार से देखें',
    
    facePunch: 'फेस हाजिरी',
    notesDiary: 'नोट्स डायरी',
    salarySlip: 'सैलरी स्लिप',
    settings: 'सेटिंग्स',
    guide: 'गाइड',
    punchInDone: 'हाजिरी दर्ज',
    
    toolWork: 'हाजिरी (P)',
    toolHalfDuty: 'हाफ ड्यूटी',
    toolOvertime: 'ओवरटाइम',
    toolHoliday: 'छुट्टी (H)',
    toolAbsent: 'गैरहाजिर (A)',
    toolClear: 'हटाएं',
    toolNote: 'नोट',
    toolsInstruction: 'नीचे से टूल चुनें, फिर कैलेंडर में तारीख दबाकर हाजिरी लगाएं',

    hrTitle: 'फैक्ट्री HR व स्टाफ हाजिरी',
    workerList: 'वर्कर लिस्ट',
    addWorker: 'नया वर्कर जोड़ें',
    payrollRegister: 'मासिक सैलरी रजिस्टर',
    companySettings: 'कंपनी जानकारी',
    workerName: 'वर्कर का पूरा नाम',
    phoneNumber: 'मोबाइल नंबर',
    roleDesignation: 'पद / काम (Role)',
    monthlyGross: 'मंथली ग्रॉस सैलरी (₹)',
    monthlyBasic: 'मंथली बेसिक सैलरी (₹)',
    hraAmount: 'मकान किराया भत्ता / HRA (₹)',
    presentDays: 'कुल हाजिरी दिन (Duty Days)',
    otRate: 'ओवरटाइम दर (₹/घंटा)',
    advanceTaken: 'एडवांस / लोन लिया (₹)',
    pfPercent: 'PF कटौती (%)',
    esiPercent: 'ESI कटौती (%)',
    saveWorker: 'वर्कर रजिस्टर में जोड़ें',
    facePunchWorker: 'फेस हाजिरी (फोटो)',
    printSlip: 'सैलरी स्लिप प्रिंट करें',
    printFullPayroll: 'मास्टर पेरोल शीट प्रिंट करें',
    netPayout: 'कुल नेट भुगतान',
    totalCompanyPayout: 'फैक्ट्री का कुल वेतन भुगतान',
    basicHraNote: 'PF और ESI बेसिक सैलरी पर कटेंगे। बाकी बचा हुआ रुपया HRA में जुड़ेगा।',
    
    dailyMuster: 'दैनिक हाजिरी',
    markAllPresent: 'सबकी पूरी हाजिरी लगाएं (P)',
    markAllHalfDay: 'सबको हाफ ड्यूटी दें (HD)',
    markAllAbsent: 'सबको गैरहाजिर करें (A)',
    printDaySheet: 'दैनिक हाजिरी पत्रक प्रिंट करें',
    todayDuty: 'आज की ड्यूटी',
    syncPayroll: 'पेरोल से सिंक करें',
    
    referFriend: 'दोस्तों को शेयर करें',
    privacyPolicy: 'प्राइवेसी पॉलिसी',
    howToUse: 'कैसे चलाएं (गाइड)',
  },
};
