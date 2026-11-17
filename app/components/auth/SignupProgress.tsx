import '../../styles/SignupProgress.css';

type SignupProgressProps = {
  step: 1 | 2 | 3 | 4;
};

export default function SignupProgress({ step }: SignupProgressProps) {
  return (
    <div
      className="signup-progress"
      role="progressbar"
      aria-label="Sign-up progress"
      aria-valuemin={1}
      aria-valuemax={4}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of 4`}
    >
      {[1, 2, 3, 4].map(segment => (
        <span key={segment} className={segment <= step ? 'signup-progress-segment signup-progress-segment-active' : 'signup-progress-segment'} />
      ))}
    </div>
  );
}
