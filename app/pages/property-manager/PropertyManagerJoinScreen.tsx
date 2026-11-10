import RoleSignUp, { type SignUpNavigationProps } from '../../components/auth/RoleSignUp';

export default function PropertyManagerJoinScreen(props: SignUpNavigationProps) {
  return <RoleSignUp role="property-manager" {...props} />;
}
