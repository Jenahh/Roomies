import RoleSignUp, { type SignUpNavigationProps } from '../../components/auth/RoleSignUp';

export default function ResidentAssistantJoinScreen(props: SignUpNavigationProps) {
  return <RoleSignUp role="assistant" {...props} />;
}
