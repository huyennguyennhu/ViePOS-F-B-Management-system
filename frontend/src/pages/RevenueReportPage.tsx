import React, { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import iconSale from '../../assets/icon/sale_darkgreen.png';
import iconOrder from '../../assets/icon/order_red.png';
import iconAverage from '../../assets/icon/average_darkgreen.png';
import iconProduct from '../../assets/icon/total_product_darkgreen.png';
import './RevenueReportPage.css';

const revenueData = [
  { time: '07', tooltipLabel: '07:00', revenue: 200000, orders: 10 },
  { time: '08', tooltipLabel: '08:00', revenue: 400000, orders: 15 },
  { time: '09', tooltipLabel: '09:00', revenue: 800000, orders: 37 },
  { time: '10', tooltipLabel: '10:00', revenue: 700000, orders: 20 },
  { time: '11', tooltipLabel: '11:00', revenue: 550000, orders: 18 },
  { time: '12', tooltipLabel: '12:00', revenue: 650000, orders: 22 },
  { time: '13', tooltipLabel: '13:00', revenue: 200000, orders: 10 },
  { time: '14', tooltipLabel: '14:00', revenue: 400000, orders: 15 },
  { time: '15', tooltipLabel: '15:00', revenue: 450000, orders: 16 },
  { time: '16', tooltipLabel: '16:00', revenue: 300000, orders: 12 },
  { time: '17', tooltipLabel: '17:00', revenue: 956000, orders: 20 },
  { time: '18', tooltipLabel: '18:00', revenue: 250000, orders: 11 },
  { time: '19', tooltipLabel: '19:00', revenue: 600000, orders: 19 },
  { time: '20', tooltipLabel: '20:00', revenue: 400000, orders: 15 },
  { time: '21', tooltipLabel: '21:00', revenue: 700000, orders: 21 },
  { time: '22', tooltipLabel: '22:00', revenue: 250000, orders: 11 },
  { time: '23', tooltipLabel: '23:00', revenue: 100000, orders: 5 },
  { time: '24', tooltipLabel: '24:00', revenue: 80000, orders: 4 },
];

const mockDataWeekly = [
  { time: 'Thứ 2', tooltipLabel: 'Thứ 2', revenue: 1200000, orders: 45 },
  { time: 'Thứ 3', tooltipLabel: 'Thứ 3', revenue: 1500000, orders: 55 },
  { time: 'Thứ 4', tooltipLabel: 'Thứ 4', revenue: 1100000, orders: 40 },
  { time: 'Thứ 5', tooltipLabel: 'Thứ 5', revenue: 1800000, orders: 60 },
  { time: 'Thứ 6', tooltipLabel: 'Thứ 6', revenue: 2200000, orders: 75 },
  { time: 'Thứ 7', tooltipLabel: 'Thứ 7', revenue: 3500000, orders: 110 },
  { time: 'CN', tooltipLabel: 'Chủ Nhật', revenue: 4100000, orders: 130 },
];



const mockDataYearly = [
  { time: 'T1', tooltipLabel: 'Tháng 1', revenue: 45000000, orders: 1200 },
  { time: 'T2', tooltipLabel: 'Tháng 2', revenue: 42000000, orders: 1150 },
  { time: 'T3', tooltipLabel: 'Tháng 3', revenue: 55000000, orders: 1400 },
  { time: 'T4', tooltipLabel: 'Tháng 4', revenue: 60000000, orders: 1500 },
  { time: 'T5', tooltipLabel: 'Tháng 5', revenue: 58000000, orders: 1450 },
  { time: 'T6', tooltipLabel: 'Tháng 6', revenue: 65000000, orders: 1600 },
  { time: 'T7', tooltipLabel: 'Tháng 7', revenue: 70000000, orders: 1750 },
  { time: 'T8', tooltipLabel: 'Tháng 8', revenue: 72000000, orders: 1800 },
  { time: 'T9', tooltipLabel: 'Tháng 9', revenue: 68000000, orders: 1700 },
  { time: 'T10', tooltipLabel: 'Tháng 10', revenue: 65000000, orders: 1600 },
  { time: 'T11', tooltipLabel: 'Tháng 11', revenue: 75000000, orders: 1850 },
  { time: 'T12', tooltipLabel: 'Tháng 12', revenue: 85000000, orders: 2100 },
];

const typeData = [
  { name: 'Cả ngày', value: 45, revenue: '1.910.000đ', orders: 48, color: '#2b7a0b' },
  { name: '4H', value: 35, revenue: '1.485.000đ', orders: 37, color: '#3fa316' },
  { name: 'Mang đi', value: 20, revenue: '850.000đ', orders: 21, color: '#68c83e' },
];

const paymentData = [
  { name: 'Tiền mặt', value: 35, revenue: '1.200.000đ', orders: 30, color: '#68c83e' },
  { name: 'Chuyển khoản', value: 65, revenue: '3.050.000đ', orders: 55, color: '#2b7a0b' },
];

const topProducts = [
  { sku: 'SKU - HDNDKS', name: 'Trà Trái Cây Nhiệt Đới', category: 'Trà', revenue: '1.050.000đ', qty: '30 ly' },
  { sku: 'SKU - HDNDKS', name: 'Cà Phê Sữa', category: 'Cà Phê', revenue: '855.000đ', qty: '24 ly' },
  { sku: 'SKU - HDNDKS', name: 'Cà Phê Đen', category: 'Cà Phê', revenue: '805.000đ', qty: '22 ly' },
];

const orderList = [
  { id: 'ORD-023', time: '15:32 - 19/05', staff: 'Nguyễn Văn A', type: 'Mang đi', typeColor: '#fef0e6', typeTextColor: '#d97706', total: '75.000đ', status: 'Hoàn thành', statusColor: '#e8f5e9', statusTextColor: '#256e05', paymentMethod: 'Tiền mặt' },
  { id: 'ORD-022', time: '15:20 - 19/05', staff: 'Nguyễn Văn A', type: '4H', typeColor: '#e6f0ff', typeTextColor: '#0056b3', total: '35.000đ', status: 'Hoàn thành', statusColor: '#e8f5e9', statusTextColor: '#256e05', paymentMethod: 'Chuyển khoản' },
  { id: 'ORD-021', time: '14:55 - 19/05', staff: 'Nguyễn Văn A', type: 'Cả ngày', typeColor: '#f3e8ff', typeTextColor: '#7e22ce', total: '90.000đ', status: 'Hoàn thành', statusColor: '#e8f5e9', statusTextColor: '#256e05', paymentMethod: 'MoMo' },
  { id: 'ORD-020', time: '14:12 - 19/05', staff: 'Nguyễn Văn A', type: 'Cả ngày', typeColor: '#f3e8ff', typeTextColor: '#7e22ce', total: '45.000đ', status: 'Đã hủy', statusColor: '#fce4e4', statusTextColor: '#dc3545', paymentMethod: 'Thẻ VISA' },
  { id: 'ORD-019', time: '13:30 - 19/05', staff: 'Nguyễn Văn A', type: '4H', typeColor: '#e6f0ff', typeTextColor: '#0056b3', total: '175.000đ', status: 'Hoàn thành', statusColor: '#e8f5e9', statusTextColor: '#256e05', paymentMethod: 'Tiền mặt' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const displayTitle = data.tooltipLabel || label;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-title">{displayTitle}</p>
        <p className="tooltip-value">{new Intl.NumberFormat('vi-VN').format(payload[0].value)}đ</p>
        <p className="tooltip-label">{data.orders} đơn hàng</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="pie-tooltip">
        <p className="pie-tooltip-title">{data.name}</p>
        <p className="pie-tooltip-value">{data.revenue}</p>
        <p className="pie-tooltip-label">{data.orders} đơn hàng</p>
      </div>
    );
  }
  return null;
};

const renderPieLabel = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, fill, payload, percent } = props;
  
  // Percentage inside pie
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Outer label coordinates
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Percentage inside pie */}
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>

      {/* Connecting line */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} strokeWidth={1.5} fill="none" />
      
      {/* Outer label text */}
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey - 4} textAnchor={textAnchor} fill={fill} fontSize={14} fontWeight="bold">
        {payload.name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey + 14} textAnchor={textAnchor} fill="#888" fontSize={12} fontWeight="500">
        {`${payload.orders} đơn | ${payload.revenue}`}
      </text>
    </g>
  );
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RevenueReportPage() {
  const today = new Date();
  const todayStr = formatDate(today);

  const [filterType, setFilterType] = useState('Ngày');
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [selectedStaff, setSelectedStaff] = useState('Tất cả nhân viên');

  const handleFilterClick = (type: string) => {
    setFilterType(type);
    const d = new Date();
    if (type === 'Ngày') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (type === 'Tuần') {
      const dayOfWeek = d.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMonday);
      setFromDate(formatDate(monday));
      setToDate(todayStr);
    } else if (type === 'Tháng') {
      setFromDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
      setToDate(todayStr);
    } else if (type === 'Năm') {
      setFromDate(`${d.getFullYear()}-01-01`);
      setToDate(todayStr);
    }
  };

  const handleClear = () => {
    setFilterType('Ngày');
    setFromDate(todayStr);
    setToDate(todayStr);
    setSelectedStaff('Tất cả nhân viên');
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setFromDate('');
      setFilterType('Tùy chỉnh');
      return;
    }
    let newFrom = val;
    if (val > toDate && toDate !== '') {
      newFrom = toDate;
    }
    setFromDate(newFrom);
    
    if (newFrom === toDate && newFrom !== '') {
      setFilterType('Ngày');
    } else {
      setFilterType('Tùy chỉnh');
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setToDate('');
      setFilterType('Tùy chỉnh');
      return;
    }
    
    let newTo = val;
    if (val > todayStr) {
      newTo = todayStr;
    }
    setToDate(newTo);
    
    let currentFrom = fromDate;
    if (newTo < fromDate && fromDate !== '') {
      setFromDate(newTo);
      currentFrom = newTo;
    }
    
    if (currentFrom === newTo && newTo !== '') {
      setFilterType('Ngày');
    } else {
      setFilterType('Tùy chỉnh');
    }
  };

  let currentChartData = revenueData;
  if (filterType === 'Tuần') {
    currentChartData = mockDataWeekly;
  } else if (filterType === 'Năm') {
    currentChartData = mockDataYearly;
  } else if (filterType === 'Tháng' || filterType === 'Tùy chỉnh') {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const isSameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
      
      if (diffDays > 0 && diffDays <= 62) {
        currentChartData = Array.from({ length: diffDays }, (_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          return {
            time: isSameMonth ? `${d.getDate()}` : `${d.getDate()}/${d.getMonth() + 1}`,
            tooltipLabel: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
            revenue: 500000 + ((d.getDate() * 73) % 1500000),
            orders: 20 + ((d.getDate() * 11) % 30),
          };
        });
      } else if (diffDays > 62) {
        currentChartData = mockDataYearly;
      }
    }
  }

  return (
    <div className="revenue-report-container">
      <div className="sticky-header">
        <h1 className="revenue-report-title">BÁO CÁO DOANH THU</h1>

        {/* Filter Bar */}
        <div className="revenue-filter-card">
          <div className="filter-buttons">
            {['Ngày', 'Tuần', 'Tháng', 'Năm'].map((type) => (
              <button 
                key={type} 
                className={`filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => handleFilterClick(type)}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="date-input-wrapper">
            <span className="date-label">Từ:</span>
            <div className="date-input-inner">
              <input type="date" value={fromDate} max={toDate} onChange={handleFromDateChange} className="date-input" />
            </div>
          </div>
          <div className="date-input-wrapper">
            <span className="date-label">Đến:</span>
            <div className="date-input-inner">
              <input type="date" value={toDate} max={todayStr} onChange={handleToDateChange} className="date-input" />
            </div>
          </div>

          <div className="filter-select-wrapper">
            <select 
              className="filter-select"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              <option value="Tất cả nhân viên">Tất cả nhân viên</option>
              <option value="Nguyễn Văn A">Nguyễn Văn A</option>
              <option value="Trần Thị B">Trần Thị B</option>
            </select>
          </div>

          <button className="btn-clear" onClick={handleClear}>Xóa</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="revenue-metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-bg green-bg">
              <img src={iconSale} alt="Tổng Doanh Thu" className="metric-icon-img" />
            </div>
            <span className="metric-title">Tổng Doanh Thu</span>
          </div>
          <div className="metric-value">4.250.000đ</div>
          <div className="metric-badge-container">
            <div className="metric-badge positive">+2,34%</div>
            <span className="metric-comparison">So với kỳ trước</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-bg red-bg">
              <img src={iconOrder} alt="Tổng Đơn" className="metric-icon-img" />
            </div>
            <span className="metric-title">Tổng Đơn</span>
          </div>
          <div className="metric-value red-text">85 đơn</div>
          <div className="metric-badge-container">
            <div className="metric-badge negative">-4,7%</div>
            <span className="metric-comparison">So với kỳ trước</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-bg green-bg">
              <img src={iconAverage} alt="Trung Bình Giá Trị Đơn" className="metric-icon-img" />
            </div>
            <span className="metric-title">Trung Bình Giá Trị Đơn</span>
          </div>
          <div className="metric-value green-text">50.000đ</div>
          <div className="metric-badge-container">
            <div className="metric-badge positive">+2%</div>
            <span className="metric-comparison">So với kỳ trước</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-bg green-bg">
              <img src={iconProduct} alt="Tổng Sản Phẩm" className="metric-icon-img" />
            </div>
            <span className="metric-title">Tổng Sản Phẩm</span>
          </div>
          <div className="metric-value green-text">145</div>
          <div className="metric-badge-container">
            <div className="metric-badge positive">+5%</div>
            <span className="metric-comparison">So với kỳ trước</span>
          </div>
        </div>
      </div>

      {/* Overview Chart */}
      <div className="dashboard-section chart-section">
        <h2 className="section-title">Tổng Quan Doanh Thu</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="99%" height={250}>
            <BarChart data={currentChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#aaa', fontSize: 11 }}
                tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`}
              />
              <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#338805" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 1: 2 Pie Charts */}
      <div className="dashboard-row pie-row">
        <div className="dashboard-section pie-section">
          <h2 className="section-title">Cơ Cấu Theo Loại</h2>
          <div className="pie-wrapper">
            <ResponsiveContainer width="99%" height={250}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section pie-section">
          <h2 className="section-title">Cơ Cấu Theo Phương Thức Thanh Toán</h2>
          <div className="pie-wrapper">
            <ResponsiveContainer width="99%" height={250}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Top Products */}
      <div className="dashboard-section top-products-section">
        <div className="section-header-row">
          <h2 className="section-title">Doanh thu Sản phẩm</h2>
          <button className="btn-sort"><ArrowDownUp size={14} /> Giảm dần</button>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Sản Phẩm</th>
                <th>Danh Mục</th>
                <th>Doanh Thu</th>
                <th>Số Lượng Bán</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i}>
                  <td className="sku-text">{p.sku}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.revenue}</td>
                  <td>{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        <div className="dashboard-section order-list-section">
          <h2 className="section-title">Danh Sách Đơn Hàng</h2>
          <div className="table-responsive">
            <table className="dashboard-table full-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Thời Gian</th>
                  <th>Nhân Viên</th>
                  <th>Loại Hình</th>
                  <th>PTTT</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((o, i) => (
                  <tr key={i}>
                    <td className="sku-text font-medium">{o.id}</td>
                    <td>{o.time}</td>
                    <td>{o.staff}</td>
                    <td>
                      <span className="type-badge" style={{ backgroundColor: o.typeColor, color: o.typeTextColor }}>
                        {o.type}
                      </span>
                    </td>
                    <td>{o.paymentMethod}</td>
                    <td>{o.total}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: o.statusColor, color: o.statusTextColor }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
    </div>
  );
}
