import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';

import styles from './style';

type Props = {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
    style?: StyleProp<ViewStyle>;
};

export default function Card({ children, title, subtitle, style }: Props) {
    return (
        <View style={[styles.card, style]}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {children}
        </View>
    );
}