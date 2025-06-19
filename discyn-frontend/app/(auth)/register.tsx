import React, { useState } from 'react'
import {
    View,
    StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    Text,
    TouchableOpacity,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import AuthTextInput from '../../components/AuthTextInput'
import AuthButton from '../../components/AuthButton'
import { Link, useRouter } from 'expo-router'
import AppTitle from '@/components/AppTitle'
import Typo from '../../components/Typo'
import config from '../../config'

const RegisterScreen = () => {
    interface RegisterForm {
        nom: string,
        correuelectronic: string,
        datanaixement: string,
        contrasenya: string,
        genere: string,
        imatge: string | null
    }

    const router = useRouter();

    const [registerForm, setRegisterForm] = useState<RegisterForm>({
        nom: '',
        correuelectronic: '',
        contrasenya: '',
        genere: '',
        datanaixement: '',
        imatge: ''
    })
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        setError(null);
        try {
            const response = await fetch(`${config.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: registerForm.nom,
                    correuelectronic: registerForm.correuelectronic,
                    contrasenya: registerForm.contrasenya,
                    datanaixement: "2004-06-05",
                    genere: "Man",
                    imatge: null,
                    rol: "usuari",
                    altura: 180,
                    pes: 69,
                    llicencia: null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail);
            }

            router.replace('/(auth)/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    };

    const handleSocialRegister = (provider: string) => {
        console.log(`Register with ${provider}`)
    }

    const handleChange = (field: keyof RegisterForm, value: string) => {
        setRegisterForm(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <View style={styles.registerContainer}>
                    <Typo title="Register to Discyn" />

                    <View style={styles.inputContainer}>
                        <AuthTextInput
                            label="Name"
                            placeholder="Your Full Name"
                            value={registerForm.nom}
                            onChangeText={(value) => handleChange('nom', value)}
                            icon={<Ionicons name="person-outline" size={20} color="#6B7280" />}
                            keyboardType="default"
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <AuthTextInput
                            label="Email"
                            placeholder="your@email.com"
                            value={registerForm.correuelectronic}
                            onChangeText={(value) => handleChange('correuelectronic', value)}
                            icon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <AuthTextInput
                            label="Password"
                            placeholder="••••••••"
                            value={registerForm.contrasenya}
                            onChangeText={(value) => handleChange('contrasenya', value)}
                            icon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
                            secureTextEntry
                        />
                    </View>
                    {/*
                        <View style={styles.inputContainer}>
                        <AuthTextInput
                            label="Repeat Password"
                            placeholder="••••••••"
                            icon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
                            secureTextEntry
                        />
                    </View>
                    */}


                    <View style={styles.buttonContainer}>
                        <AuthButton title="Register" onPress={handleRegister} />
                    </View>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity onPress={() => handleSocialRegister('Google')}>
                            <View style={styles.socialButton}>
                                <Ionicons name="logo-google" size={24} color="#FFFF" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSocialRegister('Apple')}>
                            <View style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color="#FFFF" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSocialRegister('GitHub')}>
                            <View style={styles.socialButton}>
                                <Ionicons name="logo-github" size={24} color="#FFFF" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Link href="/(auth)/login" style={styles.link}>
                            Login
                        </Link>
                    </View>
                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        backgroundColor: '#111827',
    },
    registerContainer: {
        padding: 32,
        justifyContent: 'center',
        backgroundColor: '#1F2937',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 8,
        marginBottom: 24,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#374151',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4B5563',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#6B7280',
        fontSize: 14,
    },
    link: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    errorText: {
        color: '#EF4444', 
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
        fontWeight: '500',
      },
      
})

export default RegisterScreen