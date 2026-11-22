type ResidentInvitation = {
  code: string;
  email: string;
  householdName: string;
};

const storageKey = 'roomies:demo:resident-invitations';

function readInvitations(): ResidentInvitation[] {
  const stored: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(stored)) throw new Error('Invalid invitation data');
  return stored.filter((item): item is ResidentInvitation => typeof item?.code === 'string' && typeof item?.email === 'string' && typeof item?.householdName === 'string');
}

export function createResidentJoinCode(email: string, householdName: string) {
  const invitations = readInvitations();
  let code: string;
  do {
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    code = `R${String(random % 1000000).padStart(6, '0')}`;
  } while (code === 'R123456' || invitations.some(invitation => invitation.code === code));
  localStorage.setItem(storageKey, JSON.stringify([...invitations, { code, email: email.trim().toLowerCase(), householdName }]));
  return code;
}

export function matchesResidentInvitation(code: string, email: string) {
  return readInvitations().some(invitation => invitation.code === code.trim().toUpperCase() && invitation.email === email.trim().toLowerCase());
}
