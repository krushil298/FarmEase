/**
 * LanguagePicker — full-screen modal for selecting the app language.
 * Shows each language's native name + English name + a checkmark on the current one.
 */

import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { SUPPORTED_LANGUAGES, Language } from '../../utils/languages';
import { useLanguageStore, LanguageCode } from '../../store/useLanguageStore';

interface LanguagePickerProps {
    visible: boolean;
    onClose: () => void;
}

export default function LanguagePicker({ visible, onClose }: LanguagePickerProps) {
    const { language, setLanguage } = useLanguageStore();

    function handleSelect(lang: Language) {
        console.log(`[LanguagePicker] Selecting: ${lang.name} (${lang.code})`);
        setLanguage(lang.code as LanguageCode);
        onClose();
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>🌐 Choose Language</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtitle}>Select your preferred language for the app</Text>

                {/* Language list */}
                <FlatList
                    data={SUPPORTED_LANGUAGES}
                    keyExtractor={(item) => item.code}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        const isSelected = item.code === language;
                        return (
                            <TouchableOpacity
                                style={[styles.item, isSelected && styles.itemSelected]}
                                onPress={() => handleSelect(item)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.flag}>{item.flag}</Text>
                                <View style={styles.itemText}>
                                    <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
                                        {item.nativeName}
                                    </Text>
                                    <Text style={styles.englishName}>{item.name}</Text>
                                </View>
                                {isSelected && (
                                    <View style={styles.checkmark}>
                                        <Text style={styles.checkmarkText}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.base,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.text,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    closeText: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    list: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.xl,
        gap: spacing.sm,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.base,
        borderWidth: 2,
        borderColor: 'transparent',
        ...shadows.sm,
    },
    itemSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    flag: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    itemText: {
        flex: 1,
    },
    nativeName: {
        fontSize: typography.sizes.base,
        fontWeight: '700',
        color: colors.text,
    },
    selectedText: {
        color: colors.primary,
    },
    englishName: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    checkmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: typography.sizes.sm,
        fontWeight: '700',
    },
});
