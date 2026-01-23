#!/bin/bash

# Script de gestion des instances Odoo
# Usage: ./manage-instances.sh <action> [nom_instance]
# Actions: list, start, stop, restart, logs, remove

set -e

ACTION="${1}"
INSTANCE_NAME="${2}"
INSTANCES_DIR="./instances"

if [ -z "${ACTION}" ]; then
    echo "❌ Erreur: Vous devez fournir une action"
    echo ""
    echo "Usage: $0 <action> [nom_instance]"
    echo ""
    echo "Actions disponibles:"
    echo "  list              - Lister toutes les instances"
    echo "  start <nom>       - Démarrer une instance"
    echo "  stop <nom>        - Arrêter une instance"
    echo "  restart <nom>     - Redémarrer une instance"
    echo "  logs <nom>        - Voir les logs d'une instance"
    echo "  remove <nom>      - Supprimer une instance (avec confirmation)"
    echo "  status <nom>      - Voir le statut d'une instance"
    exit 1
fi

list_instances() {
    echo "📋 Instances disponibles:"
    echo ""
    if [ ! -d "${INSTANCES_DIR}" ] || [ -z "$(ls -A ${INSTANCES_DIR} 2>/dev/null)" ]; then
        echo "   Aucune instance trouvée"
        return
    fi
    
    for instance in "${INSTANCES_DIR}"/*; do
        if [ -d "${instance}" ]; then
            name=$(basename "${instance}")
            if docker ps -a --format "{{.Names}}" | grep -q "odoo_${name}"; then
                if docker ps --format "{{.Names}}" | grep -q "odoo_${name}"; then
                    status="🟢 En cours"
                    port=$(docker port "odoo_${name}" 2>/dev/null | grep "8069" | cut -d: -f2 || echo "N/A")
                else
                    status="🔴 Arrêtée"
                    port="N/A"
                fi
                echo "   - ${name}: ${status} (Port: ${port})"
            else
                echo "   - ${name}: ⚪ Non déployée"
            fi
        fi
    done
}

get_instance_info() {
    local name="${1}"
    if [ -z "${name}" ]; then
        echo "❌ Erreur: Nom d'instance requis"
        exit 1
    fi
    
    local instance_dir="${INSTANCES_DIR}/${name}"
    if [ ! -d "${instance_dir}" ]; then
        echo "❌ Erreur: Instance '${name}' non trouvée"
        exit 1
    fi
    
    echo "${instance_dir}"
}

start_instance() {
    local instance_dir=$(get_instance_info "${INSTANCE_NAME}")
    echo "🚀 Démarrage de l'instance: ${INSTANCE_NAME}"
    cd "${instance_dir}"
    docker compose up -d
    echo "✅ Instance démarrée"
    echo "🌐 URL: http://localhost:$(docker port "odoo_${INSTANCE_NAME}" 2>/dev/null | grep "8069" | cut -d: -f2 || echo "N/A")"
}

stop_instance() {
    local instance_dir=$(get_instance_info "${INSTANCE_NAME}")
    echo "🛑 Arrêt de l'instance: ${INSTANCE_NAME}"
    cd "${instance_dir}"
    docker compose down
    echo "✅ Instance arrêtée"
}

restart_instance() {
    local instance_dir=$(get_instance_info "${INSTANCE_NAME}")
    echo "🔄 Redémarrage de l'instance: ${INSTANCE_NAME}"
    cd "${instance_dir}"
    docker compose restart
    echo "✅ Instance redémarrée"
}

show_logs() {
    local instance_dir=$(get_instance_info "${INSTANCE_NAME}")
    echo "📄 Logs de l'instance: ${INSTANCE_NAME}"
    echo "   (Appuyez sur Ctrl+C pour quitter)"
    echo ""
    docker logs -f "odoo_${INSTANCE_NAME}"
}

show_status() {
    local instance_dir=$(get_instance_info "${INSTANCE_NAME}")
    echo "📊 Statut de l'instance: ${INSTANCE_NAME}"
    echo ""
    
    if docker ps --format "{{.Names}}" | grep -q "odoo_${INSTANCE_NAME}"; then
        echo "🟢 Statut: En cours d'exécution"
        echo ""
        echo "Conteneurs:"
        docker ps --filter "name=${INSTANCE_NAME}" --format "  - {{.Names}}: {{.Status}}"
        echo ""
        echo "Ports:"
        docker port "odoo_${INSTANCE_NAME}" 2>/dev/null | sed 's/^/  - /' || echo "  Aucun port exposé"
        echo ""
        echo "Volumes:"
        docker volume ls --filter "name=${INSTANCE_NAME}" --format "  - {{.Name}}"
    else
        echo "🔴 Statut: Arrêtée"
        if docker ps -a --format "{{.Names}}" | grep -q "odoo_${INSTANCE_NAME}"; then
            echo ""
            echo "Conteneurs (arrêtés):"
            docker ps -a --filter "name=${INSTANCE_NAME}" --format "  - {{.Names}}: {{.Status}}"
        fi
    fi
}

remove_instance() {
    local instance_dir=$(get_instance_info "${INSTANCE_NAME}")
    
    echo "⚠️  ATTENTION: Cette action va supprimer l'instance '${INSTANCE_NAME}'"
    echo "   - Tous les conteneurs seront arrêtés et supprimés"
    echo "   - Les volumes de données seront supprimés"
    echo "   - Les données seront PERDUES de manière définitive"
    echo ""
    read -p "Êtes-vous sûr ? (tapez 'oui' pour confirmer): " confirmation
    
    if [ "${confirmation}" != "oui" ]; then
        echo "❌ Suppression annulée"
        exit 0
    fi
    
    echo "🗑️  Suppression de l'instance: ${INSTANCE_NAME}"
    
    # Arrêter et supprimer les conteneurs
    if [ -f "${instance_dir}/docker-compose.yml" ]; then
        cd "${instance_dir}"
        docker compose down -v 2>/dev/null || true
    fi
    
    # Supprimer les volumes restants
    docker volume rm "${INSTANCE_NAME}_db_data" "${INSTANCE_NAME}_data" 2>/dev/null || true
    
    # Supprimer le répertoire
    rm -rf "${instance_dir}"
    
    echo "✅ Instance supprimée"
}

case "${ACTION}" in
    list)
        list_instances
        ;;
    start)
        if [ -z "${INSTANCE_NAME}" ]; then
            echo "❌ Erreur: Nom d'instance requis pour 'start'"
            exit 1
        fi
        start_instance
        ;;
    stop)
        if [ -z "${INSTANCE_NAME}" ]; then
            echo "❌ Erreur: Nom d'instance requis pour 'stop'"
            exit 1
        fi
        stop_instance
        ;;
    restart)
        if [ -z "${INSTANCE_NAME}" ]; then
            echo "❌ Erreur: Nom d'instance requis pour 'restart'"
            exit 1
        fi
        restart_instance
        ;;
    logs)
        if [ -z "${INSTANCE_NAME}" ]; then
            echo "❌ Erreur: Nom d'instance requis pour 'logs'"
            exit 1
        fi
        show_logs
        ;;
    status)
        if [ -z "${INSTANCE_NAME}" ]; then
            echo "❌ Erreur: Nom d'instance requis pour 'status'"
            exit 1
        fi
        show_status
        ;;
    remove)
        if [ -z "${INSTANCE_NAME}" ]; then
            echo "❌ Erreur: Nom d'instance requis pour 'remove'"
            exit 1
        fi
        remove_instance
        ;;
    *)
        echo "❌ Erreur: Action '${ACTION}' inconnue"
        exit 1
        ;;
esac
