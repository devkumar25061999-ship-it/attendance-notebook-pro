import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export interface FileExportOptions {
  filename: string;
  content: string;
  mimeType: string;
  title?: string;
  dialogTitle?: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  method: 'android_download' | 'browser_download' | 'native_fallback';
}

/**
 * Universal Direct File Download Helper.
 * 
 * 1. In Android APK: Uses Android Native bridge to directly save the file into 
 *    the device's public "Downloads" folder (without opening share apps or WhatsApp).
 * 2. In Web Browsers: Triggers direct instant download via Blob link.
 */
export async function exportAndSaveFile({
  filename,
  content,
  mimeType,
}: FileExportOptions): Promise<ExportResult> {
  // 1. Android Native Direct Download (into device's /Downloads folder)
  if (typeof window !== 'undefined' && (window as any).AndroidNativePrint?.downloadFile) {
    try {
      const ok = (window as any).AndroidNativePrint.downloadFile(filename, content, mimeType);
      if (ok) {
        return {
          success: true,
          message: `Saved to Downloads: ${filename}`,
          method: 'android_download',
        };
      }
    } catch (androidErr) {
      console.warn('AndroidNativePrint.downloadFile failed:', androidErr);
    }
  }

  // 2. Capacitor Filesystem fallback (if on native device without bridge)
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.writeFile({
        path: `Download/${filename}`,
        data: content,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8,
        recursive: true,
      });
      return {
        success: true,
        message: `Saved to Downloads: ${filename}`,
        method: 'android_download',
      };
    } catch (fsErr) {
      // Try Documents directory
      try {
        await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        return {
          success: true,
          message: `Saved to Documents: ${filename}`,
          method: 'android_download',
        };
      } catch (docErr) {
        console.warn('Capacitor Filesystem write error:', docErr);
      }
    }
  }

  // 3. Desktop / Mobile Browser Direct Blob Download
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    return {
      success: true,
      message: `Downloaded: ${filename}`,
      method: 'browser_download',
    };
  } catch (error: any) {
    console.error('File download failed:', error);
    return {
      success: false,
      message: 'Failed to download file.',
      method: 'browser_download',
    };
  }
}

/**
 * Universal Clean Slip Print Helper.
 * 
 * 1. In Android APK: Uses printSlipHtml to render ONLY the isolated A4 salary slip
 *    in an offscreen WebView and hands it to Android PrintManager (Save as PDF or Print).
 *    This ensures that background screens, app bars, or modals NEVER appear in the printout!
 * 2. In Browser: Opens clean printable window or triggers print.
 */
export async function printOrSaveSlip({
  jobName,
  htmlContent,
}: {
  jobName: string;
  htmlContent: string;
}): Promise<{ success: boolean; message: string }> {
  // 1. Android Native Isolated Slip Print (Only the clean slip, no app UI)
  if (typeof window !== 'undefined' && (window as any).AndroidNativePrint?.printSlipHtml) {
    try {
      (window as any).AndroidNativePrint.printSlipHtml(htmlContent, jobName);
      return {
        success: true,
        message: 'Opening Print / PDF dialog...',
      };
    } catch (nativePrintErr) {
      console.warn('AndroidNativePrint.printSlipHtml failed:', nativePrintErr);
    }
  }

  // Fallback to older bridge if printSlipHtml isn't ready yet
  if (typeof window !== 'undefined' && (window as any).AndroidNativePrint?.printDocument) {
    try {
      (window as any).AndroidNativePrint.printDocument(jobName);
      return {
        success: true,
        message: 'Opening Print / PDF dialog...',
      };
    } catch (legacyErr) {
      console.warn('AndroidNativePrint.printDocument failed:', legacyErr);
    }
  }

  // 2. Standard Web Browser: open clean print window
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          console.warn('printWindow.print failed:', e);
        }
      }, 350);
      return {
        success: true,
        message: 'Print preview opened.',
      };
    }
  } catch (winErr) {
    console.warn('Failed to open print window:', winErr);
  }

  // Fallback: window.print()
  try {
    window.print();
    return {
      success: true,
      message: 'Print dialog opened.',
    };
  } catch (e) {
    // If blocked, direct download the HTML slip
    const res = await exportAndSaveFile({
      filename: `${jobName.replace(/\s+/g, '_')}.html`,
      content: htmlContent,
      mimeType: 'text/html;charset=utf-8',
      title: jobName,
    });
    return {
      success: res.success,
      message: res.message,
    };
  }
}
