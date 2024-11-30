"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Snackbar,
  TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";

interface Team {
  id: string;
  level: number;
  created_at: string;
  total_team_investment: number;
  leaderId: number;
}

interface TeamMember {
  id: number;
  account: string;
  total_investment: number;
}

interface TeamDetails {
  leader: TeamMember;
  members: TeamMember[];
}

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<TeamDetails | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Partial<Team>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/teams/getAllTeams');
      const data = await response.json();
      setTeams(data.teams);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teams data:", error);
      setSnackbar({ open: true, message: 'Failed to fetch teams', severity: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleReset = () => {
    fetchTeams();
  };

  const handleViewDetails = async (teamId: string,leaderId:number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teams/getTeamDetails?teamId=${teamId}&leaderId=${leaderId}`);
      const data = await response.json();
      setSelectedTeamDetails(data);
      setDialogOpen(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching team details:", error);
      setSnackbar({ open: true, message: 'Failed to fetch team details', severity: 'error' });
      setLoading(false);
    }
  };

  const handleEditDialogOpen = (team: Team) => {
    setSelectedTeam(team);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedTeam({});
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSelectedTeam((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch("/api/teams/updateTeam", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTeam),
      });

      if (response.ok) {
        fetchTeams();
        setEditDialogOpen(false);
        setSnackbar({ open: true, message: 'Team updated successfully', severity: 'success' });
      } else {
        console.error("Error updating team data");
        setSnackbar({ open: true, message: 'Failed to update team', severity: 'error' });
      }
    } catch (error) {
      console.error("Error updating team data:", error);
      setSnackbar({ open: true, message: 'Failed to update team', severity: 'error' });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTeamDetails(null);
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
          onClick={fetchTeams}
          sx={{ marginRight: 2 }}
        >
          更新数据
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
        >
          重置
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <TableContainer component={Paper} sx={{ height: "100%" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>等级</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>团队总投资金额</TableCell>
                  <TableCell>队长ID</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams?.map((team, index) => (
                  <TableRow key={index}>
                    <TableCell>{team.id}</TableCell>
                    <TableCell>{team.level}</TableCell>
                    <TableCell>{new Date(team.created_at).toLocaleString()}</TableCell>
                    <TableCell>{team.total_team_investment}</TableCell>
                    <TableCell>{team.leaderId}</TableCell>
                    <TableCell sx={{
                        fontSize: 14,
                    }}>
                      <IconButton style={{ fontSize: "12px" }} onClick={() => handleViewDetails(team.id,team.leaderId)} size="small">
                        详情
                      </IconButton>
                      <IconButton  style={{ fontSize: "12px" }} onClick={() => handleEditDialogOpen(team)} size="small">
                        编辑
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>团队详情</DialogTitle>
        <DialogContent>
          {selectedTeamDetails && (
            <Box>
              <Typography variant="h6" gutterBottom>
                队长信息
              </Typography>
              <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>账号</TableCell>
                      <TableCell>总流通金额</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{selectedTeamDetails.leader.account}</TableCell>
                      <TableCell>{selectedTeamDetails.leader.total_investment}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>
                团队成员信息
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>成员账号</TableCell>
                      <TableCell>总流通金额</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTeamDetails.members.map((member, index) => (
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
          <Button onClick={handleDialogClose} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>编辑团队</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="队长ID"
            name="leaderId"
            type="number"
            fullWidth
            value={selectedTeam.leaderId || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            label="等级"
            name="level"
            type="number"
            fullWidth
            value={selectedTeam.level || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            label="团队总投资金额"
            name="total_team_investment"
            type="number"
            fullWidth
            value={selectedTeam.total_team_investment || ""}
            onChange={handleEditInputChange}
          />
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

export default TeamsPage;
