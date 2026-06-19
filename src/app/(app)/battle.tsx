import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Pokemon } from '@/@type/pokemon';
import AppNav from '@/components/app-nav';
import Button from '@/components/button';
import Card from '@/components/card';
import { Colors } from '@/constants/colors';
import { useAuthContext } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import {
  getPokemonById,
  incrementLosses,
  incrementWins,
} from '@/integration/pokemons';
import { getUserFriendlyMessage } from '@/utils/error-handler';
import { pokemonTypeColors } from '@/utils/pokemonColors';

const MAX_POKEDEX_ID = 151;
const TOTAL_ROUNDS = 5;
const POINTS_TO_WIN = 3;

const STATS_POOL = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

type StatName = (typeof STATS_POOL)[number];
type GameState = 'idle' | 'playing' | 'round_resolved' | 'finished';

type RoundWinner = 'player' | 'enemy' | 'tie';

const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque Especial',
  'special-defense': 'Defesa Especial',
  speed: 'Velocidade',
};

function normalizeStatName(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function getStatValue(pokemon: Pokemon, statName: StatName): number {
  const normalized = normalizeStatName(statName);
  const statObj = pokemon.poderes.find(
    (stat) => normalizeStatName(stat.nome) === normalized
  );

  if (!statObj || !Number.isFinite(statObj.forca)) {
    return 50;
  }

  return statObj.forca;
}

function randomStat(): StatName {
  return STATS_POOL[Math.floor(Math.random() * STATS_POOL.length)];
}

function randomIdExcept(excludedIds: number[]): number {
  const excluded = new Set(excludedIds);
  const available = Array.from({ length: MAX_POKEDEX_ID }, (_, i) => i + 1).filter(
    (id) => !excluded.has(id)
  );

  if (available.length === 0) {
    return Math.floor(Math.random() * MAX_POKEDEX_ID) + 1;
  }

  return available[Math.floor(Math.random() * available.length)];
}

export default function Battle() {
  const { user } = useAuthContext();
  const { team, reserves, capturedIds, isLoading, error, refreshTeam, capturePokemon } = useTeam();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [isPreparingMatch, setIsPreparingMatch] = useState(false);

  const [playerTeamDetailed, setPlayerTeamDetailed] = useState<Pokemon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Pokemon[]>([]);

  const [currentRound, setCurrentRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);

  const [playerSelectedStat, setPlayerSelectedStat] = useState<StatName | null>(null);
  const [enemySelectedStat, setEnemySelectedStat] = useState<StatName | null>(null);
  const [playerStatValue, setPlayerStatValue] = useState(0);
  const [enemyStatValue, setEnemyStatValue] = useState(0);
  const [roundWinner, setRoundWinner] = useState<RoundWinner | null>(null);

  const [battleMessage, setBattleMessage] = useState(
    'Inicie uma partida para jogar 5 rounds (vence quem fizer 3 pontos).'
  );
  const [rewardPokemon, setRewardPokemon] = useState<Pokemon | null>(null);

  const playerPokemon = playerTeamDetailed[currentRound] ?? null;
  const enemyPokemon = enemyTeam[currentRound] ?? null;

  const canStart = team.length >= TOTAL_ROUNDS && !isPreparingMatch;
  const scoreLabel = useMemo(() => `${playerScore} x ${enemyScore}`, [playerScore, enemyScore]);

  const resolveRound = useCallback(
    (roundIndex: number, ownTeam: Pokemon[], rivalTeam: Pokemon[]) => {
      const ownPokemon = ownTeam[roundIndex];
      const rivalPokemon = rivalTeam[roundIndex];

      if (!ownPokemon || !rivalPokemon) {
        return;
      }

      const ownStat = randomStat();
      const rivalStat = randomStat();
      const ownValue = getStatValue(ownPokemon, ownStat);
      const rivalValue = getStatValue(rivalPokemon, rivalStat);

      setPlayerSelectedStat(ownStat);
      setEnemySelectedStat(rivalStat);
      setPlayerStatValue(ownValue);
      setEnemyStatValue(rivalValue);

      if (ownValue > rivalValue) {
        setPlayerScore((prev) => prev + 1);
        setRoundWinner('player');
        setBattleMessage(
          `${ownPokemon.nome.toUpperCase()} venceu: ${STAT_LABELS[ownStat]} (${ownValue}) > ${STAT_LABELS[rivalStat]} (${rivalValue}).`
        );
      } else if (ownValue < rivalValue) {
        setEnemyScore((prev) => prev + 1);
        setRoundWinner('enemy');
        setBattleMessage(
          `${rivalPokemon.nome.toUpperCase()} venceu: ${STAT_LABELS[rivalStat]} (${rivalValue}) > ${STAT_LABELS[ownStat]} (${ownValue}).`
        );
      } else {
        setRoundWinner('tie');
        setBattleMessage(
          `Empate no round: ${STAT_LABELS[ownStat]} (${ownValue}) = ${STAT_LABELS[rivalStat]} (${rivalValue}).`
        );
      }

      setGameState('round_resolved');
    },
    []
  );

  const startMatch = useCallback(async () => {
    if (team.length < TOTAL_ROUNDS) {
      setBattleMessage('Voce precisa de 5 pokemons no time para iniciar a partida.');
      return;
    }

    setIsPreparingMatch(true);
    setRewardPokemon(null);
    setCurrentRound(0);
    setPlayerScore(0);
    setEnemyScore(0);
    setRoundWinner(null);
    setPlayerSelectedStat(null);
    setEnemySelectedStat(null);

    try {
      const playerIds = team.slice(0, TOTAL_ROUNDS).map((pokemon) => pokemon.id);

      const [ownDetailed, rivals] = await Promise.all([
        Promise.all(playerIds.map((id) => getPokemonById(id))),
        Promise.all(
          Array.from({ length: TOTAL_ROUNDS }, () => getPokemonById(randomIdExcept([])))
        ),
      ]);

      setPlayerTeamDetailed(ownDetailed);
      setEnemyTeam(rivals);
      setGameState('playing');
      resolveRound(0, ownDetailed, rivals);
    } catch (err) {
      Alert.alert('Erro ao iniciar partida', getUserFriendlyMessage(err as any));
    } finally {
      setIsPreparingMatch(false);
    }
  }, [resolveRound, team]);

  const finishMatch = useCallback(
    async (finalPlayerScore: number, finalEnemyScore: number) => {
      setGameState('finished');

      if (finalPlayerScore > finalEnemyScore) {
        const blockedIds = [
          ...team.map((pokemon) => pokemon.id),
          ...reserves.map((pokemon) => pokemon.id),
          ...capturedIds,
        ];

        const rewardId = randomIdExcept(blockedIds);
        let rewardPkm: Pokemon | null = null;

        try {
          const reward = await getPokemonById(rewardId);
          rewardPkm = reward;

          if (capturedIds.includes(reward.id)) {
            setRewardPokemon(null);
            setBattleMessage('Voce venceu, mas nao havia novo pokemon disponivel para captura.');
          } else {
            await capturePokemon(reward.id);
            setRewardPokemon(reward);
            setBattleMessage(`Voce venceu! ${reward.nome} foi capturado e enviado para reserva.`);
          }
        } catch (err) {
          Alert.alert('Erro ao capturar recompensa', getUserFriendlyMessage(err as any));
        }

        if (user?.userId) {
          try {
            const updatedProfile = await incrementWins(user.userId);
            const newLevel = updatedProfile.level;
            const oldLevel = 1 + Math.floor((updatedProfile.vitorias - 1) / 5);
            if (newLevel > oldLevel) {
              const levelUpMsg = rewardPkm
                ? `Voce venceu! ${rewardPkm.nome} foi capturado e enviado para reserva.\n🎉 Você subiu para o nível ${newLevel}!`
                : `Voce venceu! 🎉 Você subiu para o nível ${newLevel}!`;
              setBattleMessage(levelUpMsg);
            }
          } catch (err) {
            // Mantem fluxo da batalha mesmo sem update de stats.
          }
        }
      } else if (finalEnemyScore > finalPlayerScore) {
        setRewardPokemon(null);
        setBattleMessage('Derrota na partida. Tente novamente.');

        if (user?.userId) {
          try {
            await incrementLosses(user.userId);
          } catch (err) {
            // Mantem fluxo da batalha mesmo sem update de stats.
          }
        }
      } else {
        setRewardPokemon(null);
        setBattleMessage('Partida empatada.');
      }

      await refreshTeam();
    },
    [capturePokemon, capturedIds, refreshTeam, reserves, team, user?.userId]
  );

  const nextRound = useCallback(async () => {
    const next = currentRound + 1;

    if (
      playerScore >= POINTS_TO_WIN ||
      enemyScore >= POINTS_TO_WIN ||
      next >= TOTAL_ROUNDS
    ) {
      await finishMatch(playerScore, enemyScore);
      return;
    }

    setCurrentRound(next);
    setGameState('playing');
    resolveRound(next, playerTeamDetailed, enemyTeam);
  }, [
    currentRound,
    enemyScore,
    enemyTeam,
    finishMatch,
    playerScore,
    playerTeamDetailed,
    resolveRound,
  ]);

  useEffect(() => {
    void refreshTeam();
  }, [refreshTeam]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppNav />

        {isLoading || isPreparingMatch ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.btnPrimary} />
            <Text style={styles.mutedText}>Preparando batalha...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{getUserFriendlyMessage(error)}</Text>
          </View>
        ) : team.length < TOTAL_ROUNDS ? (
          <View style={styles.centerContent}>
            <Text style={styles.mutedText}>
              Voce precisa de 5 pokemons no time para batalhar.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Card style={styles.messageCard}>
              <Text style={styles.sectionTitle}>Arena 5x5</Text>
              <Text style={styles.scoreText}>Placar: {scoreLabel}</Text>
              <Text style={styles.roundText}>
                Round {Math.min(currentRound + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
              </Text>
              <Text style={styles.messageText}>{battleMessage}</Text>
            </Card>

            {gameState === 'idle' ? (
              <Card style={styles.idleCard}>
                <Text style={styles.idleText}>
                  Partida em 5 rounds. Ganha quem chegar em 3 pontos primeiro.
                </Text>
                <Button
                  title="Iniciar partida"
                  onPress={() => void startMatch()}
                  disabled={!canStart}
                  style={styles.fullButton}
                />
              </Card>
            ) : (
              <>
                <View style={styles.versusContainer}>
                  <Card style={styles.pokemonCard}>
                    <Text style={styles.sideTitle}>Seu Pokemon</Text>
                    {playerPokemon ? (
                      <>
                        <Image source={{ uri: playerPokemon.imagem }} style={styles.pokemonImage} />
                        <Text style={styles.pokemonName}>{playerPokemon.nome}</Text>
                        <Text style={styles.powerText}>
                          {playerSelectedStat ? STAT_LABELS[playerSelectedStat] : '--'}: {playerStatValue}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.mutedText}>Sem pokemon para este round.</Text>
                    )}
                  </Card>

                  <Text style={styles.vsText}>VS</Text>

                  <Card style={styles.pokemonCard}>
                    <Text style={styles.sideTitle}>Inimigo</Text>
                    {enemyPokemon ? (
                      <>
                        <Image source={{ uri: enemyPokemon.imagem }} style={styles.pokemonImage} />
                        <Text style={styles.pokemonName}>{enemyPokemon.nome}</Text>
                        <View style={styles.typesContainer}>
                          {enemyPokemon.tipos.map((type) => {
                            const tColor = pokemonTypeColors[type.toLowerCase()] || '#A8A878';
                            return (
                              <View key={type} style={[styles.typeBadge, { backgroundColor: tColor }]}>
                                <Text style={styles.typeText}>{type}</Text>
                              </View>
                            );
                          })}
                        </View>
                        <Text style={styles.powerText}>
                          {enemySelectedStat ? STAT_LABELS[enemySelectedStat] : '--'}: {enemyStatValue}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.mutedText}>Sem inimigo para este round.</Text>
                    )}
                  </Card>
                </View>

                <Card style={styles.logsCard}>
                  <Text style={styles.sectionTitle}>Resumo do round</Text>
                  <Text style={styles.logLine}>
                    Seu {playerSelectedStat ? STAT_LABELS[playerSelectedStat] : '--'} ({playerStatValue}) x
                    Inimigo {enemySelectedStat ? STAT_LABELS[enemySelectedStat] : '--'} ({enemyStatValue})
                  </Text>
                  <Text style={styles.logLine}>
                    Resultado:{' '}
                    {roundWinner === 'player'
                      ? 'Voce venceu'
                      : roundWinner === 'enemy'
                        ? 'Inimigo venceu'
                        : 'Empate'}
                  </Text>
                </Card>

                {gameState === 'finished' && rewardPokemon ? (
                  <Card style={styles.rewardCard}>
                    <Text style={styles.sectionTitle}>Pokemon capturado</Text>
                    <Image source={{ uri: rewardPokemon.imagem }} style={styles.rewardImage} />
                    <Text style={styles.pokemonName}>{rewardPokemon.nome}</Text>
                    <Text style={styles.mutedText}>Adicionado a sua reserva.</Text>
                  </Card>
                ) : null}

                <View style={styles.actionsRow}>
                  {gameState === 'round_resolved' ? (
                    <Button
                      title={currentRound >= TOTAL_ROUNDS - 1 ? 'Finalizar partida' : 'Proximo round'}
                      onPress={() => void nextRound()}
                      style={styles.actionButton}
                    />
                  ) : null}

                  {gameState === 'finished' ? (
                    <Button
                      title="Nova partida"
                      onPress={() => void startMatch()}
                      style={styles.actionButton}
                    />
                  ) : null}
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 14,
  },
  messageCard: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: 14,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.txtPrimary,
  },
  scoreText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.btnPrimary,
  },
  roundText: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.gray[500],
  },
  messageText: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.gray[800],
  },
  idleCard: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: 14,
    padding: 16,
  },
  idleText: {
    color: Colors.gray[800],
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  fullButton: {
    width: '100%',
    marginTop: 0,
  },
  versusContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 10,
  },
  pokemonCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  sideTitle: {
    color: Colors.gray[500],
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pokemonImage: {
    width: 90,
    height: 90,
  },
  pokemonName: {
    marginTop: 6,
    textTransform: 'capitalize',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.txtPrimary,
    textAlign: 'center',
  },
  powerText: {
    marginTop: 4,
    color: Colors.gray[500],
    fontSize: 13,
    textAlign: 'center',
  },
  vsText: {
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.btnPrimary,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeText: {
    color: Colors.white,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  logsCard: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: 14,
    padding: 12,
  },
  rewardCard: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.game.win,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  rewardImage: {
    width: 120,
    height: 120,
  },
  logLine: {
    fontSize: 13,
    color: Colors.gray[800],
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    marginTop: 0,
  },
  mutedText: {
    marginTop: 10,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  errorText: {
    color: Colors.semantic.error.text,
    textAlign: 'center',
  },
});
