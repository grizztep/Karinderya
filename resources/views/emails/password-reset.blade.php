<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Evelyn's Karinderya</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 24px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 20px;
            line-height: 1.7;
        }
        
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
            transition: all 0.2s ease;
        }
        
        .reset-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 25px 0;
            border-radius: 4px;
        }
        
        .security-note strong {
            color: #92400e;
        }
        
        .security-note p {
            color: #78350f;
            margin: 0;
            font-size: 14px;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer .company-name {
            font-weight: 600;
            color: #059669;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 25px 0;
        }
        
        .small-text {
            font-size: 13px;
            color: #9ca3af;
            line-height: 1.5;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .greeting {
                font-size: 18px;
            }
            
            .reset-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🍲</div>
            <h1>Evelyn's Karinderya</h1>
            <p>Authentic Filipino Comfort Food</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">Hello {{ $user->name }}! 👋</div>
            
            <div class="message">
                <p>We received a request to reset the password for your <strong>Evelyn's Karinderya</strong> account.</p>
                <p>If you made this request, simply click the button below to create a new password. If you didn't request this, you can safely ignore this email.</p>
            </div>
            
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="reset-button">Reset My Password</a>
            </div>
            
            <div class="security-note">
                <strong>🔒 Security Note:</strong>
                <p>This password reset link will expire in <strong>60 minutes</strong> for your security. If you need a new link after it expires, please request another password reset from our login page.</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="small-text">
                <p><strong>Having trouble with the button?</strong> Copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #059669; margin-top: 10px;">{{ $resetUrl }}</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>This email was sent by <span class="company-name">Evelyn's Karinderya</span></p>
            <p class="small-text">If you have any questions, feel free to contact our support team.</p>
            <p class="small-text">© {{ date('Y') }} Evelyn's Karinderya. All rights reserved.</p>
        </div>
    </div>
</body>
</html>