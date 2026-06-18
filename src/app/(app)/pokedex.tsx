import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';

import { Pokemon } from '@/@type/pokemon';
import { useAuthContext } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { usePokemon } from '@/hooks/usePokemon';
import { getUserFriendlyMessage } from '@/utils/error-handler';
import { Colors } from '@/constants/colors';
import AppNav from '@/components/app-nav';
import Card from '@/components/card';
import Input from '@/components/input';

import PokemonList from '../../components/list';

export default function Pokedex() {
    const { user } = useAuthContext();
    const { pokemons, isLoading: isLoadingPokemon, error: pokemonError, fetchPokemons } = usePokemon();
    const {
        team,
        capturedIds,
        isLoading: isLoadingTeam,
        error: teamError,
        refreshTeam,
        capturePokemon,
    } = useTeam();
    const [searchQuery, setSearchQuery] = useState('');

    const safeCapturedIds = Array.isArray(capturedIds)
        ? capturedIds
        : Array.isArray(team)
            ? team.map((pokemon) => pokemon.id)
            : [];

    useEffect(() => {
        void fetchPokemons(151);
    }, [fetchPokemons]);

    useEffect(() => {
        if (user?.userId) {
            void refreshTeam();
        }
    }, [refreshTeam, user?.userId]);

    async function handleCapture(pokemon: Pokemon) {
        try {
            await capturePokemon(pokemon.id);
        } catch (err) {
            const friendlyMessage = getUserFriendlyMessage(err as any);
            Alert.alert('Erro', friendlyMessage);
        }
    }

    if (isLoadingPokemon || isLoadingTeam) {
        return (
            <View style={styles.containerCenter}>
                <ActivityIndicator size="large" color={Colors.btnPrimary} />
                <Text style={styles.loadingText}>Carregando Pokémons...</Text>
            </View>
        );
    }

    const errorMessage = pokemonError || teamError;

    const filteredPokemons = pokemons.filter((pokemon) =>
        pokemon.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pokemon.index.includes(searchQuery) ||
        String(pokemon.id).includes(searchQuery)
    );

    return (
        <ScrollView style={styles.container}>
            <AppNav />
            <Card style={styles.headerCard}>
                <Text style={styles.title}>Pokédex</Text>
                <Input
                    placeholder="Buscar Pokémon por nome ou ID..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />
            </Card>

            {errorMessage ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{getUserFriendlyMessage(errorMessage)}</Text>
                </View>
            ) : null}

            {filteredPokemons.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhum Pokémon encontrado para "{searchQuery}".</Text>
                </View>
            ) : (
                <PokemonList
                    pokemons={filteredPokemons}
                    capturedIds={safeCapturedIds}
                    onAddPokemon={handleCapture}
                />
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.background,
    },
    containerCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.txtPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.gray[500],
    },
    headerCard: {
        marginBottom: 18,
        alignItems: 'center',
        padding: 16,
    },
    searchInput: {
        marginTop: 12,
        marginBottom: 0,
        height: 48,
    },
    fullTeamBanner: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.semantic.warning.border,
        backgroundColor: Colors.semantic.warning.bg,
    },
    fullTeamText: {
        color: Colors.semantic.warning.text,
        fontSize: 13,
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: Colors.gray[500],
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
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: Colors.gray[500],
        fontSize: 16,
        textAlign: 'center',
    },
});