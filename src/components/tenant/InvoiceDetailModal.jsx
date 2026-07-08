/**
 * @file InvoiceDetailModal.jsx
 * @description Modal hiển thị chi tiết hóa đơn (điện, nước, tiền phòng).
 * @module components/tenant
 */
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Box, Grid, Typography, Divider, Chip } from "@mui/material";
import { Close as CloseIcon, CheckCircle as CheckCircleIcon, WarningAmber as WarningIcon, Schedule as ScheduleIcon } from "@mui/icons-material";
import { formatVND } from "../../utils/formatVND";

const formatMonth = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${m}/${y}`;
};

const getStatusChip = (status) => {
  if (status === "PAID") return <Chip icon={<CheckCircleIcon />} label="Đã thanh toán" color="success" size="small" />;
  if (status === "UNPAID") return <Chip icon={<ScheduleIcon />} label="Chưa thanh toán" color="warning" size="small" />;
  if (status === "OVERDUE") return <Chip icon={<WarningIcon />} label="Quá hạn" color="error" size="small" />;
  return <Chip label={status || "-"} size="small" />;
};

const InvoiceDetailModal = ({ open, handleClose, selectedInvoice, handleOpenPay }) => (
  <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ bgcolor: "#0f766e", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      Chi tiết hóa đơn #{selectedInvoice?.id}
      <IconButton onClick={handleClose} sx={{ color: "white" }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      {selectedInvoice && (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Tháng</Typography>
              <Typography fontWeight={600}>{formatMonth(selectedInvoice.billingDate)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
              <Box>{getStatusChip(selectedInvoice.status)}</Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Điện (chỉ số cũ → mới)</Typography>
              <Typography fontWeight={600}>{selectedInvoice.electricityStart} → {selectedInvoice.electricityEnd}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Nước (chỉ số cũ → mới)</Typography>
              <Typography fontWeight={600}>{selectedInvoice.waterStart} → {selectedInvoice.waterEnd}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Tiền điện</Typography>
              <Typography fontWeight={600}>{formatVND(selectedInvoice.electricityAmount)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Tiền nước</Typography>
              <Typography fontWeight={600}>{formatVND(selectedInvoice.waterAmount)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Tiền phòng</Typography>
              <Typography fontWeight={600}>{formatVND(selectedInvoice.rentalAmount)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Phí dịch vụ</Typography>
              <Typography fontWeight={600}>{formatVND(selectedInvoice.serviceAmount)}</Typography>
            </Grid>
            <Divider sx={{ my: 2, width: "100%" }} />
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tổng cộng:</span>
                <span style={{ color: "#0f766e", fontWeight: 900 }}>{formatVND(selectedInvoice.totalAmount)}</span>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Đóng</Button>
      {selectedInvoice?.status !== "PAID" && (
        <Button variant="contained" onClick={() => { handleClose(); handleOpenPay(selectedInvoice); }}>
          Thanh toán ngay
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

export default InvoiceDetailModal;
