# ── Stage 1: Install dependencies ────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY lib/db/package.json                ./lib/db/
COPY lib/api-zod/package.json           ./lib/api-zod/
COPY lib/api-spec/package.json          ./lib/api-spec/
COPY lib/api-client-react/package.json  ./lib/api-client-react/
COPY artifacts/api-server/package.json  ./artifacts/api-server/
COPY artifacts/amir-numerique/package.json ./artifacts/amir-numerique/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────
FROM deps AS builder

COPY . .

# Build the React frontend (BASE_PATH=/ for root-level serving)
ENV NODE_ENV=production
ENV PORT=3000
ENV BASE_PATH=/
RUN pnpm --filter @workspace/amir-numerique run build

# Build the Express API server (esbuild bundles everything)
RUN pnpm --filter @workspace/api-server run build

# Copy frontend static output into the API server dist folder
RUN cp -r artifacts/amir-numerique/dist/public artifacts/api-server/dist/public

# ── Stage 3: Production runtime ───────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Copy the fully-bundled API server (includes static files)
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Create uploads directory (persist via Docker volume)
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
