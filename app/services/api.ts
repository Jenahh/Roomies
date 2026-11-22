
import type { ResidentUser } from '../data/demoAccount';


const API_URL = 'http://127.0.0.1:8000';

let accessToken: string | null = null;


// ========================================
// AUTHENTICATION TYPES
// ========================================

type BackendRole = 'resident' | 'ra' | 'manager';

type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: BackendUser;
};

const roleMap: Record<BackendRole, ResidentUser['role']> = {
  resident: 'resident',
  ra: 'assistant',
  manager: 'property-manager',
};


// ========================================
// LOGIN
// ========================================

export async function loginUser(
  email: string,
  password: string
): Promise<ResidentUser> {

  let response: Response;

  try {

    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

  } catch {

    throw new Error(
      'Unable to connect to the Roomies server.'
    );

  }

  if (response.status === 401) {
    throw new Error('Incorrect email or password.');
  }

  if (!response.ok) {
    throw new Error(
      'Unable to log in. Please try again.'
    );
  }

  const data: LoginResponse = await response.json();

  accessToken = data.access_token;

  return {
    name: data.user.name,
    email: data.user.email,
    role: roleMap[data.user.role],
  };

}


// ========================================
// AUTHENTICATION TOKEN
// ========================================

// Retrieve the current authentication token.

export function getAccessToken() {
  return accessToken;
}


// Clear the authentication token on logout.

export function logoutUser() {
  accessToken = null;
}


// ========================================
// HOUSING AND STAFF ASSIGNMENT TYPES
// ========================================

export type HousingRecord = {
  id: number;
  name: string;
};

export type StaffMember = {
  id: number;
  name: string;
  email: string;
};

export type ResidentAssignment = {
  property: HousingRecord;
  group: HousingRecord;
  household: HousingRecord;
  resident_assistant: StaffMember;
  property_manager: StaffMember;
};


// ========================================
// RETRIEVE RESIDENT ASSIGNMENT
// ========================================

export async function getResidentAssignment():
  Promise<ResidentAssignment> {

  const token = getAccessToken();

  if (!token) {
    throw new Error('Please log in first.');
  }

  let response: Response;

  try {

    response = await fetch(
      `${API_URL}/resident/assignment`,
      {
        method: 'GET',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  } catch {

    throw new Error(
      'Unable to connect to the Roomies server.'
    );

  }

  if (response.status === 401) {

    throw new Error(
      'Your session has expired. Please log in again.'
    );

  }

  if (!response.ok) {

    throw new Error(
      'Unable to retrieve housing assignment.'
    );

  }

  return await response.json();

}


// ========================================
// SUPPORT REQUEST TYPES
// ========================================

export type SupportRequestCreate = {
  request_type: 'maintenance' | 'ra_message';
  category: string;
  subject: string;
  description: string;
  photo?: string | null;
};

export type SupportRequestResponse = {
  id: number;
  sender_id: number;
  recipient_id: number;
  request_type: 'maintenance' | 'ra_message';
  category: string;
  subject: string;
  description: string;
  photo: string | null;
  status: string;
  created_at: string;
  updated_at: string;

  sender_name?: string | null;
  recipient_name?: string | null;
  household_name?: string | null;
  group_name?: string | null;
  property_name?: string | null;
};

// ========================================
// SUBMIT A SUPPORT REQUEST
// ========================================

// Sends maintenance requests and RA messages
// to the backend.

export async function createSupportRequest(
  request: SupportRequestCreate
): Promise<SupportRequestResponse> {

  const token = getAccessToken();

  if (!token) {
    throw new Error('Please log in first.');
  }

  let response: Response;

  try {

    response = await fetch(
      `${API_URL}/support/requests`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(request),
      }
    );

  } catch {

    throw new Error(
      'Unable to connect to the Roomies server.'
    );

  }

  if (response.status === 401) {

    throw new Error(
      'Your session has expired. Please log in again.'
    );

  }

  if (!response.ok) {

    const error = await response.json()
      .catch(() => null);

    throw new Error(
      typeof error?.detail === 'string'
        ? error.detail
        : 'Unable to submit your request. Please try again.'
    );

  }

  return await response.json();

}


// ========================================
// RETRIEVE SUPPORT REQUESTS
// ========================================

// Retrieves support requests belonging to
// the currently authenticated user.
//
// Residents: their submitted requests.
// RAs: messages addressed to them.
// Managers: maintenance requests addressed to them.

export async function getSupportRequests():
  Promise<SupportRequestResponse[]> {

  const token = getAccessToken();

  if (!token) {
    throw new Error('Please log in first.');
  }

  let response: Response;

  try {

    response = await fetch(
      `${API_URL}/support/requests`,
      {
        method: 'GET',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  } catch {

    throw new Error(
      'Unable to connect to the Roomies server.'
    );

  }

  if (response.status === 401) {

    throw new Error(
      'Your session has expired. Please log in again.'
    );

  }

  if (!response.ok) {

    throw new Error(
      'Unable to retrieve support requests.'
    );

  }

  return await response.json();

}


export type MaintenanceStatus =
  | 'submitted'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export async function updateMaintenanceStatus(
  requestId: number,
  status: MaintenanceStatus
): Promise<SupportRequestResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Please log in first.');
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/support/requests/${requestId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
  } catch {
    throw new Error('Unable to connect to the Roomies server.');
  }

  if (response.status === 401) {
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      typeof error?.detail === 'string'
        ? error.detail
        : 'Unable to update maintenance status.'
    );
  }

  return await response.json();
}


 // ========================================
 // SUPPORT REQUEST REPLIES
 // ========================================

export type SupportReply = {
  id: number;
  request_id: number;
  sender_id: number;
  sender_name: string | null;
  message: string;
  created_at: string;
};

// Retrieve the conversation for a support request.
export async function getSupportReplies(
  requestId: number
): Promise<SupportReply[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Please log in first.');
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/support/requests/${requestId}/replies`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    throw new Error('Unable to connect to the Roomies server.');
  }

  if (response.status === 401) {
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error('Unable to retrieve conversation.');
  }

  return await response.json();
}

// Send a new message in a support request conversation.
export async function sendSupportReply(
  requestId: number,
  message: string
): Promise<SupportReply> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Please log in first.');
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error('Please enter a message.');
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/support/requests/${requestId}/replies`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      }
    );
  } catch {
    throw new Error('Unable to connect to the Roomies server.');
  }

  if (response.status === 401) {
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      typeof error?.detail === 'string'
        ? error.detail
        : 'Unable to send reply.'
    );
  }

  return await response.json();
}


export type RAResident = {
  id: number;
  name: string;
  email: string;
  household_name: string;
  group_name: string;
};

export async function getRAResidents(): Promise<RAResident[]> {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}/ra/residents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to load assigned residents.');
  }

  return response.json();
}

export async function createRAConversation(
  residentId: number,
  subject: string,
  message: string
): Promise<SupportRequestResponse> {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}/ra/conversations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resident_id: residentId,
      subject,
      message,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || 'Unable to start conversation.'
    );
  }

  return response.json();
}
