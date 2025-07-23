import React from 'react';
import { Dimensions, LayoutChangeEvent, View, ViewProps } from 'react-native';

const {width: screen_width, height: screen_height} = Dimensions.get('window');

interface OverflowReaderProps extends ViewProps {
    children: React.ReactNode;
}

const isOverflowing = (x: number, y: number, width: number, height: number) => {
    return x < 0 || y < 0 || x + width > screen_width || y + height > screen_height;
}

export const OverFlowReader: React.FC<OverflowReaderProps> = ({children, ...props}) => {
    const onLayout = (event: LayoutChangeEvent) => {
        const {width, height, x, y} = event.nativeEvent.layout;

        if (__DEV__) {
            if (isOverflowing(x, y, width, height)) {
                console.log('OVERFLOW DETECTED');
                console.log('X:', x);
                console.log('Y:', y);
                console.log('Width:', width);
                console.log('Height:', height);
                console.log('Screen Width:', screen_width);
                console.log('Screen Height:', screen_height);
            }
        }
    }
    return (
        <View onLayout={onLayout} style={{ flex: 1 }} {...props}>
            {children}
        </View>
    )
}
