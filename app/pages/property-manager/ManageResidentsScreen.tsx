import { useState, type Dispatch, type SetStateAction } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { ManagedHousehold, ManagedResident } from '../../data/demoPropertyManager';
import { createResidentJoinCode } from '../../data/residentInvitations';
import ResidentRoster from '../../components/dashboard/ResidentRoster';
import ResidentAccessControls from '../../components/dashboard/ResidentAccessControls';
import { styles as s } from '../../styles/ManageResidentsScreen.styles';
import { styles as shared } from '../../styles/PropertyManagerDashboard.styles';

type ManageResidentsScreenProps = {
  propertyName: string;
  household?: ManagedHousehold;
  residents: ManagedResident[];
  setResidents: Dispatch<SetStateAction<ManagedResident[]>>;
  onBack: () => void;
};

export default function ManageResidentsScreen({ propertyName, household, residents, setResidents, onBack }: ManageResidentsScreenProps) {
  const [unit, setUnit] = useState(household?.name || '3B');
  const unitLabel = household ? household.name : `Suite ${unit}`;
  const [selectedId, setSelectedId] = useState('alexandra');
  const [dialog, setDialog] = useState<'invite' | 'approve' | 'status' | 'remove' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const units = household ? [household.name] : Array.from(new Set(['3B', '3C', ...residents.map(resident => resident.unit)]));
  const members = residents.filter(resident => resident.unit === unit && resident.access !== 'Invited');
  const selected = members.find(resident => resident.id === selectedId) || members[0];
  const activeCount = members.filter(resident => resident.access === 'Active').length;
  const pendingCount = residents.filter(resident => resident.unit === unit && resident.access === 'Invited').length;
  const pendingResidents = residents.filter(resident => resident.access === 'Invited');

  function approve(resident: ManagedResident) {
    setResidents(previous => previous.map(item => item.id === resident.id && item.access === 'Invited' ? { ...item, access: 'Active' } : item));
    setUnit(resident.unit); setSelectedId(resident.id); setDialog(null);
    setNotice(`${resident.name} was approved and added to ${household?.name || `Suite ${resident.unit}`} in this demo.`);
  }

  function openInvite() {
    setName(''); setEmail(''); setError(''); setDialog('invite');
  }

  function invite() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a name and a valid email address.'); return;
    }
    if (residents.some(resident => resident.email.toLowerCase() === normalizedEmail)) {
      setError('This resident already has access or a pending invitation.'); return;
    }
    let joinCode: string;
    try { joinCode = createResidentJoinCode(normalizedEmail, unitLabel); }
    catch { setError('Could not save the invitation. Allow browser storage and try again.'); return; }
    setResidents(previous => [...previous, { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, unit, householdId: household?.id, joinCode, access: 'Invited' }]);
    setDialog(null); setNotice(`Invitation created for ${name.trim()}. Resident join code: ${joinCode}. No email was sent.`);
  }

  function changeStatus(access: 'Active' | 'Suspended') {
    if (!selected) return;
    setResidents(previous => previous.map(resident => resident.id === selected.id ? { ...resident, access } : resident));
    setDialog(null); setNotice(`${selected.name}'s demo access is now ${access.toLowerCase()}.`);
  }

  function remove() {
    if (!selected) return;
    setResidents(previous => previous.filter(resident => resident.id !== selected.id));
    setDialog(null); setNotice(`${selected.name} was removed from the demo unit roster.`);
  }

  return (
    <>
      <View style={s.heading}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to properties" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
        <Text accessibilityRole="header" style={s.title}>Manage Residents</Text>
      </View>
      <Text style={s.subtitle}>{propertyName} · Unit roster & access only</Text>
      <View style={s.suiteHeading}>
        <Text accessibilityRole="header" style={s.suiteTitle}>{unitLabel}</Text>
        <View style={s.badge}><Text style={s.badgeText}>{household ? 'Household' : 'Active unit'} · {members.length} {members.length === 1 ? 'resident' : 'residents'}</Text></View>
      </View>
      <ResidentRoster residents={members} householdName={household?.name} selectedId={selected?.id} onSelect={id => { setSelectedId(id); setNotice(''); }} />
      <Pressable accessibilityRole="button" onPress={openInvite} style={({ pressed }) => [shared.primaryButton, pressed && shared.pressed]}><Text style={shared.primaryText}>Invite resident</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setDialog('approve')} style={({ pressed }) => [shared.primaryButton, s.approveButton, pressed && shared.pressed]}><Text style={shared.primaryText}>Approve resident</Text></Pressable>
      {pendingResidents.filter(resident => resident.unit === unit).map(resident => <View key={resident.id} style={s.controls}>
        <Text style={s.name}>{resident.name} · Invitation pending</Text>
        <Text style={s.detail}>{resident.email}</Text>
        {resident.joinCode && <Text selectable style={s.link}>Resident join code: {resident.joinCode}</Text>}
      </View>)}
      {selected && <ResidentAccessControls resident={selected} onChangeStatus={() => setDialog('status')} onRemove={() => setDialog('remove')} />}
      <View style={s.suiteSummary}>
        <Text style={s.detail}>{unitLabel} · {activeCount} active {activeCount === 1 ? 'resident' : 'residents'}</Text>
        {pendingCount > 0 && <View style={[s.badge, s.pending]}><Text style={s.badgeText}>{pendingCount} {pendingCount === 1 ? 'invite' : 'invites'} pending</Text></View>}
      </View>
      {units.filter(other => other !== unit).map(other => {
        const active = residents.filter(resident => resident.unit === other && resident.access === 'Active').length;
        const pending = residents.filter(resident => resident.unit === other && resident.access === 'Invited').length;
        return <Pressable key={other} accessibilityRole="button" accessibilityLabel={`View Suite ${other}, ${active} active residents, ${pending} invitations pending`} onPress={() => { setUnit(other); setSelectedId(''); setNotice(''); }} style={s.suiteSummary}>
          <Text style={s.detail}>Suite {other} · {active} active residents</Text>
          {pending > 0 ? <View style={[s.badge, s.pending]}><Text style={s.badgeText}>{pending} {pending === 1 ? 'invite' : 'invites'} pending</Text></View> : <Text style={s.link}>View suite</Text>}
        </Pressable>;
      })}
      {!!notice && <Text accessibilityRole="status" accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}
      <Text style={s.notice}>Demo roster. Changes stay in this session and do not affect real resident access.</Text>
      <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
        <View style={shared.backdrop}>
          <ScrollView style={shared.modal} contentContainerStyle={shared.modalContent} keyboardShouldPersistTaps="handled">
            <Pressable accessibilityRole="button" accessibilityLabel="Back to resident roster" onPress={() => setDialog(null)} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
            {dialog === 'invite' && <>
              <Text accessibilityRole="header" style={shared.sectionTitle}>Invite resident to {unitLabel}</Text>
              <Text style={shared.label}>Full name</Text>
              <TextInput accessibilityLabel="Resident full name" value={name} onChangeText={setName} autoComplete="name" maxLength={100} style={shared.input} />
              <Text style={shared.label}>Email</Text>
              <TextInput accessibilityLabel="Resident email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} style={shared.input} />
              {!!error && <Text accessibilityRole="alert" style={shared.error}>{error}</Text>}
              <Text style={s.detail}>Creates a resident join code to share with this resident. No email is sent.</Text>
              <Pressable accessibilityRole="button" onPress={invite} style={shared.primaryButton}><Text style={shared.primaryText}>Create invitation</Text></Pressable>
            </>}
            {dialog === 'approve' && <>
              <Text accessibilityRole="header" style={shared.sectionTitle}>Approve resident</Text>
              <Text style={s.detail}>Select a pending resident to approve access to their suite.</Text>
              {!pendingResidents.length && <Text style={shared.empty}>No residents are awaiting approval.</Text>}
              {pendingResidents.map(resident => <View key={resident.id} style={s.controls}>
                <Text style={s.name}>{resident.name}</Text>
                <Text style={s.detail}>{resident.email} · {household?.name || `Suite ${resident.unit}`}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Approve ${resident.name} for Suite ${resident.unit}`} onPress={() => approve(resident)} style={({ pressed }) => [shared.primaryButton, pressed && shared.pressed]}><Text style={shared.primaryText}>Approve resident</Text></Pressable>
              </View>)}
            </>}
            {dialog === 'status' && selected && <>
              <Text accessibilityRole="header" style={shared.sectionTitle}>Change access status</Text>
              <Text style={shared.overviewText}>{selected.name} · {unitLabel}</Text>
              {(['Active', 'Suspended'] as const).map(access => <Pressable key={access} accessibilityRole="button" accessibilityState={{ selected: selected.access === access }} onPress={() => changeStatus(access)} style={[s.statusButton, selected.access === access && s.statusSelected]}><Text style={s.link}>{access}</Text></Pressable>)}
            </>}
            {dialog === 'remove' && selected && <>
              <Text accessibilityRole="header" style={shared.sectionTitle}>Remove from {unitLabel}?</Text>
              <Text style={shared.overviewText}>Remove {selected.name} from this demo unit roster?</Text>
              <Pressable accessibilityRole="button" onPress={remove} style={s.dangerButton}><Text style={s.dangerText}>Remove resident</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => setDialog(null)} style={s.statusButton}><Text style={s.link}>Cancel</Text></Pressable>
            </>}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
