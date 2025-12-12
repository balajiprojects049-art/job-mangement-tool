# 🚀 Deployment Guide: Hostinger VPS (Ubuntu)

If you choose Hostinger VPS over Vercel, follow these steps.

## 📌 Prerequisites
1. Purchase a **VPS** plan from Hostinger (e.g., KVM 1 or KVM 2).
2. Select **Ubuntu 22.04 (64-bit)** as the operating system.
3. You will get an IP address (e.g., `192.168.1.1`) and a root password.

## 📌 Step 1: Connect to Server
Open your terminal (Command Prompt) and connect via SSH:
```bash
ssh root@YOUR_SERVER_IP
# Enter password when prompted
```

## 📌 Step 2: Install Software
Run these commands one by one to install Node.js, Nginx, and Git:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install Process Manager (PM2) to keep app running
npm install -g pm2

# Install Nginx (Web Server)
apt install -y nginx

# Install Database (SQLite is fine for small VPS, or install PostgreSQL)
# Since you have SQLite in code, you can keep it for simple VPS deployment!
```

## 📌 Step 3: Clone Your Code
```bash
# Go to web folder
cd /var/www

# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git app

# Enter folder
cd app

# Install dependencies
npm install

# Build the app
npm run build
```

## 📌 Step 4: Start the App
Using PM2 to run Next.js in the background:

```bash
pm2 start npm --name "jobfit" -- start
pm2 save
pm2 startup
```

## 📌 Step 5: Configure Domain (Nginx)
You need to point your domain to standard web ports (80).

1. Edit Nginx config:
   ```bash
   nano /etc/nginx/sites-available/default
   ```
2. Delete everything and paste this (replace YOUR_DOMAIN):
   ```nginx
   server {
       listen 80;
       server_name jobfitproperty.com www.jobfitproperty.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Save (Ctrl+O, Enter) and Exit (Ctrl+X).
4. Restart Nginx:
   ```bash
   systemctl restart nginx
   ```

## 📌 Step 6: Add HTTPS (Security)
Install Certbot for free SSL:
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d jobfitproperty.com -d www.jobfitproperty.com
```

---

## ✅ Summary
Your site will now be live at your domain.
- **Updates:** To update the site later, run:
  ```bash
  cd /var/www/app
  git pull
  npm install
  npm run build
  pm2 restart jobfit
  ```
