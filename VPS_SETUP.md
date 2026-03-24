# VPS Setup Guide — VU Mealprep App (Caddy Edition)

## What you need to install, configure, and create on your Ubuntu VPS (OVH Cloud)

---

## 1. System Updates & Prerequisites

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential sqlite3
```

## 2. Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # Should show v20.x
npm -v
```

## 3. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## 4. Firewall Setup (UFW)

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status
```

## 5. DNS Configuration

In your domain registrar (or Cloudflare, etc.), create an **A record**:

| Type | Name       | Value          |
|------|------------|----------------|
| A    | mealprep   | YOUR_VPS_IP    |

This makes `mealprep.vidalpablo.com` point to your VPS.

## 6. Clone and Install the App

```bash
cd /opt
sudo mkdir vu-mealprep && sudo chown $USER:$USER vu-mealprep
git clone https://github.com/pabloandresvidal/vu-mealprep.git vu-mealprep
cd vu-mealprep

# Install all dependencies (Next.js is a unified fullstack app)
npm install
```

## 7. Environment Variables

Create a `.env` file in the project root:

```bash
nano /opt/vu-mealprep/.env
```

Contents:

```
PORT=3000
NODE_ENV=production
NEXTAUTH_URL=https://mealprep.vidalpablo.com
NEXTAUTH_SECRET=generate-a-strong-random-string-here
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL="file:./dev.db"
```

Generate a strong NextAuth secret:

```bash
openssl rand -hex 32
```

## 8. Database Setup & Build the App

Because this app uses Prisma + SQLite, we need to initialize the local database schema and then build the Next.js application.

```bash
cd /opt/vu-mealprep

# Create SQLite database schema
npx prisma db push
npx prisma generate

# Build the Next.js production bundle
npm run build
```

## 9. Start with PM2

For Next.js apps, we start them using the `npm start` command wrapped in PM2.

```bash
cd /opt/vu-mealprep
pm2 start npm --name "vu-mealprep" -- start
pm2 save
pm2 startup   # Follow the instructions it prints
```

Verify it's running:

```bash
pm2 status
curl http://localhost:3000
```

## 10. Caddy Reverse Proxy (Multi-Domain)

Since you already use Caddy for n8n in Docker, follow these steps to add the mealprep app:

### A. Create or Update the Caddyfile
```bash
sudo nano ~/n8n-docker/Caddyfile
```
Add this configuration alongside your others:
```caddy
mealprep.vidalpablo.com {
    reverse_proxy 172.17.0.1:3000
}
```
*(If port 3000 is occupied by your budget app, change the `PORT=3000` in the `.env` to `3001` and update the proxy above to `3001` accordingly).*

### B. Update `docker-compose.yml`
*(If you already added the Caddyfile volume map for your budget app, you don't need to do anything here!)*
Open it:
```bash
sudo nano ~/n8n-docker/docker-compose.yml
```
1. **Remove** the `command:` line for Caddy if it exists.
2. **Add** this line under `volumes:` for `caddy`:
   ```yaml
     - ./Caddyfile:/etc/caddy/Caddyfile
   ```

### C. Restart Docker
```bash
cd ~/n8n-docker
sudo docker compose up -d
```
If Docker is already running, you can just reload the Caddy config:
```bash
sudo docker exec -w /etc/caddy $(sudo docker ps -qf "name=caddy") caddy reload
```

---

## 11. Verify Everything

```bash
# Check the app is running
pm2 status

# Visit in browser
# https://mealprep.vidalpablo.com
```

---

## Summary of What's Needed

| Item | What to Do |
|------|-----------|
| **Node.js 20** | Install via NodeSource |
| **PM2** | `npm install -g pm2` |
| **Caddy** | Use existing Docker setup |
| **Caddyfile** | Map `mealprep.vidalpablo.com` to port (e.g., 3000/3001) |
| **UFW** | Allow ports 22, 80, 443 |
| **DNS A Record** | `mealprep` → VPS IP |
| **.env file** | `NEXTAUTH_SECRET`, `GEMINI_API_KEY`, `DATABASE_URL` |
| **DB Sync** | `npx prisma db push` |
| **Build App** | `npm run build` |

## Useful PM2 Commands

```bash
pm2 status            # Check status
pm2 logs vu-mealprep  # View logs
pm2 restart vu-mealprep  # Restart app
```

## Updating the App

```bash
cd /opt/vu-mealprep
git pull origin main
npm install
npx prisma db push
npm run build
pm2 restart vu-mealprep
```
