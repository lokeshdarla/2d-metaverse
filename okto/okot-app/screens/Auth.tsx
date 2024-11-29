import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {GoogleSignin, User} from '@react-native-community/google-signin';
import {useOkto} from 'okto-sdk-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

GoogleSignin.configure({
  webClientId:
    '727452062096-ce6o67luq1rudeghfri8jv7bd4227cdj.apps.googleusercontent.com', // Replace with your web client ID
  offlineAccess: false,
});

interface AuthProps {
  navigation: any;
  setIsAuthenticated: (value: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({navigation, setIsAuthenticated}) => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const {authenticate } : any = useOkto();

  useEffect(() => {
    checkPreviousSignIn();
  }, []);

  const checkPreviousSignIn = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const user = await GoogleSignin.signInSilently();
        setUserInfo(user);
        handleOktoAuthentication(user);
      }
    } catch (error) {
      console.error('Previous sign-in check failed:', error);
    }
  };

  const handleOktoAuthentication = async (user: User) => {
    if (!user.idToken) {
      Alert.alert('Error', 'No ID token available');
      return;
    }

    authenticate(user.idToken, async (result : any, error : any) => {
      if (error) {
        console.error('Okto authentication error:', error);
        Alert.alert('Authentication Error', 'Failed to authenticate with Okto');
        return;
      }

      if (result && result.auth_token) {
        await AsyncStorage.setItem('okto_auth_token', result.auth_token);
        await AsyncStorage.setItem(
          'okto_refresh_token',
          result.refresh_auth_token,
        );
        setIsAuthenticated(true);
        navigation.navigate('Home');
      }
    });
  };

  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUserInfo(userInfo);
      handleOktoAuthentication(userInfo);
    } catch (error: any) {
      console.log("Sign In errors ! ")
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.multiRemove(['okto_auth_token', 'okto_refresh_token']);
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Okto Demo</Text>

        <View style={styles.authSection}>
          {userInfo ? (
            <>
              <Text style={styles.welcomeText}>
                Welcome, {userInfo.user.givenName} {userInfo.user.familyName}
              </Text>
              <View style={styles.buttonSpacing} />
              <Button title="Sign Out" onPress={handleSignOut} />
            </>
          ) : (
            <Button title="Sign in with Google" onPress={handleSignIn} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  authSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  buttonSpacing: {
    height: 15,
  },
});

export default Auth;
