import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

const OPENCAGE_API_KEY = '9f5f9b8d658d47baa73f90d79f09fcb1'; // Replace with your key

interface LocationPickerScreenProps {
    navigation: any;
}

export default function LocationPickerScreen({ navigation }: LocationPickerScreenProps) {
    const [searchText, setSearchText] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [typingTimeout, setTypingTimeout] = useState<number | null>(null);

    const predefinedLocations = [
        '📍 Home',
        '🏢 Office',
        '🛒 Grocery Store',
        '🏥 Hospital',
        '🏫 University',
    ];

    const filteredQuickLocations = predefinedLocations.filter((loc) =>
        loc.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSearchLocation = async (query: string) => {
        if (!query || query.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json`,
                {
                    params: {
                        q: query,
                        key: OPENCAGE_API_KEY,
                        limit: 5,
                    },
                }
            );

            const results = response.data.results.map((item: any) => item.formatted);
            setSearchResults(results);
        } catch (error: any) {
            console.error('Geocoding error:', error);
            Alert.alert('Search Error', 'Failed to fetch location suggestions. Please check your query and API key.');
        }
    };

    const handleUseCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const addressList = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (addressList.length > 0) {
                const addr = addressList[0];
                const fullAddress = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`;
                setSelectedLocation(`📍 ${fullAddress}`);
                setSearchText(`📍 ${fullAddress}`);
                setSearchResults([]);
                Alert.alert('Location Selected', fullAddress);
            } else {
                Alert.alert('Error', 'Unable to get address from location');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to get location');
        }
    };

    const handleSaveLocation = () => {
        const locationToSave = searchText || selectedLocation;
        if (!locationToSave) {
            Alert.alert('Error', 'Please select or search for a location');
            return;
        }

        Alert.alert('Location Saved', locationToSave);
        navigation.goBack();
    };

    const onChangeSearch = (text: string) => {
        setSearchText(text);
        setSelectedLocation('');
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeoutId = setTimeout(() => {
            handleSearchLocation(text);
        }, 600);
        setTypingTimeout(timeoutId);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose Location</Text>
                <TouchableOpacity onPress={handleSaveLocation}>
                    <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TextInput
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={onChangeSearch}
                    placeholder="Search for a location (city, street, etc.)..."
                />

                <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={handleUseCurrentLocation}
                >
                    <Text style={styles.currentLocationText}>📍 Use Current Location</Text>
                </TouchableOpacity>

                <ScrollView>
                    {searchResults.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Suggestions</Text>
                            {searchResults.map((result, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.locationItem,
                                        selectedLocation === result && styles.selectedLocation,
                                    ]}
                                    onPress={() => {
                                        setSelectedLocation(result);
                                        setSearchText(result);
                                        setSearchResults([]);
                                    }}
                                >
                                    <Text style={styles.locationText}>{result}</Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Quick Locations</Text>
                    {filteredQuickLocations.map((location, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.locationItem,
                                selectedLocation === location && styles.selectedLocation,
                            ]}
                            onPress={() => {
                                setSelectedLocation(location);
                                setSearchText(location);
                            }}
                        >
                            <Text style={styles.locationText}>{location}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { color: '#007AFF', fontSize: 16 },
    saveButton: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
    content: { padding: 16, flex: 1 },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    currentLocationButton: {
        padding: 16,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    currentLocationText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
        marginTop: 8,
    },
    locationItem: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedLocation: {
        backgroundColor: '#e3f2fd',
        borderColor: '#007AFF',
    },
    locationText: {
        fontSize: 16,
        color: '#333',
    },
});
