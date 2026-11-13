import type { Dispatch, SetStateAction } from 'react';
import type { ResidentUser } from '../../data/demoAccount';
import type { ResidentData } from '../../hooks/useResidentData';
import ProfileEditor from '../../components/profile/ProfileEditor';
import ProfileSupport from '../../components/profile/ProfileSupport';

type ProfileScreenProps = {
  onSignOut: () => void;
  user: ResidentUser;
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  storageError: string;
  onMaintenance: () => void;
  onContactRA: () => void;
};

export default function ProfileScreen({ onSignOut, user, data, setData, storageError, onMaintenance, onContactRA }: ProfileScreenProps) {
  return <>
    <ProfileEditor name={data.name} email={user.email} role={user.role} locationLabel="Household name" location={data.household} locationEditable storageError={storageError} onSignOut={onSignOut}
      onSave={({ name, location }) => setData(previous => ({
        ...previous, name, household: location,
        chores: previous.chores.map(chore => chore.assignee === previous.name ? { ...chore, assignee: name } : chore),
      }))}>
      <ProfileSupport onMaintenance={onMaintenance} onContactRA={onContactRA} color={data.pet?.color} />
    </ProfileEditor>
  </>;
}
