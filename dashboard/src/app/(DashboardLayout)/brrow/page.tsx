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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface Borrow {
  id: string;
  user_id: number;
  amount: number;
  start_time: string;
  lock_period: number;
  interest: number;
  status: string;
  unlocked_at: string | null;
  type: string | null;
  borrow: number | null;
}

const BorrowManagementPage: React.FC = () => {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const [newBorrow, setNewBorrow] = useState<Partial<Borrow>>({});
  const [editingBorrow, setEditingBorrow] = useState<Partial<Borrow> | null>(null);
  const [deletingBorrowId, setDeletingBorrowId] = useState<string | null>(null);

  const fetchBorrows = async (page: number, rowsPerPage: number) => {
    setLoading(true);
    const response = await fetch(`/api/borrows/getAll?page=${page + 1}&pageSize=${rowsPerPage}`);
    const data = await response.json();
    setBorrows(data.borrows);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchBorrows(page, rowsPerPage);
  }, [page]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const openAddDialog = () => {
    setAddDialogOpen(true);
    setNewBorrow({ user_id: 0, amount: 0, lock_period: 0, interest: 0 });
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setNewBorrow({});
  };

  const openEditDialog = (borrow: Borrow) => {
    setEditingBorrow(borrow);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingBorrow(null);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingBorrowId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingBorrowId(null);
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBorrow((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingBorrow((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAddBorrow = async () => {
    const { user_id, amount, lock_period, interest } = newBorrow;

    if (!user_id || !amount || Number(amount) <= 0 || Number(lock_period) <= 0 || Number(interest) <= 0) {
      alert("Please provide valid inputs for User ID, Amount, Lock Period, and Interest.");
      return;
    }

    try {
      const response = await fetch("/api/borrows/addBorrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBorrow, user_id: Number(user_id), amount: Number(amount) }),
      });

      if (response.ok) {
        fetchBorrows(page, rowsPerPage);
        closeAddDialog();
      } else {
        alert("Failed to add borrow entry.");
      }
    } catch (error) {
      alert("An error occurred while adding the borrow.");
    }
  };

  const handleEditBorrow = async () => {
    if (!editingBorrow || !editingBorrow.id) {
      alert("No borrow selected for editing.");
      return;
    }

    try {
      const response = await fetch("/api/borrows/editBorrow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBorrow),
      });

      if (response.ok) {
        fetchBorrows(page, rowsPerPage);
        closeEditDialog();
      } else {
        alert("Failed to update borrow entry.");
      }
    } catch (error) {
      alert("An error occurred while updating the borrow.");
    }
  };

  const handleDeleteBorrow = async () => {
    if (!deletingBorrowId) {
      alert("No borrow selected for deletion.");
      return;
    }

    try {
      const response = await fetch(`/api/borrows/deleteBorrow/${deletingBorrowId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBorrows(page, rowsPerPage);
        closeDeleteDialog();
      } else {
        alert("Failed to delete borrow entry.");
      }
    } catch (error) {
      alert("An error occurred while deleting the borrow.");
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          借贷管理
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openAddDialog}>
            添加借贷
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
                  <TableCell>ID</TableCell>
                  <TableCell>用户 ID</TableCell>
                  <TableCell>金额</TableCell>
                  <TableCell>利息</TableCell>
                  <TableCell>锁定期 (天)</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>解锁时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {borrows.map((borrow) => (
                  <TableRow key={borrow.id}>
                    <TableCell>{borrow.id}</TableCell>
                    <TableCell>{borrow.user_id}</TableCell>
                    <TableCell>{borrow.amount.toFixed(2)}</TableCell>
                    <TableCell>{borrow.interest.toFixed(2)}</TableCell>
                    <TableCell>{borrow.lock_period}</TableCell>
                    <TableCell>{borrow.status}</TableCell>
                    <TableCell>{borrow.unlocked_at ? new Date(borrow.unlocked_at).toLocaleString() : "N/A"}</TableCell>
                    <TableCell>
                    <Tooltip title="编辑">
                        <IconButton color="primary" style={{fontSize:"12px"}} onClick={() => (window.location.href = `/users?userId=${borrow.user_id}`)}>
                          查看用户
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="编辑">
                        <IconButton color="primary" style={{fontSize:"12px"}} onClick={() => openEditDialog(borrow)}>
                          编辑
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton color="secondary" style={{fontSize:"12px"}}  onClick={() => openDeleteDialog(borrow.id)}>
                          删除
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

      {/* Add Borrow Dialog */}
      <Dialog open={addDialogOpen} onClose={closeAddDialog}>
        <DialogTitle>添加借贷</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="用户 ID"
            name="user_id"
            fullWidth
            value={newBorrow.user_id || ""}
            onChange={handleAddChange}
            type="number"
          />
          <TextField
            margin="dense"
            label="金额"
            name="amount"
            fullWidth
            value={newBorrow.amount || ""}
            onChange={handleAddChange}
            type="number"
          />
          <TextField
            margin="dense"
            label="锁定期 (天)"
            name="lock_period"
            fullWidth
            value={newBorrow.lock_period || ""}
            onChange={handleAddChange}
            type="number"
          />
          <TextField
            margin="dense"
            label="利息"
            name="interest"
            fullWidth
            value={newBorrow.interest || ""}
            onChange={handleAddChange}
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleAddBorrow} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Borrow Dialog */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog}>
        <DialogTitle>编辑借贷</DialogTitle>
        <DialogContent>
          {editingBorrow && (
            <>
              <TextField
                margin="dense"
                label="用户 ID"
                name="user_id"
                fullWidth
                value={editingBorrow.user_id || ""}
                onChange={handleEditChange}
                type="number"
                disabled
              />
              <TextField
                margin="dense"
                label="金额"
                name="amount"
                fullWidth
                value={editingBorrow.amount || ""}
                onChange={handleEditChange}
                type="number"
              />
              <TextField
                margin="dense"
                label="锁定期 (天)"
                name="lock_period"
                fullWidth
                value={editingBorrow.lock_period || ""}
                onChange={handleEditChange}
                type="number"
              />
              <TextField
                margin="dense"
                label="利息"
                name="interest"
                fullWidth
                value={editingBorrow.interest || ""}
                onChange={handleEditChange}
                type="number"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleEditBorrow} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Borrow Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>你确定要删除这个借贷条目吗？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleDeleteBorrow} color="secondary">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BorrowManagementPage;
