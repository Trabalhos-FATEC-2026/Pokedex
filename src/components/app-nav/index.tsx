import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { styles } from './style';

type RouteItem = {
  label: string;
  href: '/pokedex' | '/profile' | '/team' | '/battle';
  icon: any; // Using any to avoid type issues with Ionicons name union
};

const routes: RouteItem[] = [
  { label: 'Pokédex', href: '/pokedex', icon: 'book-outline' },
  { label: 'Batalha', href: '/battle', icon: 'flash-outline' },
  { label: 'Meu Time', href: '/team', icon: 'people-outline' },
  { label: 'Perfil', href: '/profile', icon: 'person-outline' },
];

export default function AppNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activeRoute = routes.find((r) => r.href === pathname);
  const screenTitle = activeRoute ? activeRoute.label : 'PokeApp';

  return (
    <View style={styles.headerBar}>
      <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color={Colors.txtPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{screenTitle}</Text>

      <Modal
        transparent={true}
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sidebarContainer}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>PokéMenu</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={26} color={Colors.txtPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuList}>
              {routes.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <TouchableOpacity
                    key={item.href}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => {
                      setIsOpen(false);
                      router.replace(item.href);
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? Colors.btnPrimary : Colors.gray[500]}
                    />
                    <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}
