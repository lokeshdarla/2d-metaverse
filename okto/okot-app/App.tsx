import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auth from './screens/Auth';
import Home from './screens/Home';
import Transfer from './screens/Transfer';
import Portfolio from './screens/Portfolio';
import { OktoProvider } from 'okto-sdk-react-native';

export type RootStackParamList = {
  Auth: {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  };
  Home: undefined;
  Transfer: undefined;
  Portfolio: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuthStatus();
  }, []);

  return (
    <OktoProvider
      environment="sandbox" 
      apiKey="e987fc5b-e39b-4516-b9de-dc419f545684">
      <NavigationContainer>
        <Stack.Navigator>
          {!isAuthenticated ? (
            <Stack.Screen
              name="Auth"
              component={Auth}
              initialParams={{setIsAuthenticated, setAuthToken}}
            />
          ) : (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Transfer" component={Transfer} />
              <Stack.Screen name="Portfolio" component={Portfolio} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </OktoProvider>
  );
};

export default App;
