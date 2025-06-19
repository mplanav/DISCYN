import { useRouter } from "expo-router";
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const index = () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            router.replace("/(auth)/login")
        },1000)
    }, [])

  return (
    <View style={styles.container}>
        <Image
            style={styles.logo}
            resizeMode="contain"
            source={require("../assets/images/react-logo.png")}
        />
    </View>
  )
}

export default index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#0f303d",
    },

    logo: {
        height: "30%",
        aspectRatio: 1,
    },
})