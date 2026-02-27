import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { colors, shadows } from '../../utils/theme';

export default function ChatFAB({ onPress }: { onPress: () => void }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Subtle pulse every few seconds to attract attention
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.delay(3000),
            ])
        );
        const glow = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
                Animated.delay(3000),
            ])
        );
        pulse.start();
        glow.start();
        return () => { pulse.stop(); glow.stop(); };
    }, []);

    return (
        <View style={styles.container}>
            {/* Glow ring behind */}
            <Animated.View style={[styles.glowRing, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={[styles.fabWrapper, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
                    <Text style={styles.fabIcon}>🌾</Text>
                    <Text style={styles.fabLabel}>AI</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90,
        right: 16,
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
    },
    fabWrapper: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 10,
    },
    fab: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    fabIcon: {
        fontSize: 22,
        marginTop: -2,
    },
    fabLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
        marginTop: -2,
    },
});
