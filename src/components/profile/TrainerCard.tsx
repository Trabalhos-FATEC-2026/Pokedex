import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/card';
import { Pokemon } from '@/@type/pokemon';
import { pokemonTypeColors } from '@/utils/pokemonColors';

interface TrainerCardProps {
    username: string;
    trainerId: string;
    level: number;
    currentLevelWins: number;
    winsToNextLevel: number;
    team: (Pokemon | null)[];
    isLoadingTeam: boolean;
}

export default function TrainerCard({
    username,
    trainerId,
    level,
    currentLevelWins,
    winsToNextLevel,
    team,
    isLoadingTeam,
}: TrainerCardProps) {
    const xpProgress = (currentLevelWins / winsToNextLevel) * 100;

    return (
        <Card style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.pokeballCircle}>
                        <View style={styles.pokeballCircleInner} />
                    </View>
                    <Text style={styles.cardHeaderTitle}>TRAINER CARD</Text>
                </View>
                <Text style={styles.cardHeaderId}>ID No. {trainerId}</Text>
            </View>

            {/* Body */}
            <View style={styles.cardBody}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarGlow}>
                        <View style={styles.avatarFrame}>
                            <Image
                                source={{ uri: 'https://i.pinimg.com/1200x/76/05/27/760527121886945d3c8e8c7c595883b9.jpg' }}
                                style={styles.avatar}
                            />
                        </View>
                    </View>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>Lv. {level}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.label}>NOME DO TREINADOR</Text>
                    <Text style={styles.trainerName}>{username}</Text>

                    <Text style={[styles.label, { marginTop: 12 }]}>REGIÃO DE ORIGEM</Text>
                    <Text style={styles.region}>Kanto</Text>

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

            {/* Team */}
            <View style={styles.teamSection}>
                {isLoadingTeam ? (
                    <ActivityIndicator size="small" color="#FF6B35" />
                ) : (
                    <>
                        <Text style={styles.teamTitle}>EQUIPE ATIVA</Text>
                        <View style={styles.teamGrid}>
                            {team.map((pokemon, idx) => {
                                if (pokemon) {
                                    const primaryType = pokemon.tipos[0]?.toLowerCase() || 'normal';
                                    const typeColor = pokemonTypeColors[primaryType] || '#A8A878';
                                    return (
                                        <View key={pokemon.id} style={styles.slot}>
                                            <View style={[styles.slotBg, { backgroundColor: typeColor + '20', borderColor: typeColor }]}>
                                                <Image source={{ uri: pokemon.imagem }} style={styles.slotImage} />
                                            </View>
                                            <Text style={styles.slotName} numberOfLines={1}>{pokemon.nome}</Text>
                                        </View>
                                    );
                                }
                                return (
                                    <View key={`empty-${idx}`} style={styles.slot}>
                                        <View style={styles.emptySlot}>
                                            <Ionicons name="disc" size={20} color="rgba(255,255,255,0.15)" />
                                        </View>
                                        <Text style={styles.emptySlotName}>Vazio</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 0,
        overflow: 'hidden',
        borderWidth: 2.5,
        borderColor: '#FF6B35',
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
        backgroundColor: '#FF1C1C',
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
    pokeballCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pokeballCircleInner: {
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    avatarSection: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarGlow: {
        padding: 4,
        borderRadius: 64,
        backgroundColor: 'rgba(255,107,53,0.15)',
    },
    avatarFrame: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: '#FFD600',
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
    label: {
        color: 'rgba(255,255,255,0.4)',
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
    region: {
        color: '#4ADE80',
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
        backgroundColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#FFD600',
    },
    teamSection: {
        borderTopWidth: 1.5,
        borderTopColor: 'rgba(255,255,255,0.08)',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    teamTitle: {
        color: 'rgba(255,255,255,0.5)',
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
    slot: {
        width: '14.5%',
        alignItems: 'center',
        minWidth: 50,
    },
    slotBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    slotImage: {
        width: 38,
        height: 38,
    },
    slotName: {
        color: '#E2E8F0',
        fontSize: 9,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
        textTransform: 'capitalize',
        width: '100%',
    },
    emptySlot: {
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
    emptySlotName: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
    },
});
