import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/type";

const Home = () => {
    const { user } = useUser();
    const { signOut } = useAuth();

    const { setUserLocation, setDestinationLocation } = useLocationStore();

    const handleSignOut = () => {
        signOut();
        router.replace("/(auth)/sign-in");
    };

    const [hasPermission, setHasPermission] = useState<boolean>(false);

    const {
        data: recentRides,
        loading,
        error,
    } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setHasPermission(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords?.latitude!,
                longitude: location.coords?.longitude!,
            });

            setUserLocation({
                latitude: location.coords?.latitude,
                longitude: location.coords?.longitude,
                address: `${address[0].name}, ${address[0].region}`,
            });
        })();
    }, []);


    const handleDestinationPress = (location: {
        latitude: number;
        longitude: number;
        address: string;
    }) => {
        setDestinationLocation(location);

        router.push("/(root)/find-ride");
    };

    return (
        <SafeAreaView className="bg-general-500">
            <FlatList
                data={recentRides?.slice(0, 5)}
                renderItem={({ item }) => <RideCard ride={item} />}
                keyExtractor={(item, index) => index.toString()}
                className="px-5"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
                
                ListHeaderComponent={
                    <>
                        <View className="flex flex-row items-center justify-between my-5">
                            <Text className="text-2xl font-JakartaExtraBold">
                                Tricimotero {user?.firstName}👋
                            </Text>
                            <TouchableOpacity
                                onPress={handleSignOut}
                                className="justify-center items-center w-25 h-15 rounded-full bg-white"
                            >
                                <Image source={icons.out} className="w-4 h-4" />
                            </TouchableOpacity>
                        </View>
                        <>
                            <Text className="text-xl font-JakartaBold mt-5 mb-3">
                                Tu ubicacion actual
                            </Text>
                            <View className="flex flex-row items-center bg-transparent h-[450px]">
                                <Map />
                            </View>
                        </>
                        <CustomButton
                            title="Encontrar clientes"
                            onPress={() => router.push(`/(root)/nodestinationride`)}
                            className="mt-10"
                        />

                    </>
                }
            />
        </SafeAreaView>
    );
};

export default Home;
