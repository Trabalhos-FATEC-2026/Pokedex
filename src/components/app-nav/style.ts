import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha['08'],
    width: '100%',
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.txtPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Sleek dark overlay matching other overlays
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: '75%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.txtPrimary,
    letterSpacing: 0.5,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 24,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: Colors.primaryAlpha['18'],
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  menuItemTextActive: {
    fontWeight: 'bold',
    color: Colors.btnPrimary,
  },
  modalCloseArea: {
    flex: 1,
    height: '100%',
  },
});
