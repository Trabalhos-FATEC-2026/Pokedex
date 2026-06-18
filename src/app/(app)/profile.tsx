import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { useAuthContext } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTeam } from '@/context/TeamContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/button';
import AppNav from '@/components/app-nav';
import Card from '@/components/card';
import { Colors } from '@/constants/colors';
import { getUserFriendlyMessage } from '@/utils/error-handler';
import { pokemonTypeColors } from '@/utils/pokemonColors';

export default function Profile() {
    const { width } = useWindowDimensions();
    const isWide = width >= 768;
    const { user, signOut } = useAuthContext();
    const { profile, isLoading, error, fetchProfile } = useProfile();
    const { team } = useTeam();

    useEffect(() => {
        if (user?.userId) {
            void fetchProfile(user.userId);
        }
    }, [fetchProfile, user?.userId]);

    const handleLogout = async () => {
        await signOut();
        router.replace('/');
    };

    // Deterministic Trainer ID based on userId
    const trainerIdNum = user?.userId
        ? String(user.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137 % 100000).padStart(5, '0')
        : '00001';

    // Win Rate calculation
    const level = profile?.level ?? 1;
    const wins = profile?.vitorias ?? 0;
    const losses = profile?.derrotas ?? 0;
    const totalBattles = wins + losses;
    const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

    // Level progress bar (e.g. 5 wins per level)
    const winsToNextLevel = 5;
    const currentLevelWins = wins % winsToNextLevel;
    const xpProgress = (currentLevelWins / winsToNextLevel) * 100;

    // Badges list for Kanto League
    const KANTO_BADGES = [
        { name: 'Rocha', leader: 'Brock', city: 'Pewter', icon: 'square' as const, color: '#9E9E9E', reqLevel: 1 },
        { name: 'Cascata', leader: 'Misty', city: 'Cerulean', icon: 'water' as const, color: '#2196F3', reqLevel: 2 },
        { name: 'Trovão', leader: 'Lt. Surge', city: 'Vermilion', icon: 'flash' as const, color: '#FFEB3B', reqLevel: 3 },
        { name: 'Arco-Íris', leader: 'Erika', city: 'Celadon', icon: 'flower' as const, color: '#E91E63', reqLevel: 4 },
        { name: 'Alma', leader: 'Koga', city: 'Fuchsia', icon: 'shield' as const, color: '#9C27B0', reqLevel: 5 },
        { name: 'Pântano', leader: 'Sabrina', city: 'eye' as const, color: '#FF9800', reqLevel: 6 },
        { name: 'Vulcão', leader: 'Blaine', city: 'Cinnabar', icon: 'flame' as const, color: '#FF5722', reqLevel: 7 },
        { name: 'Terra', leader: 'Giovanni', city: 'Viridian', icon: 'leaf' as const, color: '#4CAF50', reqLevel: 8 },
    ];

    // Fill active team to 6 slots
    const teamSlots = Array.from({ length: 6 }, (_, i) => team[i] || null);

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

                {/* SEÇÃO PRINCIPAL (RESPONSIVA): 3 COLUNAS EM TELAS LARGAS */}
                <View style={isWide ? styles.mainRow : styles.mainColumn}>
                    {/* Coluna 1: Card do Treinador */}
                    <View style={isWide ? styles.leftColumn : styles.fullWidth}>
                        <Card style={[styles.trainerCard, isWide ? { marginBottom: 0 } : null]}>
                            {/* Card Header resembling Pokédex bar */}
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <View style={styles.pokeballHeaderCircle}>
                                        <View style={styles.pokeballHeaderCircleInner} />
                                    </View>
                                    <Text style={styles.cardHeaderTitle}>TRAINER CARD</Text>
                                </View>
                                <Text style={styles.cardHeaderId}>ID No. {trainerIdNum}</Text>
                            </View>

                            {/* Card Body */}
                            <View style={[styles.cardBody, isWide ? styles.cardBodyWide : null]}>
                                {/* Avatar block */}
                                <View style={styles.avatarSection}>
                                    <View style={styles.avatarGlowContainer}>
                                        <View style={styles.avatarPokeballFrame}>
                                            <Image
                                                source={{ uri: 'https://i.pinimg.com/1200x/76/05/27/760527121886945d3c8e8c7c595883b9.jpg' }}
                                                style={styles.avatar}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.badgeLevelContainer}>
                                        <Text style={styles.levelBadgeText}>Lv. {level}</Text>
                                    </View>
                                </View>

                                {/* Info details block */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.trainerLabel}>NOME DO TREINADOR</Text>
                                    <Text style={styles.trainerName}>{profile?.username ?? user?.username ?? '-'}</Text>

                                    <Text style={[styles.trainerLabel, { marginTop: 12 }]}>REGIÃO DE ORIGEM</Text>
                                    <Text style={styles.regionName}>Kanto</Text>

                                    {/* Journey Progress (XP Bar) */}
                                    <View style={styles.xpSection}>
                                        <View style={styles.xpHeader}>
                                            <Text style={styles.xpLabel}>Próximo Nível</Text>
                                            <Text style={styles.xpPercent}>{currentLevelWins}/{winsToNextLevel} vitórias</Text>
                                        </View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${xpProgress}%` }]} />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Active Team display inside the card */}
                            <View style={styles.teamSection}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FF6B35" />
                                ) : (
                                    <>
                                        <Text style={styles.teamTitle}>EQUIPE ATIVA</Text>
                                        <View style={styles.teamGrid}>
                                            {teamSlots.map((pokemon, idx) => {
                                                if (pokemon) {
                                                    const primaryType = pokemon.tipos[0]?.toLowerCase() || 'normal';
                                                    const typeColor = pokemonTypeColors[primaryType] || '#A8A878';
                                                    return (
                                                        <View key={pokemon.id} style={styles.pokemonSlot}>
                                                            <View style={[styles.pokemonSlotIconBg, { backgroundColor: typeColor + '20', borderColor: typeColor }]}>
                                                                <Image source={{ uri: pokemon.imagem }} style={styles.pokemonSlotImage} />
                                                            </View>
                                                            <Text style={styles.pokemonSlotName} numberOfLines={1}>
                                                                {pokemon.nome}
                                                            </Text>
                                                        </View>
                                                    );
                                                }
                                                return (
                                                    <View key={`empty-${idx}`} style={styles.pokemonSlot}>
                                                        <View style={styles.emptySlotIconBg}>
                                                            <Ionicons name="disc" size={20} color="rgba(255, 255, 255, 0.15)" />
                                                        </View>
                                                        <Text style={[styles.pokemonSlotName, { color: 'rgba(255, 255, 255, 0.3)' }]}>
                                                            Vazio
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </>
                                )}
                            </View>
                        </Card>
                    </View>

                    {/* Coluna 2: Estojo de Insígnias (Meio) */}
                    <View style={isWide ? styles.centerColumn : styles.fullWidth}>
                        <Card style={[styles.badgeCase, isWide ? { marginBottom: 0, height: '100%', justifyContent: 'center' } : null]}>
                            <View style={styles.badgeCaseHeader}>
                                <Ionicons name="trophy-outline" size={20} color={Colors.btnPrimary} />
                                <Text style={styles.badgeCaseTitle}>ESTOJO DE INSÍGNIAS (LIGA KANTO)</Text>
                            </View>
                            <Text style={styles.badgeCaseSubtitle}>Adquira novos níveis para ganhar insígnias de Ginásio</Text>

                            <View style={styles.badgesGrid}>
                                {KANTO_BADGES.map((badge) => {
                                    const isUnlocked = level >= badge.reqLevel;
                                    return (
                                        <View key={badge.name} style={[styles.badgeSlot, !isUnlocked && styles.badgeSlotLocked]}>
                                            <View style={[
                                                styles.badgeCircle,
                                                isUnlocked ? { backgroundColor: badge.color + '15', borderColor: badge.color } : styles.badgeCircleLocked
                                            ]}>
                                                <Ionicons
                                                    name={badge.icon}
                                                    size={24}
                                                    color={isUnlocked ? badge.color : Colors.gray[500]}
                                                />
                                            </View>
                                            <Text style={[styles.badgeName, isUnlocked ? { color: Colors.txtPrimary } : { color: Colors.gray[500] }]}>
                                                {badge.name}
                                            </Text>
                                            <Text style={styles.badgeLeader} numberOfLines={1}>
                                                {badge.leader}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </Card>
                    </View>

                    {/* Coluna 3: Estatísticas empilhadas verticalmente */}
                    <View style={isWide ? styles.rightColumn : styles.fullWidth}>
                        <View style={styles.statsVerticalStack}>
                            {/* Card 1: Vitórias */}
                            <Card style={[styles.statCard, { borderLeftColor: Colors.game.win, borderLeftWidth: 4 }]}>
                                <View style={styles.statCardHeader}>
                                    <Text style={styles.statCardTitle}>Vitórias</Text>
                                    <Ionicons name="ribbon-outline" size={22} color={Colors.game.win} />
                                </View>
                                <Text style={[styles.statCardValue, { color: Colors.game.win }]}>{wins}</Text>
                            </Card>

                            {/* Card 2: Derrotas */}
                            <Card style={[styles.statCard, { borderLeftColor: Colors.game.loss, borderLeftWidth: 4 }]}>
                                <View style={styles.statCardHeader}>
                                    <Text style={styles.statCardTitle}>Derrotas</Text>
                                    <Ionicons name="heart-dislike-outline" size={22} color={Colors.game.loss} />
                                </View>
                                <Text style={[styles.statCardValue, { color: Colors.game.loss }]}>{losses}</Text>
                            </Card>

                            {/* Card 3: Aproveitamento */}
                            <Card style={[styles.statCard, { borderLeftColor: Colors.btnPrimary, borderLeftWidth: 4, marginBottom: 0 }]}>
                                <View style={styles.statCardHeader}>
                                    <Text style={styles.statCardTitle}>Aproveitamento</Text>
                                    <Ionicons name="analytics-outline" size={22} color={Colors.btnPrimary} />
                                </View>
                                <Text style={styles.statCardValue}>{winRate}%</Text>
                                <Text style={styles.totalBattlesLabel}>{totalBattles} batalhas totais</Text>
                            </Card>
                        </View>
                    </View>
                </View>

                {/* BOTTOM BUTTONS */}
                <View style={styles.actionButtonsContainer}>
                    <Button
                        title="Voltar para Pokédex"
                        variant="surface"
                        onPress={() => router.replace('/pokedex')}
                        style={styles.backButton}
                    />
                    <Button
                        title="Sair da Conta"
                        variant="danger"
                        onPress={handleLogout}
                        style={styles.logoutButton}
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
    // ESTILIZAÇÃO DO CARTÃO DE TREINADOR
    trainerCard: {
        backgroundColor: '#1E293B', // Metallic grey slate
        borderRadius: 24,
        padding: 0,
        overflow: 'hidden',
        borderWidth: 2.5,
        borderColor: '#FF6B35', // Orange highlight border
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FF1C1C', // Pokeball Red
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 3,
        borderBottomColor: '#000000',
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pokeballHeaderCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pokeballHeaderCircleInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF1C1C',
    },
    cardHeaderTitle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 2,
    },
    cardHeaderId: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    cardBody: {
        padding: 20,
        flexDirection: 'column',
        gap: 20,
    },
    cardBodyWide: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarSection: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginRight: 10,
    },
    avatarGlowContainer: {
        padding: 4,
        borderRadius: 64,
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
    },
    avatarPokeballFrame: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    badgeLevelContainer: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: '#FFD600', // Gold level badge
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderWidth: 1.5,
        borderColor: '#000000',
    },
    levelBadgeText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    infoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    trainerLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    trainerName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    regionName: {
        color: '#4ADE80', // Beautiful emerald green
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 2,
    },
    xpSection: {
        marginTop: 15,
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    xpLabel: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
    },
    xpPercent: {
        color: '#FFD600',
        fontSize: 11,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#FFD600', // Gold filling
    },
    // SEÇÃO DA EQUIPE
    teamSection: {
        borderTopWidth: 1.5,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    teamTitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 12,
    },
    teamGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    pokemonSlot: {
        width: '14.5%',
        alignItems: 'center',
        minWidth: 50,
    },
    pokemonSlotIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    pokemonSlotImage: {
        width: 38,
        height: 38,
    },
    pokemonSlotName: {
        color: '#E2E8F0',
        fontSize: 9,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
        textTransform: 'capitalize',
        width: '100%',
    },
    emptySlotIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    // ESTOJO DE INSÍGNIAS
    badgeCase: {
        backgroundColor: Colors.surfaceCard,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.borderSoft,
    },
    badgeCaseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    badgeCaseTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.txtPrimary,
    },
    badgeCaseSubtitle: {
        fontSize: 11,
        color: Colors.gray[500],
        marginBottom: 16,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 14,
    },
    badgeSlot: {
        width: '23%',
        alignItems: 'center',
    },
    badgeSlotLocked: {
        opacity: 0.35,
    },
    badgeCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    badgeCircleLocked: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderColor: Colors.borderSoft,
    },
    badgeName: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    badgeLeader: {
        fontSize: 9,
        color: Colors.gray[500],
        textAlign: 'center',
        marginTop: 1,
    },
    // RESPONSIVE THREE COLUMN LAYOUT
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
    statsVerticalStack: {
        flexDirection: 'column',
        gap: 12,
        flex: 1,
    },
    statCard: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.borderSoft,
        justifyContent: 'center',
        backgroundColor: Colors.surfaceCard,
    },
    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statCardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.gray[500],
    },
    statCardValue: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.txtPrimary,
        marginTop: 4,
    },
    totalBattlesLabel: {
        fontSize: 9,
        color: Colors.gray[500],
        marginTop: 2,
    },
    // BUTTONS ACTION
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    backButton: {
        flex: 1,
    },
    logoutButton: {
        flex: 1,
    },
});