# 🚀 Guide de démarrage rapide

## ✅ Ce qui est déjà configuré

1. **Instance maître Odoo** : http://localhost:8069
   - Modules SAAS disponibles dans `saas-modules/odoo-saas-tools`
   - Configuration Docker prête

2. **Instance "eddy"** : http://localhost:8070
   - Base de données isolée : `eddy`
   - Conteneurs : `odoo_eddy` et `odoo_db_eddy`

## 📋 Commandes utiles

### Gestion des instances

```bash
# Lister toutes les instances
./manage-instances.sh list

# Démarrer une instance
./manage-instances.sh start eddy

# Arrêter une instance
./manage-instances.sh stop eddy

# Redémarrer une instance
./manage-instances.sh restart eddy

# Voir les logs
./manage-instances.sh logs eddy

# Voir le statut détaillé
./manage-instances.sh status eddy

# Supprimer une instance (avec confirmation)
./manage-instances.sh remove eddy
```

### Créer une nouvelle instance

```bash
# Créer une nouvelle instance
./deploy-instance.sh nom_client [domaine]

# Exemple
./deploy-instance.sh client2 client2.mondomaine.com

# Puis démarrer l'instance
cd instances/client2
docker compose up -d
```

## 🔧 Prochaines étapes pour le SAAS complet

### 1. Installer les modules SAAS dans l'instance maître

1. Accédez à http://localhost:8069
2. Activez le **mode développeur** :
   - Paramètres → Activer le mode développeur
3. Installez les modules dans cet ordre :
   - Applications → Rechercher "saas_base" → Installer
   - Applications → Rechercher "auth_oauth_ip" → Installer
   - Applications → Rechercher "oauth_provider" → Installer
   - Applications → Rechercher "saas_utils" → Installer
   - Applications → Rechercher "saas_server" → Installer
   - Applications → Rechercher "saas_portal" → Installer

### 2. Configurer le serveur SAAS

1. Dans Odoo maître, allez dans **Paramètres → Technique → Paramètres → Paramètres système**
2. Configurez :
   - `saas_server.saas_server_url` : `http://localhost:8069`
   - `saas_server.saas_server_protocol` : `http`
   - `saas_server.saas_server_port` : `8069`

### 3. Créer un plan SAAS

1. Allez dans **SAAS Portal → Plans**
2. Créez un nouveau plan avec :
   - Nom du plan
   - Modules à inclure
   - Limites (utilisateurs, stockage, etc.)

### 4. Déployer via l'interface SAAS Portal

1. Allez dans **SAAS Portal → Nouvelle instance**
2. Remplissez les informations
3. L'instance sera créée automatiquement via Docker

## 🌐 Accès aux instances

- **Instance maître** : http://localhost:8069
- **Instance eddy** : http://localhost:8070
- **Nouvelles instances** : Ports dynamiques (8071, 8072, etc.)

## 📝 Notes importantes

- Chaque instance a sa propre base de données PostgreSQL isolée
- Les instances communiquent via le réseau Docker `odoo_network`
- Les mots de passe des bases de données sont générés automatiquement et affichés lors de la création

## 🛠️ Dépannage

### Redémarrer l'instance maître
```bash
cd /home/nilsen-un-it/odoo-saas-project
docker compose restart
```

### Voir les logs de l'instance maître
```bash
docker logs odoo_base -f
```

### Vérifier les conteneurs en cours
```bash
docker ps
```

### Vérifier le réseau Docker
```bash
docker network inspect odoo_network
```
