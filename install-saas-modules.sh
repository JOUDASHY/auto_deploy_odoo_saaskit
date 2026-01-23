#!/bin/bash

# Script d'installation des modules Odoo SAAS Tools
# Ce script télécharge et installe les modules nécessaires pour le déploiement automatisé

set -e

PROJECT_DIR="/home/nilsen-un-it/odoo-saas-project"
ADDONS_DIR="${PROJECT_DIR}/addons"
TMP_DIR="/tmp/odoo-saas-install"

echo "🚀 Installation des modules Odoo SAAS Tools..."

# Créer le répertoire addons s'il n'existe pas
mkdir -p "${ADDONS_DIR}"

# Nettoyer le répertoire temporaire
rm -rf "${TMP_DIR}"
mkdir -p "${TMP_DIR}"

# Cloner odoo-saas-tools
echo "📦 Téléchargement de odoo-saas-tools..."
cd "${TMP_DIR}"
git clone https://github.com/it-projects-llc/odoo-saas-tools.git || {
    echo "⚠️  Erreur lors du clonage. Tentative avec saas-addons (version plus récente)..."
    git clone https://github.com/it-projects-llc/saas-addons.git odoo-saas-tools
}

# Copier les modules essentiels dans addons
echo "📋 Copie des modules essentiels..."

# Modules de base nécessaires
ESSENTIAL_MODULES=(
    "saas_base"
    "saas_server"
    "saas_portal"
    "saas_client"
    "saas_utils"
    "auth_oauth_ip"
    "oauth_provider"
)

for module in "${ESSENTIAL_MODULES[@]}"; do
    if [ -d "${TMP_DIR}/odoo-saas-tools/${module}" ]; then
        echo "  ✓ Copie de ${module}..."
        cp -r "${TMP_DIR}/odoo-saas-tools/${module}" "${ADDONS_DIR}/" || {
            echo "  ⚠️  Impossible de copier ${module} (permissions?)"
            echo "  💡 Essayez: sudo cp -r ${TMP_DIR}/odoo-saas-tools/${module} ${ADDONS_DIR}/"
        }
    else
        echo "  ⚠️  Module ${module} non trouvé"
    fi
done

# Nettoyer
rm -rf "${TMP_DIR}"

echo ""
echo "✅ Installation terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Redémarrez votre conteneur Docker: docker-compose restart odoo"
echo "   2. Connectez-vous à Odoo (http://localhost:8069)"
echo "   3. Activez le mode développeur"
echo "   4. Installez les modules: saas_base, saas_server, saas_portal"
echo ""
