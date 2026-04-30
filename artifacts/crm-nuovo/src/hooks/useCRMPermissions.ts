import { useAuth } from '@/contexts/AuthContext';
import { CRMDeal, CRMStage } from '@/types/crm';
import { UserRole } from '@/types';

export const useCRMPermissions = () => {
  const { profile } = useAuth();
  const role = profile?.role as UserRole || 'viewer';

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isCommerciale = role === 'commerciale';
  const isOperatore = role === 'operatore';
  const isViewer = role === 'viewer';

  // Permission checks
  const canSeeAllPipelines = isAdmin;
  const canModifyPipelines = isAdmin;
  const canModifyAutomations = isAdmin;
  const canDeleteDeals = isAdmin;
  const canSeeDashboard = isAdmin || isManager;
  const canAssignUsers = isAdmin || isManager;
  
  const canCreateDeals = !isViewer;
  const canModifyDeal = (deal: CRMDeal) => {
    if (isAdmin) return true;
    if (isManager) {
        // Assuming team logic: If manager and deal in same team or something similar
        // For now, let's allow managers all team deals if we had team metadata
        return true; 
    }
    if (isCommerciale) return deal.assigned_to === profile?.uid;
    if (isOperatore) return deal.assigned_to === profile?.uid || deal.assistants?.includes(profile?.uid || '');
    return false;
  };

  const canMoveStage = (deal: CRMDeal) => {
    if (isAdmin || isManager) return true;
    if (isCommerciale) return deal.assigned_to === profile?.uid;
    // Operatore cannot move stage
    return false;
  };

  const canAddNote = (deal: CRMDeal) => {
    if (isAdmin || isManager) return true;
    if (isCommerciale || isOperatore) return deal.assigned_to === profile?.uid || deal.assistants?.includes(profile?.uid || '');
    return false;
  };

  const canUploadFile = (deal: CRMDeal) => canAddNote(deal);

  const canCreateTask = (deal: CRMDeal) => {
    if (isAdmin || isManager) return true;
    if (isCommerciale) return deal.assigned_to === profile?.uid;
    return false;
  };

  return {
    role,
    isAdmin,
    isManager,
    isCommerciale,
    isOperatore,
    isViewer,
    canSeeAllPipelines,
    canModifyPipelines,
    canModifyAutomations,
    canDeleteDeals,
    canSeeDashboard,
    canAssignUsers,
    canCreateDeals,
    canModifyDeal,
    canMoveStage,
    canAddNote,
    canUploadFile,
    canCreateTask
  };
};
