import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import Button from '@/components/button';

type Props = {
  onLogout: () => void;
};

export default function Dashboard({ onLogout }: Props) {
  const { width } = useWindowDimensions();
  
  const isSmallScreen = width < 380;

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.banner}>
        <Text style={[styles.bannerTitle, isSmallScreen && styles.bannerTitleSmall]}>
          BRASIL 🇧🇷
        </Text>

        <Text style={[styles.bannerSubtitle, isSmallScreen && styles.bannerSubtitleSmall]}>
          Dashboard Oficial da Copa
        </Text>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>5</Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Copas do Mundo
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>200+</Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Vitórias
          </Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>100%</Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Paixão Nacional
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>⚽</Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Futebol Arte
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={[styles.infoTitle, isSmallScreen && styles.infoTitleSmall]}>
          Rumo ao Hexa 🏆
        </Text>

        <Text style={[styles.infoText, isSmallScreen && styles.infoTextSmall]}>
          Acompanhe estatísticas, partidas e novidades da seleção brasileira.
        </Text>
      </View>

      {/* botão */}
      <View style={styles.actions}>
        <Button
          title="Sair"
          onPress={onLogout}
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#021B12',
    flexGrow: 1, 
  },

  banner: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,223,0,0.25)',
    marginBottom: 26,
    shadowColor: '#FFDF00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },

  bannerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFDF00',
    letterSpacing: 2,
  },
  bannerTitleSmall: {
    fontSize: 28, 
  },

  bannerSubtitle: {
    marginTop: 10,
    color: '#E8F5E9',
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.9,
  },
  bannerSubtitleSmall: {
    fontSize: 13,
  },

  cardsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  statCard: {
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 6,
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,223,0,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },

  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFDF00',
  },
  statValueSmall: {
    fontSize: 22,
  },

  statLabel: {
    marginTop: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 13,
  },
  statLabelSmall: {
    fontSize: 11,
  },

  infoBox: {
    width: '100%',
    marginTop: 18,
    backgroundColor: 'rgba(0,255,120,0.10)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(0,255,120,0.18)',
  },

  infoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFDF00',
    marginBottom: 10,
  },
  infoTitleSmall: {
    fontSize: 18,
  },

  infoText: {
    color: '#F5F5F5',
    lineHeight: 22,
    fontSize: 15,
  },
  infoTextSmall: {
    fontSize: 13,
    lineHeight: 18,
  },

  actions: {
    width: '100%',
    marginTop: 28,
  },
});