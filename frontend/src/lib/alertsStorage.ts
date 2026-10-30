/**
 * Gerenciamento do estado de alertas/notificações visualizados pelo usuário.
 * Armazena no localStorage por marca para que novos alertas (ex: novo representante
 * expirado, novo prazo correndo, novo aviso) gerem contadores e notificações
 * reativas, que são limpas quando o usuário visualiza.
 */

const STORAGE_PREFIX = "licitflow_visualized_alerts_";
export const LICITFLOW_ALERTS_UPDATED_EVENT = "licitflow-alerts-updated";

export function getRepAlertKey(id: string, status: string): string {
  return `rep_${status}_${id}`;
}

export function getAvisoAlertKey(id: string): string {
  return `aviso_${id}`;
}

export function getVisualizedAlerts(marcaId: string): string[] {
  if (typeof window === "undefined" || !marcaId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${marcaId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function dispatchAlertsUpdated(marcaId?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LICITFLOW_ALERTS_UPDATED_EVENT, { detail: { marcaId } })
  );
}

export function markAlertAsVisualized(marcaId: string, alertKey: string): void {
  if (typeof window === "undefined" || !marcaId || !alertKey) return;
  try {
    const current = getVisualizedAlerts(marcaId);
    if (!current.includes(alertKey)) {
      const next = [...current, alertKey];
      localStorage.setItem(`${STORAGE_PREFIX}${marcaId}`, JSON.stringify(next));
      dispatchAlertsUpdated(marcaId);
    }
  } catch {
    // silencioso em caso de restrição de armazenamento
  }
}

export function markAlertsAsVisualized(marcaId: string, alertKeys: string[]): void {
  if (typeof window === "undefined" || !marcaId || alertKeys.length === 0) return;
  try {
    const current = getVisualizedAlerts(marcaId);
    const set = new Set(current);
    let changed = false;

    for (const key of alertKeys) {
      if (!set.has(key)) {
        set.add(key);
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(`${STORAGE_PREFIX}${marcaId}`, JSON.stringify(Array.from(set)));
      dispatchAlertsUpdated(marcaId);
    }
  } catch {
    // silencioso
  }
}

export function clearVisualizedAlerts(marcaId: string): void {
  if (typeof window === "undefined" || !marcaId) return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${marcaId}`);
    dispatchAlertsUpdated(marcaId);
  } catch {
    // silencioso
  }
}
