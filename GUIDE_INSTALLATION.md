# 📦 Guide d'installation des modules SAAS

## 🎯 Objectif
Installer les modules SAAS dans votre instance maître Odoo pour activer la gestion complète des instances.

---

## 📋 Étape 1 : Démarrer l'instance maître

```bash
cd /home/nilsen-un-it/odoo-saas-project
docker compose up -d
```

Vérifiez que le conteneur démarre :
```bash
docker ps --filter "name=odoo_base"
```

Attendez 30-60 secondes que Odoo soit complètement démarré.

---

## 🌐 Étape 2 : Accéder à Odoo

1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:8069**

### Si c'est la première fois :
- Vous verrez l'écran de configuration initiale
- Créez votre base de données :
  - **Nom de la base** : `odoo` (ou autre nom)
  - **Email** : votre email
  - **Mot de passe** : votre mot de passe admin
  - **Langue** : Français (ou autre)
  - **Pays** : Votre pays
- Cliquez sur **Créer la base de données**

### Si la base existe déjà :
- Connectez-vous avec vos identifiants admin

---

## 🔧 Étape 3 : Activer le mode développeur

1. Dans Odoo, allez dans le menu **Paramètres** (icône engrenage en haut à droite)
2. Activez le **Mode développeur** :
   - En bas de la page, cliquez sur **Activer le mode développeur**
   - Ou allez dans **Paramètres → Technique → Activer le mode développeur**

**Important** : Le mode développeur est nécessaire pour voir et installer les modules personnalisés.

---

## 📦 Étape 4 : Installer les modules SAAS (dans l'ordre)

### 4.1 Module `saas_base`
1. Menu **Applications**
2. Cliquez sur **Mettre à jour la liste des applications** (en haut)
3. Dans la barre de recherche, tapez : `saas_base`
4. Cliquez sur le module **SaaS Base**
5. Cliquez sur **Installer**

### 4.2 Module `auth_oauth_ip`
1. Recherchez : `auth_oauth_ip`
2. Installez le module

### 4.3 Module `oauth_provider`
1. Recherchez : `oauth_provider`
2. Installez le module

### 4.4 Module `saas_utils`
1. Recherchez : `saas_utils`
2. Installez le module

### 4.5 Module `saas_server`
1. Recherchez : `saas_server`
2. Installez le module

### 4.6 Module `saas_portal`
1. Recherchez : `saas_portal`
2. Installez le module

---

## ⚙️ Étape 5 : Configurer le serveur SAAS

1. Allez dans **Paramètres** (icône engrenage)
2. Dans le menu de gauche, cherchez **Technique**
3. Cliquez sur **Paramètres → Paramètres système**
4. Dans la barre de recherche en haut, tapez : `saas_server`

### Configurez ces paramètres :

#### `saas_server.saas_server_url`
- **Valeur** : `http://localhost:8069`
- Description : URL de votre serveur Odoo maître

#### `saas_server.saas_server_protocol`
- **Valeur** : `http` (ou `https` si vous avez SSL)
- Description : Protocole utilisé

#### `saas_server.saas_server_port`
- **Valeur** : `8069`
- Description : Port du serveur

5. Cliquez sur **Enregistrer** pour chaque paramètre modifié

---

## ✅ Étape 6 : Vérifier l'installation

1. Dans le menu principal d'Odoo, vous devriez maintenant voir :
   - **SAAS Portal** (nouveau menu)
   
2. Cliquez sur **SAAS Portal**
   - Vous devriez voir les options de gestion des instances

---

## 🎯 Étape 7 : Créer votre premier serveur SAAS

1. Allez dans **SAAS Portal → Configuration → Serveurs**
2. Cliquez sur **Créer**
3. Remplissez :
   - **Nom** : `Serveur Principal` (ou autre nom)
   - **Host** : `localhost` (ou votre IP)
   - **Port** : `8069`
   - **Scheme** : `http`
4. Cliquez sur **Enregistrer**

---

## 🚀 C'est prêt !

Votre instance maître est maintenant configurée avec les modules SAAS.

Vous pouvez maintenant :
- ✅ Créer des instances depuis l'interface Odoo
- ✅ Gérer toutes vos instances
- ✅ Configurer des plans et abonnements
- ✅ Et bien plus...

---

## 🛠️ Dépannage

### Les modules n'apparaissent pas dans la liste

1. **Vérifiez que le mode développeur est activé**
2. **Mettez à jour la liste des applications** :
   - Applications → Mettre à jour la liste des applications
3. **Vérifiez les logs** :
   ```bash
   docker logs odoo_base --tail 50
   ```
4. **Vérifiez que les modules sont bien montés** :
   ```bash
   docker exec odoo_base ls -la /mnt/extra-addons-saas | head -20
   ```

### Erreur lors de l'installation

- Vérifiez les dépendances (installez dans l'ordre indiqué)
- Consultez les logs : `docker logs odoo_base -f`
- Redémarrez le conteneur : `docker compose restart`

### Le menu SAAS Portal n'apparaît pas

- Vérifiez que `saas_portal` est bien installé
- Rafraîchissez la page (F5)
- Déconnectez-vous et reconnectez-vous

---

## 📝 Notes importantes

- Les modules sont pour Odoo 11, mais fonctionnent généralement avec Odoo 16
- Si vous avez des erreurs de compatibilité, vous devrez peut-être adapter certains modules
- Pour la production, configurez HTTPS au lieu de HTTP
