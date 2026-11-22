import RoleSignUp, { type SignUpNavigationProps } from '../../components/auth/RoleSignUp';

export default function ResidentSignUp(props: SignUpNavigationProps) {
  return <RoleSignUp role="resident" {...props} />;
}
