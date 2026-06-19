import React, { useCallback, useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { TrainerProfile } from '@/@type/pokemon';
import { getProfile } from '@/integration/pokemons';
import { ApiError, getUserFriendlyMessage, parseApiError } from '@/utils/error-handler';
import { Colors } from '@/constants/colors';
import AppNav from '@/components/app-nav';
import Button from '@/components/button';
import TrainerCard from '@/components/profile/TrainerCard';
import BadgeCase from '@/components/profile/BadgeCase';
import StatCard from '@/components/profile/StatCard';

export default function Profile() {
    const { width } = useWindowDimensions();
    const isWide = width >= 768;
    const { user, signOut } = useAuthContext();
    const { team, isLoading: isLoadingTeam } = useTeam();

    const [profile, setProfile] = useState<TrainerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const loadProfile = useCallback(async (userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getProfile(userId);
            setProfile(data);
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.userId) void loadProfile(user.userId);
    }, [loadProfile, user?.userId]);

    useFocusEffect(
        useCallback(() => {
            if (user?.userId) void loadProfile(user.userId);
        }, [loadProfile, user?.userId])
    );

    const handleLogout = async () => {
        await signOut();
        router.replace('/');
    };

    const trainerId = user?.userId
        ? String(user.userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 137 % 100000).padStart(5, '0')
        : '00001';

    const wins = profile?.vitorias ?? 0;
    const losses = profile?.derrotas ?? 0;
    const totalBattles = wins + losses;
    const level = 1 + Math.floor(wins / 5);
    const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
    const winsToNextLevel = 5;
    const currentLevelWins = wins % winsToNextLevel;

    const teamSlots = Array.from({ length: 5 }, (_, i) => team[i] || null);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <AppNav />

                <View style={styles.header}>
                    <Text style={styles.title}>Perfil do Treinador</Text>
                    <Text style={styles.subtitle}>Gerencie suas informações e insígnias conquistadas</Text>
                </View>

                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{getUserFriendlyMessage(error)}</Text>
                    </View>
                ) : null}

                <View style={isWide ? styles.mainRow : styles.mainColumn}>
                    {/* Coluna 1: Trainer Card */}
                    <View style={isWide ? styles.leftColumn : styles.fullWidth}>
                        <TrainerCard
                            username={profile?.username ?? user?.username ?? '-'}
                            trainerId={trainerId}
                            level={level}
                            currentLevelWins={currentLevelWins}
                            winsToNextLevel={winsToNextLevel}
                            team={teamSlots}
                            isLoadingTeam={isLoadingTeam}
                        />
                    </View>

                    {/* Coluna 2: Estojo de Insígnias */}
                    <View style={isWide ? styles.centerColumn : styles.fullWidth}>
                        <BadgeCase level={level} />
                    </View>

                    {/* Coluna 3: Stats */}
                    <View style={isWide ? styles.rightColumn : styles.fullWidth}>
                        <View style={styles.statsStack}>
                            <StatCard
                                label="Vitórias"
                                value={wins}
                                color={Colors.game.win}
                            />
                            <StatCard
                                label="Derrotas"
                                value={losses}
                                color={Colors.game.loss}
                            />
                            <StatCard
                                label="Aproveitamento"
                                value={`${winRate}%`}
                                color={Colors.btnPrimary}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.actionsRow}>
                    <Button
                        title="Voltar para Pokédex"
                        variant="surface"
                        onPress={() => router.replace('/pokedex')}
                        style={styles.actionBtn}
                    />
                    <Button
                        title="Sair da Conta"
                        variant="danger"
                        onPress={handleLogout}
                        style={styles.actionBtn}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 20,
        marginTop: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.txtPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.gray[500],
        marginTop: 4,
    },
    errorBox: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.semantic.error.border,
        backgroundColor: Colors.semantic.error.bg,
    },
    errorText: {
        color: Colors.semantic.error.text,
    },
    mainRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
        alignItems: 'stretch',
    },
    mainColumn: {
        flexDirection: 'column',
        marginBottom: 20,
    },
    leftColumn: {
        flex: 1.25,
    },
    centerColumn: {
        flex: 1.1,
    },
    rightColumn: {
        flex: 1,
    },
    fullWidth: {
        width: '100%',
    },
    statsStack: {
        flexDirection: 'column',
        gap: 12,
        flex: 1,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    actionBtn: {
        flex: 1,
    },
});
