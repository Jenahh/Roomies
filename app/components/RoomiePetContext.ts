import { createContext } from 'react';
import type { ResidentData } from '../hooks/useResidentData';

// All resident pet icons share the saved look; previews can override it.
export const RoomiePetContext = createContext<ResidentData['pet']>(null);
