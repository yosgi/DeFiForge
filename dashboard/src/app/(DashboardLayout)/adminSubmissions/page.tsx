"use client";
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, Tooltip, IconButton, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Snackbar, Alert, TablePagination, Dialog, DialogActions, DialogContent,
  DialogTitle, CircularProgress, Backdrop
} from '@mui/material';
import {jwtDecode} from "jwt-decode";
import InfoIcon from '@mui/icons-material/Info';

interface Submission {
  id: number;
  wallet_address: string;
  platform_name: string;
  platform_id: string;
  submission_link: string;
  status: string;
  salesperson: string;
  created_at: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}
interface Downline {
  referred_wallet_address: string;
  referrer_wallet_address: string;
  level: number;
}
const shortWalletAddress = (address: string) => {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

const AdminSubmissions: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [fullAddress, setFullAddress] = useState<string>('');
  const [addressDialogOpen, setAddressDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [downline, setDownline] = useState<Downline[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: number | null; action: string }>({
    open: false,
    id: null,
    action: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const username = decoded.username;
      setUsername(username);
      setRole(decoded.role);
      const fetchDownline = async () => {
        const response = await fetch(`/api/downline/${username}`);
        const data = await response.json();
        setDownline(data);
      };
  
      fetchDownline();
    }
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const response = await fetch(`/api/submission/getSubmissions?page=${page + 1}&limit=${rowsPerPage}`);
      const data = await response.json();
      setSubmissions(data.data);
      setTotalRows(data.count);
    };
    fetchSubmissions();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionConfirm = (submissionId: number, action: string) => {
    setConfirmDialog({ open: true, id: submissionId, action });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ open: false, id: null, action: '' });
  };

  const handleConfirmedAction = async () => {
    handleConfirmDialogClose();
    if (confirmDialog.id !== null) {
      await handleAction(confirmDialog.id, confirmDialog.action);
    }
  };

  const handleAction = async (submissionId: number, action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/submission/approveSubmission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action }),
      });

      setLoading(false);

      if (response.ok) {
        setSnackbar({ open: true, message: `提交${action}成功`, severity: 'success' });
        setSubmissions((prev) => prev.map((sub) => (sub.id === submissionId ? { ...sub, status: action } : sub)));
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: `更新状态失败: ${errorData.error}`, severity: 'error' });
      }
    } catch (error: any) {
      setLoading(false);
      setSnackbar({ open: true, message: `操作失败: ${error.message}`, severity: 'error' });
    }
  };

  const handleViewFullAddress = (address: string) => {
    setFullAddress(address);
    setAddressDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAddressDialogOpen(false);
  };

  let filteredSubmissions;
if (role === 'admin') {
  filteredSubmissions = submissions;
} else {
  filteredSubmissions = submissions.filter((submission) =>
    downline.some((downlineItem) => downlineItem.referred_wallet_address?.toLocaleLowerCase() === submission.wallet_address?.toLocaleLowerCase())
  );
}
console.log("filteredSubmissions", filteredSubmissions)

  return (
    <>
    <Box >
      <Typography variant="h4" sx={{ marginBottom: '20px' }}>提交列表</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>申请时间</TableCell>
              <TableCell>钱包地址</TableCell>
              <TableCell>平台名称</TableCell>
              <TableCell>平台ID</TableCell>
              <TableCell>提交链接</TableCell>
              <TableCell>销售员</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  {new Date(submission.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {shortWalletAddress(submission.wallet_address)}
                  <Tooltip title="查看完整地址">
                    <IconButton onClick={() => handleViewFullAddress(submission.wallet_address)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>{submission.platform_name}</TableCell>
                <TableCell>
                  {shortWalletAddress(submission.platform_id)}
                  <Tooltip title="查看完整地址">
                    <IconButton onClick={() => handleViewFullAddress(submission.platform_id)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                    {shortWalletAddress(submission.submission_link)}
                    <Tooltip title="查看完整链接">
                      <IconButton onClick={() => handleViewFullAddress(submission.submission_link)}>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell>
                  {
                    submission.salesperson.length > 10 ? shortWalletAddress(submission.salesperson) : submission.salesperson
                  }
                  {
                    submission.salesperson.length > 10 ? <Tooltip title="查看完整地址">
                      <IconButton onClick={() => handleViewFullAddress(submission.salesperson)}>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip> : null
                  }
                </TableCell>
                <TableCell>{submission.status}</TableCell>
                <TableCell sx={{ display: "flex" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleActionConfirm(submission.id, 'approved')}
                    sx={{ marginRight: '10px' }}
                    disabled={submission.status !== 'pending'}
                  >
                    通过
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleActionConfirm(submission.id, 'rejected')}
                    disabled={submission.status !== 'pending'}
                  >
                    拒绝
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={addressDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>完整钱包地址</DialogTitle>
        <DialogContent>
          <Typography>{fullAddress}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">关闭</Button>
        </DialogActions>
      </Dialog>

      <Backdrop open={loading} sx={{ zIndex: 10000 }}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ ml: 2 }}>正在处理转账，请稍候...</Typography>
      </Backdrop>
      { filteredSubmissions.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">暂无提交记录</Typography>
        </Box>
      )}
    </Box>
    <Dialog open={confirmDialog.open} onClose={handleConfirmDialogClose}>
        <DialogTitle>确认操作</DialogTitle>
        <DialogContent>
          <Typography>
            您确定要{confirmDialog.action === 'approved' ? '通过' : '拒绝'}这个提交吗？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>取消</Button>
          <Button onClick={handleConfirmedAction} color="primary">
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </>
    
  );
};

export default AdminSubmissions;
