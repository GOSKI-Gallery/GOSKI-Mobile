import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';


interface PrimaryButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'solid' | 'outline';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    loading = false,
    variant = 'solid',
    disabled,
    className = '',
    ...props
}) => {

    const isSolid = variant === 'solid';

    const buttonClasses = isSolid
        ? 'bg-[#1000FF] border-[#1000FF]'
        : 'bg-transparent border-[#1000FF]';

    const textClasses = isSolid
        ? 'text-white'
        : 'text-[#1000FF]';


    const isButtonDisabled = disabled || loading;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className={`py-3 px-20 rounded-2xl min-h-[56px] flex items-center justify-center mt-2 ${buttonClasses} ${isButtonDisabled ? 'opacity-50' : ''} ${className}`}
            disabled={isButtonDisabled}
            {...props}
        >
            {loading ? (

                <ActivityIndicator size="small" color={isSolid ? 'white' : '#1000FF'} />
            ) : (

                <Text className={`font-bold text-lg text-center ${textClasses}`}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default PrimaryButton;