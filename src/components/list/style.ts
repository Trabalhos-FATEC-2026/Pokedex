import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default StyleSheet.create({
    listContainer: {
        marginBottom: 30,
        backgroundColor: Colors.background,
    },
    card: {
        backgroundColor: Colors.surfaceCard,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: Colors.whiteAlpha['12'],
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    mainInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pokemonImage: {
        width: 85,
        height: 85,
        backgroundColor: Colors.surface,
        borderRadius: 42.5,
        marginRight: 16,
        borderWidth: 2,
        borderColor: Colors.primaryAlpha['30'],
    },
    infoContainer: {
        flex: 1,
    },
    pokemonIndex: {
        fontSize: 14,
        color: Colors.gray[500],
        fontWeight: '900',
    },
    pokemonName: {
        fontSize: 22,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        color: Colors.txtPrimary,
    },
    typesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 6,
    },
    typeBadge: {
        backgroundColor: Colors.whiteAlpha['08'],
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.whiteAlpha['12'],
    },
    typeText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: Colors.txtPrimary,
        letterSpacing: 0.5,
    },
    divider: {
        height: 2,
        backgroundColor: Colors.whiteAlpha['12'],
        marginVertical: 14,
    },
    statsContainer: {
        width: '100%',
    },
    statsTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: Colors.black,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsList: {
        gap: 8,
    },
    statRow: {
        width: '100%',
    },
    statInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    statName: {
        fontSize: 12,
        color: Colors.gray[500],
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    statValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.txtPrimary,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    actionArea: {
        marginTop: 10,
    },
    captureButton: {
        marginTop: 0,
        height: 44,
    },
});