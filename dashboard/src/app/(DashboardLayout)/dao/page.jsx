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
  Snackbar,
  TextField,
  IconButton,
  Pagination,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

const PAGE_SIZE = 10; // Number of items per page

const KLineManagementPage = () => {
  const [klineData, setKlineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedKline, setSelectedKline] = useState({ symbol: "", date: "", close_price: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages based on data count

  // Fetch K-Line data from API
  const fetchKlineData = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/kline/getAll?page=${page}&pageSize=${PAGE_SIZE}`);
      const data = await response.json();
      setKlineData(data.records);
      setTotalPages(Math.ceil(data.total / PAGE_SIZE)); // Calculate total pages
      setLoading(false);
    } catch (error) {
      console.error("Error fetching K-Line data:", error);
      setSnackbar({ open: true, message: "Failed to fetch K-Line data", severity: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKlineData(page); // Load data for the current page
  }, [page]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Open the dialog for adding or editing K-Line data
  const handleAddDialogOpen = () => {
    setSelectedKline({ symbol: "", date: "", close_price: "" });
    setDialogOpen(true);
  };

  const handleEditDialogOpen = (kline) => {
    setSelectedKline(kline);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditDialogOpen(false);
  };

  // Handle input change for K-Line data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedKline((prev) => ({ ...prev, [name]: value }));
  };

  // Save new K-Line data
  const handleAddSave = async () => {
    try {
      const response = await fetch("/api/kline/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedKline),
      });

      if (response.ok) {
        fetchKlineData(page);
        setDialogOpen(false);
        setSnackbar({ open: true, message: "K-Line data added successfully", severity: "success" });
      } else {
        console.error("Error adding K-Line data");
        setSnackbar({ open: true, message: "Failed to add K-Line data", severity: "error" });
      }
    } catch (error) {
      console.error("Error adding K-Line data:", error);
      setSnackbar({ open: true, message: "Failed to add K-Line data", severity: "error" });
    }
  };

  // Save edited K-Line data
  const handleEditSave = async () => {
    try {
      const response = await fetch("/api/kline/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedKline),
      });

      if (response.ok) {
        fetchKlineData(page);
        setEditDialogOpen(false);
        setSnackbar({ open: true, message: "K-Line data updated successfully", severity: "success" });
      } else {
        console.error("Error updating K-Line data");
        setSnackbar({ open: true, message: "Failed to update K-Line data", severity: "error" });
      }
    } catch (error) {
      console.error("Error updating K-Line data:", error);
      setSnackbar({ open: true, message: "Failed to update K-Line data", severity: "error" });
    }
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#fff", display: "flex", flexDirection: "column", width: "100%" }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddDialogOpen}>
          Add K-Line Data
        </Button>
        <Button variant="outlined" color="primary" onClick={() => fetchKlineData(page)}>
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Close Price</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {klineData.map((kline) => (
                  <TableRow key={kline.id}>
                    <TableCell>{kline.id}</TableCell>
                    <TableCell>{kline.symbol}</TableCell>
                    <TableCell>{kline.date}</TableCell>
                    <TableCell>{kline.close_price}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditDialogOpen(kline)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}

      {/* Add/Edit K-Line Dialog */}
      <Dialog open={dialogOpen || editDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogOpen ? "Add K-Line Data" : "Edit K-Line Data"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Symbol"
            name="symbol"
            fullWidth
            value={selectedKline.symbol}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Date"
            name="date"
            type="date"
            fullWidth
            value={selectedKline.date}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Close Price"
            name="close_price"
            type="number"
            fullWidth
            value={selectedKline.close_price || ""}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Cancel</Button>
          <Button onClick={dialogOpen ? handleAddSave : handleEditSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default KLineManagementPage;
