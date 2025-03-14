import React from 'react';

type PasswordStrengthProps = {
  password: string;
};

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  // Calculate password strength
  const getStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    
    return strength;
  };
  
  const strength = getStrength(password);
  
  // Determine color and label based on strength
  const getColor = () => {
    if (password.length === 0) return 'bg-gray-200';
    if (strength < 2) return 'bg-red-500';
    if (strength < 3) return 'bg-orange-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getLabel = () => {
    if (password.length === 0) return '';
    if (strength < 2) return 'Weak';
    if (strength < 3) return 'Fair';
    if (strength < 4) return 'Good';
    return 'Strong';
  };
  
  // Calculate width percentage based on strength
  const getWidth = () => {
    if (password.length === 0) return '0%';
    const percentage = (strength / 5) * 100;
    return `${percentage}%`;
  };
  
  return (
    <div className="space-y-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-300 ease-in-out`} 
          style={{ width: getWidth() }}
        />
      </div>
      {password.length > 0 && (
        <div className="flex justify-between text-xs">
          <span className={`font-medium ${strength < 2 ? 'text-red-500' : strength < 3 ? 'text-orange-500' : strength < 4 ? 'text-yellow-500' : 'text-green-500'}`}>
            {getLabel()}
          </span>
          <span className="text-gray-500">
            {strength < 5 && (
              <>
                {!password.match(/[A-Z]/) && 'Add uppercase • '}
                {!password.match(/[a-z]/) && 'Add lowercase • '}
                {!password.match(/[0-9]/) && 'Add number • '}
                {!password.match(/[^A-Za-z0-9]/) && 'Add special character • '}
                {password.length < 8 && 'At least 8 characters'}
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
