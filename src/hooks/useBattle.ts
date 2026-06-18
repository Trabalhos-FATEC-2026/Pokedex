/**
 * Hook customizado para batalha
 * Placeholder para futuras integrações com API de batalha
 * Gerencia estado local de batalha enquanto não há backend
 */

import { useState, useCallback } from 'react';
import { BattleState, BattleAction, BattleResult } from '@/@type/battle';
import { Pokemon } from '@/@type/pokemon';
import { ApiError } from '@/utils/error-handler';

interface UseBattleReturn {
  state: BattleState;
  isLoading: boolean;
  error: ApiError | null;
  startBattle: (playerPokemon: Pokemon, enemyPokemon: Pokemon) => void;
  executeBattleAction: (action: BattleAction) => void;
  endBattle: (result: BattleResult) => void;
  resetBattle: () => void;
  clearError: () => void;
}

const initialState: BattleState = {
  playerPokemon: null,
  enemyPokemon: null,
  playerHp: 0,
  enemyHp: 0,
  battleLog: [],
  isFinished: false,
  winner: null,
};

export function useBattle(): UseBattleReturn {
  const [state, setState] = useState<BattleState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Iniciar batalha
  const startBattle = useCallback((playerPokemon: Pokemon, enemyPokemon: Pokemon) => {
    setState({
      playerPokemon,
      enemyPokemon,
      playerHp: 100,
      enemyHp: 100,
      battleLog: ['Batalha iniciada!'],
      isFinished: false,
      winner: null,
    });
  }, []);

  // Executar ação de batalha
  const executeBattleAction = useCallback((action: BattleAction) => {
    setState((prev) => {
      if (prev.isFinished) return prev;

      const newLog = [...prev.battleLog];
      let newPlayerHp = prev.playerHp;
      let newEnemyHp = prev.enemyHp;
      let newWinner: 'player' | 'enemy' | null = null;
      let isFinished = false;

      if (action.type === 'attack' && action.damage) {
        newEnemyHp = Math.max(0, newEnemyHp - action.damage);
        newLog.push(`${prev.playerPokemon?.nome} atacou causando ${action.damage} de dano!`);

        // Contra-ataque
        const counterDamage = Math.floor(Math.random() * 20) + 5;
        newPlayerHp = Math.max(0, newPlayerHp - counterDamage);
        newLog.push(
          `${prev.enemyPokemon?.nome} contra-atacou causando ${counterDamage} de dano!`
        );

        // Verificar vitória
        if (newEnemyHp === 0) {
          isFinished = true;
          newWinner = 'player';
          newLog.push(`${prev.playerPokemon?.nome} venceu!`);
        } else if (newPlayerHp === 0) {
          isFinished = true;
          newWinner = 'enemy';
          newLog.push(`${prev.enemyPokemon?.nome} venceu!`);
        }
      }

      return {
        ...prev,
        playerHp: newPlayerHp,
        enemyHp: newEnemyHp,
        battleLog: newLog,
        isFinished,
        winner: newWinner,
      };
    });
  }, []);

  // Finalizar batalha
  const endBattle = useCallback((result: BattleResult) => {
    setIsLoading(true);
    try {
      // Aqui será integrado com API quando disponível
      console.log('Batalha finalizada:', result);
      setState((prev) => ({
        ...prev,
        isFinished: true,
        battleLog: [...prev.battleLog, `Experiência ganha: ${result.experienceGained}`],
      }));
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resetar batalha
  const resetBattle = useCallback(() => {
    setState(initialState);
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state,
    isLoading,
    error,
    startBattle,
    executeBattleAction,
    endBattle,
    resetBattle,
    clearError,
  };
}
