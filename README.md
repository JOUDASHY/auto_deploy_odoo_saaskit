# Déploiement automatisé des instances Odoo avec SAAS-KIT et Docker

Ce projet permet de déployer automatiquement des instances Odoo en utilisant le module **odoo-saas-tools** (gratuit, open source) et Docker.

## 📋 Prérequis

- Docker et Docker Compose installés
- Git installé
- Accès à Internet pour télécharger les images Docker

## 🚀 Installation

### 1. Structure du projet

```
odoo-saas-project/
├── docker-compose.yml          # Configuration principale (instance maître)
├── saas-modules/                # Modules SAAS (odoo-saas-tools)
│   └── odoo-saas-tools/
├── addons/                      # Modules personnalisés
├── instances/                   # Instances déployées (créées automatiquement)
└── deploy-instance.sh           # Script de déploiement
```

### 2. Démarrer l'instance maître

L'instance maître est celle qui gère le déploiement des autres instances :

```bash
docker-compose up -d
```

Accédez à Odoo : http://localhost:8069

### 3. Installer les modules SAAS dans Odoo

1. Connectez-vous à Odoo (http://localhost:8069)
2. Activez le **mode développeur** :
   - Menu : Paramètres → Activer le mode développeur
3. Installez les modules dans cet ordre :
   - `saas_base` (base)
   - `auth_oauth_ip` (dépendance)
   - `oauth_provider` (dépendance)
   - `saas_utils` (utilitaires)
   - `saas_server` (serveur de déploiement)
   - `saas_portal` (portail de gestion)

### 4. Configurer le serveur SAAS

1. Dans Odoo, allez dans **Paramètres → Technique → Paramètres → Paramètres système**
2. Configurez les paramètres SAAS :
   - `saas_server.saas_server_url` : URL de votre serveur (ex: http://localhost:8069)
   - `saas_server.saas_server_port` : Port (8069)
   - `saas_server.saas_server_protocol` : http ou https

## 🔧 Déploiement d'une nouvelle instance

### Méthode 1 : Via le script automatisé

```bash
chmod +x deploy-instance.sh
./deploy-instance.sh nom_instance [domaine]
```

Exemple :
```bash
./deploy-instance.sh client1 client1.mondomaine.com
```

### Méthode 2 : Via l'interface Odoo SAAS Portal

1. Connectez-vous à l'instance maître
2. Allez dans **SAAS Portal → Nouvelle instance**
3. Remplissez les informations :
   - Nom de l'instance
   - Domaine
   - Plan (si configuré)
4. Cliquez sur **Créer**

## 📦 Modules disponibles

Les modules suivants sont disponibles dans `saas-modules/odoo-saas-tools/` :

### Modules essentiels
- **saas_base** : Module de base pour le SaaS
- **saas_server** : Serveur de déploiement d'instances
- **saas_portal** : Portail de gestion des instances
- **saas_client** : Module pour les instances clientes

### Modules optionnels
- **saas_portal_sale** : Intégration avec les ventes
- **saas_portal_backup** : Gestion des sauvegardes
- **saas_server_backup_s3** : Sauvegarde vers S3
- **saas_portal_subscription** : Gestion des abonnements
- Et bien d'autres...

## 🔐 Sécurité

- Changez les mots de passe par défaut dans `docker-compose.yml`
- Utilisez des variables d'environnement pour les secrets
- Configurez HTTPS pour la production
- Limitez l'accès réseau aux instances

## 📝 Notes importantes

1. **Version Odoo** : Ce projet utilise Odoo 16. Les modules odoo-saas-tools sont pour Odoo 11, mais peuvent fonctionner avec des adaptations.

2. **Ports** : Chaque instance utilise un port différent. Ajustez les ports dans `deploy-instance.sh` si nécessaire.

3. **Réseau Docker** : Toutes les instances partagent le réseau `odoo_network` pour communiquer.

4. **Bases de données** : Chaque instance a sa propre base de données PostgreSQL isolée.

## 🛠️ Dépannage

### Les modules n'apparaissent pas dans Odoo

1. Vérifiez que les volumes sont bien montés dans `docker-compose.yml`
2. Redémarrez le conteneur : `docker-compose restart odoo`
3. Vérifiez les logs : `docker-compose logs odoo`

### Erreur de permissions

Si vous avez des erreurs de permissions sur le répertoire `addons` :
```bash
sudo chown -R $USER:$USER addons/
```

### Instance ne démarre pas

1. Vérifiez les logs : `docker-compose -f instances/<nom>/docker-compose.yml logs`
2. Vérifiez que le port n'est pas déjà utilisé
3. Vérifiez que le réseau Docker existe : `docker network ls`

## 📚 Ressources

- [odoo-saas-tools sur GitHub](https://github.com/it-projects-llc/odoo-saas-tools)
- [Documentation Odoo](https://www.odoo.com/documentation)
- [Documentation Docker](https://docs.docker.com/)

## 📄 Licence

Les modules odoo-saas-tools sont sous licence LGPL-3.0 (gratuit et open source).
# auto_deploy_odoo_saaskit
