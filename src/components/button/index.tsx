import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { styles } from './style';

type Props = TouchableOpacityProps & {
  title: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'surface' | 'danger';
};

export default function Button({
  title,
  style,
  variant = 'primary',
  ...rest
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.button, styles[variant], style]}
      {...rest}
    >
      <Text
        style={[
          styles.title,
          variant === 'surface' ? styles.titleSurface : null,
          variant === 'danger' ? styles.titleDanger : null,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}