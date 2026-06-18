import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthContext } from '@/context/AuthContext';
import { getUserFriendlyMessage } from '@/utils/error-handler';

import styles from './style';
import Input from '../input';
import Button from '../button';

type Props = {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
    style?: StyleProp<ViewStyle>;
    authMode?: boolean;
    onLoginSuccess?: () => void;
};

export default function Card({
    children,
    title,
    subtitle,
    style,
    authMode = false,
    onLoginSuccess,
}: Props) {
    const router = useRouter();
    const { signIn, signUp, isLoading, error, clearError } = useAuthContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleSubmit() {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Erro', 'Preencha usuário e senha');
            return;
        }

        if (isRegisterMode && password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas nao conferem');
            return;
        }

        clearError();
        const success = isRegisterMode
            ? await signUp(username.trim(), password)
            : await signIn(username.trim(), password);

        if (success) {
            if (onLoginSuccess) {
                onLoginSuccess();
                return;
            }

            router.replace('/pokedex');
        } else {
            const message = error
                ? getUserFriendlyMessage(error)
                : isRegisterMode
                    ? 'Falha ao criar conta'
                    : 'Usuario ou senha incorretos';
            Alert.alert('Erro', message);
        }
    }

    function toggleMode() {
        clearError();
        setIsRegisterMode((prev) => !prev);
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    }

    if (!authMode) {
        return (
            <View style={[styles.card, style]}>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {children}
            </View>
        );
    }

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>{isRegisterMode ? 'Criar conta' : 'Acesse sua conta'}</Text>
            <Text style={styles.subtitle}>
                {isRegisterMode ? 'Registre seu treinador para comecar.' : 'Entre para continuar sua jornada.'}
            </Text>

            <Input
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholder="Usuário"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                editable={!isLoading}
            />

            <View style={styles.passwordFieldContainer}>
                <Input
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.input, styles.passwordInput, { marginTop: 10 }]}
                    placeholder="Senha"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
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
                        color="#64748B"
                    />
                </TouchableOpacity>
            </View>

            {isRegisterMode ? (
                <View style={styles.passwordFieldContainer}>
                    <Input
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={[styles.input, styles.passwordInput, { marginTop: 10 }]}
                        placeholder="Confirmar senha"
                        placeholderTextColor="#64748B"
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
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
                            color="#64748B"
                        />
                    </TouchableOpacity>
                </View>
            ) : null}

            <Button
                title={
                    isLoading
                        ? isRegisterMode
                            ? 'Criando conta...'
                            : 'Entrando...'
                        : isRegisterMode
                            ? 'Registrar'
                            : 'Entrar'
                }
                style={styles.button}
                onPress={() => void handleSubmit()}
                disabled={isLoading}
            />

            <Button
                title={isRegisterMode ? 'Ja tenho conta' : 'Criar nova conta'}
                variant="surface"
                style={styles.secondaryButton}
                onPress={toggleMode}
                disabled={isLoading}
            />
        </View>
    );
}