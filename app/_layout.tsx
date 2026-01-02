
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { StockProvider, LoanProvider } from '../src/store';
import { darkTheme, colors } from '../src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={darkTheme}>
          <StockProvider>
            <LoanProvider>
              <StatusBar style="light" backgroundColor={colors.background} />
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: colors.background,
                  },
                  headerTintColor: colors.textPrimary,
                  headerTitleStyle: {
                    fontWeight: '600',
                  },
                  contentStyle: {
                    backgroundColor: colors.background,
                  },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    title: 'Stock Feed',
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="stock/[symbol]"
                  options={{
                    title: 'Stock Details',
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="loan/index"
                  options={{
                    title: 'Loan Application',
                    headerShown: true,
                    presentation: 'modal',
                  }}
                />
              </Stack>
            </LoanProvider>
          </StockProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
