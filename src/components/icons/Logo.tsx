
import type { HTMLAttributes } from 'react';
import { LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

const Logo = ({ 
  iconClassName, 
  textClassName, 
  showText = true, 
  className, 
  ...props 
}: LogoProps) => {
  return (
    <div
      className={cn("flex items-center gap-x-2", className)}
      aria-label="InsightWise Logo"
      {...props}
    >
      <LineChart className={cn("h-7 w-7", iconClassName)} /> 
      {showText && (
        <span className={cn("font-semibold", textClassName)}>
          InsightWise
        </span>
      )}
    </div>
  );
};

export default Logo;
