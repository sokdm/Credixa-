const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  pool: true,
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'wsdmpresh@gmail.com',
    pass: 'wgor knla gjqr cyre'
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  logger: false,
  debug: false
});

const generateTransferEmail = (data) => {
  const {
    senderName, senderAccount, recipientName, recipientAccount, recipientBank,
    amountUSD, amountConverted, currencyCode, currencyFlag, exchangeRate,
    transactionId, date, narration, status = 'Completed'
  } = data;

  const maskedSender = senderAccount ? '****' + senderAccount.slice(-4) : '****';
  const maskedRecipient = recipientAccount ? '****' + recipientAccount.slice(-4) : '****';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Transaction Alert — Credixa Banking</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  
  body { 
    margin: 0; 
    padding: 0; 
    background-color: #050508; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased; 
    -moz-osx-font-smoothing: grayscale;
  }
  
  .email-wrapper { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #0a0a0f; 
    color: #e2e8f0;
    box-shadow: 0 0 60px rgba(124, 58, 237, 0.15);
  }
  
  .security-ribbon {
    background: linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
    padding: 10px 24px;
    text-align: center;
    border-bottom: 1px solid rgba(124, 58, 237, 0.3);
  }
  .security-ribbon-text {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #a5b4fc;
  }
  .security-ribbon-text span {
    color: #34d399;
    margin: 0 8px;
  }
  
  .alert-header {
    background: linear-gradient(180deg, #1e1b4b 0%, #0f0f1a 100%);
    padding: 32px 24px 28px;
    text-align: center;
    border-bottom: 1px solid rgba(124, 58, 237, 0.2);
    position: relative;
    overflow: hidden;
  }
  .alert-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #a855f7, transparent);
  }
  
  .bank-brand {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 5px;
    color: #818cf8;
    margin-bottom: 24px;
    text-transform: uppercase;
  }
  
  .success-badge {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 0 50px rgba(124, 58, 237, 0.5), inset 0 0 20px rgba(255,255,255,0.1);
    border: 2px solid rgba(168, 85, 247, 0.4);
  }
  .success-badge svg {
    width: 32px;
    height: 32px;
    fill: none;
    stroke: #ffffff;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  .alert-header h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }
  .alert-header .subtitle {
    margin: 0;
    font-size: 15px;
    color: #94a3b8;
    font-weight: 400;
    line-height: 1.5;
  }
  .alert-header .subtitle strong {
    color: #c4b5fd;
    font-weight: 600;
  }
  
  .content { padding: 32px 24px; }
  
  .amount-card {
    background: linear-gradient(135deg, #1e1b4b 0%, #2d2b55 50%, #1e1b4b 100%);
    border: 1px solid rgba(124, 58, 237, 0.35);
    border-radius: 20px;
    padding: 36px 24px;
    margin-bottom: 28px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .amount-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .amount-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent);
  }
  
  .amount-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #a5b4fc;
    margin-bottom: 14px;
    font-weight: 700;
  }
  .amount-value {
    font-size: 44px;
    font-weight: 900;
    color: #ffffff;
    margin: 0;
    letter-spacing: -1.5px;
    line-height: 1.1;
    text-shadow: 0 2px 20px rgba(124, 58, 237, 0.3);
  }
  .amount-converted {
    font-size: 18px;
    color: #c4b5fd;
    margin-top: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .rate-pill {
    font-size: 12px;
    color: #818cf8;
    margin-top: 12px;
    font-weight: 600;
    background: rgba(124, 58, 237, 0.2);
    display: inline-block;
    padding: 6px 16px;
    border-radius: 24px;
    border: 1px solid rgba(124, 58, 237, 0.3);
    letter-spacing: 0.5px;
  }
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(52, 211, 153, 0.12);
    color: #34d399;
    padding: 8px 20px;
    border-radius: 24px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 20px;
    border: 1px solid rgba(52, 211, 153, 0.3);
  }
  .status-pill::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #34d399;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.6);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.15); }
  }
  
  .reference-box {
    background: rgba(15, 15, 22, 0.8);
    border: 1px dashed #2e2e3e;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 28px;
    text-align: center;
  }
  .reference-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #475569;
    margin-bottom: 6px;
    font-weight: 700;
  }
  .reference-value {
    font-size: 12px;
    color: #64748b;
    font-family: 'SF Mono', monospace;
    letter-spacing: 2px;
  }
  
  .details-card {
    background-color: #0f0f16;
    border: 1px solid #1e1e2e;
    border-radius: 16px;
    padding: 8px 24px;
    margin-bottom: 28px;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #1e1e2e;
  }
  .detail-row:last-child { border-bottom: none; }
  .detail-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  .detail-value {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
    text-align: right;
    max-width: 55%;
    word-break: break-word;
  }
  .detail-value.sender { color: #c4b5fd; font-weight: 700; }
  .detail-value.highlight { color: #34d399; font-weight: 700; }
  .detail-value.account { 
    font-family: 'SF Mono', 'Courier New', monospace; 
    letter-spacing: 1px;
    font-size: 13px;
  }
  
  .narration-box {
    background: linear-gradient(90deg, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0.03) 100%);
    border-left: 3px solid #7c3aed;
    border-radius: 0 14px 14px 0;
    padding: 20px 24px;
    margin-bottom: 28px;
  }
  .narration-box p {
    margin: 0;
    font-size: 14px;
    color: #cbd5e1;
    line-height: 1.7;
    font-style: italic;
  }
  .narration-box strong {
    color: #a78bfa;
    font-style: normal;
    font-weight: 700;
  }
  
  .processing-box {
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 15, 22, 0.8) 100%);
    border: 1px solid rgba(124, 58, 237, 0.25);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 28px;
  }
  .processing-box h3 {
    margin: 0 0 16px 0;
    font-size: 13px;
    font-weight: 700;
    color: #a5b4fc;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .processing-box h3 .icon {
    width: 28px;
    height: 28px;
    background: rgba(124, 58, 237, 0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .processing-box p {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.7;
  }
  .processing-box p:last-child { margin-bottom: 0; }
  .processing-box p strong {
    color: #c4b5fd;
  }
  .processing-box .timeline {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(124, 58, 237, 0.15);
  }
  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
  }
  .timeline-dot {
    width: 8px;
    height: 8px;
    background: #7c3aed;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
    box-shadow: 0 0 8px rgba(124, 58, 237, 0.4);
  }
  .timeline-dot.completed {
    background: #34d399;
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.4);
  }
    .support-box {
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 15, 22, 0.9) 100%);
    border: 1px solid rgba(124, 58, 237, 0.3);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 28px;
    text-align: center;
  }
  .support-box h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 700;
    color: #c4b5fd;
    letter-spacing: 1px;
  }
  .support-box p {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.7;
  }
  .support-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: #ffffff;
    text-decoration: none;
    padding: 12px 28px;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    border: 1px solid rgba(168, 85, 247, 0.4);
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
  }
  
  .security-box {
    background-color: #0f0f16;
    border: 1px solid #1e1e2e;
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 28px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .security-box .lock-icon {
    width: 36px;
    height: 36px;
    background: rgba(124, 58, 237, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
  }
  .security-box p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.7;
  }
  .security-box p strong {
    color: #94a3b8;
  }
  
  .footer {
    text-align: center;
    padding: 36px 24px 28px;
    border-top: 1px solid #1e1e2e;
    background: linear-gradient(180deg, #0c0c14 0%, #050508 100%);
  }
  .footer .brand {
    font-size: 16px;
    font-weight: 900;
    color: #818cf8;
    margin-bottom: 6px;
    letter-spacing: 4px;
    text-transform: uppercase;
  }
  .footer .tagline {
    font-size: 12px;
    color: #475569;
    margin-bottom: 24px;
    font-weight: 500;
    letter-spacing: 1px;
  }
  .footer-divider {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #7c3aed, transparent);
    margin: 0 auto 20px;
    border-radius: 2px;
  }
  .footer p {
    margin: 6px 0;
    font-size: 11px;
    color: #334155;
    line-height: 1.6;
  }
  .footer-links {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #1e1e2e;
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }
  .footer-links a {
    color: #818cf8;
    text-decoration: none;
    font-size: 12px;
    font-weight: 600;
  }
  .footer-links .separator {
    color: #1e1e2e;
    font-size: 12px;
  }
  
  @media screen and (max-width: 600px) {
    .content { padding: 24px 16px; }
    .amount-value { font-size: 32px; }
    .alert-header h1 { font-size: 22px; }
    .detail-row { flex-direction: column; align-items: flex-start; gap: 6px; }
    .detail-value { text-align: left; max-width: 100%; }
    .footer-links { gap: 16px; }
    .processing-box { padding: 20px; }
    .support-box { padding: 20px; }
  }
</style>
</head>
<body>
<div class="email-wrapper">
  <div class="security-ribbon">
    <div class="security-ribbon-text">
      <span>&#9679;</span>
      Secure Transaction Alert
      <span>&#9679;</span>
    </div>
  </div>
  
  <div class="alert-header">
    <div class="bank-brand">Credixa Banking</div>
    <div class="success-badge">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <h1>Money Received!</h1>
    <p class="subtitle">You received money from <strong>${senderName}</strong></p>
  </div>
  
  <div class="content">
    <div class="amount-card">
      <div class="amount-label">Amount Received</div>
      <div class="amount-value">$${amountUSD}</div>
      <div class="amount-converted">${amountConverted} ${currencyFlag}</div>
      <div class="rate-pill">1 USD = ${exchangeRate} ${currencyCode}</div>
      <div class="status-pill">${status}</div>
    </div>
    
    <div class="reference-box">
      <div class="reference-label">Transaction Reference</div>
      <div class="reference-value">${transactionId}</div>
    </div>
    
    <div class="details-card">
      <div class="detail-row">
        <span class="detail-label">From</span>
        <span class="detail-value sender">${senderName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">From Account</span>
        <span class="detail-value account">${maskedSender}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">To Your Account</span>
        <span class="detail-value account">${maskedRecipient}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Bank</span>
        <span class="detail-value">${recipientBank}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Account Name</span>
        <span class="detail-value">${recipientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Currency</span>
        <span class="detail-value">${currencyFlag} ${currencyCode}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date & Time</span>
        <span class="detail-value">${date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value highlight">&#10003; ${status}</span>
      </div>
    </div>
    
    ${narration ? `
    <div class="narration-box">
      <p><strong>Sender's Note:</strong> "${narration}"</p>
    </div>
    ` : ''}
    
    <div class="processing-box">
      <h3><span class="icon">&#128336;</span> Processing Information</h3>
      <p><strong>International Payments:</strong> Please note that international wire transfers and cross-border payments may take <strong>1–3 business days</strong> to fully reflect in your available balance, depending on the correspondent bank network and currency conversion processing.</p>
      <p><strong>Local Transfers:</strong> Domestic transfers within the same banking network are typically processed instantly and should appear in your balance immediately.</p>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot completed"></div>
          <span><strong>Transaction Initiated</strong> — Sender has confirmed the transfer</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot completed"></div>
          <span><strong>Processing</strong> — Funds are being routed through our secure network</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot ${status === 'Completed' ? 'completed' : ''}"></div>
          <span><strong>Credited</strong> — Funds have been posted to your account</span>
        </div>
      </div>
    </div>
    
    <div class="support-box">
      <h3>Need Assistance?</h3>
      <p>If this transfer does not appear in your account balance within the expected timeframe, or if you have any questions regarding this transaction, our support team is available to help you resolve any issues promptly.</p>
      <a href="mailto:credixasupport@gmail.com?subject=Transaction%20Inquiry%20-%20${transactionId}" class="support-btn">
        <span>&#128172;</span> Contact Support
      </a>
      <p style="margin-top: 14px; margin-bottom: 0; font-size: 11px; color: #475569;">
        Please include your <strong>Transaction Reference</strong> in your inquiry for faster resolution.
      </p>
    </div>
    
    <div class="security-box">
      <div class="lock-icon">&#128274;</div>
      <p><strong>Security Notice:</strong> This transaction was securely processed and verified by Credixa Banking's encryption systems. If you did not authorize or expect this transfer, please contact our support team immediately to secure your account. Never share your PIN, password, or OTP with anyone — Credixa Banking will never ask for these details via email or phone.</p>
    </div>
  </div>
  
  <div class="footer">
    <div class="brand">Credixa Banking</div>
    <div class="tagline">Secure. Fast. Reliable.</div>
    <div class="footer-divider"></div>
    <p>This is an automated security alert from Credixa Banking.</p>
    <p>Please do not reply to this email. For assistance, contact our support team.</p>
    <p style="margin-top: 12px;">&copy; 2026 Credixa Banking. All rights reserved.</p>
    <div class="footer-links">
      <a href="mailto:credixasupport@gmail.com">Support</a>
      <span class="separator">|</span>
      <a href="#">Privacy Policy</a>
      <span class="separator">|</span>
      <a href="#">Terms of Service</a>
    </div>
  </div>
</div>
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  
  body { 
    margin: 0; 
    padding: 0; 
    background-color: #050508; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased; 
    -moz-osx-font-smoothing: grayscale;
  }
  
  .email-wrapper { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #0a0a0f; 
    color: #e2e8f0;
    box-shadow: 0 0 60px rgba(245, 158, 11, 0.1);
  }
  
  .security-ribbon {
    background: linear-gradient(90deg, #451a03 0%, #78350f 50%, #451a03 100%);
    padding: 10px 24px;
    text-align: center;
    border-bottom: 1px solid rgba(245, 158, 11, 0.3);
  }
  .security-ribbon-text {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #fbbf24;
  }
  .security-ribbon-text span {
    color: #f59e0b;
    margin: 0 8px;
  }
  
  .alert-header {
    background: linear-gradient(180deg, #1e1b4b 0%, #0f0f1a 100%);
    padding: 32px 24px 28px;
    text-align: center;
    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    position: relative;
    overflow: hidden;
  }
  .alert-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  }
  
  .bank-brand {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 5px;
    color: #818cf8;
    margin-bottom: 24px;
    text-transform: uppercase;
  }
  
  .shield-badge {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 0 50px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(255,255,255,0.1);
    border: 2px solid rgba(251, 191, 36, 0.4);
  }
  .shield-badge svg {
    width: 32px;
    height: 32px;
    fill: none;
    stroke: #0a0a0f;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  .alert-header h1 {
    margin: 0 0 10px 0;
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }
  .alert-header .subtitle {
    margin: 0;
    font-size: 15px;
    color: #94a3b8;
    font-weight: 400;
    line-height: 1.5;
  }
  .alert-header .subtitle strong {
    color: #fbbf24;
    font-weight: 600;
  }
  
  .content { padding: 32px 24px; }
  
  .otp-box {
    background: linear-gradient(135deg, #1e1b4b 0%, #2d2b55 100%);
    border: 1px solid rgba(245, 158, 11, 0.35);
    border-radius: 20px;
    padding: 40px 24px;
    margin-bottom: 28px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .otp-box::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .otp-box::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.6), transparent);
  }
  
  .otp-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #fbbf24;
    margin-bottom: 16px;
    font-weight: 700;
  }
  .otp-code {
    font-size: 52px;
    font-weight: 900;
    color: #fbbf24;
    letter-spacing: 14px;
    font-family: 'SF Mono', 'Courier New', monospace;
    margin: 20px 0;
    text-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
    position: relative;
    z-index: 1;
  }
  .otp-expiry {
    font-size: 13px;
    color: #f59e0b;
    margin-top: 16px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(245, 158, 11, 0.1);
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
  
  .details-card {
    background-color: #0f0f16;
    border: 1px solid #1e1e2e;
    border-radius: 16px;
    padding: 8px 24px;
    margin-bottom: 28px;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #1e1e2e;
  }
  .detail-row:last-child { border-bottom: none; }
  .detail-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  .detail-value {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
    text-align: right;
  }
  
  .warning-box {
    background: rgba(245, 158, 11, 0.06);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 28px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .warning-box .icon {
    width: 36px;
    height: 36px;
    background: rgba(245, 158, 11, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
  }
  .warning-box p {
    margin: 0;
    font-size: 12px;
    color: #f59e0b;
    line-height: 1.7;
  }
  .warning-box p strong {
    color: #fbbf24;
  }
    .support-box {
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 15, 22, 0.9) 100%);
    border: 1px solid rgba(124, 58, 237, 0.3);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 28px;
    text-align: center;
  }
  .support-box h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 700;
    color: #c4b5fd;
    letter-spacing: 1px;
  }
  .support-box p {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.7;
  }
  .support-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: #ffffff;
    text-decoration: none;
    padding: 12px 28px;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    border: 1px solid rgba(168, 85, 247, 0.4);
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
  }
  
  .footer {
    text-align: center;
    padding: 36px 24px 28px;
    border-top: 1px solid #1e1e2e;
    background: linear-gradient(180deg, #0c0c14 0%, #050508 100%);
  }
  .footer .brand {
    font-size: 16px;
    font-weight: 900;
    color: #818cf8;
    margin-bottom: 6px;
    letter-spacing: 4px;
    text-transform: uppercase;
  }
  .footer .tagline {
    font-size: 12px;
    color: #475569;
    margin-bottom: 24px;
    font-weight: 500;
    letter-spacing: 1px;
  }
  .footer-divider {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #f59e0b, transparent);
    margin: 0 auto 20px;
    border-radius: 2px;
  }
  .footer p {
    margin: 6px 0;
    font-size: 11px;
    color: #334155;
    line-height: 1.6;
  }
  .footer-links {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #1e1e2e;
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }
  .footer-links a {
    color: #818cf8;
    text-decoration: none;
    font-size: 12px;
    font-weight: 600;
  }
  .footer-links .separator {
    color: #1e1e2e;
    font-size: 12px;
  }
  
  @media screen and (max-width: 600px) {
    .content { padding: 24px 16px; }
    .otp-code { font-size: 36px; letter-spacing: 8px; }
    .alert-header h1 { font-size: 22px; }
    .detail-row { flex-direction: column; align-items: flex-start; gap: 6px; }
    .detail-value { text-align: left; }
    .support-box { padding: 20px; }
  }
</style>
</head>
<body>
<div class="email-wrapper">
  <div class="security-ribbon">
    <div class="security-ribbon-text">
      <span>&#9679;</span>
      Security Verification Required
      <span>&#9679;</span>
    </div>
  </div>
  
  <div class="alert-header">
    <div class="bank-brand">Credixa Banking</div>
    <div class="shield-badge">
      <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    </div>
    <h1>${typeLabel}</h1>
    <p class="subtitle">Hi <strong>${userName}</strong>, use the code below to ${typeDesc}</p>
  </div>
  
  <div class="content">
    <div class="otp-box">
      <div class="otp-label">Your Verification Code</div>
      <div class="otp-code">${otpCode}</div>
      <div class="otp-expiry">&#9200; Expires in ${expiryMinutes} minutes</div>
    </div>
    
    <div class="details-card">
      <div class="detail-row">
        <span class="detail-label">Request Type</span>
        <span class="detail-value">${typeLabel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Requested At</span>
        <span class="detail-value">${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value" style="color: #fbbf24;">&#9888; Pending Verification</span>
      </div>
    </div>
    
    <div class="warning-box">
      <div class="icon">&#9888;</div>
      <p><strong>Security Warning:</strong> If you did not request this code, someone may be attempting to access your account. Please change your password immediately and contact our support team to secure your account. Never share this code with anyone.</p>
    </div>
    
    <div class="support-box">
      <h3>Need Help?</h3>
      <p>If you are experiencing issues with your verification code, or if you believe your account has been compromised, our security team is standing by to assist you immediately.</p>
      <a href="mailto:credixasupport@gmail.com?subject=Security%20Alert%20Assistance" class="support-btn">
        <span>&#128172;</span> Contact Support
      </a>
      <p style="margin-top: 14px; margin-bottom: 0; font-size: 11px; color: #475569;">
        Available 24/7 for all security-related inquiries.
      </p>
    </div>
  </div>
  
  <div class="footer">
    <div class="brand">Credixa Banking</div>
    <div class="tagline">Secure. Fast. Reliable.</div>
    <div class="footer-divider"></div>
    <p>This is an automated security alert from Credixa Banking.</p>
    <p>Please do not reply to this email. For assistance, contact our support team.</p>
    <p style="margin-top: 12px;">&copy; 2026 Credixa Banking. All rights reserved.</p>
    <div class="footer-links">
      <a href="mailto:credixasupport@gmail.com">Support</a>
      <span class="separator">|</span>
      <a href="#">Privacy Policy</a>
      <span class="separator">|</span>
      <a href="#">Terms of Service</a>
    </div>
  </div>
</div>
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
    const mailOptions = {
      from: '"Credixa Banking" <wsdmpresh@gmail.com>',
      to: recipientEmail,
      subject: `You received $${transferData.amountUSD} from ${transferData.senderName} — Credixa Banking`,
      html: htmlContent
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Transfer email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Failed to send transfer email:', error);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = async (recipientEmail, otpData) => {
  try {
    const htmlContent = generateOTPEmail(otpData);
    const mailOptions = {
      from: '"Credixa Banking" <wsdmpresh@gmail.com>',
      to: recipientEmail,
      subject: `${otpData.otpType === 'password' ? '🔐 Password Reset' : '🔐 PIN Reset'} — Your Credixa Verification Code`,
      html: htmlContent
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendTransferEmail, sendOTPEmail, generateTransferEmail };
