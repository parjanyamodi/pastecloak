# 🔒 PasteCloak

A modern, privacy-focused pastebin alternative with end-to-end encryption capabilities. Built with Next.js 16, React 19, Drizzle ORM, and PostgreSQL.

![PasteCloak](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **🔐 Password Protection** - Secure pastes with passwords
- **🔥 Burn After Reading** - Self-destructing pastes after first view
- **💬 Discussions** - Enable comments on shared pastes
- **⏱️ Expiration** - Set custom expiration times
- **📝 Multiple Formats** - Plain text, source code, and Markdown
- **🎨 Modern UI** - Glass morphism design with animated backgrounds
- **🌙 Dark Mode** - Beautiful dark theme by default
- **📱 Responsive** - Works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm 8.0.0 or higher
- PostgreSQL 15 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/parjanyamodi/pastecloak.git
   cd pastecloak
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cd apps/pastecloak
   cp .env.example .env
   ```
   
   Edit `.env` with your database connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pastecloak"
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   cd ../..
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Self-Hosting with Docker

### Using Docker Compose (Recommended)

1. **Create a `docker-compose.yml`**
   ```yaml
   version: '3.8'
   
   services:
     pastecloak:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://pastecloak:pastecloak@db:5432/pastecloak
         - NODE_ENV=production
       depends_on:
         db:
           condition: service_healthy
       restart: unless-stopped
   
     db:
       image: postgres:15-alpine
       environment:
         - POSTGRES_USER=pastecloak
         - POSTGRES_PASSWORD=pastecloak
         - POSTGRES_DB=pastecloak
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U pastecloak"]
         interval: 5s
         timeout: 5s
         retries: 5
       restart: unless-stopped
   
   volumes:
     postgres_data:
   ```

2. **Create a `Dockerfile`**
   ```dockerfile
   FROM node:20-alpine AS base
   
   # Install pnpm
   RUN corepack enable && corepack prepare pnpm@8 --activate
   
   # Dependencies stage
   FROM base AS deps
   WORKDIR /app
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   COPY apps/pastecloak/package.json ./apps/pastecloak/
   RUN pnpm install --frozen-lockfile
   
   # Build stage
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY --from=deps /app/apps/pastecloak/node_modules ./apps/pastecloak/node_modules
   COPY . .
   ENV NEXT_TELEMETRY_DISABLED 1
   RUN pnpm --filter pastecloak build
   
   # Production stage
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/apps/pastecloak/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/apps/pastecloak/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/apps/pastecloak/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
   ```

3. **Build and run**
   ```bash
   docker-compose up -d
   ```

### Manual Docker Setup

```bash
# Build the image
docker build -t pastecloak .

# Run PostgreSQL
docker run -d \
  --name pastecloak-db \
  -e POSTGRES_USER=pastecloak \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=pastecloak \
  -v pastecloak_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Run PasteCloak
docker run -d \
  --name pastecloak \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://pastecloak:your_secure_password@pastecloak-db:5432/pastecloak" \
  --link pastecloak-db \
  pastecloak
```

## 🖥️ Self-Hosting on VPS

### Ubuntu/Debian

1. **Install dependencies**
   ```bash
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install pnpm
   corepack enable
   corepack prepare pnpm@8 --activate
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   ```

2. **Set up PostgreSQL**
   ```bash
   sudo -u postgres psql
   
   # In psql:
   CREATE USER pastecloak WITH PASSWORD 'your_secure_password';
   CREATE DATABASE pastecloak OWNER pastecloak;
   \q
   ```

3. **Clone and configure**
   ```bash
   git clone https://github.com/parjanyamodi/pastecloak.git
   cd pastecloak
   pnpm install
   
   # Set up environment
   cd apps/pastecloak
   echo 'DATABASE_URL="postgresql://pastecloak:your_secure_password@localhost:5432/pastecloak"' > .env
   
   # Push database schema
   pnpm db:push
   
   # Build for production
   cd ../..
   pnpm build
   ```

4. **Set up PM2 for process management**
   ```bash
   npm install -g pm2
   
   # Start the app
   pm2 start pnpm --name "pastecloak" -- start
   
   # Save PM2 config
   pm2 save
   pm2 startup
   ```

5. **Set up Nginx reverse proxy**
   ```nginx
   # /etc/nginx/sites-available/pastecloak
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/pastecloak /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Set up SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 📊 Database Management

### Drizzle Commands

```bash
# Generate migrations
pnpm db:generate

# Push schema changes (development)
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Database Schema

The application uses three main tables:

- **pastes** - Stores paste content with metadata
- **comments** - Stores discussions for pastes
- **attachments** - Stores file attachments (base64 encoded)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NODE_ENV` | Environment mode | `development` |

### Next.js Configuration

The app is configured for optimal production use in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployments
}

module.exports = nextConfig
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI**: [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Monorepo**: [Turborepo](https://turbo.build/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📁 Project Structure

```
pastecloak/
├── apps/
│   └── pastecloak/          # Main Next.js application
│       ├── prisma/          # Database migrations
│       ├── src/
│       │   ├── app/         # Next.js app router pages
│       │   │   ├── api/     # API routes
│       │   │   └── components/
│       │   ├── components/  # UI components (shadcn/ui)
│       │   ├── db/          # Drizzle schema & connection
│       │   └── lib/         # Utility functions
│       └── drizzle.config.ts
├── packages/                # Shared packages (future use)
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace config
└── package.json            # Root package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [PrivateBin](https://privatebin.net/)
- Built with modern web technologies
- Thanks to all contributors!

---

**Made with ❤️ by [Parjanya Modi](https://github.com/parjanyamodi)**
