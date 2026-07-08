/**
 * @file ContactsTab.jsx
 * @description Tab hiển thị danh sách tin nhắn liên hệ từ khách hàng.
 * @module pages/admin/requests
 */
import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Stack,
  CardContent,
} from "@mui/material";
import { Phone as PhoneIcon } from "@mui/icons-material";

/**
 * @param {object} props
 * @param {Array} props.contacts - Danh sách tin nhắn liên hệ
 * @param {Function} props.formatDate - Hàm định dạng ngày
 */
const ContactsTab = ({ contacts, formatDate }) => {
  if (contacts.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
        <Typography color="text.secondary">📭 Chưa có tin nhắn liên hệ nào từ khách hàng.</Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Khi khách gửi liên hệ qua trang /contact, tin nhắn sẽ xuất hiện ở đây.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {contacts.map((contact) => (
        <Grid item xs={12} md={6} key={contact.id}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: "#0f766e" }}>
                    {contact.fullName?.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700}>{contact.fullName}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon sx={{ fontSize: 12, color: "#94a3b8" }} />
                      <Typography variant="caption">{contact.phone}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Chip label="Mới" size="small" color="error" />
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {contact.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                🕐 {formatDate(contact.createdAt)}
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ContactsTab;
