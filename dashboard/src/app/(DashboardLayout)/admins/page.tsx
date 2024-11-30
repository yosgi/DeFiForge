"use client";
import { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  TextField,
  List,
  ListItem,
  ListItemText,
  TablePagination
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Admin {
  id: number;
  username: string;
  role: string;
  created_at: string;
  email: string;
}

const AdminListPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [total, setTotal] = useState<number>(0);

  const fetchAdmins = async (page: number, rowsPerPage: number, username: string, email: string) => {
    setLoading(true);
    const response = await fetch(`/api/getAllAdmins/route?page=${page + 1}&pageSize=${rowsPerPage}&username=${username}&email=${email}`);
    const data = await response.json();
    setAdmins(data.admins);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins(page, rowsPerPage, searchUsername, searchEmail);
  }, [page, searchUsername, searchEmail]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSearchUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUsername(event.target.value);
  };

  const handleSearchEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(event.target.value);
  };

  const handleViewDetails = async (username: string) => {
    try {
      const response = await fetch(`/api/downline/${username}`);
      const data = await response.json();
      setDialogContent(data);
      setDialogOpen(true);
    } catch (error) {
      alert('Error fetching details');
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        const response = await fetch('/api/deleteManager/route', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: deleteId })
        });

        if (response.ok) {
          fetchAdmins(page, rowsPerPage, searchUsername, searchEmail);
          setDeleteDialogOpen(false);
        } else {
          alert('Error deleting admin');
        }
      } catch (error) {
        alert('Error deleting admin');
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogContent(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const openDeleteDialog = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (admin: Admin) => {
    setEditAdmin(admin);
    setEditDialogOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditAdmin((prevAdmin) => prevAdmin ? { ...prevAdmin, [name]: value } : null);
  };

  const handleEditSave = async () => {
    if (editAdmin) {
      try {
        const response = await fetch('/api/updateManager/route', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editAdmin)
        });

        if (response.ok) {
          fetchAdmins(page, rowsPerPage, searchUsername, searchEmail);
          setEditDialogOpen(false);
        } else {
          alert('Error updating admin');
        }
      } catch (error) {
        alert('Error updating admin');
      }
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditAdmin(null);
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          所有管理员
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <Box display="flex" mb={2}>
          <TextField
            label="用户名"
            value={searchUsername}
            onChange={handleSearchUsernameChange}
            sx={{ marginRight: 2 }}
          />
          <TextField
            label="邮箱"
            value={searchEmail}
            onChange={handleSearchEmailChange}
          />
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
                  <TableCell>用户名</TableCell>
                  <TableCell>角色</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin, index) => (
                  <TableRow key={index}>
                    <TableCell>{admin.id}</TableCell>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Tooltip title="查看详情">
                        <IconButton style={{ fontSize: 12 }} onClick={() => handleViewDetails(admin.username)} color="primary">
                          详情
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="编辑">
                        <IconButton style={{ fontSize: 12 }} onClick={() => openEditDialog(admin)} color="primary">
                          编辑
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton style={{ fontSize: 12 }} onClick={() => openDeleteDialog(admin.id)} color="secondary">
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
              count={total} // 使用总记录数
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]} // 禁用每页显示数量的选择
            />
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>详情</DialogTitle>
        <DialogContent>
          {dialogContent && (
            <List>
              {dialogContent.map((item: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`级别: ${item.level}`}
                    secondary={`推荐人地址: ${item.referrer_wallet_address} - 被推荐人地址: ${item.referred_wallet_address}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Box style={{ width: "200px" }}>
            {
              !dialogContent || dialogContent.length === 0 && (
                "暂无数据"
              )
            }
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContent>
            你确定要删除这个管理员吗？
          </DialogContent>
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

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>编辑管理员</DialogTitle>
        <DialogContent>
          {editAdmin && (
            <>
              <TextField
                margin="dense"
                label="角色"
                name="role"
                fullWidth
                value={editAdmin.role}
                onChange={handleEditChange}
              />
              <TextField
                margin="dense"
                label="邮箱"
                name="email"
                fullWidth
                value={editAdmin.email || ''}
                onChange={handleEditChange}
              />
            </>
          )}
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
    </Container>
  );
};

export default AdminListPage;
