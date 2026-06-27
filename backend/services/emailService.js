const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'wsdmpresh@gmail.com',
    pass: 'wgor knla gjqr cyre'
  }
});

const generateTransferEmail = (data) => {
  const {
    senderName, senderAccount, recipientName, recipientAccount, recipientBank,
    amountUSD, amountConverted, currencyCode, currencyFlag, exchangeRate,
    transactionId, date, narration, status = 'Completed'
  } = data;

  const maskedSender = senderAccount ? '****' + senderAccount.slice(-4) : '****';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  body { margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
  .email-wrapper { max-width: 520px; margin: 0 auto; background-color: #0a0a0f; color: #ffffff; }
  .alert-banner { background: linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%); padding: 16px 24px; text-align: center; border-bottom: 2px solid #a855f7; }
  .alert-banner-text { font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .alert-dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
  .header { background: linear-gradient(180deg, #1e1b4b 0%, #0f0f1a 100%); padding: 40px 24px 32px; text-align: center; border-bottom: 1px solid #1f1f2e; }
  .bank-logo { font-size: 12px; font-weight: 800; letter-spacing: 4px; color: #a78bfa; margin-bottom: 24px; text-transform: uppercase; }
  .success-ring { width: 80px; height: 80px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 40px rgba(124, 58, 237, 0.4), 0 0 80px rgba(168, 85, 247, 0.2); }
  .success-ring span { font-size: 36px; color: #ffffff; }
  .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
  .header .subtitle { margin: 0; font-size: 15px; color: #9ca3af; font-weight: 500; }
  .header .subtitle strong { color: #a78bfa; }
  .content { padding: 32px 24px; }
  .amount-card { background: linear-gradient(135deg, #1e1b4b 0%, #2d2b55 50%, #1e1b4b 100%); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 20px; padding: 32px 24px; margin-bottom: 24px; text-align: center; position: relative; overflow: hidden; }
  .amount-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%); pointer-events: none; }
  .amount-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a78bfa; margin-bottom: 12px; font-weight: 600; }
  .amount-value { font-size: 42px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -1px; }
  .amount-converted { font-size: 18px; color: #c4b5fd; margin-top: 12px; font-weight: 600; }
  .rate { font-size: 13px; color: #8b5cf6; margin-top: 8px; font-weight: 500; background: rgba(124, 58, 237, 0.15); display: inline-block; padding: 4px 12px; border-radius: 20px; }
  .status-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; border: 1px solid rgba(52, 211, 153, 0.3); }
  .status-badge::before { content: ''; width: 6px; height: 6px; background: #34d399; border-radius: 50%; }
  .details-card { background-color: #13131a; border: 1px solid #1f1f2e; border-radius: 16px; padding: 8px 20px; margin-bottom: 24px; }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #1f1f2e; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-size: 13px; color: #6b7280; font-weight: 500; }
  .detail-value { font-size: 14px; font-weight: 600; color: #ffffff; text-align: right; }
  .detail-value.sender { color: #a78bfa; font-weight: 700; }
  .detail-value.highlight { color: #34d399; font-weight: 700; }
  .detail-value.account { font-family: 'SF Mono', monospace; letter-spacing: 1px; }
  .message-box { background: linear-gradient(90deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%); border-left: 3px solid #7c3aed; border-radius: 0 12px 12px 0; padding: 18px 20px; margin-bottom: 24px; }
  .message-box p { margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6; }
  .message-box strong { color: #a78bfa; }
  .security-box { background-color: #13131a; border: 1px solid #1f1f2e; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
  .security-box p { margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5; }
  .security-box .lock { color: #a78bfa; margin-right: 6px; }
  .footer { text-align: center; padding: 32px 24px; border-top: 1px solid #1f1f2e; background: linear-gradient(180deg, #0f0f1a 0%, #0a0a0f 100%); }
  .footer .brand { font-size: 16px; font-weight: 800; color: #a78bfa; margin-bottom: 8px; letter-spacing: 2px; }
  .footer .tagline { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
  .footer p { margin: 4px 0; font-size: 11px; color: #4b5563; }
  .footer-links { margin-top: 16px; padding-top: 16px; border-top: 1px solid #1f1f2e; }
  .footer-links a { color: #8b5cf6; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 12px; }
  /* OTP styles */
  .otp-box { background: linear-gradient(135deg, #1e1b4b 0%, #2d2b55 100%); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 20px; padding: 40px 24px; margin: 24px 0; text-align: center; }
  .otp-code { font-size: 48px; font-weight: 800; color: #a78bfa; letter-spacing: 8px; font-family: 'SF Mono', monospace; margin: 16px 0; text-shadow: 0 0 30px rgba(124, 58, 237, 0.5); }
  .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; margin-bottom: 8px; }
  .otp-expiry { font-size: 13px; color: #f59e0b; margin-top: 12px; }
  .otp-warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 12px 16px; margin-top: 16px; }
  .otp-warning p { margin: 0; font-size: 12px; color: #f59e0b; }
</style>
</head>
<body>
<div class="email-wrapper">
  <div class="alert-banner">
    <div class="alert-banner-text">
      <span class="alert-dot"></span>
      Transaction Alert
      <span class="alert-dot"></span>
    </div>
  </div>
  <div class="header">
    <div class="bank-logo">CREDIXA BANKING</div>
    <div class="success-ring"><span>&#10003;</span></div>
    <h1>Money Received!</h1>
    <p class="subtitle">You received money from <strong>${senderName}</strong></p>
  </div>
  <div class="content">
    <div class="amount-card">
      <div class="amount-label">Amount Received</div>
      <div class="amount-value">$${amountUSD}</div>
      <div class="amount-converted">${amountConverted} ${currencyFlag}</div>
      <div class="rate">1 USD = ${exchangeRate} ${currencyCode}</div>
      <div class="status-badge">${status}</div>
    </div>
    <div class="details-card">
      <div class="detail-row"><span class="detail-label">From</span><span class="detail-value sender">${senderName}</span></div>
      <div class="detail-row"><span class="detail-label">From Account</span><span class="detail-value account">${maskedSender}</span></div>
      <div class="detail-row"><span class="detail-label">To Your Account</span><span class="detail-value account">${recipientAccount}</span></div>
      <div class="detail-row"><span class="detail-label">Bank</span><span class="detail-value">${recipientBank}</span></div>
      <div class="detail-row"><span class="detail-label">Account Name</span><span class="detail-value">${recipientName}</span></div>
      <div class="detail-row"><span class="detail-label">Currency</span><span class="detail-value">${currencyFlag} ${currencyCode}</span></div>
      <div class="detail-row"><span class="detail-label">Transaction ID</span><span class="detail-value account">${transactionId}</span></div>
      <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${date}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value highlight">&#10003; ${status}</span></div>
    </div>
    ${narration ? `<div class="message-box"><p><strong>Sender's Note:</strong> "${narration}"</p></div>` : ''}
    <div class="security-box"><p><span class="lock">&#128274;</span> This transaction was securely processed by Credixa Banking. If you did not expect this transfer, please contact our support team immediately.</p></div>
  </div>
  <div class="footer">
    <div class="brand">CREDIXA BANKING</div>
    <div class="tagline">Secure. Fast. Reliable.</div>
    <p>This is an automated security alert from Credixa Banking.</p>
    <p>Please do not reply to this email.</p>
    <p style="margin-top: 12px;">&copy; 2026 Credixa Banking. All rights reserved.</p>
    <div class="footer-links"><a href="#">Support</a><a href="#">Privacy</a><a href="#">Terms</a></div>
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
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  body { margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
  .email-wrapper { max-width: 520px; margin: 0 auto; background-color: #0a0a0f; color: #ffffff; }
  .alert-banner { background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%); padding: 16px 24px; text-align: center; border-bottom: 2px solid #fbbf24; }
  .alert-banner-text { font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #0a0a0f; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .alert-dot { width: 8px; height: 8px; background: #0a0a0f; border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
  .header { background: linear-gradient(180deg, #1e1b4b 0%, #0f0f1a 100%); padding: 40px 24px 32px; text-align: center; border-bottom: 1px solid #1f1f2e; }
  .bank-logo { font-size: 12px; font-weight: 800; letter-spacing: 4px; color: #a78bfa; margin-bottom: 24px; text-transform: uppercase; }
  .shield-ring { width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 40px rgba(245, 158, 11, 0.4), 0 0 80px rgba(251, 191, 36, 0.2); }
  .shield-ring span { font-size: 36px; color: #0a0a0f; }
  .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
  .header .subtitle { margin: 0; font-size: 15px; color: #9ca3af; font-weight: 500; }
  .header .subtitle strong { color: #fbbf24; }
  .content { padding: 32px 24px; }
  .otp-box { background: linear-gradient(135deg, #1e1b4b 0%, #2d2b55 100%); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 20px; padding: 40px 24px; margin-bottom: 24px; text-align: center; position: relative; overflow: hidden; }
  .otp-box::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%); pointer-events: none; }
  .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fbbf24; margin-bottom: 12px; font-weight: 600; }
  .otp-code { font-size: 48px; font-weight: 800; color: #fbbf24; letter-spacing: 12px; font-family: 'SF Mono', monospace; margin: 16px 0; text-shadow: 0 0 30px rgba(245, 158, 11, 0.5); }
  .otp-expiry { font-size: 13px; color: #f59e0b; margin-top: 12px; font-weight: 500; }
  .details-card { background-color: #13131a; border: 1px solid #1f1f2e; border-radius: 16px; padding: 8px 20px; margin-bottom: 24px; }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #1f1f2e; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-size: 13px; color: #6b7280; font-weight: 500; }
  .detail-value { font-size: 14px; font-weight: 600; color: #ffffff; text-align: right; }
  .warning-box { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
  .warning-box p { margin: 0; font-size: 13px; color: #f59e0b; line-height: 1.5; }
  .warning-box .icon { margin-right: 6px; }
  .footer { text-align: center; padding: 32px 24px; border-top: 1px solid #1f1f2e; background: linear-gradient(180deg, #0f0f1a 0%, #0a0a0f 100%); }
  .footer .brand { font-size: 16px; font-weight: 800; color: #a78bfa; margin-bottom: 8px; letter-spacing: 2px; }
  .footer .tagline { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
  .footer p { margin: 4px 0; font-size: 11px; color: #4b5563; }
</style>
</head>
<body>
<div class="email-wrapper">
  <div class="alert-banner">
    <div class="alert-banner-text">
      <span class="alert-dot"></span>
      Security Alert
      <span class="alert-dot"></span>
    </div>
  </div>
  <div class="header">
    <div class="bank-logo">CREDIXA BANKING</div>
    <div class="shield-ring"><span>&#128274;</span></div>
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
      <div class="detail-row"><span class="detail-label">Request Type</span><span class="detail-value">${typeLabel}</span></div>
      <div class="detail-row"><span class="detail-label">Requested At</span><span class="detail-value">${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value" style="color: #fbbf24;">&#9888; Pending Verification</span></div>
    </div>
    <div class="warning-box">
      <p><span class="icon">&#9888;</span> If you did not request this code, someone may be trying to access your account. Please change your password immediately and contact support.</p>
    </div>
  </div>
  <div class="footer">
    <div class="brand">CREDIXA BANKING</div>
    <div class="tagline">Secure. Fast. Reliable.</div>
    <p>This is an automated security alert from Credixa Banking.</p>
    <p>Please do not reply to this email.</p>
    <p style="margin-top: 12px;">&copy; 2026 Credixa Banking. All rights reserved.</p>
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
