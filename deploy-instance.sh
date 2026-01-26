#!/bin/bash

# Script de déploiement automatisé d'une instance Odoo
# Usage: ./deploy-instance.sh <nom_instance> [domaine]

set -e

INSTANCE_NAME="${1}"
DOMAIN="${2:-${INSTANCE_NAME}.localhost}"
PORT="${3:-8070}"
DB_NAME="${INSTANCE_NAME}"
DB_USER="${INSTANCE_NAME}"
DB_PASSWORD="$(openssl rand -hex 16)"

if [ -z "${INSTANCE_NAME}" ]; then
    echo "❌ Erreur: Vous devez fournir un nom d'instance"
    echo "Usage: $0 <nom_instance> [domaine]"
    exit 1
fi

echo "🚀 Déploiement de l'instance Odoo: ${INSTANCE_NAME}"
echo "📋 Configuration:"
echo "   - Nom: ${INSTANCE_NAME}"
echo "   - Domaine: ${DOMAIN}"
echo "   - Port: ${PORT}"
echo "   - Base de données: ${DB_NAME}"
echo ""

# Créer le répertoire pour l'instance
INSTANCE_DIR="./instances/${INSTANCE_NAME}"
mkdir -p "${INSTANCE_DIR}"

# Créer le docker-compose pour cette instance
cat > "${INSTANCE_DIR}/docker-compose.yml" <<EOF
version: "3.8"

services:
  db_${INSTANCE_NAME}:
    image: postgres:16
    container_name: odoo_db_${INSTANCE_NAME}
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - ${INSTANCE_NAME}_db_data:/var/lib/postgresql/data
    networks:
      - odoo_network

  odoo_${INSTANCE_NAME}:
    image: odoo:18
    container_name: odoo_${INSTANCE_NAME}
    depends_on:
      - db_${INSTANCE_NAME}
    environment:
      HOST: db_${INSTANCE_NAME}
      PORT: 5432
      USER: ${DB_USER}
      PASSWORD: ${DB_PASSWORD}
      PGDATABASE: ${DB_NAME}
    ports:
      - "${PORT}:8069"
    volumes:
      - ${INSTANCE_NAME}_data:/var/lib/odoo
      - ../../addons:/mnt/extra-addons
    networks:
      - odoo_network

volumes:
  ${INSTANCE_NAME}_db_data:
  ${INSTANCE_NAME}_data:

networks:
  odoo_network:
    external: true
EOF

# Créer le réseau Docker si nécessaire
docker network create odoo_network 2>/dev/null || true

echo "✅ Configuration créée dans ${INSTANCE_DIR}/docker-compose.yml"
echo ""
echo "🚀 Démarrage de l'instance..."
cd "${INSTANCE_DIR}"
docker compose up -d

echo "⏳ Attente du démarrage de la base de données..."
sleep 5

# Attendre que PostgreSQL soit prêt
echo "⏳ Initialisation de la base de données Odoo..."
MAX_RETRIES=30
RETRY=0
INIT_SUCCESS=false
while [ ${RETRY} -lt ${MAX_RETRIES} ]; do
    if docker exec odoo_${INSTANCE_NAME} odoo --stop-after-init -d ${DB_NAME} -r ${DB_USER} -w ${DB_PASSWORD} --db_host=db_${INSTANCE_NAME} --db_port=5432 -i base >/dev/null 2>&1; then
        echo "✅ Base de données initialisée avec succès!"
        INIT_SUCCESS=true
        break
    fi
    RETRY=$((RETRY + 1))
    if [ ${RETRY} -lt ${MAX_RETRIES} ]; then
        echo "   Tentative ${RETRY}/${MAX_RETRIES}..."
        sleep 2
    fi
done

if [ "${INIT_SUCCESS}" != "true" ]; then
    echo "⚠️  L'initialisation automatique a échoué. Initialisez manuellement:"
    echo "   docker exec odoo_${INSTANCE_NAME} odoo --stop-after-init -d ${DB_NAME} -r ${DB_USER} -w ${DB_PASSWORD} --db_host=db_${INSTANCE_NAME} --db_port=5432 -i base"
else
    # Redémarrer le conteneur Odoo pour qu'il démarre normalement
    echo "🔄 Redémarrage du conteneur Odoo..."
    docker restart odoo_${INSTANCE_NAME} >/dev/null 2>&1
    sleep 3
fi

echo ""
echo "✅ Instance déployée et prête!"
echo ""
echo "🔐 Informations de connexion:"
echo "   - Base de données: ${DB_NAME}"
echo "   - Utilisateur DB: ${DB_USER}"
echo "   - Mot de passe DB: ${DB_PASSWORD}"
echo "   - URL: http://localhost:${PORT}"
echo ""
echo "📝 Accédez à l'URL pour finaliser la configuration (créer votre compte admin)"
echo ""