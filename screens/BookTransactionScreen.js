import React from 'react';
import {Text,View,TouchableOpacity,StyleSheet,Image,TextInput, Alert, KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../config.js';
import firebase from 'firebase';

export default class TransactionScreen extends React.Component{

constructor(){
    super();
    this.state = {
        hasCameraPermissions : null,
        scanned:false,
        scannedData:'',
        buttonState:"normal",
        scannedBookId:'',
        scannedStudentId:'',
        transactionMessage:''
    }
}

getCameraPermissions = async (id)=>{
    
    const {status} = await Permissions.askAsync(Permissions.CAMERA);

    this.setState(
        {hasCameraPermissions:status==="granted",
         buttonState:id,
         scanned:false   
        })
    //alert("permission 2 "+this.state.buttonState);
    
}
handleBarCodeScanned = async ({type,data})=>{
    const {buttonState} = this.state;
     if(buttonState ==="BookId"){
        this.setState({
            scanned:true,
            scannedBookId:data,
            buttonState:'normal'
        });
     }
     else if(buttonState ==="StudentId"){
        this.setState({
            scanned:true,
            scannedStudentId:data,
            buttonState:'normal'
        });
     }
    
//alert("data is "+this.state.scannedData+"buttonState "+this.setState.buttonState)
}

handleTransaction= async ()=>{
var  transactionMessage;
var transactionType = await this.checkBookEligibility();
console.log(transactionType)
if(!transactionType){
Alert.alert("This book doesnt exist")
this.setState({
    scannedStudentId:'',
    scannedBookId:''
})
}
else if(transactionType ==="Issue"){
    var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
    if(isStudentEligible){
        this.initiateBookIssue();
        Alert.alert("Book issued to the student")
    }
}
else {
    var isStudentEligible = await this.checkStudentEligibilityForReturn()
    console.log("isStudentEligible "+isStudentEligible)
    if(isStudentEligible){
        this.initiateBookReturn();
        Alert.alert("Book returned to the library")
    }
}
/*db.collection("books").doc(this.state.scannedBookId).get()
.then((doc)=>{
    console.log(doc.data())
    var book = doc.data();
    if(book.bookAvailability){
        console.log("book available")
        this.initiateBookIssue();
        transactionMessage = "Book Issued";
        ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
    }
    else{
        this.initiateBookReturn();
        transactionMessage = "Book Returned"
        ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
    }
this.setState({transactionMessage:transactionMessage})
})*/
}


checkStudentEligibilityForBookIssue = async()=>{
    const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get();
    var isStudentEligible = ''
    if(studentRef.docs.length==0){
        this.stateState({
            scannedStudentId:'',
            scannedBookId:''
        })
        isStudentEligible = false;
        Alert.alert("the student ID doesnt exists in our DB")
    }
    else{
        studentRef.docs.map((doc)=>{
            var student = doc.data();
            if(student.numberOfBooksIssued <2){
                isStudentEligible = true;
            }
            else{
                isStudentEligible = false;
                Alert.alert("The student has already issued 2 books")
                this.stateState({
                    scannedStudentId:'',
                    scannedBookId:''
                })
            }
        })
    }
    return isStudentEligible;
}

checkStudentEligibilityForReturn = async ()=>{
    const transactionRef = await db.collection("transaction").where("bookId","==",this.state.scannedBookId).limit(1).get();
    var isStudentEligible = "";
    transactionRef.docs.map((doc)=>{
        var lastBookTransaction = doc.data();
        console.log("lastBookTransaction is"+lastBookTransaction)
        if(lastBookTransaction.studentId===this.state.scannedStudentId){
            isStudentEligible = true;
        }
        else{
            isStudentEligible = false;
            Alert.alert("This book was not issued by this student")
            this.stateState({
                scannedStudentId:'',
                scannedBookId:''
            })
        }
    })
    return isStudentEligible;
}

checkBookEligibility= async ()=>{
    const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookId).get();
    var transactionType="";
    if(bookRef.docs.length==0){
        transactionType=false;

    }
    else{
        bookRef.docs.map((doc)=>{
            var book = doc.data();
            if(book.bookAvailability){
                transactionType = "Issue"
            }
            else{
                transactionType = "Return"
            }
        })
    }
    return transactionType;
}


initiateBookIssue = async()=>{
    console.log("initiateBookIssue calling")
    //add a txn
    db.collection("transaction").add({
        studentId : this.state.scannedStudentId,
        bookId : this.state.scannedBookId,
        date : firebase.firestore.Timestamp.now().toDate(),
        transactionType: "Issue"
    })
    //change book status
    console.log("transaction updated")
    db.collection("books").doc(this.state.scannedBookId).update({
        bookAvailability:false
    })
    console.log("books updated")
    console.log(this.state.scannedStudentId)
    //change Number of issued book for student

    db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
    })
    console.log("students updated")
    Alert.alert("book issued!!")
    this.setState({
        scannedBookId:'',
        scannedStudentId:''
    })
}

initiateBookReturn = async()=>{
    //add a txn
    console.log("initiateBook Return")
    db.collection("transaction").add({
        studentId : this.state.scannedStudentId,
        bookId : this.state.scannedBookId,
        date : firebase.firestore.Timestamp.now().toDate(),
        transactionType: "Return"
    })
    //change book status

    db.collection("books").doc(this.state.scannedBookId).update({
        bookAvailability:true
    })

    //change Number of issued book for student

    db.collection("students").doc(this.state.scannedStudentId).update({
        numberOfBooksIssued : firebase.firestore.FieldValue.increment(-1)
    })
    Alert.alert("book Returned!!")
    this.setState({
        scannedBookId:'',
        scannedStudentId:''
    })
}


render(){
    const hasCameraPermission = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState= this.state.buttonState;
    
    if(buttonState !=="normal" && hasCameraPermission){
        return(
            <BarCodeScanner
            onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}/>
        )
    }
    else if(buttonState==="normal"){
    return(
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <View>
                <Image
                source = {require("../assets/booklogo.jpg")}
                style ={{width:200,height:200}}/>
                <Text style={{textAlign:'center',fontSize:30}}>Wireless Library</Text>
            </View>
            <View style ={styles.inputView}>
            <TextInput style={styles.inputBox}
                placeholder = "Enter Book ID"
                onChangeText={text=>this.setState({scannedBookId:text})}
                value={this.state.scannedBookId}
            />
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions("BookId")}}>
                <Text style={styles.buttonText}>
                    Scan 
                </Text>
            </TouchableOpacity>
            </View>
            <View style ={styles.inputView}>
            <TextInput style={styles.inputBox}
                placeholder = "Student ID"
                onChangeText={text=>this.setState({scannedStudentId:text})}
                value={this.state.scannedStudentId}
            />
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions("StudentId")}}>
                <Text style={styles.buttonText}>
                    Scan 
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
            style ={styles.submitButton}
            onPress = {async ()=>{this.handleTransaction()}}
            >
            <Text style ={styles.submitButtonText}>SUBMIT</Text>
                
            </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
    }
}

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
    },
    inputView:{
        flexDirection:'row',
        margin:20
    },
    inputBox:{
        width: 200,
        height: 40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
      },
      scanButton:{
        backgroundColor: '#66BB6A',
        width: 50,
        borderWidth: 1.5,
        borderLeftWidth: 0
      },
      submitButton:{
        backgroundColor: '#FbC02D',
        width: 100,
        height: 50,
        
      },
      submitButtonText:{
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight:"bold",
        color:"white"
      }
  });