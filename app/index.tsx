import React from "react";
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "@/components/Loader";
import CustomButton from "@/components/CustomButton";

const Welcome = () => {


    return (
        <SafeAreaView className="bg-[#5e3a3a] h-full">
            <ScrollView
                contentContainerStyle={{
                    height: "100%",
                }}
            >
                <View className="w-full flex justify-center items-center h-full px-4">
                    <Image
                        source={require('@/assets/images/logo-ristopos-white.png')}
                        className="w-[300px] h-[200px]"
                        resizeMode="contain"
                    />

                    <Image
                        source={require('@/assets/images/cards.png')}
                        className="max-w-[320px] h-[238px]"
                        resizeMode="contain"
                    />

                    <View className="relative mt-5">
                        <Text className="text-3xl text-white font-bold text-center">
                            Discover Endless{"\n"}
                            Possibilities {" "}
                            <Text className="text-secondary-200">RistoPos</Text>
                        </Text>

                        <Image
                            source={require('@/assets/images/path.png')}
                            className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
                            resizeMode="contain"
                        />
                    </View>

                    <CustomButton
                        title="Scopri di più"
                        handlePress={() => router.push("/login")}
                        containerStyles="w-full mt-7 bg-white"
                    />
                </View>
            </ScrollView>

            <StatusBar backgroundColor="#161622" style="light" />
        </SafeAreaView>
    );
};

export default Welcome;