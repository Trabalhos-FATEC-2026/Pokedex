import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/card';
import { Colors } from '@/constants/colors';

interface Badge {
    name: string;
    leader: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    reqLevel: number;
}

const KANTO_BADGES: Badge[] = [
    { name: 'Rocha', leader: 'Brock', icon: 'square', color: '#9E9E9E', reqLevel: 1 },
    { name: 'Cascata', leader: 'Misty', icon: 'water', color: '#2196F3', reqLevel: 2 },
    { name: 'Trovão', leader: 'Lt. Surge', icon: 'flash', color: '#FFEB3B', reqLevel: 3 },
    { name: 'Arco-Íris', leader: 'Erika', icon: 'flower', color: '#E91E63', reqLevel: 4 },
    { name: 'Alma', leader: 'Koga', icon: 'shield', color: '#9C27B0', reqLevel: 5 },
    { name: 'Pântano', leader: 'Sabrina', icon: 'eye', color: '#FF9800', reqLevel: 6 },
    { name: 'Vulcão', leader: 'Blaine', icon: 'flame', color: '#FF5722', reqLevel: 7 },
    { name: 'Terra', leader: 'Giovanni', icon: 'leaf', color: '#4CAF50', reqLevel: 8 },
];

interface BadgeCaseProps {
    level: number;
}

export default function BadgeCase({ level }: BadgeCaseProps) {
    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="trophy-outline" size={20} color={Colors.btnPrimary} />
                <Text style={styles.title}>ESTOJO DE INSÍGNIAS (LIGA KANTO)</Text>
            </View>
            <Text style={styles.subtitle}>Adquira novos níveis para ganhar insígnias de Ginásio</Text>

            <View style={styles.grid}>
                {KANTO_BADGES.map((badge) => {
                    const unlocked = level >= badge.reqLevel;
                    return (
                        <View key={badge.name} style={[styles.slot, !unlocked && styles.slotLocked]}>
                            <View style={[
                                styles.circle,
                                unlocked
                                    ? { backgroundColor: badge.color + '15', borderColor: badge.color }
                                    : styles.circleLocked,
                            ]}>
                                <Ionicons
                                    name={badge.icon}
                                    size={24}
                                    color={unlocked ? badge.color : Colors.gray[500]}
                                />
                            </View>
                            <Text style={[styles.name, { color: unlocked ? Colors.txtPrimary : Colors.gray[500] }]}>
                                {badge.name}
                            </Text>
                            <Text style={styles.leader} numberOfLines={1}>{badge.leader}</Text>
                        </View>
                    );
                })}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surfaceCard,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.borderSoft,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.txtPrimary,
    },
    subtitle: {
        fontSize: 11,
        color: Colors.gray[500],
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 14,
    },
    slot: {
        width: '23%',
        alignItems: 'center',
    },
    slotLocked: {
        opacity: 0.35,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    circleLocked: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderColor: Colors.borderSoft,
    },
    name: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    leader: {
        fontSize: 9,
        color: Colors.gray[500],
        textAlign: 'center',
        marginTop: 1,
    },
});
