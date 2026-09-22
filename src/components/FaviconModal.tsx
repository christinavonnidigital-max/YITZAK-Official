import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Download, 
  Smartphone, 
  Globe, 
  Search, 
  Info, 
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Palette,
  Layers,
  Mail,
  ShieldCheck,
  CheckCheck,
  FileText,
  Camera,
  RotateCcw
} from 'lucide-react';
import { 
  applyFaviconToDocument, 
  saveCustomFavicon, 
  resetFaviconToDefault, 
  getStoredFavicon, 
  resizeImageToSquare, 
  downloadDataUrl,
  DEFAULT_FAVICON 
} from '../lib/faviconUtils';
import {
  BRAND_COLOR_TOKENS,
  getShieldSvgString,
  getHorizontalLogoSvgString,
  downloadSvgFile,
  downloadFileFromUrl,
  generateEmailSignatureHtml,
  DEFAULT_OFFICIAL_EMBLEM,
  DEFAULT_GOLD_EMBLEM,
  DEFAULT_ACCREDITATION_SEAL,
  getStoredCustomEmblem,
  saveCustomEmblem,
  resetCustomEmblem,
  getStoredCustomSeal,
  saveCustomSeal,
  resetCustomSeal,
  getAccreditationSealSvgString,
  getStoredSealVariant,
  saveSealVariant,
  getStoredMedallionSeal,
  getStoredGoldCrest,
  SealVariant
} from '../lib/brandAssets';
import {
  getStoredTrainingHero,
  saveCustomTrainingHero,
  resetTrainingHero,
  processImageFile,
  DEFAULT_TRAINING_HERO
} from '../lib/mediaAssets';
import { YitzakShieldIcon } from './YitzakLogo';

interface FaviconModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFaviconUpdated?: (newFaviconUrl: string | null) => void;
}

export default function FaviconModal({ isOpen, onClose, onFaviconUpdated }: FaviconModalProps) {
  // Studio navigation tabs
  const [activeTab, setActiveTab] = useState<'logos' | 'favicon' | 'palette' | 'stationery' | 'media'>('logos');

  // Favicon Tab State
  const [currentFavicon, setCurrentFavicon] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; dimensions?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media Tab State
  const [currentHeroImg, setCurrentHeroImg] = useState<string>(() => getStoredTrainingHero());
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string>(() => getStoredTrainingHero());
  const [heroFileDetails, setHeroFileDetails] = useState<{ name: string; size: string; dimensions?: string } | null>(null);
  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const [isHeroProcessing, setIsHeroProcessing] = useState(false);
  const [heroNotification, setHeroNotification] = useState<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Logo Tab State
  const [logoBg, setLogoBg] = useState<'light' | 'dark_green' | 'slate' | 'cream' | 'checker'>('light');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Official Emblem & Accreditation Seal State
  const [currentEmblem, setCurrentEmblem] = useState<string>(() => getStoredCustomEmblem());
  const [currentSeal, setCurrentSeal] = useState<string>(() => getStoredCustomSeal());
  const [sealVariant, setSealVariant] = useState<SealVariant>(() => getStoredSealVariant());
  const [isEmblemDragging, setIsEmblemDragging] = useState(false);
  const [isSealDragging, setIsSealDragging] = useState(false);
  const [assetNotification, setAssetNotification] = useState<string | null>(null);
  const emblemFileInputRef = useRef<HTMLInputElement>(null);
  const sealFileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSealVariant = (variant: SealVariant) => {
    setSealVariant(variant);
    saveSealVariant(variant);
    const activeUrl = variant === 'gold_crest' ? getStoredGoldCrest() : getStoredMedallionSeal();
    setCurrentSeal(activeUrl);
    setAssetNotification(
      variant === 'gold_crest'
        ? '✓ Antique Gold Crest active as Executive Accreditation Seal'
        : '✓ Medallion Seal active as Executive Accreditation Seal'
    );
    setTimeout(() => setAssetNotification(null), 3500);
  };

  const handleEmblemUpload = (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      alert('Please upload a valid image file (PNG, SVG, JPG, or WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        saveCustomEmblem(dataUrl);
        setCurrentEmblem(dataUrl);
        setAssetNotification('✓ Official Emblem successfully updated and published!');
        setTimeout(() => setAssetNotification(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetEmblem = () => {
    resetCustomEmblem();
    setCurrentEmblem(DEFAULT_OFFICIAL_EMBLEM);
    setAssetNotification('Official Emblem restored to default.');
    setTimeout(() => setAssetNotification(null), 3500);
  };

  const handleSealUpload = (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      alert('Please upload a valid image file (PNG, SVG, JPG, or WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        saveCustomSeal(dataUrl, sealVariant);
        setCurrentSeal(dataUrl);
        setAssetNotification(
          sealVariant === 'gold_crest'
            ? '✓ Custom Antique Gold Crest saved as active seal!'
            : '✓ Custom Accreditation Seal saved as active seal!'
        );
        setTimeout(() => setAssetNotification(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetSeal = () => {
    resetCustomSeal();
    setSealVariant('seal');
    setCurrentSeal(DEFAULT_ACCREDITATION_SEAL);
    setAssetNotification('Accreditation Seal restored to default Medallion Seal.');
    setTimeout(() => setAssetNotification(null), 3500);
  };

  // Signature Tab State
  const [sigName, setSigName] = useState('Christina Gumpo');
  const [sigTitle, setSigTitle] = useState('Business Development Manager');
  const [sigPhone, setSigPhone] = useState('');
  const [sigIncludePhone, setSigIncludePhone] = useState(false);
  const [sigEmail, setSigEmail] = useState('cgumpo@yitzak.co.za');
  const [sigWebsite, setSigWebsite] = useState('yitzak.co.za');
  const [sigCopied, setSigCopied] = useState(false);
  const [sigVisualCopied, setSigVisualCopied] = useState(false);
  const signaturePreviewRef = useRef<HTMLDivElement>(null);

  // Load active favicon on mount or when opened
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredFavicon();
      setCurrentFavicon(stored);
      setPreviewUrl(stored || DEFAULT_FAVICON);
      setCurrentEmblem(getStoredCustomEmblem());
      setSealVariant(getStoredSealVariant());
      setCurrentSeal(getStoredCustomSeal());
      setAppliedNotification(false);
      setDownloadSuccess(false);
      setAssetNotification(null);
    }
  }, [isOpen]);

  const handleCopyText = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) {
      alert('Please upload a valid image file (PNG, SVG, ICO, JPG, or WEBP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setFileDetails({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
        });
        setPreviewUrl(result);
        setIsProcessing(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (!previewUrl) return;
    saveCustomFavicon(previewUrl);
    setCurrentFavicon(previewUrl);
    setAppliedNotification(true);
    if (onFaviconUpdated) {
      onFaviconUpdated(previewUrl);
    }
    setTimeout(() => setAppliedNotification(false), 4000);
  };

  const handleReset = () => {
    resetFaviconToDefault();
    setCurrentFavicon(null);
    setPreviewUrl(DEFAULT_FAVICON);
    setFileDetails(null);
    setAppliedNotification(true);
    if (onFaviconUpdated) {
      onFaviconUpdated(null);
    }
    setTimeout(() => setAppliedNotification(false), 4000);
  };

  const handleDownloadPackage = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);
    try {
      const icon512 = await resizeImageToSquare(previewUrl, 512);
      downloadDataUrl(icon512, 'favicon-512x512.png');

      const icon180 = await resizeImageToSquare(previewUrl, 180);
      downloadDataUrl(icon180, 'apple-touch-icon.png');

      const icon32 = await resizeImageToSquare(previewUrl, 32);
      downloadDataUrl(icon32, 'favicon-32x32.png');

      const icon16 = await resizeImageToSquare(previewUrl, 16);
      downloadDataUrl(icon16, 'favicon.ico');

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating favicon downloads:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSignature = () => {
    if (signaturePreviewRef.current) {
      try {
        const range = document.createRange();
        range.selectNodeContents(signaturePreviewRef.current);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (err) {
        console.warn('Auto-select error:', err);
      }
    }
  };

  const handleCopyVisualSignature = async () => {
    const html = generateEmailSignatureHtml({
      name: sigName,
      title: sigTitle,
      phone: sigIncludePhone ? sigPhone : '',
      email: sigEmail,
      website: sigWebsite,
      includePhone: sigIncludePhone && Boolean(sigPhone.trim())
    });

    const plainText = `${sigName}\n${sigTitle.toUpperCase()}\nYitzak Consulting\nEmail: ${sigEmail}\nWeb: https://${sigWebsite}`;

    let success = false;

    // 1. Try modern rich HTML Clipboard API
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      try {
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        });
        await navigator.clipboard.write([item]);
        success = true;
      } catch (e) {
        console.warn('ClipboardItem error, falling back to selection copy:', e);
      }
    }

    // 2. Fallback to range selection + execCommand('copy')
    if (signaturePreviewRef.current) {
      try {
        const range = document.createRange();
        range.selectNodeContents(signaturePreviewRef.current);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          if (!success) {
            document.execCommand('copy');
            success = true;
          }
        }
      } catch (err) {
        console.warn('Selection copy fallback failed:', err);
      }
    }

    setSigVisualCopied(true);
    setTimeout(() => setSigVisualCopied(false), 3500);
  };

  const handleCopySignature = () => {
    const html = generateEmailSignatureHtml({
      name: sigName,
      title: sigTitle,
      phone: sigIncludePhone ? sigPhone : '',
      email: sigEmail,
      website: sigWebsite,
      includePhone: sigIncludePhone && Boolean(sigPhone.trim())
    });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(html);
      setSigCopied(true);
      setTimeout(() => setSigCopied(false), 3000);
    }
  };

  // Media Tab Handlers
  const handleHeroFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    setIsHeroProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      const img = new Image();
      img.onload = () => {
        setHeroFileDetails({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
        });
        setHeroPreviewUrl(dataUrl);
        setIsHeroProcessing(false);
      };
      img.onerror = () => {
        setHeroPreviewUrl(dataUrl);
        setIsHeroProcessing(false);
      };
      img.src = dataUrl;
    } catch (err) {
      console.error('Error processing hero image file:', err);
      setIsHeroProcessing(false);
    }
  };

  const handleHeroDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHeroDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleHeroFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyHero = () => {
    if (!heroPreviewUrl) return;
    const success = saveCustomTrainingHero(heroPreviewUrl);
    if (success) {
      setCurrentHeroImg(heroPreviewUrl);
      setHeroNotification('Training hero image updated and applied across the website!');
      setTimeout(() => setHeroNotification(null), 4000);
    }
  };

  const handleResetHero = () => {
    resetTrainingHero();
    setCurrentHeroImg(DEFAULT_TRAINING_HERO);
    setHeroPreviewUrl(DEFAULT_TRAINING_HERO);
    setHeroFileDetails(null);
    setHeroNotification('Training hero image reset to default institutional artwork.');
    setTimeout(() => setHeroNotification(null), 4000);
  };

  const handleDownloadHero = () => {
    if (!heroPreviewUrl) return;
    downloadFileFromUrl(heroPreviewUrl, 'yitzak-training-hero.png');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Root Overlay: Padded viewport container prevents clipping on small screens */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window: flex-col with max-h-[94vh] ensures header and footer are NEVER cut off */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-border/80 overflow-hidden z-10 flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        >
          {/* 1. Header (Fixed, shrink-0) */}
          <div className="shrink-0 bg-[#023625] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#B68A35] border border-white/10 shadow-2xs">
                <Palette size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-lg text-white">YITZAK Branding &amp; Asset Studio</h2>
                  <span className="bg-[#B68A35] text-white text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wider">
                    Institutional
                  </span>
                </div>
                <p className="text-xs text-white/75 mt-0.5">
                  Official vector logos, browser tab favicons, color tokens &amp; executive stationery
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Branding Studio"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Studio Tabs Navigation Bar (Sideways Scrollable on Mobile) */}
          <div className="relative shrink-0 bg-slate-100/95 border-b border-border">
            <div className="flex items-center px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 touch-pan-x scroll-smooth flex-nowrap py-1">
              <button
                onClick={() => setActiveTab('logos')}
                className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer rounded-t-lg ${
                  activeTab === 'logos'
                    ? 'border-[#B68A35] text-[#023625] bg-white font-extrabold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-[#023625] hover:bg-white/50'
                }`}
              >
                <Layers size={14} className={activeTab === 'logos' ? 'text-[#B68A35]' : ''} />
                <span>Logos &amp; Vectors</span>
              </button>

              <button
                onClick={() => setActiveTab('favicon')}
                className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer rounded-t-lg ${
                  activeTab === 'favicon'
                    ? 'border-[#B68A35] text-[#023625] bg-white font-extrabold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-[#023625] hover:bg-white/50'
                }`}
              >
                <Globe size={14} className={activeTab === 'favicon' ? 'text-[#B68A35]' : ''} />
                <span>Favicon &amp; Tab Icons</span>
              </button>

              <button
                onClick={() => setActiveTab('palette')}
                className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer rounded-t-lg ${
                  activeTab === 'palette'
                    ? 'border-[#B68A35] text-[#023625] bg-white font-extrabold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-[#023625] hover:bg-white/50'
                }`}
              >
                <Palette size={14} className={activeTab === 'palette' ? 'text-[#B68A35]' : ''} />
                <span>Palette &amp; Tokens</span>
              </button>

              <button
                onClick={() => setActiveTab('stationery')}
                className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer rounded-t-lg ${
                  activeTab === 'stationery'
                    ? 'border-[#B68A35] text-[#023625] bg-white font-extrabold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-[#023625] hover:bg-white/50'
                }`}
              >
                <Mail size={14} className={activeTab === 'stationery' ? 'text-[#B68A35]' : ''} />
                <span>Email Signature</span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer rounded-t-lg ${
                  activeTab === 'media'
                    ? 'border-[#B68A35] text-[#023625] bg-white font-extrabold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-[#023625] hover:bg-white/50'
                }`}
              >
                <ImageIcon size={14} className={activeTab === 'media' ? 'text-[#B68A35]' : ''} />
                <span>Training &amp; Hero Photos</span>
              </button>
            </div>
            {/* Subtle right scroll fade indicator on mobile screens */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 to-transparent sm:hidden" />
          </div>

          {/* Notifications */}
          {appliedNotification && (
            <div className="shrink-0 bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Favicon successfully applied! Your browser tab and bookmarks now display your icon.</span>
            </div>
          )}

          {heroNotification && (
            <div className="shrink-0 bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{heroNotification}</span>
            </div>
          )}

          {assetNotification && (
            <div className="shrink-0 bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{assetNotification}</span>
            </div>
          )}

          {downloadSuccess && (
            <div className="shrink-0 bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex items-center gap-2 text-xs text-blue-800 font-medium">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
              <span>Full favicon asset bundle generated! Standard sizes (16px, 32px, 180px, 512px) downloaded.</span>
            </div>
          )}

          {/* 3. Scrollable Body: flex-1 overflow-y-auto min-h-0 */}
          <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-6 text-charcoal">

            {/* TAB 1: LOGOS & VECTOR MARKS */}
            {activeTab === 'logos' && (
              <div className="space-y-6 animate-fade-in">
                {/* Background Preview Control */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Preview Background Canvas:</span>
                    <span className="text-slate-500 text-[11px]">Inspect high-contrast logo behavior across various client media</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x py-0.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setLogoBg('light')}
                      className={`shrink-0 px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        logoBg === 'light' ? 'bg-white text-[#023625] border-[#023625] shadow-xs font-bold' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Light #FFF
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoBg('dark_green')}
                      className={`shrink-0 px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        logoBg === 'dark_green' ? 'bg-[#023625] text-white border-white shadow-xs font-bold' : 'bg-[#023625] text-white/80 border-transparent'
                      }`}
                    >
                      Forest #023625
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoBg('slate')}
                      className={`shrink-0 px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        logoBg === 'slate' ? 'bg-[#111827] text-white border-white shadow-xs font-bold' : 'bg-[#111827] text-white/80 border-transparent'
                      }`}
                    >
                      Midnight #111827
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoBg('cream')}
                      className={`shrink-0 px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        logoBg === 'cream' ? 'bg-[#F6F8F6] text-[#023625] border-[#023625] shadow-xs font-bold' : 'bg-[#F6F8F6] text-slate-700 border-slate-300'
                      }`}
                    >
                      Cream #F6F8F6
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoBg('checker')}
                      className={`shrink-0 px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        logoBg === 'checker' ? 'bg-slate-200 text-slate-900 border-slate-400 font-bold' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Transparent
                    </button>
                  </div>
                </div>

                {/* Grid of Logo Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Card 1: Primary Horizontal Logo */}
                  <div className="border border-border rounded-xl p-5 bg-white shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#B68A35]">Primary Wordmark</span>
                        <span className="text-[10px] font-mono text-slate-400">Header / Publications</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-primary">Horizontal Corporate Logo</h4>
                      <p className="text-xs text-ash mt-0.5">High-resolution institutional logo with gold advisory typography.</p>
                    </div>

                    {/* Logo Canvas Preview */}
                    <div 
                      className={`w-full h-28 rounded-xl border border-border flex items-center justify-center p-4 transition-colors ${
                        logoBg === 'light' ? 'bg-white' :
                        logoBg === 'dark_green' ? 'bg-[#023625]' :
                        logoBg === 'slate' ? 'bg-[#111827]' :
                        logoBg === 'cream' ? 'bg-[#F6F8F6]' :
                        'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50'
                      }`}
                    >
                      <img 
                        src="/YITZAK-logo-green.png" 
                        alt="YITZAK Logo" 
                        className={`max-h-14 object-contain ${
                          logoBg === 'dark_green' || logoBg === 'slate' ? 'brightness-0 invert' : ''
                        }`}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => downloadFileFromUrl('/YITZAK-logo-green.png', 'YITZAK-logo-green.png')}
                        className="py-2 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Download 1000px PNG"
                      >
                        <Download size={13} />
                        <span>PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadSvgFile(getHorizontalLogoSvgString('primary'), 'YITZAK-logo-primary.svg')}
                        className="py-2 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Download Vector SVG"
                      >
                        <Download size={13} />
                        <span>SVG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(getHorizontalLogoSvgString('primary'), 'svg_primary')}
                        className="py-2 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Copy SVG code"
                      >
                        {copiedKey === 'svg_primary' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedKey === 'svg_primary' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Inverted Light Logo */}
                  <div className="border border-border rounded-xl p-5 bg-white shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#B68A35]">Inverted Wordmark</span>
                        <span className="text-[10px] font-mono text-slate-400">Dark Backgrounds</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-primary">Inverted White Logo</h4>
                      <p className="text-xs text-ash mt-0.5">Crisp white emblem and wordmark for presentation decks &amp; footers.</p>
                    </div>

                    {/* Logo Canvas Preview */}
                    <div className="w-full h-28 rounded-xl bg-[#023625] border border-[#034d35] flex items-center justify-center p-4">
                      <img 
                        src="/YITZAK-logo-green.png" 
                        alt="YITZAK Light" 
                        className="max-h-14 object-contain brightness-0 invert"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => downloadFileFromUrl('/YITZAK-logo-green.png', 'YITZAK-logo-inverted.png')}
                        className="py-2 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Download size={13} />
                        <span>PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadSvgFile(getHorizontalLogoSvgString('inverted'), 'YITZAK-logo-inverted.svg')}
                        className="py-2 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Download size={13} />
                        <span>SVG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(getHorizontalLogoSvgString('inverted'), 'svg_inverted')}
                        className="py-2 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedKey === 'svg_inverted' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedKey === 'svg_inverted' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Official Emblem */}
                  <div className="border border-border rounded-xl p-5 bg-white shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#B68A35]">Official Emblem</span>
                        {currentEmblem !== DEFAULT_OFFICIAL_EMBLEM ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Custom Asset</span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">Institutional Mark</span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-primary">Official YITZAK Shield Emblem</h4>
                      <p className="text-xs text-ash mt-0.5">Signature institutional crest for web favicon, mobile apps, and advisory heraldry.</p>
                    </div>

                    {/* Logo Canvas Preview & Interactive Dropzone */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsEmblemDragging(true); }}
                      onDragLeave={() => setIsEmblemDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsEmblemDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleEmblemUpload(f);
                      }}
                      className={`relative group w-full h-32 rounded-xl border transition-all flex items-center justify-center p-4 ${
                        isEmblemDragging ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-border'
                      } ${
                        logoBg === 'light' ? 'bg-white' :
                        logoBg === 'dark_green' ? 'bg-[#023625]' :
                        logoBg === 'slate' ? 'bg-[#111827]' :
                        logoBg === 'cream' ? 'bg-[#F6F8F6]' :
                        'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50'
                      }`}
                    >
                      <img
                        src={currentEmblem}
                        alt="Official YITZAK Emblem"
                        className={`max-h-24 max-w-[90px] object-contain transition-all drop-shadow-xs ${
                          logoBg === 'dark_green' || logoBg === 'slate' ? 'brightness-0 invert' : ''
                        }`}
                      />

                      {/* Quick Change Overlay Button */}
                      <button
                        type="button"
                        onClick={() => emblemFileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 hover:bg-white text-slate-700 hover:text-primary rounded-lg shadow-xs border border-slate-200 text-[11px] font-semibold flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
                        title="Upload new emblem"
                      >
                        <Camera size={12} className="text-[#B68A35]" />
                        <span>Change</span>
                      </button>
                    </div>

                    <input
                      ref={emblemFileInputRef}
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleEmblemUpload(f);
                      }}
                    />

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => emblemFileInputRef.current?.click()}
                          className="py-2 px-1 bg-[#023625] hover:bg-[#034d35] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Upload new official emblem file"
                        >
                          <Upload size={12} className="text-[#B68A35]" />
                          <span>Upload</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadFileFromUrl(currentEmblem, 'YITZAK-official-emblem.png')}
                          className="py-2 px-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Download size={12} />
                          <span>PNG</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadSvgFile(getShieldSvgString('#023625'), 'YITZAK-official-emblem.svg')}
                          className="py-2 px-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Download size={12} />
                          <span>SVG</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(getShieldSvgString('#023625'), 'svg_crest')}
                          className="py-2 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedKey === 'svg_crest' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedKey === 'svg_crest' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {currentEmblem !== DEFAULT_OFFICIAL_EMBLEM && (
                        <button
                          type="button"
                          onClick={handleResetEmblem}
                          className="w-full py-1 text-[11px] text-slate-500 hover:text-red-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={11} />
                          <span>Reset Emblem to Default</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Accreditation Seal */}
                  <div className="border border-border rounded-xl p-5 bg-white shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#B68A35]">Accreditation Seal</span>
                        {currentSeal !== DEFAULT_ACCREDITATION_SEAL ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Custom Seal</span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">High-Res Insignia</span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-primary">Executive Accreditation &amp; Advisory Seal</h4>
                      <p className="text-xs text-ash mt-0.5">Official certified insignia for graduation certificates, compliance badges, and regulatory charters.</p>
                    </div>

                    {/* Seal Style Selector */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-[11px] font-medium">
                      <button
                        type="button"
                        onClick={() => handleSelectSealVariant('seal')}
                        className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center cursor-pointer font-bold flex items-center justify-center gap-1 ${
                          sealVariant === 'seal' ? 'bg-[#023625] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {sealVariant === 'seal' && <Check size={12} className="text-[#B68A35]" />}
                        <span>★ Medallion Seal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSealVariant('gold_crest')}
                        className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center cursor-pointer font-bold flex items-center justify-center gap-1 ${
                          sealVariant === 'gold_crest' ? 'bg-[#023625] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {sealVariant === 'gold_crest' && <Check size={12} className="text-[#B68A35]" />}
                        <span>Antique Gold Crest</span>
                      </button>
                    </div>

                    {/* Seal Canvas Preview & Dropzone */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsSealDragging(true); }}
                      onDragLeave={() => setIsSealDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsSealDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleSealUpload(f);
                      }}
                      className={`relative group w-full h-32 rounded-xl bg-[#023625] border transition-all flex items-center justify-center p-3 overflow-hidden ${
                        isSealDragging ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-[#034d35]'
                      }`}
                    >
                      <img 
                        src={currentSeal} 
                        alt={sealVariant === 'gold_crest' ? 'Antique Gold Crest' : 'Executive Accreditation Seal'} 
                        className={`object-contain drop-shadow-md transition-all ${
                          sealVariant === 'gold_crest' ? 'max-h-24 max-w-[95px]' : 'max-h-28 max-w-[120px]'
                        }`}
                      />

                      {/* Quick Change Overlay Button */}
                      <button
                        type="button"
                        onClick={() => sealFileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 px-2 py-1 bg-[#012117]/80 hover:bg-[#012117] text-white/90 hover:text-white rounded-lg shadow-xs border border-[#B68A35]/40 text-[11px] font-semibold flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
                        title={sealVariant === 'gold_crest' ? 'Upload custom antique gold crest file' : 'Upload custom accreditation seal file'}
                      >
                        <Camera size={12} className="text-[#B68A35]" />
                        <span>Change</span>
                      </button>
                    </div>

                    <input
                      ref={sealFileInputRef}
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSealUpload(f);
                      }}
                    />

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => sealFileInputRef.current?.click()}
                          className="py-2 px-1 bg-[#023625] hover:bg-[#034d35] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Upload new seal file"
                        >
                          <Upload size={12} className="text-[#B68A35]" />
                          <span>Upload</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadFileFromUrl(
                            currentSeal,
                            sealVariant === 'gold_crest' ? 'YITZAK-antique-gold-crest.png' : 'YITZAK-accreditation-seal.png'
                          )}
                          className="py-2 px-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Download size={12} />
                          <span>PNG</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadSvgFile(
                            sealVariant === 'gold_crest' ? getShieldSvgString('#B68A35') : getAccreditationSealSvgString(),
                            sealVariant === 'gold_crest' ? 'YITZAK-antique-gold-crest.svg' : 'YITZAK-accreditation-seal.svg'
                          )}
                          className="py-2 px-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Download size={12} />
                          <span>SVG</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(
                            sealVariant === 'gold_crest' ? getShieldSvgString('#B68A35') : getAccreditationSealSvgString(),
                            'svg_seal'
                          )}
                          className="py-2 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedKey === 'svg_seal' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedKey === 'svg_seal' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {(sealVariant !== 'seal' || currentSeal !== DEFAULT_ACCREDITATION_SEAL) && (
                        <button
                          type="button"
                          onClick={handleResetSeal}
                          className="w-full py-1 text-[11px] text-slate-500 hover:text-red-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={11} />
                          <span>Reset Seal to Default</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Brand Guidelines Notice */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <ShieldCheck size={16} className="text-[#B68A35]" />
                    <span>Logo Clear Space &amp; Usage Rules</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px] leading-relaxed">
                    <li>Maintain a minimum clear space surrounding the logo equal to 0.5× the height of the shield emblem.</li>
                    <li>Do not stretch, distort, or apply gradient drop-shadows to the official YITZAK wordmark.</li>
                    <li>Minimum digital reproduction size: 120px width for horizontal wordmark; 24px width for standalone shield.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE FAVICON STUDIO */}
            {activeTab === 'favicon' && (
              <div className="space-y-6 animate-fade-in">
                {/* Upload Drag & Drop Area */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Upload New Tab Icon (PNG, SVG, ICO, JPG, WEBP)
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#023625] bg-[#023625]/5 scale-[0.99]'
                        : 'border-slate-300 hover:border-[#023625] hover:bg-slate-50/70'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/svg+xml, image/x-icon, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-[#B68A35] flex items-center justify-center shadow-xs">
                        <Upload size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Click to select a favicon image, or drag &amp; drop here
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Recommended: 512 × 512 px square PNG with transparent background
                        </p>
                      </div>
                    </div>
                  </div>

                  {fileDetails && (
                    <div className="mt-2 text-xs text-slate-600 flex items-center justify-between px-1">
                      <span>File: <strong>{fileDetails.name}</strong> ({fileDetails.size})</span>
                      {fileDetails.dimensions && <span>Original: {fileDetails.dimensions}</span>}
                    </div>
                  )}
                </div>

                {/* Live Previews Section */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Globe size={14} className="text-[#023625]" />
                      Live Platform Previews
                    </span>
                    <span className="text-[11px] text-slate-500">Real-time simulation across devices</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Browser Tab Mockup */}
                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs space-y-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                        Browser Tab Preview
                      </span>
                      
                      <div className="bg-slate-100 rounded-t-md p-1.5 flex items-center gap-1.5">
                        <div className="flex gap-1 pl-1">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <div className="bg-white rounded-md px-2 py-1 flex items-center gap-2 text-xs max-w-[200px] border border-slate-200/60 shadow-xs">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Favicon" className="w-4 h-4 object-contain shrink-0 rounded-xs" />
                          ) : (
                            <div className="w-4 h-4 bg-slate-200 rounded-xs animate-pulse" />
                          )}
                          <span className="truncate text-[11px] text-slate-800 font-medium">
                            Yitzak Consulting | Professional...
                          </span>
                        </div>
                      </div>
                      <div className="h-6 bg-slate-50 rounded-b-md px-2 flex items-center text-[10px] font-mono text-slate-500 border border-t-0 border-slate-200">
                        <span className="text-emerald-600 mr-1">🔒</span> https://yitzak.co.za
                      </div>
                    </div>

                    {/* 2. Google Search Result Mockup */}
                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs space-y-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
                        <Search size={10} /> Google Mobile Search Snippet
                      </span>

                      <div className="p-2.5 bg-slate-50/70 rounded-md border border-slate-100 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs">
                            {previewUrl && (
                              <img src={previewUrl} alt="SERP" className="w-4 h-4 object-contain rounded-full" />
                            )}
                          </div>
                          <div className="leading-tight">
                            <div className="text-[11px] font-medium text-slate-800">Yitzak Consulting</div>
                            <div className="text-[10px] text-slate-500">https://yitzak.co.za</div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer pt-0.5">
                          Food Safety Advisory &amp; Quality Management
                        </div>
                      </div>
                    </div>

                    {/* 3. Apple Touch Icon */}
                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs space-y-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
                        <Smartphone size={10} /> Mobile Home Screen (iOS &amp; Android)
                      </span>

                      <div className="flex items-center gap-3 p-2">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center p-2">
                          {previewUrl && (
                            <img src={previewUrl} alt="App Icon" className="w-10 h-10 object-contain rounded-lg" />
                          )}
                        </div>
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-slate-800">YITZAK</div>
                          <div className="text-[10px] text-slate-500">180 × 180 px Apple Touch Icon</div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Multi-Size Grid */}
                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs space-y-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                        Multi-Scale Inspection
                      </span>

                      <div className="flex items-center justify-around py-2">
                        <div className="text-center space-y-1">
                          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
                            {previewUrl && <img src={previewUrl} alt="16" className="w-4 h-4 object-contain" />}
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 block">16px</span>
                        </div>

                        <div className="text-center space-y-1">
                          <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
                            {previewUrl && <img src={previewUrl} alt="32" className="w-8 h-8 object-contain" />}
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 block">32px</span>
                        </div>

                        <div className="text-center space-y-1">
                          <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
                            {previewUrl && <img src={previewUrl} alt="48" className="w-10 h-10 object-contain" />}
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 block">48px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permanent Deployment Note */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-950">
                    <Info size={16} className="text-amber-700 shrink-0" />
                    <span>How Live Website Favicons Work:</span>
                  </div>
                  <p className="leading-relaxed text-amber-900/90 pl-6">
                    Clicking <strong>&ldquo;Apply to Website&rdquo;</strong> immediately binds your favicon to the active browser session and persists it in local storage.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: BRAND PALETTE & DESIGN TOKENS */}
            {activeTab === 'palette' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-primary">Institutional Color Palette</h4>
                    <p className="text-xs text-ash mt-0.5">Click any color swatch to copy its exact HEX or RGB code.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`:root {\n  --color-primary: #023625;\n  --color-secondary: #B68A35;\n  --color-forest-dark: #012117;\n  --color-surface: #F6F8F6;\n  --color-charcoal: #2D3142;\n  --color-border: #E5E9E6;\n}`, 'all_css')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedKey === 'all_css' ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedKey === 'all_css' ? 'Copied CSS Variables!' : 'Copy CSS Variables'}</span>
                  </button>
                </div>

                {/* Color Swatches Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {BRAND_COLOR_TOKENS.map((token) => (
                    <div 
                      key={token.hex}
                      onClick={() => handleCopyText(token.hex, token.hex)}
                      className="border border-border rounded-xl p-4 bg-white shadow-xs hover:border-[#B68A35] transition-all cursor-pointer group space-y-3"
                    >
                      <div 
                        className="w-full h-20 rounded-lg shadow-inner flex items-end p-2.5 transition-transform group-hover:scale-[1.01]" 
                        style={{ backgroundColor: token.hex, border: token.hex === '#F6F8F6' ? '1px solid #E5E9E6' : 'none' }}
                      >
                        <span 
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded backdrop-blur-xs bg-black/25 text-white"
                        >
                          {token.hex}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h6 className="font-serif font-bold text-xs text-primary">{token.name}</h6>
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#B68A35] flex items-center gap-1">
                            {copiedKey === token.hex ? 'Copied!' : 'Click to copy'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{token.role}</p>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1.5">
                          <span>{token.rgb}</span>
                          <span>{token.hsl}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Typography Design Tokens */}
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-serif font-bold text-sm text-primary">Typography Pairing Hierarchy</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#B68A35] font-bold">Display &amp; Headings</span>
                      <h5 className="font-serif text-lg font-bold text-primary">EB Garamond</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Conveys academic authority, institutional longevity, and advisory heritage.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#B68A35] font-bold">Interface &amp; Body</span>
                      <h5 className="font-sans text-lg font-bold text-primary">Plus Jakarta Sans</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Geometric clarity engineered for dense operational tables, portals, and mobile readability.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#B68A35] font-bold">Registry &amp; Metadata</span>
                      <h5 className="font-mono text-base font-bold text-primary">JetBrains Mono</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Technical precision for ISO standard codes, certificate IDs, and verification hashes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CORPORATE STATIONERY & EMAIL SIGNATURE */}
            {activeTab === 'stationery' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Form Controls */}
                  <div className="md:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3.5">
                    <h5 className="font-serif font-bold text-sm text-primary">Signature Configuration</h5>
                    
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={sigName}
                        onChange={(e) => setSigName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Official Designation</label>
                      <input
                        type="text"
                        value={sigTitle}
                        onChange={(e) => setSigTitle(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase text-slate-600">Direct Phone (SAST)</label>
                        {sigPhone.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setSigPhone('');
                              setSigIncludePhone(false);
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700 underline font-medium cursor-pointer"
                          >
                            Remove Tel
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={sigPhone}
                        placeholder="Leave blank to omit Tel from signature"
                        onChange={(e) => {
                          const val = e.target.value;
                          setSigPhone(val);
                          setSigIncludePhone(Boolean(val.trim()));
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {sigPhone.trim() && sigIncludePhone
                          ? '✓ Tel line included in signature'
                          : 'Tel line is removed from signature'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Work Email</label>
                      <input
                        type="email"
                        value={sigEmail}
                        onChange={(e) => setSigEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Domain</label>
                      <input
                        type="text"
                        value={sigWebsite}
                        onChange={(e) => setSigWebsite(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleCopyVisualSignature}
                        className="w-full py-2.5 bg-[#023625] hover:bg-[#034d35] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        {sigVisualCopied ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        <span>{sigVisualCopied ? 'Visual Signature Copied!' : 'Copy Visual Signature (For Outlook / Gmail)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopySignature}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-300"
                        title="Copy raw HTML markup table"
                      >
                        {sigCopied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{sigCopied ? 'HTML Code Copied!' : 'Copy Raw HTML Markup'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Rendered Email Signature Box */}
                  <div className="md:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">Live Client Preview</span>
                        <span className="text-[10px] text-slate-400">Compatible with New Outlook, Classic Outlook &amp; Gmail</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectSignature}
                          className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Click to automatically highlight the entire signature card below"
                        >
                          <Search size={12} />
                          <span>Highlight All</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyVisualSignature}
                          className="px-3 py-1.5 text-[11px] font-bold bg-[#023625] hover:bg-[#034d35] text-white rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          {sigVisualCopied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{sigVisualCopied ? 'Copied!' : 'Copy Visual'}</span>
                        </button>
                      </div>
                    </div>

                    <div 
                      ref={signaturePreviewRef}
                      className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/80 overflow-x-auto select-all cursor-text"
                      title="Click anywhere inside to select or highlight"
                    >
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: generateEmailSignatureHtml({
                            name: sigName,
                            title: sigTitle,
                            phone: sigIncludePhone ? sigPhone : '',
                            email: sigEmail,
                            website: sigWebsite,
                            includePhone: sigIncludePhone && Boolean(sigPhone.trim())
                          })
                        }} 
                      />
                    </div>

                    <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 leading-relaxed space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 size={14} className="text-emerald-700" />
                        <span>How to paste into Outlook (3 easy steps):</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] pl-1">
                        <li>Click the green <strong>&ldquo;Copy Visual&rdquo;</strong> button above (or click <strong>&ldquo;Highlight All&rdquo;</strong> and press <strong>Ctrl+C</strong>).</li>
                        <li>Switch to your Outlook <strong>Edit signature</strong> window and click in the white text box.</li>
                        <li>Press <strong>Ctrl+V</strong> (or right-click &gt; <strong>Paste</strong>) and click <strong>Save</strong>.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MEDIA & HERO ASSETS */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <ImageIcon size={16} className="text-[#B68A35]" />
                      <span>Training Hero Photograph &amp; Workshop Visuals</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customize or replace the hero imagery displayed in the Food Safety &amp; Training Academy section.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetHero}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-700 bg-white border border-slate-200 hover:border-red-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw size={12} />
                      <span>Reset to Default</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadHero}
                      className="px-3 py-1.5 text-xs text-slate-700 hover:text-[#023625] bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs font-medium"
                    >
                      <Download size={12} />
                      <span>Download Image</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Upload Dropzone & File Metadata */}
                  <div className="md:col-span-5 space-y-4">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsHeroDragging(true);
                      }}
                      onDragLeave={() => setIsHeroDragging(false)}
                      onDrop={handleHeroDrop}
                      onClick={() => heroFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                        isHeroDragging
                          ? 'border-[#B68A35] bg-amber-50/50 scale-[1.01]'
                          : 'border-slate-300 hover:border-[#023625] hover:bg-slate-50/70 bg-white'
                      }`}
                    >
                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleHeroFile(e.target.files[0]);
                          }
                        }}
                      />

                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[#023625] border border-slate-200 shadow-2xs">
                        {isHeroProcessing ? (
                          <RefreshCw size={24} className="animate-spin text-[#B68A35]" />
                        ) : (
                          <Upload size={24} className="text-[#023625]" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {isHeroProcessing ? 'Optimizing Image...' : 'Click or Drag & Drop Training Picture'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          PNG, JPG, WEBP, or SVG (e.g. Codex Training Workshop)
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#023625] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200">
                        <Camera size={13} className="text-[#B68A35]" />
                        <span>Select From Computer</span>
                      </span>
                    </div>

                    {heroFileDetails && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="font-bold text-slate-700 flex items-center justify-between">
                          <span className="truncate max-w-[200px]">{heroFileDetails.name}</span>
                          <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            Ready
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-4">
                          <span>Size: {heroFileDetails.size}</span>
                          {heroFileDetails.dimensions && <span>Dimensions: {heroFileDetails.dimensions}</span>}
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/70 text-xs text-amber-900 space-y-2">
                      <div className="font-bold flex items-center gap-1.5">
                        <Info size={14} className="text-amber-700 shrink-0" />
                        <span>Instant Live Replacement</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Applying updates replaces the training room hero visual across all devices instantly with no cache delay.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Live Contextual Card Preview */}
                  <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Live Page Placement Preview</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Training Section • Aspect 4:3</span>
                    </div>

                    <div className="bg-slate-900/5 p-4 rounded-xl border border-slate-200/80">
                      <div className="rounded-xl overflow-hidden shadow-md border border-slate-300 bg-white aspect-[4/3] relative group">
                        <img
                          src={heroPreviewUrl}
                          alt="Training Hero Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-white/90 hover:bg-white text-slate-900 text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Upload size={13} />
                            <span>Change Photo</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                        <span className="font-medium truncate max-w-[280px]">
                          &ldquo;Training that builds real competence&rdquo; Section
                        </span>
                        <span className="bg-[#023625] text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                          Target Location
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleApplyHero}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#023625] hover:bg-[#034d35] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <Sparkles size={14} className="text-[#B68A35]" />
                        <span>Apply Training Photo to Website</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Footer Actions (Fixed, shrink-0 - ALWAYS VISIBLE, NEVER CUT OFF) */}
          <div className="shrink-0 bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              {activeTab === 'favicon' && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-2 rounded-md hover:bg-red-50"
                >
                  <RefreshCw size={13} />
                  <span>Reset Default Favicon</span>
                </button>
              )}
              {activeTab === 'media' && (
                <button
                  type="button"
                  onClick={handleResetHero}
                  className="text-xs text-slate-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-2 rounded-md hover:bg-red-50"
                >
                  <RefreshCw size={13} />
                  <span>Reset Default Training Photo</span>
                </button>
              )}
              {activeTab === 'logos' && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#B68A35]" />
                  <span>All vector assets are pre-scaled for high-DPI displays</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
              {activeTab === 'favicon' ? (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadPackage}
                    disabled={!previewUrl || isProcessing}
                    className="flex-1 sm:flex-none text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg px-3.5 py-2 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Download size={14} />
                    <span>Download Favicon Pack</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={!previewUrl || isProcessing}
                    className="flex-1 sm:flex-none text-xs font-bold text-white bg-[#023625] hover:bg-[#034d35] rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={14} className="text-[#B68A35]" />
                    <span>Apply to Website</span>
                  </button>
                </>
              ) : activeTab === 'media' ? (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadHero}
                    className="flex-1 sm:flex-none text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg px-3.5 py-2 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyHero}
                    disabled={!heroPreviewUrl || isHeroProcessing}
                    className="flex-1 sm:flex-none text-xs font-bold text-white bg-[#023625] hover:bg-[#034d35] rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={14} className="text-[#B68A35]" />
                    <span>Apply Training Photo</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold text-white bg-[#023625] hover:bg-[#034d35] rounded-lg px-5 py-2 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ml-auto"
                >
                  <span>Done &amp; Close Studio</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
