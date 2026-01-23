# 📚 Documentation Complète : Déploiement Odoo SAAS avec Docker

## 🎯 Vue d'ensemble

Ce guide vous permet de créer un système complet de déploiement automatisé d'instances Odoo en utilisant les modules SAAS-KIT (gratuits, open source) et Docker.

---

## 📋 Prérequis

- Linux (Ubuntu/Debian recommandé)
- Docker installé
- Docker Compose installé (ou `docker compose` intégré)
- Git installé
- Au moins 10 Go d'espace disque libre

### Vérifier l'installation

```bash
docker --version
docker compose version
git --version
```

---

## 🚀 Étape 1 : Créer la structure du projet

```bash
# Créer le répertoire du projet
mkdir -p ~/odoo-saas-project
cd ~/odoo-saas-project

# Créer les répertoires nécessaires
mkdir -p addons
mkdir -p data
mkdir -p instances
mkdir -p saas-modules
```

---

## 🐳 Étape 2 : Créer le docker-compose.yml pour l'instance maître

Créez le fichier `docker-compose.yml` :

```yaml
version: "3.8"

services:
  db:
    image: postgres:15
    container_name: odoo_db
    environment:
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo
      POSTGRES_DB: postgres
    volumes:
      - odoo_db_data:/var/lib/postgresql/data

  odoo:
    image: odoo:16
    container_name: odoo_base
    depends_on:
      - db
    environment:
      HOST: db
      PORT: 5432
      USER: odoo
      PASSWORD: odoo
      PGDATABASE: postgres
    ports:
      - "8069:8069"
    volumes:
      - odoo_data:/var/lib/odoo
      - ./addons:/mnt/extra-addons
      - ./saas-modules/odoo-saas-tools:/mnt/extra-addons-saas
    command: ["odoo", "--addons-path=/usr/lib/python3/dist-packages/odoo/addons,/mnt/extra-addons-saas", "--dev=reload"]

volumes:
  odoo_db_data:
  odoo_data:
```

**Note importante** : Le chemin `/mnt/extra-addons` n'est pas utilisé si le répertoire est vide, donc on ne l'inclut pas dans `--addons-path`.

---

## 📦 Étape 3 : Télécharger les modules SAAS

```bash
cd ~/odoo-saas-project/saas-modules
git clone https://github.com/it-projects-llc/odoo-saas-tools.git
```

Attendez que le clonage se termine (environ 65 Mo).

---

## 🔧 Étape 4 : Adapter les modules pour Odoo 16

Les modules sont pour Odoo 11.0, il faut les adapter pour Odoo 16 :

```bash
cd ~/odoo-saas-project/saas-modules/odoo-saas-tools

# Mettre à jour toutes les versions dans les __manifest__.py
find . -name "__manifest__.py" -exec sed -i "s/'version': '11.0/'version': '16.0/g" {} \;

# Vérifier que la modification a fonctionné
grep -r "'version': '16.0" */__manifest__.py | head -3
```

---

## 🚀 Étape 5 : Démarrer l'instance maître

```bash
cd ~/odoo-saas-project

# Créer le réseau Docker si nécessaire
docker network create odoo_network 2>/dev/null || true

# Démarrer les conteneurs
docker compose up -d

# Vérifier que tout fonctionne
docker ps --filter "name=odoo"
```

Attendez 30-60 secondes que Odoo démarre complètement.

---

## 🌐 Étape 6 : Accéder à Odoo et créer la base de données

1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:8069**

### Si c'est la première fois :
- Créez votre base de données :
  - **Nom de la base** : `odoo_test` (ou autre nom)
  - **Email** : votre email
  - **Mot de passe** : votre mot de passe admin
  - **Langue** : Français (ou autre)
  - **Pays** : Votre pays
- Cliquez sur **Créer la base de données**

### Si la base existe déjà :
- Connectez-vous avec vos identifiants

---

## 🔧 Étape 7 : Activer le mode développeur

1. Dans Odoo, allez dans **Paramètres** (icône engrenage en haut à droite)
2. En bas de la page, cliquez sur **"Activer le mode développeur"**
3. Ou : **Paramètres → Technique → Activer le mode développeur**

**Alternative via la base de données** (si le bouton n'apparaît pas) :

```bash
# Remplacer odoo_test par le nom de votre base de données
docker exec odoo_db psql -U odoo -d odoo_test -c "INSERT INTO ir_config_parameter (key, value) SELECT 'base.developer_mode', '1' WHERE NOT EXISTS (SELECT 1 FROM ir_config_parameter WHERE key = 'base.developer_mode');"
```

Puis redémarrez Odoo :
```bash
docker compose restart odoo
```

---

## 📦 Étape 8 : Marquer les modules SAAS comme applications

**IMPORTANT** : Les modules SAAS sont des modules techniques, pas des applications. Pour qu'ils apparaissent dans la recherche "Applications", il faut les marquer comme applications :

```bash
# Remplacer odoo_test par le nom de votre base de données
docker exec odoo_db psql -U odoo -d odoo_test -c "UPDATE ir_module_module SET application = true WHERE name IN ('saas_base', 'saas_server', 'saas_portal', 'saas_client', 'auth_oauth_ip', 'oauth_provider', 'saas_utils');"
```

Redémarrez Odoo :
```bash
docker compose restart odoo
```

---

## 📥 Étape 9 : Installer les modules SAAS dans Odoo

1. **Rafraîchissez votre navigateur** (F5)
2. Allez dans **Applications**
3. Installez les modules **dans cet ordre** :

### Ordre d'installation :

1. **saas_base**
   - Recherchez : `saas_base`
   - Cliquez sur le module
   - Cliquez sur **Installer**

2. **auth_oauth_ip**
   - Recherchez : `auth_oauth_ip`
   - Installez

3. **oauth_provider**
   - Recherchez : `oauth_provider`
   - Installez

4. **saas_utils**
   - Recherchez : `saas_utils`
   - Installez

5. **saas_server**
   - Recherchez : `saas_server`
   - Installez

6. **saas_portal**
   - Recherchez : `saas_portal`
   - Installez

---

## ⚙️ Étape 10 : Configurer le serveur SAAS

1. Dans Odoo, allez dans **Paramètres → Technique → Paramètres → Paramètres système**
2. Dans la barre de recherche, tapez : `saas_server`
3. Configurez ces paramètres :

   - **`saas_server.saas_server_url`**
     - Valeur : `http://localhost:8069`
     - Description : URL de votre serveur Odoo maître

   - **`saas_server.saas_server_protocol`**
     - Valeur : `http` (ou `https` si vous avez SSL)
     - Description : Protocole utilisé

   - **`saas_server.saas_server_port`**
     - Valeur : `8069`
     - Description : Port du serveur

4. Cliquez sur **Enregistrer** pour chaque paramètre

---

## 🎯 Étape 11 : Créer votre premier serveur SAAS

1. Dans Odoo, allez dans **SAAS Portal → Configuration → Serveurs**
2. Cliquez sur **Créer**
3. Remplissez :
   - **Nom** : `Serveur Principal` (ou autre nom)
   - **Host** : `localhost` (ou votre IP)
   - **Port** : `8069`
   - **Scheme** : `http`
4. Cliquez sur **Enregistrer**

---

## 🚀 Étape 12 : Créer des scripts de déploiement automatisé

### Script deploy-instance.sh

Créez le fichier `deploy-instance.sh` :

```bash
#!/bin/bash

# Script de déploiement automatisé d'une instance Odoo
# Usage: ./deploy-instance.sh <nom_instance> [domaine]

set -e

INSTANCE_NAME="${1}"
DOMAIN="${2:-${INSTANCE_NAME}.localhost}"
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
    image: postgres:15
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
    image: odoo:16
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
      - "8070:8069"  # Port dynamique - à ajuster selon le nombre d'instances
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

# Initialiser la base de données Odoo
echo "⏳ Initialisation de la base de données Odoo..."
INIT_SUCCESS=false
MAX_RETRIES=30
RETRY=0

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
echo "   - URL: http://localhost:8070"
echo ""
echo "📝 Accédez à l'URL pour finaliser la configuration (créer votre compte admin)"
echo ""
```

Rendez-le exécutable :
```bash
chmod +x deploy-instance.sh
```

---

## 📝 Résumé des commandes importantes

### Démarrer l'instance maître
```bash
cd ~/odoo-saas-project
docker compose up -d
```

### Voir les logs
```bash
docker logs odoo_base -f
```

### Redémarrer
```bash
docker compose restart
```

### Arrêter
```bash
docker compose down
```

### Créer une nouvelle instance
```bash
./deploy-instance.sh nom_client
```

---

## 🔍 Dépannage

### Les modules n'apparaissent pas dans Applications

1. Vérifiez que le mode développeur est activé
2. Marquez les modules comme applications (voir Étape 8)
3. Redémarrez Odoo
4. Rafraîchissez votre navigateur

### Erreur "path is not a valid addons directory"

Vérifiez que le répertoire `addons` existe et n'est pas vide, ou retirez-le du `--addons-path` dans docker-compose.yml.

### Les modules ne s'installent pas

Vérifiez les dépendances et installez-les dans l'ordre indiqué (Étape 9).

---

## ✅ Checklist de vérification

- [ ] Docker et Docker Compose installés
- [ ] Structure du projet créée
- [ ] docker-compose.yml créé
- [ ] Modules SAAS téléchargés
- [ ] Versions mises à jour pour Odoo 16
- [ ] Instance maître démarrée
- [ ] Base de données Odoo créée
- [ ] Mode développeur activé
- [ ] Modules marqués comme applications
- [ ] Modules SAAS installés dans l'ordre
- [ ] Serveur SAAS configuré
- [ ] Scripts de déploiement créés

---

## 🎉 Félicitations !

Votre système de déploiement automatisé Odoo SAAS est maintenant opérationnel !

Vous pouvez maintenant :
- ✅ Créer des instances depuis l'interface Odoo
- ✅ Gérer toutes vos instances
- ✅ Utiliser les scripts pour déployer automatiquement
- ✅ Configurer des plans et abonnements

---

## 📚 Ressources

- [odoo-saas-tools sur GitHub](https://github.com/it-projects-llc/odoo-saas-tools)
- [Documentation Odoo](https://www.odoo.com/documentation)
- [Documentation Docker](https://docs.docker.com/)

---

**Date de création** : 2026-01-23
**Version** : 1.0
**Auteur** : Documentation générée pour le projet Odoo SAAS
