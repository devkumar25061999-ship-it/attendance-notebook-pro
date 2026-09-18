package com.attendancenotebook.pro;

import android.content.Context;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().addJavascriptInterface(new Object() {
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
                }, "AndroidNativePrint");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
