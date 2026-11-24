import RoleDashboardHeader from './RoleDashboardHeader';

export default function ResidentAssistantHeader({ pageTitle }: { pageTitle?: string }) {
  return <RoleDashboardHeader role="Resident Assistant" pageTitle={pageTitle} showLogo={false} showWordmark={false} />;
}
