#NOTE: Dockerfile con multi-stage builid

#================================================
#--------------------Builder---------------------
#================================================


FROM  node:20-alpine AS builder

WORKDIR /app


#NOTE: caching

COPY package*.json ./

#NOTE: uso de npm ci para realizar clean install (se basa en el package-lock.json)

RUN npm ci --omit=dev


#================================================
#---------------------Runner---------------------
#================================================

FROM node:20-alpine AS runner

WORKDIR /app

#NOTE: definimos entorno de produccion

ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]






