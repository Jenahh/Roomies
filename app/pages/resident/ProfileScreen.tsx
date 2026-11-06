import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { ResidentUser } from '../../data/demoAccount';
import type { ResidentData } from '../../hooks/useResidentData';
import ProfileEditor from '../../components/profile/ProfileEditor';
import ProfilePetCard from '../../components/profile/ProfilePetCard';
import ProfileSupport from '../../components/profile/ProfileSupport';

type ProfileScreenProps = {
  onSignOut: () => void;
  header: ReactNode;
  user: ResidentUser;
  data: ResidentData;
  setData: Dispatch<SetStateAction<ResidentData>>;
  storageError: string;
  onOpenPet?: () => void;
  onMaintenance: () => void;
  onContactRA: () => void;
};

export default function ProfileScreen({ onSignOut, header, user, data, setData, storageError, onOpenPet, onMaintenance, onContactRA }: ProfileScreenProps) {
  return <>
    {header}
    <ProfileEditor name={data.name} email={user.email} role={user.role} locationLabel="Household name" location={data.household} locationEditable storageError={storageError} onSignOut={onSignOut}
      onSave={({ name, location }) => setData(previous => ({
        ...previous, name, household: location,
        chores: previous.chores.map(chore => chore.assignee === previous.name ? { ...chore, assignee: name } : chore),
      }))}>
      {onOpenPet && <ProfilePetCard name={data.pet?.name} color={data.pet?.color} onOpen={onOpenPet} />}
      <ProfileSupport onMaintenance={onMaintenance} onContactRA={onContactRA} />
    </ProfileEditor>
  </>;
}
