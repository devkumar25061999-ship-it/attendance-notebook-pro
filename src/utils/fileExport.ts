import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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
  method: 'native_share' | 'web_share' | 'browser_download';
}

/**
 * Universal file export & download helper.
 * Works seamlessly in:
 * 1. Android APK (Capacitor WebView) via Native Filesystem + Android Share/Save sheet
 * 2. Mobile web browsers via Web Share API
 * 3. Desktop/laptop browsers via standard Blob download
 */
export async function exportAndSaveFile({
  filename,
  content,
  mimeType,
  title,
  dialogTitle,
}: FileExportOptions): Promise<ExportResult> {
  const fileTitle = title || filename;
  const sheetTitle = dialogTitle || `Save or Share ${filename}`;

  // 1. Android / iOS Native App (Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      // Write file into device cache directory (always permitted on all Android versions)
      const fileResult = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      // Open Android system Share / Save intent sheet
      // Allows user to "Save to device", "Open in Excel / Sheets", "Send to WhatsApp", etc.
      await Share.share({
        title: fileTitle,
        text: fileTitle,
        url: fileResult.uri,
        dialogTitle: sheetTitle,
      });

      return {
        success: true,
        message: 'File ready! Select "Save to device" or choose an app like Excel / WhatsApp.',
        method: 'native_share',
      };
    } catch (nativeError: any) {
      console.warn('Native export error, falling back:', nativeError);
      // If user cancelled the share dialog, consider it completed
      if (nativeError?.message?.includes('cancelled') || nativeError?.message?.includes('canceled')) {
        return {
          success: true,
          message: 'Share cancelled.',
          method: 'native_share',
        };
      }
    }
  }

  // 2. Mobile Browser Web Share API fallback (if supported)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([content], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileTitle,
          text: fileTitle,
        });
        return {
          success: true,
          message: 'File shared successfully!',
          method: 'web_share',
        };
      }
    } catch (shareError: any) {
      if (shareError?.name !== 'AbortError') {
        console.warn('Web share failed, trying browser download:', shareError);
      } else {
        return {
          success: true,
          message: 'Share cancelled.',
          method: 'web_share',
        };
      }
    }
  }

  // 3. Desktop / Standard Browser Blob Download
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
 * Universal Print Helper.
 * In Android APK: invokes native Android PrintManager via JavascriptInterface.
 * In Browser: invokes window.print() or opens printable view.
 */
export async function printOrSaveSlip({
  jobName,
  htmlContent,
}: {
  jobName: string;
  htmlContent: string;
}): Promise<{ success: boolean; message: string }> {
  // 1. Android Native Print Bridge in APK
  if (typeof window !== 'undefined' && (window as any).AndroidNativePrint?.printDocument) {
    try {
      (window as any).AndroidNativePrint.printDocument(jobName);
      return {
        success: true,
        message: 'Opening Android Print / PDF Dialog...',
      };
    } catch (nativePrintErr) {
      console.warn('AndroidNativePrint failed:', nativePrintErr);
    }
  }

  // 2. If in native app without print bridge: export HTML slip via Share Sheet
  if (Capacitor.isNativePlatform()) {
    const res = await exportAndSaveFile({
      filename: `${jobName.replace(/\s+/g, '_')}.html`,
      content: htmlContent,
      mimeType: 'text/html;charset=utf-8',
      title: jobName,
      dialogTitle: 'Print or Save Salary Slip as PDF',
    });
    return {
      success: res.success,
      message: 'Choose Chrome / Drive Viewer to Print, or Save as PDF.',
    };
  }

  // 3. Standard Web Browser: window.print()
  try {
    window.print();
    return {
      success: true,
      message: 'Print dialog opened.',
    };
  } catch (e) {
    // If window.print is blocked (e.g. iframe)
    const res = await exportAndSaveFile({
      filename: `${jobName.replace(/\s+/g, '_')}.html`,
      content: htmlContent,
      mimeType: 'text/html;charset=utf-8',
      title: jobName,
    });
    return {
      success: res.success,
      message: 'Print slip file generated. Open to print.',
    };
  }
}
