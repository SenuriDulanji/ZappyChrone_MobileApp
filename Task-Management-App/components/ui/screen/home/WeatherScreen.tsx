import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";

const OPEN_WEATHER_API_KEY = "01e187216ba4a2dcc1712a4d95b70b56";

export default function WeatherScreen() {
    const [weatherData, setWeatherData] = useState<{
        condition: string;
        temperature: number;
        icon: string;
    } | null>(null);

    const [loading, setLoading] = useState(true);

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            throw new Error("Location permission denied");
        }

        const location = await Location.getCurrentPositionAsync({});
        return location.coords; // { latitude, longitude }
    };

    const getWeather = async (lat: number, lon: number) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;

        console.log("Fetching from:", url); // 🐞 Debug

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.warn("Weather API Error:", errorText);
            throw new Error(`Failed to fetch weather: ${response.status}`);
        }

        const data = await response.json();
        return {
            condition: data.weather[0].main,
            temperature: data.main.temp,
            icon: data.weather[0].icon,
        };
    };

    const loadWeather = async () => {
        try {
            setLoading(true);
            const { latitude, longitude } = await getCurrentLocation();
            const data = await getWeather(latitude, longitude);
            setWeatherData(data);
        } catch (error: any) {
            console.error("Weather Error:", error);
            Alert.alert("Error", error.message || "Unable to fetch weather");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWeather();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Weather</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : weatherData ? (
                <View style={styles.weatherCard}>
                    <Image
                        source={{
                            uri: `https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`,
                        }}
                        style={styles.weatherIcon}
                    />
                    <Text style={styles.condition}>{weatherData.condition}</Text>
                    <Text style={styles.temp}>{weatherData.temperature}°C</Text>
                </View>
            ) : (
                <Text style={{ color: "#666" }}>No data</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5faff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    weatherCard: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 4,
    },
    weatherIcon: {
        width: 100,
        height: 100,
    },
    condition: {
        fontSize: 20,
        fontWeight: "500",
        color: "#444",
        marginTop: 10,
    },
    temp: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#007AFF",
        marginTop: 8,
    },
});
