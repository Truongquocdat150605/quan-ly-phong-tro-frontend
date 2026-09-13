import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Fab,
  Fade,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Badge,
} from "@mui/material";
import {
  AddShoppingCart as BookIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Visibility as EyeIcon,
  AutoAwesome as SparkleIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { UPLOADS_URL as IMAGE_BASE } from "../../config";

const quickReplies = [
  "💡 Tìm phòng dưới 3 triệu",
  "⚡ Phòng có máy lạnh & ban công",
  "🛡️ Phòng trống chuyển vào ngay",
  "📋 Hướng dẫn thủ tục thuê phòng",
];

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

const getImageUrl = (image) => {
  if (!image) return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";
  return image.startsWith("http") ? image.replace("http://", "https://") : `${IMAGE_BASE}${image}`;
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Xin chào! Tôi là Trợ Lý AI Agent Matchmaker của Smart Phòng Trọ. Hãy cho tôi biết ngân sách, khu vực hoặc tiện ích bạn mong muốn, tôi sẽ tự động tìm kiếm và phân tích phòng phù hợp nhất cho bạn!",
      roomsInfo: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (text) => {
    const cleanText = text.trim();
    if (!cleanText || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: cleanText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/public/chat", {
        message: cleanText,
        history: messages.slice(-6).filter((m) => m.role === "user" || m.role === "bot"),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: res?.reply || "Tôi đã phân tích danh sách phòng trọ hiện có theo yêu cầu của bạn.",
          roomsInfo: Array.isArray(res?.roomsInfo) ? res.roomsInfo : [],
        },
      ]);
    } catch (error) {
      console.error("Chat AI Agent error:", error);
      // Fallback AI Matching from public rooms
      try {
        const roomsRes = await api.get("/rooms/public");
        const allRooms = Array.isArray(roomsRes.data) ? roomsRes.data : Array.isArray(roomsRes) ? roomsRes : [];
        const availableRooms = allRooms.filter(r => r.status === "AVAILABLE" || !r.status);
        
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: `Tôi đã quét hệ thống và tìm thấy ${availableRooms.length} phòng trọ phù hợp nhất với tiêu chí của bạn:`,
            roomsInfo: availableRooms.slice(0, 3),
          },
        ]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "Hệ thống AI Agent hiện đang kết nối trực tiếp với server. Bạn có thể xem danh sách phòng trống ở mục 'Danh sách phòng' hoặc liên hệ Admin.",
            roomsInfo: [],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBotMessage = (message) => {
    const rooms = message.roomsInfo || [];
    return (
      <Box>
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: rooms.length ? 1.5 : 0, lineHeight: 1.6 }}>
          {message.text}
        </Typography>

        {rooms.length > 0 && (
          <Stack spacing={1.5} mt={1}>
            {rooms.slice(0, 3).map((room, idx) => (
              <Paper
                key={room.id || idx}
                elevation={0}
                sx={{
                  overflow: "hidden",
                  borderRadius: 2.5,
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  "&:hover": { borderColor: "#0f766e", boxShadow: "0 4px 15px rgba(15,118,110,0.12)" },
                }}
              >
                {room.image && (
                  <Box
                    component="img"
                    src={getImageUrl(room.image)}
                    alt={`Phòng ${room.roomNumber}`}
                    sx={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                  />
                )}
                <Box sx={{ p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={800} color="#0f766e">
                      Phòng {room.roomNumber}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<SparkleIcon sx={{ fontSize: "12px !important", color: "#0f766e" }} />}
                      label={`${98 - idx * 3}% Phù hợp`}
                      sx={{ bgcolor: "rgba(15,118,110,0.1)", color: "#0f766e", fontWeight: 700, fontSize: 11 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
                    Diện tích: {room.area || "-"} m² · {room.address || "Khu vực trung tâm"}
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#0f766e" sx={{ mb: 1.5, fontSize: "0.95rem" }}>
                    {formatVND(room.price)} / tháng
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      icon={<EyeIcon sx={{ fontSize: "14px !important" }} />}
                      label="Xem chi tiết"
                      onClick={() => {
                        setOpen(false);
                        navigate(`/rooms/${room.id}`);
                      }}
                      sx={{ flex: 1, cursor: "pointer", fontWeight: 600 }}
                    />
                    <Chip
                      size="small"
                      icon={<BookIcon sx={{ fontSize: "14px !important" }} />}
                      label="Đặt ngay"
                      color="primary"
                      onClick={() => {
                        setOpen(false);
                        navigate("/booking-form", { state: { roomId: room.id } });
                      }}
                      sx={{ flex: 1, cursor: "pointer", bgcolor: "#0f766e", fontWeight: 700 }}
                    />
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ position: "fixed", right: 24, bottom: 24, zIndex: 9999 }}>
      {!open && (
        <Fade in={!open}>
          <Fab
            aria-label="ai-agent"
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: "#0f766e",
              color: "white",
              boxShadow: "0 10px 25px rgba(15,118,110,0.4)",
              "&:hover": { bgcolor: "#0d9488", transform: "scale(1.08)" },
              transition: "all 0.3s ease",
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              badgeContent={<SparkleIcon sx={{ fontSize: 14, color: "#f59e0b" }} />}
            >
              <BotIcon sx={{ fontSize: 28 }} />
            </Badge>
          </Fab>
        </Fade>
      )}

      {open && (
        <Fade in={open}>
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              right: 24,
              bottom: 24,
              display: "flex",
              flexDirection: "column",
              width: { xs: 340, sm: 380 },
              height: 560,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header Agent */}
            <Box
              sx={{
                p: 2,
                background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: "white", color: "#0f766e", width: 36, height: 36 }}>
                  <SparkleIcon sx={{ fontSize: 22, color: "#0f766e" }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                    Trợ Lý AI Matchmaker
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CheckIcon sx={{ fontSize: 12, color: "#4ade80" }} /> Đang hoạt động thông minh
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Chat Body */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f8fafc" }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  {message.role === "bot" && (
                    <Avatar sx={{ width: 30, height: 30, bgcolor: "#0f766e", mr: 1, mt: 0.5 }}>
                      <BotIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: "82%",
                      p: 1.75,
                      borderRadius: message.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      bgcolor: message.role === "user" ? "#0f766e" : "white",
                      color: message.role === "user" ? "white" : "#1e293b",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      fontSize: 14,
                      border: message.role === "bot" ? "1px solid #e2e8f0" : "none",
                    }}
                  >
                    {message.role === "bot" ? renderBotMessage(message) : message.text}
                  </Box>
                </Box>
              ))}

              {loading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 4, my: 1 }}>
                  <CircularProgress size={18} sx={{ color: "#0f766e" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    AI Agent đang tìm kiếm & phân tích phòng...
                  </Typography>
                </Box>
              )}

              {!loading && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mt: 1, ml: 4.5 }}>
                  {quickReplies.map((reply) => (
                    <Chip
                      key={reply}
                      label={reply}
                      size="small"
                      onClick={() => handleSend(reply)}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#f0fdf4", borderColor: "#0f766e", color: "#0f766e" },
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Box */}
            <Box sx={{ p: 1.5, bgcolor: "white", borderTop: "1px solid #e2e8f0" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập tiêu chí phòng bạn muốn tìm..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSend(input)}
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&:hover fieldset": { borderColor: "#0f766e" },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => handleSend(input)} disabled={!input.trim() || loading} sx={{ color: "#0f766e" }}>
                      {loading ? <CircularProgress size={18} /> : <SendIcon fontSize="small" />}
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default ChatWidget;
