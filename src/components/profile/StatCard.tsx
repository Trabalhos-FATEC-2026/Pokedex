import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/card';
import { Colors } from '@/constants/colors';

interface StatCardProps {
    label: string;
    value: string | number;
    color: string;
}

export default function StatCard({ label, value, color }: StatCardProps) {
    return (
        <Card style={[styles.card, { borderLeftColor: color }]}>
            <Text style={[styles.label, { color: Colors.gray[500] }]}>{label}</Text>
            <Text style={[styles.value, { color }]}>{value}</Text>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderLeftWidth: 4,
        borderColor: Colors.borderSoft,
        backgroundColor: Colors.surfaceCard,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 4,
    },
});

