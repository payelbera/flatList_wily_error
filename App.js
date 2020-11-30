import React from 'react';
import { StyleSheet, Text, View,Image } from 'react-native';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import SearchScreen from './screens/SearchScreen';
import TransactionScreen from './screens/BookTransactionScreen';

import LoginScreen from './screens/LoginScreen';

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction: { screen: TransactionScreen ,
    navigationOptions :{
      tabBarIcon : <Image source={require("./assets/book.png")} style={{width:40, height:40}}/>,
      tabBarLabel : "Book Transaction",
    }},
  Search: { screen: SearchScreen,
    navigationOptions :{
      tabBarIcon : <Image source={require("./assets/searchingbook.png")} style={{width:40, height:40}}/>,
      tabBarLabel : "Search",
    } }
},

);

//const AppContainer = createAppContainer(TabNavigator);


const switchNavigator = createSwitchNavigator({
  LoginScreen:{screen:LoginScreen},
  TabNavigator:{screen:TabNavigator}
});
const AppContainer = createAppContainer(switchNavigator);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center"
  }
});