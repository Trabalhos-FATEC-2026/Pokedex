import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  DimensionValue,
} from 'react-native';
import { useAuthContext } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import AppNav from '@/components/app-nav';
import Button from '@/components/button';
import Card from '@/components/card';
import { getUserFriendlyMessage } from '@/utils/error-handler';
import { pokemonTypeColors } from '@/utils/pokemonColors';
import { Pokemon } from '@/@type/pokemon';

export default function MyTeam() {
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const isDesktop = width >= 1200;
  const { user } = useAuthContext();

  const gap = 15;
  const padding = 20;
  const containerWidth = width - padding * 2;

  let cardWidth: DimensionValue = '100%';
  if (isDesktop) {
    cardWidth = Math.floor((containerWidth - gap * 2) / 3);
  } else if (isWide) {
    cardWidth = Math.floor((containerWidth - gap) / 2);
  }

  const getCardStyle = () => ({ width: cardWidth });

  const {
    team,
    reserves,
    isLoading,
    error,
    refreshTeam,
    removeCapturedPokemon,
    promoteReserve,
  } = useTeam();

  // Modal de substituição de titular
  const [swapModal, setSwapModal] = useState<{ starterPokemon: Pokemon } | null>(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      void refreshTeam();
    }
  }, [refreshTeam, user?.userId]);

  async function handleReleasePokemon(pokemonId: number, name: string) {
    Alert.alert(
      'Liberar Pokémon',
      `Tem certeza que deseja liberar ${name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCapturedPokemon(pokemonId);
            } catch (err) {
              Alert.alert('Erro', getUserFriendlyMessage(err as any));
            }
          },
        },
      ]
    );
  }

  async function handleSwapConfirm(reserveId: number) {
    if (!swapModal) return;
    setIsSwapping(true);
    try {
      await promoteReserve(swapModal.starterPokemon.id, reserveId);
      setSwapModal(null);
      setSwapSearch('');
    } catch (err) {
      Alert.alert('Erro ao substituir', getUserFriendlyMessage(err as any));
    } finally {
      setIsSwapping(false);
    }
  }

  const filteredReserves = reserves.filter((r) =>
    r.nome.toLowerCase().includes(swapSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppNav />

        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.btnPrimary} />
            <Text style={styles.emptyText}>Carregando time...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{getUserFriendlyMessage(error)}</Text>
          </View>
        ) : team.length === 0 && reserves.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={80} color={Colors.gray[800]} />
            <Text style={styles.emptyText}>Seu time está vazio. Capture Pokémon na Pokédex!</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Time Titular ({team.length}/5)</Text>
              <Text style={styles.sectionSubtitle}>Os Pokémons ativos do seu time principal</Text>
            </View>

            {team.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="shield-outline" size={32} color={Colors.gray[500]} />
                <Text style={styles.emptySectionText}>
                  Nenhum titular ativo. Promova um reserva ou capture um novo Pokémon!
                </Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {team.map((item) => (
                  <Card key={item.id} style={[styles.card, getCardStyle()]}>
                    <Image source={{ uri: item.imagem }} style={styles.pokemonImage} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{item.nome}</Text>
                      <View style={styles.typesContainer}>
                        {item.tipos.map((type) => {
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
                    </View>
                    <View style={styles.actionsColumn}>
                      <Button
                        title="Substituir"
                        variant="surface"
                        onPress={() => {
                          setSwapSearch('');
                          setSwapModal({ starterPokemon: item });
                        }}
                        style={styles.actionButton}
                        disabled={reserves.length === 0}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Banco de Reservas ({reserves.length})</Text>
              <Text style={styles.sectionSubtitle}>Seus outros Pokémons capturados</Text>
            </View>

            {reserves.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="people-outline" size={32} color={Colors.gray[500]} />
                <Text style={styles.emptySectionText}>Nenhum Pokémon reserva no banco.</Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {reserves.map((item) => (
                  <Card key={item.id} style={[styles.card, getCardStyle()]}>
                    <Image source={{ uri: item.imagem }} style={styles.pokemonImage} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{item.nome}</Text>
                      <View style={styles.typesContainer}>
                        {item.tipos.map((type) => {
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
                    </View>
                    <View style={styles.actionsColumn}>
                      <Button
                        title="Liberar"
                        variant="danger"
                        onPress={() => void handleReleasePokemon(item.id, item.nome)}
                        style={styles.actionButton}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal: Substituir titular por reserva */}
      {swapModal && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setSwapModal(null)}
        >
          <View style={styles.absoluteModalContainer}>
            <Pressable style={styles.modalOverlay} onPress={() => setSwapModal(null)}>
              <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Substituir {swapModal.starterPokemon.nome}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setSwapModal(null)}
                  >
                    <Ionicons name="close" size={24} color={Colors.txtPrimary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSubtitle}>
                  Escolha qual reserva irá substituir este titular
                </Text>

                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar reserva..."
                  placeholderTextColor={Colors.gray[500]}
                  value={swapSearch}
                  onChangeText={setSwapSearch}
                />

                <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                  {filteredReserves.length === 0 ? (
                    <Text style={styles.emptySectionText}>Nenhuma reserva disponível.</Text>
                  ) : (
                    filteredReserves.map((reserve) => (
                      <TouchableOpacity
                        key={reserve.id}
                        style={styles.modalItem}
                        onPress={() => void handleSwapConfirm(reserve.id)}
                        disabled={isSwapping}
                      >
                        <Image source={{ uri: reserve.imagem }} style={styles.modalItemImage} />
                        <View style={styles.modalItemInfo}>
                          <Text style={styles.name}>{reserve.nome}</Text>
                          <View style={styles.typesContainer}>
                            {reserve.tipos.map((type) => {
                              const tColor = pokemonTypeColors[type.toLowerCase()] || '#A8A878';
                              return (
                                <View
                                  key={type}
                                  style={[styles.typeBadge, { backgroundColor: tColor, borderColor: tColor }]}
                                >
                                  <Text style={[styles.typeText, { color: '#FFF' }]}>{type}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                        {isSwapping ? (
                          <ActivityIndicator size="small" color={Colors.btnPrimary} />
                        ) : (
                          <Ionicons name="swap-horizontal" size={20} color={Colors.btnPrimary} />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </Pressable>
            </Pressable>
          </View>
        </Modal>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  scrollArea: {
    flex: 1,
    marginTop: 10,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.txtPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
  emptySection: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderStyle: 'dashed',
  },
  emptySectionText: {
    color: Colors.gray[500],
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    marginBottom: 15,
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
    borderWidth: 0,
    height: 110,
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  pokemonImage: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    color: Colors.txtPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 5,
  },
  typeBadge: {
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  typeText: {
    color: Colors.gray[500],
    fontSize: 10,
    textTransform: 'uppercase',
  },
  actionsColumn: {
    gap: 8,
  },
  actionButton: {
    width: 96,
    height: 32,
    marginTop: 0,
    borderRadius: 8,
  },
  absoluteModalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.txtPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.gray[500],
    marginBottom: 12,
  },
  closeModalButton: {
    padding: 4,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderColor: Colors.borderSoft,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.txtPrimary,
    marginBottom: 16,
  },
  modalList: {
    marginBottom: 16,
    flexShrink: 1,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  modalItemImage: {
    width: 50,
    height: 50,
  },
  modalItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.txtPrimary,
    textTransform: 'capitalize',
  },
  modalEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  modalEmptyText: {
    color: Colors.gray[500],
    fontSize: 16,
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});