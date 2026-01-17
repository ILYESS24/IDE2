/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { useNavigate } from "react-router-dom";

interface ButtonGetStartedProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
}

export const ButtonGetStarted = React.memo<ButtonGetStartedProps>(({
    className,
    label: _label = "Get Started",
    ...props
}) => {
    const { user, openSignIn } = useClerkSafe();
    const navigate = useNavigate();

    const CLERK_ENABLED = true; // FORCE ACTIVATION

    const handleClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            // Mode Clerk activé - ouvrir la modal de connexion
            openSignIn();
        }
    };

    if (user) {
        // User is logged in - show Dashboard button
        return (
            <button
                onClick={handleClick}
                className={cn(
                    "relative h-10 px-4 overflow-hidden rounded-full",
                    "bg-black hover:bg-gray-800 active:bg-gray-900",
                    "border-0 outline-none focus:outline-none focus:ring-0",
                    "transition-colors duration-200",
                    "inline-flex items-center justify-center gap-2",
                    className
                )}
                style={{
                    backgroundColor: '#000000',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                }}
            >
                <span className="text-white font-medium">Dashboard</span>
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </button>
        );
    }

    // User is not logged in
    return (
        <button
            onClick={handleClick}
            className={cn(
                "relative h-10 px-4 overflow-hidden rounded-full",
                "bg-black hover:bg-gray-800 active:bg-gray-900",
                "border-0 outline-none focus:outline-none focus:ring-0",
                "transition-colors duration-200",
                "inline-flex items-center justify-center gap-2",
                className
            )}
            style={{
                backgroundColor: '#000000',
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
            }}
            {...props}
        >
            <span className="text-white font-medium">Sign In</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </button>
    );
});

ButtonGetStarted.displayName = "ButtonGetStarted";



