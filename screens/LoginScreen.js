import React from 'react';
import { Text, View, FlatList, StyleSheet, TextInput,Image, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import firebase from 'firebase';

export default class LoginScreen extends React.Component{

    constructor(){
        super();
        this.state={
          emailId : '',
          password: ''
        }
      }
    
      login=async(email,password)=>{
        console.log("in logi n")
        if (email && password){
          console.log(email+"  :  "+password)
          try{
            const response = await firebase.auth().signInWithEmailAndPassword(email,password)
            console.log(response)
            if(response){
              this.props.navigation.navigate('Transaction')
            }
          }
          catch(error){
            console.log("error "+error)
            switch (error.code) {
              case 'auth/user-not-found':
                Alert.alert("user dosen't exists")
                console.log("doesn't exist")
                break
              case 'auth/invalid-email':
                Alert.alert('incorrect email or password')
                console.log('invaild')
                break
            }
          }
        }
        else{
            Alert.alert('enter email and password');
        }
      }

    render(){
        return(
            <KeyboardAvoidingView>
            <View>
                <Image 
                source = {require('../assets/booklogo.jpg')}
                style ={{width:200,height:200}}/>
                <Text style={{textAlign:"center" , fontSize:30}}>WILY LOGIN SCREEN</Text>
            </View>
            <View>
            <TextInput
          style={styles.loginBox}
          placeholder="abc@example.com"
          keyboardType ='email-address'
          onChangeText={(text)=>{
            this.setState({
              emailId: text
            })
          }}
        />

        <TextInput
          style={styles.loginBox}
          secureTextEntry = {true}
          placeholder="enter Password"
          onChangeText={(text)=>{
            this.setState({
              password: text
            })
          }}
        />
            </View>
            <View>
            <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}}
          onPress={()=>{this.login(this.state.emailId ,this.state.password)}}>
            <Text style={{textAlign:'center'}}>Login</Text>
          </TouchableOpacity>

            </View>
            </KeyboardAvoidingView>
            
        )
    }
}


const styles = StyleSheet.create({
    loginBox:
    {
      width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
    }
  })