import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const Page = () => {
  const { isSignedIn } = useAuth();

  

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
