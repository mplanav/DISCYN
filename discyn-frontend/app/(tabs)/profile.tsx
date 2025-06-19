import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from "react-native"
import React, { useEffect, useState, useCallback } from "react"
import config from "../../config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

interface User {
    name: string
    email: string
    image: string
    gender: string
}
interface UserStats {
    count: number,
    gymbros: number,
}


export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    const [menuVisible, setMenuVisible] = useState(false)
    const [stats, setStats] = useState<UserStats | null>(null)


    const toggleMenu = () => {
        setMenuVisible(!menuVisible)
    }

    const handleEditarPerfil = () => {
        setMenuVisible(false)
        console.log("Editar perfil")
    }

    const handleCerrarSesion = async () => {
        setMenuVisible(false)
        await AsyncStorage.removeItem("user_id")
        router.replace("/(auth)/login")
    }

    const fetchUserData = useCallback(async () => {
        try {
            const userId = await AsyncStorage.getItem("user_id")
            if (!userId) {
                throw new Error("No user is logged")
            }
            const response = await fetch(`${config.API_BASE_URL}/persona/read/${userId}`)
            if (!response.ok) {
                throw new Error("Error getting the user")
            }
            const data = await response.json()
            const imageUrl = `${config.API_BASE_URL}${data.imatge}`
            setUser({
                name: data.nom,
                email: data.correuelectronic,
                image: imageUrl,
                gender: data.genere,
            })
        } catch (err: any) {
            setError(err.message)
        }
    }, [])

    const fetchStats = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("session_token")
            const user_id = await AsyncStorage.getItem("user_id")
            if (!token || !user_id) throw new Error("Missing token or user_id")

            const response = await fetch(
                `${config.API_BASE_URL}/persona/read/profile-user-stats/${user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            )

            if (!response.ok) throw new Error("Error fetching stats")

            const data = await response.json()
            console.log("Stats data:", data)
            setStats({
                count: data.count,
                gymbros: data.gymbros,
            })
        } catch (err: any) {
            setError(err.message)
        }
    }, [])

    const loadAllData = useCallback(async () => {
        setLoading(true)
        await Promise.all([fetchUserData(), fetchStats()])
        setLoading(false)
    }, [fetchUserData, fetchStats])

    useEffect(() => {
        loadAllData()
    }, [loadAllData])

    const onRefresh = async () => {
        setRefreshing(true)
        await loadAllData()
        setRefreshing(false)
    }
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ color: "white" }}>{error}</Text>
            </SafeAreaView>
        )
    }

    if (!user) return null

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{user.name}</Text>
                    <View style={{ position: "relative" }}>
                        <TouchableOpacity style={styles.settingsButton} onPress={toggleMenu}>
                            <Text style={styles.settingsIcon}>⋯</Text>
                        </TouchableOpacity>

                        {menuVisible && (
                            <View style={styles.dropdownMenu}>
                                <TouchableOpacity onPress={handleEditarPerfil} style={styles.menuItem}>
                                    <Ionicons name="person-outline" size={20} color="#FFFFFF" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Edit profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCerrarSesion} style={styles.menuItem}>
                                    <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
                                    <Text style={styles.menuTextcloseSession}>Log Out</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.image }} style={styles.avatar} />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Text style={styles.editAvatarIcon}></Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userEmail}>{user.gender}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats?.count}</Text>
                        <Text style={styles.statLabel}>Workouts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats?.gymbros}</Text>
                        <Text style={styles.statLabel}>Gymbros</Text>
                    </View>
                </View>

                <View style={styles.gridContainer}>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.gridButton} onPress={() => router.push("/exercicisProfile")}>
                            <Ionicons name="barbell-outline" size={20} color="#FFFF" style={styles.gridIcon} />
                            <Text style={styles.gridButtonText}>Exercices</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridButton} onPress={() => router.push("/grupmuscularProfile")}>
                            <Ionicons name="body-outline" size={20} color="#FFFF" style={styles.gridIcon} />
                            <Text style={styles.gridButtonText}>Muscles</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.gridButton} onPress={() => { router.push("/routinesProfile") }}>
                            <Ionicons name="repeat-outline" size={20} color="#FFFF" style={styles.gridIcon} />
                            <Text style={styles.gridButtonText}>Routines</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
    },

    scrollContent: {
        paddingBottom: 32,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#374151",
        justifyContent: "center",
        alignItems: "center",
    },
    settingsIcon: {
        fontSize: 20,
        color: "#FFFFFF",
    },
    profileContainer: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 32,
        backgroundColor: "#1F2937",
        marginHorizontal: 24,
        borderRadius: 16,
        marginBottom: 24,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#374151",
    },
    editAvatarButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#1F2937",
    },
    editAvatarIcon: {
        fontSize: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: "#6B7280",
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: "row",
        backgroundColor: "#1F2937",
        marginHorizontal: 24,
        borderRadius: 16,
        paddingVertical: 24,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "#6B7280",
    },
    statDivider: {
        width: 1,
        backgroundColor: "#374151",
        marginVertical: 8,
    },
    dropdownMenu: {
        position: "absolute",
        top: 50,
        right: 0,
        backgroundColor: "#1F2937",
        borderRadius: 12,
        paddingVertical: 8,
        width: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 10,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    menuTextcloseSession: {
        color: "#da2323",
        fontSize: 16,
    },
    menuIcon: {
        marginRight: 10,
    },
    gridContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    gridButton: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#1F2937",
        paddingVertical: 16,
        marginHorizontal: 8,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    gridIcon: {
        marginRight: 8,
    },
    gridButtonText: {
        color: "#FFFF",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
})
