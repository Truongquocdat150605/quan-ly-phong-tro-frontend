import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Badge,
  Tabs,
  Tab,
  Stack,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Group,
  Person,
  Schedule,
  CheckCircle,
  Delete,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../../../services/api";

const NotificationHistory = ({ notifications, users, stats, onDeleteSuccess }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa thông báo?")) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success("Đã xóa");
      if (onDeleteSuccess) onDeleteSuccess();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const filtered = notifications.filter((n) => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return n.broadcast;
    if (tabValue === 2) return !n.broadcast;
    return false;
  });

  const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  return (
    <Paper sx={{ p: 4, borderRadius: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={800}>
          Lịch sử thông báo
        </Typography>
        <Badge badgeContent={stats.total} color="primary" />
      </Box>
      <Tabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        sx={{ mb: 2 }}
      >
        <Tab label="Tất cả" />
        <Tab label="Gửi tất cả" />
        <Tab label="Gửi riêng" />
      </Tabs>
      {filtered.length === 0 ? (
        <Alert severity="info">Chưa có thông báo nào</Alert>
      ) : (
        <Stack spacing={2} sx={{ maxHeight: 500, overflow: "auto" }}>
          {filtered.map((n) => (
            <Paper
              key={n.id}
              sx={{
                p: 3,
                borderLeft: `4px solid ${n.broadcast ? "#0f766e" : "#f59e0b"}`,
                transition: "0.2s",
                "&:hover": { boxShadow: 2 },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {n.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-wrap", my: 1 }}
                  >
                    {n.content}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      size="small"
                      icon={n.broadcast ? <Group /> : <Person />}
                      label={
                        n.broadcast
                          ? "Tất cả"
                          : `Riêng: ${users.find((u) => u.id === n.targetUserId)?.fullName || n.targetUserId}`
                      }
                    />
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Schedule fontSize="small" />
                      {formatDate(n.createdAt)}
                    </Box>
                    <Chip
                      size="small"
                      icon={<CheckCircle />}
                      label="Đã gửi"
                      sx={{ bgcolor: "#e8f5e9", color: "#4caf50" }}
                    />
                  </Stack>
                </Box>
                <Tooltip title="Xóa">
                  <IconButton color="error" onClick={() => handleDelete(n.id)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default NotificationHistory;
