import React from 'react';
import {
  TextInput,
  TextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';

import styles from './style';

type Props = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

export default function Input({ style, ...rest }: Props) {
  return (
    <TextInput
      placeholderTextColor="#777"
      style={[styles.input, style]}
      {...rest}
    />
  );
}