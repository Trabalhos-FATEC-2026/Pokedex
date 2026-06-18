import React from 'react';
import { View, Text, Image } from 'react-native';
import { Pokemon } from '@/@type/pokemon';
import Button from '@/components/button';
import { pokemonTypeColors } from '@/utils/pokemonColors';
import styles from './style';

interface PokemonListProps {
    pokemons: Pokemon[];
    capturedIds?: number[];
    onAddPokemon?: (pokemon: Pokemon) => void | Promise<void>;
}

export default function PokemonList({ pokemons, capturedIds = [], onAddPokemon }: PokemonListProps) {
    return (
        <View style={styles.listContainer}>
            {pokemons.map((pokemon) => {
                const primaryType = pokemon.tipos[0]?.toLowerCase() || 'normal';
                const primaryColor = pokemonTypeColors[primaryType] || '#FF6B35';

                return (
                    <View key={pokemon.index} style={styles.card}>
                        
                        <View style={styles.mainInfoRow}>
                            <Image 
                                source={{ uri: pokemon.imagem }} 
                                style={styles.pokemonImage} 
                            />
                            <View style={styles.infoContainer}>
                                <Text style={styles.pokemonIndex}>#{pokemon.index}</Text>
                                <Text style={styles.pokemonName}>{pokemon.nome}</Text>
                                
                                <View style={styles.typesContainer}>
                                    {pokemon.tipos.map((tipo, idx) => {
                                        const tColor = pokemonTypeColors[tipo.toLowerCase()] || '#A8A878';
                                        return (
                                            <View key={idx} style={[styles.typeBadge, { backgroundColor: tColor, borderColor: tColor }]}>
                                                <Text style={[styles.typeText, { color: '#FFF' }]}>{tipo}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsContainer}>
                            <Text style={styles.statsTitle}>Atributos:</Text>
                            <View style={styles.statsList}>
                                {pokemon.poderes.map((poder, idx) => {
                                    const percentage = Math.min(100, Math.max(0, (poder.forca / 150) * 100));
                                    return (
                                        <View key={idx} style={styles.statRow}>
                                            <View style={styles.statInfo}>
                                                <Text style={styles.statName}>{poder.nome}</Text>
                                                <Text style={styles.statValue}>{poder.forca}</Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: primaryColor }]} />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.actionArea}>
                            <Button
                                title={capturedIds.includes(pokemon.id) ? 'Capturado' : 'Capturar'}
                                variant={capturedIds.includes(pokemon.id) ? 'surface' : 'primary'}
                                disabled={capturedIds.includes(pokemon.id)}
                                onPress={() => onAddPokemon?.(pokemon)}
                                style={styles.captureButton}
                            />
                        </View>

                    </View>
                );
            })}
        </View>
    );
}
