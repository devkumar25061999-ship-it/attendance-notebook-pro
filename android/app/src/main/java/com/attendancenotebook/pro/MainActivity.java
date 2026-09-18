package com.attendancenotebook.pro;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {
    private WebView printWebView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().addJavascriptInterface(new AndroidNativeInterface(), "AndroidNativePrint");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class AndroidNativeInterface {
        /**
         * Direct Download to Device Downloads folder with instant Share/Open Chooser.
         * Saves directly into phone's Downloads directory and provides open/share action.
         */
        @JavascriptInterface
        public boolean downloadFile(final String filename, final String content, final String mimeType) {
            try {
                final String cleanMime = (mimeType != null && mimeType.contains(";")) 
                    ? mimeType.split(";")[0].trim() 
                    : (mimeType != null && !mimeType.trim().isEmpty() ? mimeType.trim() : "text/plain");

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, cleanMime);
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        OutputStream os = getContentResolver().openOutputStream(uri);
                        if (os != null) {
                            os.write(content.getBytes(StandardCharsets.UTF_8));
                            os.flush();
                            os.close();
                        }
                    }
                } else {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadsDir.exists()) {
                        downloadsDir.mkdirs();
                    }
                    File file = new File(downloadsDir, filename);
                    FileOutputStream fos = new FileOutputStream(file);
                    fos.write(content.getBytes(StandardCharsets.UTF_8));
                    fos.flush();
                    fos.close();

                    MediaScannerConnection.scanFile(MainActivity.this, new String[]{file.getAbsolutePath()}, new String[]{cleanMime}, null);
                }

                // Also save to cache and launch Share / Open Intent Chooser so user can open in Excel, Chrome, or Notes
                try {
                    File cacheFile = new File(getCacheDir(), filename);
                    FileOutputStream fos = new FileOutputStream(cacheFile);
                    fos.write(content.getBytes(StandardCharsets.UTF_8));
                    fos.flush();
                    fos.close();

                    Uri contentUri = androidx.core.content.FileProvider.getUriForFile(
                        MainActivity.this, 
                        getPackageName() + ".fileprovider", 
                        cacheFile
                    );

                    Intent sendIntent = new Intent(Intent.ACTION_SEND);
                    sendIntent.setType(cleanMime);
                    sendIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    
                    Intent chooser = Intent.createChooser(sendIntent, "Save / Open " + filename);
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    MainActivity.this.startActivity(chooser);
                } catch (Exception shareEx) {
                    shareEx.printStackTrace();
                }

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this, "File Saved to Downloads: " + filename, Toast.LENGTH_LONG).show();
                    }
                });
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }

        /**
         * Clean Slip Print:
         * Renders ONLY the A4 Salary Slip HTML in an isolated offscreen WebView
         * and sends it to the Android Print Spooler (Save as PDF or Printer).
         */
        @JavascriptInterface
        public void printSlipHtml(final String htmlContent, final String jobName) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        if (printWebView != null) {
                            printWebView.destroy();
                        }
                        printWebView = new WebView(MainActivity.this);
                        printWebView.getSettings().setJavaScriptEnabled(false);
                        printWebView.setWebViewClient(new WebViewClient() {
                            @Override
                            public void onPageFinished(WebView view, String url) {
                                try {
                                    PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                                    if (printManager != null) {
                                        String title = (jobName != null && !jobName.trim().isEmpty()) ? jobName : "Salary_Slip";
                                        PrintDocumentAdapter printAdapter = view.createPrintDocumentAdapter(title);
                                        PrintAttributes attributes = new PrintAttributes.Builder()
                                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                            .build();
                                        printManager.print(title, printAdapter, attributes);
                                    }
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        });
                        printWebView.loadDataWithBaseURL("file:///android_asset/", htmlContent, "text/html", "UTF-8", null);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }

        @JavascriptInterface
        public void shareText(final String text, final String title) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent sendIntent = new Intent();
                        sendIntent.setAction(Intent.ACTION_SEND);
                        sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                        sendIntent.setType("text/plain");
                        String chooserTitle = (title != null && !title.trim().isEmpty()) ? title : "Share App";
                        Intent shareIntent = Intent.createChooser(sendIntent, chooserTitle);
                        shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        MainActivity.this.startActivity(shareIntent);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }

        @JavascriptInterface
        public void printDocument(final String jobName) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                        if (printManager != null && bridge != null && bridge.getWebView() != null) {
                            String title = (jobName != null && !jobName.trim().isEmpty()) ? jobName : "Attendance_Salary_Slip";
                            PrintDocumentAdapter printAdapter = bridge.getWebView().createPrintDocumentAdapter(title);
                            printManager.print(title, printAdapter, new PrintAttributes.Builder().build());
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    @Override
    public void onDestroy() {
        if (printWebView != null) {
            printWebView.destroy();
            printWebView = null;
        }
        super.onDestroy();
    }
}
