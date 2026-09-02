import re
import sys

with open("src/screens/EnterAmountScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update BankItem interface to include 'code'
content = re.sub(
    r'interface BankItem \{\n  id: string;\n  shortName: string;\n  fullName: string;\n  displayName: string;\n  iconType: string;\n\}',
    r'interface BankItem {\n  id: string;\n  code: string;\n  shortName: string;\n  fullName: string;\n  displayName: string;\n  iconType: string;\n}',
    content
)

# 2. Remove BANK_LIST definition
content = re.sub(
    r'const BANK_LIST: BankItem\[\] = \[\s+.*?\];\n',
    '',
    content,
    flags=re.DOTALL
)

# 3. Add state for bankList and fetch logic
search = r'const \[selectedBankItem, setSelectedBankItem\] = useState<BankItem>\(BANK_LIST\[0\]\); \/\/ Default: SenBank \(Nội bộ\)'
replace = r'''const [bankList, setBankList] = useState<BankItem[]>([]);
  const [selectedBankItem, setSelectedBankItem] = useState<BankItem | null>(null);

  React.useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await WalletApi.getBanks();
        if (res.data && res.data.length > 0) {
          setBankList(res.data);
          setSelectedBankItem(res.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch banks", error);
      }
    };
    fetchBanks();
  }, []);'''
content = content.replace(search, replace)

# 4. Update filteredBanks logic
search2 = r'''  const filteredBanks = useMemo\(\(\) => \{
    if \(!bankSearchQuery.trim\(\)\) return BANK_LIST;
    const q = bankSearchQuery.toLowerCase\(\);
    return BANK_LIST.filter\(
      \(b\) => b.shortName.toLowerCase\(\)\.includes\(q\) \|\| b.fullName.toLowerCase\(\)\.includes\(q\)
    \);
  \}, \[bankSearchQuery\]\);'''
replace2 = r'''  const filteredBanks = useMemo(() => {
    if (!bankSearchQuery.trim()) return bankList;
    const q = bankSearchQuery.toLowerCase();
    return bankList.filter(
      (b) => b.shortName.toLowerCase().includes(q) || b.fullName.toLowerCase().includes(q)
    );
  }, [bankSearchQuery, bankList]);'''
content = content.replace(search2, replace2)

# 5. Fix navigation params to include bankCode
search3 = r'''selectedBank: selectedBankItem\.shortName,'''
replace3 = r'''selectedBank: selectedBankItem?.shortName || '',
              bankCode: selectedBankItem?.code || '','''
content = content.replace(search3, replace3)

# 6. Fix selectedBankItem usage in view (avoid null crashes)
search4 = r'''<BankLogoBadge type=\{selectedBankItem\.iconType\} size=\{38\} \/>'''
replace4 = r'''<BankLogoBadge type={selectedBankItem?.iconType || 'senbank'} size={38} />'''
content = content.replace(search4, replace4)

search5 = r'''<AppText style=\{styles\.bankNameText\}>\{selectedBankItem\.displayName\}<\/AppText>'''
replace5 = r'''<AppText style={styles.bankNameText}>{selectedBankItem?.displayName || 'Đang tải...'}</AppText>'''
content = content.replace(search5, replace5)

with open("src/screens/EnterAmountScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done EnterAmountScreen")
