import { useState } from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View }from "react-native";
import { Icon, TextInput } from "react-native-paper";
import { Color } from "@/constants/Colors";
// @ts-ignore
import logo from '../../../../assets/images/logo/logo.png';
import { auth } from "@/constants/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function SignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    const handleSignUp = async () => {
        if (!email || !password || !displayName) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: displayName
            });

            console.log("User created:", user);
            alert("Account created successfully!");
            navigation.navigate('Login');
        } catch (error: any) {
            console.error("Signup error:", error);
            alert(error.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>SIGN UP</Text>
            <View style={styles.content}>
                <View style={styles.formGroup}>
                    <TextInput
                        left={<TextInput.Icon icon="account-outline" />}
                        mode='outlined'
                        style={styles.input}
                        activeUnderlineColor="transparent"
                        underlineColor="transparent"
                        contentStyle={styles.inputContent}
                        label="User name"
                        value={displayName}
                        onChangeText={setDisplayName}
                    />
                </View>
                <View style={styles.formGroup}>
                    <TextInput
                        label="Email"
                        left={<TextInput.Icon icon="email-outline" />}
                        mode='outlined'
                        style={styles.input}
                        activeUnderlineColor="transparent"
                        underlineColor="transparent"
                        contentStyle={styles.inputContent}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={styles.formGroup}>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        label="Password"
                        left={<TextInput.Icon icon="lock-outline" />}
                        secureTextEntry={!passwordVisible}
                        mode='outlined'
                        style={styles.input}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        contentStyle={styles.inputContent}
                        right={
                            <TextInput.Icon
                                icon={passwordVisible ? 'eye-off' : 'eye'}
                                onPress={() => setPasswordVisible(!passwordVisible)}
                                color="#888"
                                size={20}
                            />
                        }
                    />
                </View>
                <TouchableOpacity style={styles.signButton} onPress={handleSignUp}>
                    <Text style={styles.signButtonText}>
                        Sign Up
                    </Text>
                </TouchableOpacity>

            

                {/*<View style={styles.socialLoginWrapper}>*/}
                {/*    <TouchableOpacity style={styles.iconOuter}>*/}
                {/*        <Icon size={20} source={'google'} />*/}
                {/*    </TouchableOpacity>*/}
                {/*    <TouchableOpacity style={styles.iconOuter}>*/}
                {/*        <Icon size={20} source={'facebook'} />*/}
                {/*    </TouchableOpacity>*/}
                {/*    <TouchableOpacity style={styles.iconOuter}>*/}
                {/*        <Icon size={20} source={'twitter'} />*/}
                {/*    </TouchableOpacity>*/}
                {/*    <TouchableOpacity style={styles.iconOuter}>*/}
                {/*        <Icon size={20} source={'instagram'} />*/}
                {/*    </TouchableOpacity>*/}
                {/*</View>*/}

                <View style={styles.loginButton}>
                    <Text style={styles.pageTexts}>Registered already?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                    </TouchableOpacity>
                </View>

                
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop:20,
        color: '#222',
        textAlign:'left',
    },
    container: {
        flex: 1,
        padding: 30,
        paddingTop:100,
        backgroundColor: Color.light
    },
    formGroup: {
    marginBottom: 20,
    },
    content: {
        flex: 1,
        paddingTop: 40,
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
    iconOuter: {
        backgroundColor: Color.darkGray,
        width: 50,
        height: 50,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signButton: {
        backgroundColor: '#000000ff',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    signButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },

    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 200,
        
    },
    loginButtonText: {
        color: Color.black,
        fontSize: 16,
        fontWeight: '500',
    },
    socialLoginWrapper: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-around',
    },


    pageTexts: {
        marginHorizontal: 10,
        color: '#888',
        fontWeight: '500',
        marginRight:20
    },
});
