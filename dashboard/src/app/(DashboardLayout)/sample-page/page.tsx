"use client";
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  Container,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  TablePagination,
  TextField,
  Button,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { jwtDecode } from "jwt-decode";

interface Downline {
  wallet_address: string;
  referred_wallet_address: string;
  referrer_wallet_address: string;
  level: number;
}

const AdminDetailPage: React.FC = () => {
  const [shareLink, setShareLink] = useState<string>('');
  const [downline, setDownline] = useState<Downline[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [telegram, setTelegram] = useState<string>(''); // Telegram handle state
  const [userId, setUserId] = useState<number | null>(null); // User ID state

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    const decoded: any = jwtDecode(token);
    const username = decoded.username;
    setUserId(decoded.userId); // Set user ID from token
    const link = `${process.env.NEXT_PUBLIC_FRONTEND_URL}?referrer=${username}`;
    setShareLink(link);
    // 从数据库获取多级被推荐人信息
    fetch(`/api/downline/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setDownline(data);
      });

    // Fetch user's Telegram handle from the API
    fetch(`/api/getAdmin/route?id=${decoded.userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user.telegram) {
          setTelegram(data.user.telegram);
        }
      });
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('链接已复制到剪贴板');
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTelegramChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTelegram(event.target.value);
  };

  const handleSaveTelegram = async () => {
    if (!userId) return;
    
    const response = await fetch('/api/updateTelegram/route', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId, telegram }),
    });

    if (response.ok) {
      alert('Telegram handle updated successfully!');
    } else {
      alert('Failed to update Telegram handle.');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <ListIcon color="primary" sx={{ marginRight: 1 }} />
          <Typography variant="h4" component="h1">
            推荐信息
          </Typography>
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        <Box display="flex" alignItems="center" mb={2}>
          <ShareIcon color="primary" sx={{ marginRight: 1 }} />
          <Typography variant="body1" gutterBottom>
            分享链接: <Link href={shareLink}>{shareLink}</Link>
          </Typography>
          <Tooltip title="复制链接">
            <IconButton onClick={handleCopyLink} color="primary" sx={{ marginLeft: 1 }}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        <Box mb={2}>
          <TextField
            label="Telegram"
            variant="outlined"
            fullWidth
            value={telegram}
            onChange={handleTelegramChange}
          />
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleSaveTelegram}>
            保存 Telegram
          </Button>
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        {downline.length === 0 ? (
          <Box display="flex" alignItems="center" mb={2}>
            <PersonIcon color="primary" sx={{ marginRight: 1 }} />
            <Typography variant="body1">暂无被推荐人</Typography>
          </Box>
        ) : (
          <>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon color="primary" sx={{ marginRight: 1 }} />
              <Typography variant="body1" gutterBottom>
                被推荐人列表:
              </Typography>
            </Box>
            <List>
              {downline.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((referral) => (
                <ListItem key={referral.wallet_address}>
                  <ListItemText
                    primary={`${referral.referred_wallet_address} - 推荐人: ${referral.referrer_wallet_address}`}
                    secondary={`级别: ${referral.level}`}
                  />
                </ListItem>
              ))}
            </List>
            <TablePagination
              component="div"
              count={downline.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDetailPage;
