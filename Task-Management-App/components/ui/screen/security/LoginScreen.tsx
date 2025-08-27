import { Color } from '@/constants/Colors';
import { auth } from '@/constants/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('User logged in:', user.email);
            // You can store user info in AsyncStorage if needed
            navigation.navigate('Process');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>LOG IN</Text>
            <View style={styles.content}>
                <View style={styles.formGroup}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            label="Email"
                            left={<TextInput.Icon icon="email-outline" />}
                            value={email}
                            mode="outlined"
                            style={styles.input}
                            onChangeText={setEmail}
                            contentStyle={styles.inputContent}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            label="Password"
                            left={<TextInput.Icon icon="lock-outline" />}
                            secureTextEntry={!passwordVisible}
                            mode="outlined"
                            style={styles.input}
                            contentStyle={styles.inputContent}
                            right={
                                <TextInput.Icon
                                    icon={passwordVisible ? 'eye-off' : 'eye'}
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                    color="#888"
                                />
                            }
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.or_Button}>
                    <Text style={styles.pageTexts}>Or</Text>
                </View>

                <TouchableOpacity style={styles.loginGoogleButton} onPress={handleLogin}>
                    <Text style={styles.signButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.signButton}>
                    <Text style={styles.pageTexts}>No account yet?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signButtonText}>Sign Up</Text>
                </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        paddingTop:100,
        backgroundColor: Color.light
    },
    content: {
        flex: 1,
        paddingTop: 40,
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop:20,
        color: '#222',
        textAlign:'left',
    },
    formGroup: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        height: 40,
        padding: 0,
        justifyContent: 'center',
    },
    inputContent: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    loginButton: {
        backgroundColor: '#000000ff',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    or_Button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    pageTexts: {
        marginHorizontal: 10,
        color: '#888',
        fontWeight: '500',
        marginRight:20
    },

    loginGoogleButton: {
    backgroundColor: Color.light,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#000000ff',
},

signButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 200,
        
    },
    signButtonText: {
        color: Color.black,
        fontSize: 16,
        fontWeight: '500',
    }
});
