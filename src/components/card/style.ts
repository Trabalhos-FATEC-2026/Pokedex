import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',

    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.borderSoft,

    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.txtPrimary,
    letterSpacing: 0.2,
  },

  subtitle: {
    color: Colors.gray[500],
    marginTop: 6,
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'left',
  },

  input: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.txtPrimary,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    marginBottom: 14,
  },

  passwordFieldContainer: {
    width: '100%',
    position: 'relative',
  },

  passwordInput: {
    paddingRight: 46,
  },

  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 26,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    width: '100%',
    marginTop: 10,
  },

  secondaryButton: {
    width: '100%',
    marginTop: 10,
    marginBottom: 0,
  },
});

export default styles;