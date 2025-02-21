import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from "@mui/material";
import { User, Team } from "./types"; // Assuming you have defined types for User and Team

interface UserDetailDialogProps {
  open: boolean;
  selectedUser: User | null;
  teamDetails: Team | null;
  onClose: () => void;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ open, selectedUser, teamDetails, onClose }) => {
  if (!selectedUser) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>用户详情</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>账号:</strong> {selectedUser.account}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>余额:</strong> {selectedUser.balance}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>用户等级:</strong> {selectedUser.level}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>总流通:</strong> {selectedUser.total_investment}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>储蓄:</strong> {selectedUser.saving}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>储蓄收益:</strong> {selectedUser.saving_earning}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>新币 (BitPowerMEC):</strong> {selectedUser.BitPowerMEC}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>是否为管理员:</strong> {selectedUser.isManager ? "是" : "否"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>是否禁止提款:</strong> {selectedUser.isWithdrawalProhibited ? "是" : "否"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>晋级惩罚:</strong> {selectedUser.penalty ? "是" : "否"}</Typography>
          </Grid>
        </Grid>

        {teamDetails && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>团队信息</Typography>
            <Typography variant="body2"><strong>队长账号:</strong> {teamDetails.leader.account}</Typography>
            <Typography variant="body2"><strong>团队总投资金额:</strong> {teamDetails.total_investment}</Typography>
            <Typography variant="h6" mt={2}>团队成员</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>成员账号</TableCell>
                    <TableCell>投资总金额</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamDetails.members.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{member.account}</TableCell>
                      <TableCell>{member.total_investment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailDialog;
