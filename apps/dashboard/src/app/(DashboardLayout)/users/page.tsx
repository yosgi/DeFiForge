"use client";

import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Snackbar, Pagination } from "@mui/material";
import UserFilter from "./UserFilter";
import UserTable from "./UserTable";
import EditUserDialog from "./EditUserDialog";
import UserDetailDialog from "./UserDetailDialog";
import { User, Team, SnackbarType } from "./types";
import { useSearchParams } from 'next/navigation';


const SearchUserPage: React.FC = () => {
  // State for search parameters
  const [account, setAccount] = useState("");
  const [balanceMin, setBalanceMin] = useState("");
  const [balanceMax, setBalanceMax] = useState("");
  const [level, setLevel] = useState("");
  const [totalInvestmentMin, setTotalInvestmentMin] = useState("");
  const [totalInvestmentMax, setTotalInvestmentMax] = useState("");
  const [savingMin, setSavingMin] = useState("");
  const [savingMax, setSavingMax] = useState("");
  const [savingEarningMin, setSavingEarningMin] = useState("");
  const [savingEarningMax, setSavingEarningMax] = useState("");
  const [bitPowerMin, setBitPowerMin] = useState("");
  const [bitPowerMax, setBitPowerMax] = useState("");

  // State for user data and dialogs
  const [data, setData] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<Partial<User>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [teamDetails, setTeamDetails] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<SnackbarType>({ open: false, message: '', severity: 'success' });
  const [userId, setUserId] = useState<string>("");
  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const searchParams = useSearchParams();

  // Fetching and setting users
  const fetchAdmins = async () => {
    setLoading(true);
    const response = await fetch(
      `/api/getAllUsers/route?page=${page}&pageSize=${pageSize}&account=${account}&balanceMin=${balanceMin}&balanceMax=${balanceMax}&level=${level}&totalInvestmentMin=${totalInvestmentMin}&totalInvestmentMax=${totalInvestmentMax}&savingMin=${savingMin}&savingMax=${savingMax}&savingEarningMin=${savingEarningMin}&savingEarningMax=${savingEarningMax}&bitPowerMin=${bitPowerMin}&bitPowerMax=${bitPowerMax}&userId=${userId}`
    );
    const data = await response.json();
    setData(data.users);
    setTotal(data.total);
    setLoading(false);
  };

  const fetchFromParams = async () => {
    const account = searchParams?.get("account") || "";
    const balanceMin = searchParams?.get("balanceMin") || "";
    const balanceMax = searchParams?.get("balanceMax") || "";
    const level = searchParams?.get("level") || "";
    const totalInvestmentMin = searchParams?.get("totalInvestmentMin") || "";
    const totalInvestmentMax = searchParams?.get("totalInvestmentMax") || "";
    const savingMin = searchParams?.get("savingMin") || "";
    const savingMax = searchParams?.get("savingMax") || "";
    const savingEarningMin = searchParams?.get("savingEarningMin") || "";
    const savingEarningMax = searchParams?.get("savingEarningMax") || "";
    const bitPowerMin = searchParams?.get("bitPowerMin") || "";
    const bitPowerMax = searchParams?.get("bitPowerMax") || "";
    const userId = searchParams?.get("userId") || "";
    setLoading(true);
    const response = await fetch(
      `/api/getAllUsers/route?page=${page}&pageSize=${pageSize}&account=${account}&balanceMin=${balanceMin}&balanceMax=${balanceMax}&level=${level}&totalInvestmentMin=${totalInvestmentMin}&totalInvestmentMax=${totalInvestmentMax}&savingMin=${savingMin}&savingMax=${savingMax}&savingEarningMin=${savingEarningMin}&savingEarningMax=${savingEarningMax}&bitPowerMin=${bitPowerMin}&bitPowerMax=${bitPowerMax}&userId=${userId}`
    );
    const data = await response.json();
    setData(data.users);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    fetchFromParams();
  }, [searchParams, page]);

  const handleSearch = () => {
    setPage(1);
    fetchAdmins();
  };

  const handleReset = () => {
    setAccount("");
    setBalanceMin("");
    setBalanceMax("");
    setLevel("");
    setTotalInvestmentMin("");
    setTotalInvestmentMax("");
    setSavingMin("");
    setSavingMax("");
    setSavingEarningMin("");
    setSavingEarningMax("");
    setBitPowerMin("");
    setBitPowerMax("");
    fetchAdmins();
    setUserId("");
  };

  const handleViewDetails = async (user: User) => {
    try {
      const userResponse = await fetch(`/api/getUserInfo/route?account=${user.account}`);
      const userResult = await userResponse.json();
      setSelectedUser(userResult.user);

      if (user.teamId) {
        const teamResponse = await fetch(`/api/getUserInfo/getTeamDetails?teamId=${user.teamId}`);
        const teamResult = await teamResponse.json();
        setTeamDetails(teamResult);
      }

      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDialogClose = () => setDialogOpen(false);

  const handleToggleManager = async (user: User) => {
    try {
      const response = await fetch(`/api/toggleManager/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isManager: !user.isManager }),
      });
      if (response.ok) {
        setSnackbar({ open: true, message: `User ${user.isManager ? "demoted" : "promoted"} to manager`, severity: "success" });
        setData((prevData) => prevData.map((u) => (u.id === user.id ? { ...u, isManager: !u.isManager } : u)));
      } else {
        setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Action failed", severity: "error" });
    }
  };

  const handleEditDialogOpen = (user: User) => {
    setEditUser(user);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => setEditDialogOpen(false);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch("/api/updateUser/route", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });
      if (response.ok) {
        fetchAdmins();
        setEditDialogOpen(false);
      } else {
        console.error("Error updating user data");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleToggleWithdrawalProhibited = async (user: User) => {
    try {
      const response = await fetch(`/api/toggleWithdrawalProhibited/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isWithdrawalProhibited: !user.isWithdrawalProhibited }),
      });
      if (response.ok) {
        setSnackbar({ open: true, message: `User withdrawal ${user.isWithdrawalProhibited ? "allowed" : "prohibited"}`, severity: "success" });
        setData((prevData) => prevData.map((u) => (u.id === user.id ? { ...u, isWithdrawalProhibited: !u.isWithdrawalProhibited } : u)));
      } else {
        setSnackbar({ open: true, message: "Failed to update withdrawal status", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Action failed", severity: "error" });
    }
  };

  const handleTogglePenalty = async (user: User) => {
    try {
      const response = await fetch(`/api/togglePenalty/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, penalty: !user.penalty }),
      });
      if (response.ok) {
        setSnackbar({ open: true, message: `User penalty ${user.penalty ? "removed" : "applied"}`, severity: "success" });
        setData((prevData) => prevData.map((u) => (u.id === user.id ? { ...u, penalty: !u.penalty } : u)));
      } else {
        setSnackbar({ open: true, message: "Failed to update penalty status", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Action failed", severity: "error" });
    }
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => setPage(newPage);

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#fff", display: "flex", flexDirection: "column", width: "100%" }}>
      <UserFilter
        account={account}
        setAccount={setAccount}
        balanceMin={balanceMin}
        setBalanceMin={setBalanceMin}
        balanceMax={balanceMax}
        setBalanceMax={setBalanceMax}
        level={level}
        setLevel={setLevel}
        totalInvestmentMin={totalInvestmentMin}
        setTotalInvestmentMin={setTotalInvestmentMin}
        totalInvestmentMax={totalInvestmentMax}
        setTotalInvestmentMax={setTotalInvestmentMax}
        savingMin={savingMin}
        setSavingMin={setSavingMin}
        savingMax={savingMax}
        setSavingMax={setSavingMax}
        savingEarningMin={savingEarningMin}
        setSavingEarningMin={setSavingEarningMin}
        savingEarningMax={savingEarningMax}
        setSavingEarningMax={setSavingEarningMax}
        bitPowerMin={bitPowerMin}
        setBitPowerMin={setBitPowerMin}
        bitPowerMax={bitPowerMax}
        setBitPowerMax={setBitPowerMax}
        handleSearch={handleSearch}
        handleReset={handleReset}
      />

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <UserTable
            data={data}
            handleViewDetails={handleViewDetails}
            handleToggleManager={handleToggleManager}
            handleToggleWithdrawalProhibited={(user) => {
              handleToggleWithdrawalProhibited(user);
            }}
            handleTogglePenalty={(user) => {
              handleTogglePenalty(user);
            }}

            handleEditDialogOpen={handleEditDialogOpen}
          />

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={handleChangePage} color="primary" />
          </Box>
        </>
      )}

      <EditUserDialog
        open={editDialogOpen}
        editUser={editUser}
        handleEditInputChange={handleEditInputChange}
        handleEditDialogClose={handleEditDialogClose}
        handleEditSave={handleEditSave}
      />
      <UserDetailDialog
        open={dialogOpen}
        selectedUser={selectedUser}
        teamDetails={teamDetails}
        onClose={handleDialogClose}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: "top", horizontal: "center" }} />
    </Box>
  );
};

export default SearchUserPage;
