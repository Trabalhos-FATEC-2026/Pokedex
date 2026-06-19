import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';

import { Pokemon } from '@/@type/pokemon';
import { useAuthContext } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { getPokemons } from '@/integration/pokemons';
import { ApiError, getUserFriendlyMessage, parseApiError } from '@/utils/error-handler';
import { Colors } from '@/constants/colors';
import AppNav from '@/components/app-nav';
import Input from '@/components/input';

import PokemonList from '../../components/list';

export default function Pokedex() {
    const { user } = useAuthContext();
    const legendaryIds = useMemo(() => new Set([144, 145, 146, 150, 151]), []);
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [isLoadingPokemon, setIsLoadingPokemon] = useState(false);
    const [pokemonError, setPokemonError] = useState<ApiError | null>(null);
    const {
        team,
        capturedIds,
        isLoading: isLoadingTeam,
        error: teamError,
        refreshTeam,
    } = useTeam();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterLegendary, setFilterLegendary] = useState<boolean | null>(null);
    const [filterCaptured, setFilterCaptured] = useState<boolean | null>(null);

    const loadPokemons = useCallback(async () => {
        setIsLoadingPokemon(true);
        setPokemonError(null);
        try {
            const data = await getPokemons(151);
            setPokemons(data);
        } catch (error) {
            setPokemons([]);
            setPokemonError(parseApiError(error));
        } finally {
            setIsLoadingPokemon(false);
        }
    }, []);

    const safeCapturedIds = Array.isArray(capturedIds)
        ? capturedIds
        : Array.isArray(team)
            ? team.map((pokemon) => pokemon.id)
            : [];

    const uniqueTypes = useMemo(() => {
        const types = new Set<string>();
        pokemons.forEach((pokemon) => {
            pokemon.tipos.forEach((type) => types.add(type));
        });
        return Array.from(types).sort();
    }, [pokemons]);

    useEffect(() => {
        void loadPokemons();
    }, [loadPokemons]);

    useEffect(() => {
        if (user?.userId) {
            void refreshTeam();
        }
    }, [refreshTeam, user?.userId]);

    if (isLoadingPokemon || isLoadingTeam) {
        return (
            <View style={styles.containerCenter}>
                <ActivityIndicator size="large" color={Colors.btnPrimary} />
                <Text style={styles.loadingText}>Carregando Pokémons...</Text>
            </View>
        );
    }

    const errorMessage = pokemonError || teamError;

    const filteredPokemons = pokemons.filter((pokemon) => {
        const matchesSearch = pokemon.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pokemon.index.includes(searchQuery) ||
            String(pokemon.id).includes(searchQuery);

        if (!matchesSearch) return false;

        if (filterType && !pokemon.tipos.includes(filterType)) {
            return false;
        }

        const isLegendary = legendaryIds.has(pokemon.id);
        if (filterLegendary !== null && isLegendary !== filterLegendary) {
            return false;
        }

        const isCaptured = safeCapturedIds.includes(pokemon.id);
        if (filterCaptured !== null && isCaptured !== filterCaptured) {
            return false;
        }

        return true;
    });

    return (
        <ScrollView style={styles.container}>
            <AppNav />
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Pokédex</Text>
                <Text style={styles.subtitle}>Catálogo de Pokémons e status de captura do treinador.</Text>
            </View>
            <Input
                placeholder="Buscar Pokémon por nome ou ID..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
            />
            <View style={styles.filtersContainer}>
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Tipo:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        <Pressable
                            style={[styles.filterTag, !filterType && styles.filterTagActive]}
                            onPress={() => setFilterType(null)}
                        >
                            <Text style={[styles.filterTagText, !filterType && styles.filterTagTextActive]}>Todos</Text>
                        </Pressable>
                        {uniqueTypes.map((type) => (
                            <Pressable
                                key={type}
                                style={[styles.filterTag, filterType === type && styles.filterTagActive]}
                                onPress={() => setFilterType(type === filterType ? null : type)}
                            >
                                <Text style={[styles.filterTagText, filterType === type && styles.filterTagTextActive]}>{type}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.filterRow}>
                    <Pressable
                        style={[styles.filterTag, filterLegendary === true && styles.filterTagActive]}
                        onPress={() => setFilterLegendary(filterLegendary === true ? null : true)}
                    >
                        <Text style={[styles.filterTagText, filterLegendary === true && styles.filterTagTextActive]}>Lendários</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterTag, filterCaptured === true && styles.filterTagActive]}
                        onPress={() => setFilterCaptured(filterCaptured === true ? null : true)}
                    >
                        <Text style={[styles.filterTagText, filterCaptured === true && styles.filterTagTextActive]}>Capturados</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterTag, filterCaptured === false && styles.filterTagActive]}
                        onPress={() => setFilterCaptured(filterCaptured === false ? null : false)}
                    >
                        <Text style={[styles.filterTagText, filterCaptured === false && styles.filterTagTextActive]}>Disponíveis</Text>
                    </Pressable>
                </View>
            </View>

            {errorMessage ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{getUserFriendlyMessage(errorMessage)}</Text>
                </View>
            ) : null}

            {filteredPokemons.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhum Pokémon encontrado com os filtros aplicados.</Text>
                </View>
            ) : (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Resultado</Text>
                        <Text style={styles.sectionSubtitle}>{filteredPokemons.length} Pokémons encontrados</Text>
                    </View>
                    <PokemonList
                        pokemons={filteredPokemons}
                        capturedIds={safeCapturedIds}
                    />
                </>
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
        marginTop: 6,
        textAlign: 'center',
    },
    headerContainer: {
        marginBottom: 12,
        alignItems: 'center',
        paddingHorizontal: 0,
    },
    searchInput: {
        marginBottom: 12,
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
    sectionHeader: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.txtPrimary,
    },
    sectionSubtitle: {
        color: Colors.gray[500],
        marginTop: 4,
    },
    filtersContainer: {
        marginTop: 16,
        gap: 10,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.gray[500],
        textTransform: 'uppercase',
    },
    filterScroll: {
        flex: 1,
    },
    filterTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.borderSoft,
        backgroundColor: Colors.surfaceMuted,
    },
    filterTagActive: {
        backgroundColor: Colors.btnPrimary,
        borderColor: Colors.btnPrimary,
    },
    filterTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.txtPrimary,
        textTransform: 'capitalize',
    },
    filterTagTextActive: {
        color: '#FFF',
    },
});