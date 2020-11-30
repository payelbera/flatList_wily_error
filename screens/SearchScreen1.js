import React from 'react';
import { StyleSheet, Text, View,ScrollView } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import db from '../config'
export default class SearchScreen extends  React.Component{

constructor(){
    super()
    this.state={
        allTransactions:[],
        lastVisibleTransaction:null
    }
}

componentDidMount = async ()=>{
  const query = await db.collection("transaction").limit(12).get()
  query.docs.map((doc)=>{
    console.log(doc.data())
    this.setState({
      //allTransactions:[...this.state.allTransactions,doc.data()],
      allTransactions:[],
      lastVisibleTransaction: doc
    })
    console.log("hh ")
  })
}

fetchMoreTransactions=async()=>{
  console.log("fetch more txn")
const query=  await db.collection('transaction').startAfter(this.state.lastVisibleTransaction).limit(12).get()
console.log("len "+query.docs.length)
console.log(doc.data())
query.docs.map(()=>{
this.setState({
    allTransactions:[...this.state.allTransactions,doc.data()],
    lastVisibleTransaction:doc
})
console.log("fetch more ")
})

}
    render(){
        return (
        
<FlatList
          data={this.state.allTransactions}
          renderItem={({item})=>(
            <View style={{borderBottomWidth: 2}}>
              <Text>{"Book Id: " + item.bookId}</Text>
              <Text>{"Student id: " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: " + item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor= {(item, index)=> index.toString()}
          onEndReached ={this.fetchMoreTransactions}
          onEndReachedThreshold={1}
        /> 

        )
    }
}