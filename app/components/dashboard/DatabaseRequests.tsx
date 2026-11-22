import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { ResidentUser } from '../../data/demoAccount';
import { styles as s } from '../../styles/MaintenanceScreen.styles';

const statuses = ['Open', 'In Progress', 'Closed'] as const;
type Status = typeof statuses[number];
type RequestType = 'Maintenance' | 'RA Concern';
type DatabaseRequest = {
  id: number;
  type: RequestType;
  description: string;
  status: Status;
  property: string;
  unit: string;
  resident: string;
};

async function fetchRequests(email: string, path: string, method: string, body?: object, signal?: AbortSignal) {
  const response = await fetch(path, {
    method, signal,
    headers: { 'X-Roomies-Demo-Email': email, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(result?.requests)) {
    throw new Error(result?.error || 'Could not reach the Roomies API. Check the Python server.');
  }
  return result.requests as DatabaseRequest[];
}

export default function DatabaseRequests({ user, type, onBack }: {
  user: ResidentUser;
  type: RequestType;
  onBack?: () => void;
}) {
  const resident = user.role === 'resident';
  const scope = resident ? 'resident' : user.role === 'assistant' ? 'ra' : 'manager';
  const endpoint = '/api/requests/' + scope;
  const [requests, setRequests] = useState<DatabaseRequest[]>([]);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pending = useRef<AbortController | null>(null);

  async function run(path: string, method: string, body?: object, success = '') {
    if (pending.current) return false;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const rows = await fetchRequests(user.email, path, method, body, controller.signal);
      if (controller.signal.aborted) return false;
      setRequests(rows);
      setNotice(success);
      return true;
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Request failed.');
      return false;
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        if (!controller.signal.aborted) setBusy(false);
      }
    }
  }

  useEffect(() => {
    void run(endpoint, 'GET');
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [endpoint, user.email]);

  async function submit() {
    if (!description.trim()) {
      setError('Enter a description.');
      return;
    }
    if (await run(endpoint, 'POST', { type, description, householdId: user.demoHouseholdId }, 'Request submitted.')) {
      setDescription('');
    }
  }

  const visible = requests.filter(request => request.type === type);
  const title = type === 'Maintenance' ? (resident ? 'Maintenance' : 'Maintenance requests') : (resident ? 'Contact My RA' : 'RA concerns');

  return <>
    {onBack && <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.backArrow}>
      <Text style={s.backArrowText}>{'<'}</Text>
    </Pressable>}
    <View style={s.header}><Text accessibilityRole="header" style={s.title}>{title}</Text></View>
    {resident && <View style={s.form}>
      <Text style={s.label}>Description</Text>
      <TextInput accessibilityLabel={type === 'Maintenance' ? 'Issue description' : 'RA request description'}
        multiline maxLength={2000} value={description} onChangeText={setDescription}
        placeholder={type === 'Maintenance' ? 'Describe the issue and where it is.' : 'Describe what you would like help with.'}
        style={[s.input, s.description]} />
      <Pressable accessibilityRole="button" disabled={busy} style={s.submit} onPress={submit}>
        <Text style={s.submitText}>{type === 'Maintenance' ? 'Submit maintenance request' : 'Submit RA concern'}</Text>
      </Pressable>
    </View>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!!notice && <Text accessibilityLiveRegion="polite" style={s.success}>{notice}</Text>}
    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>{resident ? 'Your requests' : 'Assigned requests'}</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void run(endpoint, 'GET')} style={s.back}>
        <Text style={s.link}>Refresh</Text>
      </Pressable>
    </View>
    <View style={s.requests}>
      {busy && <Text accessibilityLiveRegion="polite" style={s.subtitle}>Working…</Text>}
      {!busy && !error && !visible.length && <Text style={s.subtitle}>No requests yet.</Text>}
      {visible.map(request => <View key={request.id} style={s.form}>
        <Text style={s.detail}>{request.description}</Text>
        <Text style={s.subtitle}>{request.property} · Unit {request.unit}{!resident ? ' · ' + request.resident : ''}</Text>
        <Text style={s.status}>{request.status}</Text>
        {!resident && <View style={s.section}>
          {statuses.map(status => <Pressable key={status} accessibilityRole="button"
            accessibilityLabel={'Set request ' + request.id + ' to ' + status}
            disabled={busy || status === request.status} style={s.back}
            onPress={() => void run(endpoint + '/' + request.id, 'PATCH', { status }, 'Status updated.')}>
            <Text style={status === request.status ? s.subtitle : s.link}>{status}</Text>
          </Pressable>)}
        </View>}
      </View>)}
    </View>
  </>;
}
