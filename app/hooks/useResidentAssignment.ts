
import { useEffect, useState } from 'react';

import {
  getResidentAssignment,
  type ResidentAssignment,
} from '../services/api';


export function useResidentAssignment() {

  const [assignment, setAssignment] =
    useState<ResidentAssignment | null>(null);

  const [loading, setLoading] = useState(true);

  const [assignmentError, setAssignmentError] =
    useState('');


  useEffect(() => {

    let active = true;

    async function loadAssignment() {

      try {

        const result = await getResidentAssignment();

        if (active) {
          setAssignment(result);
        }

      } catch (error) {

        if (active) {
          setAssignmentError(
            error instanceof Error
              ? error.message
              : 'Unable to load housing assignment.'
          );
        }

      } finally {

        if (active) {
          setLoading(false);
        }

      }
    }

    loadAssignment();

    return () => {
      active = false;
    };

  }, []);


  return {
    assignment,
    loading,
    assignmentError,
  };
}
