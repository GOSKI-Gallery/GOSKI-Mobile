import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { View, Modal, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';

interface DropdownMenuProps {
  visible: boolean;
  handleClose: () => void;
  handleOpen: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  dropdownWidth?: number;
};

export const MenuTrigger = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const MenuOption = ({
  onSelect,
  children}: 
  {
    onSelect: () => void;
    children: ReactNode;
  }) => {
  return (
    <TouchableOpacity onPress={onSelect} className='py-3 px-2'>
      {children}
    </TouchableOpacity>
  );
  };

const menuDropDown: React.FC<DropdownMenuProps> = ({
  visible,
  handleOpen,
  handleClose,
  trigger,
  children,
  dropdownWidth = 150,
}) => {
  const triggerRef = useRef<View>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });

  useEffect(() => {
    if (triggerRef.current && visible) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        setPosition({
          x: px - 5,
          y: py + height - 20,
          width: width,
        });
      });
    }
  }, [visible]);

  const childrenArray = React.Children.toArray(children);

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleOpen}>
        <View ref={triggerRef}>{trigger}</View>
      </TouchableWithoutFeedback>
      {visible && (
        <Modal
          transparent={true}
          visible={visible}
          animationType="fade"
          onRequestClose={handleClose}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View className='flex justify-start items-start bg-transparent w-full h-full'>
            <View
                style={{
                  position: 'absolute',
                  top: position.y,
                  left: position.x,
                  width: dropdownWidth,
                }}
                className='bg-[#ECECEC] rounded-md p-2 shadow-lg shadow-black'>
                {childrenArray.map((child, index) => (
                  <React.Fragment key={index}>
                    {child}
                    {index < childrenArray.length - 1 && (
                      <View className="border-b border-gray-300 mx-2" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};
export default menuDropDown;
