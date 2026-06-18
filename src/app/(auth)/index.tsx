import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';

import Card from '@/components/card';
import { Colors } from '@/constants/colors';

export default function Login() {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.innerContainer}>
        {/* Logo/Icone Minimalista */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }} 
            style={styles.logo}
          />
          <Text style={styles.title}>PokéDex</Text>
          <Text style={styles.subtitle}>Faça login para iniciar sua jornada</Text>
        </View>

        <Card authMode />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.txtPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 5,
  },
});