import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ImageBackground, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SetPinScreen from '../screens/SetPinScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import ForgotPinScreen from '../screens/ForgotPinScreen';
import HomeScreen from '../screens/HomeScreen';

import ChooseRecipientScreen from '../screens/ChooseRecipientScreen';
import EnterAmountScreen from '../screens/EnterAmountScreen';
import ConfirmTransferScreen from '../screens/ConfirmTransferScreen';
import TransferResultScreen from '../screens/TransferResultScreen';

import TransferConfirmScreen from '../screens/TransferConfirmScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import QRMyScreen from '../screens/QRMyScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import DeviceManagementScreen from '../screens/DeviceManagementScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import DepositScreen from '../screens/DepositScreen';
import DepositConfirmScreen from '../screens/DepositConfirmScreen';
import WithdrawConfirmScreen from '../screens/WithdrawConfirmScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import BankCardsScreen from '../screens/BankCardsScreen';
import BillPaymentScreen from '../screens/BillPaymentScreen';
import BillInputScreen from '../screens/BillInputScreen';
import BillConfirmScreen from '../screens/BillConfirmScreen';
import RequestTransferScreen from '../screens/RequestTransferScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import SearchScreen from '../screens/SearchScreen';
import PhoneRechargeScreen from '../screens/PhoneRechargeScreen';
import LotteryScreen from '../screens/LotteryScreen';
import EKycScreen from '../screens/EKycScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import KycLevelScreen from '../screens/KycLevelScreen';
import IdentityDocumentScreen from '../screens/IdentityDocumentScreen';
import DigitalSignatureScreen from '../screens/DigitalSignatureScreen';
import EmailSettingsScreen from '../screens/EmailSettingsScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ReferralScreen from '../screens/ReferralScreen';
import BeneficiariesScreen from '../screens/BeneficiariesScreen';
import ConfigScreen from '../screens/ConfigScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SavingsScreen from '../screens/SavingsScreen';
import QuickLoanScreen from '../screens/QuickLoanScreen';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

import { navigationRef } from './navigationRef';

export default function AppNavigator() {
  const { isDark, colors } = useTheme();

  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: 'transparent',
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [isDark, colors]);

  const navContent = (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Login"
      >
        {/* Auth screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="SetPin" component={SetPinScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="ForgotPin" component={ForgotPinScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />

        {/* Main tabs */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Home" component={MainTabs} />

        {/* Transfer flow */}
        <Stack.Screen name="Deposit" component={DepositScreen} />
        <Stack.Screen name="DepositConfirm" component={DepositConfirmScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        <Stack.Screen name="WithdrawConfirm" component={WithdrawConfirmScreen} />
        <Stack.Screen name="Transfer" component={ChooseRecipientScreen} />
        <Stack.Screen name="EnterAmount" component={EnterAmountScreen} />
        <Stack.Screen name="ConfirmTransfer" component={ConfirmTransferScreen} />
        <Stack.Screen name="TransferConfirm" component={TransferConfirmScreen} />
        <Stack.Screen name="TransferResult" component={TransferResultScreen} />
        <Stack.Screen name="ScanQR" component={ScanQRScreen} />

        {/* QR */}
        <Stack.Screen name="MyQR" component={QRMyScreen} />

        {/* Transaction detail */}
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />

        {/* Account & Profile */}
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="IdentityDocument" component={IdentityDocumentScreen} />
        <Stack.Screen name="KycLevel" component={KycLevelScreen} />
        <Stack.Screen name="EKyc" component={EKycScreen} />
        <Stack.Screen name="DigitalSignature" component={DigitalSignatureScreen} />
        <Stack.Screen name="EmailSettings" component={EmailSettingsScreen} />

        {/* Payment & Cards */}
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        <Stack.Screen name="BankCards" component={BankCardsScreen} />
        <Stack.Screen name="BankCardManagement" component={BankCardsScreen} />
        <Stack.Screen name="Beneficiaries" component={BeneficiariesScreen} />

        {/* Bills & Payments */}
        <Stack.Screen name="BillPayment" component={BillPaymentScreen} />
        <Stack.Screen name="BillInput" component={BillInputScreen} />
        <Stack.Screen name="BillConfirm" component={BillConfirmScreen} />
        <Stack.Screen name="PhoneRecharge" component={PhoneRechargeScreen} />
        <Stack.Screen name="Lottery" component={LotteryScreen} />

        {/* Savings & Loans */}
        <Stack.Screen name="Savings" component={SavingsScreen} />
        <Stack.Screen name="QuickLoan" component={QuickLoanScreen} />

        {/* Request transfer & Promotions */}
        <Stack.Screen name="RequestTransfer" component={RequestTransferScreen} />
        <Stack.Screen name="Promotions" component={PromotionsScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />

        {/* Security & Devices */}
        <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
        <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />

        {/* Notifications & Support */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        <Stack.Screen name="LiveChat" component={HelpCenterScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />

        {/* Search */}
        <Stack.Screen name="Search" component={SearchScreen} />

        {/* Config and Settings */}
        <Stack.Screen name="Config" component={ConfigScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {!isDark ? (
        <ImageBackground 
          source={require('../assets/images/bg-white-pink-pattern.png')} 
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          {navContent}
        </ImageBackground>
      ) : (
        navContent
      )}
    </View>
  );
}
