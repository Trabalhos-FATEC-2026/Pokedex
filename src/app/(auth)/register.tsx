import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthContext } from '@/context/AuthContext';
import { getUserFriendlyMessage } from '@/utils/error-handler';
import Card from '@/components/card';
import Input from '@/components/input';
import Button from '@/components/button';
import { Colors } from '@/constants/colors';

export default function Register() {
  const { signUp, isLoading, error, clearError } = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleRegister() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    clearError();
    const success = await signUp(username.trim(), password);

    if (success) {
      router.replace('/pokedex');
    } else {
      const message = error ? getUserFriendlyMessage(error) : 'Falha ao criar conta';
      Alert.alert('Erro', message);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
            style={styles.logo}
          />
          <Text style={styles.title}>PokéDex</Text>
          <Text style={styles.subtitle}>Crie sua conta e comece sua jornada</Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Criar conta</Text>
          <Text style={styles.cardSubtitle}>Registre seu treinador para começar.</Text>

          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Usuário"
            placeholderTextColor={Colors.gray[500]}
            autoCapitalize="none"
            editable={!isLoading}
          />

          <View style={styles.passwordContainer}>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              placeholderTextColor={Colors.gray[500]}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.gray[500]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar senha"
              placeholderTextColor={Colors.gray[500]}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.gray[500]}
              />
            </TouchableOpacity>
          </View>

          <Button
            title={isLoading ? 'Criando conta...' : 'Registrar'}
            onPress={() => void handleRegister()}
            disabled={isLoading}
            style={styles.button}
          />

          <Button
            title="Já tenho conta"
            variant="surface"
            onPress={() => router.back()}
            disabled={isLoading}
            style={styles.button}
          />
        </Card>
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
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.txtPrimary,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: Colors.gray[500],
    marginBottom: 16,
    fontSize: 14,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
});
