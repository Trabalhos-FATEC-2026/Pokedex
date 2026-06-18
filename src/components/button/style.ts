import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export const styles = StyleSheet.create({
	button: {
		width: '100%',
		height: 52,
		backgroundColor: Colors.btnPrimary,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 14,
		shadowColor: Colors.black,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.18,
		shadowRadius: 14,
		elevation: 6,
		borderWidth: 1,
		borderColor: Colors.primaryAlpha['30'],
	},

	primary: {
		backgroundColor: Colors.btnPrimary,
		borderColor: Colors.primaryAlpha['30'],
	},

	surface: {
		backgroundColor: Colors.surfaceCard,
		borderColor: Colors.whiteAlpha['12'],
	},

	danger: {
		backgroundColor: Colors.semantic.error.bg,
		borderColor: Colors.semantic.error.border,
	},

	title: {
		color: Colors.labelPrimary,
		fontSize: 16,
		fontWeight: '800',
		letterSpacing: 0.3,
	},

	titleSurface: {
		color: Colors.txtPrimary,
	},

	titleDanger: {
		color: Colors.semantic.error.text,
	},
});

