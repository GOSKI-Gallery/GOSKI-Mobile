import React from "react";
import { View, Image, TextInput, TextInputProps, ImageSourcePropType } from 'react-native';

interface styledTextInputProps extends TextInputProps {
    icon: ImageSourcePropType;
}

const StyledTextInput: React.FC<styledTextInputProps> = ({
    icon,
    className = '',
    ...props
}) => {
    return (
        <View className='flex-row items-center bg-[#D9D9D9] rounded-xl w-full px-4 h-14'>
            {icon && (
                <Image
                    source={icon}
                    className="w-5 h-5 opacity-30 mr-3"
                    resizeMode="contain"
                />
            )}
            <TextInput
                placeholderTextColor="#0000004D"
                className={`flex-1 text-black font-bold text-center h-full ${className}`}
                {...props}
            />

            {icon && <View className="w-5 h-5 ml-3 opacity-0" />}
        </View>
    )
}

export default StyledTextInput;