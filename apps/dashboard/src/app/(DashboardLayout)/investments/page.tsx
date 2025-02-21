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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  CircularProgress,
  Pagination,
  Snackbar,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Investment {
  id: string;
  userId: string;
  amount: number;
  start_time: string;
  lock_period: number;
  interest: number;
  status: string;
  unlocked_at: string;
}

const status_map: { [key: string]: string } = {
  locked: "流通中",
  unlocked: "已返还",
  blocked: "封禁中",
};

const InvestmentsPage: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userId, setUserId] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editInvestment, setEditInvestment] = useState<Partial<Investment>>({});
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchInvestments = async (
    page: number,
    userId: string = "",
    amountMin: string = "",
    amountMax: string = "",
    status: string = ""
  ) => {
    setLoading(true);
    const response = await fetch(
      `/api/investments/getAllInvestments?page=${page}&pageSize=${pageSize}&userId=${userId}&amountMin=${amountMin}&amountMax=${amountMax}&status=${status}`
    );
    const data = await response.json();
    setInvestments(data.records);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvestments(page, userId, amountMin, amountMax, status);
  }, [page, userId, amountMin, amountMax, status]);

  const handleReset = () => {
    setUserId("");
    setAmountMin("");
    setAmountMax("");
    setStatus("");
    fetchInvestments(1);
  };

  const handleSearch = () => {
    fetchInvestments(1, userId, amountMin, amountMax, status);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleEditDialogOpen = (investment: Investment) => {
    setEditInvestment(investment);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditInvestment({});
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditInvestment((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditStatusChange = (e: any) => {
    setEditInvestment((prev) => ({ ...prev, status: e.target.value as string }));
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch("/api/investments/updateInvestment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editInvestment),
      });

      if (response.ok) {
        fetchInvestments(page);
        setEditDialogOpen(false);
        setSnackbar({ open: true, message: "Investment updated successfully", severity: "success" });
      } else {
        console.error("Error updating investment data");
        setSnackbar({ open: true, message: "Failed to update investment", severity: "error" });
      }
    } catch (error) {
      console.error("Error updating investment data:", error);
      setSnackbar({ open: true, message: "Failed to update investment", severity: "error" });
    }
  };

  const handleDeleteDialogOpen = (investmentId: string) => {
    setInvestmentToDelete(investmentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setInvestmentToDelete(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/investments/deleteInvestment`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: investmentToDelete }),
      });

      if (response.ok) {
        fetchInvestments(page);
        setSnackbar({ open: true, message: "Investment deleted successfully", severity: "success" });
      } else {
        console.error("Error deleting investment");
        setSnackbar({ open: true, message: "Failed to delete investment", severity: "error" });
      }
    } catch (error) {
      console.error("Error deleting investment:", error);
      setSnackbar({ open: true, message: "Failed to delete investment", severity: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setInvestmentToDelete(null);
    }
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#fff", display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Search Filters */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField label="用户ID" variant="outlined" value={userId} onChange={(e) => setUserId(e.target.value)} size="small" sx={{ marginRight: 2 }} />
        <TextField label="金额大于" variant="outlined" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} size="small" sx={{ marginRight: 2 }} />
        <TextField label="金额小于" variant="outlined" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} size="small" sx={{ marginRight: 2 }} />
        <TextField label="状态" variant="outlined" value={status} onChange={(e) => setStatus(e.target.value)} size="small" sx={{ marginRight: 2 }} />
      </Box>
      <Box>
        <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={handleSearch} sx={{ marginRight: 2 }}>
          搜索
        </Button>
        <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={handleReset}>
          重置
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>用户ID</TableCell>
                  <TableCell>金额</TableCell>
                  <TableCell>开始时间</TableCell>
                  <TableCell>锁定期 (天)</TableCell>
                  <TableCell>利息</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>解锁时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>{investment.id}</TableCell>
                    <TableCell>{investment.userId}</TableCell>
                    <TableCell>{investment.amount}</TableCell>
                    <TableCell>{new Date(investment.start_time).toLocaleString()}</TableCell>
                    <TableCell>{investment.lock_period}</TableCell>
                    <TableCell>{investment.interest}</TableCell>
                    <TableCell>{status_map[investment.status]}</TableCell>
                    <TableCell>{investment.unlocked_at ? new Date(investment.unlocked_at).toLocaleString() : "N/A"}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditDialogOpen(investment)} size="small" style={{ fontSize: "12px" }}>
                      编辑
                        </IconButton>
                        <IconButton onClick={() => handleDeleteDialogOpen(investment.id)} size="small" style={{ fontSize: "12px" }}>
                          删除
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(total / pageSize)}
                page={page}
                onChange={handleChangePage}
                color="primary"
              />
            </Box>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>编辑投资记录</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="金额"
              name="amount"
              type="number"
              fullWidth
              value={editInvestment.amount || ""}
              onChange={handleEditInputChange}
            />
            <TextField
              margin="dense"
              label="解锁时间"
              name="unlocked_at"
              type="datetime-local"
              fullWidth
              value={editInvestment.unlocked_at ? new Date(editInvestment.unlocked_at).toISOString().slice(0, 16) : ""}
              onChange={handleEditInputChange}
            />
            <TextField
              margin="dense"
              label="利息"
              name="interest"
              type="number"
              fullWidth
              value={editInvestment.interest || ""}
              onChange={handleEditInputChange}
            />
            <Select
              margin="dense"
              fullWidth
              value={editInvestment.status || ""}
              onChange={handleEditStatusChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                请选择状态
              </MenuItem>
              {Object.entries(status_map).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose} color="primary">
              取消
            </Button>
            <Button onClick={handleEditSave} color="primary">
              保存
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
          <DialogTitle>删除投资记录</DialogTitle>
          <DialogContent>
            <Typography>确定要删除此投资记录吗？此操作不可撤销。</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose} color="primary">
              取消
            </Button>
            <Button onClick={handleDelete} color="secondary">
              删除
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
      </Box>
    );
  };

  export default InvestmentsPage;

