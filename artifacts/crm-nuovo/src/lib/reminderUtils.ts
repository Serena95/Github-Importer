import { CRMDeal } from "@/types/crm";

export interface ReminderConfig {
  stage: string;
  thresholdHours: number;
}

export const REMINDER_CONFIGS: ReminderConfig[] = [
  { stage: 'Form preanalisi', thresholdHours: 24 },
  { stage: 'Verifica telefonica', thresholdHours: 48 },
  { stage: 'Invio preventivo', thresholdHours: 72 },
  { stage: 'Contratto', thresholdHours: 120 }, // 5 days
];

export const getInactivityData = (deal: CRMDeal, currentStageName: string) => {
  const config = REMINDER_CONFIGS.find(c => c.stage.toLowerCase() === currentStageName.toLowerCase());
  if (!config) return null;

  const lastUpdate = new Date(deal.updated_at || deal.created_at).getTime();
  const now = Date.now();
  const diffHours = (now - lastUpdate) / (1000 * 60 * 60);

  const isExpired = diffHours >= config.thresholdHours;
  const daysInactivity = Math.floor(diffHours / 24);

  return {
    isExpired,
    diffHours,
    daysInactivity,
    config
  };
};
