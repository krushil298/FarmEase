import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function requestNotificationPermissions() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('weather-alerts', {
            name: 'Weather Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

export async function evaluateWeatherAndNotify(weatherData: any) {
    if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) return;

    // A simple evaluation: checking the next 12 hours.
    // E.g., if there's Rain/Thunderstorm/Snow soon
    const upcomingConditions = weatherData.hourly.slice(0, 12).map((h: any) => h.condition);
    const temperatures = weatherData.hourly.slice(0, 12).map((h: any) => h.temp);

    const willRain = upcomingConditions.includes('Rain') || upcomingConditions.includes('Thunderstorm');
    const willSnow = upcomingConditions.includes('Snow');
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    let title = '';
    let body = '';

    if (willRain) {
        title = '🌧️ Rain Expected Soon!';
        body = 'Consider covering your sensitive crops or delaying pesticide spray.';
    } else if (willSnow) {
        title = '❄️ Snow Warning';
        body = 'Freezing temperatures approaching. Take precautions to prevent frost damage.';
    } else if (maxTemp > 35) {
        title = '🌡️ Extreme Heat Alert';
        body = `Temperatures will reach ${maxTemp}°C today. Ensure your crops are adequately watered.`;
    } else if (minTemp < 5) {
        title = '🥶 Frost Warning';
        body = `Temperatures will drop to ${minTemp}°C. Protect vulnerable seedlings!`;
    } else {
        // Normal condition, no notification needed for demo purposes to avoid spam
        return;
    }

    // Check if we already scheduled a similar notification recently to avoid spamming
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const alreadyScheduled = scheduled.some(n => n.content.title === title);

    if (!alreadyScheduled) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: {
                // To display it almost immediately for testing purposes, but 
                // typically we'd schedule it based on actual times
                seconds: 5,
            },
        });
    }
}
