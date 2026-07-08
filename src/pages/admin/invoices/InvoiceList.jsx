/**
 * @file InvoiceList.jsx
 * @description Trang danh sách hóa đơn (thống kê, hiển thị, bộ lọc).
 * @module pages/admin/invoices
 */
import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Grid, Tooltip, LinearProgress, Stack } from "@mui/material";
import { Receipt as ReceiptIcon, CheckCircle as CheckCircleIcon, PendingActions as PendingIcon, Warning as WarningIcon, PictureAsPdf as PdfIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { formatVND } from "../../../utils/formatVND";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RobotoBase64 } from "../../../utils/RobotoFont";

const getStatusChip = (status) => {
  switch (status) {
    case "PAID": return <Chip icon={<CheckCircleIcon />} label="Đã thanh toán" color="success" size="small" sx={{ fontWeight: 600 }} />;
    case "UNPAID": return <Chip icon={<PendingIcon />} label="Chưa thanh toán" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    case "OVERDUE": return <Chip icon={<WarningIcon />} label="Quá hạn" color="error" size="small" sx={{ fontWeight: 600 }} />;
    default: return <Chip label={status} size="small" />;
  }
};

const Card = ({ children, sx }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", ...sx }}>
    {children}
  </Paper>
);

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invoices");
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.content || []));
      setInvoices(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hóa đơn này?")) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success("Đã xóa hóa đơn");
        fetchInvoices();
      } catch (error) {
        toast.error("Lỗi khi xóa hóa đơn");
      }
    }
  };

  const generatePDF = (invoiceData) => {
    const doc = new jsPDF();
    
    // Thêm font tiếng Việt
    doc.addFileToVFS("Roboto-Regular.ttf", RobotoBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");
    
    doc.setFontSize(22);
    doc.setTextColor(6, 78, 59);
    doc.text("SMART PHÒNG TRỌ - HÓA ĐƠN", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 105, 30, { align: "center" });
    
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Phòng: ${invoiceData.contract?.room?.roomNumber || "N/A"}`, 20, 50);
    doc.text(`Khách thuê: ${invoiceData.contract?.tenant?.fullName || "N/A"}`, 20, 60);
    doc.text(`Kỳ thanh toán: ${invoiceData.billingDate ? new Date(invoiceData.billingDate).toLocaleDateString("vi-VN") : "Chưa xác định"}`, 20, 70);

    const columns = ["Nội dung", "Chỉ số", "Đơn giá", "Thành tiền"];
    const rows = [
      ["Tiền phòng", "-", "-", `${formatVND(invoiceData.rentalAmount)}`],
      ["Điện", `${invoiceData.electricityStart} → ${invoiceData.electricityEnd}`, `${formatVND(invoiceData.electricityPrice)}/kWh`, `${formatVND(invoiceData.electricityAmount)}`],
      ["Nước", `${invoiceData.waterStart} → ${invoiceData.waterEnd}`, `${formatVND(invoiceData.waterPrice)}/m³`, `${formatVND(invoiceData.waterAmount)}`],
      ["Dịch vụ khác", "-", "-", `${formatVND(invoiceData.serviceAmount)}`],
    ];

    autoTable(doc, {
      startY: 80,
      head: [columns],
      body: rows,
      theme: "striped",
      styles: { font: "Roboto" },
      headStyles: { fillColor: [6, 78, 59] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.text(`TỔNG CỘNG: ${formatVND(invoiceData.totalAmount)}`, 190, finalY, { align: "right" });
    
    doc.setFontSize(11);
    doc.setTextColor(invoiceData.status === "PAID" ? "#2e7d32" : "#d32f2f");
    doc.text(`Trạng thái: ${invoiceData.status === "PAID" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}`, 190, finalY + 10, { align: "right" });

    return doc.output("blob");
  };

  const handleExportPDF = (invoice) => {
    const blob = generatePDF(invoice);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HoaDon_Phong${invoice.contract?.room?.roomNumber}_${invoice.id}.pdf`;
    link.click();
    toast.success("Đã xuất file PDF!");
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    unpaid: invoices.filter((i) => i.status === "UNPAID").length,
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
    unpaidAmount: invoices.filter((i) => i.status !== "PAID").reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 4, background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ReceiptIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>Quản Lý Hóa Đơn</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Quản lý hóa đơn tiền phòng, điện, nước, dịch vụ</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, textAlign: "center", p: 2 }}>
              <Typography variant="h4" fontWeight={900} color="#0f766e">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Tổng hóa đơn</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, textAlign: "center", p: 2 }}>
              <Typography variant="h4" fontWeight={900} color="#10b981">{stats.paid}</Typography>
              <Typography variant="body2" color="text.secondary">Đã thanh toán</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, textAlign: "center", p: 2 }}>
              <Typography variant="h4" fontWeight={900} color="#f59e0b">{stats.unpaid}</Typography>
              <Typography variant="body2" color="text.secondary">Chưa thanh toán</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, textAlign: "center", p: 2 }}>
              <Typography variant="h4" fontWeight={900} color="#ef4444">{formatVND(stats.unpaidAmount)}</Typography>
              <Typography variant="body2" color="text.secondary">Công nợ</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Invoices Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#0f766e" }}>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Mã HD</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Phòng</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Khách thuê</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Ngày hóa đơn</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Điện</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Nước</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }} align="right">Tổng tiền</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Không có hóa đơn nào</Typography></TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>#{invoice.id}</TableCell>
                    <TableCell>Phòng {invoice.contract?.room?.roomNumber}</TableCell>
                    <TableCell>{invoice.contract?.tenant?.fullName}</TableCell>
                    <TableCell>{invoice.billingDate ? new Date(invoice.billingDate).toLocaleDateString("vi-VN") : "-"}</TableCell>
                    <TableCell>{invoice.electricityAmount?.toLocaleString()}₫</TableCell>
                    <TableCell>{invoice.waterAmount?.toLocaleString()}₫</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#0f766e" }}>
                      {formatVND(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Xuất PDF">
                          <IconButton size="small" color="secondary" onClick={() => handleExportPDF(invoice)}>
                            <PdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/admin/invoices/edit/${invoice.id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => handleDelete(invoice.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default InvoiceList;
