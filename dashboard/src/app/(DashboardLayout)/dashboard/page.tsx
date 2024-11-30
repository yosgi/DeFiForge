"use client";

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Typography
} from "@mui/material";
import dynamic from "next/dynamic";
import SearchIcon from "@mui/icons-material/Search";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
interface Statistics {
  totalRecharge: number;
  returnedAmount: number;
  lockedOrdersCount: number;
  lockedOrdersAmount: number;
  dailyRecharge: number;
  dailyUnlock: number;
  tomorrowUnlock: number;
  dailyRechargeHistory: { date: string; amount: number }[];
}

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/getStatistics/route');
      const data = await response.json();
      setStatistics(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching statistics data:", error);
      setSnackbar({ open: true, message: 'Failed to fetch statistics', severity: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleReset = () => {
    fetchStatistics();
  };

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={fetchStatistics}
          sx={{ marginRight: 2 }}
        >
          更新数据
        </Button>
        {/* <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
        >
          重置
        </Button> */}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        statistics && (
          <>
            <Box mb={4}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>统计项</TableCell>
                      <TableCell>值</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>总充值金额</TableCell>
                      <TableCell>{statistics.totalRecharge}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>已返还金额</TableCell>
                      <TableCell>{statistics.returnedAmount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>正在锁定的订单数量</TableCell>
                      <TableCell>{statistics.lockedOrdersCount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>正在锁定的订单金额</TableCell>
                      <TableCell>{statistics.lockedOrdersAmount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>当日充值金额</TableCell>
                      <TableCell>{statistics.dailyRecharge}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>当日解锁金额</TableCell>
                      <TableCell>{statistics.dailyUnlock}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>明日解锁金额</TableCell>
                      <TableCell>{statistics.tomorrowUnlock}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Typography variant="h6" mb={2}>总充值金额趋势图</Typography>
              <Chart
                type="line"
                series={[{ name: "总充值金额", data: statistics.dailyRechargeHistory.map(item => item.amount) }]}
                options={{
                  chart: {
                    id: "recharge-chart",
                    toolbar: {
                      show: true,
                    },
                  },
                  xaxis: {
                    categories: statistics.dailyRechargeHistory.map(item => item.date),
                    title: {
                      text: "日期"
                    }
                  },
                  yaxis: {
                    title: {
                      text: "金额 (USDT)"
                    }
                  },
                  dataLabels: {
                    enabled: false,
                  },
                }}
                height={350}
              />
            </Box>
          </>
        )
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default StatisticsPage;
