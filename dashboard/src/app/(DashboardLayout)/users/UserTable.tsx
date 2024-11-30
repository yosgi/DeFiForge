import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { User } from "./types"; // Add types if necessary
const shortenAddress = (address: string) => `${address.slice(0, 2)}...${address.slice(-4)}`;

interface UserTableProps {
  data: User[];
  handleViewDetails: (user: User) => void;
  handleToggleManager: (user: User) => void;
  handleToggleWithdrawalProhibited: (user: User) => void;
  handleTogglePenalty: (user: User) => void;
  handleEditDialogOpen: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  data,
  handleViewDetails,
  handleEditDialogOpen,
  handleToggleManager,
  handleToggleWithdrawalProhibited,
  handleTogglePenalty,
}) => {
  return (
    <TableContainer component={Paper} sx={{ height: "100%" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {/* Define table columns */}
            <TableCell>ID</TableCell>
            <TableCell>账号</TableCell>
            <TableCell>余额</TableCell>
            <TableCell>总流通</TableCell>
            <TableCell>用户等级</TableCell>
            <TableCell>团队Id</TableCell>
            <TableCell>储蓄</TableCell>
            <TableCell>储蓄收益</TableCell>
            <TableCell>新币</TableCell>
            <TableCell>晋级惩罚</TableCell>
            <TableCell>管理员</TableCell>
            <TableCell>禁止提款</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((user, index) => (
            <TableRow key={index}>
              <TableCell>{user.id}</TableCell>
              <TableCell>
                {shortenAddress(user.account)}
                <Tooltip title="查看完整地址">
                  <IconButton onClick={() => handleViewDetails(user)} size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>{user.balance?.toFixed(1)}</TableCell>
              <TableCell>{user?.total_investment?.toFixed(1)}</TableCell>
              <TableCell>{user?.level}</TableCell>
              <TableCell>{user?.teamId}</TableCell>
              <TableCell>{user.saving?.toFixed(1)}</TableCell>
              <TableCell>{user.saving_earning?.toFixed(1)}</TableCell>
              <TableCell>{user.BitPowerMEC?.toFixed(1)}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleTogglePenalty(user)}>
                  {user.penalty ? <ToggleOnIcon /> : <ToggleOffIcon />}
                </IconButton>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleToggleManager(user)}>
                  {user.isManager ? <ToggleOnIcon /> : <ToggleOffIcon />}
                </IconButton>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleToggleWithdrawalProhibited(user)}>
                  {user.isWithdrawalProhibited ? <ToggleOnIcon /> : <ToggleOffIcon />}
                </IconButton>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleViewDetails(user)} size="small" style={{ fontSize: "12px" }}>
                  详情
                </IconButton>
                <IconButton size="small" onClick={() => {handleEditDialogOpen(user)}} style={{ fontSize: "12px" }} >
                  编辑
                </IconButton>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
