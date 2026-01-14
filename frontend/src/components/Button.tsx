import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'mural';
    className?: string;
    disabled?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Reusable button component with multiple style variants
 */
const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    icon: Icon
}) => {
    const baseStyle = "flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        mural: "bg-slate-900 hover:bg-slate-800 text-white shadow-xl"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {disabled ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (Icon && <Icon className="w-5 h-5 mr-2" />)}
            {children}
        </button>
    );
};

export default Button;
