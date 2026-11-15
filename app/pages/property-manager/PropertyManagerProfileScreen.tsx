import type { ResidentUser } from '../../data/demoAccount';
import ProfileEditor from '../../components/profile/ProfileEditor';

type PropertyManagerProfileScreenProps = {
  user: ResidentUser;
  name: string;
  propertyName: string;
  color?: string;
  storageError: string;
  onSaveName: (name: string) => void;
  onSignOut: () => void;
};

export default function PropertyManagerProfileScreen({ user, name, propertyName, color, storageError, onSaveName, onSignOut }: PropertyManagerProfileScreenProps) {
  return <ProfileEditor name={name} email={user.email} role={user.role} color={color} locationLabel="Property" location={propertyName} storageError={storageError} onSave={values => onSaveName(values.name)} onSignOut={onSignOut} />;
}
