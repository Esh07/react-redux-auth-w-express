// components/Notification.jsx
import React, { useEffect } from 'react';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';


const iconMap = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon,
};

const bgColorMap = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
};

const textColorMap = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700',
};

// Auto-dismiss logic


export function Notification({
    isVisible = true,
    type = 'success',
    title = 'Success!',
    message = 'Your action was successful.',
    onClose,
    duration = 3000, // Default duration for auto-dismiss
}: {
    isVisible: boolean;
    type?: 'success' | 'error' | 'info';
    title?: string;
    message?: string;
    onClose?: () => void;
    duration?: number; // Duration for auto-dismiss
}) {
    const Icon = iconMap[type] || CheckCircleIcon;
    const bgColor = bgColorMap[type] || 'bg-green-50';
    const textColor = textColorMap[type] || 'text-green-700';

    const [shouldRender, setShouldRender] = React.useState(isVisible);
    const [show, setShow] = React.useState(false);


    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);

            // Let DOM mount first, then trigger animation
            requestAnimationFrame(() => setShow(true));
        } else {
            setShow(false); // Trigger exit animation
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 500); // Match the CSS transition duration
            return () => clearTimeout(timer);
        }

    }, [isVisible]);

    // Auto-dismiss logic
    useEffect(() => {
        if (isVisible && duration && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!shouldRender) return null;

    return (
        <div className={`fixed right-4 top-3 z-50 transition-all duration-500 ease-in-out transform
            ${show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}
        `}>
            <div
                className={`pointer-events-auto w-fit rounded-lg ${bgColor} me-2 pb-2 pt-2 ps-2 bottom-full pr-px shadow-lg`}
                role="alert"
                aria-live="assertive"
            >
                <div className="p-4">
                    <div className="flex flex-start">
                        <div className="flex-shrink-0">
                            <Icon strokeWidth={1.5} fill="none" viewBox="0 0 24 24" stroke='currentColor' className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
                        </div>
                        <div className="ml-3 pt-0.5">
                            <p className={`text-sm font-medium ${textColor}`}>{title}</p>
                            <p className="mt-1 text-sm text-gray-500">{message}</p>
                        </div>
                        {onClose && (
                            <div className="ml-4 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" fill="currentColor" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div>
    );
}
