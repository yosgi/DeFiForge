'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { jwtDecode } from "jwt-decode";
import styles from './page.module.css';

interface Application {
  id: number;
  created_at: string;
  wallet_address: string;
  contact_info: string;
  group_link: string;
  status: string;
  referrer: string;
}

interface Downline {
  referred_wallet_address: string;
  referrer_wallet_address: string;
  level: number;
}

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [downline, setDownline] = useState<Downline[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [dialog, setDialog] = useState<{ open: boolean; address: string }>({ open: false, address: '' });
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
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
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      const response = await fetch('/api/applicants/getApplications');
      const data = await response.json();
      console.log(data)
      setApplications(data);
    };
    fetchApplications();
  }, []);

  const handleAction = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/applicants/updateApplicationStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: `申请已${status === 'approved' ? '通过' : '拒绝'}`, severity: 'success' });
        setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
      } else {
        setSnackbar({ open: true, message: '更新状态失败', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: '更新状态失败', severity: 'error' });
    }
  };

  const handleDialogOpen = (address: string) => {
    setDialog({ open: true, address });
  };

  const handleDialogClose = () => {
    setDialog({ open: false, address: '' });
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
  };
  console.log("downline", downline)
  let filteredApplications 
  if (role === 'admin') {
    filteredApplications = applications;
  } else {
    filteredApplications = applications
      .filter((application) =>
        downline.some((downlineItem) => downlineItem.referred_wallet_address?.toLocaleLowerCase() === application.wallet_address?.toLocaleLowerCase
        ())
      );
  }

  return (
    <Box sx={{ margin: '50px auto', padding: '20px', maxWidth: '1000px' }}>
      <Typography variant="h4" sx={{ marginBottom: '20px' }}>申请列表</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>钱包地址</TableCell>
              <TableCell>联系方式</TableCell>
              <TableCell>群组链接</TableCell>
              <TableCell>推荐人</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  {shortenAddress(application.wallet_address)}
                  <Button onClick={() => handleDialogOpen(application.wallet_address)} size="small">显示</Button>
                </TableCell>
                <TableCell>{application.contact_info}</TableCell>
                <TableCell>{application.group_link}</TableCell>
                <TableCell>{application.referrer}</TableCell>
                <TableCell>{application.status}</TableCell>
                <TableCell sx={{display:"flex"}}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAction(application.id, 'approved')}
                    sx={{ marginRight: '10px' }}
                  >
                    通过
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleAction(application.id, 'rejected')}
                  >
                    拒绝
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={dialog.open} onClose={handleDialogClose}>
        <DialogTitle>钱包地址</DialogTitle>
        <DialogContent>
          <Typography>{dialog.address}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminApplications;
