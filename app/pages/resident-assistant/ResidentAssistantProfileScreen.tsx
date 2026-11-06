import type { ResidentUser } from '../../data/demoAccount';
import ProfileEditor from '../../components/profile/ProfileEditor';

type ResidentAssistantProfileScreenProps = {
  user: ResidentUser;
  name: string;
  hall: string;
  storageError: string;
  onSaveName: (name: string) => void;
  onSignOut: () => void;
};

export default function ResidentAssistantProfileScreen({ user, name, hall, storageError, onSaveName, onSignOut }: ResidentAssistantProfileScreenProps) {
  return <ProfileEditor name={name} email={user.email} role={user.role} locationLabel="Assigned hall" location={hall} storageError={storageError} onSave={values => onSaveName(values.name)} onSignOut={onSignOut} />;
}
