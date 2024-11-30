import React from "react";
import { TextField, Button, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

export interface UserFilterProps {
  account: string;
  setAccount: React.Dispatch<React.SetStateAction<string>>;
  balanceMin: string;
  setBalanceMin: React.Dispatch<React.SetStateAction<string>>;
  balanceMax: string;
  setBalanceMax: React.Dispatch<React.SetStateAction<string>>;
  level: string;
  setLevel: React.Dispatch<React.SetStateAction<string>>;
  totalInvestmentMin: string;
  setTotalInvestmentMin: React.Dispatch<React.SetStateAction<string>>;
  totalInvestmentMax: string;
  setTotalInvestmentMax: React.Dispatch<React.SetStateAction<string>>;
  savingMin: string;
  setSavingMin: React.Dispatch<React.SetStateAction<string>>;
  savingMax: string;
  setSavingMax: React.Dispatch<React.SetStateAction<string>>;
  savingEarningMin: string;
  setSavingEarningMin: React.Dispatch<React.SetStateAction<string>>;
  savingEarningMax: string;
  setSavingEarningMax: React.Dispatch<React.SetStateAction<string>>;
  bitPowerMin: string;
  setBitPowerMin: React.Dispatch<React.SetStateAction<string>>;
  bitPowerMax: string;
  setBitPowerMax: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  handleReset: () => void;
}

const UserFilter: React.FC<UserFilterProps> = ({
  account,
  setAccount,
  balanceMin,
  setBalanceMin,
  balanceMax,
  setBalanceMax,
  level,
  setLevel,
  totalInvestmentMin,
  setTotalInvestmentMin,
  totalInvestmentMax,
  setTotalInvestmentMax,
  savingMin,
  setSavingMin,
  savingMax,
  setSavingMax,
  savingEarningMin,
  setSavingEarningMin,
  savingEarningMax,
  setSavingEarningMax,
  bitPowerMin,
  setBitPowerMin,
  bitPowerMax,
  setBitPowerMax,
  handleSearch,
  handleReset,
}) => {
  return (
    <Box  mb={2}>
    <Box mb={1}>
        <TextField label="账号" variant="outlined" value={account} onChange={(e) => setAccount(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="余额大于" variant="outlined" value={balanceMin} onChange={(e) => setBalanceMin(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="余额小于" variant="outlined" value={balanceMax} onChange={(e) => setBalanceMax(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="等级" variant="outlined" value={level} onChange={(e) => setLevel(e.target.value)} size="small" sx={{ marginRight: 2 }} />
    </Box>
    <Box mb={1}>
    <TextField label="总流通大于" variant="outlined" value={totalInvestmentMin} onChange={(e) => setTotalInvestmentMin(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="总流通小于" variant="outlined" value={totalInvestmentMax} onChange={(e) => setTotalInvestmentMax(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="储蓄大于" variant="outlined" value={savingMin} onChange={(e) => setSavingMin(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="储蓄小于" variant="outlined" value={savingMax} onChange={(e) => setSavingMax(e.target.value)} size="small" sx={{ marginRight: 2 }} />
    </Box>

    <Box mb={1}>
    <TextField label="储蓄收益大于" variant="outlined" value={savingEarningMin} onChange={(e) => setSavingEarningMin(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="储蓄收益小于" variant="outlined" value={savingEarningMax} onChange={(e) => setSavingEarningMax(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="新币大于" variant="outlined" value={bitPowerMin} onChange={(e) => setBitPowerMin(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      <TextField label="新币小于" variant="outlined" value={bitPowerMax} onChange={(e) => setBitPowerMax(e.target.value)} size="small" sx={{ marginRight: 2 }} />
    </Box>
    
    
     
    <Box>
         {/* Search and Reset buttons */}
      <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={handleSearch} sx={{ marginRight: 2 }}>
        搜索
      </Button>
      <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={handleReset}>
        重置
      </Button>
    </Box>
     
    </Box>
  );
};

export default UserFilter;
