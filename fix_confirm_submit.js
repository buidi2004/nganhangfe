const fs = require('fs');
let content = fs.readFileSync('src/screens/ConfirmTransferScreen.tsx', 'utf8');

const search = `  const handleKeyPress = async (val: string) => {
    if (pinDigits.length < 6 && !isTransferring) {
      const nextPins = [...pinDigits, val];
      setPinDigits(nextPins);

      // Auto-validate when 6 digits are entered
      if (nextPins.length === 6) {
        const pin = nextPins.join('');
        setIsTransferring(true);
        
        try {
          if (!user?.walletId) throw new Error('KhA'ng tAm thy vA- ngu"n');
          const rawNumAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
          
          // 1. Init Transfer
          const initRes = await WalletApi.initTransfer(user.walletId, recipient.walletId || recipient.phone, bankCode, rawNumAmount, notes, 'VND');
          
          // 2. Confirm Transfer
          const confirmRes = await WalletApi.confirmTransfer(initRes.data.transactionId, pin);
          
          // 3. Auto-save Beneficiary
          try {
            await WalletApi.addBeneficiary(
              recipient.walletId || recipient.phone, // beneficiaryWalletId
              recipient.name,                        // nickname
              bankCode || 'SENHONG',                          // bankCode
              recipient.phone                        // accountNumber
            );
          } catch (e) {
            console.log('Failed to auto-save beneficiary:', e);
          }

          setIsOtpModalVisible(false);
          setPinDigits([]);
          setIsTransferring(false);
          
          navigation.navigate('TransferResult', {
            success: true,
            receipt: confirmRes.data,
          });
        } catch (e: any) {
          setIsTransferring(false);
          setPinDigits([]);
          Alert.alert('Lỗi chuyển tiền', e.message || 'Giao dịch thất bại');
        }
      }
    }
  };`;

const replace = `  const submitPin = async (pin: string) => {
    setIsTransferring(true);
    try {
      if (!user?.walletId) throw new Error('Không tìm thấy ví nguồn');
      const rawNumAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
      
      const initRes = await WalletApi.initTransfer(user.walletId, recipient.walletId || recipient.phone, bankCode, rawNumAmount, notes, 'VND');
      const confirmRes = await WalletApi.confirmTransfer(initRes.data.transactionId, pin);
      
      try {
        await WalletApi.addBeneficiary(
          recipient.walletId || recipient.phone,
          recipient.name,
          bankCode || 'SENHONG',
          recipient.phone
        );
      } catch (e) {
        console.log('Failed to auto-save beneficiary:', e);
      }

      setIsOtpModalVisible(false);
      setPinDigits([]);
      setIsTransferring(false);
      
      navigation.navigate('TransferResult', {
        success: true,
        receipt: confirmRes.data,
      });
    } catch (e: any) {
      setIsTransferring(false);
      setPinDigits([]);
      Alert.alert('Lỗi chuyển tiền', e.message || 'Giao dịch thất bại');
    }
  };

  const handleKeyPress = async (val: string) => {
    if (pinDigits.length < 6 && !isTransferring) {
      const nextPins = [...pinDigits, val];
      setPinDigits(nextPins);
      if (nextPins.length === 6) {
        const pin = nextPins.join('');
        await submitPin(pin);
      }
    }
  };`;

// Use simple replacement but since there are encoding issues I will use regex or careful split
// Actually let's use a function based regex matching.
content = content.replace(/  const handleKeyPress = async \([\s\S]*?  \};\r?\n/, replace + '\n');
fs.writeFileSync('src/screens/ConfirmTransferScreen.tsx', content, 'utf8');
