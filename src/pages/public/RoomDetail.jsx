/**
 * @file RoomDetail.jsx
 * @description Trang chi tiết phòng trọ. Trang này gọi API lấy dữ liệu và hiển thị bằng các Component con từ thư mục src/components/roomDetail/.
 * @module pages/public
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Alert, Grid, Stack, Typography, Divider } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Wifi as WifiIcon, LocalParking as ParkingIcon, AcUnit as AcUnitIcon, WaterDrop as WaterIcon, ElectricBolt as ElectricIcon, Shield as ShieldIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";

import RoomDetailSkeleton from "../../components/roomDetail/RoomDetailSkeleton";
import RoomHeader from "../../components/roomDetail/RoomHeader";
import RoomGallery from "../../components/roomDetail/RoomGallery";
import RoomAmenities from "../../components/roomDetail/RoomAmenities";
import RoomDescription from "../../components/roomDetail/RoomDescription";
import RoomActionBox from "../../components/roomDetail/RoomActionBox";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85";
const EXTRA_IMGS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
];
const IMAGE_BASE = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8082") + "/uploads/";
const getRoomImageUrl = (image) => (!image ? PLACEHOLDER_IMG : `${IMAGE_BASE}${image}`);

const DEFAULT_AMENITIES = [
  { icon: <WifiIcon />, label: "Wifi tốc độ cao" },
  { icon: <ParkingIcon />, label: "Chỗ để xe" },
  { icon: <AcUnitIcon />, label: "Điều hòa 2 chiều" },
  { icon: <WaterIcon />, label: "Nước nóng" },
  { icon: <ElectricIcon />, label: "Điện riêng" },
  { icon: <ShieldIcon />, label: "An ninh 24/7" },
];

const statusConfig = {
  AVAILABLE: { label: "✅ Còn phòng", color: "#10b981", bg: "#d1fae5" },
  RENTED: { label: "🔴 Đã cho thuê", color: "#64748b", bg: "#f1f5f9" },
  MAINTENANCE: { label: "🔧 Đang bảo trì", color: "#f59e0b", bg: "#fef3c7" },
};

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/rooms/${id}`)
      .then((res) => setRoom(res.data || res))
      .catch(() => setErrorMsg("Không thể tải thông tin phòng. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRentClick = () => navigate("/booking-form", { state: { roomId: room.id } });

  if (loading) return <RoomDetailSkeleton />;

  if (errorMsg || !room) {
    return (
      <Box sx={{ py: 8, px: 2, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMsg || "Không tìm thấy phòng."}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/rooms")} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const mainImageUrl = imageError ? PLACEHOLDER_IMG : getRoomImageUrl(room.image);
  const allImages = [mainImageUrl, ...EXTRA_IMGS];
  const status = statusConfig[room.status] || statusConfig.AVAILABLE;

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", pb: 12 }}>
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, pt: 4 }}>
        
        {/* BREADCRUMB */}
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/rooms")}
              sx={{ fontWeight: 700, color: "#475569", textTransform: "none", p: 0, "&:hover": { bgcolor: "transparent", color: "#0f766e" } }}
            >
              Danh sách phòng
            </Button>
            <Typography color="text.disabled">/</Typography>
            <Typography color="text.secondary" fontWeight={600}>Phòng {room.roomNumber}</Typography>
          </Stack>
        </motion.div>

        {/* HEADER */}
        <RoomHeader room={room} status={status} liked={liked} setLiked={setLiked} />

        {/* GALLERY */}
        <RoomGallery allImages={allImages} activeImg={activeImg} setActiveImg={setActiveImg} setImageError={setImageError} room={room} />

        {/* MAIN CONTENT */}
        <Grid container spacing={{ xs: 4, md: 7 }}>
          
          {/* Left: Info */}
          <Grid item xs={12} md={7} lg={8}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <RoomDescription room={room} />
              <RoomAmenities services={room.services} defaultAmenities={DEFAULT_AMENITIES} />
              
              {/* Pricing Details */}
              <Box>
                <Typography variant="h6" fontWeight={800} mb={3} color="#0f172a">
                  Chi phí hàng tháng
                </Typography>
                <Box sx={{ bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #f1f5f9", overflow: "hidden" }}>
                  {[
                    { label: "Tiền phòng", value: room.price ? new Intl.NumberFormat("vi-VN").format(room.price) + "đ" : "—" },
                    { label: "Tiền điện", value: "Tính theo chỉ số (thực tế)" },
                    { label: "Tiền nước", value: "Tính theo khối (thực tế)" },
                    { label: "Tiền cọc", value: "1 tháng tiền phòng" },
                  ].map((item, i, arr) => (
                    <Box key={i}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2 }}>
                        <Typography color="text.secondary" fontWeight={600}>{item.label}</Typography>
                        <Typography fontWeight={700} color="#0f172a">{item.value}</Typography>
                      </Stack>
                      {i < arr.length - 1 && <Divider sx={{ borderColor: "#f1f5f9" }} />}
                    </Box>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Right: Booking Card (Sticky) */}
          <Grid item xs={12} md={5} lg={4}>
            <RoomActionBox room={room} status={status} handleRentClick={handleRentClick} />
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default RoomDetail;