import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    FlatList, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { sendChatMessage, transcribeAudio, type ChatMessage } from '../../services/chatApi';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatbotModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '🌾 Namaste! I\'m FarmEase AI, your personal farming assistant.\n\nAsk me about:\n• Crop guidance 🌱\n• Disease diagnosis 🔬\n• Fertilizer advice 🧪\n• Government schemes 📋\n\nI speak English, Hindi, Kannada, Tamil & Telugu!\n\n🎤 Tap the mic to speak!',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Cleanup on close
    useEffect(() => {
        if (!visible) {
            Speech.stop();
            setIsSpeaking(null);
            stopRecording(true);
        }
    }, [visible]);

    // Recording pulse animation
    useEffect(() => {
        if (isRecording) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

    const scrollToBottom = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    // ──── Send text message ────
    const handleSend = async (textOverride?: string) => {
        const text = (textOverride || inputText).trim();
        if (!text || isLoading) return;

        const userMsg: Message = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);
        scrollToBottom();

        try {
            const history: ChatMessage[] = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));

            const response = await sendChatMessage(text, history);

            const botMsg: Message = {
                id: `bot_${Date.now()}`,
                role: 'assistant',
                content: response.reply,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            const errMsg: Message = {
                id: `err_${Date.now()}`,
                role: 'assistant',
                content: `⚠️ ${error.message || 'Something went wrong. Please try again.'}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    // ──── Text-to-Speech (read bot reply) ────
    const handleSpeak = (msgId: string, text: string) => {
        if (isSpeaking === msgId) {
            Speech.stop();
            setIsSpeaking(null);
            return;
        }

        Speech.stop();
        setIsSpeaking(msgId);

        // Clean markdown for speech
        const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/#{1,3}\s/g, '')
            .replace(/[•\-]/g, '')
            .replace(/\n{2,}/g, '. ')
            .replace(/\n/g, '. ')
            .trim();

        Speech.speak(cleanText, {
            language: 'en',
            rate: 0.9,
            onDone: () => setIsSpeaking(null),
            onStopped: () => setIsSpeaking(null),
            onError: () => setIsSpeaking(null),
        });
    };

    // ──── Voice Recording ────
    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow microphone access to use voice input.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
            setIsRecording(true);
            setRecordingDuration(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            Alert.alert('Error', 'Could not start recording. Please try again.');
        }
    };

    const stopRecording = async (cancel = false) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!recordingRef.current) {
            setIsRecording(false);
            return;
        }

        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            setIsRecording(false);

            if (cancel || !uri) return;

            // Transcribe the audio
            setIsTranscribing(true);
            try {
                const transcribedText = await transcribeAudio(uri);
                if (transcribedText.trim()) {
                    handleSend(transcribedText);
                } else {
                    Alert.alert('No Speech Detected', 'Could not understand the audio. Please try again.');
                }
            } catch (error: any) {
                Alert.alert('Voice Input', error.message || 'Transcription failed. Please type your message instead.');
            } finally {
                setIsTranscribing(false);
            }
        } catch {
            setIsRecording(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ──── Clear chat ────
    const clearChat = () => {
        Speech.stop();
        setIsSpeaking(null);
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: '🌾 Chat cleared! How can I help you?',
            timestamp: new Date(),
        }]);
    };

    // ──── Render message ────
    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
                {!isUser && (
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>🌾</Text>
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                    <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{item.content}</Text>
                    <View style={styles.msgFooter}>
                        <Text style={[styles.time, isUser && styles.timeUser]}>
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {/* Speaker button on bot messages */}
                        {!isUser && item.id !== 'welcome' && (
                            <TouchableOpacity
                                style={styles.speakBtn}
                                onPress={() => handleSpeak(item.id, item.content)}
                            >
                                <Text style={styles.speakIcon}>
                                    {isSpeaking === item.id ? '⏹️' : '🔊'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                        <Text style={styles.headerBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>🌾 FarmEase AI</Text>
                        <View style={styles.onlineDot} />
                    </View>
                    <TouchableOpacity onPress={clearChat} style={styles.headerBtn}>
                        <Text style={styles.headerBtnText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={scrollToBottom}
                />

                {/* Typing / transcribing indicator */}
                {(isLoading || isTranscribing) && (
                    <View style={styles.typingRow}>
                        <View style={styles.avatarCircleSmall}>
                            <Text style={{ fontSize: 14 }}>🌾</Text>
                        </View>
                        <View style={styles.typingBubble}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.typingText}>
                                {isTranscribing ? 'Transcribing voice...' : 'Thinking...'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Quick suggestions */}
                {messages.length <= 2 && !isLoading && !isRecording && (
                    <View style={styles.suggestionsRow}>
                        {['How to grow rice?', 'My crop has yellow leaves', 'Best fertilizer for wheat'].map((q, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.suggestionChip}
                                onPress={() => setInputText(q)}
                            >
                                <Text style={styles.suggestionText}>{q}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Recording overlay */}
                {isRecording && (
                    <View style={styles.recordingBar}>
                        <Animated.View style={[styles.recordDot, { transform: [{ scale: pulseAnim }] }]} />
                        <Text style={styles.recordingText}>Recording... {formatDuration(recordingDuration)}</Text>
                        <TouchableOpacity style={styles.cancelRecordBtn} onPress={() => stopRecording(true)}>
                            <Text style={styles.cancelRecordText}>✕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stopRecordBtn} onPress={() => stopRecording(false)}>
                            <Text style={styles.stopRecordText}>Send ➤</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Input bar */}
                {!isRecording && (
                    <View style={styles.inputBar}>
                        {/* Mic button */}
                        <TouchableOpacity
                            style={styles.micBtn}
                            onPress={startRecording}
                            disabled={isLoading || isTranscribing}
                        >
                            <Text style={styles.micIcon}>🎤</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask about farming..."
                            placeholderTextColor={colors.textLight}
                            multiline
                            maxLength={2000}
                            returnKeyType="send"
                            onSubmitEditing={() => handleSend()}
                        />

                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <Text style={styles.sendBtnText}>➤</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F0EB' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, paddingTop: Platform.OS === 'android' ? 40 : 54, paddingBottom: spacing.md,
        backgroundColor: colors.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
        ...shadows.md,
    },
    headerBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    headerBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: '600' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    headerTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: '#fff' },
    onlineDot: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50',
        borderWidth: 1.5, borderColor: '#fff',
    },

    // Messages list
    messagesList: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, paddingBottom: spacing.lg },

    // Message rows
    msgRow: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-end' },
    msgRowUser: { flexDirection: 'row-reverse' },
    avatarCircle: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.xs,
    },
    avatarText: { fontSize: 16 },

    // Bubbles
    bubble: {
        maxWidth: '78%', borderRadius: 18, paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    bubbleBot: {
        backgroundColor: '#fff', borderBottomLeftRadius: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
    },
    bubbleUser: {
        backgroundColor: colors.primary, borderBottomRightRadius: 4,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
    },
    msgText: { fontSize: typography.sizes.sm, color: colors.text, lineHeight: 20 },
    msgTextUser: { color: '#fff' },
    msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    time: { fontSize: 9, color: colors.textLight },
    timeUser: { color: 'rgba(255,255,255,0.7)' },

    // Speaker button
    speakBtn: { marginLeft: spacing.sm, padding: 2 },
    speakIcon: { fontSize: 14 },

    // Typing indicator
    typingRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    avatarCircleSmall: {
        width: 26, height: 26, borderRadius: 13, backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.xs,
    },
    typingBubble: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        backgroundColor: '#fff', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: 16,
    },
    typingText: { fontSize: typography.sizes.xs, color: colors.textSecondary },

    // Quick suggestions
    suggestionsRow: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md,
        gap: spacing.xs, paddingBottom: spacing.sm,
    },
    suggestionChip: {
        backgroundColor: '#fff', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.primary,
    },
    suggestionText: { fontSize: typography.sizes.xs, color: colors.primary, fontWeight: '500' },

    // Recording bar
    recordingBar: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 30 : spacing.md,
        backgroundColor: '#FFF3E0', borderTopWidth: 1, borderTopColor: '#FFE0B2',
    },
    recordDot: {
        width: 14, height: 14, borderRadius: 7, backgroundColor: '#F44336',
    },
    recordingText: { flex: 1, fontSize: typography.sizes.sm, fontWeight: '600', color: '#E65100' },
    cancelRecordBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    cancelRecordText: { fontSize: 16, color: '#666' },
    stopRecordBtn: {
        backgroundColor: colors.primary, paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm, borderRadius: borderRadius.pill,
    },
    stopRecordText: { color: '#fff', fontWeight: '700', fontSize: typography.sizes.sm },

    // Input bar
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, paddingBottom: Platform.OS === 'ios' ? 30 : spacing.md,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    },
    micBtn: {
        width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF3E0',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#FFE0B2',
    },
    micIcon: { fontSize: 20 },
    input: {
        flex: 1, backgroundColor: '#F5F0EB', borderRadius: 22, paddingHorizontal: spacing.md,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: typography.sizes.base,
        color: colors.text, maxHeight: 100, minHeight: 40,
    },
    sendBtn: {
        width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: colors.border },
    sendBtnText: { fontSize: 18, color: '#fff' },
});
