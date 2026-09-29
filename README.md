# Khuli Kitab (Open Book) 🏛️📖

Khuli Kitab is a high-performance RAG (Retrieval-Augmented Generation) application designed to turn your documents and Google Drive folders into a searchable, interactive knowledge base. Built with a premium, ChatGPT-like interface, it features smart deduplication, persistent chat history, and session-aware rate limiting.

---

## 🚀 Key Features

- **Multi-Source Ingestion**: Support for local PDFs, Word (.docx), and TXT files, plus direct integration with **Google Drive** (folders and individual files).
- **Smart Deduplication**: content-hashing logic that ensures unchanged documents aren't re-processed, saving API costs and database space.
- **Persistent Chat History**: Conversations are stored in **MongoDB Atlas**, allowing users to resume chats across sessions.
- **Advanced RAG Architecture**: Powered by **Google Gemini 2.5 Flash-Lite** and Gemini Embeddings for fast, accurate, and context-aware responses.
- **Session-Aware Rate Limiting**: Security layer limiting users to 25 queries per hour per session.
- **Premium UI/UX**: Responsive Next.js frontend with Shadcn UI, including dark mode, markdown support, and mobile optimization.

---

## 🛠️ Technology Stack

### Backend

- **Framework**: FastAPI (Asynchronous Python)
- **Orchestration**: LangChain
- **Vector Database**: ChromaDB (with persistent storage)
- **LLM & Embeddings**: Google Gemini API (`gemini-2.5-flash-lite` & `gemini-embedding-001`, configurable via `GOOGLE_MODEL` / `GOOGLE_EMBEDDING_MODEL`)
- **Database**: MongoDB Atlas (History Persistence)
- **Document Processing**: PyPDF, docx2txt

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Components**: Shadcn UI & Radix UI
- **Icons**: Lucide React
- **Markdown**: React-Markdown with GFM

---

## 🏗️ RAG Implementation Details

The Khuli Kitab RAG pipeline follows a structured flow:

1.  **Ingestion & Hashing**: Documents are loaded and split into chunks. Each chunk is assigned a unique ID based on `Source:Page:ChunkIndex` and an MD5 hash of its content.
2.  **Smart Upsert**: Before embedding, the system checks ChromaDB.
    - If ID + Hash match: Skip.
    - If ID matches but Hash differs: Update (Delete old + Add new).
    - If New ID: Add.
3.  **Retrieval**: Uses semantic search to find the most relevant context for a user query.
4.  **Generation**: The context is passed to Gemini with a custom system prompt that enforces professional behavior and uses the "Akshat" persona.

---

## 📋 API Endpoints

### Ingestion Endpoints

- `POST /ingest/file`: Upload a local file (`.pdf`, `.docx`, `.txt`).
- `POST /ingest/google-drive`: Ingest an entire Google Drive folder via folder ID.
- `POST /ingest/google-drive/file`: Ingest a single Google Drive file via file ID.

### Query & History Endpoints

- `POST /query`: Semantic search query. Automatically saves to history and enforces rate limits.
- `GET /chat/history/{session_id}`: Fetch previous messages for a session.
- `DELETE /chat/history/{session_id}`: Clear message history for a session.

### Maintenance Endpoints

- `GET /health`: System health check.
- `POST /database/clean`: Resets the ChromaDB vector store.

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account
- Google Cloud Project (for Gemini & Drive API)

### 2. Environment Variables

#### Backend (`/backend/.env`)

| Variable          | Description             | Where to get it                                                |
| :---------------- | :---------------------- | :------------------------------------------------------------- |
| `GOOGLE_API_KEY`  | Gemini API Key          | [Google AI Studio](https://aistudio.google.com/app/apikey)     |
| `MONGODB_URI`     | Mongo Connection String | [MongoDB Atlas Dashboard](https://www.mongodb.com/cloud/atlas) |
| `MONGODB_DB_NAME` | Database name           | Optional (Defaults to `khuli_kitab`)                           |

#### Frontend (`/frontend/.env`)

| Variable                  | Description | Value                   |
| :------------------------ | :---------- | :---------------------- |
| `NEXT_PUBLIC_API_URL`     | Backend URL | `http://localhost:5000` |
| `NEXT_PUBLIC_ENVIRONMENT` | UI Mode     | `dev` or `prod`         |

### 3. Google Drive Setup

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Enable the **Google Drive API**.
3.  Create a **Service Account** and download the `credentials.json` file.
4.  Place `credentials.json` in the `/backend/` directory.
5.  Share your Google Drive folders with the Service Account email.

### 4. Running the Application

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

> **macOS:** port `5000` is taken by AirPlay Receiver. Run on another port and point the frontend at it:
> `FLASK_PORT=5001 FRONTEND_ORIGIN=http://localhost:3000 python app.py`, then
> `NEXT_PUBLIC_API_URL=http://localhost:5001 npm run dev`.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🚢 Production Deployment (OCI + Docker + Nginx + DuckDNS)

The production setup:

```
Browser ──HTTPS──► Vercel (Next.js frontend)
   │
   └──HTTPS──► khuli-kitab.duckdns.org ──► OCI VM
                                           ├─ iptables (80, 443 open)
                                           ├─ Nginx :443 (TLS from Let's Encrypt)
                                           │     └─ proxy_pass → 127.0.0.1:5000
                                           └─ Docker: khuli-kitab-backend :5000 (FastAPI)
                                                 ├─ ./backend/chroma_db  (vector store, bind mount)
                                                 └─ MongoDB Atlas        (chat history, external)
```

| Piece | Where it runs | Port |
| :--- | :--- | :--- |
| Backend (FastAPI) | Docker container on the OCI VM | `5000` (localhost only) |
| Reverse proxy + HTTPS | Nginx on the OCI VM (system service) | `80`, `443` |
| Domain | DuckDNS → VM public IP | — |
| Frontend (Next.js) | Vercel | — |
| Chat history | MongoDB Atlas | — |
| CI/CD | GitHub Actions → SSH → `docker compose` | — |

> ⚠️ **Security note:** The backend has no authentication. Anyone who can reach it can call
> `POST /database/clean`, `DELETE /collection/reset` and `/ingest/*`. Never expose port `5000`
> directly to the internet, and block admin routes at Nginx (see step 7).

---

### Step 1 — Create the OCI compute instance

1. OCI Console → **Compute → Instances → Create instance**.
2. **Image:** Canonical Ubuntu 22.04 / 24.04. **Shape:** Ampere `VM.Standard.A1.Flex` (Always Free, ARM) with at least 1 OCPU / 6 GB RAM is comfortable. ChromaDB and LangChain need more than the 1 GB of the `E2.1.Micro` shape.
3. **Networking:** use a public subnet and tick **Assign a public IPv4 address**.
4. **SSH keys:** upload your public key (see step 2) or let OCI generate a key pair and download the private key.
5. **(Recommended) Reserve the public IP:** Networking → IP Management → Reserved Public IPs. Attach it to the instance's VNIC. With a reserved IP, the address never changes, even if the instance is stopped and started.

### Step 2 — SSH access

On your local machine:

```bash
# Generate a key (skip if OCI generated one for you)
ssh-keygen -t ed25519 -f ~/.ssh/oci_khuli_kitab -C "khuli-kitab-oci"

# If OCI gave you the private key, move it and lock down permissions (ssh refuses keys that are too open)
mv ~/Downloads/ssh-key-*.key ~/.ssh/oci_khuli_kitab
chmod 400 ~/.ssh/oci_khuli_kitab
```

Add a shortcut to `~/.ssh/config`:

```
Host khuli-kitab
    HostName <VM_PUBLIC_IP>
    User ubuntu
    IdentityFile ~/.ssh/oci_khuli_kitab
```

Now connect with:

```bash
ssh khuli-kitab
```

The default user is `ubuntu` on Ubuntu images (`opc` on Oracle Linux).

### Step 3 — Open the firewall (two layers)

OCI has **two** firewalls, and **both** must allow traffic.

**a) VCN Security List (cloud firewall)**
OCI Console → Networking → Virtual Cloud Networks → your VCN → Subnet → Security List → **Add Ingress Rules**:

| Source CIDR | Protocol | Destination port |
| :--- | :--- | :--- |
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |

Port `22` is open by default. **Do not** add port `5000`.

**b) iptables on the VM (host firewall)**
Oracle's Ubuntu images ship with iptables rules that allow only SSH and end with a `REJECT` rule:

```bash
sudo iptables -L INPUT -n --line-numbers
# 1 ACCEPT ... RELATED,ESTABLISHED
# 2 ACCEPT icmp
# 3 ACCEPT lo
# 4 ACCEPT tcp dpt:22
# 5 REJECT ... reject-with icmp-host-prohibited
```

Insert the HTTP/HTTPS rules **above** the `REJECT` line (position 5), then **save** them so they survive reboots:

```bash
sudo iptables -I INPUT 5 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 5 -m state --state NEW -p tcp --dport 80  -j ACCEPT

sudo apt install -y iptables-persistent   # if not already installed
sudo netfilter-persistent save
```

Verify the listing shows `22`, `80`, `443` ACCEPT rules before the `REJECT`:

```bash
sudo iptables -L INPUT -n --line-numbers
```

> Do not run `ufw enable` on OCI images. It conflicts with the preconfigured iptables rules and can lock you out of SSH.

### Step 4 — DuckDNS (free domain)

1. Sign in at [duckdns.org](https://www.duckdns.org), create the subdomain `khuli-kitab`, and set its IP to the VM's public IP. Copy your **token** from the dashboard.
2. Check that the domain resolves (from any machine):

   ```bash
   dig +short khuli-kitab.duckdns.org   # should print the VM public IP
   ```

3. **Keep the IP updated automatically.** This is required unless you reserved the IP in step 1. On the VM:

   ```bash
   mkdir -p ~/duckdns && cd ~/duckdns
   cat > duck.sh <<'EOF'
   echo url="https://www.duckdns.org/update?domains=khuli-kitab&token=<YOUR_DUCKDNS_TOKEN>&ip=" | curl -k -o ~/duckdns/duck.log -K -
   EOF
   chmod 700 duck.sh
   ./duck.sh && cat duck.log   # should print OK

   # Run every 5 minutes and at boot
   (crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1"; echo "@reboot ~/duckdns/duck.sh >/dev/null 2>&1") | crontab -
   ```

   Keep the DuckDNS token secret. It controls where your domain points.

### Step 5 — Install Docker, Git and the app

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl

# Docker Engine + Compose v2 plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo systemctl enable --now docker containerd   # start Docker on every boot
exit   # log out and back in so the docker group applies
```

Clone the repo into the path the CI workflow expects (`OCI_APP_PATH` in `.github/workflows/deploy.yml`):

```bash
ssh khuli-kitab
git clone https://github.com/Akshatjainbafna/Khuli-kitab.git /home/ubuntu/Khuli-kitab
```

> If the repo is private, add a [deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) on the VM (`ssh-keygen -t ed25519`, paste the `.pub` into GitHub → Settings → Deploy keys) and clone with the `git@github.com:...` URL.

**Copy the secrets.** They are gitignored and never come from Git. From your **local** machine:

```bash
scp backend/.env backend/credentials.json backend/token.json \
    khuli-kitab:/home/ubuntu/Khuli-kitab/backend/
```

All three files must exist **before** the first `docker compose up`. `docker-compose.yml` bind-mounts `credentials.json` and `token.json`. If they are missing, Docker creates empty *directories* with those names, and Google Drive ingestion breaks. To fix that, `rm -rf` the directories and copy the real files.

Production values in `backend/.env` on the server:

| Variable | Production value |
| :--- | :--- |
| `GOOGLE_API_KEY` | your Gemini key |
| `GOOGLE_MODEL` | e.g. `gemini-2.5-flash-lite` |
| `GOOGLE_EMBEDDING_MODEL` | `models/gemini-embedding-001`. Changing it later requires re-ingesting all documents |
| `MONGODB_URI` | Atlas connection string |
| `FRONTEND_ORIGIN` | the **exact** frontend URL, e.g. `https://khuli-kitab.vercel.app` (no trailing slash). It is the only origin CORS allows |
| `CHROMA_PERSIST_DIRECTORY` | `./chroma_db` |
| `ENABLE_NGROK` | `false` (not needed behind Nginx) |

**MongoDB Atlas:** Atlas → Network Access → **Add IP Address** → add the VM's public IP. Without this, the backend cannot store chat history.

### Step 6 — Start the backend

In `docker-compose.yml`, make sure the backend is published **only on localhost**, so the internet can reach it only through Nginx:

```yaml
    ports:
      - '127.0.0.1:5000:5000'
```

> Docker-published ports bypass the iptables `INPUT` rules from step 3. `'5000:5000'` would expose the unauthenticated backend publicly over plain HTTP. Commit this change to the repo. The CI deploy runs `git reset --hard`, which wipes uncommitted edits on the server.

```bash
cd /home/ubuntu/Khuli-kitab
docker compose up -d --build backend
docker compose ps                    # STATUS should be "Up"
docker compose logs -f backend       # Ctrl+C to exit
curl http://127.0.0.1:5000/health    # {"status":"healthy",...}
```

`restart: unless-stopped` in `docker-compose.yml` brings the container back automatically after crashes and reboots, as long as Docker is enabled at boot (step 5).

### Step 7 — Nginx reverse proxy + HTTPS (Let's Encrypt)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx
```

Create `/etc/nginx/sites-available/khuli-kitab`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name khuli-kitab.duckdns.org;

    # Upload limit for /ingest/file (PDF, DOCX, ...)
    client_max_body_size 50M;

    # Block destructive admin endpoints from the public internet.
    # Call them from the VM itself instead: curl -X POST http://127.0.0.1:5000/database/clean
    location ~ ^/(database/clean|collection/reset) {
        return 403;
    }

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # LLM answers and document ingestion can be slow
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

Enable it, then let Certbot get a certificate and add the HTTPS (`443`) block plus the HTTP→HTTPS redirect:

```bash
sudo ln -s /etc/nginx/sites-available/khuli-kitab /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d khuli-kitab.duckdns.org --redirect -m <your-email> --agree-tos
```

Certificates are valid for 90 days. Certbot installs a systemd timer that renews them automatically:

```bash
sudo systemctl status certbot.timer   # should be "active (waiting)"
sudo certbot renew --dry-run          # test renewal
```

Verify from **your local machine**:

```bash
curl -I https://khuli-kitab.duckdns.org/health    # HTTP/1.1 200
```

### Step 8 — Frontend on Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com) and set **Root Directory** to `frontend`.
2. Project → Settings → Environment Variables:

   | Variable | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://khuli-kitab.duckdns.org` |
   | `NEXT_PUBLIC_ENVIRONMENT` | `prod` |

3. **Redeploy** after changing these. `NEXT_PUBLIC_*` values are baked in at build time.
4. Put the resulting Vercel URL into `FRONTEND_ORIGIN` in the server's `backend/.env`, then run `docker compose up -d backend` to apply it.

> The API URL **must** be `https://`. A page served over HTTPS (Vercel) cannot call an `http://` backend. Browsers block it as mixed content.

<details>
<summary>Alternative: host the frontend on the same VM</summary>

1. Uncomment the `frontend` service in `docker-compose.yml`. Set its build arg `NEXT_PUBLIC_API_URL: https://khuli-kitab.duckdns.org` and its port to `'127.0.0.1:3000:3000'`.
2. Add a second DuckDNS subdomain (e.g. `khuli-kitab-app`) or serve the API under a path.
3. Add an Nginx server block that runs `proxy_pass http://127.0.0.1:3000;` for that hostname, then run `certbot --nginx -d <that-hostname>`.
4. Set `FRONTEND_ORIGIN=https://<that-hostname>` and run `docker compose up -d --build`.

</details>

### Step 9 — CI/CD with GitHub Actions

`.github/workflows/deploy.yml` deploys the backend on every **push to `master`**. You can also run it manually (Actions → "Deploy to OCI" → Run workflow). The workflow SSHes into the VM and runs:

```bash
cd /home/ubuntu/Khuli-kitab
git fetch origin && git reset --hard origin/master
docker compose down backend
docker compose build backend --no-cache
docker compose up -d backend
docker image prune -f
```

Add these secrets in GitHub → **Settings → Secrets and variables → Actions**:

| Secret | Value |
| :--- | :--- |
| `OCI_HOST` | VM public IP (or `khuli-kitab.duckdns.org`) |
| `OCI_SSH_USER` | `ubuntu` |
| `OCI_SSH_PRIVATE_KEY` | full contents of `~/.ssh/oci_khuli_kitab`, including the `BEGIN`/`END` lines |

The public half of that key must be in `/home/ubuntu/.ssh/authorized_keys` on the VM. It already is if you log in with it.

Data kept across deploys: `backend/chroma_db/`, `backend/uploads/`, `.env`, `credentials.json` and `token.json` are gitignored and bind-mounted. `git reset --hard` and container rebuilds therefore leave them in place.

---

### 🔁 After a VM reboot — bring everything back

If steps 3, 5 and 7 were done correctly (`netfilter-persistent save`, `systemctl enable docker nginx`), everything comes back on its own. To check, or to recover manually:

```bash
ssh khuli-kitab

# 1. Docker + backend
sudo systemctl start docker
cd ~/Khuli-kitab && docker compose up -d backend
curl http://127.0.0.1:5000/health

# 2. Nginx
sudo nginx -t && sudo systemctl start nginx
sudo ss -tlnp | grep -E ':(80|443) '        # nginx must be listening

# 3. Firewall — 80/443 ACCEPT rules must be above REJECT
sudo iptables -L INPUT -n --line-numbers
sudo netfilter-persistent reload             # restore saved rules if missing

# 4. DuckDNS still points at this VM?
curl -s ifconfig.me; echo; dig +short khuli-kitab.duckdns.org
```

Final check from your laptop: `curl -I https://khuli-kitab.duckdns.org/health`.

Make sure these survive the *next* reboot:

```bash
sudo systemctl enable docker containerd nginx
sudo netfilter-persistent save
crontab -l | grep duck        # DuckDNS updater present
```

### 🩺 Troubleshooting

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| `https://…duckdns.org` → *connection refused*, but Nginx is running and `curl 127.0.0.1:5000/health` works | iptables rules for 80/443 lost (not saved before reboot) | Step 3b: re-insert above `REJECT`, then `netfilter-persistent save` |
| *Connection timed out* on 80/443 | VCN Security List missing ingress rules | Step 3a |
| `ss` shows nothing on 80/443 | Nginx stopped or failed | `sudo nginx -t`, `sudo journalctl -u nginx -n 50`, `sudo systemctl enable --now nginx` |
| Nginx: `bind() to 0.0.0.0:80 failed (98: Address already in use)` | Another process (Apache, a container) holds port 80 | `sudo ss -tlnp \| grep :80`, stop it |
| `502 Bad Gateway` | Backend container down | `docker compose ps`, `docker compose logs backend`, `docker compose up -d backend` |
| Container starts then exits; Mongo errors in logs | VM IP not allowed in Atlas, or IP changed | Atlas → Network Access → add current IP |
| Domain resolves to an old IP | IP changed, DuckDNS not updated | Run `~/duckdns/duck.sh`; check the cron job; reserve the IP in OCI |
| Browser: *CORS policy* error | `FRONTEND_ORIGIN` doesn't exactly match the frontend URL | Fix `.env` (scheme, no trailing slash), `docker compose up -d backend` |
| Browser: *Mixed Content* error | `NEXT_PUBLIC_API_URL` uses `http://` | Use `https://…`, redeploy on Vercel |
| `413 Request Entity Too Large` on upload | Nginx body limit | Increase `client_max_body_size`, `sudo systemctl reload nginx` |
| `504 Gateway Timeout` on long queries/ingestion | Nginx proxy timeout | Increase `proxy_read_timeout` |
| Mount error for `credentials.json` / `token.json`, or Drive ingestion fails | Files missing, so Docker created directories | `rm -rf` the directories, `scp` the real files, restart |
| HTTPS certificate expired | Renewal failed (Nginx was down, or port 80 blocked) | `sudo certbot renew`, check `certbot.timer` |
| CI deploy fails at SSH step | Wrong `OCI_HOST` / key secret, or IP changed | Update GitHub secrets; test `ssh khuli-kitab` locally |

### Useful commands

```bash
docker compose ps                         # container status
docker compose logs -f --tail=100 backend # live backend logs
docker compose restart backend            # restart after .env change (use `up -d` to re-read env_file)
docker compose up -d --build backend      # rebuild after code change (manual deploy)
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
sudo systemctl reload nginx               # apply Nginx config changes (run `nginx -t` first)
sudo certbot certificates                 # certificate expiry dates
df -h && docker system df                 # disk usage (prune with `docker image prune -f`)
```

---

## 🛡️ Rate Limiting & Auto-Response

The system allows **25 requests per hour** per unique browser session. When the limit is reached, it automatically responds with:

> _"You have exceeded the rate limit. Please provide your email id, linkedin profile or any other contact..."_

---

## 📝 License

Created by **Akshat Jain**. Feel free to get in touch on [LinkedIn](https://www.linkedin.com/in/akshat-jain-571435139/) or via [Email](mailto:akshatbjain.aj@gmail.com).
