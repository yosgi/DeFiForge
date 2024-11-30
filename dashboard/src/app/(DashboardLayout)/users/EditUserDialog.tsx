import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { User } from "./types"; // Import User type

interface EditUserDialogProps {
  open: boolean;
  editUser: Partial<User>;
  handleEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEditDialogClose: () => void;
  handleEditSave: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  editUser,
  handleEditInputChange,
  handleEditDialogClose,
  handleEditSave,
}) => {
  return (
    <Dialog open={open} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑用户</DialogTitle>
      <DialogContent>
        <TextField margin="dense" label="备注" name="notes" fullWidth value={editUser.notes || ""} onChange={handleEditInputChange} />
        <TextField margin="dense" label="用户等级" name="level" type="number" fullWidth value={editUser.level || ""} onChange={handleEditInputChange} />
        <TextField margin="dense" label="团队ID" name="teamId" type="number" fullWidth value={editUser.teamId || ""} onChange={handleEditInputChange} />
        <TextField margin="dense" label="储蓄" name="saving" type="number" fullWidth value={editUser.saving || ""} onChange={handleEditInputChange} />
        <TextField margin="dense" label="储蓄收益" name="saving_earning" type="number" fullWidth value={editUser.saving_earning || ""} onChange={handleEditInputChange} />
        <TextField margin="dense" label="新币" name="BitPowerMEC" type="number" fullWidth value={editUser.BitPowerMEC || ""} onChange={handleEditInputChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditDialogClose} color="primary">取消</Button>
        <Button onClick={handleEditSave} color="primary">保存</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
