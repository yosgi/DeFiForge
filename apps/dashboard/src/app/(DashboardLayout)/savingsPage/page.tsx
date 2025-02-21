"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  Tooltip,
  TablePagination,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";

interface Saving {
  id: number;
  userId: number;
  type: string;
  amount: number;
  from: string;
  created_at: string;
}

const SavingsPage: React.FC = () => {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [newSaving, setNewSaving] = useState<{ userId: string; amount: string }>({ userId: "", amount: "" });

  const fetchSavings = async (page: number, rowsPerPage: number) => {
    setLoading(true);
    const response = await fetch(`/api/savings/getAllSaving?page=${page + 1}&pageSize=${rowsPerPage}`);
    const data = await response.json();
    setSavings(data.savings);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchSavings(page, rowsPerPage);
  }, [page]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const openAddDialog = () => {
    setAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setNewSaving({ userId: "", amount: "" });
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSaving((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSaving = async () => {
    const { userId, amount } = newSaving;

    if (!userId || !amount || Number(amount) <= 0) {
      alert("Please provide a valid User ID and Amount.");
      return;
    }

    try {
      const response = await fetch("/api/savings/addSaving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), amount: Number(amount), type: "deposit", from: "deposit" }),
      });

      if (response.ok) {
        fetchSavings(page, rowsPerPage);
        closeAddDialog();
      } else {
        alert("Failed to add saving entry.");
      }
    } catch (error) {
      alert("An error occurred while adding the saving.");
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          储蓄管理
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openAddDialog}>
            添加储蓄
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>用户 ID</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>金额</TableCell>
                  <TableCell>来源</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savings.map((saving) => (
                  <TableRow key={saving.id}>
                    <TableCell>{saving.id}</TableCell>
                    <TableCell>{saving.userId}</TableCell>
                    <TableCell>{saving.type}</TableCell>
                    <TableCell>{saving.amount.toFixed(2)}</TableCell>
                    <TableCell>{saving.from}</TableCell>
                    <TableCell>{new Date(saving.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Tooltip title="查看用户">
                        <IconButton
                          style={{ fontSize: 12 }}
                          onClick={() => (window.location.href = `/users?userId=${saving.userId}`)}
                          color="primary"
                        >
                         查看用户
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]} // Disable rows per page selection
            />
          </TableContainer>
        )}
      </Paper>

      {/* Add Saving Dialog */}
      <Dialog open={addDialogOpen} onClose={closeAddDialog}>
        <DialogTitle>添加储蓄</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="用户 ID"
            name="userId"
            fullWidth
            value={newSaving.userId}
            onChange={handleAddChange}
            type="number"
          />
          <TextField
            margin="dense"
            label="金额"
            name="amount"
            fullWidth
            value={newSaving.amount}
            onChange={handleAddChange}
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleAddSaving} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavingsPage;
