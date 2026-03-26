import React, { useState } from 'react';
import {View,Text,TextInput,Button ,Alert} from 'react-native';

export default function CashAdvance() {
    const [amount, setAmount] = useState('');

    const handleRequest =()=>{
        alert("Request Submitted", `Cash advance of $${amount} requested.`);
        const numericAmount = parseFloat(amount);
        if(!amount || numericAmount <= 0){
            Alert.alert("Invalid Amount", "Please enter a valid amount greater than zero.");
            return;
        }
        Alert.alert("Request Submitted", `Cash advance of $${amount} requested.`);

        };

        return(
            <View style={{ padding: 20, backgroundColor: "white", flex: 1 }}>
                <Text style={{ fontSize: 18, marginBottom: 10}}>Request Cash Advance</Text>
                <TextInput
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
                    placeholder="Enter amount"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />
                
            
        <Button title="Request Cash Advance" onPress={handleRequest} color="teal"/>
        </View>
);
}