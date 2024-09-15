import React from 'react';


import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Home from './screens/Home';

import AddProducts from './screens/AddProducts';
import ProductsData from './screens/ProductsData';
import GenerateInvoices from './screens/GenerateInvoices';
import UpdateProducts from './screens/UpdateProduct';
import SalesReport from './screens/SalesReport';
import AuthScreen from './screens/AuthScreen';
import SplashScreen from './screens/SplashScreen';


const stack = createNativeStackNavigator();
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <stack.Navigator initialRouteName="SplashScreen">
        <stack.Screen name="Home" component={Home} options={{  headerStyle: {
            backgroundColor: 'rgba(111, 66, 193, 0.8)',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },}} />
        <stack.Screen name="AuthScreen" component={AuthScreen} options={{title:"Welcome " , headerStyle: {
            backgroundColor: '#483d8b',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },}} /> 
        <stack.Screen name="AddProducts" component={AddProducts} options={{title:"Add Product" , headerStyle: {
            backgroundColor: '#8b008b',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },}}/>
        <stack.Screen name="ProductsData" component={ProductsData} />
        <stack.Screen name="GenerateInvoices" component={GenerateInvoices} options={{title:"Generate Invoice" , headerStyle: {
            backgroundColor: '#228B22',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },}} />
        <stack.Screen name="UpdateProducts" component={UpdateProducts} />
        <stack.Screen name="SalesReports" component={SalesReport} />
        <stack.Screen name="SplashScreen" component={SplashScreen}  options={{title:"Nihaar Store" ,  headerStyle: {
            backgroundColor: '#3D1F00',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },}} />








      </stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
