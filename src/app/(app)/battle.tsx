import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useAuthContext } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import AppNav from '@/components/app-nav';
import Button from '@/components/button';
import { Colors } from '@/constants/colors';
import { pokemonTypeColors } from '@/utils/pokemonColors';
import { Ionicons } from '@expo/vector-icons';

const MAX_HP = 100;

type BattlePokemon = {
  id: number;
  name: string;
  image: string;
  type: string;
};

const MOCK_BATTLE_POKEMONS: BattlePokemon[] = [
  {
    id: 25,
    name: 'pikachu',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    type: 'electric',
  },
  {
    id: 6,
    name: 'charizard',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
    type: 'fire',
  },
  {
    id: 9,
    name: 'blastoise',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
    type: 'water',
  },
  {
    id: 3,
    name: 'venusaur',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png',
    type: 'grass',
  },
  {
    id: 94,
    name: 'gengar',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    type: 'ghost',
  },
  {
    id: 149,
    name: 'dragonite',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',
    type: 'dragon',
  },
];

const RIVAL_TEAM = MOCK_BATTLE_POKEMONS;

function hpBarWidth(hp: number): `${number}%` {
  return `${Math.max(0, Math.min(MAX_HP, hp))}%`;
}

export default function Battle() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 900;

  const { user } = useAuthContext();
  const { team, isLoading: isLoadingTeam, refreshTeam } = useTeam();

  const [playerIndex, setPlayerIndex] = useState(0);
  const [enemyIndex, setEnemyIndex] = useState(0);

  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [enemyHp, setEnemyHp] = useState(MAX_HP);
  const [message, setMessage] = useState('Batalha melhor de 6 iniciada!');
  const [matchFinished, setMatchFinished] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      void refreshTeam();
    }
  }, [refreshTeam, user?.userId]);

  const currentPlayer = useMemo(() => {
    return team && team.length > 0 ? team[playerIndex] : null;
  }, [team, playerIndex]);

  const currentEnemy = useMemo(() => {
    return RIVAL_TEAM[enemyIndex];
  }, [enemyIndex]);

  const resetBattle = useCallback(() => {
    setPlayerIndex(0);
    setEnemyIndex(0);
    setPlayerHp(MAX_HP);
    setEnemyHp(MAX_HP);
    setMatchFinished(false);
    setMessage('Nova batalha melhor de 6 iniciada!');
  }, []);

  function attack() {
    if (matchFinished || !currentPlayer || !currentEnemy) {
      return;
    }

    // Calcular dano base simétrico (8 a 19)
    let damageToEnemy = Math.floor(Math.random() * 12) + 8;
    let damageToPlayer = Math.floor(Math.random() * 12) + 8;

    let playerCrit = false;
    let enemyCrit = false;
    let playerMiss = false;
    let enemyMiss = false;

    // 12% de chance de crítico (1.5x dano)
    if (Math.random() < 0.12) {
      damageToEnemy = Math.floor(damageToEnemy * 1.5);
      playerCrit = true;
    }
    if (Math.random() < 0.12) {
      damageToPlayer = Math.floor(damageToPlayer * 1.5);
      enemyCrit = true;
    }

    // 5% de chance de errar (dano 0)
    if (Math.random() < 0.05) {
      damageToEnemy = 0;
      playerMiss = true;
    }
    if (Math.random() < 0.05) {
      damageToPlayer = 0;
      enemyMiss = true;
    }

    const nextEnemyHp = Math.max(0, enemyHp - damageToEnemy);
    const nextPlayerHp = Math.max(0, playerHp - damageToPlayer);

    setEnemyHp(nextEnemyHp);
    setPlayerHp(nextPlayerHp);

    let roundLog = '';
    if (playerMiss) {
      roundLog += `${currentPlayer.nome} tentou atacar, mas errou! `;
    } else {
      roundLog += `${currentPlayer.nome} atacou causando ${damageToEnemy} de dano em ${currentEnemy.name}${playerCrit ? ' [CRÍTICO!]' : ''}. `;
    }

    if (enemyMiss) {
      roundLog += `${currentEnemy.name} tentou contra-atacar, mas errou!`;
    } else {
      roundLog += `${currentEnemy.name} contra-atacou causando ${damageToPlayer} de dano${enemyCrit ? ' [CRÍTICO!]' : ''}.`;
    }

    if (nextEnemyHp === 0 && nextPlayerHp === 0) {
      // Ambos desmaiaram no mesmo turno
      const hasNextPlayer = playerIndex + 1 < team.length;
      const hasNextEnemy = enemyIndex + 1 < RIVAL_TEAM.length;

      if (hasNextPlayer && hasNextEnemy) {
        setPlayerIndex((prev) => prev + 1);
        setPlayerHp(MAX_HP);
        setEnemyIndex((prev) => prev + 1);
        setEnemyHp(MAX_HP);
        setMessage(`${roundLog}\nAmbos os Pokémon caíram! Os próximos combatentes entram em campo.`);
      } else if (hasNextPlayer && !hasNextEnemy) {
        setMatchFinished(true);
        setMessage(`${roundLog}\nAmbos desmaiaram, mas você ainda tem Pokémon de pé! Vitória!`);
        Alert.alert('Vitória!', 'Você derrotou o time rival na melhor de 6!');
      } else if (!hasNextPlayer && hasNextEnemy) {
        setMatchFinished(true);
        setMessage(`${roundLog}\nAmbos desmaiaram e seu time titular foi derrotado. Derrota!`);
        Alert.alert('Derrota', 'Seu time foi derrotado na melhor de 6.');
      } else {
        setMatchFinished(true);
        setMessage(`${roundLog}\nAmbos desmaiaram e ninguém tem mais combatentes. Empate técnico!`);
        Alert.alert('Empate', 'A batalha terminou em empate técnico!');
      }
    } else if (nextEnemyHp === 0) {
      // Inimigo desmaiou
      const hasNextEnemy = enemyIndex + 1 < RIVAL_TEAM.length;
      if (hasNextEnemy) {
        setEnemyIndex((prev) => prev + 1);
        setEnemyHp(MAX_HP);
        // Jogador mantém a vida atual
        setMessage(`${roundLog}\n${currentEnemy.name} desmaiou! O rival envia o próximo Pokémon.`);
      } else {
        setMatchFinished(true);
        setMessage(`${roundLog}\n${currentEnemy.name} desmaiou! Todos os oponentes derrotados. Vitória!`);
        Alert.alert('Vitória!', 'Você derrotou todos os Pokémons rivais na melhor de 6!');
      }
    } else if (nextPlayerHp === 0) {
      // Jogador desmaiou
      const hasNextPlayer = playerIndex + 1 < team.length;
      if (hasNextPlayer) {
        setPlayerIndex((prev) => prev + 1);
        setPlayerHp(MAX_HP);
        setMessage(`${roundLog}\n${currentPlayer.nome} desmaiou! Seu próximo Pokémon entra na arena.`);
      } else {
        setMatchFinished(true);
        setMessage(`${roundLog}\n${currentPlayer.nome} desmaiou! Todo seu time foi derrotado. Derrota!`);
        Alert.alert('Derrota', 'Seu time titular foi completamente derrotado.');
      }
    } else {
      // Ambos sobreviveram
      setMessage(roundLog);
    }
  }

  const arenaStyle = useMemo(
    () => [styles.arena, isWideLayout ? styles.arenaWide : styles.arenaCompact],
    [isWideLayout]
  );

  const cardStyle = useMemo(
    () => [styles.pokemonCard, isWideLayout ? styles.pokemonCardWide : null],
    [isWideLayout]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppNav />

        <Text style={styles.title}>Área de Batalha</Text>

        {isLoadingTeam ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.btnPrimary} />
            <Text style={styles.emptyText}>Carregando time...</Text>
          </View>
        ) : !team || team.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={80} color={Colors.gray[500]} />
            <Text style={styles.emptyText}>Time titular vazio</Text>
            <Text style={styles.emptySubtext}>
              Você não possui nenhum Pokémon ativo no time titular para batalhar. Monte seu time na tela "Meu Time"!
            </Text>
          </View>
        ) : currentPlayer && currentEnemy ? (
          <>
            <View style={styles.teamStatusContainer}>
              <View style={styles.teamStatusRow}>
                <Text style={styles.statusLabel}>Rival:</Text>
                <View style={styles.pokeballsRow}>
                  {RIVAL_TEAM.map((p, idx) => {
                    const isFainted = idx < enemyIndex;
                    const isActive = idx === enemyIndex;
                    return (
                      <Ionicons
                        key={p.id}
                        name={isActive ? 'radio-button-on' : 'ellipse'}
                        size={18}
                        color={isFainted ? Colors.gray[500] : Colors.pokeballRed}
                        style={isFainted && { opacity: 0.35 }}
                      />
                    );
                  })}
                </View>
              </View>

              <View style={styles.teamStatusRow}>
                <Text style={styles.statusLabel}>Você:</Text>
                <View style={styles.pokeballsRow}>
                  {team.map((p, idx) => {
                    const isFainted = idx < playerIndex;
                    const isActive = idx === playerIndex;
                    return (
                      <Ionicons
                        key={p.id}
                        name={isActive ? 'radio-button-on' : 'ellipse'}
                        size={18}
                        color={isFainted ? Colors.gray[500] : Colors.game.win}
                        style={isFainted && { opacity: 0.35 }}
                      />
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={arenaStyle}>
              <View style={cardStyle}>
                <Text style={styles.pokemonName}>{currentEnemy.name}</Text>
                <View style={styles.typesContainer}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          pokemonTypeColors[currentEnemy.type.toLowerCase()] || '#A8A878',
                        borderColor:
                          pokemonTypeColors[currentEnemy.type.toLowerCase()] || '#A8A878',
                      },
                    ]}
                  >
                    <Text style={[styles.typeText, { color: '#FFF' }]}>{currentEnemy.type}</Text>
                  </View>
                </View>
                <View style={styles.hpTrack}>
                  <View style={[styles.hpFill, styles.enemyHp, { width: hpBarWidth(enemyHp) }]} />
                </View>
                <Text style={styles.hpText}>HP {enemyHp}/{MAX_HP}</Text>
                <Image source={{ uri: currentEnemy.image }} style={styles.enemyImage} resizeMode="contain" />
              </View>

              <View style={[cardStyle, styles.playerCard]}>
                <Text style={styles.pokemonName}>{currentPlayer.nome}</Text>
                <View style={styles.typesContainer}>
                  {currentPlayer.tipos.map((type) => {
                    const tColor = pokemonTypeColors[type.toLowerCase()] || '#A8A878';
                    return (
                      <View
                        key={type}
                        style={[
                          styles.typeBadge,
                          { backgroundColor: tColor, borderColor: tColor },
                        ]}
                      >
                        <Text style={[styles.typeText, { color: '#FFF' }]}>{type}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.hpTrack}>
                  <View style={[styles.hpFill, styles.playerHp, { width: hpBarWidth(playerHp) }]} />
                </View>
                <Text style={styles.hpText}>HP {playerHp}/{MAX_HP}</Text>
                <Image source={{ uri: currentPlayer.imagem }} style={styles.playerImage} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{message}</Text>
            </View>

            <Button
              title="Atacar"
              onPress={attack}
              disabled={matchFinished}
              style={styles.actionButton}
            />
            <Button
              title="Reiniciar batalha"
              variant="surface"
              onPress={resetBattle}
              style={styles.actionButton}
            />
          </>
        ) : null}
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
    paddingBottom: 20,
    gap: 10,
  },
  title: {
    color: Colors.txtPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  arena: {
    gap: 10,
    marginTop: 8,
  },
  arenaCompact: {
    flexDirection: 'column',
  },
  arenaWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  pokemonCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    padding: 14,
  },
  pokemonCardWide: {
    flex: 1,
  },
  playerCard: {
    marginTop: 6,
  },
  pokemonName: {
    color: Colors.txtPrimary,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  hpTrack: {
    marginTop: 8,
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 999,
  },
  enemyHp: {
    backgroundColor: Colors.game.loss,
  },
  playerHp: {
    backgroundColor: Colors.game.win,
  },
  hpText: {
    marginTop: 4,
    color: Colors.gray[500],
    fontSize: 12,
  },
  enemyImage: {
    width: 130,
    height: 130,
    alignSelf: 'flex-end',
  },
  playerImage: {
    width: 140,
    height: 140,
    alignSelf: 'flex-start',
  },
  feedbackBox: {
    marginTop: 12,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: 14,
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedbackText: {
    color: Colors.txtPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 10,
    height: 46,
  },
  teamStatusContainer: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  teamStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    width: 50,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.txtPrimary,
  },
  pokeballsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: Colors.txtPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    color: Colors.gray[500],
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
