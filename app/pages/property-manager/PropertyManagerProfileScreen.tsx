import type { ResidentUser } from '../../data/demoAccount';
import ProfileEditor from '../../components/profile/ProfileEditor';

type PropertyManagerProfileScreenProps = {
  user: ResidentUser;
  name: string;
  propertyName: string;
  storageError: string;
  onSaveName: (name: string) => void;
  onSignOut: () => void;
};

export default function PropertyManagerProfileScreen({ user, name, propertyName, storageError, onSaveName, onSignOut }: PropertyManagerProfileScreenProps) {
  return <ProfileEditor name={name} email={user.email} role={user.role} locationLabel="Property" location={propertyName} storageError={storageError} onSave={values => onSaveName(values.name)} onSignOut={onSignOut} />;
}
