# My Lists

Personal todo/list app with tabs for Work, Shopping, and Personal. Built with React + Express + SQLite.

## Local development

```bash
# First time only
npm run setup

# Then in two terminals:
node server.js        # backend on :3001
cd client && npm run dev  # frontend on :5173 (proxies API to :3001)
```

## Production build & run

```bash
npm run setup   # installs deps + builds React
npm start       # serves everything on port 3001
```

Open `http://localhost:3001` in your browser.

---

## Deploy to Digital Ocean

### 1. Provision a droplet
Any Ubuntu droplet works. $6/mo (1GB RAM) is plenty.

### 2. Install Node.js on the droplet

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Upload the project

```bash
# From your local machine (replace with your droplet IP)
rsync -av --exclude='node_modules' --exclude='client/node_modules' --exclude='client/dist' --exclude='data.db' \
  ./ root@YOUR_IP:/opt/todo/
```

Or use `git clone` if the repo is on GitHub.

### 4. Build and start

```bash
ssh root@YOUR_IP
cd /opt/todo
npm run setup
npm start
```

The server runs on port 3001. Your data is stored in `data.db` in the project folder.

### 5. Keep it running with PM2

```bash
npm install -g pm2
pm2 start server.js --name todo
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

### 6. Expose on port 80 with nginx (optional but recommended)

```bash
sudo apt install -y nginx

# /etc/nginx/sites-available/todo
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/todo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Now access via `http://YOUR_IP` from your phone or browser.

### Tip: HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
