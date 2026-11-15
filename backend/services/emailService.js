const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const generateTransferEmail = (data) => {
  const {
    senderName, senderAccount, recipientName, recipientAccount, recipientBank,
    amountUSD, amountConverted, currencyCode, currencyFlag, exchangeRate,
    transactionId, date, narration, status = 'Completed', isSimulated = false
  } = data;

  const maskedSender = senderAccount ? '****' + senderAccount.slice(-4) : '****';
  const maskedRecipient = recipientAccount ? '****' + recipientAccount.slice(-4) : '****';

  const statusLower = status.toLowerCase();
  const isPending = statusLower === 'pending';
  const isProcessing = statusLower === 'processing';
  const isCompleted = statusLower === 'completed';

  // Status colors
  const statusColor = isPending ? '#f59e0b' : isProcessing ? '#3b82f6' : '#10b981';
  const statusBg = isPending ? 'rgba(245,158,11,0.15)' : isProcessing ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Transaction Alert — Credixa Banking</title>
<style>
  /* Client-specific resets */
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  
  /* Reset */
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
  
  /* Responsive */
  @media screen and (max-width: 600px) {
    .wrapper { width: 100% !important; }
    .mobile-padding { padding: 20px 16px !important; }
    .mobile-hide { display: none !important; }
    .mobile-stack { display: block !important; width: 100% !important; }
    .mobile-center { text-align: center !important; }
    .amount-text { font-size: 32px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#050508; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased;">

<!-- Wrapper -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#050508;">
  <tr>
    <td align="center" style="padding:20px 10px;">
      
      <!-- Main Container -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" class="wrapper" style="max-width:560px; width:100%; background-color:#0a0a0f; border-radius:16px; overflow:hidden; border:1px solid #1e1e2e;">
        
        <!-- Security Ribbon -->
        <tr>
          <td style="background:linear-gradient(90deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%); padding:12px 24px; text-align:center; border-bottom:1px solid rgba(124,58,237,0.3);">
            <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#a5b4fc;">
              <span style="color:#34d399;">&#9679;</span>&nbsp;&nbsp;SECURE TRANSACTION ALERT&nbsp;&nbsp;<span style="color:#34d399;">&#9679;</span>
            </p>
          </td>
        </tr>
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(180deg,#1e1b4b 0%,#0f0f1a 100%); padding:40px 24px 32px; text-align:center; border-bottom:1px solid rgba(124,58,237,0.2);">
            <p style="margin:0 0 24px; font-size:11px; font-weight:800; letter-spacing:5px; color:#818cf8; text-transform:uppercase;">CREDIXA BANKING</p>
            
            <!-- Success Circle -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td style="width:72px; height:72px; background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%); border-radius:50%; text-align:center; vertical-align:middle; border:2px solid rgba(168,85,247,0.4);">
                  <span style="font-size:32px; color:#ffffff;">&#10003;</span>
                </td>
              </tr>
            </table>
            
            <h1 style="margin:0 0 10px; font-size:28px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">${isSimulated ? 'External transfer recorded' : 'Money Received!'}</h1>
            <p style="margin:0; font-size:15px; color:#94a3b8;">${isSimulated ? 'The sender’s Credixa balance was debited. No external bank was contacted and no funds were delivered.' : `You received money from <strong style="color:#c4b5fd;">${senderName}</strong>`}</p>
          </td>
        </tr>
        
        <!-- Content -->
        <tr>
          <td class="mobile-padding" style="padding:32px 24px;">
            
            <!-- Amount Card -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#1e1b4b 0%,#2d2b55 50%,#1e1b4b 100%); border:1px solid rgba(124,58,237,0.35); border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:32px 20px; text-align:center;">
                  <p style="margin:0 0 12px; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#a5b4fc;">${isSimulated ? 'TRANSFER AMOUNT' : 'AMOUNT RECEIVED'}</p>
                  <p class="amount-text" style="margin:0; font-size:44px; font-weight:900; color:#ffffff; letter-spacing:-1.5px;">$${amountUSD}</p>
                  <p style="margin:12px 0 0; font-size:18px; font-weight:600; color:#c4b5fd;">${amountConverted} ${currencyFlag}</p>
                  
                  <!-- Rate Pill -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:12px auto 0;">
                    <tr>
                      <td style="background:rgba(124,58,237,0.2); border:1px solid rgba(124,58,237,0.3); border-radius:24px; padding:6px 16px;">
                        <p style="margin:0; font-size:12px; font-weight:600; color:#818cf8; letter-spacing:0.5px;">1 USD = ${exchangeRate} ${currencyCode}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Status Pill -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:20px auto 0;">
                    <tr>
                      <td style="background:${statusBg}; border:1px solid ${statusColor}4D; border-radius:24px; padding:8px 20px;">
                        <p style="margin:0; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:${statusColor};">
                          <span style="display:inline-block; width:8px; height:8px; background:${statusColor}; border-radius:50%; margin-right:8px; vertical-align:middle;">&nbsp;</span>${status}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!-- Reference Box -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(15,15,22,0.8); border:1px dashed #2e2e3e; border-radius:12px; margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px; text-align:center;">
                  <p style="margin:0 0 6px; font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#475569;">TRANSACTION REFERENCE</p>
                  <p style="margin:0; font-size:12px; color:#64748b; font-family:'Courier New',monospace; letter-spacing:2px;">${transactionId}</p>
                </td>
              </tr>
            </table>
            
            <!-- Status Timeline -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,rgba(30,27,75,0.5) 0%,rgba(15,15,22,0.8) 100%); border:1px solid rgba(124,58,237,0.25); border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:24px 20px;">
                  <p style="margin:0 0 20px; font-size:13px; font-weight:700; color:#a5b4fc; text-transform:uppercase; letter-spacing:2px; text-align:center;">TRANSACTION STATUS</p>
                  
                  <!-- Timeline Track -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        
                        <!-- Step 1: Pending -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="left" class="mobile-stack" style="width:33.33%;">
                          <tr>
                            <td align="center" style="padding:0 4px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width:44px; height:44px; background:linear-gradient(135deg,#059669 0%,#10b981 100%); border-radius:50%; text-align:center; vertical-align:middle; border:2px solid #10b981;">
                                    <span style="font-size:18px; font-weight:800; color:#0f0f16;">&#10003;</span>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:10px 0 2px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#10b981;">PENDING</p>
                              <p style="margin:0; font-size:10px; color:#475569;">Received</p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Connector -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="left" class="mobile-hide" style="width:33.33%;">
                          <tr>
                            <td style="padding-top:22px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td style="height:3px; background:linear-gradient(90deg,${isCompleted || isProcessing ? '#10b981' : '#1e1e2e'} 0%,${isCompleted ? '#10b981' : isProcessing ? '#3b82f6' : '#1e1e2e'} 100%); border-radius:2px;">&nbsp;</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Step 2: Processing -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="left" class="mobile-stack" style="width:33.33%;">
                          <tr>
                            <td align="center" style="padding:0 4px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width:44px; height:44px; background:${isCompleted ? 'linear-gradient(135deg,#059669 0%,#10b981 100%)' : isProcessing ? 'linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)' : '#0f0f16'}; border-radius:50%; text-align:center; vertical-align:middle; border:2px solid ${isCompleted ? '#10b981' : isProcessing ? '#3b82f6' : '#2e2e3e'};">
                                    <span style="font-size:18px; font-weight:800; color:${isCompleted || isProcessing ? '#0f0f16' : '#475569'};">${isCompleted ? '&#10003;' : isProcessing ? '&#9679;' : '2'}</span>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:10px 0 2px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${isCompleted ? '#10b981' : isProcessing ? '#3b82f6' : '#475569'};">PROCESSING</p>
                              <p style="margin:0; font-size:10px; color:#475569;">${isProcessing ? 'In Progress' : isCompleted ? 'Done' : 'Waiting'}</p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Connector -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="left" class="mobile-hide" style="width:33.33%;">
                          <tr>
                            <td style="padding-top:22px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td style="height:3px; background:linear-gradient(90deg,${isCompleted ? '#10b981' : '#1e1e2e'} 0%,${isCompleted ? '#10b981' : '#1e1e2e'} 100%); border-radius:2px;">&nbsp;</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Step 3: Successful -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="left" class="mobile-stack" style="width:33.33%;">
                          <tr>
                            <td align="center" style="padding:0 4px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width:44px; height:44px; background:${isCompleted ? 'linear-gradient(135deg,#059669 0%,#10b981 100%)' : '#0f0f16'}; border-radius:50%; text-align:center; vertical-align:middle; border:2px solid ${isCompleted ? '#10b981' : '#f59e0b'};">
                                    <span style="font-size:18px; font-weight:800; color:${isCompleted ? '#0f0f16' : '#f59e0b'};">${isCompleted ? '&#10003;' : '3'}</span>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:10px 0 2px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${isCompleted ? '#10b981' : '#f59e0b'};">SUCCESSFUL</p>
                              <p style="margin:0; font-size:10px; color:#475569;">${isCompleted ? 'Completed' : 'Pending'}</p>
                            </td>
                          </tr>
                        </table>
                        
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table>
            
            <!-- Details Card -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f0f16; border:1px solid #1e1e2e; border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:8px 20px;">
                  
                  ${[
                    { label: 'From', value: senderName, color: '#c4b5fd', bold: true },
                    { label: 'From Account', value: maskedSender, mono: true },
                    { label: 'To Your Account', value: maskedRecipient, mono: true },
                    { label: 'Bank', value: recipientBank },
                    { label: 'Account Name', value: recipientName },
                    { label: 'Currency', value: `${currencyFlag} ${currencyCode}` },
                    { label: 'Date & Time', value: date },
                    { label: 'Status', value: `${isPending ? '&#9200;' : isProcessing ? '&#9889;' : '&#10003;'} ${status}`, color: statusColor, bold: true }
                  ].map((row, i, arr) => `
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="${i < arr.length - 1 ? 'border-bottom:1px solid #1e1e2e;' : ''}">
                    <tr>
                      <td style="padding:14px 0;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="font-size:13px; color:#64748b; font-weight:500;">${row.label}</td>
                            <td align="right" style="font-size:14px; color:${row.color || '#e2e8f0'}; font-weight:${row.bold ? '700' : '600'}; ${row.mono ? 'font-family:\'Courier New\',monospace; letter-spacing:1px; font-size:13px;' : ''}">${row.value}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  `).join('')}
                  
                </td>
              </tr>
            </table>
            ${narration ? `
            <!-- Narration -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(90deg,rgba(124,58,237,0.08) 0%,rgba(124,58,237,0.03) 100%); border-left:3px solid #7c3aed; border-radius:0 12px 12px 0; margin-bottom:24px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0; font-size:14px; color:#cbd5e1; line-height:1.7; font-style:italic;"><strong style="color:#a78bfa; font-style:normal;">Sender's Note:</strong> "${narration}"</p>
                </td>
              </tr>
            </table>
            ` : ''}
            
            <!-- International Exchange Fee Notice -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,rgba(245,158,11,0.1) 0%,rgba(180,83,9,0.05) 100%); border:1px solid rgba(245,158,11,0.3); border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:0;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="4" style="background:linear-gradient(180deg,#fbbf24 0%,#f59e0b 100%); border-radius:16px 0 0 16px;">&nbsp;</td>
                      <td style="padding:20px;">
                        <p style="margin:0 0 12px; font-size:13px; font-weight:800; color:#fbbf24; text-transform:uppercase; letter-spacing:2px;">
                          <span style="font-size:16px; margin-right:6px;">&#128176;</span>INTERNATIONAL EXCHANGE FEE REQUIRED
                        </p>
                        <p style="margin:0 0 10px; font-size:13px; color:#d1d5db; line-height:1.8;"><strong style="color:#fbbf24;">Important Notice:</strong> An international exchange fee is always attached to international transfers as part of our banking policy. This fee is required to be paid before you can receive the money into your account.</p>
                        <p style="margin:0 0 10px; font-size:13px; color:#d1d5db; line-height:1.8;">The exchange fee covers currency conversion processing, correspondent bank charges, and cross-border regulatory compliance. Without this fee settlement, your funds will remain in processing status and cannot be credited to your account.</p>
                        <p style="margin:0 0 12px; font-size:13px; color:#d1d5db; line-height:1.8;"><strong style="color:#fbbf24;">Action Required:</strong> Kindly contact our support team for further information and assistance regarding the fee payment process. Our representatives will guide you through the necessary steps to complete your transaction.</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.2); border-radius:20px; padding:6px 14px;">
                              <p style="margin:0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#fbbf24;">
                                <span style="margin-right:4px;">&#128274;</span>Credixa Banking Policy
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!-- Processing Info -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,rgba(30,27,75,0.5) 0%,rgba(15,15,22,0.8) 100%); border:1px solid rgba(124,58,237,0.25); border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:20px;">
                  <p style="margin:0 0 14px; font-size:13px; font-weight:700; color:#a5b4fc; text-transform:uppercase; letter-spacing:2px;">
                    <span style="display:inline-block; width:28px; height:28px; background:rgba(124,58,237,0.2); border-radius:8px; text-align:center; line-height:28px; margin-right:8px; vertical-align:middle; font-size:14px;">&#128336;</span>PROCESSING INFORMATION
                  </p>
                  <p style="margin:0 0 10px; font-size:13px; color:#94a3b8; line-height:1.7;"><strong style="color:#c4b5fd;">International Payments:</strong> Please note that international wire transfers and cross-border payments may take <strong style="color:#c4b5fd;">1–3 business days</strong> to fully reflect in your available balance, depending on the correspondent bank network and currency conversion processing.</p>
                  <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.7;"><strong style="color:#c4b5fd;">Local Transfers:</strong> Domestic transfers within the same banking network are typically processed instantly and should appear in your balance immediately.</p>
                </td>
              </tr>
            </table>
            
            <!-- Support Box -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,rgba(30,27,75,0.6) 0%,rgba(15,15,22,0.9) 100%); border:1px solid rgba(124,58,237,0.3); border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:24px; text-align:center;">
                  <p style="margin:0 0 10px; font-size:14px; font-weight:700; color:#c4b5fd; letter-spacing:1px;">Need Assistance?</p>
                  <p style="margin:0 0 16px; font-size:13px; color:#94a3b8; line-height:1.7;">If this transfer does not appear in your account balance, if you have questions about the international exchange fee, or if you need any help regarding this transaction, our support team is available to assist you promptly.</p>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%); border-radius:24px; padding:12px 28px; border:1px solid rgba(168,85,247,0.4);">
                        <a href="mailto:credixasupport@gmail.com?subject=Transaction%20Inquiry%20-%20${transactionId}" style="color:#ffffff; text-decoration:none; font-size:13px; font-weight:700; letter-spacing:0.5px; display:inline-block;">
                          <span style="margin-right:6px;">&#128172;</span>Contact Support
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:14px 0 0; font-size:11px; color:#475569;">Please include your <strong style="color:#94a3b8;">Transaction Reference</strong> in your inquiry for faster resolution.</p>
                </td>
              </tr>
            </table>
            
            <!-- Security Notice -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f0f16; border:1px solid #1e1e2e; border-radius:14px; margin-bottom:0;">
              <tr>
                <td style="padding:18px 20px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:36px; height:36px; background:rgba(124,58,237,0.15); border-radius:10px; text-align:center; vertical-align:middle;" valign="top">
                        <span style="font-size:16px;">&#128274;</span>
                      </td>
                      <td style="padding-left:14px;">
                        <p style="margin:0; font-size:12px; color:#64748b; line-height:1.7;"><strong style="color:#94a3b8;">Security Notice:</strong> This transaction was securely processed and verified by Credixa Banking's encryption systems. If you did not authorize or expect this transfer, please contact our support team immediately to secure your account. Never share your PIN, password, or OTP with anyone — Credixa Banking will never ask for these details via email or phone.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="text-align:center; padding:32px 24px 24px; border-top:1px solid #1e1e2e; background:linear-gradient(180deg,#0c0c14 0%,#050508 100%);">
            <p style="margin:0 0 4px; font-size:16px; font-weight:900; color:#818cf8; letter-spacing:4px; text-transform:uppercase;">CREDIXA BANKING</p>
            <p style="margin:0 0 20px; font-size:12px; color:#475569; font-weight:500; letter-spacing:1px;">Secure. Fast. Reliable.</p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
              <tr>
                <td style="width:40px; height:2px; background:linear-gradient(90deg,transparent,#7c3aed,transparent); border-radius:2px;">&nbsp;</td>
              </tr>
            </table>
            <p style="margin:4px 0; font-size:11px; color:#334155; line-height:1.6;">This is an automated security alert from Credixa Banking.</p>
            <p style="margin:4px 0; font-size:11px; color:#334155; line-height:1.6;">Please do not reply to this email. For assistance, contact our support team.</p>
            <p style="margin:12px 0 4px; font-size:11px; color:#334155;">&copy; 2026 Credixa Banking. All rights reserved.</p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top:16px; padding-top:16px; border-top:1px solid #1e1e2e;">
              <tr>
                <td style="padding:0 12px;"><a href="mailto:credixasupport@gmail.com" style="color:#818cf8; text-decoration:none; font-size:12px; font-weight:600;">Support</a></td>
                <td style="color:#1e1e2e; font-size:12px;">|</td>
                <td style="padding:0 12px;"><a href="#" style="color:#818cf8; text-decoration:none; font-size:12px; font-weight:600;">Privacy Policy</a></td>
                <td style="color:#1e1e2e; font-size:12px;">|</td>
                <td style="padding:0 12px;"><a href="#" style="color:#818cf8; text-decoration:none; font-size:12px; font-weight:600;">Terms of Service</a></td>
              </tr>
            </table>
          </td>
        </tr>
        
      </table>
      
    </td>
  </tr>
</table>

</body>
</html>`;
};

const generateOTPEmail = (data) => {
  const { userName, otpCode, otpType, expiryMinutes } = data;
  const typeLabel = otpType === 'password' ? 'Password Reset' : 'PIN Reset';
  const typeDesc = otpType === 'password' ? 'reset your account password' : 'reset your transaction PIN';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Security Alert — Credixa Banking</title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
  @media screen and (max-width: 600px) {
    .wrapper { width: 100% !important; }
    .mobile-padding { padding: 20px 16px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#050508; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased;">

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#050508;">
  <tr>
    <td align="center" style="padding:20px 10px;">
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" class="wrapper" style="max-width:560px; width:100%; background-color:#0a0a0f; border-radius:16px; overflow:hidden; border:1px solid #1e1e2e;">
        
        <!-- Security Ribbon -->
        <tr>
          <td style="background:linear-gradient(90deg,#451a03 0%,#78350f 50%,#451a03 100%); padding:12px 24px; text-align:center; border-bottom:1px solid rgba(245,158,11,0.3);">
            <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#fbbf24;">
              <span style="color:#f59e0b;">&#9679;</span>&nbsp;&nbsp;SECURITY VERIFICATION REQUIRED&nbsp;&nbsp;<span style="color:#f59e0b;">&#9679;</span>
            </p>
          </td>
        </tr>
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(180deg,#1e1b4b 0%,#0f0f1a 100%); padding:40px 24px 32px; text-align:center; border-bottom:1px solid rgba(245,158,11,0.2);">
            <p style="margin:0 0 24px; font-size:11px; font-weight:800; letter-spacing:5px; color:#818cf8; text-transform:uppercase;">CREDIXA BANKING</p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td style="width:72px; height:72px; background:linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%); border-radius:50%; text-align:center; vertical-align:middle; border:2px solid rgba(251,191,36,0.4);">
                  <span style="font-size:28px;">&#128274;</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 10px; font-size:26px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">${typeLabel}</h1>
            <p style="margin:0; font-size:15px; color:#94a3b8;">Hi <strong style="color:#fbbf24;">${userName}</strong>, use the code below to ${typeDesc}</p>
          </td>
        </tr>
                <!-- Content -->
        <tr>
          <td class="mobile-padding" style="padding:32px 24px;">
            
            <!-- OTP Box -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#1e1b4b 0%,#2d2b55 100%); border:1px solid rgba(245,158,11,0.35); border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:36px 20px; text-align:center;">
                  <p style="margin:0 0 14px; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#fbbf24;">YOUR VERIFICATION CODE</p>
                  <p style="margin:16px 0; font-size:48px; font-weight:900; color:#fbbf24; letter-spacing:12px; font-family:'Courier New',monospace; text-shadow:0 0 30px rgba(245,158,11,0.4);">${otpCode}</p>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:12px auto 0;">
                    <tr>
                      <td style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); border-radius:20px; padding:6px 16px;">
                        <p style="margin:0; font-size:13px; font-weight:600; color:#f59e0b;">&#9200; Expires in ${expiryMinutes} minutes</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!-- Details -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f0f16; border:1px solid #1e1e2e; border-radius:16px; margin-bottom:24px;">
              <tr>
                <td style="padding:8px 20px;">
                  
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:1px solid #1e1e2e;">
                    <tr><td style="padding:14px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px; color:#64748b; font-weight:500;">Request Type</td><td align="right" style="font-size:14px; color:#e2e8f0; font-weight:600;">${typeLabel}</td></tr></table></td></tr>
                  </table>
                  
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:1px solid #1e1e2e;">
                    <tr><td style="padding:14px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px; color:#64748b; font-weight:500;">Requested At</td><td align="right" style="font-size:14px; color:#e2e8f0; font-weight:600;">${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr></table></td></tr>
                  </table>
                  
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><td style="padding:14px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size:13px; color:#64748b; font-weight:500;">Status</td><td align="right" style="font-size:14px; color:#fbbf24; font-weight:700;">&#9888; Pending Verification</td></tr></table></td></tr>
                  </table>
                  
                </td>
              </tr>
            </table>
            
            <!-- Warning -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:14px; margin-bottom:24px;">
              <tr>
                <td style="padding:18px 20px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:36px; height:36px; background:rgba(245,158,11,0.15); border-radius:10px; text-align:center; vertical-align:middle;" valign="top">
                        <span style="font-size:16px;">&#9888;</span>
                      </td>
                      <td style="padding-left:14px;">
                        <p style="margin:0; font-size:12px; color:#f59e0b; line-height:1.7;"><strong style="color:#fbbf24;">Security Warning:</strong> If you did not request this code, someone may be attempting to access your account. Please change your password immediately and contact our support team to secure your account. Never share this code with anyone.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!-- Support -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,rgba(30,27,75,0.6) 0%,rgba(15,15,22,0.9) 100%); border:1px solid rgba(124,58,237,0.3); border-radius:16px; margin-bottom:0;">
              <tr>
                <td style="padding:24px; text-align:center;">
                  <p style="margin:0 0 10px; font-size:14px; font-weight:700; color:#c4b5fd; letter-spacing:1px;">Need Help?</p>
                  <p style="margin:0 0 16px; font-size:13px; color:#94a3b8; line-height:1.7;">If you are experiencing issues with your verification code, or if you believe your account has been compromised, our security team is standing by to assist you immediately.</p>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%); border-radius:24px; padding:12px 28px; border:1px solid rgba(168,85,247,0.4);">
                        <a href="mailto:credixasupport@gmail.com?subject=Security%20Alert%20Assistance" style="color:#ffffff; text-decoration:none; font-size:13px; font-weight:700; letter-spacing:0.5px; display:inline-block;">
                          <span style="margin-right:6px;">&#128172;</span>Contact Support
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:14px 0 0; font-size:11px; color:#475569;">Available 24/7 for all security-related inquiries.</p>
                </td>
              </tr>
            </table>
            
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="text-align:center; padding:32px 24px 24px; border-top:1px solid #1e1e2e; background:linear-gradient(180deg,#0c0c14 0%,#050508 100%);">
            <p style="margin:0 0 4px; font-size:16px; font-weight:900; color:#818cf8; letter-spacing:4px; text-transform:uppercase;">CREDIXA BANKING</p>
            <p style="margin:0 0 20px; font-size:12px; color:#475569; font-weight:500; letter-spacing:1px;">Secure. Fast. Reliable.</p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
              <tr><td style="width:40px; height:2px; background:linear-gradient(90deg,transparent,#f59e0b,transparent); border-radius:2px;">&nbsp;</td></tr>
            </table>
            <p style="margin:4px 0; font-size:11px; color:#334155; line-height:1.6;">This is an automated security alert from Credixa Banking.</p>
            <p style="margin:4px 0; font-size:11px; color:#334155; line-height:1.6;">Please do not reply to this email. For assistance, contact our support team.</p>
            <p style="margin:12px 0 4px; font-size:11px; color:#334155;">&copy; 2026 Credixa Banking. All rights reserved.</p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top:16px; padding-top:16px; border-top:1px solid #1e1e2e;">
              <tr>
                <td style="padding:0 12px;"><a href="mailto:credixasupport@gmail.com" style="color:#818cf8; text-decoration:none; font-size:12px; font-weight:600;">Support</a></td>
                <td style="color:#1e1e2e; font-size:12px;">|</td>
                <td style="padding:0 12px;"><a href="#" style="color:#818cf8; text-decoration:none; font-size:12px; font-weight:600;">Privacy Policy</a></td>
                <td style="color:#1e1e2e; font-size:12px;">|</td>
                <td style="padding:0 12px;"><a href="#" style="color:#818cf8; text-decoration:none; font-size:12px; font-weight:600;">Terms of Service</a></td>
              </tr>
            </table>
          </td>
        </tr>
        
      </table>
      
    </td>
  </tr>
</table>

</body>
</html>`;
};

const sendTransferEmail = async (recipientEmail, transferData) => {
  try {
    if (!recipientEmail) {
      console.log('[EMAIL] No recipient email provided, skipping email');
      return { success: false, skipped: true };
    }

    const htmlContent = generateTransferEmail(transferData);

    await sgMail.send({
      to: recipientEmail,
      from: 'credixasupport@gmail.com',
      subject: transferData.isSimulated
        ? `External transfer recorded — Credixa Banking`
        : `You received $${transferData.amountUSD} from ${transferData.senderName} — Credixa Banking`,
      html: htmlContent,
    });

    console.log('[EMAIL] Transfer email sent to:', recipientEmail);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send transfer email:', error.response?.body?.errors || error.message);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = async (recipientEmail, otpData) => {
  try {
    const htmlContent = generateOTPEmail(otpData);

    await sgMail.send({
      to: recipientEmail,
      from: 'credixasupport@gmail.com',
      subject: `${otpData.otpType === 'password' ? '🔐 Password Reset' : '🔐 PIN Reset'} — Your Credixa Verification Code`,
      html: htmlContent,
    });

    console.log('[EMAIL] OTP email sent to:', recipientEmail);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP email:', error.response?.body?.errors || error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendTransferEmail, sendOTPEmail, generateTransferEmail };
