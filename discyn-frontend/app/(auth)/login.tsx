import React, { useEffect, useState } from 'react'
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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Link, useRouter } from 'expo-router'
import AppTitle from '@/components/AppTitle'
import Typo from '../../components/Typo'
import config from '../../config'


const LoginScreen = () => {
    interface LoginForm {
        correuelectronic: string,
        contrasenya: string
    }

    const router = useRouter()
    const [loginForm, setLoginForm] = useState<LoginForm>({
        correuelectronic: '',
        contrasenya: '',
    })
    const [error, setError] = useState<string | null>(null);
    const [rol, setRole] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);
        try {
            const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correuelectronic: loginForm.correuelectronic,
                    contrasenya: loginForm.contrasenya,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Wrong email or password');
            }

            const data = await response.json();
            await AsyncStorage.setItem('session_token', data.access_token);
            await AsyncStorage.setItem('user_id', data.persona_id.toString());
            setRole(data.rol);
            console.log(data)
            console.log('rol:', data.rol);
            if (data.rol == "usuari"){
                router.replace('/(tabs)');
            } else if (data.rol == "administrador") {
                router.replace('/(tabsadmin)'); 
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    };


    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`)
        // Implement social login logic here
    }

    const handleChange = (field: keyof LoginForm, value: string) => {
        setLoginForm(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <AppTitle title="Discyn" />
                <View style={styles.logincontainer}>
                    <Typo title="Login" />

                    <View style={styles.inputContainer}>
                        <AuthTextInput
                            label="Email"
                            placeholder="your@email.com"
                            value={loginForm.correuelectronic}
                            onChangeText={(value => handleChange('correuelectronic', value))}
                            icon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <AuthTextInput
                            label="Password"
                            placeholder="••••••••"
                            value={loginForm.contrasenya}
                            onChangeText={(value) => handleChange('contrasenya', value)}
                            icon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <AuthButton title="Login" onPress={handleLogin} />
                    </View>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity onPress={() => handleSocialLogin('Google')}>
                            <View style={styles.socialButton}>
                                <Ionicons name="logo-google" size={24} color="#FFFF" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSocialLogin('Apple')}>
                            <View style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color="#FFFF" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSocialLogin('GitHub')}>
                            <View style={styles.socialButton}>
                                <Ionicons name="logo-github" size={24} color="#FFFF" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <Link href="/(auth)/register" style={styles.link}>
                            Register
                        </Link>
                    </View>
                    {error && <Text style={styles.errorText}>{error}</Text>}
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
    logincontainer: {
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
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

export default LoginScreen


/**
 * 
 *import React, { useEffect, useState } from 'react'
import {
    View,
    StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    Text,
    TouchableOpacity,
    ImageBackground,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import AuthTextInput from '../../components/AuthTextInput'
import AuthButton from '../../components/AuthButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Link, useRouter } from 'expo-router'
import AppTitle from '@/components/AppTitle'
import Typo from '../../components/Typo'
import config from '../../config'


const LoginScreen = () => {
    interface LoginForm {
        correuelectronic: string,
        contrasenya: string
    }

    const router = useRouter()
    const [loginForm, setLoginForm] = useState<LoginForm>({
        correuelectronic: '',
        contrasenya: '',
    })
    const [error, setError] = useState<string | null>(null);
    const [rol, setRole] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);
        try {
            const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correuelectronic: loginForm.correuelectronic,
                    contrasenya: loginForm.contrasenya,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Wrong email or password');
            }

            const data = await response.json();
            await AsyncStorage.setItem('session_token', data.access_token);
            await AsyncStorage.setItem('user_id', data.persona_id.toString());
            setRole(data.rol);
            console.log(data)
            console.log('rol:', data.rol);
            if (data.rol == "usuari"){
                router.replace('/(tabs)');
            } else if (data.rol == "administrador") {
                router.replace('/(tabsadmin)/profile'); 
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    };


    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`)
        // Implement social login logic here
    }

    const handleChange = (field: keyof LoginForm, value: string) => {
        setLoginForm(prev => ({
            ...prev,
            [field]: value,
        }))
    }


return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <ImageBackground
      source={require('../../assets/images/adminpanel4.png')} // Cambia esta ruta a tu imagen real
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <AppTitle title="DISCYN" />
        <Text style={styles.subtitle}>Be part of the 1%, Be part of DISCYN.</Text>

        <View style={styles.logincontainer}>
          <Typo title="Login" />

          <View style={styles.inputContainer}>
            <AuthTextInput
              label="Email"
              placeholder="your@email.com"
              value={loginForm.correuelectronic}
              onChangeText={(value => handleChange('correuelectronic', value))}
              icon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <AuthTextInput
              label="Password"
              placeholder="••••••••"
              value={loginForm.contrasenya}
              onChangeText={(value) => handleChange('contrasenya', value)}
              icon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
              secureTextEntry
            />
          </View>

          <View style={styles.buttonContainer}>
            <AuthButton title="Login" onPress={handleLogin} />
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity onPress={() => handleSocialLogin('Google')}>
              <View style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color="#FFFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSocialLogin('Apple')}>
              <View style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#FFFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSocialLogin('GitHub')}>
              <View style={styles.socialButton}>
                <Ionicons name="logo-github" size={24} color="#FFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              Register
            </Link>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>
    </ImageBackground>
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
    logincontainer: {
        padding: 32,
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.85)', // semitransparente
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        marginTop: 0, // <-- antes era 16
    },

    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20, // <-- antes era 60
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
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
      backgroundImage: {
  flex: 1,
  justifyContent: 'center',
},
    subtitle: {
    fontSize: 16,
    color: '#F3F4F6',
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    },
})

export default LoginScreen
 */