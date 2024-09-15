import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const datacollection = collection(db, 'datacolnew');
        const snapshot = await getDocs(datacollection);
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSalesData(fetchedData);
      } catch (error) {
        console.error('Error fetching sales data: ', error);
        Alert.alert('Error', 'Failed to fetch sales data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const generateCSV = async () => {
    try {
      // Define the CSV header
      const csvHeader = ['Product Name', 'Stock Left', 'Sold Today', 'Supplier', 'Commission', 'Total Commission'];

      // Map sales data to CSV format and calculate total commission
      const csvData = salesData.map((product) => {
        const soldToday = product.qtySoldToday || 0;
        const commission = product.commission || 0;
        const totalCommission = soldToday * commission;
        
        return [
          product.name,
          product.qty || 0,
          soldToday,
          product.supname || 'Unknown',
          commission,
          totalCommission.toFixed(2), // Calculate total commission
        ];
      });

      // Combine header and data into CSV format
      const csvContent = [csvHeader, ...csvData].map((row) => row.join(',')).join('\n');

      // Define file path
      const path = `${RNFS.DocumentDirectoryPath}/sales_report.csv`;

      // Write the CSV file
      await RNFS.writeFile(path, csvContent, 'utf8');

      // Share the file
      await Share.open({
        title: 'Sales Report',
        url: `file://${path}`,
        type: 'text/csv',
      });

      Alert.alert('Success', 'Sales report generated and shared!');
    } catch (error) {
      console.error('Error generating sales report: ', error);
      Alert.alert('Error', 'Failed to generate sales report.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Report</Text>
      <Button title="Generate Sales Report" onPress={generateCSV} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
});

export default SalesReport;
