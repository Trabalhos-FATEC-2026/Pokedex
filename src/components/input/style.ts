import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const styles = StyleSheet.create({
	input: {
		width: '100%',
		height: 54,
		backgroundColor: Colors.surfaceMuted,
		borderRadius: 12,
		paddingHorizontal: 14,
		fontSize: 16,
		color: Colors.txtPrimary,
		borderWidth: 1,
		borderColor: Colors.borderSoft,
		marginBottom: 12,
	},
});

export default styles;

